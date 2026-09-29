<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            [
                'id' => 'USR-001',
                'nik' => 'ADM-102',
                'name' => 'Admin Budi',
                'role' => 'HUB_ADMIN',
                'hub_id' => 'HUB-JKS-01',
                'password_hash' => Hash::make('password123'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
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
        ]);
    }
}
