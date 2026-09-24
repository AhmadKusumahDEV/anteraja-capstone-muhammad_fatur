import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const BREADCRUMB_MAP: Record<string, string> = {
  '/sla-queue': 'Priority SLA Queue',
  '/inbound': 'Inbound Sorting',
  '/outbound': 'Outbound Dispatch',
  '/manifest-generator': 'Manifest Data Generator',
};

export default function Navbar() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const location = useLocation();
  const currentPathLabel = BREADCRUMB_MAP[location.pathname] || 'Dashboard';

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

        {/* Notification Bell */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Notifikasi"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          {/* Notification badge placeholder */}
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sla-critical text-[10px] font-bold text-white" aria-label="24 notifikasi baru">
            24
          </span>
        </button>

        {/* Quick Dispatch CTA */}
        <button
          type="button"
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
