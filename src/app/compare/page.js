import { getAllSegments } from '@/lib/markdown';
import ComparePanel from './ComparePanel';

export default function ComparePage() {
  const segments = getAllSegments();
  return (
    <main className="container">
      <h2>Compare segments</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Select two segments (or apply hypothetical conditions to either) to compare risk side by side.
      </p>
      <ComparePanel segments={segments} />
    </main>
  );
}
