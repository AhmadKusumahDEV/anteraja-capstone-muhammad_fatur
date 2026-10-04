import { create } from 'zustand';
import type { OutboundBatch, HubPackage, Courier, DispatchStatus } from '../types/hub';
import { useHubStore } from './useHubStore';
import { useSlaQueueStore } from './useSlaQueueStore';
import { useAuthStore } from './useAuthStore';
import { calcRemainingMs, calcSeverityZone } from '../utils/sla';
import api from '../services/api';
import toast from 'react-hot-toast';

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
  availablePackages: HubPackage[];
  selectedCourierId: string | null;
  selectedPackageIds: string[];
  packageSearchQuery: string;
  packageServiceFilter: 'ALL' | 'SAME_DAY' | 'NEXT_DAY' | 'REGULAR';
  isLoading: boolean;
  isSubmitting: boolean;

  getSortedFilteredBatches: () => OutboundBatch[];
  getPaginatedBatches: () => OutboundBatch[];
  getTotalPages: () => number;
  getFilteredAvailablePackages: () => HubPackage[];

  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  fetchBatches: () => Promise<void>;
  departBatch: (manifestCode: string) => Promise<void>;
  completeBatch: (manifestCode: string) => Promise<void>;

  openModal: () => Promise<void>;
  closeModal: () => void;
  selectCourier: (id: string) => void;
  togglePackageSelection: (id: string) => void;
  selectAllPackages: () => void;
  selectAllPriorityPackages: () => void;
  setPackageSearchQuery: (query: string) => void;
  setPackageServiceFilter: (filter: 'ALL' | 'SAME_DAY' | 'NEXT_DAY' | 'REGULAR') => void;
  confirmCreateBatch: () => Promise<void>;

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
  isLoading: false,
  isSubmitting: false,

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
      const remainingA = calcRemainingMs(a.sla_deadline);
      const remainingB = calcRemainingMs(b.sla_deadline);
      if (remainingA !== remainingB) {
        return remainingA - remainingB;
      }
      return a.is_priority ? -1 : 1;
    });

    return filtered;
  },

  setPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  fetchBatches: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/outbound/manifests');
      if (data.success) {
        set({ batches: data.data, stats: buildStats(data.data) });
      }
    } catch (error) {
      console.error('Failed to fetch outbound batches:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  departBatch: async (manifestCode) => {
    try {
      await api.patch(`/outbound/${manifestCode}/depart`);
      toast.success('Batch diberangkatkan!');
      // Sequential update
      get().updateBatchStatus(manifestCode, 'DALAM_PENGANTARAN');
      
      // Refresh capacity
      const user = useAuthStore.getState().user;
      if (user?.hub_id) useHubStore.getState().fetchHubCapacity(user.hub_id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memberangkatkan batch');
    }
  },

  completeBatch: async (manifestCode) => {
    try {
      await api.patch(`/outbound/${manifestCode}/complete`);
      toast.success('Batch selesai!');
      // Sequential update
      get().updateBatchStatus(manifestCode, 'SELESAI');
      
      // Jika ada paket baru di Hub yang diantar kembali / kurir menjadi standby
      // Kurir menjadi STANDBY kembali, jadi tidak perlu refetch standby courier di sini 
      // (akan difetch ulang saat modal dibuka)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyelesaikan batch');
    }
  },

  openModal: async () => {
    // Ambil paket IN_HUB secara reaktif dari useSlaQueueStore 
    // agar tidak perlu fetch API paket lagi (hemat bandwidth)
    const currentHubPackages = useSlaQueueStore.getState().packages;

    set({ 
      isModalOpen: true, 
      selectedCourierId: null, 
      selectedPackageIds: [], 
      packageSearchQuery: '',
      availablePackages: currentHubPackages,
      availableCouriers: [], // Reset sementara sebelum fetch
      isLoading: true
    });

    try {
      const { data } = await api.get('/hubs/couriers/standby');
      if (data.success) {
        set({ availableCouriers: data.data });
      }
    } catch (err) {
      console.error('Failed to fetch standby couriers:', err);
      // Fallback ke dummy jika backend belum siap
      const dummyCouriers = useHubStore.getState().couriers.filter(c => c.status === 'STANDBY');
      set({ availableCouriers: dummyCouriers });
    } finally {
      set({ isLoading: false });
    }
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
        .filter((p) => {
          const remaining = calcRemainingMs(p.sla_deadline);
          const zone = calcSeverityZone(remaining);
          return p.is_priority || zone === 'CRITICAL';
        })
        .map((p) => p.tracking_id);
      
      if (priorityIds.length === 0) return state;

      const newSelections = Array.from(new Set([...state.selectedPackageIds, ...priorityIds]));
      return { selectedPackageIds: newSelections };
    });
  },

  setPackageServiceFilter: (filter) => set({ packageServiceFilter: filter }),

  confirmCreateBatch: async () => {
    const { selectedCourierId, selectedPackageIds } = get();
    if (!selectedCourierId || selectedPackageIds.length === 0) return;
    
    set({ isSubmitting: true });
    try {
      const { data } = await api.post('/outbound/dispatch', {
        courier_id: selectedCourierId,
        package_ids: selectedPackageIds,
      });
      
      if (data.success) {
        toast.success(data.message || 'Batch berhasil dibuat!');
        const newManifest = data.data;

        // Push ke list batches frontend (Optimistic / cache manual)
        get().addBatch({
          manifest_code: newManifest.manifest_code,
          courier_id: newManifest.courier_id,
          courier_name: newManifest.courier_name,
          total_packages: newManifest.total_packages,
          status: newManifest.status,
          package_ids: selectedPackageIds,
          created_at: new Date().toISOString()
        });
        
        // Bersihkan state modal
        set({ isModalOpen: false, selectedCourierId: null, selectedPackageIds: [], packageSearchQuery: '' });

        // Wajib Sinkronisasi Ulang
        // 1. Refresh SLA Queue (paket tadi otomatis hilang karena bukan IN_HUB lagi)
        useSlaQueueStore.getState().fetchQueue();
        
        // 2. Refresh Capacity (current_load berkurang)
        const user = useAuthStore.getState().user;
        if (user?.hub_id) {
          useHubStore.getState().fetchHubCapacity(user.hub_id);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat batch.');
      // Refetch SLA & Couriers jaga-jaga kalau error validasi data basi
      useSlaQueueStore.getState().fetchQueue();
      get().openModal(); // Akan re-fetch couriers standby
    } finally {
      set({ isSubmitting: false });
    }
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
