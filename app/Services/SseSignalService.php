<?php

namespace App\Services;

use App\Models\HubNotification;
use App\Enums\SseEventEnum;
use App\Enums\NotificationTypeEnum;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class SseSignalService
{
    /**
     * Publish event ke Redis channel DAN simpan ke hub_notifications table.
     */
    public function broadcast(
        string $hubId, 
        SseEventEnum $event, 
        array $data, 
        string $title, 
        string $message, 
        NotificationTypeEnum $type = NotificationTypeEnum::INFO
    ): void {
        // 1. Persist ke hub_notifications
        HubNotification::create([
            'id'      => (string) Str::uuid(),
            'hub_id'  => $hubId,
            'title'   => $title,
            'message' => $message,
            'type'    => $type->value,
            'is_read' => false,
        ]);

        // 2. Publish ke Redis Pub/Sub
        $payload = json_encode([
            'event'     => $event->value,
            'data'      => $data,
            'timestamp' => now()->toIso8601String(),
        ]);

        // Channel sesuai spesifikasi: hub.{hub_id}.signaling
        Redis::publish("hub.{$hubId}.signaling", $payload);
    }
}
