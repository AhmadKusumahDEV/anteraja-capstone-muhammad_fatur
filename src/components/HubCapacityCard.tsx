import { useHubStore } from '../store/useHubStore';

export default function HubCapacityCard() {
  const capacity = useHubStore((state) => state.hubCapacity);

  const pct = parseFloat(((capacity.current / capacity.max) * 100).toFixed(1));

  const gaugeColor =
    pct >= 100
      ? 'bg-red-500'
      : pct >= 90
        ? 'bg-amber-400'
        : pct >= 80
          ? 'bg-yellow-400'
          : 'bg-emerald-500';

  const loadBadgeColor =
    pct >= 90
      ? 'bg-amber-100 text-amber-700 ring-amber-200'
      : pct >= 80
        ? 'bg-yellow-100 text-yellow-700 ring-yellow-200'
        : 'bg-emerald-100 text-emerald-700 ring-emerald-200';

  const loadBadgeLabel =
    pct >= 90
      ? `HIGH LOAD (${pct}%)`
      : pct >= 80
        ? `WARNING (${pct}%)`
        : `NORMAL (${pct}%)`;

  return (
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
        {capacity.current}
        <span className="ml-1 text-base font-medium text-gray-400">
          / {capacity.max} Max Capacity
        </span>
      </p>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${gaugeColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
          <span>0 PKG</span>
          <span>{capacity.max} MAX</span>
        </div>
      </div>
    </article>
  );
}
