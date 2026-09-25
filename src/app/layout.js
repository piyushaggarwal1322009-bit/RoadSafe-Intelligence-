import AppNavigation from '@/components/AppNavigation';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata = {
  title: 'RoadSafe Intelligence',
  description: 'Location-based road safety risk insights and intervention planning.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppNavigation>{children}</AppNavigation>
      </body>
    </html>
  );
}
