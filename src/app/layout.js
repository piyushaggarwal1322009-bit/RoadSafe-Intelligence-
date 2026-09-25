import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata = {
  title: 'RoadSafe Intelligence',
  description: 'Location-based road safety risk insights and intervention planning.'
};

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/#risk-map', label: 'Risk Map' },
  { href: '/compare', label: 'Compare Corridors' },
  { href: '/#forecast', label: 'Forecasts' },
  { href: '/#interventions', label: 'Interventions' },
  { href: '/#settings', label: 'Settings' }
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
                <Link key={item.label} href={item.href} className={`nav-item ${item.href === '/' ? 'active' : ''}`}>
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

            <div className="page-content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
