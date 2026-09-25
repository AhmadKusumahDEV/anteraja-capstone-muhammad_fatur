import OutboundStatCards from '../features/outbound/OutboundStatCards';
import DispatchBatchBoard from '../features/outbound/DispatchBatchBoard';

export default function Outbound() {
  return (
    <>
      <section aria-labelledby="outbound-heading" className="mx-auto max-w-6xl">
        {/* Page Header */}
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
