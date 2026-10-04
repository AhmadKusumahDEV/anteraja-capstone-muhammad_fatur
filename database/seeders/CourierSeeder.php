<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourierSeeder extends Seeder
{
    public function run()
    {
        $now = now();

        // Data awal (tetap dipertahankan)
        $couriers = [
            ['id' => 'SAT-001', 'name' => 'Satria Bayu',   'fleet_type' => 'MOTORCYCLE', 'status' => 'STANDBY', 'current_hub_id' => 'HUB-JKS-01'],
            ['id' => 'SAT-002', 'name' => 'Satria Gilang', 'fleet_type' => 'VAN',        'status' => 'ON_DUTY', 'current_hub_id' => 'HUB-BDO-01'],
        ];

        // Tambahan: 5 kurir STANDBY untuk setiap hub
        $extra = [
            'HUB-JKS-01' => [
                ['JKS-001', 'Andi Pratama',   'MOTORCYCLE'],
                ['JKS-002', 'Budi Santoso',   'MOTORCYCLE'],
                ['JKS-003', 'Cahyo Nugroho',  'VAN'],
                ['JKS-004', 'Dimas Saputra',  'MOTORCYCLE'],
                ['JKS-005', 'Eko Wijaya',     'VAN'],
            ],
            'HUB-BDO-01' => [
                ['BDO-001', 'Fajar Ramadhan', 'MOTORCYCLE'],
                ['BDO-002', 'Gunawan Hakim',  'MOTORCYCLE'],
                ['BDO-003', 'Hendra Kusuma',  'VAN'],
                ['BDO-004', 'Irfan Maulana',  'MOTORCYCLE'],
                ['BDO-005', 'Joko Susilo',    'VAN'],
            ],
            'HUB-SBY-01' => [
                ['SBY-001', 'Bagus Prasetyo', 'MOTORCYCLE'],
                ['SBY-002', 'Hasanudin',      'MOTORCYCLE'],
                ['SBY-003', 'Rizky Fadilah',  'VAN'],
                ['SBY-004', 'Wahyu Hidayat',  'MOTORCYCLE'],
                ['SBY-005', 'Dedi Mulyadi',   'VAN'],
            ],
            'HUB-MDN-01' => [
                ['MDN-001', 'Togar Sitompul', 'MOTORCYCLE'],
                ['MDN-002', 'Rudi Hutasuhut', 'MOTORCYCLE'],
                ['MDN-003', 'Batak Munte',    'VAN'],
                ['MDN-004', 'Uceng Siregar',  'MOTORCYCLE'],
                ['MDN-005', 'Poltak Tambunan','VAN'],
            ],
        ];

        foreach ($extra as $hubId => $list) {
            foreach ($list as [$id, $name, $fleet]) {
                $couriers[] = [
                    'id' => $id,
                    'name' => $name,
                    'fleet_type' => $fleet,
                    'status' => 'STANDBY',
                    'current_hub_id' => $hubId,
                ];
            }
        }

        $rows = array_map(fn ($c) => $c + ['created_at' => $now, 'updated_at' => $now], $couriers);

        DB::table('couriers')->upsert($rows, ['id'], ['name', 'fleet_type', 'status', 'current_hub_id', 'updated_at']);
    }
}
