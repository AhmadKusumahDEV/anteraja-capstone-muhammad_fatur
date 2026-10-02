<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GenerateManifestController;
use App\Http\Controllers\Api\V1\HubController;
use App\Http\Controllers\Api\V1\ManifestController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\InboundController;

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
    
    // ── Public Routes ──────────────────────────────────────────
    Route::post('/auth/login', [AuthController::class, 'login']);

    // ── Protected Routes (Butuh JWT) ───────────────────────────
    Route::middleware('jwt.auth')->group(function () {
        
        // Auth / Session
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/refresh', [AuthController::class, 'refresh']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // [Endpoint 1] GET /api/v1/hubs
        Route::get('/hubs', [HubController::class, 'index']);

        // [Endpoint 2] GET /api/v1/manifests
        Route::get('/manifests', [ManifestController::class, 'index']);

        // [Endpoint 3] POST /api/v1/manifests/generate
        Route::post('/manifests/generate', GenerateManifestController::class);

        // [Endpoint 4] GET /api/v1/manifests/{manifestCode}
        Route::get('/manifests/{manifestCode}', [ManifestController::class, 'show']);

        // [Endpoint 5] Inbound Sorting (F-06)
        Route::get('/inbound/manifests', [InboundController::class, 'index']);
        Route::post('/inbound/manifests/{manifest_code}/acknowledge', [InboundController::class, 'acknowledge']);
    });
});
