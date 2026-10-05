import { useHubStore } from '../store/useHubStore';

// ─── Threshold table (matches backend capacity_status thresholds) ─────────────
// ≥ 90%  → CRITICAL  🔴
// ≥ 75%  → HIGH      🟠
// ≥ 50%  → MODERATE  🟡
// < 50%  → NORMAL    🟢

type Tier = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NORMAL';

const getTier = (pct: number): Tier => {
  if (pct >= 90) return 'CRITICAL';
  if (pct >= 75) return 'HIGH';
  if (pct >= 50) return 'MODERATE';
  return 'NORMAL';
};

const TIER_CONFIG: Record<Tier, { gauge: string; badge: string; label: string }> = {
  CRITICAL: {
    gauge: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 ring-red-200',
    label: 'KRITIS',
  },
  HIGH: {
    gauge: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 ring-amber-200',
    label: 'TINGGI',
  },
  MODERATE: {
    gauge: 'bg-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
    label: 'SEDANG',
  },
  NORMAL: {
    gauge: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    label: 'NORMAL',
  },
};

// Map backend capacity_status string → Tier (backend uses WARNING, not HIGH)
const backendStatusToTier = (status: string): Tier => {
  const map: Record<string, Tier> = {
    CRITICAL: 'CRITICAL',
    WARNING:  'HIGH',      // backend calls it WARNING, we display HIGH
    MODERATE: 'MODERATE',
    NORMAL:   'NORMAL',
  };
  return map[status] ?? 'NORMAL';
};

export default function HubCapacityCard() {
  const capacity = useHubStore((state) => state.hubCapacity);

  // Prefer backend-provided usage_percent (server-authoritative) over local calc
  const pct = capacity.usage_percent !== undefined
    ? parseFloat(capacity.usage_percent.toFixed(1))
    : capacity.max > 0
      ? parseFloat(((capacity.current / capacity.max) * 100).toFixed(1))
      : 0;

  // Derive tier: prefer backend status, fallback to frontend threshold
  const tier: Tier = capacity.capacity_status
    ? backendStatusToTier(capacity.capacity_status)
    : getTier(pct);

  const { gauge, badge, label } = TIER_CONFIG[tier];

  return (
    <article className="rounded-2xl border-2 border-surface-border bg-white p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Capacity Load Gauge
          </p>
          {capacity.hub_name && (
            <p
              className="mt-0.5 text-xs text-gray-500 truncate max-w-[200px]"
              title={capacity.hub_name}
            >
              {capacity.hub_name}
            </p>
          )}
        </div>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${badge}`}
        >
          {label} ({pct}%)
        </span>
      </div>

      <p className={`mt-2 text-4xl font-bold tabular-nums ${
        tier === 'CRITICAL' ? 'text-red-500'
          : tier === 'HIGH' ? 'text-amber-500'
          : tier === 'MODERATE' ? 'text-yellow-500'
          : 'text-emerald-500'
      }`}>
        {capacity.current}
        <span className="ml-1 text-base font-medium text-gray-400">
          / {capacity.max} Max Capacity
        </span>
      </p>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${gauge}`}
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
