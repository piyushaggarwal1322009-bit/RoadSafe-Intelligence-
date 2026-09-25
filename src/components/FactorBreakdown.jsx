'use client';

export default function FactorBreakdown({ factors }) {
  const max = Math.max(...factors.map((f) => f.contribution), 1);
  return (
    <div>
      {factors.map((f) => (
        <div className="factor-row" key={f.key}>
          <div className="factor-label">
            <span>{f.label}</span>
            <span>{f.contribution.toFixed(1)} pts</span>
          </div>
          <div className="factor-track">
            <div
              className="factor-fill"
              style={{
                width: `${(f.contribution / max) * 100}%`,
                background: 'var(--accent)'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
