'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const BAND_COLOR = {
  Low: '#3fb950',
  Medium: '#d4a72c',
  High: '#e8763a',
  Severe: '#e5484d'
};

/**
 * Lightweight coordinate-based scatter "map". Deliberately avoids a
 * tile-server dependency (Leaflet/Mapbox) so the app renders instantly
 * with no API keys and no external network calls — swap in a real map
 * provider later without touching the risk/forecast/intervention logic.
 */
export default function SegmentMap({ segments }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  const points = useMemo(() => {
    const lats = segments.map((s) => s.lat);
    const lngs = segments.map((s) => s.lng);
    const latMin = Math.min(...lats), latMax = Math.max(...lats);
    const lngMin = Math.min(...lngs), lngMax = Math.max(...lngs);
    const pad = 40, w = 680, h = 320;

    return segments.map((s) => {
      const x = pad + ((s.lng - lngMin) / (lngMax - lngMin || 1)) * (w - pad * 2);
      const y = h - pad - ((s.lat - latMin) / (latMax - latMin || 1)) * (h - pad * 2);
      return { ...s, x, y };
    });
  }, [segments]);

  return (
    <div className="card">
      <svg width="100%" viewBox="0 0 680 320" role="img" aria-label="Map of road segments colored by risk level">
        <rect x="0" y="0" width="680" height="320" fill="#0e1620" rx="8" />
        {points.map((p) => (
          <g
            key={p.id}
            onClick={() => router.push(`/segment/${p.id}`)}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={p.x} cy={p.y} r={hovered === p.id ? 12 : 9} fill={BAND_COLOR[p.riskBand]} opacity={0.9} />
            <circle cx={p.x} cy={p.y} r={hovered === p.id ? 12 : 9} fill="none" stroke="#0b0f14" strokeWidth="1.5" />
            {hovered === p.id && (
              <text x={p.x + 16} y={p.y + 4} fontSize="12" fill="#e7edf3">
                {p.name} · {p.riskScore}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="muted" style={{ marginTop: 8 }}>
        Click a point to open its full risk assessment. Color indicates risk band (green → red = low → severe).
      </div>
    </div>
  );
}
