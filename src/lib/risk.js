'use strict';

/**
 * Risk scoring engine for RoadSafe Intelligence.
 *
 * Pure functions only — no fs/network access — so this module can be
 * imported both by server components (initial render) and client
 * components (live "what-if" recalculation) without any duplication
 * of logic between the two.
 */

const WEIGHTS = {
  crashHistory: 0.30,
  speedRisk: 0.15,
  lighting: 0.10,
  trafficVolume: 0.10,
  pedestrianExposure: 0.15,
  intersectionComplexity: 0.10,
  weatherExposure: 0.10
};

const FACTOR_LABELS = {
  crashHistory: 'Crash history & severity',
  speedRisk: 'Speed differential',
  lighting: 'Lighting quality',
  trafficVolume: 'Traffic volume',
  pedestrianExposure: 'Pedestrian / cyclist exposure',
  intersectionComplexity: 'Intersection complexity',
  weatherExposure: 'Adverse-weather exposure'
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

const LIGHTING_SCORE = { poor: 1, moderate: 0.5, good: 0.15 };
const INTERSECTION_SCORE = {
  none: 0.1,
  unsignalized: 0.6,
  signalized: 0.35,
  roundabout: 0.2
};

/**
 * Merge raw segment data with optional "what-if" overrides, then
 * return the normalized (0-1) value of every risk factor.
 */
function normalizeFactors(segment, overrides = {}) {
  const s = { ...segment, ...overrides };

  const crashSum = (s.crashesLast5yr || []).reduce((a, b) => a + b, 0);
  const severityScore =
    (s.fatalCrashesLast5yr || 0) * 8 +
    (s.seriousInjuryCrashesLast5yr || 0) * 3 +
    crashSum;
  // Saturating curve: more history matters less at the margin.
  const crashHistory = severityScore / (severityScore + 60);

  const speedDiff = (s.operating85thSpeed || s.speedLimit || 0) - (s.speedLimit || 0);
  const speedRisk = clamp(speedDiff / 20);

  const lighting = LIGHTING_SCORE[s.lighting] ?? 0.5;

  const trafficVolume = clamp((s.avgDailyTraffic || 0) / 30000);

  let pedestrianExposure = clamp((s.pedestrianVolumeDaily || 0) / 1000);
  if (!s.crosswalkPresent) pedestrianExposure = clamp(pedestrianExposure * 1.3);
  if (s.schoolZone) pedestrianExposure = clamp(pedestrianExposure + 0.15);

  const intersectionComplexity = INTERSECTION_SCORE[s.intersectionType] ?? 0.1;

  const weatherExposure = clamp(s.weatherExposureIndex || 0);

  return {
    crashHistory,
    speedRisk,
    lighting,
    trafficVolume,
    pedestrianExposure,
    intersectionComplexity,
    weatherExposure
  };
}

function bandFor(score) {
  if (score >= 75) return 'Severe';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}

/**
 * Compute a full risk assessment for a segment.
 * @param {object} segment - parsed segment frontmatter
 * @param {object} [overrides] - fields to override for a "what-if" run
 * @returns {{score:number, band:string, factors:Array}}
 */
function computeRisk(segment, overrides = {}) {
  const normalized = normalizeFactors(segment, overrides);

  const factors = Object.keys(WEIGHTS).map((key) => {
    const value = normalized[key];
    const weight = WEIGHTS[key];
    const contribution = Math.round(value * weight * 1000) / 10; // points out of 100
    return {
      key,
      label: FACTOR_LABELS[key],
      value: Math.round(value * 100) / 100,
      weight,
      contribution
    };
  });

  const score = Math.round(
    factors.reduce((sum, f) => sum + f.contribution, 0)
  );

  factors.sort((a, b) => b.contribution - a.contribution);

  return { score: clamp(score, 0, 100), band: bandFor(clamp(score, 0, 100)), factors };
}

module.exports = { computeRisk, normalizeFactors, bandFor, WEIGHTS, FACTOR_LABELS };
