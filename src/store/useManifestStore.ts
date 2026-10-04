import { create } from 'zustand';
import type { Hub, ManifestLogEntry } from '../types/hub';
import { useHubStore } from './useHubStore';

const ITEMS_PER_PAGE = 10;

const generateDraftCode = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MNF-INB-${yyyy}${mm}${dd}-${rand}`;
};

interface ManifestState {
  hubs: Hub[];
  manifests: ManifestLogEntry[];

  selectedHubId: string | number | null;
  originHubId: string | null;
  packageCount: number;
  etaOffsetMins: number;
  customManifestCode: string;

  searchQuery: string;
  hubFilter: string;
  currentPage: number;

  isDetailOpen: boolean;
  selectedManifest: ManifestLogEntry | null;

  getVehicleType: (count: number) => string;
  getSelectedHub: () => Hub | undefined;
  getFilteredManifests: () => ManifestLogEntry[];
  getPaginatedManifests: () => ManifestLogEntry[];
  getTotalPages: () => number;
  generateDraftCode: () => string;

  setSelectedHub: (id: string | number | null) => void;
  setOriginHub: (id: string | null) => void;
  setCustomManifestCode: (code: string) => void;
  setPackageCount: (count: number) => void;
  setEtaOffsetMins: (mins: number) => void;
  resetForm: () => void;
  submitManifest: () => void;

  setSearchQuery: (query: string) => void;
  setHubFilter: (hubCode: string) => void;
  setPage: (page: number) => void;

  openDetail: (manifest: ManifestLogEntry) => void;
  closeDetail: () => void;

  // Sync action — called by useHubStore
  addLog: (log: ManifestLogEntry) => void;
  fetchManifests: () => Promise<void>;
}

export const useManifestStore = create<ManifestState>((set, get) => ({
  hubs: useHubStore.getState().hubs,
  manifests: useHubStore.getState().manifestLogs,
  selectedHubId: 1, // Fixed to HUB-JKS-01 by default
  originHubId: '', // Default kosong (Acak)
  packageCount: 25,
  etaOffsetMins: 15, // Default ETA: +15 minutes
  customManifestCode: generateDraftCode(),
  searchQuery: '',
  hubFilter: 'ALL',
  currentPage: 1,
  isDetailOpen: false,
  selectedManifest: null,

  getVehicleType: (count) => {
    if (count < 30) return 'Blind Van (CDE)';
    if (count <= 50) return 'Colt Diesel (CDD)';
    return 'Wingbox Truck';
  },

  getSelectedHub: () => {
    const { selectedHubId } = get();
    // Use hubs from useHubStore to get the freshest data from API
    const hubs = useHubStore.getState().hubs;
    return hubs.find((h) => h.id === selectedHubId);
  },

  getFilteredManifests: () => {
    const { manifests, searchQuery, hubFilter } = get();
    let filtered = [...manifests];
    if (hubFilter !== 'ALL') {
      filtered = filtered.filter((m) => m.destination_hub_code === hubFilter);
    }
    if (searchQuery.trim()) {
      const lq = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.manifest_code.toLowerCase().includes(lq) ||
          m.destination_hub_name.toLowerCase().includes(lq)
      );
    }
    return filtered;
  },

  getPaginatedManifests: () => {
    const sorted = get().getFilteredManifests();
    const start = (get().currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  },

  getTotalPages: () => Math.max(1, Math.ceil(get().getFilteredManifests().length / ITEMS_PER_PAGE)),

  generateDraftCode,

  setSelectedHub: (id) => set({ selectedHubId: id }),
  setOriginHub: (id) => set({ originHubId: id }),
  setCustomManifestCode: (code) => set({ customManifestCode: code }),
  setPackageCount: (count) => set({ packageCount: count }),
  setEtaOffsetMins: (mins) => set({ etaOffsetMins: mins }),
  resetForm: () => set({ selectedHubId: 1, originHubId: '', packageCount: 25, etaOffsetMins: 15, customManifestCode: generateDraftCode() }),

  // Delegates to global hub store — which then syncs back via addLog
  submitManifest: () => {
    const { selectedHubId, packageCount, etaOffsetMins } = get();
    if (!selectedHubId) {
      alert('Pilih Hub Tujuan terlebih dahulu.');
      return;
    }
    useHubStore.getState().submitManifest(packageCount, etaOffsetMins);
    set({ selectedHubId: 1, originHubId: '', packageCount: 25, etaOffsetMins: 15, customManifestCode: generateDraftCode(), currentPage: 1 });
  },

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setHubFilter: (hubCode) => set({ hubFilter: hubCode, currentPage: 1 }),
  setPage: (page) => set({ currentPage: page }),

  openDetail: (manifest) => set({ isDetailOpen: true, selectedManifest: manifest }),
  closeDetail: () => set({ isDetailOpen: false, selectedManifest: null }),

  // ── Sync action (called by useHubStore) ──
  addLog: (log) =>
    set((state) => ({ manifests: [log, ...state.manifests], currentPage: 1 })),

  fetchManifests: async () => {
    try {
      const api = (await import('../services/api')).default;
      const { data } = await api.get('/manifests');
      if (data.success && data.data?.items) {
        const logs: ManifestLogEntry[] = data.data.items.map((item: any) => ({
          manifest_code: item.manifest_code,
          destination_hub_code: item.destination_hub_code,
          destination_hub_name: item.destination_hub_name,
          total_packages: item.total_packages,
          vehicle_type: item.vehicle_type,
          created_at: item.created_at,
          hub_color: 'bg-blue-500',
          packages: [],
        }));
        set({ manifests: logs });
        // Sinkronisasi juga ke HubStore
        import('./useHubStore').then((m) => {
          m.useHubStore.getState().setManifestLogs(logs);
        });
      }
    } catch (err) {
      console.error('[ManifestGenerator] Failed to fetch manifests:', err);
    }
  },
}));
