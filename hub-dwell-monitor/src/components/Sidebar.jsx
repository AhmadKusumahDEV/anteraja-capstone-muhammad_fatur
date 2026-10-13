import React from 'react';

export function Sidebar({ activePage, onSelectPage }) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const logoUrl = `${cleanBase}logo.png`;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'ai-insight', label: 'AI Insight', icon: '✨' },
    { id: 'data-notes', label: 'Data Notes', icon: '📄' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo-area">
          <img src={logoUrl} alt="Anteraja Hub Monitor Logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            HUB DWELL<br />
            <span style={{ fontWeight: 400, opacity: 0.8, fontSize: '11px' }}>JKT Gateway</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onSelectPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onSelectPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
