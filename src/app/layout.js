import './globals.css';

export const metadata = {
  title: 'RoadSafe Intelligence',
  description: 'Location-based road safety risk insights and intervention planning.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <h1>RoadSafe Intelligence</h1>
          <nav>
            <a href="/">Map & segments</a>
            <a href="/compare">Compare</a>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
