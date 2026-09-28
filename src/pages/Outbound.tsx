import OutboundStatCards from '../features/outbound/OutboundStatCards';
import DispatchBatchBoard from '../features/outbound/DispatchBatchBoard';
import { useLocation } from 'react-router-dom';
import { BREADCRUMB_MAP } from '../constants/routes';

export default function Outbound() {

  const location = useLocation();
  const currentPathLabel = BREADCRUMB_MAP[location.pathname] || 'Dashboard';

  return (
    <>
      <section aria-labelledby="outbound-heading" className="mx-auto max-w-6xl">

        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span>Operations</span>
          <span className="text-gray-300">/</span>
          <span>HUB-JKS-01</span>
          <span className="text-gray-300">/</span>
          <span className="text-anteraja-primary font-bold">{currentPathLabel}</span>
        </div>

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
