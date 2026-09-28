import { create } from 'zustand';
import type { OutboundBatch, HubPackage, Courier, DispatchStatus } from '../types/hub';
import { useHubStore } from './useHubStore';

const ITEMS_PER_PAGE = 4;

interface OutboundStats {
  active_couriers: number;
  ready_to_depart: number;
  ready_to_depart_packages: number;
  in_delivery: number;
  in_delivery_packages: number;
}

interface OutboundState {
  batches: OutboundBatch[];
  stats: OutboundStats;
  currentPage: number;
  searchQuery: string;

  isModalOpen: boolean;
  availableCouriers: Courier[];
  selectedCourierId: string | null;
  availablePackages: HubPackage[];
  selectedPackageIds: string[];
  packageSearchQuery: string;
  packageServiceFilter: 'ALL' | 'SAME_DAY' | 'NEXT_DAY' | 'REGULAR';

  getSortedFilteredBatches: () => OutboundBatch[];
  getPaginatedBatches: () => OutboundBatch[];
  getTotalPages: () => number;
  getFilteredAvailablePackages: () => HubPackage[];

  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  departBatch: (manifestCode: string) => void;
  completeBatch: (manifestCode: string) => void;

  openModal: () => void;
  closeModal: () => void;
  selectCourier: (id: string) => void;
  togglePackageSelection: (id: string) => void;
  selectAllPackages: () => void;
  selectAllPriorityPackages: () => void;
  setPackageSearchQuery: (query: string) => void;
  setPackageServiceFilter: (filter: 'ALL' | 'SAME_DAY' | 'NEXT_DAY' | 'REGULAR') => void;
  confirmCreateBatch: () => void;

  // Sync actions — called by useHubStore
  addBatch: (batch: OutboundBatch) => void;
  updateBatchStatus: (code: string, status: DispatchStatus) => void;
  syncAvailablePackages: (packages: HubPackage[]) => void;
}

const buildStats = (batches: OutboundBatch[]): OutboundStats => {
  const couriers = useHubStore.getState().couriers;
  return {
    active_couriers: couriers.filter((c) => c.status !== 'OFFLINE').length,
    ready_to_depart: batches.filter((b) => b.status === 'SIAP_BERANGKAT').length,
    ready_to_depart_packages: batches.filter((b) => b.status === 'SIAP_BERANGKAT').reduce((s, b) => s + b.total_packages, 0),
    in_delivery: batches.filter((b) => b.status === 'DALAM_PENGANTARAN').length,
    in_delivery_packages: batches.filter((b) => b.status === 'DALAM_PENGANTARAN').reduce((s, b) => s + b.total_packages, 0),
  };
};

const seedBatches = useHubStore.getState().outboundBatches;
const seedHubPackages = useHubStore.getState().hubPackages.filter((p) => p.status === 'IN_HUB');
const seedCouriers = useHubStore.getState().couriers;

export const useOutboundStore = create<OutboundState>((set, get) => ({
  batches: seedBatches,
  stats: buildStats(seedBatches),
  currentPage: 1,
  searchQuery: '',
  isModalOpen: false,
  availableCouriers: seedCouriers,
  selectedCourierId: null,
  availablePackages: seedHubPackages,
  selectedPackageIds: [],
  packageSearchQuery: '',
  packageServiceFilter: 'ALL',

  getSortedFilteredBatches: () => {
    const { batches, searchQuery } = get();
    let filtered = [...batches];
    if (searchQuery.trim()) {
      const lq = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) => b.manifest_code.toLowerCase().includes(lq) || b.courier_name.toLowerCase().includes(lq)
      );
    }
    const order: Record<DispatchStatus, number> = { SIAP_BERANGKAT: 1, DALAM_PENGANTARAN: 2, SELESAI: 3 };
    filtered.sort((a, b) => order[a.status] - order[b.status]);
    return filtered;
  },

  getPaginatedBatches: () => {
    const sorted = get().getSortedFilteredBatches();
    const start = (get().currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  },

  getTotalPages: () => Math.max(1, Math.ceil(get().getSortedFilteredBatches().length / ITEMS_PER_PAGE)),

  getFilteredAvailablePackages: () => {
    const { availablePackages, packageSearchQuery, packageServiceFilter } = get();
    let filtered = [...availablePackages];
    
    if (packageServiceFilter !== 'ALL') {
      filtered = filtered.filter((p) => p.service_type === packageServiceFilter);
    }
    
    if (packageSearchQuery.trim()) {
      const lq = packageSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.tracking_id.toLowerCase().includes(lq) || p.destination_area.toLowerCase().includes(lq)
      );
    }

    // Urutkan berdasarkan sisa waktu SLA terdikit terlebih dahulu
    filtered.sort((a, b) => {
      if (a.remaining_minutes !== b.remaining_minutes) {
        return a.remaining_minutes - b.remaining_minutes;
      }
      return a.is_priority ? -1 : 1;
    });

    return filtered;
  },

  setPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  departBatch: (manifestCode) => {
    useHubStore.getState().departBatch(manifestCode);
  },

  completeBatch: (manifestCode) => {
    useHubStore.getState().completeBatch(manifestCode);
  },

  openModal: () => {
    const couriers = useHubStore.getState().couriers.filter(c => c.status === 'STANDBY');
    set({ 
      isModalOpen: true, 
      selectedCourierId: null, 
      selectedPackageIds: [], 
      packageSearchQuery: '',
      availableCouriers: couriers
    });
  },
  closeModal: () => set({ isModalOpen: false }),
  selectCourier: (id) => set({ selectedCourierId: id }),
  setPackageSearchQuery: (query) => set({ packageSearchQuery: query }),

  togglePackageSelection: (id) => {
    set((state) => ({
      selectedPackageIds: state.selectedPackageIds.includes(id)
        ? state.selectedPackageIds.filter((p) => p !== id)
        : [...state.selectedPackageIds, id],
    }));
  },

  selectAllPackages: () => {
    set((state) => {
      const filteredIds = state.getFilteredAvailablePackages().map((p) => p.tracking_id);
      const allSelected = filteredIds.every((id) => state.selectedPackageIds.includes(id));
      return { selectedPackageIds: allSelected ? [] : filteredIds };
    });
  },

  selectAllPriorityPackages: () => {
    set((state) => {
      const priorityIds = state.getFilteredAvailablePackages()
        .filter((p) => p.is_priority || p.severity_zone === 'CRITICAL')
        .map((p) => p.tracking_id);
      
      if (priorityIds.length === 0) return state;

      const newSelections = Array.from(new Set([...state.selectedPackageIds, ...priorityIds]));
      return { selectedPackageIds: newSelections };
    });
  },

  setPackageServiceFilter: (filter) => set({ packageServiceFilter: filter }),

  confirmCreateBatch: () => {
    const { selectedCourierId, selectedPackageIds } = get();
    if (!selectedCourierId || selectedPackageIds.length === 0) return;
    useHubStore.getState().createOutboundBatch(selectedCourierId, selectedPackageIds);
    set({ isModalOpen: false, selectedCourierId: null, selectedPackageIds: [], packageSearchQuery: '' });
  },

  // ── Sync actions (called by useHubStore) ──
  addBatch: (batch) =>
    set((state) => {
      const newBatches = [batch, ...state.batches];
      return { batches: newBatches, stats: buildStats(newBatches), currentPage: 1 };
    }),

  updateBatchStatus: (code, status) =>
    set((state) => {
      const newBatches = state.batches.map((b) => (b.manifest_code === code ? { ...b, status } : b));
      return { batches: newBatches, stats: buildStats(newBatches) };
    }),

  syncAvailablePackages: (packages) => set({ availablePackages: packages }),
}));
