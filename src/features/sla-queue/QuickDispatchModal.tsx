import { useState } from 'react';
import { useSlaQueueStore } from '../../store/useSlaQueueStore';
import { calcRemainingMs, formatSlaCountdown } from '../../utils/sla';


const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
];

const getInitials = (name?: string, id?: string): string => {
  if (!name) return id?.slice(0, 2).toUpperCase() || 'SR';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export default function QuickDispatchModal() {
  const {
    isModalOpen,
    selectedPackage,
    selectedCourierId,
    couriers,
    isDispatching,
    selectCourier,
    closeDispatchModal,
    confirmDispatch,
  } = useSlaQueueStore();

  const [courierSearch, setCourierSearch] = useState('');

  if (!isModalOpen || !selectedPackage) return null;

  const serviceLabel: Record<string, string> = {
    SAME_DAY: 'Same Day',
    NEXT_DAY: 'Next Day',
    REGULAR: 'Regular',
  };

  const standbyCouriers = couriers.filter((c) => c.status === 'STANDBY');
  const filteredCouriers = standbyCouriers.filter((c) => {
    if (!courierSearch.trim()) return true;
    const q = courierSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.bay_location && c.bay_location.toLowerCase().includes(q))
    );
  });

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDispatchModal();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header — Fixed */}
        <div className="flex-shrink-0 flex items-start justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
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
                (Priority {serviceLabel[selectedPackage.service_type] || selectedPackage.service_type})
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body — Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Courier Section Header & Badge */}
          <div className="flex items-center justify-between">
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
              <span className="text-sm font-semibold text-gray-800">
                Pilih Kurir Satria Siaga (Priority Dispatch)
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {standbyCouriers.length} Satria Standby
            </span>
          </div>

          {/* Pencarian Kurir jika jumlahnya banyak */}
          {standbyCouriers.length > 3 && (
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                value={courierSearch}
                onChange={(e) => setCourierSearch(e.target.value)}
                placeholder="Cari nama kurir, ID, atau Bay..."
                className="w-full rounded-xl border border-gray-200 py-1.5 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:border-anteraja-primary focus:outline-none focus:ring-1 focus:ring-anteraja-primary"
              />
            </div>
          )}

          {/* Courier List — Scrollable Fieldset */}
          <fieldset className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <legend className="sr-only">Pilih kurir</legend>
            {filteredCouriers.length > 0 ? (
              filteredCouriers.map((courier) => {
                const isSelected = selectedCourierId === courier.id;
                const initials = courier.initials || getInitials(courier.name, courier.id);

                return (
                  <label
                    key={courier.id}
                    htmlFor={`courier-${courier.id}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${isSelected
                        ? 'border-anteraja-primary bg-pink-50/70 ring-2 ring-anteraja-primary/20 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                      }`}
                  >
                    {/* Avatar Profile */}
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${isSelected
                          ? 'bg-anteraja-primary text-white ring-2 ring-pink-300'
                          : getAvatarColor(courier.id || courier.name)
                        }`}
                      aria-hidden="true"
                    >
                      {initials}
                    </span>

                    {/* Info Profil */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {courier.name}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                          Standby
                        </span>
                      </div>
                    </div>

                    {/* Radio Button */}
                    <input
                      id={`courier-${courier.id}`}
                      type="radio"
                      name="courier"
                      value={courier.id}
                      checked={isSelected}
                      onChange={() => selectCourier(courier.id)}
                      className="h-4 w-4 border-gray-300 text-anteraja-primary focus:ring-anteraja-primary shrink-0"
                    />
                  </label>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                {courierSearch.trim()
                  ? 'Tidak ada kurir yang sesuai pencarian.'
                  : 'Tidak ada kurir berstatus STANDBY saat ini.'}
              </div>
            )}
          </fieldset>

          {/* Info Banner SLA */}
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 border border-red-100">
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
            <p className="text-xs text-red-700 leading-relaxed">
              Paket Priority <strong>{serviceLabel[selectedPackage.service_type] || selectedPackage.service_type}</strong> ini akan langsung
              diserahkan ke Satria terpilih untuk pengantaran langsung ke penerima (Direct
              Last-Mile) guna mencegah breach SLA{' '}
              <strong className="text-red-800 font-bold">{formatSlaCountdown(calcRemainingMs(selectedPackage.sla_deadline))} tersisa</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer — Fixed */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <button
            type="button"
            onClick={closeDispatchModal}
            className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmDispatch}
            disabled={!selectedCourierId || isDispatching}
            className="inline-flex items-center gap-2 rounded-xl bg-anteraja-primary px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-anteraja-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDispatching ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              <>
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
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
