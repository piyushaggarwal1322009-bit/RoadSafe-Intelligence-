'use strict';

const { NextResponse } = require('next/server');
const { compareSegments } = require('../../../../lib/roadsafe-service');

async function GET(request) {
  const url = new URL(request.url);
  const a = url.searchParams.get('a');
  const b = url.searchParams.get('b');

  if (!a || !b) {
    return NextResponse.json(
      { error: 'Both a and b segment IDs are required.' },
      { status: 400 }
    );
  }

  const result = compareSegments(a, b);
  return NextResponse.json(result);
}

module.exports = { GET };
