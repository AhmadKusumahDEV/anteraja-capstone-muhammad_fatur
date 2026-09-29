import { useParams, useNavigate } from 'react-router-dom';
import { useHubStore } from '../store/useHubStore';

export default function ShipmentDetail() {
  // Mengekstraksi dynamic routing parameter (e.g. /shipments/MNF-2409-1234)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mencari data yang relevan dari Context / Store
  const manifestLogs = useHubStore((state) => state.manifestLogs);
  const inboundManifests = useHubStore((state) => state.inboundManifests);
  
  // Coba temukan manifest berdasarkan ID di berbagai list (karena struktur data ada logs dan inbound)
  const foundManifest = 
    manifestLogs.find((m) => m.manifest_code === id) || 
    inboundManifests.find((m) => m.manifest_code === id);

  if (!foundManifest) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-700">Data Resi Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mb-6">Manifest atau Resi dengan ID "{id}" tidak tersedia di database.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="rounded-lg bg-anteraja-primary px-6 py-2 text-white font-medium shadow-sm hover:bg-anteraja-primary-dark"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Detail Manifest</h1>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Manifest ID</p>
            <p className="text-lg font-black text-gray-900">{foundManifest.manifest_code}</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {foundManifest.vehicle_type}
            </span>
            <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              {foundManifest.total_packages} Paket
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Tujuan Hub</p>
            <p className="font-semibold text-gray-800">{foundManifest.destination_hub_name || 'Hub Jakarta Selatan'}</p>
            <p className="text-sm text-gray-500">{foundManifest.destination_hub_code || 'HUB-JKS-01'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Waktu Dibuat</p>
            <p className="font-semibold text-gray-800">{foundManifest.created_at}</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4 border-t border-gray-100 pt-6">Daftar Paket</h3>
        
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Layanan</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {foundManifest.packages.map((pkg, idx) => (
                <tr key={pkg.tracking_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{pkg.tracking_id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      pkg.service_type === 'SAME_DAY' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {pkg.service_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className="font-semibold text-gray-700">{pkg.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{pkg.destination_area}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
