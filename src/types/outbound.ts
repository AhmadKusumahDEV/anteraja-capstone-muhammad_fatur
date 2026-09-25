export type DispatchStatus = 'SIAP_BERANGKAT' | 'DALAM_PENGANTARAN' | 'SELESAI';

export interface DispatchBatch {
  manifest_code: string;
  courier_name: string;
  courier_id: string;
  total_packages: number;
  status: DispatchStatus;
}

export interface OutboundStats {
  active_couriers: number;
  ready_to_depart: number;
  ready_to_depart_packages: number;
  in_delivery: number;
  in_delivery_packages: number;
}
