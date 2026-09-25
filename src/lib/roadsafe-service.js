'use strict';

const { getAllSegments, getSegmentById } = require('./markdown');
const { computeRisk } = require('./risk');
const { computeForecast } = require('./forecast');
const { recommendInterventions } = require('./interventions');

function normalizeOverrides(payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }

  return { ...payload };
}

function summarizeSegment(segment, overrides = {}) {
  const normalizedOverrides = normalizeOverrides(overrides);
  const augmentedSegment = { ...segment, ...normalizedOverrides };
  const risk = computeRisk(segment, normalizedOverrides);
  const forecast = computeForecast(augmentedSegment, risk.score);
  const interventions = recommendInterventions(augmentedSegment, risk.factors, 3);

  return {
    ...segment,
    ...normalizedOverrides,
    riskScore: risk.score,
    riskBand: risk.band,
    factors: risk.factors,
    forecast,
    interventions,
    overrides: normalizedOverrides,
    summary: {
      riskScore: risk.score,
      riskBand: risk.band,
      leadingFactor: risk.factors[0]?.label || 'Crash history',
      projectedRisk: forecast.projectedScore
    }
  };
}

function listSegments() {
  return getAllSegments().map((segment) => summarizeSegment(segment));
}

function getSegmentDetail(id, overrides = {}) {
  const segment = getSegmentById(id);
  if (!segment) return null;
  return summarizeSegment(segment, overrides);
}

function compareSegments(idA, idB) {
  const ids = [idA, idB].filter(Boolean);
  const segments = ids
    .map((id) => getSegmentDetail(id))
    .filter(Boolean);

  return {
    count: segments.length,
    segments
  };
}

module.exports = {
  listSegments,
  getSegmentDetail,
  compareSegments,
  summarizeSegment,
  normalizeOverrides
};
