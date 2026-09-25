export type InboundStatus = 'DALAM_PERJALANAN' | 'MENUNGGU_KONFIRMASI' | 'SUDAH_DITERIMA';

export interface InboundManifest {
  manifest_code: string;
  origin_hub_code: string;
  origin_hub_name: string;
  vehicle_plate: string;
  vehicle_type: string;
  total_packages: number;
  eta: string; 
  status: InboundStatus;
}

export interface InboundStats {
  total_scheduled: number;
  arrived: number;
}
