<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateManifestRequest;
use App\Models\Hub;
use App\Models\Manifest;
use App\Models\ManifestPackage;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GenerateManifestController extends Controller
{
    /**
     * POST /api/v1/manifests/generate
     *
     * Generate manifest baru beserta semua paket di dalamnya secara atomik (DB transaction).
     * Menggunakan batch insert untuk performa optimal (1 query per tabel, bukan N query).
     *
     * @param GenerateManifestRequest $request
     * @return JsonResponse
     */
    public function __invoke(GenerateManifestRequest $request): JsonResponse
    {
        try {
            // Langkah 1 — Hitung variabel & Pre-fetch data sebelum transaction
            $manifest_code = $request->manifest_code
                ?? ('MNF-INB-' . date('Ymd') . '-' . rand(1000, 9999));

            $eta_timestamp = now()->addMinutes($request->eta_offset_minutes);

            $destination_hub = Hub::find($request->destination_hub_id);
            
            /** @var Hub|null $origin_hub */
            $origin_hub = Hub::where('id', '!=', $request->destination_hub_id)
                ->inRandomOrder()
                ->first();

            // Fallback jika hanya ada 1 hub di database
            $origin_hub_id   = $origin_hub ? $origin_hub->id       : 'HUB-DEFAULT-01';
            $origin_hub_name = $origin_hub ? $origin_hub->name     : 'Default Origin Hub';
            $origin_region   = $origin_hub ? $origin_hub->region_name : 'Unknown';

            $total_packages = $request->total_packages;
            $vehicle_type   = $total_packages <= 50 ? 'VAN' : 'TRUCK';

            // Langkah 2 — Build array packages di memory (O(n) cepat di PHP)
            $packagesData       = [];
            $manifestPivotData  = [];
            $serviceTypes       = ['SAME_DAY', 'NEXT_DAY', 'REGULAR'];
            $now                = now();

            for ($i = 0; $i < $total_packages; $i++) {
                // Pastikan tracking_id unik dengan kombinasi timestamp + random + index
                $tracking_id  = 'TRK-' . time() . rand(100, 999) . str_pad($i, 3, '0', STR_PAD_LEFT);
                // Pastikan tracking_id unik dengan kombinasi timestamp + random + index
                $tracking_id  = 'TRK-' . time() . rand(100, 999) . str_pad($i, 3, '0', STR_PAD_LEFT);
                $service_type = $serviceTypes[array_rand($serviceTypes)];
                $is_priority  = $service_type === 'SAME_DAY';
                $is_priority  = $service_type === 'SAME_DAY';

                $packagesData[] = [
                    'tracking_id'      => $tracking_id,
                    'current_hub_id'   => $origin_hub_id,
                    'destination_area' => $origin_region,
                    'service_type'     => $service_type,
                    'status'           => 'IN_TRANSIT',
                    'is_priority'      => $is_priority,
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ];

                $manifestPivotData[] = [
                    'manifest_code' => $manifest_code,
                    'tracking_id'   => $tracking_id,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ];
            }

            // Format packages untuk response (bisa dilakukan sebelum insert, mengurangi durasi lock)
            $formattedPackages = array_map(fn ($pkg) => [
                'tracking_id'      => $pkg['tracking_id'],
                'service_type'     => $pkg['service_type'],
                'status'           => $pkg['status'],
                'destination_area' => $pkg['destination_area'],
            ], $packagesData);

            // Langkah 3 — Transaction untuk insert (Lock lebih pendek & Chunked)
            DB::beginTransaction();

            $manifest = Manifest::create([
                'manifest_code'      => $manifest_code,
                'type'               => 'INBOUND_FEEDER',
                'origin_hub_id'      => $origin_hub_id,
                'destination_hub_id' => $request->destination_hub_id,
                'vehicle_plate'      => 'B ' . rand(1000, 9999) . ' XYZ',
                'vehicle_type'       => $vehicle_type,
                'status'             => 'MENUNGGU_KEDATANGAN',
                'eta_timestamp'      => $eta_timestamp,
            ]);

            // Chunked insert: memecah insert menjadi per 50 rows via raw query
            foreach (array_chunk($packagesData, 50) as $chunk) {
                DB::table('packages')->insert($chunk);
            }
            foreach (array_chunk($manifestPivotData, 50) as $chunk) {
                DB::table('manifest_packages')->insert($chunk);
            }

            DB::commit();

            // Format dan return response
            return response()->json([
                'success' => true,
                'message' => 'Manifest berhasil di-generate.',
                'data'    => [
                'data'    => [
                    'manifest_code'        => $manifest->manifest_code,
                    'type'                 => $manifest->getRawOriginal('type') ?? 'INBOUND_FEEDER',
                    'type'                 => $manifest->getRawOriginal('type') ?? 'INBOUND_FEEDER',
                    'origin_hub_code'      => $origin_hub_id,
                    'origin_hub_name'      => $origin_hub_name,
                    'destination_hub_code' => $manifest->destination_hub_id,
                    'destination_hub_name' => $destination_hub?->name,
                    'destination_hub_name' => $destination_hub?->name,
                    'vehicle_type'         => $manifest->vehicle_type,
                    'status'               => $manifest->getRawOriginal('status') ?? 'MENUNGGU_KEDATANGAN',
                    'status'               => $manifest->getRawOriginal('status') ?? 'MENUNGGU_KEDATANGAN',
                    'eta_timestamp'        => $manifest->eta_timestamp->format('Y-m-d H:i:s'),
                    'total_packages'       => $total_packages,
                    'packages'             => $formattedPackages,
                ],
                    'packages'             => $formattedPackages,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal meng-generate manifest.',
                'error'   => $e->getMessage(),
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
