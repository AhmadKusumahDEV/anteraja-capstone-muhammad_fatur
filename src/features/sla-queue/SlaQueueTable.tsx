import type { ServiceFilter } from '../../types/sla-queue';
import { useSlaQueueStore } from '../../store/useSlaQueueStore';
import SlaQueueTableRow from './SlaQueueTableRow';

export default function SlaQueueTable() {
  const {
    searchQuery,
    serviceFilter,
    currentPage,
    getSortedFilteredPackages,
    getPaginatedPackages,
    getTotalPages,
    setSearchQuery,
    setServiceFilter,
    setPage,
  } = useSlaQueueStore();

  const totalFiltered = getSortedFilteredPackages().length;
  const paginated = getPaginatedPackages();
  const totalPages = getTotalPages();

  return (
    <section
      className="rounded-2xl border border-surface-border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      aria-labelledby="sla-table-heading"
    >
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-amber-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 id="sla-table-heading" className="text-sm font-bold text-gray-900">
            SLA &amp; Priority Queue
          </h2>
          <span className="inline-block rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-bold text-anteraja-primary">
            {totalFiltered} Packages in Queue
          </span>
        </div>

        {/* Search + Service Filter */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <label htmlFor="sla-search" className="sr-only">
            Cari Tracking ID
          </label>
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
              id="sla-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tracking ID (e.g. TRK-213)"
              className="w-56 rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-anteraja-primary focus:outline-none focus:ring-2 focus:ring-anteraja-primary/20"
            />
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="service-filter" className="text-xs text-gray-400">
              Service:
            </label>
            <select
              id="service-filter"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as ServiceFilter)}
              className="rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-6 text-xs text-gray-700 focus:border-anteraja-primary focus:outline-none focus:ring-2 focus:ring-anteraja-primary/20"
            >
              <option value="ALL">All Services</option>
              <option value="SAME_DAY">Same Day</option>
              <option value="NEXT_DAY">Next Day</option>
              <option value="REGULAR">Regular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="w-1 p-0" aria-hidden="true" />
              <th
                scope="col"
                className="py-3 pl-4 pr-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400"
              >
                Tracking ID
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400"
              >
                Service Type
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400"
              >
                Arrival Timestamp
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400"
              >
                SLA Remaining
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400"
              >
                Priority Status
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length > 0 ? (
              paginated.map((pkg, i) => (
                <SlaQueueTableRow key={pkg.tracking_id} pkg={pkg} index={i} />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  Tidak ada paket yang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer — Legend + Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-5 py-3">
        {/* Legend */}
        <p className="text-xs text-gray-400">
          Showing {paginated.length} of {totalFiltered} parcels (Sorted by Priority Flag &amp;
          Remaining SLA)
          <span className="ml-3 inline-flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
              <span className="text-gray-500">Critical (&lt;30m)</span>
            </span>
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
              <span className="text-gray-500">Warning (30-120m)</span>
            </span>
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-gray-500">Normal (&gt;120m)</span>
            </span>
          </span>
        </p>

        {/* Pagination Controls */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setPage(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`min-w-8 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                currentPage === page
                  ? 'bg-anteraja-primary text-white shadow-sm'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      </div>
    </section>
  );
}
