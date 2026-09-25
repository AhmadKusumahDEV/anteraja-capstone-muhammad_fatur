import type { Hub, ManifestLog, ManifestPackageDetail } from '../types/manifest';

export const DUMMY_HUBS: Hub[] = [
  { id: 1, hub_code: 'HUB-BDG-02', hub_name: 'Bandung Pasteur Gateway', hub_color: 'bg-blue-500' },
  { id: 2, hub_code: 'HUB-TGR-01', hub_name: 'Tangerang Batuceper', hub_color: 'bg-amber-500' },
  { id: 3, hub_code: 'HUB-BKS-03', hub_name: 'Bekasi Barat', hub_color: 'bg-pink-500' },
  { id: 4, hub_code: 'HUB-SBY-01', hub_name: 'Surabaya Gubeng', hub_color: 'bg-emerald-500' },
  { id: 5, hub_code: 'HUB-SMG-01', hub_name: 'Semarang Tawang', hub_color: 'bg-purple-500' },
  { id: 6, hub_code: 'HUB-DPK-02', hub_name: 'Depok Margonda', hub_color: 'bg-cyan-500' },
];

export const DUMMY_MANIFEST_LOGS: ManifestLog[] = [
  {
    manifest_code: 'MNF-2409-9020',
    destination_hub_code: 'HUB-BDG-02',
    destination_hub_name: 'Bandung Pasteur',
    total_packages: 28,
    vehicle_type: 'Blind Van (CDE)',
    created_at: '2026-09-17 14:38',
    hub_color: 'bg-blue-500',
  },
  {
    manifest_code: 'MNF-2409-9019',
    destination_hub_code: 'HUB-TGR-01',
    destination_hub_name: 'Tangerang Batuceper',
    total_packages: 45,
    vehicle_type: 'Colt Diesel (CDD)',
    created_at: '2026-09-17 14:15',
    hub_color: 'bg-amber-500',
  },
  {
    manifest_code: 'MNF-2409-9018',
    destination_hub_code: 'HUB-BKS-03',
    destination_hub_name: 'Bekasi Barat',
    total_packages: 18,
    vehicle_type: 'Blind Van (CDE)',
    created_at: '2026-09-17 13:50',
    hub_color: 'bg-pink-500',
  },
  {
    manifest_code: 'MNF-2409-9017',
    destination_hub_code: 'HUB-SBY-01',
    destination_hub_name: 'Surabaya Gubeng',
    total_packages: 80,
    vehicle_type: 'Wingbox Truck',
    created_at: '2026-09-17 12:30',
    hub_color: 'bg-emerald-500',
  },
  {
    manifest_code: 'MNF-2409-9016',
    destination_hub_code: 'HUB-SMG-01',
    destination_hub_name: 'Semarang Tawang',
    total_packages: 55,
    vehicle_type: 'Wingbox Truck',
    created_at: '2026-09-17 11:10',
    hub_color: 'bg-purple-500',
  },
  {
    manifest_code: 'MNF-2409-9015',
    destination_hub_code: 'HUB-DPK-02',
    destination_hub_name: 'Depok Margonda',
    total_packages: 22,
    vehicle_type: 'Blind Van (CDE)',
    created_at: '2026-09-17 10:45',
    hub_color: 'bg-cyan-500',
  },
  {
    manifest_code: 'MNF-2409-9014',
    destination_hub_code: 'HUB-BDG-02',
    destination_hub_name: 'Bandung Pasteur',
    total_packages: 35,
    vehicle_type: 'Colt Diesel (CDD)',
    created_at: '2026-09-17 09:20',
    hub_color: 'bg-blue-500',
  },
  {
    manifest_code: 'MNF-2409-9013',
    destination_hub_code: 'HUB-TGR-01',
    destination_hub_name: 'Tangerang Batuceper',
    total_packages: 90,
    vehicle_type: 'Wingbox Truck',
    created_at: '2026-09-17 08:05',
    hub_color: 'bg-amber-500',
  },
];

const SERVICE_TYPES: ('SAME_DAY' | 'NEXT_DAY' | 'REGULAR')[] = ['SAME_DAY', 'NEXT_DAY', 'REGULAR'];

export function generateDummyPackages(count: number, prefix: string): ManifestPackageDetail[] {
  return Array.from({ length: count }).map((_, i) => {
    const randomService = SERVICE_TYPES[Math.floor(Math.random() * SERVICE_TYPES.length)];
    const randomWeight = (Math.random() * 9 + 1).toFixed(1); // 1.0 - 10.0 kg
    
    return {
      tracking_id: `TRK-${prefix}-${(i + 1).toString().padStart(3, '0')}`,
      service_type: randomService,
      weight_kg: Number(randomWeight),
      status: 'IN_TRANSIT',
    };
  });
}
