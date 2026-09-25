import type { InboundManifest } from '../../types/inbound';
import { useInboundStore } from '../../store/useInboundStore';

interface Props {
  manifest: InboundManifest;
}

export default function InboundTableRow({ manifest }: Props) {
  const { acknowledgeManifest } = useInboundStore();

  const isWaiting = manifest.status === 'MENUNGGU_KONFIRMASI';
  const isAccepted = manifest.status === 'SUDAH_DITERIMA';
  const inTransit = manifest.status === 'DALAM_PERJALANAN';

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
            <p className="mt-0.5 text-xs text-gray-400">{manifest.eta}</p>
          </div>
        </div>
      </td>

      {/* Hub Asal Pengirim */}
      <td className="px-3 py-4">
        <p className="text-sm font-semibold text-gray-900">{manifest.origin_hub_code}</p>
        <p className="mt-0.5 text-xs text-gray-500">{manifest.origin_hub_name}</p>
      </td>

      {/* Kendaraan Pengirim */}
      <td className="px-3 py-4">
        <p className="text-sm font-semibold text-gray-900">{manifest.vehicle_plate}</p>
        <p className="mt-0.5 text-xs text-gray-500">{manifest.vehicle_type}</p>
      </td>

      {/* Jumlah Paket */}
      <td className="px-3 py-4 text-center">
        <p className="text-sm font-bold text-gray-900">{manifest.total_packages} Paket</p>
      </td>

      {/* Status Pengiriman */}
      <td className="px-3 py-4 text-center">
        {isWaiting && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-600">
            Menunggu Konfirmasi
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
        {inTransit && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            Dalam Perjalanan
          </span>
        )}
      </td>

      {/* Aksi */}
      <td className="py-4 pl-3 pr-6 text-right">
        {isWaiting && (
          <button
            type="button"
            onClick={() => acknowledgeManifest(manifest.manifest_code, manifest.total_packages)}
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
            Diterima oleh Admin
          </span>
        )}
        {inTransit && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
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
            Menunggu Truk Tiba
          </span>
        )}
      </td>
    </tr>
  );
}
