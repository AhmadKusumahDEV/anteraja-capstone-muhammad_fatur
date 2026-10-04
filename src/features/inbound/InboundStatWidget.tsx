import { useInboundStore } from '../../store/useInboundStore';

export default function InboundStatWidget() {
  const { manifests } = useInboundStore();
  const todayStr = new Date().toDateString();
  
  // Filter HANYA manifest yang jadwal kedatangannya (ETA) adalah hari ini
  const todaysManifests = manifests.filter((m) => {
    const etaDate = typeof m.eta_timestamp === 'number'
      ? new Date(m.eta_timestamp)
      : new Date(m.eta_timestamp);
    return etaDate.toDateString() === todayStr;
  });

  const totalHariIni = todaysManifests.length;
  const now = Date.now();
  
  const sudahTiba = todaysManifests.filter((m) => {
    // Pastikan eta_timestamp direpresentasikan sebagai angka (timestamp)
    const eta = typeof m.eta_timestamp === 'number' 
      ? m.eta_timestamp 
      : new Date(m.eta_timestamp).getTime();
      
    const isPastEta = now >= eta;

    return (
      m.status === 'SUDAH_DITERIMA' || 
      m.status === 'MENUNGGU_KONFIRMASI' || 
      (m.status === 'MENUNGGU_KEDATANGAN' && isPastEta)
    );
  }).length;
  
  const masihDiJalan = todaysManifests.filter((m) => {
    const eta = typeof m.eta_timestamp === 'number' 
      ? m.eta_timestamp 
      : new Date(m.eta_timestamp).getTime();
      
    const isPastEta = now >= eta;

    return m.status === 'MENUNGGU_KEDATANGAN' && !isPastEta;
  }).length;

  return (
    <article className="rounded-2xl border border-surface-border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Armada Masuk Hari Ini
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Jadwal pengiriman dari Hub asal
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 flex-shrink-0">
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
      </div>

      <div className="mt-2 mb-4">
        <p className="text-4xl font-bold tabular-nums text-gray-900">
          {totalHariIni}
          <span className="ml-1.5 text-base font-medium text-gray-400">
            Truk Terjadwal
          </span>
        </p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 p-3 ring-1 ring-emerald-100/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80">
              Telah Tiba
            </span>
            <span className="text-xl font-black leading-none text-emerald-700 mt-0.5">
              {sudahTiba}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-100/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/80">
              Di Jalan
            </span>
            <span className="text-xl font-black leading-none text-amber-700 mt-0.5">
              {masihDiJalan}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
