import { NextResponse } from 'next/server';
import { getAllSegments } from '@/lib/markdown';
import { computeRisk } from '@/lib/risk';

// Segment data only changes when content/segments/*.md changes at build
// time, so this route is rendered once at build and cached — avoiding
// any runtime filesystem access in the deployed serverless function.
export const dynamic = 'force-static';

export async function GET() {
  const segments = getAllSegments().map((s) => {
    const risk = computeRisk(s);
    return { ...s, riskScore: risk.score, riskBand: risk.band };
  });
  return NextResponse.json({ count: segments.length, segments });
}
