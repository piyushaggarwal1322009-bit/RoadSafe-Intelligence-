'use strict';

const { NextResponse } = require('next/server');
const { listSegments } = require('../../../lib/roadsafe-service');

exports.dynamic = 'force-static';

async function GET() {
  const segments = listSegments().map((segment) => ({
    id: segment.id,
    name: segment.name,
    lat: segment.lat,
    lng: segment.lng,
    roadType: segment.roadType,
    riskScore: segment.riskScore,
    riskBand: segment.riskBand
  }));

  return NextResponse.json({ count: segments.length, segments });
}

module.exports = { GET };
