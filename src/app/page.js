import Link from 'next/link';
import { getAllSegments } from '@/lib/markdown';
import { computeRisk } from '@/lib/risk';
import SegmentMap from '@/components/SegmentMap';

export default function HomePage() {
  const segments = getAllSegments().map((s) => {
    const risk = computeRisk(s);
    return { ...s, riskScore: risk.score, riskBand: risk.band };
  });

  const sorted = [...segments].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <main className="container">
      <p className="muted" style={{ marginBottom: 18 }}>
        {segments.length} monitored road segments. Data is sourced from Markdown files under{' '}
        <code>content/segments/</code> — edit or add a file to add a new segment.
      </p>

      <SegmentMap segments={segments} />

      <div className="card" style={{ marginTop: 20 }}>
        <h2>Segments by risk</h2>
        <ul className="segment-list">
          {sorted.map((s) => (
            <li key={s.id}>
              <div>
                <div className="segment-name">
                  <Link href={`/segment/${s.id}`}>{s.name}</Link>
                </div>
                <div className="segment-sub">{s.roadType} · ADT {s.avgDailyTraffic?.toLocaleString()}</div>
              </div>
              <span className={`badge ${s.riskBand}`}>{s.riskBand} · {s.riskScore}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
