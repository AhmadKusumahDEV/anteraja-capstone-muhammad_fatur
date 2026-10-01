<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;

class JwtAuthMiddleware
{
    /**
     * Handle an incoming request.
     * Mengadopsi flow dan fallback token dari Go.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Ambil token dari Bearer header atau query param ?token=
        $token = $request->bearerToken() ?? $request->query('token');

        if (!$token) {
            return response()->json([
                'success' => false,
                'error'   => 'Unauthorized: no token provided',
            ], 401);
        }

        try {
            // 2. Parse & validate token
            JWTAuth::setToken($token);
            $user = JWTAuth::authenticate();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error'   => 'Unauthorized: user not found',
                ], 401);
            }

            // Optional: Jika butuh custom check berdasarkan claim seperti di Go
            // $payload = JWTAuth::getPayload();
            // $userInfo = $payload->get('user_info');
            
        } catch (TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'error'   => 'Unauthorized: token expired',
            ], 401);
        } catch (TokenInvalidException | JWTException $e) {
            return response()->json([
                'success' => false,
                'error'   => 'Unauthorized: ' . $e->getMessage(),
            ], 401);
        }

        // 3. Lanjutkan ke request berikutnya
        // Di Laravel, user sudah otomatis ter-set di Guard setelah authenticate() berhasil
        return $next($request);
    }
}
