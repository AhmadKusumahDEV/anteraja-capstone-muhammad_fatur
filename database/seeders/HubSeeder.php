<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HubSeeder extends Seeder
{
    public function run()
    {
        DB::table('hubs')->insert([
            [
                'id' => 'HUB-JKS-01',
                'name' => 'Jakarta Selatan Transit Hub',
                'region_name' => 'Jakarta Selatan',
                'location_tag' => 'Jaksel',
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
                'max_capacity' => 150,
                'timezone' => 'WIB (UTC+7)',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
