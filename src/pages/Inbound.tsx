import { useEffect } from 'react';
import InboundStatWidget from '../features/inbound/InboundStatWidget';
import InboundTable from '../features/inbound/InboundTable';
import HubCapacityCard from '../components/HubCapacityCard';
import InboundConfirmModal from '../features/inbound/InboundConfirmModal';
import api from '../services/api';
import { useInboundStore } from '../store/useInboundStore';
import { useHubStore } from '../store/useHubStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Inbound() {
  const setManifests = useInboundStore((state) => state.setManifests);
  const fetchHubCapacity = useHubStore((state) => state.fetchHubCapacity);
  const user = useAuthStore((state) => state.user);

  // ── Fetch manifests (always runs on mount) ────────────────────────────────
  useEffect(() => {
    // Memanggil action global di store saat pertama mount
    useInboundStore.getState().fetchManifests();
  }, []);

  // ── Fetch capacity (runs only when hub_id is known) ────────────────────────
  useEffect(() => {
    if (user?.hub_id) {
      fetchHubCapacity(user.hub_id);
    }
  }, [user?.hub_id, fetchHubCapacity]);

  return (
    <section aria-labelledby="inbound-heading" className="mx-auto max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          id="inbound-heading"
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          Penerimaan Paket Masuk &amp; Daftar Pengiriman Truk
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Pantau kedatangan armada antar-hub, verifikasi manifest yang tiba, dan konfirmasi penerimaan paket.
        </p>
      </div>

      {/* Statistic Widgets */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InboundStatWidget />
        <HubCapacityCard />
      </div>

      {/* Inbound Manifest Table */}
      <InboundTable />

      <InboundConfirmModal />
    </section>
  );
}
