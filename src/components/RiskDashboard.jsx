'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { computeRisk } from '@/lib/risk';
import { computeForecast } from '@/lib/forecast';
import { recommendInterventions } from '@/lib/interventions';
import FactorBreakdown from '@/components/FactorBreakdown';
import RiskGauge from '@/components/RiskGauge';

const SegmentMap = dynamic(() => import('@/components/SegmentMap'), {
  ssr: false,
  loading: () => <div className="leaflet-map-shell"><div className="roadsafe-map" aria-label="Map loading" /></div>
});

const BAND_COLOR = {
  Low: '#2aa576',
  Medium: '#d7a52d',
  High: '#eb8c43',
  Severe: '#e45757'
};

function toK(value) {
  if (value == null) return '—';
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return value.toString();
}

function buildScenario(segment, scenario) {
  const baseTraffic = segment.avgDailyTraffic || 15000;
  const trafficFactor = 0.7 + (scenario.traffic / 100) * 0.9;
  const speedBias = (scenario.speed - 50) / 50 * 18;

  return {
    avgDailyTraffic: Math.round(baseTraffic * trafficFactor),
    lighting: scenario.lighting > 72 ? 'good' : scenario.lighting > 38 ? 'moderate' : 'poor',
    operating85thSpeed: Math.round((segment.speedLimit || 30) + 6 + speedBias),
    weatherExposureIndex: (scenario.weather / 100) * 0.85,
    crosswalkPresent: segment.crosswalkPresent,
    schoolZone: segment.schoolZone,
    intersectionType: segment.intersectionType,
    speedLimit: segment.speedLimit,
    trafficGrowthRate: segment.trafficGrowthRate
  };
}

function buildForecastSeries(score, direction) {
  const start = Math.max(12, score - 18);
  const points = Array.from({ length: 7 }, (_, index) => {
    const wave = Math.sin(index / 1.8) * 6;
    const drift = direction === 'Increasing' ? index * 2.1 : direction === 'Decreasing' ? -index * 1.35 : index * 0.3;
    return Math.max(8, Math.min(95, Math.round(start + wave + drift)));
  });

  return points.map((value, index) => ({
    label: `${index + 1}d`,
    value
  }));
}

function ForecastSparkline({ points }) {
  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  const width = 320;
  const height = 120;
  const padding = 12;

  const path = points
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / (points.length - 1);
      const y = height - padding - ((point.value - min) / (max - min || 1)) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Risk forecast chart" className="forecast-svg">
      <path d={path} fill="none" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => {
        const x = padding + (index * (width - padding * 2)) / (points.length - 1);
        const y = height - padding - ((point.value - min) / (max - min || 1)) * (height - padding * 2);
        return <circle key={point.label} cx={x} cy={y} r={index === points.length - 1 ? 5 : 3} fill="var(--teal)" />;
      })}
    </svg>
  );
}

export default function RiskDashboard({ segments }) {
  const sorted = useMemo(() => [...segments].sort((a, b) => b.avgDailyTraffic - a.avgDailyTraffic), [segments]);
  const [selectedId, setSelectedId] = useState(sorted[0]?.id || segments[0]?.id);
  const [scenario, setScenario] = useState({
    traffic: 68,
    lighting: 46,
    speed: 62,
    weather: 42
  });

  const selectedSegment = useMemo(
    () => sorted.find((segment) => segment.id === selectedId) || sorted[0] || segments[0],
    [selectedId, sorted, segments]
  );

  const scenarioOverrides = useMemo(() => buildScenario(selectedSegment, scenario), [selectedSegment, scenario]);
  const currentRisk = useMemo(() => computeRisk(selectedSegment, scenarioOverrides), [selectedSegment, scenarioOverrides]);
  const forecast = useMemo(
    () => computeForecast({ ...selectedSegment, ...scenarioOverrides }, currentRisk.score),
    [selectedSegment, scenarioOverrides, currentRisk.score]
  );
  const interventions = useMemo(
    () => recommendInterventions({ ...selectedSegment, ...scenarioOverrides }, currentRisk.factors, 3),
    [selectedSegment, scenarioOverrides, currentRisk.factors]
  );

  const compareSegments = sorted.slice(0, 3);
  const trendPoints = buildForecastSeries(currentRisk.score, forecast.direction);
  const topFactor = currentRisk.factors[0];
  const severeIncidents = selectedSegment.fatalCrashesLast5yr + selectedSegment.seriousInjuryCrashesLast5yr;

  const handleScenarioChange = (key, value) => {
    setScenario((prev) => ({ ...prev, [key]: Number(value) }));
  };

  return (
    <>
      <section className="hero-panel card">
        <div className="hero-copy">
          <p className="eyebrow">Selected location</p>
          <h1>{selectedSegment.name}</h1>
          <p className="hero-summary">
            {selectedSegment.description || 'Operational risk is being driven by high-speed approach behavior, pedestrian conflict, and recurring crash exposure during peak periods.'}
          </p>
        </div>

        <div className="hero-score">
          <div className="score-header-row">
            <div>
              <p className="eyebrow subtle">Current risk score</p>
              <div className="risk-value-block">
                <span className="score-number" style={{ color: BAND_COLOR[currentRisk.band] }}>
                  {currentRisk.score}
                </span>
                <span className="score-status" style={{ background: `${BAND_COLOR[currentRisk.band]}1A`, color: BAND_COLOR[currentRisk.band] }}>
                  {currentRisk.band}
                </span>
              </div>
            </div>
            <div className="score-rail" aria-label={`Risk score progress, ${currentRisk.score} out of 100`}>
              <span style={{ width: `${currentRisk.score}%`, background: BAND_COLOR[currentRisk.band] }} />
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Key safety metrics">
        <article className="metric-card card">
          <span className="metric-label">Crashes</span>
          <strong>{selectedSegment.crashesLast5yr?.[selectedSegment.crashesLast5yr.length - 1] || 0}</strong>
          <small>Last recorded year</small>
        </article>
        <article className="metric-card card">
          <span className="metric-label">Severe incidents</span>
          <strong>{severeIncidents}</strong>
          <small>Fatal + serious injury</small>
        </article>
        <article className="metric-card card">
          <span className="metric-label">Pedestrian exposure</span>
          <strong>{toK(selectedSegment.pedestrianVolumeDaily || 0)}</strong>
          <small>Daily foot traffic</small>
        </article>
        <article className="metric-card card">
          <span className="metric-label">Speed compliance</span>
          <strong>{Math.max(8, 100 - Math.round((selectedSegment.operating85thSpeed - selectedSegment.speedLimit) * 2.2))}%</strong>
          <small>Within posted limit</small>
        </article>
        <article className="metric-card card">
          <span className="metric-label">Predicted change</span>
          <strong>{forecast.scoreDelta >= 0 ? '+' : ''}{forecast.scoreDelta}</strong>
          <small>{forecast.direction}</small>
        </article>
      </section>

      <section className="action-grid">
        <article className="card recommendation-box">
          <p className="eyebrow">Recommended next action</p>
          <h2>{interventions[0]?.title || 'Maintain current monitoring plan'}</h2>
          <p>{interventions[0]?.rationale || 'No major intervention is required beyond routine maintenance and targeted enforcement.'}</p>
          <div className="recommendation-meta">
            <span>Expected safety impact</span>
            <strong>{interventions[0]?.expectedImpact || 'Medium'}</strong>
          </div>
        </article>

        <article className="card highlight-box">
          <p className="eyebrow">Current operating conditions</p>
          <ul className="detail-list compact">
            <li>
              <span>Traffic intensity</span>
              <strong>{scenario.traffic}%</strong>
            </li>
            <li>
              <span>Lighting quality</span>
              <strong>{scenarioOverrides.lighting}</strong>
            </li>
            <li>
              <span>Peak risk driver</span>
              <strong>{topFactor?.label || 'Crash history'}</strong>
            </li>
          </ul>
        </article>
      </section>

      <section id="risk-map" className="card map-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Risk map</p>
            <h2>Corridor risk hotspots</h2>
          </div>
          <div className="legend" aria-label="Risk level legend">
            <span><i className="swatch low" />Low</span>
            <span><i className="swatch medium" />Moderate</span>
            <span><i className="swatch high" />High</span>
            <span><i className="swatch severe" />Severe</span>
          </div>
        </div>

        <div className="map-layout">
          <div className="map-panel">
            <SegmentMap segments={sorted} selectedId={selectedId} />
          </div>

          <aside className="segment-side-panel" aria-live="polite">
            <div className="panel-header-row">
              <div>
                <p className="eyebrow subtle">Selected segment</p>
                <h3>{selectedSegment.name}</h3>
              </div>
              <Link href={`/segment/${selectedSegment.id}`} className="text-link">
                Open detail
              </Link>
            </div>

            <RiskGauge score={currentRisk.score} band={currentRisk.band} />

            <ul className="detail-list">
              <li>
                <span>Recent trend</span>
                <strong>{forecast.direction}</strong>
              </li>
              <li>
                <span>Forecast</span>
                <strong>{forecast.projectedScore} / 100</strong>
              </li>
              <li>
                <span>Leading factor</span>
                <strong>{topFactor?.label || 'Crash exposure'}</strong>
              </li>
            </ul>

            <div className="side-factor-list">
              {currentRisk.factors.slice(0, 4).map((factor) => (
                <div key={factor.key} className="mini-factor">
                  <div className="mini-factor-header">
                    <span>{factor.label}</span>
                    <strong>{factor.contribution.toFixed(1)} pts</strong>
                  </div>
                  <div className="mini-track">
                    <span style={{ width: `${Math.max(10, factor.contribution)}%`, background: BAND_COLOR[currentRisk.band] }} />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="content-grid">
        <article className="card contributors-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Risk contributors</p>
              <h2>Why the score is elevated</h2>
            </div>
          </div>
          <FactorBreakdown factors={currentRisk.factors.slice(0, 6)} />
        </article>

        <article className="card simulation-card">
          <div className="section-head compact-head">
            <div>
              <p className="eyebrow">Scenario simulator</p>
              <h2>What-if conditions</h2>
            </div>
          </div>

          <div className="slider-stack">
            <label className="slider-row">
              <span>Traffic intensity</span>
              <strong>{scenario.traffic}%</strong>
              <input type="range" min="20" max="100" value={scenario.traffic} onChange={(event) => handleScenarioChange('traffic', event.target.value)} />
            </label>
            <label className="slider-row">
              <span>Lighting quality</span>
              <strong>{scenario.lighting}%</strong>
              <input type="range" min="10" max="100" value={scenario.lighting} onChange={(event) => handleScenarioChange('lighting', event.target.value)} />
            </label>
            <label className="slider-row">
              <span>Speed compliance</span>
              <strong>{scenario.speed}%</strong>
              <input type="range" min="20" max="100" value={scenario.speed} onChange={(event) => handleScenarioChange('speed', event.target.value)} />
            </label>
            <label className="slider-row">
              <span>Weather exposure</span>
              <strong>{scenario.weather}%</strong>
              <input type="range" min="0" max="100" value={scenario.weather} onChange={(event) => handleScenarioChange('weather', event.target.value)} />
            </label>
          </div>

          <div className="simulator-summary">
            <div>
              <small>Updated score</small>
              <strong>{currentRisk.score}</strong>
            </div>
            <div>
              <small>Recommended action</small>
              <strong>{interventions[0]?.title || 'Keep monitoring'}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="card comparison-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Location comparison</p>
            <h2>Compare corridors and intersections</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Current risk</th>
                <th>Peak risk</th>
                <th>Leading factor</th>
                <th>Best intervention</th>
              </tr>
            </thead>
            <tbody>
              {compareSegments.map((segment) => {
                const risk = computeRisk(segment);
                const forecastResult = computeForecast(segment, risk.score);
                return (
                  <tr key={segment.id}>
                    <td>
                      <div className="row-location">
                        <span className="dot" style={{ background: BAND_COLOR[risk.band] }} />
                        <div>
                          <strong>{segment.name}</strong>
                          <small>{segment.roadType}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="cell-pill" style={{ color: BAND_COLOR[risk.band], background: `${BAND_COLOR[risk.band]}12` }}>
                        {risk.score}
                      </span>
                    </td>
                    <td>{forecastResult.projectedScore}</td>
                    <td>{risk.factors[0]?.label || 'Crash history'}</td>
                    <td>
                      {recommendInterventions(segment, risk.factors, 1)[0]?.title || 'Optimize signal timing'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bottom-grid">
        <article id="forecast" className="card forecast-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Forecast</p>
              <h2>Projected risk trend</h2>
            </div>
            <span className="pill-tag">Next 7 days</span>
          </div>
          <ForecastSparkline points={trendPoints} />
          <div className="forecast-footnote">
            <span>Current {currentRisk.score}</span>
            <span>Projected {forecast.projectedScore}</span>
          </div>
        </article>

        <article id="interventions" className="card interventions-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Interventions</p>
              <h2>Priority actions</h2>
            </div>
          </div>

          <div className="intervention-stack">
            {interventions.map((intervention, index) => (
              <div key={`${intervention.title}-${index}`} className="intervention-item">
                <div className="intervention-topline">
                  <span className="priority-number">0{index + 1}</span>
                  <strong>{intervention.title}</strong>
                </div>
                <p>{intervention.rationale}</p>
                <div className="intervention-meta">
                  <span>{intervention.expectedImpact}</span>
                  <span>{intervention.estimatedReduction}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section id="settings" className="card settings-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Settings</p>
            <h2>Network operations</h2>
          </div>
        </div>

        <div className="settings-grid">
          <div>
            <span className="settings-label">Alert threshold</span>
            <strong>75 risk score</strong>
          </div>
          <div>
            <span className="settings-label">Safety mode</span>
            <strong>Protected pedestrian phasing</strong>
          </div>
          <div>
            <span className="settings-label">Weather sensitivity</span>
            <strong>Moderate</strong>
          </div>
        </div>
      </section>
    </>
  );
}
