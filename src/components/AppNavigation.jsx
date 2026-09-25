'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/#risk-map', label: 'Risk Map' },
  { href: '/compare', label: 'Compare Corridors' },
  { href: '/#forecast', label: 'Forecasts' },
  { href: '/#interventions', label: 'Interventions' },
  { href: '/#settings', label: 'Settings' }
];

function isActive(href, pathname) {
  if (href === '/') {
    return pathname === '/';
  }

  if (href.includes('#')) {
    return pathname === '/' && href.startsWith('/#');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppNavigation({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Sidebar navigation">
        <div className="brand-block">
          <div className="brand-mark">RS</div>
          <div>
            <span className="brand-label">RoadSafe</span>
            <span className="brand-subtitle">Intelligence</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-item ${isActive(item.href, pathname) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Operational status</p>
          <strong>Healthy</strong>
        </div>
      </aside>

      <div className="content-shell">
        <header className="workspace-topbar" aria-label="Application topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-nav-toggle"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="topbar-brand" aria-label="RoadSafe brand">
              <span className="brand-mark mobile-brand-mark">RS</span>
              <span>RoadSafe</span>
            </div>
          </div>

          <div className="topbar-picker">
            <label htmlFor="location-select">Location</label>
            <select id="location-select" defaultValue="downtown-corridor">
              <option value="downtown-corridor">Downtown corridor</option>
              <option value="riverfront-park">Riverfront park</option>
              <option value="broadway-5th">Broadway &amp; 5th St</option>
            </select>
          </div>

          <div className="topbar-actions">
            <button type="button" className="ghost-button">Last 30 days</button>
            <button type="button" className="icon-button" aria-label="Notifications">🔔</button>
            <div className="profile-chip" aria-label="User profile">
              <span className="profile-avatar">AR</span>
              <span>Alex Rivera</span>
            </div>
          </div>
        </header>

        {mobileOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation menu">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-item ${isActive(item.href, pathname) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}

        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
