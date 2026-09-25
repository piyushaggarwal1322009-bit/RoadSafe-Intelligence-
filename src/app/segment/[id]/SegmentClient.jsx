'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { computeRisk } from '@/lib/risk';
import { computeForecast } from '@/lib/forecast';
import { recommendInterventions } from '@/lib/interventions';
import RiskGauge from '@/components/RiskGauge';
import FactorBreakdown from '@/components/FactorBreakdown';
import ForecastPanel from '@/components/ForecastPanel';
import InterventionList from '@/components/InterventionList';
import WhatIfPanel from '@/components/WhatIfPanel';

const BAND_COLOR = {
  Low: '#2aa576',
  Medium: '#d7a52d',
  High: '#eb8c43',
  Severe: '#e45757'
};

export default function SegmentClient({ segment }) {
  const [overrides, setOverrides] = useState({});

  const baseline = useMemo(() => computeRisk(segment), [segment]);
  const current = useMemo(() => computeRisk(segment, overrides), [segment, overrides]);
  const forecast = useMemo(() => computeForecast({ ...segment, ...overrides }, current.score), [segment, overrides, current.score]);
  const interventions = useMemo(() => recommendInterventions({ ...segment, ...overrides }, current.factors), [segment, overrides, current.factors]);

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <main className="page-shell detail-shell">
      <section className="card detail-hero">
        <div className="detail-header-row">
          <div>
            <p className="eyebrow">Road segment</p>
            <h1>{segment.name}</h1>
            <p className="detail-description">{segment.description}</p>
          </div>
          <Link href="/" className="ghost-button">← Overview</Link>
        </div>
      </section>

      <div className="detail-grid">
        <section className="card detail-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Current risk</p>
              <h2>Risk score</h2>
            </div>
            <span className="score-status" style={{ background: `${BAND_COLOR[current.band]}1A`, color: BAND_COLOR[current.band] }}>
              {current.band}
            </span>
          </div>

          <RiskGauge score={current.score} band={current.band} />

          {hasOverrides && (
            <p className="muted detail-note">
              Recorded conditions score: {baseline.score} ({baseline.band}) — adjust the panel below to see impact.
            </p>
          )}

          <div className="detail-factor-block">
            <h3>Major contributors</h3>
            <FactorBreakdown factors={current.factors} />
          </div>
        </section>

        <section className="card detail-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Scenario</p>
              <h2>What-if conditions</h2>
            </div>
          </div>

          <WhatIfPanel
            segment={segment}
            overrides={overrides}
            onChange={setOverrides}
            onReset={() => setOverrides({})}
          />
        </section>
      </div>

      <div className="detail-grid lower-grid">
        <section className="card detail-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Forecast</p>
              <h2>Forward-looking outlook</h2>
            </div>
          </div>
          <ForecastPanel forecast={forecast} currentScore={current.score} />
        </section>

        <section className="card detail-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Interventions</p>
              <h2>Recommended actions</h2>
            </div>
          </div>
          <InterventionList interventions={interventions} />
        </section>
      </div>

      <p className="detail-link-row">
        <Link href={`/compare?a=${segment.id}`} className="text-link">Compare this segment against another →</Link>
      </p>
    </main>
  );
}
