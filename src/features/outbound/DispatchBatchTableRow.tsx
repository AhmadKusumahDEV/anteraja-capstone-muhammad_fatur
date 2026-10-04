import { useState } from 'react';
import type { DispatchBatch } from '../../types/outbound';
import { useOutboundStore } from '../../store/useOutboundStore';

interface Props {
  batch: DispatchBatch;
}

export default function DispatchBatchTableRow({ batch }: Props) {
  const { departBatch, completeBatch } = useOutboundStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const isReady = batch.status === 'SIAP_BERANGKAT';
  const isDelivering = batch.status === 'DALAM_PENGANTARAN';
  const isCompleted = batch.status === 'SELESAI';

  const handleDepart = async () => {
    setIsProcessing(true);
    await departBatch(batch.manifest_code);
    setIsProcessing(false);
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    await completeBatch(batch.manifest_code);
    setIsProcessing(false);
  };

  return (
    <tr
      className={`border-b border-gray-50 bg-white hover:bg-gray-50/50 transition-colors ${
        isCompleted ? 'opacity-70' : ''
      }`}
    >
      {/* Kode Manifest */}
      <td className="py-4 pl-6 pr-3">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
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
          <span className="font-mono text-sm font-semibold text-gray-900">{batch.manifest_code}</span>
        </div>
      </td>

      {/* Kurir Satria */}
      <td className="px-3 py-4">
        <p className="text-sm font-semibold text-gray-900">{batch.courier_name}</p>
        <p className="text-xs text-gray-500">{batch.courier_id}</p>
      </td>

      {/* Jumlah Paket */}
      <td className="px-3 py-4 text-center">
        <span className="text-sm font-bold text-gray-900">{batch.total_packages} Paket</span>
      </td>

      {/* Status Dispatch */}
      <td className="px-3 py-4 text-center">
        {isReady && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            Siap Berangkat
          </span>
        )}
        {isDelivering && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            Dalam Pengantaran
          </span>
        )}
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Selesai
          </span>
        )}
      </td>

      {/* Aksi */}
      <td className="py-4 pl-3 pr-6 text-right">
        {isReady && (
          <button
            type="button"
            onClick={handleDepart}
            disabled={isProcessing}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-anteraja-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-anteraja-primary-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            )}
            Berangkatkan
          </button>
        )}
        {isDelivering && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={isProcessing}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500 bg-white px-3 py-1.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <svg className="animate-spin h-3.5 w-3.5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            Selesai
          </button>
        )}
        {isCompleted && (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Telah Selesai
          </span>
        )}
      </td>
    </tr>
  );
}
