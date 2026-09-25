'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

const BAND_COLOR = {
  Low: '#2aa576',
  Medium: '#d7a52d',
  High: '#eb8c43',
  Severe: '#e45757'
};

let Leaflet;

function getLeaflet() {
  if (typeof window === 'undefined') return null;
  if (!Leaflet) {
    Leaflet = require('leaflet');
  }
  return Leaflet;
}

function createRiskMarker(color) {
  const L = getLeaflet();
  if (!L) return null;

  return L.divIcon({
    className: 'roadsafe-risk-marker',
    html: `<span style="background:${color};"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });
}

function FitMapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const L = getLeaflet();
    if (!L) return;

    const bounds = L.latLngBounds(points.map((segment) => [segment.lat, segment.lng]));
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 });
  }, [map, points]);

  return null;
}

export default function SegmentMap({ segments, selectedId = null }) {
  if (typeof window === 'undefined') {
    return (
      <div className="leaflet-map-shell">
        <div className="roadsafe-map" aria-label="Map loading" />
      </div>
    );
  }

  const router = useRouter();

  const points = useMemo(
    () => segments.filter(Boolean).map((segment) => ({ ...segment, riskBand: segment.riskBand || 'Low' })),
    [segments]
  );

  const center = useMemo(() => {
    if (!points.length) {
      return [40.7128, -74.006];
    }

    const averageLat = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
    const averageLng = points.reduce((sum, point) => sum + point.lng, 0) / points.length;
    return [averageLat, averageLng];
  }, [points]);

  return (
    <div className="leaflet-map-shell">
      <MapContainer center={center} zoom={11} scrollWheelZoom className="roadsafe-map">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMapBounds points={points} />

        {points.map((segment) => (
          <Marker
            key={segment.id}
            position={[segment.lat, segment.lng]}
            icon={createRiskMarker(BAND_COLOR[segment.riskBand] || BAND_COLOR.Low)}
            eventHandlers={{
              click: () => router.push(`/segment/${segment.id}`)
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{segment.name}</strong>
                <span>
                  {segment.riskBand} risk · {segment.riskScore}
                </span>
                <Link href={`/segment/${segment.id}`}>Open detail</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
