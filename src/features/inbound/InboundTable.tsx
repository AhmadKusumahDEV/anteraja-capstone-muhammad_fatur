import { useInboundStore } from '../../store/useInboundStore';
import { useHubStore } from '../../store/useHubStore';
import { generatePagination } from '../../utils/pagination';
import { exportToCsv } from '../../utils/exportCsv';
import InboundTableRow from './InboundTableRow';

export default function InboundTable() {
  // Subscribe to hubStore so this re-renders when manifests change
  useHubStore((state) => state.inboundManifests);

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

  const handleExport = () => {
    const headers = ['Kode Manifest', 'Hub Asal', 'Hub Tujuan', 'Waktu Kedatangan', 'Jumlah Paket', 'Status'];
    const rows = manifests.map((m) => [
      m.manifest_code,
      `${m.origin_hub_code} - ${m.origin_hub_name}`,
      `${m.destination_hub_code} - ${m.destination_hub_name}`,
      new Date(m.eta_timestamp).toLocaleString('id-ID'),
      m.total_packages,
      m.status,
    ]);
    exportToCsv('inbound_manifests.csv', headers, rows);
  };

  return (
    <section
      className="mt-6 rounded-2xl border border-surface-border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      aria-labelledby="inbound-table-heading"
    >
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          {/* Accent line (pink) matching mockup */}
          <div className="h-5 w-1.5 rounded-full bg-anteraja-primary" aria-hidden="true" />
          <h2 id="inbound-table-heading" className="text-base font-bold text-gray-900">
            Daftar Manifest Paket Masuk
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
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
                WAKTU KEDATANGAN
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

          {generatePagination(currentPage, totalPages).map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                type="button"
                onClick={() => setPage(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold transition-colors ${currentPage === page
                  ? 'bg-anteraja-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-1 text-gray-400">
                {page}
              </span>
            )
          )}

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
