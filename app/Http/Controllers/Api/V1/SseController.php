<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SseController extends Controller
{
    /**
     * GET /api/v1/sse/stream
     * Endpoint untuk Server-Sent Events.
     */
    public function stream(Request $request): StreamedResponse
    {
        $user = auth('api')->user();
        if (!$user || !$user->hub_id) {
            abort(403, 'Unauthorized. Hub ID missing.');
        }

        $hubId = $user->hub_id;
        $prefix = config('database.redis.options.prefix', '');
        $channel = $prefix . "hub.{$hubId}.signaling";

        return response()->stream(function () use ($channel) {
            $redisHost = env('REDIS_HOST', '127.0.0.1');
            $redisPort = env('REDIS_PORT', 6379);

            $redis = new \Redis();
            try {
                $redis->connect($redisHost, $redisPort);
                $redis->setOption(\Redis::OPT_READ_TIMEOUT, 15); // 15 detik timeout
                
                // Kirim pesan pertama agar browser langsung mentrigger onopen!
                echo ": connected\n\n";
                ob_flush();
                flush();
            } catch (\Exception $e) {
                return;
            }

            // Loop tak terbatas untuk menjaga koneksi tetap hidup
            while (true) {
                if (connection_aborted()) {
                    $redis->close();
                    break;
                }

                try {
                    $redis->subscribe([$channel], function ($redis, $chan, $message) {
                        echo "data: {$message}\n\n";
                        ob_flush();
                        flush();
                    });
                } catch (\RedisException $e) {
                    // Timeout akan melempar exception, kita tangkap untuk kirim heartbeat
                    $errorMsg = strtolower($e->getMessage());
                    if ($errorMsg == 'read error on connection' || str_contains($errorMsg, 'timeout')) {
                        echo ": ping " . time() . "\n\n";
                        ob_flush();
                        flush();

                        // Workaround: Reconnect redis setelah timeout exception di phpredis
                        try {
                            $redis->close();
                            $redis->connect($redisHost, $redisPort);
                            $redis->setOption(\Redis::OPT_READ_TIMEOUT, 15);
                        } catch (\Exception $ex) {
                            sleep(1);
                        }
                    } else {
                        // Error lain (Redis mati dll), tunggu sebentar sebelum reconnect
                        sleep(2);
                        try {
                            $redis->connect($redisHost, $redisPort);
                            $redis->setOption(\Redis::OPT_READ_TIMEOUT, 15);
                        } catch (\Exception $ex) {}
                    }
                }
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'Connection'        => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
        ]);
    }
}
