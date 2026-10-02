<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Manifest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManifestController extends Controller
{
    /**
     * GET /api/v1/manifests
     *
     * Mengambil daftar manifest dengan paginasi untuk tabel riwayat log.
     * TIDAK menginclude packages agar payload tetap ringan.
     *
     * Query params:
     *   - page        : int (default: 1)
     *   - per_page    : int (default: 10, max: 25)
     *   - type        : string (default: INBOUND_FEEDER)
     *   - hub_id      : string|null (opsional, filter destination hub)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) ($request->per_page ?? 10), 25);
        $type    = $request->type ?? 'INBOUND_FEEDER';

        $paginator = Manifest::with([
            'originHub:id,name',
            'destinationHub:id,name',
        ])
            ->withCount('packages')
            ->where('type', $type)
            ->when($request->hub_id, fn ($q) => $q->where('destination_hub_id', $request->hub_id))
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Transform ke format flat yang diharapkan Frontend
        $items = $paginator->getCollection()->map(function (Manifest $manifest) {
            return [
                'manifest_code'        => $manifest->manifest_code,
                'type'                 => $manifest->type instanceof \BackedEnum
                    ? $manifest->type->value
                    : $manifest->type,
                'origin_hub_code'      => $manifest->originHub?->id,
                'origin_hub_name'      => $manifest->originHub?->name,
                'destination_hub_code' => $manifest->destinationHub?->id,
                'destination_hub_name' => $manifest->destinationHub?->name,
                'vehicle_type'         => $manifest->vehicle_type,
                'status'               => $manifest->status instanceof \BackedEnum
                    ? $manifest->status->value
                    : $manifest->status,
                'total_packages'       => $manifest->packages_count ?? 0,
                'created_at'           => $manifest->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => [
                'items' => $items,
                'meta'  => [
                    'current_page' => $paginator->currentPage(),
                    'per_page'     => $paginator->perPage(),
                    'total'        => $paginator->total(),
                    'last_page'    => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * GET /api/v1/manifests/{manifestCode}
     *
     * Mengambil detail satu manifest beserta semua paket di dalamnya.
     * Di-load secara lazy (on-demand), hanya saat user klik baris tabel.
     */
    public function show(string $manifestCode): JsonResponse
    {
        $manifest = Manifest::with([
            'packages',
            'originHub:id,name,region_name',
            'destinationHub:id,name,region_name',
        ])->find($manifestCode);

        if (! $manifest) {
            return response()->json([
                'success' => false,
                'message' => 'Manifest tidak ditemukan.',
            ], 404);
        }

        $packages = $manifest->packages->map(fn ($pkg) => [
            'tracking_id'      => $pkg->tracking_id,
            'service_type'     => $pkg->service_type,
            'status'           => $pkg->status,
            'destination_area' => $pkg->destination_area,
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'manifest_code'        => $manifest->manifest_code,
                'type'                 => $manifest->type instanceof \BackedEnum
                    ? $manifest->type->value
                    : $manifest->type,
                'origin_hub_code'      => $manifest->originHub?->id,
                'origin_hub_name'      => $manifest->originHub?->name,
                'destination_hub_code' => $manifest->destinationHub?->id,
                'destination_hub_name' => $manifest->destinationHub?->name,
                'vehicle_type'         => $manifest->vehicle_type,
                'status'               => $manifest->status instanceof \BackedEnum
                    ? $manifest->status->value
                    : $manifest->status,
                'eta_timestamp'        => $manifest->eta_timestamp?->format('Y-m-d H:i:s'),
                'total_packages'       => $packages->count(),
                'packages'             => $packages,
            ],
        ]);
    }
}
