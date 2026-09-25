import { useSlaQueueStore } from '../store/useSlaQueueStore';
import CapacityAlert from '../features/sla-queue/CapacityAlert';
import MetricCards from '../features/sla-queue/MetricCards';
import SlaQueueTable from '../features/sla-queue/SlaQueueTable';
import QuickDispatchModal from '../features/sla-queue/QuickDispatchModal';

export default function SlaQueue() {
  const { refreshQueue } = useSlaQueueStore();

  return (
    <>
      {/* ── Page Content ── */}
      <section aria-labelledby="sla-queue-heading">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1
              id="sla-queue-heading"
              className="text-2xl font-bold tracking-tight text-gray-900"
            >
              Panel Operasional &amp; Antrean Paket Hub
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Pantau arus paket masuk, ambang batas kapasitas, dan SLA darurat secara real-time
            </p>
          </div>

          <button
            type="button"
            onClick={refreshQueue}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-800 active:scale-[0.97]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh Live Queue
          </button>
        </div>

        {/* Capacity Warning Alert (conditional) */}
        <CapacityAlert />

        {/* Metric Cards */}
        <div className="mb-6">
          <MetricCards />
        </div>

        {/* SLA Queue Table */}
        <SlaQueueTable />
      </section>

      {/* Quick Dispatch Modal (portal-like — rendered outside section) */}
      <QuickDispatchModal />
    </>
  );
}
