import { useOutboundStore } from '../../store/useOutboundStore';
import DispatchBatchCard from './DispatchBatchCard';

export default function DispatchBatchBoard() {
  const {
    searchQuery,
    currentPage,
    getSortedFilteredBatches,
    getPaginatedBatches,
    getTotalPages,
    setSearchQuery,
    setPage,
    openModal,
  } = useOutboundStore();

  const paginatedBatches = getPaginatedBatches();
  const totalFiltered = getSortedFilteredBatches().length;
  const totalPages = getTotalPages();

  return (
    <section
      className="mt-6 rounded-2xl border border-surface-border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      aria-labelledby="dispatch-board-heading"
    >
      {/* Board Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div>
          <h2 id="dispatch-board-heading" className="text-base font-bold text-gray-900">
            Active Dispatch Batches
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Kelola dan berangkatkan batch kurir outbound secara real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Kurir / Manifest..."
              className="w-56 rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-8 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-anteraja-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-anteraja-primary/20"
            />
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-anteraja-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-anteraja-primary-dark active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Buat Batch Dispatch
          </button>
        </div>
      </div>

      {/* Board Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {paginatedBatches.length > 0 ? (
            paginatedBatches.map((batch) => (
              <DispatchBatchCard key={batch.manifest_code} batch={batch} />
            ))
          ) : (
            <div className="col-span-1 py-12 text-center text-sm text-gray-400 lg:col-span-2">
              Tidak ada batch yang sesuai pencarian.
            </div>
          )}
        </div>
      </div>

      {/* Board Footer / Pagination */}
      <div className="flex flex-wrap items-center justify-between border-t border-gray-100 px-6 py-4">
        <p className="text-xs font-medium text-gray-500">
          Menampilkan {paginatedBatches.length} dari {totalFiltered} batch kurir (Halaman {currentPage} dari {totalPages})
        </p>

        <nav className="flex items-center gap-1.5" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
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
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </section>
  );
}
