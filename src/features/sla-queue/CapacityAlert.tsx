import { useSlaQueueStore } from '../../store/useSlaQueueStore';

export default function CapacityAlert() {
  const { metrics, alertDismissed, isCriticalFilterActive, dismissAlert, toggleCriticalFilter } =
    useSlaQueueStore();

  if (!metrics.alert_triggered || alertDismissed) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
    >
      {/* Warning Icon */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-amber-600"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Alert Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-900 uppercase tracking-wide">
          Capacity Warning Alert
        </p>
        <p className="mt-0.5 text-sm text-amber-800">
          Hub {metrics.hub_id} total workload (
          <strong>In Hub: {metrics.in_hub_count}</strong> +{' '}
          <strong>In Transit: {metrics.in_transit_count}</strong>) has reached{' '}
          <strong>{metrics.capacity_percentage}%</strong> of max capacity (
          {metrics.max_capacity} packages). Recommended Action: Trigger Priority Outbound
          Dispatch to avoid SLA breach cascades.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={dismissAlert}
          className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
        >
          Acknowledge
        </button>
        <button
          type="button"
          onClick={toggleCriticalFilter}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all ${
            isCriticalFilterActive
              ? 'bg-gray-500 hover:bg-gray-600'
              : 'bg-anteraja-primary hover:bg-anteraja-primary-dark'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          {isCriticalFilterActive ? 'Reset Filter' : 'Filter Critical Packages'}
        </button>
      </div>
    </div>
  );
}
