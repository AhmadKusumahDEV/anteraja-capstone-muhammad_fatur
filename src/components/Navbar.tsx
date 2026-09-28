import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useOutboundStore } from '../store/useOutboundStore';
import { BREADCRUMB_MAP } from '../constants/routes';

export default function Navbar() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const currentPathLabel = BREADCRUMB_MAP[location.pathname] || 'Dashboard';
  const { openModal } = useOutboundStore();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Jakarta',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className="
        fixed top-0 left-[var(--spacing-sidebar)] right-0 z-40
        h-[var(--spacing-navbar)]
        bg-navbar-bg border-b border-navbar-border
        flex items-center justify-between
        px-6
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
      "
      aria-label="Navigasi utama"
    >
      {/* Left Section — Dynamic Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <span>Operations</span>
        <span className="text-gray-300">/</span>
        <span>HUB-JKS-01</span>
        <span className="text-gray-300">/</span>
        <span className="text-anteraja-primary font-bold">{currentPathLabel}</span>
      </div>

      {/* Right Section — Hub+Clock pill, Notification, Quick Dispatch */}
      <div className="flex items-center gap-4">
        {/* Hub Info + Clock — unified pill */}
        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" aria-hidden="true" />
          <span className="text-gray-700 font-semibold">HUB-JKS-01 • Jaksel</span>
          <span className="text-gray-400">•</span>
          <time className="font-mono tabular-nums tracking-tight text-gray-600" dateTime={currentTime}>
            {currentTime} WIB
          </time>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-anteraja-primary"></span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Notifikasi</h3>
                <span className="text-[10px] text-gray-400 font-medium cursor-pointer hover:text-anteraja-primary">Tandai dibaca</span>
              </div>
              <div className="max-h-64 overflow-y-auto p-1">
                <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                  <div className="mt-1 h-2 w-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">120 Paket dari JKS-03 Tiba</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Truk B 9912 XZ telah merapat ke dock Inbound.</p>
                    <p className="text-[9px] text-gray-400 mt-1">Baru saja</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                  <div className="mt-1 h-2 w-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Peringatan: 5 Paket Mendekati SLA</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Sisa waktu kurang dari 30 menit. Segera prioritaskan!</p>
                    <p className="text-[9px] text-gray-400 mt-1">10 menit yang lalu</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Quick Dispatch CTA */}
        <button
          type="button"
          onClick={openModal}
          className="
            inline-flex items-center gap-2 rounded-lg
            bg-anteraja-primary px-4 py-2
            text-sm font-semibold text-white
            shadow-sm transition-all
            hover:bg-anteraja-primary-dark hover:shadow-md
            active:scale-[0.97]
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          Quick Dispatch
        </button>
      </div>
    </nav>
  );
}
