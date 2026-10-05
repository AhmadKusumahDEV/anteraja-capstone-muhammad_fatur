<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hub;
use Illuminate\Http\JsonResponse;

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
        $hubs = Hub::select('id', 'name', 'region_name', 'location_tag')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $hubs,
        ]);
    }
}
