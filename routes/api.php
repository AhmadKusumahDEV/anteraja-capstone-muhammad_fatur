<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GenerateManifestController;
use App\Http\Controllers\Api\V1\HubController;
use App\Http\Controllers\Api\V1\ManifestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Semua route API untuk aplikasi Anteraja Hub Admin Panel.
| Prefix /api sudah otomatis ditambahkan oleh Laravel.
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->group(function () {

    // [Endpoint 1] GET /api/v1/hubs
    // Mengisi dropdown hub di halaman Manifest Generator
    Route::get('/hubs', [HubController::class, 'index']);

    // [Endpoint 2] GET /api/v1/manifests
    // Mengisi tabel riwayat log manifest (paginated, tanpa packages)
    Route::get('/manifests', [ManifestController::class, 'index']);

    // [Endpoint 3] POST /api/v1/manifests/generate
    // Generate manifest baru beserta packages (HARUS sebelum /{manifestCode} agar tidak tertangkap sebagai parameter)
    Route::post('/manifests/generate', GenerateManifestController::class);

    // [Endpoint 4] GET /api/v1/manifests/{manifestCode}
    // Mengambil detail manifest + semua packages (lazy/on-demand saat user klik baris)
    Route::get('/manifests/{manifestCode}', [ManifestController::class, 'show']);
});
