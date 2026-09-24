import { NavLink } from 'react-router-dom';
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
          <span className="text-base font-bold tracking-wide text-white leading-none pl-1">
            anteraja
          </span>
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
      <footer className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-anteraja-primary to-purple-600 text-xs font-bold text-white" aria-hidden="true">
            AB
          </span>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold text-white">
              Admin Budi
            </span>
            <span className="flex items-center gap-1 truncate text-xs text-sidebar-text">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              ID: ADM-102 • Hub Operator
            </span>
          </div>
        </div>
      </footer>
    </aside>
  );
}
