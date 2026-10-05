<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShipmentRequest;
use App\Models\ShipmentRequest;
use Illuminate\Http\JsonResponse;

class ShipmentRequestController extends Controller
{
    /**
     * Tampilkan riwayat request
     */
    public function index(): JsonResponse
    {
        $requests = session('shipment_requests', []);
        
        $totalCost = collect($requests)->sum('cost');

        return response()->json([
            'success' => true,
            'data'    => [
                'items'      => $requests,
                'total_cost' => $totalCost
            ]
        ]);
    }

    /**
     * Simpan request baru ke session
     */
    public function store(StoreShipmentRequest $request): JsonResponse
    {
        $shipment = new ShipmentRequest(
            $request->validated('tracking_number'),
            $request->validated('weight_kg'),
            $request->validated('distance_km')
        );

        $cost = $shipment->calculateCost();

        $data = [
            'tracking_number' => $shipment->trackingNumber,
            'weight_kg'       => $shipment->weightKg,
            'distance_km'     => $shipment->distanceKm,
            'cost'            => $cost,
            'created_at'      => now()->toDateTimeString(),
        ];

        session()->push('shipment_requests', $data);

        return response()->json([
            'success' => true,
            'message' => 'Shipment request berhasil ditambahkan ke riwayat.',
            'data'    => $data
        ], 201);
    }

    /**
     * Hapus riwayat (Clear History)
     */
    public function destroy(): JsonResponse
    {
        session()->forget('shipment_requests');

        return response()->json([
            'success' => true,
            'message' => 'Riwayat request berhasil dihapus.'
        ]);
    }
}
