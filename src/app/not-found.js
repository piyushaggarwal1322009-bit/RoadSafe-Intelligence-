import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container">
      <h2>Segment not found</h2>
      <p className="muted">That road segment doesn&apos;t exist in the dataset.</p>
      <Link href="/">&larr; Back to all segments</Link>
    </main>
  );
}
