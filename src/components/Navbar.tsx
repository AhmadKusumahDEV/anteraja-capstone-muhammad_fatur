import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useOutboundStore } from '../store/useOutboundStore';
import { useHubWeather } from '../hooks/useHubWeather';
import { BREADCRUMB_MAP } from '../constants/routes';
import { useAdminContext } from '../context/AdminContext';
import { useNotificationStore } from '../store/useNotificationStore';

interface NavbarProps {
  toggleSidebar?: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const currentPathLabel = BREADCRUMB_MAP[location.pathname] || 'Dashboard';
  const { openModal } = useOutboundStore();
  const { temperature, isLoading, isError } = useHubWeather();
  const { adminProfile } = useAdminContext();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

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
        fixed top-0 right-0 z-30
        left-0 md:left-[88px] lg:left-[260px]
        h-[var(--spacing-navbar)]
        bg-navbar-bg border-b-2 border-navbar-border
        flex items-center justify-between
        px-3 sm:px-6
        shadow-md
        transition-all duration-300
      "
      aria-label="Navigasi utama"
    >
      {/* Left Section — Dynamic Breadcrumb & Hamburger */}
      <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium text-gray-500">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none"
          aria-label="Buka Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <span className="hidden sm:inline">Operations</span>
        <span className="hidden sm:inline text-gray-300">/</span>
        <span className="hidden sm:inline">{adminProfile?.hub_id || 'Hub'}</span>
        <span className="hidden sm:inline text-gray-300">/</span>
        <span className="text-anteraja-primary font-bold">{currentPathLabel}</span>
      </div>

      {/* Right Section — Hub+Clock pill, Notification, Quick Dispatch */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Hub Info, Weather, Clock — unified pill */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" aria-hidden="true" />
          <span className="text-gray-700 font-semibold">{adminProfile?.hub_id || 'Hub'}</span>
          <span className="text-gray-400">•</span>
          
          {/* Weather Widget */}
          <div className="flex items-center gap-1 text-sky-600 font-semibold" title="Cuaca di lokasi Hub saat ini">
            {isLoading ? (
               <span className="animate-pulse">⏳</span>
            ) : isError ? (
               <span className="text-red-500">⚠️</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                <span>{temperature}°C</span>
              </>
            )}
          </div>
          <span className="text-gray-400">•</span>
          
          <time className="font-mono tabular-nums tracking-tight text-gray-600" dateTime={currentTime}>
            {currentTime} WIB
          </time>
        </div>

        {/* Short info pill for mobile/tablet */}
        <div className="flex lg:hidden items-center gap-1.5 rounded-full bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-gray-600 ring-1 ring-gray-200">
          <time className="font-mono tabular-nums tracking-tight text-gray-600" dateTime={currentTime}>
            {currentTime}
          </time>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-lg p-1.5 sm:p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            {unreadCount > 0 && (
              <span className="absolute right-0 sm:right-0.5 top-0 sm:top-0.5 flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-anteraja-primary text-[8px] font-bold text-white shadow-sm ring-1 ring-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 origin-top-right rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 sm:px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span 
                    onClick={() => markAllAsRead()} 
                    className="text-[10px] text-gray-400 font-medium cursor-pointer hover:text-anteraja-primary transition-colors"
                  >
                    Tandai semua dibaca
                  </span>
                )}
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">Tidak ada notifikasi.</div>
                ) : (
                  notifications.map((notif) => {
                    const colorMap: Record<string, string> = {
                      INFO: 'bg-blue-500',
                      WARNING: 'bg-yellow-500',
                      CRITICAL: 'bg-red-500',
                      SUCCESS: 'bg-green-500',
                    };
                    const circleColor = colorMap[notif.type] || 'bg-gray-400';

                    return (
                      <div 
                        key={notif.id}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`flex gap-3 p-3 rounded-xl transition-colors cursor-pointer mb-1 ${
                          !notif.is_read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${circleColor}`}></div>
                        <div className="flex-1">
                          <p className={`text-xs leading-tight ${!notif.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-[10px] leading-snug mt-1 ${!notif.is_read ? 'text-gray-800' : 'text-gray-500'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-1.5 font-medium">
                            {new Date(notif.created_at).toLocaleString('id-ID', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Dispatch CTA */}
        <button
          type="button"
          onClick={openModal}
          className="
            inline-flex items-center gap-1.5 sm:gap-2 rounded-lg
            bg-anteraja-primary px-2.5 py-1.5 sm:px-4 sm:py-2
            text-xs sm:text-sm font-semibold text-white
            shadow-sm transition-all
            hover:bg-anteraja-primary-dark hover:shadow-md
            active:scale-[0.97]
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          <span className="hidden sm:inline">Quick Dispatch</span>
          <span className="sm:hidden">Dispatch</span>
        </button>
      </div>
    </nav>
  );
}
