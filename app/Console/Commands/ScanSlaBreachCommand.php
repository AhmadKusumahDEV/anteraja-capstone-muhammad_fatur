<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Package;
use App\Services\SseSignalService;
use App\Enums\SseEventEnum;
use App\Enums\NotificationTypeEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ScanSlaBreachCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sla:scan-breach';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan for packages that are nearing or have breached their SLA deadline.';

    /**
     * Execute the console command.
     */
    public function handle(SseSignalService $sseService)
    {
        $this->info('[' . now()->toDateTimeString() . '] Starting SLA Breach Scan...');
        
        // Target: Paket yang batas waktunya tinggal 30 menit lagi (atau sudah lewat).
        $warningThreshold = now()->addMinutes(30);

        // Kita gunakan query yang sangat optimal:
        // Hitung total paket yang bermasalah, dikelompokkan (GROUP BY) per hub.
        // Dengan cara ini, berapapun jumlah paketnya, query-nya sangat cepat dan ringan.
        $breachedPackages = Package::select('current_hub_id', DB::raw('count(*) as total_packages'))
            ->where('status', 'IN_HUB')
            ->where('sla_deadline', '<=', $warningThreshold)
            ->groupBy('current_hub_id')
            ->get();

        if ($breachedPackages->isEmpty()) {
            $this->info('No packages are breaching SLA.');
            return;
        }

        foreach ($breachedPackages as $breach) {
            $hubId = $breach->current_hub_id;
            $total = $breach->total_packages;

            $this->warn("Hub {$hubId} has {$total} packages near/past SLA.");

            // Anti-Spam: Beri jeda 5 menit antar notifikasi untuk hub yang sama.
            // Kalau tidak dibatasi, robot akan teriak tiap 1 menit dan membuat admin stress.
            $cacheKey = "cooldown_sla_breach_alarm_{$hubId}";
            $canTriggerAlarm = Cache::add($cacheKey, true, now()->addMinutes(5));

            if ($canTriggerAlarm) {
                $sseService->broadcast(
                    hubId: $hubId,
                    event: SseEventEnum::SLA_BREACH_WARNING,
                    data: [
                        'play_sound'     => 'sla_warning.mp3', // Bisa pakai file audio yang berbeda di Frontend
                        'total_packages' => $total,
                    ],
                    title: 'SLA BREACH WARNING!',
                    message: "URGENT: Terdapat {$total} paket di Hub Anda yang akan/sudah melewati batas waktu SLA! Segera periksa antrean SLA.",
                    type: NotificationTypeEnum::CRITICAL,
                );
            }
        }

        $this->info('SLA Breach Scan completed.');
    }
}
