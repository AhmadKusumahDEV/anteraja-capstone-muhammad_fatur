import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useHubStore } from '../store/useHubStore';
import logoImg from '../assets/logo.png';

/** Navigation menu items */
const NAV_ITEMS = [
  {
    label: 'Inbound Sorting',
    path: '/inbound',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'SLA Queue',
    path: '/sla-queue',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    badge: true,
  },
  {
    label: 'Outbound Dispatch',
    path: '/outbound',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
    ),
  },
  {
    label: 'Manifest Generator',
    path: '/manifest-generator',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    ),
  },
] as const;

export default function Sidebar() {
  const { isMuted, toggleMute } = useHubStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-50
        flex w-[var(--spacing-sidebar)] flex-col
        bg-sidebar-bg
        text-sidebar-text
      "
      aria-label="Sidebar navigasi"
    >
      {/* ── Brand Header ── */}
      <header className="flex items-center gap-4 px-5 py-6">
        <img
          src={logoImg}
          alt="Anteraja Hub Logo"
          width={81}
          height={81}
          className="rounded-xl flex-shrink-0"
        />
        <div className="flex flex-col gap-1.5">
          <span className="inline-block w-fit rounded-md bg-anteraja-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Hub Admin
          </span>
        </div>
      </header>

      {/* ── Hub Session Card ── */}
      <div className="mx-4 mb-4 rounded-xl bg-sidebar-hover px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-anteraja-primary text-sm font-bold text-white" aria-hidden="true">
            J4
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Hub JKT-04</span>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              Active Session • Live
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 px-3" aria-label="Menu utama">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-text/50">
          Main Navigation
        </p>
        <ul className="flex flex-col gap-1" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-anteraja-primary text-white shadow-lg shadow-anteraja-primary/30'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Sidebar Footer — User Info ── */}
      {/* ── User Profile Dropdown ── */}
      <footer className="relative mt-auto border-t border-white/10" ref={profileRef}>
        <button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-sidebar-hover focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-anteraja-primary to-purple-600 text-xs font-bold text-white" aria-hidden="true">
              AB
            </span>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="truncate text-sm font-semibold text-white">
                Admin Budi
              </span>
              <span className="flex items-center gap-1 truncate text-xs text-sidebar-text">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                ID: ADM-102
              </span>
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute bottom-full left-4 mb-2 w-64 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Pengaturan Sistem
              </div>
              <button
                type="button"
                onClick={toggleMute}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>Mute Alarm Kapasitas</span>
                </div>
                {/* Toggle UI */}
                <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${isMuted ? 'bg-red-500' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isMuted ? 'translate-x-4' : 'translate-x-1'}`} />
                </div>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </footer>
    </aside>
  );
}
