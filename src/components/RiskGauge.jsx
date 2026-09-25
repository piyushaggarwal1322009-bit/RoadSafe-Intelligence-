'use client';

const BAND_COLOR = { Low: '#3fb950', Medium: '#d4a72c', High: '#e8763a', Severe: '#e5484d' };

export default function RiskGauge({ score, band, label }) {
  return (
    <div>
      {label && <div className="muted" style={{ marginBottom: 4 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span className="score-big" style={{ color: BAND_COLOR[band] }}>{score}</span>
        <span className={`badge ${band}`}>{band} risk</span>
      </div>
      <div className="factor-track" style={{ marginTop: 10, height: 10 }}>
        <div
          className="factor-fill"
          style={{ width: `${score}%`, background: BAND_COLOR[band] }}
        />
      </div>
    </div>
  );
}
