import { useOutboundStore } from '../../store/useOutboundStore';

const FLEET_LABEL: Record<string, string> = {
  MOTORCYCLE: 'Motor Fleet',
  VAN: 'Van Fleet',
};

const SERVICE_BADGE_STYLES: Record<string, string> = {
  SAME_DAY: 'bg-anteraja-primary text-white',
  NEXT_DAY: 'bg-blue-600 text-white',
  REGULAR: 'bg-gray-200 text-gray-700',
};

const SLA_BADGE_STYLES = {
  CRITICAL: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  WARNING: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  NORMAL: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
};

export default function CreateBatchModal() {
  const {
    isModalOpen,
    availableCouriers,
    selectedCourierId,
    packageSearchQuery,
    selectedPackageIds,
    getFilteredAvailablePackages,
    closeModal,
    selectCourier,
    setPackageSearchQuery,
    togglePackageSelection,
    selectAllPackages,
    confirmCreateBatch,
  } = useOutboundStore();

  if (!isModalOpen) return null;

  const filteredPackages = getFilteredAvailablePackages();
  const selectedCourier = availableCouriers.find((c) => c.id === selectedCourierId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex h-full w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-anteraja-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Buat Batch Dispatch Baru</h2>
              <p className="text-xs text-gray-500">Tugaskan kurir Satria, pilih manifest muatan paket, dan jadwalkan waktu keberangkatan.</p>
            </div>
          </div>
          <button onClick={closeModal} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Section 1: Pilih Kurir */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Pilih Kurir Satria Ditugaskan
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {availableCouriers.length} Satria Standby
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {availableCouriers.map((courier) => (
                <label
                  key={courier.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                    selectedCourierId === courier.id
                      ? 'border-anteraja-primary bg-pink-50 ring-1 ring-anteraja-primary'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white ${selectedCourierId === courier.id ? 'bg-anteraja-primary' : 'bg-gray-300'}`}>
                    {courier.initials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${selectedCourierId === courier.id ? 'text-anteraja-primary' : 'text-gray-900'}`}>{courier.name}</p>
                    <p className="text-xs text-gray-500">{FLEET_LABEL[courier.fleet_type]} • {courier.bay_location}</p>
                  </div>
                  <input
                    type="radio"
                    name="courier_select"
                    checked={selectedCourierId === courier.id}
                    onChange={() => selectCourier(courier.id)}
                    className="h-4 w-4 text-anteraja-primary focus:ring-anteraja-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Pilih Paket */}
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Pilih Paket Siap Kirim
              </h3>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-anteraja-primary">
                  {selectedPackageIds.length} dari {filteredPackages.length} Paket Dipilih
                </span>
                <button
                  type="button"
                  onClick={selectAllPackages}
                  className="text-xs font-bold text-anteraja-primary hover:text-anteraja-primary-dark"
                >
                  Pilih Semua
                </button>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="search"
                  value={packageSearchQuery}
                  onChange={(e) => setPackageSearchQuery(e.target.value)}
                  placeholder="Cari Resi (TRK-...) atau Area Tujuan..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs focus:border-anteraja-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-anteraja-primary"
                />
              </div>
              <p className="text-xs text-gray-500">
                Sortir: <span className="font-bold text-gray-900">Prioritas SLA</span>
              </p>
            </div>

            <div className="space-y-2">
              {filteredPackages.map((pkg) => {
                const isSelected = selectedPackageIds.includes(pkg.tracking_id);
                return (
                  <label
                    key={pkg.tracking_id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                      isSelected ? 'border-anteraja-primary bg-white' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          isSelected ? 'border-anteraja-primary bg-anteraja-primary text-white' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-mono text-xs font-bold ${isSelected ? 'text-anteraja-primary' : 'text-gray-900'}`}>
                        {pkg.tracking_id}
                      </span>
                      <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SERVICE_BADGE_STYLES[pkg.service_type]}`}>
                        {pkg.service_type.replace('_', ' ')}
                      </span>
                      <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SLA_BADGE_STYLES[pkg.severity_zone]}`}>
                        SLA: {pkg.remaining_minutes} mnt
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-anteraja-primary' : 'text-gray-400'}`}>
                      {isSelected ? 'Siap Muat' : 'Antrean Hub'}
                    </span>
                    {/* Hidden checkbox for accessibility */}
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      onChange={() => togglePackageSelection(pkg.tracking_id)}
                    />
                  </label>
                );
              })}
              {filteredPackages.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">Tidak ada paket yang sesuai pencarian.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
          {/* Summary Banner */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-pink-50 px-4 py-3 ring-1 ring-anteraja-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-anteraja-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Ringkasan Batch: {selectedCourier ? selectedCourier.name : 'Belum pilih kurir'}
                </p>
                <p className="text-xs text-gray-500">
                  Total Siap Outbound: <span className="font-bold text-gray-800">{selectedPackageIds.length} Paket Dipilih</span>
                </p>
              </div>
            </div>
            <p className="text-lg font-bold text-anteraja-primary">{selectedPackageIds.length} Paket</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmCreateBatch}
              disabled={!selectedCourierId || selectedPackageIds.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-anteraja-primary px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-anteraja-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
