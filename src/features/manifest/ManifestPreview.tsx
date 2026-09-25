import { useManifestStore } from '../../store/useManifestStore';

export default function ManifestPreview() {
  const { packageCount, draftManifestCode, getSelectedHub, getVehicleType } = useManifestStore();
  const selectedHub = getSelectedHub();
  const vehicle = getVehicleType(packageCount);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-surface-border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
          <span className="flex h-2 w-2 rounded-full bg-anteraja-primary">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-anteraja-primary opacity-75"></span>
          </span>
          PREVIEW GENERATED PAYLOAD
        </h2>
        <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          DRAFT SIGNAL
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        {/* Code Display */}
        <div className="mb-6 rounded-2xl bg-[#1A1025] p-5 shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            ESTIMASI KODE MANIFEST:
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-anteraja-primary drop-shadow-[0_0_8px_rgba(209,0,104,0.4)]">
            {draftManifestCode}
          </p>
        </div>

        {/* Details Table */}
        <div className="flex-1 space-y-4 text-sm">
          <div className="flex items-start justify-between border-b border-dashed border-gray-200 pb-4">
            <span className="text-gray-500">Rute Pengiriman:</span>
            <div className="text-right font-semibold text-gray-900">
              HUB-JKS-01 
              <span className="mx-2 text-gray-300">→</span> 
              {selectedHub ? selectedHub.hub_code : <span className="text-gray-400 italic">Belum dipilih</span>}
            </div>
          </div>
          
          <div className="flex items-start justify-between border-b border-dashed border-gray-200 pb-4">
            <span className="text-gray-500">Kuantitas Paket:</span>
            <span className="font-bold text-anteraja-primary">{packageCount} Paket Siap Muat</span>
          </div>

          <div className="flex items-start justify-between border-b border-dashed border-gray-200 pb-4">
            <span className="text-gray-500">Armada Pengangkut:</span>
            <span className="font-bold text-gray-900">{vehicle}</span>
          </div>

          <div className="flex items-start justify-between pb-4">
            <span className="text-gray-500">Created By:</span>
            <span className="font-medium text-gray-700">Admin Budi (ADM-102)</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-auto rounded-xl bg-pink-50 py-3 text-center ring-1 ring-inset ring-pink-100">
          <span className="text-xs font-semibold text-anteraja-primary">
            Status: Menunggu konfirmasi pengiriman skenario
          </span>
        </div>
      </div>
    </article>
  );
}
