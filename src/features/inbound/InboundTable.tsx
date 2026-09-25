import { useInboundStore } from '../../store/useInboundStore';
import InboundTableRow from './InboundTableRow';

export default function InboundTable() {
  const {
    manifests,
    currentPage,
    getPaginatedManifests,
    getTotalPages,
    setPage,
  } = useInboundStore();

  const totalFiltered = manifests.length;
  const paginated = getPaginatedManifests();
  const totalPages = getTotalPages();

  return (
    <section
      className="mt-6 rounded-2xl border border-surface-border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      aria-labelledby="inbound-table-heading"
    >
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          {/* Accent line (pink) matching mockup */}
          <div className="h-5 w-1.5 rounded-full bg-anteraja-primary" aria-hidden="true" />
          <h2 id="inbound-table-heading" className="text-base font-bold text-gray-900">
            Daftar Manifest Paket Masuk
          </h2>
        </div>

        {/* Sort Button */}
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
          </svg>
          Urutkan Waktu Tiba
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th
                scope="col"
                className="py-4 pl-6 pr-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                KODE MANIFEST
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                HUB ASAL PENGIRIM
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                KENDARAAN PENGIRIM
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                JUMLAH PAKET
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                STATUS PENGIRIMAN
              </th>
              <th
                scope="col"
                className="py-4 pl-3 pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                AKSI
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((manifest) => (
                <InboundTableRow key={manifest.manifest_code} manifest={manifest} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  Tidak ada manifest yang aktif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="flex flex-wrap items-center justify-between border-t border-gray-100 px-6 py-4">
        <p className="text-xs font-medium text-gray-500">
          Menampilkan {paginated.length} dari {totalFiltered} manifest aktif
        </p>

        <nav className="flex items-center gap-1.5" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setPage(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold transition-colors ${
                currentPage === page
                  ? 'bg-anteraja-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Selanjutnya
          </button>
        </nav>
      </div>
    </section>
  );
}
