import { useManifestStore } from '../../store/useManifestStore';
import ManifestLogRow from './ManifestLogRow';

export default function ManifestLogTable() {
  const {
    hubs,
    searchQuery,
    hubFilter,
    currentPage,
    getFilteredManifests,
    getPaginatedManifests,
    getTotalPages,
    setSearchQuery,
    setHubFilter,
    setPage,
  } = useManifestStore();

  const totalFiltered = getFilteredManifests().length;
  const paginated = getPaginatedManifests();
  const totalPages = getTotalPages();

  return (
    <section className="mt-6 rounded-2xl border border-surface-border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-50 text-anteraja-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-900">Riwayat Log Manifest Generator</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari manifest / hub..."
              className="w-56 rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-8 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-anteraja-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-anteraja-primary"
            />
          </div>

          {/* Hub Filter */}
          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-gray-700 focus:border-anteraja-primary focus:outline-none focus:ring-1 focus:ring-anteraja-primary"
          >
            <option value="ALL">Semua Hub Target</option>
            {hubs.map((hub) => (
              <option key={hub.id} value={hub.hub_code}>
                {hub.hub_code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th scope="col" className="py-4 pl-6 pr-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">TIMESTAMP (WIB)</th>
              <th scope="col" className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">KODE MANIFEST</th>
              <th scope="col" className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">HUB TUJUAN</th>
              <th scope="col" className="px-3 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">JUMLAH PAKET</th>
              <th scope="col" className="px-3 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">ARMADA / FEEDER</th>
              <th scope="col" className="py-4 pl-3 pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((manifest) => (
                <ManifestLogRow key={manifest.manifest_code} manifest={manifest} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  Tidak ada riwayat manifest yang sesuai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-wrap items-center justify-between border-t border-gray-100 px-6 py-4">
        <p className="text-xs font-medium text-gray-500">
          Menampilkan {paginated.length} dari {totalFiltered} riwayat manifest (Halaman {currentPage} dari {totalPages})
        </p>

        <nav className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &lt; Sebelumnya
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setPage(page)}
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
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya &gt;
          </button>
        </nav>
      </div>
    </section>
  );
}
