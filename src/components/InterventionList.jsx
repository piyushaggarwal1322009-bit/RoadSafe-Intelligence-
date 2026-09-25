'use client';

export default function InterventionList({ interventions }) {
  if (!interventions.length) {
    return <p className="muted">No high-priority interventions identified for current conditions.</p>;
  }
  return (
    <div>
      {interventions.map((rec, i) => (
        <div className="intervention" key={i}>
          <h4>{rec.title}</h4>
          <p>{rec.rationale}</p>
          <div className="meta">
            Addresses: {rec.addressesFactor} · Expected impact: {rec.expectedImpact} · Est. reduction: {rec.estimatedReduction}
          </div>
        </div>
      ))}
    </div>
  );
}
