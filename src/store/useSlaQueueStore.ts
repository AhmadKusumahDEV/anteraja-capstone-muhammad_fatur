import { create } from 'zustand';
import type { HubPackage, Courier } from '../types/hub';
import type { ServiceFilter } from '../types/sla-queue';
import { calcRemainingMs, calcSeverityZone } from '../utils/sla';
import api from '../services/api';
import { useHubStore } from './useHubStore';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 6;

interface SlaQueueState {
  packages: HubPackage[];
  couriers: Courier[];
  currentPage: number;
  searchQuery: string;
  serviceFilter: ServiceFilter;
  isCriticalFilterActive: boolean;
  alertDismissed: boolean;
  selectedPackage: HubPackage | null;
  selectedCourierId: string | null;
  isModalOpen: boolean;
  isLoading: boolean;
  isDispatching: boolean;

  // Selectors
  getSortedFilteredPackages: () => HubPackage[];
  getPaginatedPackages: () => HubPackage[];
  getTotalPages: () => number;

  // Actions
  setPackages: (packages: HubPackage[]) => void;
  fetchQueue: () => Promise<void>;
  togglePriority: (tracking_id: string) => Promise<void>;
  updatePackagePriorityLocally: (tracking_id: string, is_priority: boolean) => void;
  toggleCriticalFilter: () => void;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setServiceFilter: (filter: ServiceFilter) => void;
  dismissAlert: () => void;
  refreshQueue: () => Promise<void>;

  // Modal / Dispatch
  openDispatchModal: (pkg: HubPackage) => Promise<void>;
  closeDispatchModal: () => void;
  selectCourier: (courierId: string) => void;
  confirmDispatch: () => Promise<void>;
}

export const useSlaQueueStore = create<SlaQueueState>((set, get) => ({
  packages: useHubStore.getState().hubPackages.filter(p => p.status === 'IN_HUB'),
  couriers: [],
  currentPage: 1,
  searchQuery: '',
  serviceFilter: 'ALL',
  isCriticalFilterActive: false,
  alertDismissed: false,
  selectedPackage: null,
  selectedCourierId: null,
  isModalOpen: false,
  isLoading: false,
  isDispatching: false,

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
      filtered = filtered.filter((p) => {
        const remaining = calcRemainingMs(p.sla_deadline);
        const zone = calcSeverityZone(remaining);
        return p.is_priority || zone === 'CRITICAL';
      });
    }
    filtered.sort((a, b) => {
      // Prioritaskan SLA yang paling sedikit/kritis terlebih dahulu (Ascending)
      const remainingA = calcRemainingMs(a.sla_deadline);
      const remainingB = calcRemainingMs(b.sla_deadline);
      
      if (remainingA !== remainingB) {
        return remainingA - remainingB;
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

  setPackages: (packages) => set({ packages }),

  fetchQueue: async () => {
    set({ isLoading: true });
    try {
      // Endpoint 1: Ambil semua paket IN_HUB
      const response = await api.get('/sla-queue/packages');
      if (response.data.success) {
        set({ packages: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch SLA queue:', error);
      // Fallback ke data dummy dari useHubStore jika API belum ready
      const dummyPackages = useHubStore.getState().hubPackages.filter(p => p.status === 'IN_HUB');
      set({ packages: dummyPackages });
    } finally {
      set({ isLoading: false });
    }
  },

  togglePriority: async (tracking_id) => {
    // 1. Optimistic update
    const previousPackages = get().packages;
    set((state) => ({
      packages: state.packages.map((p) =>
        p.tracking_id === tracking_id ? { ...p, is_priority: !p.is_priority } : p
      ),
      currentPage: 1, // Optional: reset ke halaman pertama biar kelihatan
    }));

    try {
      // 2. API Call
      await api.patch(`/packages/${tracking_id}/priority`);
    } catch (error) {
      // 3. Rollback on failure
      set({ packages: previousPackages });
      toast.error('Gagal memperbarui prioritas. Perubahan dibatalkan.');
      console.error('Failed to toggle priority:', error);
    }
  },
  
  updatePackagePriorityLocally: (tracking_id, is_priority) => {
    set((state) => ({
      packages: state.packages.map((p) =>
        p.tracking_id === tracking_id ? { ...p, is_priority } : p
      ),
    }));
  },

  toggleCriticalFilter: () => set((state) => ({ isCriticalFilterActive: !state.isCriticalFilterActive, currentPage: 1 })),
  setPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setServiceFilter: (filter) => set({ serviceFilter: filter, currentPage: 1 }),
  dismissAlert: () => set({ alertDismissed: true }),
  
  refreshQueue: async () => {
    set({ alertDismissed: false, currentPage: 1, searchQuery: '', serviceFilter: 'ALL', isCriticalFilterActive: false });
    await get().fetchQueue();
    // Also refresh capacity if needed
    // This could be dispatched to useHubStore, but let's keep it simple
  },

  openDispatchModal: async (pkg) => {
    set({ selectedPackage: pkg, isModalOpen: true, selectedCourierId: null, couriers: [] });
    try {
      const response = await api.get('/hubs/couriers/standby');
      if (response.data.success) {
        set({ couriers: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch couriers:', error);
      toast.error('Gagal mengambil daftar kurir.');
    }
  },
  
  closeDispatchModal: () => set({ isModalOpen: false, selectedPackage: null, selectedCourierId: null }),
  selectCourier: (courierId) => set({ selectedCourierId: courierId }),

  confirmDispatch: async () => {
    const { selectedPackage, selectedCourierId } = get();
    if (!selectedPackage || !selectedCourierId) return;

    set({ isDispatching: true });
    try {
      const payload = {
        courier_id: selectedCourierId,
        package_ids: [selectedPackage.tracking_id]
      };
      const response = await api.post('/outbound/dispatch', payload);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Paket berhasil diberangkatkan.');
        
        // Remove dispatched package from local SLA queue state
        set((state) => ({
          packages: state.packages.filter(p => p.tracking_id !== selectedPackage.tracking_id),
          isModalOpen: false,
          selectedPackage: null,
          selectedCourierId: null,
          currentPage: 1
        }));
        
        // Let's re-fetch the queue and hub capacity to be perfectly synced
        // Or we could rely on optimistic update if we want it to be instantaneous
      }
    } catch (error: any) {
      console.error('Failed to dispatch package:', error);
      toast.error(error.response?.data?.message || 'Gagal memberangkatkan paket.');
    } finally {
      set({ isDispatching: false });
    }
  },
}));
