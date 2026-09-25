import type { DispatchBatch } from '../../types/outbound';
import { useOutboundStore } from '../../store/useOutboundStore';

interface Props {
  batch: DispatchBatch;
}

export default function DispatchBatchCard({ batch }: Props) {
  const { departBatch, completeBatch } = useOutboundStore();

  const isReady = batch.status === 'SIAP_BERANGKAT';
  const isDelivering = batch.status === 'DALAM_PENGANTARAN';
  const isCompleted = batch.status === 'SELESAI';

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md ${
        isCompleted ? 'border-gray-100 opacity-70 grayscale-[30%]' : 'border-gray-200'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-base font-bold text-gray-900">{batch.courier_name}</h3>
        {/* Status Badge */}
        {isReady && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            Siap Berangkat
          </span>
        )}
        {isDelivering && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
            Dalam Pengantaran
          </span>
        )}
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
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
            Selesai
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50/50 p-4">
        <div className="flex items-center gap-2 text-gray-600">
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
          <span className="font-mono text-xs font-semibold">{batch.manifest_code}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Muatan: </span>
          <span className="text-sm font-bold text-gray-900">{batch.total_packages} Paket</span>
        </div>
      </div>

      {/* Card Footer / Action */}
      <div className="mt-5 flex justify-end">
        {isReady && (
          <button
            type="button"
            onClick={() => departBatch(batch.manifest_code)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-anteraja-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-anteraja-primary-dark active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            Berangkatkan
          </button>
        )}
        {isDelivering && (
          <button
            type="button"
            onClick={() => completeBatch(batch.manifest_code)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 bg-white px-4 py-1.5 text-sm font-bold text-emerald-600 transition-colors hover:bg-emerald-50"
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
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Selesai
          </button>
        )}
        {isCompleted && (
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
            Telah Selesai
          </div>
        )}
      </div>
    </div>
  );
}
