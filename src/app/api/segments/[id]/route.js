'use strict';

const { NextResponse } = require('next/server');
const { getSegmentDetail } = require('../../../../lib/roadsafe-service');

async function GET(_request, { params }) {
  const segment = getSegmentDetail(params.id);

  if (!segment) {
    return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
  }

  return NextResponse.json(segment);
}

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
    ...segment,
    overrides: payload
  });
}

module.exports = { GET, POST };
