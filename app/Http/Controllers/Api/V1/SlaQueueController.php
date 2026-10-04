<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\JsonResponse;

class SlaQueueController extends Controller
{
    /**
     * GET /api/v1/sla-queue/packages
     *
     * Mengambil semua paket IN_HUB milik Hub Admin yang sedang login.
     * Diurutkan: is_priority DESC, sla_deadline ASC.
     * Frontend akan mem-hold data ini di Zustand untuk filter & sort instan.
     */
    public function index(): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            return response()->json(['success' => false, 'message' => 'Admin tidak memiliki akses ke Hub manapun.'], 403);
        }

        $packages = Package::where('current_hub_id', $user->hub_id)
            ->where('status', 'IN_HUB')
            ->orderByDesc('is_priority')
            ->orderBy('sla_deadline')
            ->get([
                'tracking_id',
                'service_type',
                'hub_arrival_timestamp',
                'sla_deadline',
                'destination_area',
                'is_priority',
            ]);

        // Map ke format ISO 8601 untuk semua timestamp
        $items = $packages->map(fn ($pkg) => [
            'tracking_id'            => $pkg->tracking_id,
            'service_type'           => $pkg->service_type,
            'hub_arrival_timestamp'  => $pkg->hub_arrival_timestamp?->toIso8601String(),
            'sla_deadline'           => $pkg->sla_deadline?->toIso8601String(),
            'destination_area'       => $pkg->destination_area,
            'is_priority'            => (bool) $pkg->is_priority,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    /**
     * PATCH /api/v1/packages/{tracking_id}/priority
     *
     * Toggle flag is_priority pada sebuah paket.
     * Setelah response sukses, Frontend memindahkan paket ke posisi paling atas.
     */
    public function togglePriority(string $tracking_id): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            return response()->json(['success' => false, 'message' => 'Admin tidak memiliki akses ke Hub manapun.'], 403);
        }

        $package = Package::where('tracking_id', $tracking_id)
            ->where('current_hub_id', $user->hub_id)
            ->where('status', 'IN_HUB')
            ->first();

        if (!$package) {
            return response()->json(['success' => false, 'message' => 'Paket tidak ditemukan atau tidak berstatus IN_HUB.'], 404);
        }

        $package->is_priority = !$package->is_priority;
        $package->save();

        // 🔔 SSE: Beritahu seluruh admin di hub ini bahwa ada perubahan prioritas paket
        app(\App\Services\SseSignalService::class)->broadcast(
            hubId: $user->hub_id,
            event: \App\Enums\SseEventEnum::PACKAGE_PRIORITY_UPDATED,
            data: [
                'tracking_id' => $package->tracking_id,
                'is_priority' => (bool) $package->is_priority,
                'message'     => "Paket {$package->tracking_id} ditandai sebagai " . ($package->is_priority ? "High Priority" : "Normal Priority")
            ],
            title: 'Prioritas Paket Berubah',
            message: "Paket {$package->tracking_id} ditandai sebagai " . ($package->is_priority ? "High Priority" : "Normal Priority") . ".",
            type: \App\Enums\NotificationTypeEnum::INFO,
        );

        return response()->json([
            'success' => true,
            'message' => 'Status prioritas paket berhasil diperbarui.',
            'data'    => [
                'tracking_id' => $package->tracking_id,
                'is_priority' => (bool) $package->is_priority,
            ],
        ]);
    }
}
