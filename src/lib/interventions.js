'use strict';

/**
 * Maps the leading risk factors for a segment to concrete, justified
 * safety interventions. Rule-based (not ML) by deliberate choice —
 * intervention recommendations need to be auditable and defensible
 * to a traffic engineer, not a black-box output.
 */

const RULES = {
  crashHistory: () => ({
    title: 'Targeted engineering & enforcement review',
    rationale: 'Elevated crash frequency/severity history indicates a systemic issue that a site-specific engineering study should diagnose before further investment.',
    expectedImpact: 'Medium',
    estimatedReduction: '5-10 pts'
  }),
  speedRisk: (s) => ({
    title: s.operating85thSpeed - s.speedLimit >= 15
      ? 'Traffic calming (speed humps/chicanes) and speed-limit review'
      : 'Dynamic speed-feedback signage',
    rationale: `Vehicles are traveling roughly ${Math.max(0, (s.operating85thSpeed || s.speedLimit) - s.speedLimit)} mph over the posted limit on average (85th percentile), the single largest driver of crash severity.`,
    expectedImpact: 'High',
    estimatedReduction: '8-15 pts'
  }),
  lighting: () => ({
    title: 'Upgrade to full-coverage LED street lighting',
    rationale: 'Poor lighting materially reduces driver reaction time and pedestrian visibility, especially during dawn/dusk and winter months.',
    expectedImpact: 'Medium',
    estimatedReduction: '4-8 pts'
  }),
  trafficVolume: () => ({
    title: 'Signal timing / capacity and access-management review',
    rationale: 'High daily traffic volume increases conflict frequency; retiming signals or restricting turning movements can reduce conflict points without major construction.',
    expectedImpact: 'Medium',
    estimatedReduction: '3-7 pts'
  }),
  pedestrianExposure: (s) => {
    if (s.schoolZone) {
      return {
        title: 'School-zone flashing beacons + reduced school-hours speed limit',
        rationale: 'High pedestrian volume combined with a school zone concentrates risk into narrow daily windows that time-based controls address directly.',
        expectedImpact: 'High',
        estimatedReduction: '6-12 pts'
      };
    }
    if (!s.crosswalkPresent) {
      return {
        title: 'Add marked crosswalk with pedestrian refuge island',
        rationale: 'Significant pedestrian volume with no marked crossing forces unpredictable, unprotected crossings.',
        expectedImpact: 'High',
        estimatedReduction: '6-12 pts'
      };
    }
    return {
      title: 'Extend pedestrian signal phase / add leading pedestrian interval',
      rationale: 'Existing crossing infrastructure can be made safer with timing changes before physical rebuilds are needed.',
      expectedImpact: 'Medium',
      estimatedReduction: '3-6 pts'
    };
  },
  intersectionComplexity: (s) => {
    if (s.intersectionType === 'unsignalized') {
      return {
        title: 'Add traffic signal or convert to roundabout',
        rationale: 'Unsignalized intersections with meaningful traffic/pedestrian volume carry materially higher conflict risk than controlled alternatives.',
        expectedImpact: 'High',
        estimatedReduction: '10-18 pts'
      };
    }
    if (s.intersectionType === 'signalized') {
      return {
        title: 'Retime signals and add protected turn phases',
        rationale: 'Signal presence alone does not eliminate conflicts — protected phasing removes the most severe left-turn/pedestrian conflicts.',
        expectedImpact: 'Medium',
        estimatedReduction: '4-8 pts'
      };
    }
    return {
      title: 'Monitor — intersection form is already a lower-risk configuration',
      rationale: 'Roundabouts and uncontrolled low-volume approaches statistically carry lower severe-crash rates; prioritize other factors first.',
      expectedImpact: 'Low',
      estimatedReduction: '0-3 pts'
    };
  },
  weatherExposure: () => ({
    title: 'Improve pavement skid resistance / drainage + weather-responsive warning signage',
    rationale: 'A meaningful share of crashes here are linked to adverse weather, pointing to surface or visibility issues rather than driver behavior alone.',
    expectedImpact: 'Medium',
    estimatedReduction: '4-9 pts'
  })
};

/**
 * @param {object} segment
 * @param {Array} factors - sorted factor list from computeRisk()
 * @param {number} [topN]
 */
function recommendInterventions(segment, factors, topN = 3) {
  const top = factors.slice(0, topN).filter((f) => f.contribution > 0);
  const seen = new Set();
  const recs = [];

  for (const factor of top) {
    const rule = RULES[factor.key];
    if (!rule) continue;
    const rec = rule(segment);
    const dedupeKey = rec.title;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    recs.push({ ...rec, addressesFactor: factor.label, factorKey: factor.key });
  }

  return recs;
}

module.exports = { recommendInterventions };
