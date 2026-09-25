// ── Service Types ──
export type ServiceType = 'SAME_DAY' | 'NEXT_DAY' | 'REGULAR';
export type SeverityZone = 'CRITICAL' | 'WARNING' | 'NORMAL';
export type PackageStatus = 'IN_TRANSIT' | 'IN_HUB' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
export type CourierStatus = 'READY_NOW' | 'STANDBY' | 'ON_DUTY' | 'OFFLINE';
export type FleetType = 'MOTORCYCLE' | 'VAN';
export type StatusZone = 'NORMAL' | 'WARNING' | 'CRITICAL';

// ── Core Entities ──
export interface Package {
  tracking_id: string;
  service_type: ServiceType;
  hub_arrival_timestamp: string;
  sla_deadline: string;
  remaining_minutes: number;
  is_priority: boolean;
  severity_zone: SeverityZone;
  status: PackageStatus;
  destination_area: string;
  weight: number;
}

export interface Courier {
  id: string;
  name: string;
  fleet_type: FleetType;
  status: CourierStatus;
  bay_location: string;
  initials: string;
}

export interface HubMetrics {
  hub_id: string;
  hub_name: string;
  max_capacity: number;
  in_hub_count: number;
  in_transit_count: number;
  total_load: number;
  capacity_percentage: number;
  status_zone: StatusZone;
  alert_triggered: boolean;
}

// ── UI Filter Types ──
export type ServiceFilter = 'ALL' | ServiceType;
