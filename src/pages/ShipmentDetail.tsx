import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [manifestData, setManifestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get(`/manifests/${id}`);
        if (isMounted) {
          setManifestData(data.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Gagal memuat data manifest');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-anteraja-primary border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">Memuat detail manifest...</p>
      </div>
    );
  }

  if (error || !manifestData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-700">Terjadi Kesalahan</h2>
        <p className="mb-6 text-sm text-gray-500">{error || 'Data Resi Tidak Ditemukan'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="rounded-lg bg-anteraja-primary px-6 py-2 font-medium text-white shadow-sm hover:bg-anteraja-primary-dark"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
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

      <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Manifest ID</p>
            <p className="text-lg font-black text-gray-900">{manifestData.manifest_code}</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {manifestData.vehicle_type || manifestData.type}
            </span>
            <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              {manifestData.total_packages} Paket
            </span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-gray-500">Tujuan Hub</p>
            <p className="font-semibold text-gray-800">{manifestData.destination_hub_name}</p>
            <p className="text-sm text-gray-500">{manifestData.destination_hub_code}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-500">Waktu Estimasi Tiba (ETA)</p>
            <p className="font-semibold text-gray-800">{manifestData.eta_timestamp || '-'}</p>
          </div>
        </div>

        <h3 className="mb-4 border-t border-gray-100 pt-6 text-lg font-bold text-gray-900">Daftar Paket</h3>
        
        <div className="overflow-x-auto rounded-xl border-2 border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tracking ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Layanan</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {manifestData.packages?.length > 0 ? (
                manifestData.packages.map((pkg: any, idx: number) => (
                  <tr key={pkg.tracking_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{pkg.tracking_id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        pkg.service_type === 'SAME_DAY' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {pkg.service_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className="font-semibold text-gray-700">{pkg.status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{pkg.destination_area}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    Tidak ada paket dalam manifest ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
