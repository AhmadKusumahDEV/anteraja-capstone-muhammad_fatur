<?php

namespace App\Http\Controllers;

use App\Models\Hub;
use App\Models\Manifest;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class GenerateManifestController extends Controller
{
    /**
     * Generate new Manifest with Packages
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function __invoke(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'manifest_code' => 'nullable|string|max:50',
            'destination_hub_id' => 'required|string|exists:hubs,id',
            'total_packages' => 'required|integer|min:1',
            'eta_offset_minutes' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $eta_timestamp = now()->addMinutes($request->eta_offset_minutes);
            
            // If manifest_code is not provided, generate a new one
            $manifest_code = $request->manifest_code ?? ("MNF-INB-" . date('Ymd') . "-" . rand(1000, 9999));
            
            // Find a random origin hub that is not the destination
            $origin_hub = Hub::where('id', '!=', $request->destination_hub_id)->inRandomOrder()->first();
            
            // Mock if there is no other hub
            $origin_hub_id = $origin_hub ? $origin_hub->id : 'HUB-JKU-01'; 
            $origin_hub_name = $origin_hub ? $origin_hub->name : 'Jakarta Utara Sortation';

            $total_packages = $request->total_packages;
            $vehicle_type = $total_packages <= 50 ? 'VAN' : 'TRUCK';
            
            // Insert manifest
            $manifest = Manifest::create([
                'manifest_code'      => $manifest_code,
                'type'               => 'INBOUND_FEEDER',
                'origin_hub_id'      => $origin_hub_id,
                'destination_hub_id' => $request->destination_hub_id,
                'vehicle_plate'      => 'B ' . rand(1000, 9999) . ' XYZ',
                'vehicle_type'       => $vehicle_type,
                'status'             => 'MENUNGGU_KEDATANGAN',
                'eta_timestamp'      => $eta_timestamp
            ]);

            // Insert packages & pivot data
            $packagesData = [];
            $manifestPackagesData = [];
            $serviceTypes = ['SAME_DAY', 'NEXT_DAY', 'REGULAR'];
            $now = now();
            
            for ($i = 0; $i < $total_packages; $i++) {
                // Ensure uniqueness in tracking ID
                $tracking_id = "TRK-" . time() . rand(100, 999) . sprintf('%03d', $i);
                
                $service_type = $serviceTypes[array_rand($serviceTypes)];
                $is_priority = $service_type === 'SAME_DAY';

                $packagesData[] = [
                    'tracking_id'      => $tracking_id,
                    'current_hub_id'   => $origin_hub_id,
                    'destination_area' => 'Jakarta Selatan', 
                    'service_type'     => $service_type,
                    'status'           => 'IN_TRANSIT',
                    'is_priority'      => $is_priority,
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ];

                $manifestPackagesData[] = [
                    'manifest_code' => $manifest_code,
                    'tracking_id'   => $tracking_id,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ];
            }

            // Batch insert for better performance
            Package::insert($packagesData);
            DB::table('manifest_packages')->insert($manifestPackagesData);

            DB::commit();

            // Format packages for the response
            $formattedPackages = array_map(function($pkg) {
                return [
                    'tracking_id'      => $pkg['tracking_id'],
                    'service_type'     => $pkg['service_type'],
                    'status'           => $pkg['status'],
                    'destination_area' => $pkg['destination_area']
                ];
            }, $packagesData);

            return response()->json([
                'success' => true,
                'message' => 'Manifest berhasil di-generate.',
                'data' => [
                    'manifest_code'        => $manifest->manifest_code,
                    'type'                 => $manifest->type,
                    'origin_hub_code'      => $origin_hub_id,
                    'origin_hub_name'      => $origin_hub_name,
                    'destination_hub_code' => $manifest->destination_hub_id,
                    'vehicle_type'         => $manifest->vehicle_type,
                    'status'               => $manifest->status,
                    'eta_timestamp'        => $manifest->eta_timestamp->format('Y-m-d H:i:s'),
                    'total_packages'       => $total_packages,
                    'packages'             => $formattedPackages
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal meng-generate manifest.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
