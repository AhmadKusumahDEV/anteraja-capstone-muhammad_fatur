import { useManifestStore } from '../../store/useManifestStore';

const SERVICE_BADGE_STYLES: Record<string, string> = {
  SAME_DAY: 'bg-anteraja-primary text-white',
  NEXT_DAY: 'bg-blue-600 text-white',
  REGULAR: 'bg-gray-200 text-gray-700',
};

export default function ManifestDetailModal() {
  const { isDetailOpen, selectedManifest, manifestPackages, closeDetail } = useManifestStore();

  if (!isDetailOpen || !selectedManifest) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex h-full max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-anteraja-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Detail Manifest: <span className="text-anteraja-primary">{selectedManifest.manifest_code}</span>
              </h2>
              <p className="text-xs text-gray-500">
                Tujuan: <span className="font-semibold text-gray-700">{selectedManifest.destination_hub_name}</span> • {selectedManifest.total_packages} Paket
              </p>
            </div>
          </div>
          <button onClick={closeDetail} className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body (Scrollable Table) */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="border-b border-gray-100">
                <th scope="col" className="py-3 pl-6 pr-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">TRACKING ID</th>
                <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">SERVICE</th>
                <th scope="col" className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">BERAT</th>
                <th scope="col" className="py-3 pl-3 pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {manifestPackages.map((pkg) => (
                <tr key={pkg.tracking_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 pl-6 pr-3">
                    <span className="font-mono text-xs font-bold text-gray-900">{pkg.tracking_id}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SERVICE_BADGE_STYLES[pkg.service_type]}`}>
                      {pkg.service_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-medium text-gray-600">{pkg.weight_kg} kg</span>
                  </td>
                  <td className="py-3 pl-3 pr-6 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
                      In Transit
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 rounded-b-2xl bg-white flex justify-end">
          <button
            type="button"
            onClick={closeDetail}
            className="rounded-xl bg-gray-100 px-6 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
