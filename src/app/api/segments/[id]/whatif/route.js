'use strict';

const { NextResponse } = require('next/server');
const { getSegmentDetail } = require('../../../../../lib/roadsafe-service');

async function POST(request, { params }) {
  let payload = {};

  try {
    payload = await request.json();
  } catch (error) {
    payload = {};
  }

  const segment = getSegmentDetail(params.id, payload);

  if (!segment) {
    return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: segment.id,
    name: segment.name,
    riskScore: segment.riskScore,
    riskBand: segment.riskBand,
    factors: segment.factors,
    forecast: segment.forecast,
    interventions: segment.interventions,
    overrides: payload
  });
}

module.exports = { POST };
