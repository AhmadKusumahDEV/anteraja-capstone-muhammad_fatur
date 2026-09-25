export interface Hub {
  id: number;
  hub_code: string;
  hub_name: string;
  hub_color: string;
}

export interface ManifestLog {
  manifest_code: string;
  destination_hub_code: string;
  destination_hub_name: string;
  total_packages: number;
  vehicle_type: string;
  created_at: string;
  hub_color: string;
}

export interface ManifestPackageDetail {
  tracking_id: string;
  service_type: 'SAME_DAY' | 'NEXT_DAY' | 'REGULAR';
  weight_kg: number;
  status: 'IN_TRANSIT';
}
