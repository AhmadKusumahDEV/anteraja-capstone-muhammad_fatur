import { useState, useEffect, useCallback } from 'react';
import type { InboundManifest } from '../../types/hub';
import { useInboundStore } from '../../store/useInboundStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Props {
  manifest: InboundManifest;
}

// ─── Helper: normalise eta_timestamp to ms epoch ─────────────────────────────
const toEpochMs = (eta: string | number): number => {
  if (typeof eta === 'number') return eta;
  // ISO string from backend → parse to ms
  return new Date(eta).getTime();
};

// ─── Helper: format countdown ─────────────────────────────────────────────────
const formatCountdown = (diffMs: number): string => {
  if (diffMs <= 0) return 'Sudah melewati ETA';
  const totalMins = Math.ceil(diffMs / 60000);
  if (totalMins < 1) return 'Kurang dari 1 menit';
  if (totalMins < 60) return `Tiba dalam ${totalMins} menit`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `Tiba dalam ${hours} jam ${mins} menit` : `Tiba dalam ${hours} jam`;
};


export default function InboundTableRow({ manifest }: Props) {
  const { openConfirmModal, updateManifestStatus, updateManifestEta } = useInboundStore();
  const navigate = useNavigate();

  // Tick every 30s to re-evaluate ETA comparison (gives realtime feel without heavy polling)
  const [, setTick] = useState(0);
  useEffect(() => {
    if (manifest.status === 'SUDAH_DITERIMA') return;
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, [manifest.status]);

  // ─── Derived status ───────────────────────────────────────────────────────
  const etaMs = toEpochMs(manifest.eta_timestamp);
  const now = Date.now();
  const diffMs = etaMs - now;

  type EffectiveStatus = 'IN_TRANSIT' | 'ARRIVED' | 'ACCEPTED';
  let effectiveStatus: EffectiveStatus;
  if (manifest.status === 'SUDAH_DITERIMA') {
    effectiveStatus = 'ACCEPTED';
  } else if (now >= etaMs) {
    // Time has passed ETA → treat as arrived, show "Terima & Konfirmasi"
    effectiveStatus = 'ARRIVED';
  } else {
    // Still before ETA → still in transit
    effectiveStatus = 'IN_TRANSIT';
  }

  // ─── Early Arrival API call ───────────────────────────────────────────────
  const [isArriving, setIsArriving] = useState(false);
  const handleEarlyArrival = useCallback(async () => {
    if (isArriving) return;
    try {
      setIsArriving(true);
      await api.patch(`/inbound/manifests/${manifest.manifest_code}/arrive`);
      // Optimistic local update: status → MENUNGGU_KONFIRMASI, eta → now (past)
      updateManifestStatus(manifest.manifest_code, 'MENUNGGU_KONFIRMASI');
      updateManifestEta(manifest.manifest_code, Date.now() - 1000);
    } catch (err) {
      console.error('Failed to mark early arrival:', err);
    } finally {
      setIsArriving(false);
    }
  }, [manifest.manifest_code, isArriving, updateManifestStatus, updateManifestEta]);

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
          </div>
        </div>
      </td>

      {/* Hub Asal Pengirim */}
      <td className="px-3 py-4">
        <p className="text-sm font-semibold text-gray-900">{manifest.origin_hub_code}</p>
        <p className="mt-0.5 text-xs text-gray-500">{manifest.origin_hub_name}</p>
      </td>

      {/* Waktu Kedatangan (ETA) */}
      <td className="px-3 py-4">
        {effectiveStatus === 'IN_TRANSIT' ? (
          /* Masih dalam perjalanan: tampilkan countdown */
          <>
            <p className="text-sm font-semibold text-blue-600">{formatCountdown(diffMs)}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              Est.{' '}
              {new Date(etaMs).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              WIB
            </p>
          </>
        ) : (
          /* ARRIVED atau ACCEPTED: tampilkan tanggal + jam tiba aktual */
          <>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(etaMs).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Pukul{' '}
              {new Date(etaMs).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              WIB
            </p>
          </>
        )}
      </td>


      {/* Jumlah Paket */}
      <td className="px-3 py-4 text-center">
        <p className="text-sm font-bold text-gray-900">{manifest.total_packages} Paket</p>
      </td>

      {/* Status Pengiriman */}
      <td className="px-3 py-4 text-center">
        {effectiveStatus === 'IN_TRANSIT' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
            Dalam Perjalanan
          </span>
        )}
        {effectiveStatus === 'ARRIVED' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
            Tiba di Hub
          </span>
        )}
        {effectiveStatus === 'ACCEPTED' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
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
      </td>

      {/* Aksi */}
      <td className="py-4 pl-3 pr-6 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Detail button — always visible */}
          <button
            type="button"
            onClick={() => navigate(`/shipments/${manifest.manifest_code}`)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100 active:scale-[0.97]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Detail
          </button>

          {/* Tiba Lebih Cepat — only when IN_TRANSIT */}
          {effectiveStatus === 'IN_TRANSIT' && (
            <button
              type="button"
              onClick={handleEarlyArrival}
              disabled={isArriving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isArriving ? (
                <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
              {isArriving ? 'Memproses...' : 'Tiba Lebih Cepat'}
            </button>
          )}

          {/* Terima & Konfirmasi — when ARRIVED (now >= eta) */}
          {effectiveStatus === 'ARRIVED' && (
            <button
              type="button"
              onClick={() => openConfirmModal(manifest)}
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

          {/* Diterima label — when ACCEPTED */}
          {effectiveStatus === 'ACCEPTED' && (
            <span className="inline-flex rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400">
              Diterima oleh Admin
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
