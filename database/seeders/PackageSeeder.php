<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageSeeder extends Seeder
{
    public function run()
    {
        DB::table('packages')->insert([
            [
                'tracking_id' => 'TRK-2139410001',
                'current_hub_id' => 'HUB-JKS-01',
                'destination_area' => 'Jakarta Selatan',
                'service_type' => 'SAME_DAY',
                'status' => 'IN_HUB',
                'hub_arrival_timestamp' => now(),
                'sla_deadline' => now()->addHours(6),
                'is_priority' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tracking_id' => 'TRK-2139410002',
                'current_hub_id' => 'HUB-JKS-01',
                'destination_area' => 'Bandung',
                'service_type' => 'NEXT_DAY',
                'status' => 'IN_TRANSIT',
                'hub_arrival_timestamp' => now(),
                'sla_deadline' => now()->addDays(1),
                'is_priority' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
