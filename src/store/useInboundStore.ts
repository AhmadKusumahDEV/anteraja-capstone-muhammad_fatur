import { create } from 'zustand';
import type { InboundManifest, InboundManifestStatus } from '../types/hub';
import { useHubStore } from './useHubStore';

const ITEMS_PER_PAGE = 7;

interface InboundState {
  manifests: InboundManifest[];
  currentPage: number;

  getPaginatedManifests: () => InboundManifest[];
  getTotalPages: () => number;

  setPage: (page: number) => void;
  acknowledgeManifest: (manifestCode: string, _totalPackages: number) => void;

  // Sync actions — called by useHubStore
  addManifest: (manifest: InboundManifest) => void;
  updateManifestStatus: (code: string, status: InboundManifestStatus) => void;
  updateManifestEta: (code: string, etaMs: number) => void;

  confirmingManifest: InboundManifest | null;
  openConfirmModal: (manifest: InboundManifest) => void;
  closeConfirmModal: () => void;
}

export const useInboundStore = create<InboundState>((set, get) => ({
  // Initialize with hub store seed data
  manifests: useHubStore.getState().inboundManifests,
  currentPage: 1,

  getPaginatedManifests: () => {
    const { manifests, currentPage } = get();
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return manifests.slice(start, start + ITEMS_PER_PAGE);
  },

  getTotalPages: () => {
    return Math.max(1, Math.ceil(get().manifests.length / ITEMS_PER_PAGE));
  },

  setPage: (page) => set({ currentPage: page }),

  confirmingManifest: null,
  openConfirmModal: (manifest) => set({ confirmingManifest: manifest }),
  closeConfirmModal: () => set({ confirmingManifest: null }),

  // Delegates to global hub store
  acknowledgeManifest: (manifestCode, _totalPackages) => {
    useHubStore.getState().acknowledgeManifest(manifestCode);
  },

  // ── Sync actions (called by useHubStore) ──
  addManifest: (manifest) =>
    set((state) => ({ manifests: [manifest, ...state.manifests] })),

  updateManifestStatus: (code, status) =>
    set((state) => ({
      manifests: state.manifests.map((m) =>
        m.manifest_code === code ? { ...m, status } : m
      ),
    })),

  updateManifestEta: (code, etaMs) =>
    set((state) => ({
      manifests: state.manifests.map((m) =>
        m.manifest_code === code ? { ...m, eta_timestamp: etaMs } : m
      ),
    })),
}));
