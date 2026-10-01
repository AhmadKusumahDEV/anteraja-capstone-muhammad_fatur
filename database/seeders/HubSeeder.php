<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HubSeeder extends Seeder
{
    public function run()
    {
        DB::table('hubs')->upsert([
            [
                'id' => 'HUB-JKS-01',
                'name' => 'Jakarta Selatan Transit Hub',
                'region_name' => 'Jakarta Selatan',
                'location_tag' => 'Jaksel',
                'latitude' => -6.261493,
                'longitude' => 106.810600,
                'max_capacity' => 200,
                'timezone' => 'WIB (UTC+7)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'HUB-BDO-01',
                'name' => 'Bandung Pusat Hub',
                'region_name' => 'Bandung',
                'location_tag' => 'Bandung',
                'latitude' => -6.917464,
                'longitude' => 107.619123,
                'max_capacity' => 150,
                'timezone' => 'WIB (UTC+7)',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ], ['id'], ['name', 'region_name', 'location_tag', 'max_capacity', 'timezone', 'updated_at']);
    }
}
