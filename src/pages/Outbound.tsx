import { useEffect } from 'react';
import { useOutboundStore } from '../store/useOutboundStore';
import { useHubStore } from '../store/useHubStore';
import { useAuthStore } from '../store/useAuthStore';
import OutboundStatCards from '../features/outbound/OutboundStatCards';
import DispatchBatchBoard from '../features/outbound/DispatchBatchBoard';

export default function Outbound() {
  const { fetchBatches } = useOutboundStore();
  const { fetchHubCapacity } = useHubStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchBatches();
    if (user?.hub_id) {
      fetchHubCapacity(user.hub_id);
    }
  }, [fetchBatches, fetchHubCapacity, user?.hub_id]);

  return (
    <>
      <section aria-labelledby="outbound-heading" className="mx-auto max-w-6xl">

        <div className="mb-6">
          <h1
            id="outbound-heading"
            className="text-2xl font-bold tracking-tight text-gray-900"
          >
            Pengiriman Keluar &amp; Serah Terima Kurir
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Pantau kesiapan batch pengiriman, keberangkatan kurir Satria, dan serah terima paket ke kurir.
          </p>
        </div>




        {/* Statistic Cards */}
        <OutboundStatCards />

        {/* Dispatch Batch Board */}
        <DispatchBatchBoard />
      </section>
    </>
  );
}
