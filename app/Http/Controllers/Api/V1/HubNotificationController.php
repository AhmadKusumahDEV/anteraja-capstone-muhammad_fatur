<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HubNotification;
use Illuminate\Http\JsonResponse;

class HubNotificationController extends Controller
{
    /**
     * GET /api/v1/notifications
     * Get unread notifications for current hub
     */
    public function index(): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            return response()->json(['success' => false, 'message' => 'Admin tidak memiliki akses ke Hub manapun.'], 403);
        }

        $notifications = HubNotification::where('hub_id', $user->hub_id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $notifications->map(function ($notif) {
                return [
                    'id'         => $notif->id,
                    'title'      => $notif->title,
                    'message'    => $notif->message,
                    'type'       => $notif->type instanceof \BackedEnum ? $notif->type->value : $notif->type,
                    'is_read'    => $notif->is_read,
                    'created_at' => $notif->created_at->toIso8601String(),
                ];
            }),
        ]);
    }

    /**
     * PATCH /api/v1/notifications/{id}/read
     */
    public function markAsRead(string $id): JsonResponse
    {
        $user = auth('api')->user();
        
        $notif = HubNotification::where('id', $id)
            ->where('hub_id', $user->hub_id)
            ->first();

        if ($notif) {
            $notif->is_read = true;
            $notif->save();
        }

        return response()->json(['success' => true]);
    }

    /**
     * PATCH /api/v1/notifications/read-all
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = auth('api')->user();
        if ($user && $user->hub_id) {
            HubNotification::where('hub_id', $user->hub_id)
                ->where('is_read', false)
                ->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }
}
