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

export default function SegmentClient({ segment }) {
  const [overrides, setOverrides] = useState({});

  const baseline = useMemo(() => computeRisk(segment), [segment]);
  const current = useMemo(() => computeRisk(segment, overrides), [segment, overrides]);
  const forecast = useMemo(() => computeForecast({ ...segment, ...overrides }, current.score), [segment, overrides, current.score]);
  const interventions = useMemo(() => recommendInterventions({ ...segment, ...overrides }, current.factors), [segment, overrides, current.factors]);

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <main className="container">
      <p className="muted"><Link href="/">&larr; All segments</Link></p>
      <h2 style={{ marginTop: 4 }}>{segment.name}</h2>
      <p className="muted" style={{ marginBottom: 20 }}>{segment.description}</p>

      <div className="grid-2">
        <div className="card">
          <h3>Current risk score</h3>
          <RiskGauge score={current.score} band={current.band} />
          {hasOverrides && (
            <p className="muted" style={{ marginTop: 10 }}>
              Recorded conditions score: {baseline.score} ({baseline.band}) — adjust the panel below to see impact.
            </p>
          )}

          <h3 style={{ marginTop: 24 }}>Major contributing factors</h3>
          <FactorBreakdown factors={current.factors} />
        </div>

        <div className="card">
          <h3>What-if: change conditions</h3>
          <WhatIfPanel
            segment={segment}
            overrides={overrides}
            onChange={setOverrides}
            onReset={() => setOverrides({})}
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <h3>Forward-looking outlook</h3>
          <ForecastPanel forecast={forecast} currentScore={current.score} />
        </div>

        <div className="card">
          <h3>Recommended interventions</h3>
          <InterventionList interventions={interventions} />
        </div>
      </div>

      <p className="muted" style={{ marginTop: 20 }}>
        <Link href={`/compare?a=${segment.id}`}>Compare this segment against another &rarr;</Link>
      </p>
    </main>
  );
}
