import { useState } from 'react';
import { useInboundStore } from '../../store/useInboundStore';
import { useHubStore } from '../../store/useHubStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function InboundConfirmModal() {
  const { confirmingManifest, closeConfirmModal, updateManifestStatus } = useInboundStore();
  const { hubCapacity } = useHubStore();
  
  const [error] = useState<string | null>(null);

  if (!confirmingManifest) return null;

  const currentLoad = hubCapacity.current;
  const incoming = confirmingManifest.total_packages;
  const maxLoad = hubCapacity.max;
  const projectedLoad = currentLoad + incoming;
  const isOverload = projectedLoad > maxLoad;

  const handleConfirm = async () => {
    if (isOverload) return;

    const manifestCode = confirmingManifest.manifest_code;

    // 1. Tutup modal DULU agar tidak terasa freeze — UI belum berubah
    closeConfirmModal();
    
    // 2. API jalan di background dengan toast progress
    const toastId = toast.loading(
      `Memproses penerimaan ${manifestCode}...`,
      { duration: Infinity }
    );

    try {
      const { data } = await api.post(`/inbound/manifests/${manifestCode}/acknowledge`);
      
      if (data.success) {
        // 3. SETELAH server konfirmasi berhasil, baru update UI
        updateManifestStatus(manifestCode, 'SUDAH_DITERIMA');
        
        toast.success(
          `✅ Manifest ${manifestCode} berhasil diterima! Paket telah ditambahkan ke hub.`,
          {
            id: toastId,
            duration: 5000,
            style: {
              minWidth: '320px',
              fontWeight: 600,
            },
          }
        );
      }
    } catch (err: any) {
      // 4. Gagal — UI tidak perlu di-revert karena belum diubah sama sekali
      const errMsg = err.response?.data?.message || 'Gagal mengonfirmasi manifest. Silakan coba lagi.';
      toast.error(
        `❌ ${errMsg}`,
        {
          id: toastId,
          duration: 7000,
          style: {
            minWidth: '320px',
            fontWeight: 600,
          },
        }
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Konfirmasi Penerimaan Manifest</h2>
            <p className="mt-1 text-xs text-gray-500">
              Anda akan menerima <span className="font-bold text-gray-900">{confirmingManifest.manifest_code}</span> dari <span className="font-bold text-gray-900">{confirmingManifest.origin_hub_name}</span>.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Simulasi Kapasitas</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kapasitas Saat Ini</span>
                <span className="font-mono text-gray-900">{currentLoad} paket</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paket Masuk (Manifest)</span>
                <span className="font-mono text-blue-600">+{incoming} paket</span>
              </div>
              <div className="my-2 border-t border-gray-200 border-dashed" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-900">Proyeksi Kapasitas</span>
                <span className={`font-mono ${isOverload ? 'text-red-600' : 'text-emerald-600'}`}>
                  {projectedLoad} / {maxLoad}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-bold">Gagal Mengonfirmasi</p>
                <p className="mt-1 text-red-600/80">{error}</p>
              </div>
            </div>
          )}

          {isOverload && !error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-bold">Kapasitas Tidak Mencukupi</p>
                <p className="mt-1 text-red-600/80">Penerimaan manifest ini akan melebihi kapasitas maksimal hub. Silakan kosongkan hub (SLA Queue) terlebih dahulu.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeConfirmModal}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isOverload}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
              isOverload
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-anteraja-primary hover:bg-anteraja-primary-dark active:scale-95'
            }`}
          >
            Ya, Terima Manifest
          </button>
        </div>
      </div>
    </div>
  );
}
