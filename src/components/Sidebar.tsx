import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAdminContext } from '../context/AdminContext';
import { useAdminProfile } from '../hooks/useAdminProfile';
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

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  // Pindahkan pengaturan mute dari HubStore ke AdminContext
  const { isAlarmMuted, toggleAlarmMute, adminProfile, logout } = useAdminContext();

  // Custom hook untuk melakukan fetch profile picture secara asynchronous
  const { isLoading, isError } = useAdminProfile();

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
      className={`
        fixed inset-y-0 left-0 z-50
        flex flex-col
        bg-sidebar-bg text-sidebar-text border-r-2 border-gray-200 shadow-2xl
        transition-all duration-300 ease-in-out
        w-[260px] md:w-[88px] lg:w-[260px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      aria-label="Sidebar navigasi"
    >
      {/* ── Brand Header ── */}
      <header className="flex items-center gap-4 px-5 md:px-2 lg:px-5 py-6 justify-center lg:justify-start">
        <img
          src={logoImg}
          alt="Anteraja Hub Logo"
          className="h-8 md:h-8 lg:h-10 w-auto max-w-[70px] lg:max-w-full object-contain flex-shrink-0 transition-all duration-300"
        />
        <div className="flex-col gap-1.5 md:hidden lg:flex">
          <span className="inline-block w-fit rounded-md bg-anteraja-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Hub Admin
          </span>
        </div>
        
        {/* Tombol tutup sidebar di mobile */}
        {isOpen && setIsOpen && (
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </header>

      {/* ── Hub Session Card ── */}
      <div className="mx-4 mb-4 rounded-xl bg-sidebar-hover px-4 py-3 md:px-2 md:mx-3 md:py-2 md:flex md:justify-center lg:px-4 lg:mx-4 lg:justify-start">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 md:h-10 md:w-10 lg:h-9 lg:w-9 items-center justify-center rounded-lg bg-anteraja-primary text-sm font-bold text-white flex-shrink-0 transition-all" aria-hidden="true">
            {adminProfile?.hub_id ? adminProfile.hub_id.split('-').pop() : '00'}
          </span>
          <div className="flex-col md:hidden lg:flex">
            <span className="text-sm font-semibold text-gray-900">{adminProfile?.hub_id || 'Loading...'}</span>
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" aria-hidden="true" />
              Active Session • Live
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 px-3" aria-label="Menu utama">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 md:text-center lg:text-left">
          <span className="md:hidden lg:inline">Main Navigation</span>
          <span className="hidden md:inline lg:hidden">Menu</span>
        </p>
        <ul className="flex flex-col gap-2 md:gap-3 lg:gap-1" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center md:justify-center lg:justify-start gap-3 rounded-xl px-3 py-2.5 md:py-3 lg:py-2.5 text-sm font-medium transition-all duration-200 relative ${isActive
                    ? 'bg-anteraja-primary text-white shadow-lg shadow-anteraja-primary/30'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-anteraja-primary'
                  }`
                }
                title={item.label}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className="md:hidden lg:block whitespace-nowrap">{item.label}</span>
                
                {/* Tooltip for tablet view */}
                <div className="hidden md:block lg:hidden absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Sidebar Footer — User Info ── */}
      {/* ── User Profile Dropdown ── */}
      <footer className="relative mt-auto border-t border-gray-200" ref={profileRef}>
        <button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex w-full items-center justify-between md:justify-center lg:justify-between px-4 py-4 md:px-2 lg:px-4 transition-colors hover:bg-sidebar-hover focus:outline-none"
        >
          <div className="flex items-center gap-3 md:gap-0 lg:gap-3">
            {isLoading ? (
              // Loading Spinner State
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-hover flex-shrink-0">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-anteraja-primary border-t-transparent"></div>
              </div>
            ) : isError || !adminProfile || !adminProfile.pictureUrl ? (
              // Error / Fallback State
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-xs font-bold text-white flex-shrink-0" aria-hidden="true">
                {adminProfile?.name ? adminProfile.name.substring(0, 2).toUpperCase() : 'AB'}
              </span>
            ) : (
              // Success Data State
              <img
                src={adminProfile.pictureUrl}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover shadow-sm flex-shrink-0"
              />
            )}

            <div className="flex-col overflow-hidden text-left md:hidden lg:flex">
              <span className="truncate text-sm font-semibold text-gray-900">
                {adminProfile?.name || 'Admin Budi'}
              </span>
              <span className="flex items-center gap-1 truncate text-xs text-sidebar-text">
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isLoading ? 'bg-yellow-400 animate-pulse' : isError ? 'bg-red-500' : 'bg-emerald-500'}`} aria-hidden="true" />
                ID: {adminProfile?.hub_id || 'ADM-102'}
              </span>
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute bottom-full left-4 md:left-[90px] lg:left-4 mb-2 w-64 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 md:slide-in-from-left-2 lg:slide-in-from-bottom-2">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Pengaturan Sistem
              </div>
              <button
                type="button"
                onClick={toggleAlarmMute}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  {isAlarmMuted ? (
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
                <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${isAlarmMuted ? 'bg-red-500' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAlarmMuted ? 'translate-x-4' : 'translate-x-1'}`} />
                </div>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={logout}
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
