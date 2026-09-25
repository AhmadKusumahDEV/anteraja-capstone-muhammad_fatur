import InboundStatWidget from '../features/inbound/InboundStatWidget';
import InboundTable from '../features/inbound/InboundTable';

export default function Inbound() {
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

      {/* Statistic Widget */}
      <InboundStatWidget />

      {/* Inbound Manifest Table */}
      <InboundTable />
    </section>
  );
}
