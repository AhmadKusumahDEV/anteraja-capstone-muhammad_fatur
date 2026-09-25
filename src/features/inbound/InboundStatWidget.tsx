import { useInboundStore } from '../../store/useInboundStore';

export default function InboundStatWidget() {
  const { stats } = useInboundStore();

  return (
    <div className="rounded-2xl border border-surface-border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4 px-6 py-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-anteraja-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        </div>
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Truk Pengirim Masuk
          </h2>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              {stats.total_scheduled} Truk
            </span>
            <span className="text-sm font-medium text-gray-500">Terjadwal</span>
            <span className="text-sm font-medium text-gray-400">
              ({stats.arrived} Sudah Tiba di Hub)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
