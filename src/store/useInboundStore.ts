import { create } from 'zustand';
import { DUMMY_INBOUND_MANIFESTS, DUMMY_INBOUND_STATS } from '../data/inbound-dummy';
import type { InboundManifest, InboundStats } from '../types/inbound';

const ITEMS_PER_PAGE = 7; // Show 7 items as in the mockup for pagination demo
const HUB_MAX_CAPACITY = 200; // Mock capacity limit for validation

interface InboundState {
  // Data
  manifests: InboundManifest[];
  stats: InboundStats;
  currentHubCapacity: number; // Simulate current packages in hub
  
  // UI State
  currentPage: number;

  // Computed
  getPaginatedManifests: () => InboundManifest[];
  getTotalPages: () => number;

  // Actions
  setPage: (page: number) => void;
  acknowledgeManifest: (manifestCode: string, totalPackages: number) => void;
}

export const useInboundStore = create<InboundState>((set, get) => ({
  manifests: DUMMY_INBOUND_MANIFESTS,
  stats: DUMMY_INBOUND_STATS,
  currentHubCapacity: 160, // Simulate the hub is near capacity to test the threshold (160/200)
  
  currentPage: 1,

  getPaginatedManifests: () => {
    const { manifests, currentPage } = get();
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return manifests.slice(start, start + ITEMS_PER_PAGE);
  },

  getTotalPages: () => {
    const { manifests } = get();
    return Math.max(1, Math.ceil(manifests.length / ITEMS_PER_PAGE));
  },

  setPage: (page) => set({ currentPage: page }),

  acknowledgeManifest: (manifestCode, totalPackages) => {
    const { manifests, stats, currentHubCapacity } = get();

    // 1. Rigid Capacity Check (BR-06.1)
    if (currentHubCapacity + totalPackages > HUB_MAX_CAPACITY) {
      alert(`[ERROR: CAPACITY EXCEEDED]\n\nGagal mengonfirmasi manifes: Total paket (${currentHubCapacity} di Hub + ${totalPackages} di Manifes = ${currentHubCapacity + totalPackages}) melebihi kapasitas maksimal Hub (${HUB_MAX_CAPACITY} paket).`);
      return;
    }

    // 2. State Mutation
    set({
      manifests: manifests.map((m) =>
        m.manifest_code === manifestCode ? { ...m, status: 'SUDAH_DITERIMA' } : m
      ),
      stats: {
        ...stats,
        arrived: stats.arrived + 1,
      },
      currentHubCapacity: currentHubCapacity + totalPackages, // Increase hub load simulation
    });
    
    alert(`Manifest ${manifestCode} berhasil dikonfirmasi. ${totalPackages} paket telah ditambahkan ke antrean In Hub.`);
  },
}));
