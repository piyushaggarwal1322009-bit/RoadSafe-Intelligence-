'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { listSegments, getSegmentDetail, compareSegments, normalizeOverrides } = require('../src/lib/roadsafe-service');
const { GET: healthGET } = require('../src/app/api/health/route');

test('listSegments returns structured segment summaries', async () => {
  const segments = listSegments();

  assert.ok(Array.isArray(segments));
  assert.ok(segments.length > 0);
  assert.ok('riskScore' in segments[0]);
  assert.ok('riskBand' in segments[0]);
  assert.ok('factors' in segments[0]);
});

test('getSegmentDetail applies override values and keeps a valid risk score', async () => {
  const segment = getSegmentDetail('riverside-pkwy', { speedLimit: 25, pedestrianVolumeDaily: 650 });

  assert.ok(segment);
  assert.equal(segment.id, 'riverside-pkwy');
  assert.equal(typeof segment.riskScore, 'number');
  assert.ok(segment.riskBand);
  assert.ok(Array.isArray(segment.factors));
  assert.ok(segment.overrides && segment.overrides.speedLimit === 25);
});

test('compareSegments returns both requested segments when they exist', async () => {
  const result = compareSegments('riverside-pkwy', 'main-st-oak-ave');

  assert.equal(result.count, 2);
  assert.equal(result.segments.length, 2);
  assert.ok(result.segments.every((segment) => segment.id));
});

test('normalizeOverrides ignores invalid payloads', async () => {
  assert.deepEqual(normalizeOverrides(null), {});
  assert.deepEqual(normalizeOverrides('bad'), {});
  assert.deepEqual(normalizeOverrides({ speedLimit: 25 }), { speedLimit: 25 });
});

test('health endpoint reports service status', async () => {
  const response = await healthGET();
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.status, 'ok');
  assert.equal(payload.service, 'roadsafe-intelligence');
});
