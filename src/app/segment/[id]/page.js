import { notFound } from 'next/navigation';
import { getAllSegments, getSegmentById } from '@/lib/markdown';
import SegmentClient from './SegmentClient';

export function generateStaticParams() {
  return getAllSegments().map((s) => ({ id: s.id }));
}

export default function SegmentPage({ params }) {
  const segment = getSegmentById(params.id);
  if (!segment) return notFound();
  return <SegmentClient segment={segment} />;
}
