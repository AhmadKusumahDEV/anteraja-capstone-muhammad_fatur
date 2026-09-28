import { create } from 'zustand';
import type { HubPackage, Courier } from '../types/hub';
import type { ServiceFilter } from '../types/sla-queue';
import { useHubStore } from './useHubStore';

const ITEMS_PER_PAGE = 6;

interface HubMetrics {
  hub_id: string;
  hub_name: string;
  max_capacity: number;
  in_hub_count: number;
  in_transit_count: number;
  total_load: number;
  capacity_percentage: number;
  status_zone: 'NORMAL' | 'WARNING' | 'CRITICAL';
  alert_triggered: boolean;
}

interface SlaQueueState {
  packages: HubPackage[];
  couriers: Courier[];
  metrics: HubMetrics;
  currentPage: number;
  searchQuery: string;
  serviceFilter: ServiceFilter;
  isCriticalFilterActive: boolean;
  alertDismissed: boolean;
  selectedPackage: HubPackage | null;
  selectedCourierId: string | null;
  isModalOpen: boolean;

  getSortedFilteredPackages: () => HubPackage[];
  getPaginatedPackages: () => HubPackage[];
  getTotalPages: () => number;

  togglePriority: (tracking_id: string) => void;
  toggleCriticalFilter: () => void;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setServiceFilter: (filter: ServiceFilter) => void;
  dismissAlert: () => void;
  refreshQueue: () => void;

  openDispatchModal: (pkg: HubPackage) => void;
  closeDispatchModal: () => void;
  selectCourier: (courierId: string) => void;
  confirmDispatch: () => void;

  // Sync actions — called by useHubStore
  addPackages: (packages: HubPackage[]) => void;
  removePackages: (ids: string[]) => void;
  updateMetrics: (delta: number) => void;
  addInTransitPackages: (count: number) => void;
}

const buildMetrics = (inHubCount: number, capacity: { current: number; max: number }, inTransit: number): HubMetrics => {
  const pct = parseFloat(((capacity.current / capacity.max) * 100).toFixed(1));
  return {
    hub_id: 'HUB-JKS-01',
    hub_name: 'Hub Jakarta Selatan',
    max_capacity: capacity.max,
    in_hub_count: inHubCount,
    in_transit_count: inTransit,
    total_load: capacity.current,
    capacity_percentage: pct,
    status_zone: pct >= 90 ? 'WARNING' : 'NORMAL',
    alert_triggered: pct >= 90,
  };
};

const { hubPackages, hubCapacity, couriers, inboundManifests } = useHubStore.getState();
const seedInHub = hubPackages.filter((p) => p.status === 'IN_HUB').length;
const seedInTransit = inboundManifests.filter((m) => m.status === 'MENUNGGU_KONFIRMASI').reduce((s, m) => s + m.total_packages, 0);

export const useSlaQueueStore = create<SlaQueueState>((set, get) => ({
  packages: hubPackages.filter((p) => p.status === 'IN_HUB'),
  couriers: couriers,
  metrics: buildMetrics(seedInHub, hubCapacity, seedInTransit),
  currentPage: 1,
  searchQuery: '',
  serviceFilter: 'ALL',
  isCriticalFilterActive: false,
  alertDismissed: false,
  selectedPackage: null,
  selectedCourierId: null,
  isModalOpen: false,

  getSortedFilteredPackages: () => {
    const { packages, searchQuery, serviceFilter, isCriticalFilterActive } = get();
    let filtered = [...packages];

    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.destination_area.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (serviceFilter !== 'ALL') {
      filtered = filtered.filter((p) => p.service_type === serviceFilter);
    }
    if (isCriticalFilterActive) {
      filtered = filtered.filter((p) => p.is_priority || p.severity_zone === 'CRITICAL');
    }
    filtered.sort((a, b) => {
      // Prioritaskan SLA yang paling sedikit/kritis terlebih dahulu (Ascending)
      if (a.remaining_minutes !== b.remaining_minutes) {
        return a.remaining_minutes - b.remaining_minutes;
      }
      // Jika SLA sama, prioritaskan paket yang ditandai VIP/Priority
      if (a.is_priority !== b.is_priority) {
        return a.is_priority ? -1 : 1;
      }
      return 0;
    });
    return filtered;
  },

  getPaginatedPackages: () => {
    const { currentPage } = get();
    const sorted = get().getSortedFilteredPackages();
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  },

  getTotalPages: () => {
    return Math.max(1, Math.ceil(get().getSortedFilteredPackages().length / ITEMS_PER_PAGE));
  },

  togglePriority: (tracking_id) => {
    set((state) => ({
      packages: state.packages.map((p) =>
        p.tracking_id === tracking_id ? { ...p, is_priority: !p.is_priority } : p
      ),
      currentPage: 1,
    }));
  },

  toggleCriticalFilter: () => set((state) => ({ isCriticalFilterActive: !state.isCriticalFilterActive, currentPage: 1 })),
  setPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setServiceFilter: (filter) => set({ serviceFilter: filter, currentPage: 1 }),
  dismissAlert: () => set({ alertDismissed: true }),
  refreshQueue: () => set({ alertDismissed: false, currentPage: 1, searchQuery: '', serviceFilter: 'ALL', isCriticalFilterActive: false }),

  openDispatchModal: (pkg) => {
    const latestCouriers = useHubStore.getState().couriers;
    set({ selectedPackage: pkg, isModalOpen: true, selectedCourierId: null, couriers: latestCouriers });
  },
  closeDispatchModal: () => set({ isModalOpen: false, selectedPackage: null, selectedCourierId: null }),
  selectCourier: (courierId) => set({ selectedCourierId: courierId }),

  confirmDispatch: () => {
    const { selectedPackage, selectedCourierId } = get();
    if (!selectedPackage || !selectedCourierId) return;
    // Delegate to global hub store
    useHubStore.getState().createOutboundBatch(selectedCourierId, [selectedPackage.tracking_id]);
    set({ isModalOpen: false, selectedPackage: null, selectedCourierId: null, currentPage: 1 });
  },

  // ── Sync actions (called by useHubStore) ──
  addPackages: (packages) =>
    set((state) => ({
      packages: [...state.packages, ...packages],
      alertDismissed: false,
      currentPage: 1,
    })),

  removePackages: (ids) =>
    set((state) => ({
      packages: state.packages.filter((p) => !ids.includes(p.tracking_id)),
      currentPage: 1,
    })),

  updateMetrics: (delta) =>
    set((state) => {
      const { hubCapacity } = useHubStore.getState();
      const newInHub = Math.max(0, state.metrics.in_hub_count + delta);
      const newTransit = delta > 0
        ? Math.max(0, state.metrics.in_transit_count - delta)
        : state.metrics.in_transit_count;
      return { metrics: buildMetrics(newInHub, hubCapacity, newTransit) };
    }),

  addInTransitPackages: (count) =>
    set((state) => {
      const { hubCapacity } = useHubStore.getState();
      const newTransit = state.metrics.in_transit_count + count;
      return { metrics: buildMetrics(state.metrics.in_hub_count, hubCapacity, newTransit) };
    }),
}));
