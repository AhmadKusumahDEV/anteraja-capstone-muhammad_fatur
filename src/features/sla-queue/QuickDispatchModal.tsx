import { useSlaQueueStore } from '../../store/useSlaQueueStore';

const FLEET_LABEL: Record<string, string> = {
  MOTORCYCLE: 'Motor Fleet',
  VAN: 'Van Fleet',
};

export default function QuickDispatchModal() {
  const {
    isModalOpen,
    selectedPackage,
    selectedCourierId,
    couriers,
    selectCourier,
    closeDispatchModal,
    confirmDispatch,
  } = useSlaQueueStore();

  if (!isModalOpen || !selectedPackage) return null;

  const serviceLabel: Record<string, string> = {
    SAME_DAY: 'Same Day',
    NEXT_DAY: 'Next Day',
    REGULAR: 'Regular',
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDispatchModal();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-anteraja-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold text-gray-900">
                Release Package Outbound
              </h2>
              <p className="text-xs text-gray-500">
                <span className="font-mono font-semibold text-gray-700">
                  {selectedPackage.tracking_id}
                </span>{' '}
                (Priority {serviceLabel[selectedPackage.service_type]})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDispatchModal}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Tutup modal"
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
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5">
          {/* Courier Section Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">
                Pilih Kurir Satria Siaga (Priority Dispatch)
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {couriers.length} Satria Standby
            </span>
          </div>

          {/* Courier List */}
          <fieldset className="space-y-2">
            <legend className="sr-only">Pilih kurir</legend>
            {couriers.map((courier) => (
              <label
                key={courier.id}
                htmlFor={`courier-${courier.id}`}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                  selectedCourierId === courier.id
                    ? 'border-anteraja-primary bg-pink-50 ring-2 ring-anteraja-primary/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <span
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    courier.status === 'READY_NOW' ? 'bg-anteraja-primary' : 'bg-gray-400'
                  }`}
                  aria-hidden="true"
                >
                  {courier.initials}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{courier.name}</span>
                    {courier.status === 'READY_NOW' ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Ready Now
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        Standby
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {FLEET_LABEL[courier.fleet_type]} • {courier.bay_location} • Berangkat est. 5 mnt
                  </p>
                </div>

                {/* Radio */}
                <input
                  id={`courier-${courier.id}`}
                  type="radio"
                  name="courier"
                  value={courier.id}
                  checked={selectedCourierId === courier.id}
                  onChange={() => selectCourier(courier.id)}
                  className="h-4 w-4 border-gray-300 text-anteraja-primary focus:ring-anteraja-primary"
                />
              </label>
            ))}
          </fieldset>

          {/* Info Banner */}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-red-700">
              Paket Priority {serviceLabel[selectedPackage.service_type]} ini akan langsung
              diserahkan ke Satria terpilih untuk pengantaran langsung ke penerima (Direct
              Last-Mile) guna mencegah breach SLA{' '}
              <strong>{selectedPackage.remaining_minutes} menit tersisa</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={closeDispatchModal}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDispatch}
            disabled={!selectedCourierId}
            className="inline-flex items-center gap-2 rounded-xl bg-anteraja-primary px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-anteraja-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
            Konfirmasi &amp; Berangkatkan Satria
          </button>
        </div>
      </div>
    </div>
  );
}
