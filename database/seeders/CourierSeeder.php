<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourierSeeder extends Seeder
{
    public function run()
    {
        DB::table('couriers')->insert([
            [
                'id' => 'SAT-001',
                'name' => 'Satria Bayu',
                'fleet_type' => 'MOTORCYCLE',
                'status' => 'STANDBY',
                'current_hub_id' => 'HUB-JKS-01',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'SAT-002',
                'name' => 'Satria Gilang',
                'fleet_type' => 'VAN',
                'status' => 'ON_DUTY',
                'current_hub_id' => 'HUB-BDO-01',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
