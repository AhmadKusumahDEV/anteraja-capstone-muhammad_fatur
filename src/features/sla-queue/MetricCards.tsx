import HubCapacityCard from '../../components/HubCapacityCard';
import { useHubStore } from '../../store/useHubStore';
import { useSlaQueueStore } from '../../store/useSlaQueueStore';

export default function MetricCards() {
  const { hubCapacity } = useHubStore();
  const { packages } = useSlaQueueStore(); // Use filtered IN_HUB packages from the new store
  
  const inHubCount = packages.length;
  const inTransitCount = hubCapacity.in_transit_load || 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Card 1 — In Hub Packages */}
      <article className="flex items-center justify-between rounded-2xl border-2 border-surface-border bg-white p-5 shadow-lg">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            In Hub Packages
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 tabular-nums">
            {inHubCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">Packages</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-anteraja-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </article>

      {/* Card 2 — In Transit */}
      <article className="flex items-center justify-between rounded-2xl border-2 border-surface-border bg-white p-5 shadow-lg">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Incoming / In Transit
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 tabular-nums">
            {inTransitCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">Packages</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        </div>
      </article>

      {/* Card 3 — Capacity Load Gauge */}
      <HubCapacityCard />
    </div>
  );
}
