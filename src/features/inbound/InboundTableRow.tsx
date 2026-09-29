import type { InboundManifest } from '../../types/hub';
import { useInboundStore } from '../../store/useInboundStore';
import { useHubStore } from '../../store/useHubStore';
import { useNavigate } from 'react-router-dom';

interface Props {
  manifest: InboundManifest;
}

export default function InboundTableRow({ manifest }: Props) {
  const { openConfirmModal } = useInboundStore();
  const { fastForwardManifest } = useHubStore();
  const navigate = useNavigate();

  const isWaiting = manifest.status === 'MENUNGGU_KONFIRMASI';
  const isAccepted = manifest.status === 'SUDAH_DITERIMA';
  const isEarlyArrival = isWaiting && manifest.eta_timestamp > Date.now();

  return (
    <tr className="border-b border-gray-50 bg-white hover:bg-gray-50/50">
      {/* Kode Manifest */}
      <td className="py-4 pl-6 pr-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {manifest.manifest_code}
            </p>
          </div>
        </div>
      </td>

      {/* Hub Asal Pengirim */}
      <td className="px-3 py-4">
        <p className="text-sm font-semibold text-gray-900">{manifest.origin_hub_code}</p>
        <p className="mt-0.5 text-xs text-gray-500">{manifest.origin_hub_name}</p>
      </td>

      {/* Waktu Kedatangan (ETA) */}
      <td className="px-3 py-4">
        <p className="text-sm font-semibold text-gray-900">{manifest.eta}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {new Date(manifest.eta_timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </td>

      {/* Jumlah Paket */}
      <td className="px-3 py-4 text-center">
        <p className="text-sm font-bold text-gray-900">{manifest.total_packages} Paket</p>
      </td>

      {/* Status Pengiriman */}
      <td className="px-3 py-4 text-center">
        {isEarlyArrival && (
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600">
            In-Transit (OTW)
          </span>
        )}
        {isWaiting && !isEarlyArrival && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-600">
            Tiba di Hub
          </span>
        )}
        {isAccepted && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Sudah Diterima
          </span>
        )}
      </td>

      {/* Aksi */}
      <td className="py-4 pl-3 pr-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/shipments/${manifest.manifest_code}`)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100 active:scale-[0.97]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Detail
          </button>
          
          {isEarlyArrival && (
            <button
              type="button"
              onClick={() => fastForwardManifest(manifest.manifest_code)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-100 active:scale-[0.97]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Tiba Lebih Awal
            </button>
          )}

          {isWaiting && !isEarlyArrival && (
            <button
              type="button"
              onClick={() => openConfirmModal(manifest)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-anteraja-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-anteraja-primary-dark active:scale-[0.97]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Terima &amp; Konfirmasi
            </button>
          )}
          {isAccepted && (
            <span className="inline-flex rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400">
              Diterima
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
