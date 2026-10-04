<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use App\Models\Manifest;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutboundController extends Controller
{
    /**
     * GET /api/v1/outbound/manifests
     *
     * Mengambil daftar manifest OUTBOUND_DISPATCH 
     * (SIAP_BERANGKAT, DALAM_PENGANTARAN, dan SELESAI) untuk Hub admin saat ini.
     */
    public function index(): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            return response()->json(['success' => false, 'message' => 'Admin tidak memiliki akses ke Hub manapun.'], 403);
        }

        $manifests = Manifest::withCount('packages')
            ->where('origin_hub_id', $user->hub_id)
            ->where('type', 'OUTBOUND_DISPATCH')
            ->whereIn('status', ['SIAP_BERANGKAT', 'DALAM_PENGANTARAN', 'SELESAI'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Ambil nama kurir dari tabel courier_dispatches secara manual
        $manifestCodes = $manifests->pluck('manifest_code')->toArray();
        $dispatches = DB::table('courier_dispatches')
            ->join('couriers', 'courier_dispatches.courier_id', '=', 'couriers.id')
            ->whereIn('manifest_code', $manifestCodes)
            ->get(['manifest_code', 'couriers.id as courier_id', 'couriers.name as courier_name'])
            ->keyBy('manifest_code');

        $data = $manifests->map(function ($manifest) use ($dispatches) {
            $dispatch = $dispatches->get($manifest->manifest_code);
            return [
                'manifest_code'  => $manifest->manifest_code,
                'status'         => $manifest->status instanceof \BackedEnum ? $manifest->status->value : $manifest->status,
                'total_packages' => $manifest->packages_count,
                'courier_id'     => $dispatch ? $dispatch->courier_id : null,
                'courier_name'   => $dispatch ? $dispatch->courier_name : null,
                'created_at'     => $manifest->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }
    /**
     * GET /api/v1/hubs/couriers/standby
     *
     * Daftar kurir yang STANDBY di Hub Admin yang sedang login.
     * Dipanggil saat modal "Dispatch Kurir" dibuka.
     */
    public function standByCouriers(): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            return response()->json(['success' => false, 'message' => 'Admin tidak memiliki akses ke Hub manapun.'], 403);
        }

        $couriers = Courier::where('current_hub_id', $user->hub_id)
            ->where('status', 'STANDBY')
            ->get(['id', 'name', 'fleet_type', 'status']);

        return response()->json([
            'success' => true,
            'data'    => $couriers,
        ]);
    }

    /**
     * POST /api/v1/outbound/dispatch
     *
     * Membuat manifest OUTBOUND_DISPATCH dan menugaskan kurir.
     * Semua paket berpindah status OUT_FOR_DELIVERY, kurir jadi ON_DUTY.
     */
    public function createDispatch(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            return response()->json(['success' => false, 'message' => 'Admin tidak memiliki akses ke Hub manapun.'], 403);
        }

        $request->validate([
            'courier_id'  => 'required|string|exists:couriers,id',
            'package_ids' => 'required|array|min:1',
            'package_ids.*' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            // 1. Validasi kurir harus STANDBY
            $courier = Courier::lockForUpdate()->find($request->courier_id);
            if ($courier->status !== 'STANDBY') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => "Kurir {$courier->id} tidak berstatus STANDBY.",
                    'errors'  => ['courier_id' => ["Kurir ini sedang {$courier->status}."]],
                ], 422);
            }

            // 2. Validasi semua paket harus IN_HUB dan milik hub ini
            $packages = Package::whereIn('tracking_id', $request->package_ids)
                ->where('status', 'IN_HUB')
                ->where('current_hub_id', $user->hub_id)
                ->lockForUpdate()
                ->get();

            if ($packages->count() !== count($request->package_ids)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Satu atau lebih paket tidak valid (tidak IN_HUB atau bukan milik hub ini).',
                ], 422);
            }

            // 3. Buat Manifest Outbound
            $manifestCode = 'MNF-OUT-' . date('Ymd') . '-' . rand(1000, 9999);
            $manifest = Manifest::create([
                'manifest_code'      => $manifestCode,
                'type'               => 'OUTBOUND_DISPATCH',
                'origin_hub_id'      => $user->hub_id,
                'destination_hub_id' => null, // Last-mile langsung ke pelanggan
                'vehicle_plate'      => $courier->fleet_type === 'VAN' ? 'B ' . rand(1000, 9999) . ' OUT' : null,
                'vehicle_type'       => $courier->fleet_type,
                'status'             => 'SIAP_BERANGKAT',
                'operator_id'        => $user->id,
                'eta_timestamp'      => now()->addHours(4),
            ]);

            // 4. Pivot: daftarkan paket ke dalam manifest
            $pivotData = $packages->map(fn ($pkg) => [
                'manifest_code' => $manifestCode,
                'tracking_id'   => $pkg->tracking_id,
                'created_at'    => now(),
                'updated_at'    => now(),
            ])->toArray();
            DB::table('manifest_packages')->insert($pivotData);

            // 5. Update status paket → OUT_FOR_DELIVERY
            DB::table('packages')
                ->whereIn('tracking_id', $request->package_ids)
                ->update(['status' => 'OUT_FOR_DELIVERY', 'updated_at' => now()]);

            // 6. Update kurir → ON_DUTY
            $courier->status = 'ON_DUTY';
            $courier->save();

            // 7. Catat relasi kurir ↔ manifest (dipakai complete() untuk membebaskan kurir)
            DB::table('courier_dispatches')->insert([
                'dispatch_id'                => 'DSP-' . date('Ymd') . '-' . strtoupper(substr(md5($manifestCode . $courier->id), 0, 8)),
                'courier_id'                 => $courier->id,
                'manifest_code'              => $manifestCode,
                'acceptance_timeout_minutes' => 15,
                'status'                     => 'ACCEPTED',
                'dispatched_at'              => now(),
                'created_at'                 => now(),
                'updated_at'                 => now(),
            ]);

            DB::commit();

            // Hitung kapasitas untuk SSE payload (berkurang karena paket jadi OUT_FOR_DELIVERY)
            $currentLoad = \App\Models\Package::where('current_hub_id', $user->hub_id)->where('status', 'IN_HUB')->count();
            $maxCapacity = 200; // Hardcoded default, jika tidak ada field di hubs table
            $percentage = min(100, round(($currentLoad / $maxCapacity) * 100, 2));
            $statusZone = $percentage >= 90 ? 'WARNING' : 'SAFE';

            app(\App\Services\SseSignalService::class)->broadcast(
                hubId: $user->hub_id,
                event: \App\Enums\SseEventEnum::CAPACITY_LOAD_ALERT,
                data: [
                    'hub_id'              => $user->hub_id,
                    'current_load'        => $currentLoad,
                    'max_capacity'        => $maxCapacity,
                    'capacity_percentage' => $percentage,
                    'status_zone'         => $statusZone,
                    'message'             => "Kapasitas Hub saat ini {$percentage}%.",
                ],
                title: 'Pembaruan Kapasitas Hub',
                message: "Terdapat pengurangan beban karena {$packages->count()} paket diberangkatkan. Beban saat ini: {$percentage}%",
                type: $percentage >= 90 ? \App\Enums\NotificationTypeEnum::WARNING : \App\Enums\NotificationTypeEnum::SUCCESS,
            );

            return response()->json([
                'success' => true,
                'message' => "Manifes outbound {$manifestCode} berhasil dibuat. {$packages->count()} paket siap diberangkatkan.",
                'data'    => [
                    'manifest_code'  => $manifestCode,
                    'courier_id'     => $courier->id,
                    'courier_name'   => $courier->name,
                    'total_packages' => $packages->count(),
                    'status'         => 'SIAP_BERANGKAT',
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat dispatch.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/v1/outbound/{manifest_code}/depart
     *
     * Menandai armada sudah berangkat dari Hub (SIAP_BERANGKAT → DALAM_PENGANTARAN).
     */
    public function depart(string $manifest_code): JsonResponse
    {
        $user = auth('api')->user();

        $manifest = Manifest::where('manifest_code', $manifest_code)
            ->where('origin_hub_id', $user->hub_id)
            ->where('type', 'OUTBOUND_DISPATCH')
            ->first();

        if (!$manifest) {
            return response()->json(['success' => false, 'message' => 'Manifest tidak ditemukan.'], 404);
        }

        $currentStatus = $manifest->status instanceof \BackedEnum ? $manifest->status->value : $manifest->status;
        if ($currentStatus !== 'SIAP_BERANGKAT') {
            return response()->json(['success' => false, 'message' => 'Manifest tidak dalam status SIAP_BERANGKAT.'], 400);
        }

        // Hitung jumlah paket yang diberangkatkan
        $packagesReleased = DB::table('manifest_packages')
            ->where('manifest_code', $manifest_code)
            ->count();

        $manifest->status = 'DALAM_PENGANTARAN';
        $manifest->save();

        return response()->json([
            'success' => true,
            'message' => "Manifes {$manifest_code} berhasil diberangkatkan.",
            'data'    => [
                'manifest_code'    => $manifest_code,
                'status'           => 'DALAM_PENGANTARAN',
                'packages_released' => $packagesReleased,
            ],
        ]);
    }

    /**
     * PATCH /api/v1/outbound/{manifest_code}/complete
     *
     * Menandai pengantaran selesai (DALAM_PENGANTARAN → SELESAI).
     * Semua paket → DELIVERED, kurir kembali → STANDBY.
     */
    public function complete(string $manifest_code): JsonResponse
    {
        $user = auth('api')->user();

        try {
            DB::beginTransaction();

            $manifest = Manifest::where('manifest_code', $manifest_code)
                ->where('origin_hub_id', $user->hub_id)
                ->where('type', 'OUTBOUND_DISPATCH')
                ->lockForUpdate()
                ->first();

            if (!$manifest) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Manifest tidak ditemukan.'], 404);
            }

            $currentStatus = $manifest->status instanceof \BackedEnum ? $manifest->status->value : $manifest->status;
            if ($currentStatus !== 'DALAM_PENGANTARAN') {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Manifest tidak dalam status DALAM_PENGANTARAN.'], 400);
            }

            // Ambil semua tracking_id dari manifest ini
            $trackingIds = DB::table('manifest_packages')
                ->where('manifest_code', $manifest_code)
                ->pluck('tracking_id');

            // Update paket → DELIVERED
            DB::table('packages')
                ->whereIn('tracking_id', $trackingIds)
                ->update(['status' => 'DELIVERED', 'updated_at' => now()]);

            // Kembalikan kurir → STANDBY (cari dari packages manifest ini)
            // Kurir terhubung via manifest operator_id, lookup kurir ON_DUTY di hub ini
            if ($manifest->operator_id) {
                // Cari kurir berdasarkan courier yang terkait manifest (via dispatch)
                // Untuk saat ini: kembalikan semua kurir ON_DUTY di hub ini yang fleet_type-nya cocok
                Courier::where('current_hub_id', $user->hub_id)
                    ->where('status', 'ON_DUTY')
                    ->where('id', function ($query) use ($manifest_code) {
                        // Ambil courier yang dispatch manifest ini melalui courier_dispatches
                        $query->select('courier_id')
                            ->from('courier_dispatches')
                            ->where('manifest_code', $manifest_code)
                            ->limit(1);
                    })
                    ->update(['status' => 'STANDBY', 'updated_at' => now()]);
            }

            // Update manifest → SELESAI
            $manifest->status = 'SELESAI';
            $manifest->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Pengantaran selesai. {$trackingIds->count()} paket ditandai sebagai Delivered.",
                'data'    => [
                    'manifest_code'      => $manifest_code,
                    'status'             => 'SELESAI',
                    'packages_delivered' => $trackingIds->count(),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat complete manifest.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
