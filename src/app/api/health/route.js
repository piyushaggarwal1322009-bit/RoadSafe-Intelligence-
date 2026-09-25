'use strict';

const { NextResponse } = require('next/server');

async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'roadsafe-intelligence',
    timestamp: new Date().toISOString()
  });
}

module.exports = { GET };
