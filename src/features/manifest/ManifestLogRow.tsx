import type { ManifestLog } from '../../types/manifest';
import { useManifestStore } from '../../store/useManifestStore';

interface Props {
  manifest: ManifestLog;
}

export default function ManifestLogRow({ manifest }: Props) {
  const { openDetail } = useManifestStore();

  return (
    <tr className="border-b border-gray-50 bg-white hover:bg-gray-50/50">
      {/* Timestamp */}
      <td className="py-4 pl-6 pr-3">
        <p className="font-mono text-xs text-gray-500">{manifest.created_at}</p>
      </td>

      {/* Kode Manifest */}
      <td className="px-3 py-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <span className="font-mono text-sm font-bold text-anteraja-primary">{manifest.manifest_code}</span>
        </div>
      </td>

      {/* Hub Tujuan */}
      <td className="px-3 py-4">
        <div className="flex items-start gap-2">
          <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${manifest.hub_color}`} aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-gray-900">{manifest.destination_hub_code}</p>
            <p className="text-xs text-gray-500">{manifest.destination_hub_name}</p>
          </div>
        </div>
      </td>

      {/* Jumlah Paket */}
      <td className="px-3 py-4 text-center">
        <span className="text-sm font-bold text-gray-900">{manifest.total_packages} Paket</span>
      </td>

      {/* Armada / Feeder */}
      <td className="px-3 py-4 text-center">
        <span className="text-sm text-gray-600">{manifest.vehicle_type}</span>
      </td>

      {/* Aksi */}
      <td className="py-4 pl-3 pr-6 text-right">
        <button
          type="button"
          onClick={() => openDetail(manifest)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-anteraja-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-anteraja-primary-dark"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          Detail
        </button>
      </td>
    </tr>
  );
}
