<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GenerateManifestController;
use App\Http\Controllers\Api\V1\HubController;
use App\Http\Controllers\Api\V1\ManifestController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\InboundController;
use App\Http\Controllers\Api\V1\OutboundController;
use App\Http\Controllers\Api\V1\SlaQueueController;

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
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    // ── Protected Routes (Butuh JWT) ───────────────────────────
    Route::middleware('jwt.auth')->group(function () {
        
        // Auth / Session
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // [Endpoint 1] GET /api/v1/hubs
        Route::get('/hubs', [HubController::class, 'index']);

        // [Endpoint 1b] GET /api/v1/hubs/{hubId}/capacity
        Route::get('/hubs/{hubId}/capacity', [HubController::class, 'capacity']);

        // [Endpoint 2] GET /api/v1/manifests
        Route::get('/manifests', [ManifestController::class, 'index']);

        // [Endpoint 3] POST /api/v1/manifests/generate
        Route::post('/manifests/generate', GenerateManifestController::class);

        // [Endpoint 4] GET /api/v1/manifests/{manifestCode}
        Route::get('/manifests/{manifestCode}', [ManifestController::class, 'show']);

        // [Endpoint 5] Inbound Sorting (F-06)
        Route::get('/inbound/manifests', [InboundController::class, 'index']);
        Route::patch('/inbound/manifests/{manifest_code}/arrive', [InboundController::class, 'arrive']);
        Route::post('/inbound/manifests/{manifest_code}/acknowledge', [InboundController::class, 'acknowledge']);

        // [Endpoint 6] SLA Queue (F-07)
        Route::get('/sla-queue/packages', [SlaQueueController::class, 'index']);
        Route::patch('/packages/{tracking_id}/priority', [SlaQueueController::class, 'togglePriority']);

        // [Endpoint 7] Outbound Dispatch (F-08)
        Route::get('/outbound/manifests', [OutboundController::class, 'index']);
        Route::get('/hubs/couriers/standby', [OutboundController::class, 'standByCouriers']);
        Route::post('/outbound/dispatch', [OutboundController::class, 'createDispatch']);
        Route::patch('/outbound/{manifest_code}/depart', [OutboundController::class, 'depart']);
        Route::patch('/outbound/{manifest_code}/complete', [OutboundController::class, 'complete']);

        // [Endpoint 8] Hub Notifications & SSE (F-05)
        Route::get('/sse/stream', [\App\Http\Controllers\Api\V1\SseController::class, 'stream']);
        Route::get('/notifications', [\App\Http\Controllers\Api\V1\HubNotificationController::class, 'index']);
        Route::patch('/notifications/read-all', [\App\Http\Controllers\Api\V1\HubNotificationController::class, 'markAllAsRead']);
        Route::patch('/notifications/{id}/read', [\App\Http\Controllers\Api\V1\HubNotificationController::class, 'markAsRead']);
    });
});
