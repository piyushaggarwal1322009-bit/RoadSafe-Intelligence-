'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { computeRisk } from '@/lib/risk';
import { computeForecast } from '@/lib/forecast';
import RiskGauge from '@/components/RiskGauge';
import FactorBreakdown from '@/components/FactorBreakdown';
import ForecastPanel from '@/components/ForecastPanel';

const COMPARE_FIELDS = [
  ['roadType', 'Road type'],
  ['speedLimit', 'Speed limit'],
  ['operating85thSpeed', '85th %ile speed'],
  ['avgDailyTraffic', 'Avg. daily traffic'],
  ['pedestrianVolumeDaily', 'Pedestrian volume'],
  ['lighting', 'Lighting'],
  ['intersectionType', 'Intersection type'],
  ['crosswalkPresent', 'Crosswalk present']
];

function SegmentColumn({ segment }) {
  const risk = useMemo(() => computeRisk(segment), [segment]);
  const forecast = useMemo(() => computeForecast(segment, risk.score), [segment, risk.score]);

  return (
    <div className="card">
      <h3>{segment.name}</h3>
      <RiskGauge score={risk.score} band={risk.band} />
      <h3 style={{ marginTop: 20 }}>Top factors</h3>
      <FactorBreakdown factors={risk.factors.slice(0, 4)} />
      <h3 style={{ marginTop: 20 }}>Outlook</h3>
      <ForecastPanel forecast={forecast} currentScore={risk.score} />
    </div>
  );
}

export default function ComparePanel({ segments }) {
  const params = useSearchParams();
  const initialA = params.get('a') || segments[0]?.id;
  const initialB = segments.find((s) => s.id !== initialA)?.id || segments[1]?.id;

  const [idA, setIdA] = useState(initialA);
  const [idB, setIdB] = useState(initialB);

  const segA = segments.find((s) => s.id === idA);
  const segB = segments.find((s) => s.id === idB);

  return (
    <div>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <select value={idA} onChange={(e) => setIdA(e.target.value)}>
          {segments.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={idB} onChange={(e) => setIdB(e.target.value)}>
          {segments.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid-2">
        {segA && <SegmentColumn segment={segA} />}
        {segB && <SegmentColumn segment={segB} />}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3>Raw conditions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-muted)' }}>Factor</th>
              <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-muted)' }}>{segA?.name}</th>
              <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-muted)' }}>{segB?.name}</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_FIELDS.map(([key, label]) => (
              <tr key={key} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 0' }}>{label}</td>
                <td style={{ padding: '6px 0' }}>{String(segA?.[key])}</td>
                <td style={{ padding: '6px 0' }}>{String(segB?.[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
