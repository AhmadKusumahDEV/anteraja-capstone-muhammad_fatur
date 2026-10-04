<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hub;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HubController extends Controller
{
    /**
     * GET /api/v1/hubs
     *
     * Mengambil semua hub untuk mengisi dropdown di Frontend.
     * Tidak butuh paginasi karena jumlah hub bersifat statis dan sedikit.
     */
    public function index(): JsonResponse
    {
        // Cache hasil query Master Data Hub di Redis selama 24 jam (86400 detik).
        // Ini mencegah database PostgreSQL dipanggil berulang kali untuk data yang jarang berubah.
        $hubs = Cache::remember('master_data_hubs', 86400, function () {
            return Hub::select('id', 'name', 'region_name', 'location_tag')
                ->orderBy('name')
                ->get()
                ->toArray();
        });

        return response()->json([
            'success' => true,
            'data'    => $hubs,
        ]);
    }

    /**
     * GET /api/v1/hubs/{hubId}/capacity
     *
     * Menampilkan kapasitas Hub: max_capacity, jumlah paket IN_HUB (current_load),
     * dan persentase penggunaan (usage_percent).
     * Digunakan untuk Capacity Gauge / Badge di Dashboard Admin.
     */
    public function capacity(string $hubId): JsonResponse
    {
        $hub = Hub::select('id', 'name', 'region_name', 'max_capacity')->find($hubId);

        if (!$hub) {
            return response()->json(['success' => false, 'message' => 'Hub tidak ditemukan.'], 404);
        }

        // Hitung paket yang sedang berada di dalam Hub (status = IN_HUB)
        $currentLoad = Package::where('current_hub_id', $hubId)
            ->where('status', 'IN_HUB')
            ->count();

        // Hitung paket yang sedang OTW (In Transit) menuju Hub ini
        $inTransitLoad = DB::table('manifest_packages')
            ->join('manifests', 'manifest_packages.manifest_code', '=', 'manifests.manifest_code')
            ->where('manifests.destination_hub_id', $hubId)
            ->where('manifests.type', 'INBOUND_FEEDER')
            ->whereIn('manifests.status', ['MENUNGGU_KEDATANGAN', 'MENUNGGU_KONFIRMASI'])
            ->count();

        $maxCapacity  = $hub->max_capacity;
        $usagePercent = $maxCapacity > 0 ? round(($currentLoad / $maxCapacity) * 100, 1) : 0;

        // Tentukan label status berdasarkan persentase penggunaan
        $capacityStatus = match(true) {
            $usagePercent >= 90 => 'CRITICAL',
            $usagePercent >= 75 => 'HIGH',
            $usagePercent >= 50 => 'MODERATE',
            default             => 'NORMAL',
        };

        return response()->json([
            'success' => true,
            'data'    => [
                'hub_id'          => $hub->id,
                'hub_name'        => $hub->name,
                'max_capacity'    => $maxCapacity,
                'current_load'    => $currentLoad,
                'in_transit_load' => $inTransitLoad,
                'usage_percent'   => $usagePercent,
                'capacity_status' => $capacityStatus,
            ],
        ]);
    }
}
