import { create } from 'zustand';
import { DUMMY_DISPATCH_BATCHES, DUMMY_OUTBOUND_STATS, DUMMY_AVAILABLE_COURIERS } from '../data/outbound-dummy';
import type { DispatchBatch, OutboundStats } from '../types/outbound';
import type { Courier, Package } from '../types/sla-queue';
import { DUMMY_PACKAGES } from '../data/sla-queue-dummy';

const ITEMS_PER_PAGE = 4;

interface OutboundState {
  // Data
  batches: DispatchBatch[];
  stats: OutboundStats;
  
  // UI State
  currentPage: number;
  searchQuery: string;
  
  // Modal State
  isModalOpen: boolean;
  availableCouriers: Courier[];
  selectedCourierId: string | null;
  availablePackages: Package[]; // Packages in Hub ready for dispatch
  selectedPackageIds: string[];
  packageSearchQuery: string;

  // Computed: Board
  getSortedFilteredBatches: () => DispatchBatch[];
  getPaginatedBatches: () => DispatchBatch[];
  getTotalPages: () => number;

  // Computed: Modal
  getFilteredAvailablePackages: () => Package[];

  // Actions: Board
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  departBatch: (manifestCode: string) => void;
  completeBatch: (manifestCode: string) => void;
  
  // Actions: Modal
  openModal: () => void;
  closeModal: () => void;
  selectCourier: (id: string) => void;
  togglePackageSelection: (id: string) => void;
  selectAllPackages: () => void;
  setPackageSearchQuery: (query: string) => void;
  confirmCreateBatch: () => void;
}

export const useOutboundStore = create<OutboundState>((set, get) => ({
  batches: DUMMY_DISPATCH_BATCHES,
  stats: DUMMY_OUTBOUND_STATS,
  
  currentPage: 1,
  searchQuery: '',

  isModalOpen: false,
  availableCouriers: DUMMY_AVAILABLE_COURIERS,
  selectedCourierId: null,
  availablePackages: DUMMY_PACKAGES.filter(p => p.status === 'IN_HUB'),
  selectedPackageIds: [],
  packageSearchQuery: '',

  // --- Computed: Board ---
  getSortedFilteredBatches: () => {
    const { batches, searchQuery } = get();
    let filtered = [...batches];

    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.manifest_code.toLowerCase().includes(lowerQ) ||
          b.courier_name.toLowerCase().includes(lowerQ)
      );
    }

    // Sort: SIAP_BERANGKAT > DALAM_PENGANTARAN > SELESAI
    const order = { SIAP_BERANGKAT: 1, DALAM_PENGANTARAN: 2, SELESAI: 3 };
    filtered.sort((a, b) => order[a.status] - order[b.status]);

    return filtered;
  },

  getPaginatedBatches: () => {
    const sorted = get().getSortedFilteredBatches();
    const start = (get().currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  },

  getTotalPages: () => {
    return Math.max(1, Math.ceil(get().getSortedFilteredBatches().length / ITEMS_PER_PAGE));
  },

  // --- Actions: Board ---
  setPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  departBatch: (manifestCode) => {
    set((state) => {
      const batch = state.batches.find((b) => b.manifest_code === manifestCode);
      if (!batch) return state;

      return {
        batches: state.batches.map((b) =>
          b.manifest_code === manifestCode ? { ...b, status: 'DALAM_PENGANTARAN' } : b
        ),
        stats: {
          ...state.stats,
          ready_to_depart: state.stats.ready_to_depart - 1,
          ready_to_depart_packages: state.stats.ready_to_depart_packages - batch.total_packages,
          in_delivery: state.stats.in_delivery + 1,
          in_delivery_packages: state.stats.in_delivery_packages + batch.total_packages,
        },
      };
    });
    // Simulate Capacity Release (BR-04.2)
    // alert(`Kapasitas Hub telah dikurangi sebanyak ${batch.total_packages} paket.`); 
  },

  completeBatch: (manifestCode) => {
    set((state) => {
      const batch = state.batches.find((b) => b.manifest_code === manifestCode);
      if (!batch) return state;

      return {
        batches: state.batches.map((b) =>
          b.manifest_code === manifestCode ? { ...b, status: 'SELESAI' } : b
        ),
        stats: {
          ...state.stats,
          in_delivery: state.stats.in_delivery - 1,
          in_delivery_packages: state.stats.in_delivery_packages - batch.total_packages,
        },
      };
    });
  },

  // --- Computed: Modal ---
  getFilteredAvailablePackages: () => {
    const { availablePackages, packageSearchQuery } = get();
    let filtered = [...availablePackages];

    if (packageSearchQuery.trim()) {
      const lowerQ = packageSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.tracking_id.toLowerCase().includes(lowerQ) ||
          p.destination_area.toLowerCase().includes(lowerQ)
      );
    }
    return filtered;
  },

  // --- Actions: Modal ---
  openModal: () => set({ isModalOpen: true, selectedCourierId: null, selectedPackageIds: [], packageSearchQuery: '' }),
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
      
      return {
        selectedPackageIds: allSelected 
          ? [] // deselect all
          : filteredIds // select all filtered
      };
    });
  },

  confirmCreateBatch: () => {
    const { selectedCourierId, selectedPackageIds, availableCouriers, batches, stats } = get();
    if (!selectedCourierId || selectedPackageIds.length === 0) return;

    const courier = availableCouriers.find((c) => c.id === selectedCourierId);
    if (!courier) return;

    const newManifestCode = `MNF-OUT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const packageCount = selectedPackageIds.length;

    const newBatch: DispatchBatch = {
      manifest_code: newManifestCode,
      courier_name: courier.name,
      courier_id: courier.id,
      total_packages: packageCount,
      status: 'SIAP_BERANGKAT',
    };

    set({
      batches: [newBatch, ...batches],
      stats: {
        ...stats,
        ready_to_depart: stats.ready_to_depart + 1,
        ready_to_depart_packages: stats.ready_to_depart_packages + packageCount,
      },
      isModalOpen: false,
    });
    
    alert(`Batch Dispatch ${newManifestCode} berhasil dibuat untuk ${courier.name} dengan ${packageCount} paket.`);
  },

}));
