import { create } from 'zustand';
import type {
  Hub, Courier, HubPackage, InboundManifest, OutboundBatch,
  ManifestLogEntry, HubCapacity, ServiceType, SeverityZone,
  PackageStatus, InboundManifestStatus, DispatchStatus,
} from '../types/hub';

// ─── Helper Functions ──────────────────────────────────────────────────────────
const calcVehicleType = (count: number): string => {
  if (count < 30) return 'Blind Van (CDE)';
  if (count <= 50) return 'Colt Diesel (CDD)';
  return 'Wingbox Truck';
};

const calcSeverityZone = (mins: number): SeverityZone => {
  if (mins < 30) return 'CRITICAL';
  if (mins <= 120) return 'WARNING';
  return 'NORMAL';
};

const nowStr = (): string => {
  const now = new Date();
  return `2026-09-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const generateManifestCode = (): string =>
  `MNF-2409-${Math.floor(1000 + Math.random() * 9000)}`;

const generateOutboundCode = (): string =>
  `MNF-OUT-2409-${Math.floor(1000 + Math.random() * 9000)}`;

const DEST_AREAS = [
  'Kebayoran Baru, Jakarta Selatan',
  'Pasar Minggu, Jakarta Selatan',
  'Cilandak, Jakarta Selatan',
  'Mampang Prapatan, Jakarta Selatan',
  'Tebet, Jakarta Selatan',
  'Pancoran, Jakarta Selatan',
  'Pesanggrahan, Jakarta Selatan',
  'Jagakarsa, Jakarta Selatan',
  'Setiabudi, Jakarta Selatan',
  'Kebayoran Lama, Jakarta Selatan',
  'Cakung, Jakarta Timur',
  'Duren Sawit, Jakarta Timur',
  'Jatinegara, Jakarta Timur',
  'Matraman, Jakarta Timur',
  'Pulogadung, Jakarta Timur',
  'Pasar Rebo, Jakarta Timur',
  'Cipayung, Jakarta Timur',
  'Condet, Jakarta Timur',
  'Ciracas, Jakarta Timur',
  'Kramat Jati, Jakarta Timur',
];

// ─── Seed Data: Hubs ──────────────────────────────────────────────────────────
const SEED_HUBS: Hub[] = [
  { id: 1, hub_code: 'HUB-BDG-02', hub_name: 'Bandung Pasteur Gateway', hub_color: 'bg-blue-500' },
  { id: 2, hub_code: 'HUB-TGR-01', hub_name: 'Tangerang Batuceper', hub_color: 'bg-amber-500' },
  { id: 3, hub_code: 'HUB-BKS-03', hub_name: 'Bekasi Barat', hub_color: 'bg-pink-500' },
  { id: 4, hub_code: 'HUB-SBY-01', hub_name: 'Surabaya Gubeng', hub_color: 'bg-emerald-500' },
  { id: 5, hub_code: 'HUB-SMG-01', hub_name: 'Semarang Tawang', hub_color: 'bg-purple-500' },
  { id: 6, hub_code: 'HUB-DPK-02', hub_name: 'Depok Margonda', hub_color: 'bg-cyan-500' },
];

// ─── Seed Data: Couriers ──────────────────────────────────────────────────────
const SEED_COURIERS: Courier[] = [
  { id: 'SAT-01', name: 'Satria Ilham', fleet_type: 'MOTORCYCLE', status: 'STANDBY', bay_location: 'Bay 02', initials: 'SI' },
  { id: 'SAT-02', name: 'Satria Bayu', fleet_type: 'MOTORCYCLE', status: 'STANDBY', bay_location: 'Bay 03', initials: 'SB' },
  { id: 'SAT-03', name: 'Satria Dimas', fleet_type: 'VAN', status: 'STANDBY', bay_location: 'Bay 04', initials: 'SD' },
  { id: 'SAT-04', name: 'Satria Fajar', fleet_type: 'MOTORCYCLE', status: 'STANDBY', bay_location: 'Bay 01', initials: 'SF' },
];

// ─── Seed Data: Hub Packages ───────────────────────────────────────────────────
const SEED_HUB_PACKAGES: HubPackage[] = [];

// ─── Seed Data: Inbound Manifests ────────────────────────────────────────────
const SEED_INBOUND_MANIFESTS: InboundManifest[] = [];

// ─── Seed Data: Outbound Batches ─────────────────────────────────────────────
const SEED_OUTBOUND_BATCHES: OutboundBatch[] = [];

// ─── Seed Data: Manifest Logs ─────────────────────────────────────────────────
const SEED_MANIFEST_LOGS: ManifestLogEntry[] = [];

// ─── Store Interface ──────────────────────────────────────────────────────────
interface HubState {
  hubs: Hub[];
  couriers: Courier[];
  hubCapacity: HubCapacity;
  inboundManifests: InboundManifest[];
  hubPackages: HubPackage[];
  outboundBatches: OutboundBatch[];
  manifestLogs: ManifestLogEntry[];

  // Global UI State
  isDetailOpen: boolean;
  activeDetailManifest: ManifestLogEntry | InboundManifest | null;

  // Master actions — feature stores delegate here
  submitManifest: (packageCount: number, etaOffsetMins: number) => void;
  fastForwardManifest: (manifestCode: string) => void;
  acknowledgeManifest: (manifestCode: string) => void;
  createOutboundBatch: (courierId: string, packageIds: string[]) => void;
  departBatch: (manifestCode: string) => void;
  completeBatch: (manifestCode: string) => void;

  openDetailManifest: (manifest: ManifestLogEntry | InboundManifest) => void;
  closeDetailManifest: () => void;

  tickSla: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useHubStore = create<HubState>((set, get) => ({
  hubs: SEED_HUBS,
  couriers: SEED_COURIERS,
  hubCapacity: { current: 0, max: 200 },
  inboundManifests: SEED_INBOUND_MANIFESTS,
  hubPackages: SEED_HUB_PACKAGES,
  outboundBatches: SEED_OUTBOUND_BATCHES,
  manifestLogs: SEED_MANIFEST_LOGS,
  isDetailOpen: false,
  activeDetailManifest: null,

  // ── Submit new manifest (Manifest Generator → Inbound) ──
  submitManifest: (packageCount, etaOffsetMins) => {
    const { inboundManifests, manifestLogs } = get();

    const manifestCode = generateManifestCode();
    const vehicleType = calcVehicleType(packageCount);
    const nowMs = Date.now();
    const etaMs = nowMs + etaOffsetMins * 60 * 1000;

    const createdDate = new Date(nowMs);
    const created = `2026-09-${createdDate.getDate().toString().padStart(2, '0')} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`;

    const etaDate = new Date(etaMs);
    const etaTimeStr = `${etaDate.getHours().toString().padStart(2, '0')}:${etaDate.getMinutes().toString().padStart(2, '0')}`;

    // Generate packages (IN_TRANSIT — no SLA yet)
    const packages: HubPackage[] = Array.from({ length: packageCount }).map((_, i) => {
      const services: ServiceType[] = ['SAME_DAY', 'REGULAR'];
      return {
        tracking_id: `TRK-${manifestCode.split('-')[2]}-${(i + 1).toString().padStart(3, '0')}`,
        manifest_code: manifestCode,
        service_type: services[i % 2],
        destination_area: DEST_AREAS[i % DEST_AREAS.length],
        status: 'IN_TRANSIT' as PackageStatus,
        hub_arrival_timestamp: '',
        sla_deadline: '',
        remaining_minutes: 0,
        severity_zone: 'NORMAL' as SeverityZone,
        is_priority: Math.random() > 0.85,
      };
    });

    const newManifest: InboundManifest = {
      manifest_code: manifestCode,
      origin_hub_code: 'HUB-BDG-02', // Simulate coming from Bandung
      origin_hub_name: 'Bandung Pasteur Gateway',
      destination_hub_code: 'HUB-JKS-01', // Arriving at this hub
      destination_hub_name: 'Hub Jakarta Selatan',
      vehicle_type: vehicleType,
      vehicle_plate: `B ${Math.floor(1000 + Math.random() * 9000)} SX`,
      total_packages: packageCount,
      packages,
      status: 'MENUNGGU_KONFIRMASI',
      eta: `Tiba pukul ${etaTimeStr} WIB`,
      eta_timestamp: etaMs,
      created_at: created,
    };

    const newLog: ManifestLogEntry = {
      manifest_code: manifestCode,
      destination_hub_code: 'HUB-JKS-01',
      destination_hub_name: 'Hub Jakarta Selatan',
      total_packages: packageCount,
      vehicle_type: vehicleType,
      created_at: created,
      hub_color: 'bg-emerald-500',
      packages,
    };

    set({
      inboundManifests: [newManifest, ...inboundManifests],
      manifestLogs: [newLog, ...manifestLogs],
    });

    // Lazy-import feature stores to sync (avoids circular imports at module level)
    import('./useInboundStore').then((m) =>
      m.useInboundStore.getState().addManifest(newManifest)
    );
    import('./useManifestStore').then((m) =>
      m.useManifestStore.getState().addLog(newLog)
    );
    import('./useSlaQueueStore').then((m) =>
      m.useSlaQueueStore.getState().addInTransitPackages(packageCount)
    );
  },

  // ── Fast forward ETA (Percepat) ──
  fastForwardManifest: (manifestCode) => {
    const { inboundManifests } = get();
    const newEtaMs = Date.now() - 1000;
    set({
      inboundManifests: inboundManifests.map((m) =>
        m.manifest_code === manifestCode
          ? { ...m, eta_timestamp: newEtaMs } // Simulate it arrived in the past
          : m
      ),
    });

    // Sync to inbound store (force re-render)
    import('./useInboundStore').then((m) => {
      m.useInboundStore.getState().updateManifestEta(manifestCode, newEtaMs);
      m.useInboundStore.getState().setPage(m.useInboundStore.getState().currentPage);
    });
  },

  // ── Acknowledge manifest (Inbound → SLA Queue) ──
  acknowledgeManifest: (manifestCode) => {
    const { inboundManifests, hubPackages, hubCapacity } = get();
    const manifest = inboundManifests.find((m) => m.manifest_code === manifestCode);
    if (!manifest || manifest.status === 'SUDAH_DITERIMA') return;

    const incoming = manifest.total_packages;
    if (hubCapacity.current + incoming > hubCapacity.max) {
      return;
    }

    const now = nowStr();
    // Assign SLA to each package now that it enters the hub
    const updatedPackages: HubPackage[] = manifest.packages.map((pkg) => {
      const remainingMins =
        pkg.service_type === 'SAME_DAY'
          ? Math.floor(Math.random() * 90 + 30)    // 30–120 mins (WARNING zone)
          : Math.floor(Math.random() * 180 + 120);  // 120–300 mins (NORMAL zone)
      return {
        ...pkg,
        status: 'IN_HUB' as PackageStatus,
        hub_arrival_timestamp: now,
        sla_deadline: now,
        remaining_minutes: remainingMins,
        severity_zone: calcSeverityZone(remainingMins),
      };
    });

    const updatedManifest: InboundManifest = {
      ...manifest,
      status: 'SUDAH_DITERIMA' as InboundManifestStatus,
      packages: updatedPackages,
    };

    const newHubPackages = [...hubPackages, ...updatedPackages];

    set({
      inboundManifests: inboundManifests.map((m) =>
        m.manifest_code === manifestCode ? updatedManifest : m
      ),
      hubPackages: newHubPackages,
      hubCapacity: { ...hubCapacity, current: hubCapacity.current + incoming },
    });

    // Sync to feature stores
    import('./useInboundStore').then((m) =>
      m.useInboundStore.getState().updateManifestStatus(manifestCode, 'SUDAH_DITERIMA')
    );
    import('./useSlaQueueStore').then((m) => {
      m.useSlaQueueStore.getState().addPackages(updatedPackages);
      m.useSlaQueueStore.getState().updateMetrics(incoming);
    });
    import('./useOutboundStore').then((m) =>
      m.useOutboundStore.getState().syncAvailablePackages(
        newHubPackages.filter((p) => p.status === 'IN_HUB')
      )
    );
  },

  // ── Create outbound batch (SLA Queue/Outbound → dispatch) ──
  createOutboundBatch: (courierId, packageIds) => {
    const { couriers, hubPackages, outboundBatches, hubCapacity } = get();
    const courier = couriers.find((c) => c.id === courierId);
    if (!courier || packageIds.length === 0) return;

    const batchCode = generateOutboundCode();
    const now = nowStr();

    const newBatch: OutboundBatch = {
      manifest_code: batchCode,
      courier_name: courier.name,
      courier_id: courier.id,
      total_packages: packageIds.length,
      package_ids: packageIds,
      status: 'SIAP_BERANGKAT',
      created_at: now,
    };

    const remainingPackages = hubPackages.filter((p) => !packageIds.includes(p.tracking_id));

    set({
      hubPackages: remainingPackages,
      outboundBatches: [newBatch, ...outboundBatches],
      hubCapacity: { ...hubCapacity, current: Math.max(0, hubCapacity.current - packageIds.length) },
      couriers: get().couriers.map((c) =>
        c.id === courierId ? { ...c, status: 'ON_DUTY' } : c
      ),
    });

    // Sync to feature stores
    import('./useSlaQueueStore').then((m) => {
      m.useSlaQueueStore.getState().removePackages(packageIds);
      m.useSlaQueueStore.getState().updateMetrics(-packageIds.length);
    });
    import('./useOutboundStore').then((m) => {
      m.useOutboundStore.getState().addBatch(newBatch);
      m.useOutboundStore.getState().syncAvailablePackages(
        remainingPackages.filter((p) => p.status === 'IN_HUB')
      );
    });
  },

  // ── Depart / Complete batch ──
  departBatch: (manifestCode) => {
    set((state) => ({
      outboundBatches: state.outboundBatches.map((b) =>
        b.manifest_code === manifestCode
          ? { ...b, status: 'DALAM_PENGANTARAN' as DispatchStatus }
          : b
      ),
    }));
    import('./useOutboundStore').then((m) =>
      m.useOutboundStore.getState().updateBatchStatus(manifestCode, 'DALAM_PENGANTARAN')
    );
  },

  completeBatch: (manifestCode) => {
    set((state) => {
      const batch = state.outboundBatches.find(b => b.manifest_code === manifestCode);
      return {
        outboundBatches: state.outboundBatches.map((b) =>
          b.manifest_code === manifestCode
            ? { ...b, status: 'SELESAI' as DispatchStatus }
            : b
        ),
        couriers: batch ? state.couriers.map(c =>
          c.id === batch.courier_id ? { ...c, status: 'STANDBY' } : c
        ) : state.couriers
      };
    });
    import('./useOutboundStore').then((m) =>
      m.useOutboundStore.getState().updateBatchStatus(manifestCode, 'SELESAI')
    );
  },

  openDetailManifest: (manifest) => set({ isDetailOpen: true, activeDetailManifest: manifest }),
  closeDetailManifest: () => set({ isDetailOpen: false, activeDetailManifest: null }),

  // ── SLA Tick (Runs every minute/second) ──
  tickSla: () => {
    const { hubPackages } = get();
    const updatedPackages = hubPackages.map((pkg) => {
      if (pkg.status === 'IN_HUB') {
        const newMins = pkg.remaining_minutes - 1;
        return {
          ...pkg,
          remaining_minutes: newMins,
          severity_zone: calcSeverityZone(newMins),
        };
      }
      return pkg;
    });

    set({ hubPackages: updatedPackages });

    // Sync SlaQueueStore
    import('./useSlaQueueStore').then((m) => {
      const inHubPkgs = updatedPackages.filter((p) => p.status === 'IN_HUB');
      m.useSlaQueueStore.setState({ packages: inHubPkgs });
    });
  },
}));
