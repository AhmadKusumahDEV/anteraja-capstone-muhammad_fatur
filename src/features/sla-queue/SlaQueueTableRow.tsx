import type { Package } from '../../types/sla-queue';
import { useSlaQueueStore } from '../../store/useSlaQueueStore';

const SLA_BADGE_STYLES = {
  CRITICAL: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  WARNING: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  NORMAL: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
};

const SLA_DOT_STYLES = {
  CRITICAL: 'bg-red-500',
  WARNING: 'bg-amber-400',
  NORMAL: 'bg-emerald-500',
};

const SERVICE_BADGE_STYLES: Record<string, string> = {
  SAME_DAY: 'bg-anteraja-primary text-white',
  NEXT_DAY: 'bg-blue-600 text-white',
  REGULAR: 'bg-gray-200 text-gray-700',
};

const SERVICE_LABELS: Record<string, string> = {
  SAME_DAY: 'Same Day',
  NEXT_DAY: 'Next Day',
  REGULAR: 'Regular',
};

interface Props {
  pkg: Package;
  index: number;
}

export default function SlaQueueTableRow({ pkg, index }: Props) {
  const { togglePriority, openDispatchModal } = useSlaQueueStore();

  const isPriority = pkg.is_priority;

  return (
    <tr
      className={`group transition-colors hover:bg-pink-50/40 ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
      }`}
    >
      {/* Priority left border indicator */}
      <td className="relative w-1 p-0">
        {isPriority && (
          <div className="absolute inset-y-0 left-0 w-1 rounded-r bg-anteraja-primary" />
        )}
      </td>

      {/* Tracking ID */}
      <td className="py-3.5 pl-4 pr-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gray-900">
            {pkg.tracking_id}
          </span>
          <button
            type="button"
            title={`Copy ${pkg.tracking_id}`}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => navigator.clipboard.writeText(pkg.tracking_id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </button>
        </div>
      </td>

      {/* Service Type */}
      <td className="px-3 py-3.5">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
            SERVICE_BADGE_STYLES[pkg.service_type]
          }`}
        >
          {SERVICE_LABELS[pkg.service_type]}
        </span>
      </td>

      {/* Arrival Timestamp */}
      <td className="px-3 py-3.5">
        <time className="font-mono text-xs tabular-nums text-gray-500">
          {pkg.hub_arrival_timestamp}
        </time>
      </td>

      {/* SLA Remaining */}
      <td className="px-3 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
            SLA_BADGE_STYLES[pkg.severity_zone]
          }`}
        >
          <span
            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${SLA_DOT_STYLES[pkg.severity_zone]}`}
            aria-hidden="true"
          />
          {pkg.remaining_minutes} mins
        </span>
      </td>

      {/* Priority Status */}
      <td className="px-3 py-3.5">
        {isPriority ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-pink-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-anteraja-primary ring-1 ring-anteraja-primary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                clipRule="evenodd"
              />
            </svg>
            Priority Override
          </span>
        ) : (
          <span className="text-xs text-gray-400">Standard Queue</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Set / Remove Priority */}
          <button
            type="button"
            onClick={() => togglePriority(pkg.tracking_id)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:border-anteraja-primary/30 hover:bg-pink-50 hover:text-anteraja-primary"
          >
            {isPriority ? 'Remove Flag' : 'Set Priority'}
          </button>

          {/* Outbound Dispatch */}
          <button
            type="button"
            onClick={() => openDispatchModal(pkg)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-anteraja-primary px-2.5 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-anteraja-primary-dark active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            Outbound Dispatch
          </button>
        </div>
      </td>
    </tr>
  );
}
