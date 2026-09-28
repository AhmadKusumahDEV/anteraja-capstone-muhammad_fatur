// ─── Unified types for the connected data flow (Hub Store) ───────────────────

export type ServiceType = 'SAME_DAY' | 'REGULAR';
export type PackageStatus = 'IN_TRANSIT' | 'IN_HUB' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
export type InboundManifestStatus = 'MENUNGGU_KONFIRMASI' | 'SUDAH_DITERIMA';
export type SeverityZone = 'CRITICAL' | 'WARNING' | 'NORMAL';
export type FleetType = 'MOTORCYCLE' | 'VAN';
export type CourierStatus = 'STANDBY' | 'ON_DUTY' | 'OFFLINE';
export type DispatchStatus = 'SIAP_BERANGKAT' | 'DALAM_PENGANTARAN' | 'SELESAI';

export interface Hub {
  id: number;
  hub_code: string;
  hub_name: string;
  hub_color: string;
}

export interface Courier {
  id: string;
  name: string;
  fleet_type: FleetType;
  status: CourierStatus;
  bay_location: string;
  initials: string;
}

// Unified package type — flows across all features
export interface HubPackage {
  tracking_id: string;
  manifest_code: string;
  service_type: ServiceType;
  destination_area: string;
  status: PackageStatus;
  hub_arrival_timestamp: string;
  sla_deadline: string;
  remaining_minutes: number;
  severity_zone: SeverityZone;
  is_priority: boolean;
}

// Inbound manifest — created by Manifest Generator, appears in Inbound Sorting
export interface InboundManifest {
  manifest_code: string;
  origin_hub_code: string;
  origin_hub_name: string;
  destination_hub_code: string;
  destination_hub_name: string;
  vehicle_type: string;
  vehicle_plate: string;
  total_packages: number;
  packages: HubPackage[];
  status: InboundManifestStatus;
  eta: string;
  eta_timestamp: number;
  created_at: string;
}

// Outbound dispatch batch
export interface OutboundBatch {
  manifest_code: string;
  courier_name: string;
  courier_id: string;
  total_packages: number;
  package_ids: string[];
  status: DispatchStatus;
  created_at: string;
}

// Manifest log entry (for Manifest Generator history)
export interface ManifestLogEntry {
  manifest_code: string;
  destination_hub_code: string;
  destination_hub_name: string;
  total_packages: number;
  vehicle_type: string;
  created_at: string;
  hub_color: string;
  packages: HubPackage[];
}

export interface HubCapacity {
  current: number;
  max: number;
}
