<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ManifestStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Manifest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InboundController extends Controller
{
    /**
     * GET /api/v1/inbound/manifests
     *
     * List manifests destined for the auth user's hub (Inbound Sorting).
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            return response()->json(['success' => false, 'message' => 'Admin tidak memiliki akses ke Hub manapun.'], 403);
        }

        $query = Manifest::with('originHub:id,name')
            ->withCount('packages')
            ->where('type', 'INBOUND_FEEDER')
            ->where('destination_hub_id', $user->hub_id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Tampilkan dari yang paling baru
        $manifests = $query->orderBy('created_at', 'desc')->get();

        $items = $manifests->map(function (Manifest $manifest) {
            return [
                'manifest_code'   => $manifest->manifest_code,
                'type'            => $manifest->type instanceof \BackedEnum ? $manifest->type->value : $manifest->type,
                'origin_hub_name' => $manifest->originHub?->name,
                'vehicle_type'    => $manifest->vehicle_type,
                'status'          => $manifest->status instanceof \BackedEnum ? $manifest->status->value : $manifest->status,
                'total_packages'  => $manifest->packages_count ?? 0,
                'eta_timestamp'   => $manifest->eta_timestamp?->format('Y-m-d H:i:s'),
                'created_at'      => $manifest->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    /**
     * POST /api/v1/inbound/manifests/{manifest_code}/acknowledge
     * 
     * Konfirmasi penerimaan manifest (ACK).
     */
    public function acknowledge(string $manifest_code): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            return response()->json(['success' => false, 'message' => 'Admin tidak memiliki akses ke Hub manapun.'], 403);
        }

        try {
            DB::beginTransaction();

            // 1. Cek Manifest
            $manifest = Manifest::where('manifest_code', $manifest_code)
                ->where('destination_hub_id', $user->hub_id)
                ->lockForUpdate() // Lock row agar tidak ada bentrok konfirmasi bersamaan
                ->first();

            if (!$manifest) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Manifest tidak ditemukan atau bukan tujuan hub Anda.'], 404);
            }

            $currentStatus = $manifest->status instanceof \BackedEnum ? $manifest->status->value : $manifest->status;
            if (!in_array($currentStatus, ['MENUNGGU_KEDATANGAN', 'MENUNGGU_KONFIRMASI'])) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Manifest ini tidak bisa di-terima karena status saat ini: ' . $currentStatus], 400);
            }

            // 2. Update status Manifest
            $manifest->status = ManifestStatusEnum::SUDAH_DITERIMA;
            $manifest->save();

            // 3. Ambil semua paket dari tabel pivot
            $trackingIds = DB::table('manifest_packages')
                ->where('manifest_code', $manifest_code)
                ->pluck('tracking_id');

            if ($trackingIds->isNotEmpty()) {
                $now = Carbon::now();
                // SLA rules (dalam jam)
                $serviceSlas = [
                    'SAME_DAY' => 8,
                    'NEXT_DAY' => 24,
                    'REGULAR'  => 48,
                ];

                // 4. Update status dan SLA di tabel packages berdasarkan service type
                foreach ($serviceSlas as $serviceType => $hours) {
                    DB::table('packages')
                        ->whereIn('tracking_id', $trackingIds)
                        ->where('service_type', $serviceType)
                        ->update([
                            'status'                => 'IN_HUB',
                            'current_hub_id'        => $user->hub_id,
                            'hub_arrival_timestamp' => $now,
                            'sla_deadline'          => $now->copy()->addHours($hours),
                            'updated_at'            => $now,
                        ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Manifest berhasil diterima, seluruh paket masuk ke Hub Anda.',
                'data'    => [
                    'manifest_code' => $manifest->manifest_code,
                    'status'        => 'SUDAH_DITERIMA',
                    'updated_at'    => $manifest->updated_at->format('Y-m-d H:i:s'),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat acknowledge manifest.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
