'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { computeRisk } from '@/lib/risk';
import { computeForecast } from '@/lib/forecast';
import RiskGauge from '@/components/RiskGauge';
import FactorBreakdown from '@/components/FactorBreakdown';
import ForecastPanel from '@/components/ForecastPanel';

const BAND_COLOR = {
  Low: '#2aa576',
  Medium: '#d7a52d',
  High: '#eb8c43',
  Severe: '#e45757'
};

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
    <div className="card comparison-column">
      <div className="comparison-card-header">
        <div>
          <p className="eyebrow subtle">Corridor</p>
          <h3>{segment.name}</h3>
        </div>
        <span className="cell-pill" style={{ color: BAND_COLOR[risk.band], background: `${BAND_COLOR[risk.band]}12` }}>
          {risk.band}
        </span>
      </div>

      <RiskGauge score={risk.score} band={risk.band} />

      <div className="mini-compare-group">
        <h4>Top factors</h4>
        <FactorBreakdown factors={risk.factors.slice(0, 4)} />
      </div>

      <div className="mini-compare-group">
        <h4>Outlook</h4>
        <ForecastPanel forecast={forecast} currentScore={risk.score} />
      </div>
    </div>
  );
}

export default function ComparePanel({ segments }) {
  const params = useSearchParams();
  const initialA = params.get('a') || segments[0]?.id;
  const initialB = segments.find((s) => s.id !== initialA)?.id || segments[1]?.id;
  const initialC = segments.find((s) => s.id !== initialA && s.id !== initialB)?.id || segments[2]?.id || initialA;

  const [ids, setIds] = useState([initialA, initialB, initialC]);

  const selectedSegments = ids.map((id) => segments.find((segment) => segment.id === id)).filter(Boolean);

  const updateSelection = (index, value) => {
    setIds((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div>
      <div className="compare-select-grid">
        {ids.map((id, index) => (
          <select key={`select-${index}`} value={id || ''} onChange={(event) => updateSelection(index, event.target.value)}>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>
        ))}
      </div>

      <div className="compare-grid">
        {selectedSegments.map((segment) => (
          <SegmentColumn key={segment.id} segment={segment} />
        ))}
      </div>

      <div className="card comparison-table-card">
        <h3>Raw conditions</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Factor</th>
                {selectedSegments.map((segment) => (
                  <th key={segment.id}>{segment.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_FIELDS.map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  {selectedSegments.map((segment) => (
                    <td key={`${segment.id}-${key}`}>{String(segment[key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
