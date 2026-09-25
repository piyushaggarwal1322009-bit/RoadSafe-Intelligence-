'use client';

const DIR_COLOR = { Increasing: '#e8763a', Decreasing: '#3fb950', Stable: '#93a3b3' };
const DIR_ARROW = { Increasing: '▲', Decreasing: '▼', Stable: '→' };

export default function ForecastPanel({ forecast, currentScore }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ color: DIR_COLOR[forecast.direction], fontSize: 20 }}>
          {DIR_ARROW[forecast.direction]}
        </span>
        <div>
          <div style={{ fontWeight: 600 }}>{forecast.direction}</div>
          <div className="muted">
            Projected score: {forecast.projectedScore} (from {currentScore})
          </div>
        </div>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)' }}>
        {forecast.drivers.map((d, i) => <li key={i} style={{ marginBottom: 4 }}>{d}</li>)}
      </ul>
    </div>
  );
}
