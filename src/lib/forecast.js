'use strict';

/**
 * Forward-looking risk indication.
 * Combines a simple linear trend over historical crash counts with
 * any known forward pressure (planned traffic growth) to project
 * where a segment's risk is headed — not just where it is today.
 */

function linearSlope(series) {
  const n = series.length;
  if (n < 2) return 0;
  const xs = series.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = series.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (series[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

function computeForecast(segment, currentScore) {
  const history = segment.crashesLast5yr || [];
  const slope = linearSlope(history); // crashes/year change
  const growthRate = segment.trafficGrowthRate || 0; // e.g. 0.08 = 8%/yr

  const scoreDelta = Math.round((slope * 2 + growthRate * 100 * 0.5) * 10) / 10;
  const projectedScore = Math.min(100, Math.max(0, Math.round(currentScore + scoreDelta)));

  let direction = 'Stable';
  if (slope > 0.3 || growthRate > 0.03) direction = 'Increasing';
  else if (slope < -0.3 && growthRate <= 0) direction = 'Decreasing';

  const drivers = [];
  if (history.length >= 2) {
    const first = history[0];
    const last = history[history.length - 1];
    if (last !== first) {
      const pctChange = first === 0 ? null : Math.round(((last - first) / first) * 100);
      drivers.push(
        pctChange === null
          ? `Recorded crashes moved from ${first} to ${last} over the observed period.`
          : `Recorded crashes ${last > first ? 'rose' : 'fell'} from ${first} to ${last} over the observed period (${pctChange > 0 ? '+' : ''}${pctChange}%).`
      );
    }
  }
  if (growthRate > 0) {
    drivers.push(`Planned development/traffic growth of ~${Math.round(growthRate * 100)}%/yr expected on this segment.`);
  }
  if ((segment.weatherExposureIndex || 0) >= 0.3) {
    drivers.push(`${Math.round(segment.weatherExposureIndex * 100)}% of historical crashes are linked to adverse weather — seasonal risk spikes likely.`);
  }
  if (segment.schoolZone && !segment.crosswalkPresent) {
    drivers.push('School zone without a marked crosswalk — risk concentrated around school arrival/dismissal hours.');
  }
  if (drivers.length === 0) {
    drivers.push('No strong upward or downward signal detected in the available history.');
  }

  return {
    direction,
    projectedScore,
    scoreDelta,
    crashTrendPerYear: Math.round(slope * 100) / 100,
    drivers
  };
}

module.exports = { computeForecast, linearSlope };
