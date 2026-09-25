import type { DispatchBatch, OutboundStats } from '../types/outbound';
import type { Courier } from '../types/sla-queue';

export const DUMMY_OUTBOUND_STATS: OutboundStats = {
  active_couriers: 8,
  ready_to_depart: 2,
  ready_to_depart_packages: 32,
  in_delivery: 0,
  in_delivery_packages: 0,
};

export const DUMMY_DISPATCH_BATCHES: DispatchBatch[] = [
  // ─ SIAP BERANGKAT ─
  {
    manifest_code: 'MNF-2408-01',
    courier_name: 'Satria Ahmad',
    courier_id: 'SAT-001',
    total_packages: 18,
    status: 'SIAP_BERANGKAT',
  },
  {
    manifest_code: 'MNF-2408-03',
    courier_name: 'Satria Doni',
    courier_id: 'SAT-003',
    total_packages: 14,
    status: 'SIAP_BERANGKAT',
  },
  {
    manifest_code: 'MNF-2408-05',
    courier_name: 'Satria Budi',
    courier_id: 'SAT-005',
    total_packages: 22,
    status: 'SIAP_BERANGKAT',
  },
  {
    manifest_code: 'MNF-2408-07',
    courier_name: 'Satria Bayu',
    courier_id: 'SAT-007',
    total_packages: 15,
    status: 'SIAP_BERANGKAT',
  },

  // ─ DALAM PENGANTARAN ─
  {
    manifest_code: 'MNF-2408-09',
    courier_name: 'Satria Dimas',
    courier_id: 'SAT-009',
    total_packages: 20,
    status: 'DALAM_PENGANTARAN',
  },
  {
    manifest_code: 'MNF-2408-11',
    courier_name: 'Satria Fajar',
    courier_id: 'SAT-011',
    total_packages: 10,
    status: 'DALAM_PENGANTARAN',
  },
  {
    manifest_code: 'MNF-2408-13',
    courier_name: 'Satria Ilham',
    courier_id: 'SAT-013',
    total_packages: 16,
    status: 'DALAM_PENGANTARAN',
  },
  {
    manifest_code: 'MNF-2408-15',
    courier_name: 'Satria Kevin',
    courier_id: 'SAT-015',
    total_packages: 25,
    status: 'DALAM_PENGANTARAN',
  },

  // ─ SELESAI ─
  {
    manifest_code: 'MNF-2408-02',
    courier_name: 'Satria Reza',
    courier_id: 'SAT-002',
    total_packages: 20,
    status: 'SELESAI',
  },
  {
    manifest_code: 'MNF-2408-04',
    courier_name: 'Satria Hendra',
    courier_id: 'SAT-004',
    total_packages: 26,
    status: 'SELESAI',
  },
  {
    manifest_code: 'MNF-2408-06',
    courier_name: 'Satria Surya',
    courier_id: 'SAT-006',
    total_packages: 12,
    status: 'SELESAI',
  },
  {
    manifest_code: 'MNF-2408-08',
    courier_name: 'Satria Gilang',
    courier_id: 'SAT-008',
    total_packages: 19,
    status: 'SELESAI',
  },
];

// Reuse dummy couriers from sla-queue for modal selection
export const DUMMY_AVAILABLE_COURIERS: Courier[] = [
  {
    id: 'SAT-01',
    name: 'Satria Ilham',
    fleet_type: 'MOTORCYCLE',
    status: 'READY_NOW',
    bay_location: 'Bay 02',
    initials: 'SI',
  },
  {
    id: 'SAT-02',
    name: 'Satria Bayu',
    fleet_type: 'MOTORCYCLE',
    status: 'STANDBY',
    bay_location: 'Bay 02',
    initials: 'SB',
  },
  {
    id: 'SAT-03',
    name: 'Satria Dimas',
    fleet_type: 'VAN',
    status: 'STANDBY',
    bay_location: 'Bay 04',
    initials: 'SD',
  },
  {
    id: 'SAT-04',
    name: 'Satria Fajar',
    fleet_type: 'MOTORCYCLE',
    status: 'STANDBY',
    bay_location: 'Bay 01',
    initials: 'SF',
  },
];
