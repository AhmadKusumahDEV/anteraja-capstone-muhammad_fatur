<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Http;

class VehicleSimulationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $manifestCode;

    /**
     * Create a new job instance.
     */
    public function __construct($manifestCode)
    {
        $this->manifestCode = $manifestCode;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // 1. Ambil data Manifest beserta Hub asal dan tujuan
        $manifest = DB::table('manifests')->where('manifest_code', $this->manifestCode)->first();
        if (!$manifest || !$manifest->destination_hub_id) {
            return; // Jika tidak ada tujuan (inbound feeder mungkin belum set tujuan), abaikan.
        }

        $origin = DB::table('hubs')->where('id', $manifest->origin_hub_id)->first();
        $dest = DB::table('hubs')->where('id', $manifest->destination_hub_id)->first();

        if (!$origin || !$dest || !$origin->latitude || !$dest->latitude) {
            return; // Data koordinat tidak lengkap
        }

        // 2. Fetch koordinat dari OSRM (Pindah ke sini agar tidak nge-block Controller!)
        $osrmUrl = "http://router.project-osrm.org/route/v1/driving/{$origin->longitude},{$origin->latitude};{$dest->longitude},{$dest->latitude}?overview=full&geometries=geojson";
        
        $response = Http::timeout(10)->get($osrmUrl);
        if (!$response->successful()) {
            return; 
        }

        $routeData = $response->json();
        $waypoints = $routeData['routes'][0]['geometry']['coordinates'] ?? [];

        if (empty($waypoints)) {
            return;
        }

        // 3. Hitung durasi ETA langsung dari data Manifest (karena Anda nge-set 1 menit saat generate!)
        $etaMinutes = max(1, \Carbon\Carbon::parse($manifest->created_at)->diffInMinutes($manifest->eta_timestamp));

        // Buat atau Update record di manifest_simulations
        DB::table('manifest_simulations')->updateOrInsert(
            ['manifest_code' => $this->manifestCode],
            [
                'eta_minutes' => $etaMinutes,
                'route_waypoints' => json_encode($waypoints),
                'status' => 'traveling',
                'started_at' => now(),
            ]
        );

        $totalPoints = count($waypoints);
        
        // 4. Hitung loncatan
        // Kita hitung butuh delay berapa lama di setiap titik (agar selesai tepat waktu sesuai ETA).
        $targetDurationSeconds = $etaMinutes * 60;
        $step = max(1, floor($totalPoints / $targetDurationSeconds));

        // 5. Looping untuk menembakkan koordinat!
        for ($i = 0; $i < $totalPoints; $i += $step) {
            $currentCoord = $waypoints[$i]; // [longitude, latitude] dari OSRM

            $liveData = [
                'type' => \App\Enums\SseEventEnum::VEHICLE_SIMULATION_TRACKING->value,
                'data' => [
                    'manifest_code' => $this->manifestCode,
                    'lng' => $currentCoord[0],
                    'lat' => $currentCoord[1],
                ]
            ];

            // Update current location di DB (untuk persistensi jika page di refresh)
            DB::table('manifest_simulations')
                ->where('manifest_code', $this->manifestCode)
                ->update(['current_location' => json_encode($currentCoord)]);

            // PUBLISH KE GLOBAL SSE CHANNEL (Destination Hub)
            $prefix = config('database.redis.options.prefix', '');
            $channel = $prefix . "hub.{$manifest->destination_hub_id}.signaling";
            Redis::publish($channel, json_encode($liveData));

            // Tidur 1 detik
            sleep(1);
        }

        // 6. Simulasi selesai
        DB::table('manifest_simulations')
            ->where('manifest_code', $this->manifestCode)
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
    }
}
