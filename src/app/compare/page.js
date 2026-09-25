import { Suspense } from 'react';
import { getAllSegments } from '@/lib/markdown';
import ComparePanel from './ComparePanel';

export default function ComparePage() {
  const segments = getAllSegments();
  return (
    <main className="page-shell compare-page-shell">
      <section className="card compare-header-card">
        <p className="eyebrow">Corridor comparison</p>
        <h1>Compare segments</h1>
        <p className="compare-summary">
          Evaluate three corridors side by side to understand where risk is concentrated and which intervention should take priority.
        </p>
      </section>

      <Suspense fallback={<div className="card loading-card">Loading comparison…</div>}>
        <ComparePanel segments={segments} />
      </Suspense>
    </main>
  );
}