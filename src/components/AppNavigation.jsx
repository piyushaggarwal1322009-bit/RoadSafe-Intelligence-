'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { filterLocationSuggestions } from '@/lib/location-search';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/#risk-map', label: 'Risk Map' },
  { href: '/compare', label: 'Compare Corridors' },
  { href: '/#forecast', label: 'Forecasts' },
  { href: '/#interventions', label: 'Interventions' },
  { href: '/#settings', label: 'Settings' }
];

const defaultLocations = [
  { id: 'broadway-5th', name: 'Broadway & 5th St' },
  { id: 'elm-roundabout', name: 'Elm St Roundabout' },
  { id: 'main-st-oak-ave', name: 'Main St & Oak Ave Intersection' },
  { id: 'riverside-pkwy', name: 'Riverside Pkwy & 12th St' },
  { id: 'route-9-rural', name: 'Route 9, Mile Marker 12-14' }
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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState(defaultLocations);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/segments')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (!isMounted || !Array.isArray(payload?.segments)) return;

        const suggestions = payload.segments.map((segment) => ({
          id: segment.id,
          name: segment.name
        }));

        setLocations(suggestions.length ? suggestions : defaultLocations);
      })
      .catch(() => {
        if (isMounted) {
          setLocations(defaultLocations);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const suggestions = useMemo(
    () => filterLocationSuggestions(locations, query, 6),
    [locations, query]
  );

  const handleSelectLocation = (location) => {
    setQuery(location.name);
    setShowSuggestions(false);
    router.push(`/segment/${location.id}`);
  };

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

          <div className="topbar-picker location-picker">
            <label htmlFor="location-search">Location</label>
            <div className="location-search-wrap">
              <input
                id="location-search"
                type="text"
                className="location-search-input"
                placeholder="Search by corridor or address"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul className="location-search-list" aria-label="Location suggestions">
                  {suggestions.map((location) => (
                    <li key={location.id}>
                      <button
                        type="button"
                        className="location-search-item"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelectLocation(location)}
                      >
                        {location.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
