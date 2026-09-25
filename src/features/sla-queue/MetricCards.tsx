import { useSlaQueueStore } from '../../store/useSlaQueueStore';

export default function MetricCards() {
  const { metrics } = useSlaQueueStore();

  const gaugeColor =
    metrics.capacity_percentage >= 100
      ? 'bg-red-500'
      : metrics.capacity_percentage >= 90
        ? 'bg-amber-400'
        : metrics.capacity_percentage >= 80
          ? 'bg-yellow-400'
          : 'bg-emerald-500';

  const loadBadgeColor =
    metrics.capacity_percentage >= 90
      ? 'bg-amber-100 text-amber-700 ring-amber-200'
      : metrics.capacity_percentage >= 80
        ? 'bg-yellow-100 text-yellow-700 ring-yellow-200'
        : 'bg-emerald-100 text-emerald-700 ring-emerald-200';

  const loadBadgeLabel =
    metrics.capacity_percentage >= 90
      ? `HIGH LOAD (${metrics.capacity_percentage}%)`
      : metrics.capacity_percentage >= 80
        ? `WARNING (${metrics.capacity_percentage}%)`
        : `NORMAL (${metrics.capacity_percentage}%)`;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Card 1 — In Hub Packages */}
      <article className="flex items-center justify-between rounded-2xl border border-surface-border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            In Hub Packages
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 tabular-nums">
            {metrics.in_hub_count}
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
      <article className="flex items-center justify-between rounded-2xl border border-surface-border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Incoming / In Transit
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 tabular-nums">
            {metrics.in_transit_count}
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
      <article className="rounded-2xl border border-surface-border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Capacity Load Gauge
          </p>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${loadBadgeColor}`}
          >
            {loadBadgeLabel}
          </span>
        </div>

        <p className="mt-2 text-4xl font-bold text-amber-500 tabular-nums">
          {metrics.total_load}
          <span className="ml-1 text-base font-medium text-gray-400">
            / {metrics.max_capacity} Max Capacity
          </span>
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${gaugeColor}`}
              style={{ width: `${Math.min(metrics.capacity_percentage, 100)}%` }}
              role="progressbar"
              aria-valuenow={metrics.capacity_percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>0 PKG</span>
            <span>{metrics.max_capacity} MAX</span>
          </div>
        </div>
      </article>
    </div>
  );
}
