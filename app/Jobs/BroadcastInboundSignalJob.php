<?php

namespace App\Jobs;

use App\Models\Hub;
use App\Models\Manifest;
use App\Models\Package;
use App\Services\SseSignalService;
use App\Enums\SseEventEnum;
use App\Enums\NotificationTypeEnum;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class BroadcastInboundSignalJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var \App\Models\Manifest
     */
    public $manifest;

    /**
     * @var \App\Models\Hub
     */
    public $destinationHub;

    /**
     * @var int
     */
    public $totalPackages;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Manifest $manifest, Hub $destinationHub, int $totalPackages)
    {
        $this->manifest = $manifest;
        $this->destinationHub = $destinationHub;
        $this->totalPackages = $totalPackages;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(SseSignalService $sseService)
    {
        // 1. 🔔 SSE: Kirim sinyal INBOUND_ARRIVAL_SIGNAL ke hub tujuan
        $sseService->broadcast(
            hubId: $this->destinationHub->id,
            event: SseEventEnum::INBOUND_ARRIVAL_SIGNAL,
            data: [
                'hub_id'           => $this->destinationHub->id,
                'manifest_code'    => $this->manifest->manifest_code,
                'new_trucks_count' => 1,
                'message'          => 'Truk Baru Tiba di Hub. Segera periksa daftar manifest.',
            ],
            title: 'Manifest Baru Masuk',
            message: "Manifest {$this->manifest->manifest_code} dengan {$this->totalPackages} paket sedang menuju hub Anda.",
            type: NotificationTypeEnum::INFO,
        );

        // 2. ⚠️ Cek Kapasitas Hub (Capacity Overload Warning)
        $currentLoad = Package::where('current_hub_id', $this->destinationHub->id)
            ->where('status', 'IN_HUB')
            ->count();
            
        $inTransitLoad = DB::table('manifest_packages')
            ->join('manifests', 'manifest_packages.manifest_code', '=', 'manifests.manifest_code')
            ->where('manifests.destination_hub_id', $this->destinationHub->id)
            ->where('manifests.type', 'INBOUND_FEEDER')
            ->whereIn('manifests.status', ['MENUNGGU_KEDATANGAN', 'MENUNGGU_KONFIRMASI'])
            ->count();
            
        $maxCapacity = $this->destinationHub->max_capacity;

        if (($currentLoad + $inTransitLoad) > $maxCapacity) {
            // ⚠️ ALGORITMA ANTI-SPAM (COOLDOWN 30 MENIT)
            $cacheKey = "cooldown_capacity_alarm_{$this->destinationHub->id}";
            $canTriggerAlarm = \Illuminate\Support\Facades\Cache::add($cacheKey, true, now()->addMinutes(30));

            if ($canTriggerAlarm) {
                $sseService->broadcast(
                    hubId: $this->destinationHub->id,
                    event: SseEventEnum::CAPACITY_LOAD_ALERT,
                    data: [
                        'play_sound' => 'siren_alert.mp3',
                        'current_load' => $currentLoad,
                        'in_transit_load' => $inTransitLoad,
                        'max_capacity' => $maxCapacity,
                    ],
                    title: 'CRITICAL WARNING!',
                    message: "Kapasitas Hub {$this->destinationHub->name} akan MELEBIHI BATAS ({$maxCapacity}) ketika manifest {$this->manifest->manifest_code} tiba!",
                    type: NotificationTypeEnum::CRITICAL,
                );
            }
        } else {
            // Jika kapasitas kembali NORMAL (di bawah max_capacity), HAPUS tiket cooldown
            // Supaya kalau nanti jebol lagi, alarmnya bisa bunyi lagi.
            \Illuminate\Support\Facades\Cache::forget("cooldown_capacity_alarm_{$this->destinationHub->id}");
        }
    }
}
