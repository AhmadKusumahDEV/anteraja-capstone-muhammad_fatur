import { create } from 'zustand';
import { DUMMY_COURIERS, DUMMY_HUB_METRICS, DUMMY_PACKAGES } from '../data/sla-queue-dummy';
import type { Courier, HubMetrics, Package, ServiceFilter } from '../types/sla-queue';

const ITEMS_PER_PAGE = 6;

interface SlaQueueState {
  // ── Data ──
  packages: Package[];
  couriers: Courier[];
  metrics: HubMetrics;

  // ── UI State ──
  currentPage: number;
  searchQuery: string;
  serviceFilter: ServiceFilter;
  isCriticalFilterActive: boolean;
  alertDismissed: boolean;

  // ── Modal State ──
  selectedPackage: Package | null;
  selectedCourierId: string | null;
  isModalOpen: boolean;

  // ── Computed (derived) ──
  getSortedFilteredPackages: () => Package[];
  getPaginatedPackages: () => Package[];
  getTotalPages: () => number;

  // ── Actions ──
  togglePriority: (tracking_id: string) => void;
  toggleCriticalFilter: () => void;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setServiceFilter: (filter: ServiceFilter) => void;
  dismissAlert: () => void;
  refreshQueue: () => void;

  // ── Modal Actions ──
  openDispatchModal: (pkg: Package) => void;
  closeDispatchModal: () => void;
  selectCourier: (courierId: string) => void;
  confirmDispatch: () => void;
}

export const useSlaQueueStore = create<SlaQueueState>((set, get) => ({
  // ── Initial Data ──
  packages: DUMMY_PACKAGES,
  couriers: DUMMY_COURIERS,
  metrics: DUMMY_HUB_METRICS,

  // ── Initial UI State ──
  currentPage: 1,
  searchQuery: '',
  serviceFilter: 'ALL',
  isCriticalFilterActive: false,
  alertDismissed: false,

  // ── Initial Modal State ──
  selectedPackage: null,
  selectedCourierId: null,
  isModalOpen: false,

  // ── Computed: Sorted & Filtered Packages ──
  getSortedFilteredPackages: () => {
    const { packages, searchQuery, serviceFilter, isCriticalFilterActive } = get();

    let filtered = [...packages];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.tracking_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply service type filter
    if (serviceFilter !== 'ALL') {
      filtered = filtered.filter((p) => p.service_type === serviceFilter);
    }

    // Apply critical filter (priority + critical only)
    if (isCriticalFilterActive) {
      filtered = filtered.filter(
        (p) => p.is_priority || p.severity_zone === 'CRITICAL'
      );
    }

    // Sort: is_priority DESC → remaining_minutes ASC (FRD BR-03.2.1)
    filtered.sort((a, b) => {
      if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1;
      return a.remaining_minutes - b.remaining_minutes;
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
    const sorted = get().getSortedFilteredPackages();
    return Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  },

  // ── Toggle Priority (BR-03.3.1) ──
  togglePriority: (tracking_id) => {
    set((state) => ({
      packages: state.packages.map((p) =>
        p.tracking_id === tracking_id ? { ...p, is_priority: !p.is_priority } : p
      ),
      currentPage: 1, // reset to page 1 after re-sort
    }));
  },

  // ── Toggle Critical Filter (BR-03.3.2) ──
  toggleCriticalFilter: () => {
    set((state) => ({
      isCriticalFilterActive: !state.isCriticalFilterActive,
      currentPage: 1,
    }));
  },

  // ── Pagination ──
  setPage: (page) => set({ currentPage: page }),

  // ── Search ──
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  // ── Service Filter ──
  setServiceFilter: (filter) => set({ serviceFilter: filter, currentPage: 1 }),

  // ── Dismiss Capacity Alert ──
  dismissAlert: () => set({ alertDismissed: true }),

  // ── Refresh Queue (re-enable alert) ──
  refreshQueue: () =>
    set({
      alertDismissed: false,
      currentPage: 1,
      searchQuery: '',
      serviceFilter: 'ALL',
      isCriticalFilterActive: false,
    }),

  // ── Modal: Open ──
  openDispatchModal: (pkg) =>
    set({ selectedPackage: pkg, isModalOpen: true, selectedCourierId: null }),

  // ── Modal: Close ──
  closeDispatchModal: () =>
    set({ isModalOpen: false, selectedPackage: null, selectedCourierId: null }),

  // ── Modal: Select Courier ──
  selectCourier: (courierId) => set({ selectedCourierId: courierId }),

  // ── Modal: Confirm Dispatch (BR-03.4.2 & BR-03.4.3) ──
  confirmDispatch: () => {
    const { selectedPackage, selectedCourierId, packages, metrics } = get();
    if (!selectedPackage || !selectedCourierId) return;

    // Remove package from queue & release 1 hub slot
    set({
      packages: packages.filter((p) => p.tracking_id !== selectedPackage.tracking_id),
      metrics: {
        ...metrics,
        in_hub_count: metrics.in_hub_count - 1,
        total_load: metrics.total_load - 1,
        capacity_percentage: parseFloat(
          (((metrics.total_load - 1) / metrics.max_capacity) * 100).toFixed(1)
        ),
      },
      isModalOpen: false,
      selectedPackage: null,
      selectedCourierId: null,
      currentPage: 1,
    });
  },
}));
