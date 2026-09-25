import { getAllSegments } from '@/lib/markdown';
import { computeRisk } from '@/lib/risk';
import RiskDashboard from '@/components/RiskDashboard';

export default function HomePage() {
  const segments = getAllSegments().map((segment) => {
    const risk = computeRisk(segment);
    return { ...segment, riskScore: risk.score, riskBand: risk.band };
  });

  return (
    <main className="page-shell">
      <RiskDashboard segments={segments} />
    </main>
  );
}
