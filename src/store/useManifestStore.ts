import { create } from 'zustand';
import { DUMMY_HUBS, DUMMY_MANIFEST_LOGS, generateDummyPackages } from '../data/manifest-dummy';
import type { Hub, ManifestLog, ManifestPackageDetail } from '../types/manifest';

const ITEMS_PER_PAGE = 10;

interface ManifestState {
  // Master Data
  hubs: Hub[];

  // Form State
  selectedHubId: number | null;
  packageCount: number;
  draftManifestCode: string;

  // Log State
  manifests: ManifestLog[];
  searchQuery: string;
  hubFilter: string; // 'ALL' or hub_code
  currentPage: number;

  // Modal State
  isDetailOpen: boolean;
  selectedManifest: ManifestLog | null;
  manifestPackages: ManifestPackageDetail[];

  // Computed - Form
  getVehicleType: (count: number) => string;
  getSelectedHub: () => Hub | undefined;
  
  // Computed - Log
  getFilteredManifests: () => ManifestLog[];
  getPaginatedManifests: () => ManifestLog[];
  getTotalPages: () => number;

  // Actions - Form
  setSelectedHub: (id: number | null) => void;
  setPackageCount: (count: number) => void;
  resetForm: () => void;
  submitManifest: () => void;
  generateDraftCode: () => string;

  // Actions - Log
  setSearchQuery: (query: string) => void;
  setHubFilter: (hubCode: string) => void;
  setPage: (page: number) => void;

  // Actions - Modal
  openDetail: (manifest: ManifestLog) => void;
  closeDetail: () => void;
}

export const useManifestStore = create<ManifestState>((set, get) => ({
  // Data
  hubs: DUMMY_HUBS,
  manifests: DUMMY_MANIFEST_LOGS,

  // Initial Form State
  selectedHubId: null,
  packageCount: 25,
  draftManifestCode: `MNF-2409-${Math.floor(1000 + Math.random() * 9000)}`,

  // Initial Log State
  searchQuery: '',
  hubFilter: 'ALL',
  currentPage: 1,

  // Initial Modal State
  isDetailOpen: false,
  selectedManifest: null,
  manifestPackages: [],

  // --- Computed ---
  getVehicleType: (count: number) => {
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
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.manifest_code.toLowerCase().includes(lowerQ) ||
          m.destination_hub_name.toLowerCase().includes(lowerQ)
      );
    }

    return filtered;
  },

  getPaginatedManifests: () => {
    const sorted = get().getFilteredManifests();
    const start = (get().currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  },

  getTotalPages: () => {
    return Math.max(1, Math.ceil(get().getFilteredManifests().length / ITEMS_PER_PAGE));
  },

  generateDraftCode: () => {
    return `MNF-2409-${Math.floor(1000 + Math.random() * 9000)}`;
  },

  // --- Actions: Form ---
  setSelectedHub: (id) => set({ selectedHubId: id, draftManifestCode: get().generateDraftCode() }),
  setPackageCount: (count) => set({ packageCount: count }),
  
  resetForm: () => set({
    selectedHubId: null,
    packageCount: 25,
    draftManifestCode: get().generateDraftCode()
  }),

  submitManifest: () => {
    const { selectedHubId, packageCount, draftManifestCode, manifests, getSelectedHub, getVehicleType } = get();
    
    if (!selectedHubId) {
      alert("Pilih Hub Tujuan terlebih dahulu.");
      return;
    }

    const hub = getSelectedHub()!;
    const now = new Date();
    const formattedTime = `2026-09-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newManifest: ManifestLog = {
      manifest_code: draftManifestCode,
      destination_hub_code: hub.hub_code,
      destination_hub_name: hub.hub_name,
      total_packages: packageCount,
      vehicle_type: getVehicleType(packageCount),
      created_at: formattedTime,
      hub_color: hub.hub_color,
    };

    set({
      manifests: [newManifest, ...manifests],
      selectedHubId: null,
      packageCount: 25,
      draftManifestCode: get().generateDraftCode(),
      currentPage: 1, // Reset ke halaman 1 agar user melihat data barunya
    });
    
    alert(`Skenario Manifest ${draftManifestCode} berhasil dibuat dengan ${packageCount} paket ke ${hub.hub_name}.`);
  },

  // --- Actions: Log ---
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setHubFilter: (hubCode) => set({ hubFilter: hubCode, currentPage: 1 }),
  setPage: (page) => set({ currentPage: page }),

  // --- Actions: Modal ---
  openDetail: (manifest) => {
    // Generate random packages when detail is opened (simulation)
    const suffix = manifest.manifest_code.split('-').pop() || '0000';
    const packages = generateDummyPackages(manifest.total_packages, suffix);
    
    set({
      isDetailOpen: true,
      selectedManifest: manifest,
      manifestPackages: packages,
    });
  },
  
  closeDetail: () => set({
    isDetailOpen: false,
    selectedManifest: null,
    manifestPackages: [],
  }),

}));
