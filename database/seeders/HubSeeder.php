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
            ],
            [
                'id' => 'HUB-SBY-01',
                'name' => 'Surabaya Transit Hub',
                'region_name' => 'Surabaya',
                'location_tag' => 'Surabaya',
                'latitude' => -7.250445,
                'longitude' => 112.768845,
                'max_capacity' => 200,
                'timezone' => 'WIB (UTC+7)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'HUB-MDN-01',
                'name' => 'Medan Utama Hub',
                'region_name' => 'Medan',
                'location_tag' => 'Medan',
                'latitude' => 3.595196,
                'longitude' => 98.672223,
                'max_capacity' => 180,
                'timezone' => 'WIB (UTC+7)',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ], ['id'], ['name', 'region_name', 'location_tag', 'latitude', 'longitude', 'max_capacity', 'timezone', 'updated_at']);
    }
}
