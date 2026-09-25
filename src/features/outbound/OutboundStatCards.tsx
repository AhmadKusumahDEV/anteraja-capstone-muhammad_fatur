import { useOutboundStore } from '../../store/useOutboundStore';

export default function OutboundStatCards() {
  const { stats } = useOutboundStore();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Armada Kurir Aktif */}
      <article className="rounded-2xl border border-surface-border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Armada Kurir Aktif
            </h2>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                {stats.active_couriers}
              </span>
              <span className="text-sm font-medium text-gray-500">Kurir Satria Hadir</span>
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-emerald-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-xs font-semibold text-emerald-700">
            Siap Bertugas &amp; Terjadwal
          </span>
        </div>
      </article>

      {/* Siap Berangkat */}
      <article className="rounded-2xl border border-surface-border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Siap Berangkat
            </h2>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                {stats.ready_to_depart}
              </span>
              <span className="text-sm font-medium text-gray-500">Batch</span>
              <span className="text-sm font-medium text-gray-400">
                ({stats.ready_to_depart_packages} Paket)
              </span>
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-amber-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path
                fillRule="evenodd"
                d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-3">
          <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
          <span className="text-xs font-semibold text-amber-700">Menunggu Keberangkatan</span>
        </div>
      </article>

      {/* Dalam Pengantaran */}
      <article className="rounded-2xl border border-surface-border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Dalam Pengantaran
            </h2>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                {stats.in_delivery}
              </span>
              <span className="text-sm font-medium text-gray-500">Batch</span>
              <span className="text-sm font-medium text-gray-400">
                ({stats.in_delivery_packages} Paket)
              </span>
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-3">
          <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
          <span className="text-xs font-semibold text-blue-700">Sedang Mengantar di Rute</span>
        </div>
      </article>
    </div>
  );
}
