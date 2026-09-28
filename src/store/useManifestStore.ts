import { create } from 'zustand';
import type { Hub, ManifestLogEntry } from '../types/hub';
import { useHubStore } from './useHubStore';

const ITEMS_PER_PAGE = 10;

interface ManifestState {
  hubs: Hub[];
  manifests: ManifestLogEntry[];

  selectedHubId: number | null;
  packageCount: number;
  etaOffsetMins: number;
  draftManifestCode: string;

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

  setSelectedHub: (id: number | null) => void;
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
}

export const useManifestStore = create<ManifestState>((set, get) => ({
  hubs: useHubStore.getState().hubs,
  manifests: useHubStore.getState().manifestLogs,
  selectedHubId: 1, // Fixed to HUB-JKS-01 by default
  packageCount: 25,
  etaOffsetMins: 15, // Default ETA: +15 minutes
  draftManifestCode: `MNF-2409-${Math.floor(1000 + Math.random() * 9000)}`,
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
    const { hubs, selectedHubId } = get();
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

  generateDraftCode: () => `MNF-2409-${Math.floor(1000 + Math.random() * 9000)}`,

  setSelectedHub: (id) => set({ selectedHubId: id, draftManifestCode: get().generateDraftCode() }),
  setPackageCount: (count) => set({ packageCount: count }),
  setEtaOffsetMins: (mins) => set({ etaOffsetMins: mins }),
  resetForm: () => set({ selectedHubId: 1, packageCount: 25, etaOffsetMins: 15, draftManifestCode: get().generateDraftCode() }),

  // Delegates to global hub store — which then syncs back via addLog
  submitManifest: () => {
    const { selectedHubId, packageCount, etaOffsetMins } = get();
    if (!selectedHubId) {
      alert('Pilih Hub Tujuan terlebih dahulu.');
      return;
    }
    useHubStore.getState().submitManifest(packageCount, etaOffsetMins);
    set({ selectedHubId: 1, packageCount: 25, etaOffsetMins: 15, draftManifestCode: get().generateDraftCode(), currentPage: 1 });
  },

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setHubFilter: (hubCode) => set({ hubFilter: hubCode, currentPage: 1 }),
  setPage: (page) => set({ currentPage: page }),

  openDetail: (manifest) => set({ isDetailOpen: true, selectedManifest: manifest }),
  closeDetail: () => set({ isDetailOpen: false, selectedManifest: null }),

  // ── Sync action (called by useHubStore) ──
  addLog: (log) =>
    set((state) => ({ manifests: [log, ...state.manifests], currentPage: 1 })),
}));
