<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Handle user login via JWT.
     * Menggunakan NIK & password.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('nik', $request->nik)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'NIK atau password salah.',
            ], 401);
        }

        /** @var \Tymon\JWTAuth\JWTGuard $guard */
        $guard = auth('api');

        // Generate Access Token (60 menit default)
        $accessToken = $guard->login($user);

        // Generate Refresh Token (custom claims type = refresh, TTL lebih lama misal 7 hari)
        $refreshToken = $guard->claims(['type' => 'refresh'])
            ->setTTL(config('jwt.refresh_ttl', 10080))
            ->login($user);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data'    => [
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type'    => 'Bearer',
                'expires_in'    => config('jwt.ttl') * 60,
                'user'          => [
                    'id'     => $user->id,
                    'nik'    => $user->nik,
                    'name'   => $user->name,
                    'role'   => $user->role,
                    'hub_id' => $user->hub_id,
                ],
            ],
        ]);
    }

    /**
     * Get the authenticated user info.
     */
    public function me(): JsonResponse
    {
        $user = auth('api')->user();
        
        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    /**
     * Refresh access token.
     */
    public function refresh(): JsonResponse
    {
        try {
            /** @var \Tymon\JWTAuth\JWTGuard $guard */
            $guard = auth('api');
            $newToken = $guard->refresh();
            return response()->json([
                'success' => true,
                'message' => 'Token berhasil diperbarui.',
                'data'    => [
                    'access_token' => $newToken,
                    'token_type'   => 'Bearer',
                    'expires_in'   => config('jwt.ttl') * 60,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat memperbarui token: ' . $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Invalidate (logout) token saat ini.
     */
    public function logout(): JsonResponse
    {
        try {
            /** @var \Tymon\JWTAuth\JWTGuard $guard */
            $guard = auth('api');
            $guard->logout();
            return response()->json([
                'success' => true,
                'message' => 'Berhasil logout.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal logout.',
            ], 500);
        }
    }
}
