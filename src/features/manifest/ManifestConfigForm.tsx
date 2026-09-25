import { useManifestStore } from '../../store/useManifestStore';

export default function ManifestConfigForm() {
  const { hubs, selectedHubId, packageCount, setSelectedHub, setPackageCount, resetForm, submitManifest } = useManifestStore();

  const handleHubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedHub(val ? Number(val) : null);
  };

  return (
    <article className="rounded-2xl border border-surface-border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-anteraja-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Konfigurasi Skenario Manifest</h2>
            <p className="text-xs text-gray-500">Tentukan hub penerima, parameter muatan, dan jenis batch</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Hub Tujuan */}
        <div className="mb-6">
          <label htmlFor="hub-select" className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-500">
            HUB TUJUAN (DESTINATION) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="hub-select"
              value={selectedHubId || ''}
              onChange={handleHubChange}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-10 text-sm font-semibold text-gray-800 transition-colors focus:border-anteraja-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-anteraja-primary"
            >
              <option value="" disabled>Pilih Hub Tujuan...</option>
              {hubs.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.hub_code} • {hub.hub_name}
                </option>
              ))}
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Hub Icon */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Jumlah Paket */}
        <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50/50 p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500">
                JUMLAH PAKET PER MANIFEST <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-xs text-gray-400">Estimasi muatan yang akan digenerate ke dalam kontainer/trolley</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="text-lg font-bold text-gray-900">{packageCount}</span>
              <span className="text-xs font-semibold text-gray-400">Paket</span>
            </div>
          </div>

          <input
            type="range"
            min="10"
            max="150"
            step="1"
            value={packageCount}
            onChange={(e) => setPackageCount(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-anteraja-primary"
          />

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Quick Select:</span>
            {[15, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPackageCount(preset)}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                  packageCount === preset
                    ? 'border-anteraja-primary bg-pink-50 text-anteraja-primary'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {preset} Pkt
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPackageCount(100)}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                packageCount === 100
                  ? 'border-anteraja-primary bg-pink-50 text-anteraja-primary'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              100 Pkt (Feeder Truck)
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800"
          >
            Reset Parameter
          </button>
          <button
            type="button"
            onClick={submitManifest}
            disabled={!selectedHubId}
            className="inline-flex items-center gap-2 rounded-xl bg-anteraja-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-anteraja-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Buat &amp; Kirim Skenario Manifest
          </button>
        </div>
      </div>
    </article>
  );
}
