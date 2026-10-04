<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'id' => 'USR-002',
                'nik' => 'SUP-001',
                'name' => 'Super Admin',
                'role' => 'SUPER_ADMIN',
                'hub_id' => null,
                'password_hash' => Hash::make('superadmin123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        $hubs = ['HUB-JKS-01', 'HUB-BDO-01', 'HUB-SBY-01', 'HUB-MDN-01'];
        $hubPrefixes = ['JKS', 'BDO', 'SBY', 'MDN'];
        $userCounter = 3;

        foreach ($hubs as $index => $hubId) {
            $prefix = $hubPrefixes[$index];
            for ($i = 1; $i <= 3; $i++) {
                $users[] = [
                    'id' => 'USR-' . str_pad($userCounter, 3, '0', STR_PAD_LEFT),
                    'nik' => 'ADM-' . $prefix . '-' . $i,
                    'name' => "Admin {$i} {$prefix}",
                    'role' => 'HUB_ADMIN',
                    'hub_id' => $hubId,
                    'password_hash' => Hash::make('password123'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $userCounter++;
            }
        }

        DB::table('users')->upsert($users, ['id'], ['nik', 'name', 'role', 'hub_id', 'password_hash', 'updated_at']);
    }
}
