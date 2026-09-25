'use client';

export default function WhatIfPanel({ segment, overrides, onChange, onReset }) {
  const current = { ...segment, ...overrides };

  const set = (key, value) => onChange({ ...overrides, [key]: value });

  return (
    <div>
      <div className="control-row">
        <label>Posted speed limit ({current.speedLimit} mph)</label>
        <input
          type="range" min="15" max="65" step="5"
          value={current.speedLimit}
          onChange={(e) => set('speedLimit', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <label>85th-percentile operating speed ({current.operating85thSpeed} mph)</label>
        <input
          type="range" min="15" max="75" step="1"
          value={current.operating85thSpeed}
          onChange={(e) => set('operating85thSpeed', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <label>Lighting</label>
        <select value={current.lighting} onChange={(e) => set('lighting', e.target.value)}>
          <option value="poor">Poor</option>
          <option value="moderate">Moderate</option>
          <option value="good">Good</option>
        </select>
      </div>

      <div className="control-row">
        <label>Intersection control</label>
        <select value={current.intersectionType} onChange={(e) => set('intersectionType', e.target.value)}>
          <option value="none">None</option>
          <option value="unsignalized">Unsignalized</option>
          <option value="signalized">Signalized</option>
          <option value="roundabout">Roundabout</option>
        </select>
      </div>

      <div className="control-row">
        <label>Marked crosswalk present</label>
        <input
          type="checkbox"
          checked={!!current.crosswalkPresent}
          onChange={(e) => set('crosswalkPresent', e.target.checked)}
        />
      </div>

      <div className="control-row">
        <label>Avg. daily traffic ({current.avgDailyTraffic?.toLocaleString()})</label>
        <input
          type="range" min="1000" max="35000" step="1000"
          value={current.avgDailyTraffic}
          onChange={(e) => set('avgDailyTraffic', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <label>Adverse-weather crash share ({Math.round(current.weatherExposureIndex * 100)}%)</label>
        <input
          type="range" min="0" max="1" step="0.05"
          value={current.weatherExposureIndex}
          onChange={(e) => set('weatherExposureIndex', Number(e.target.value))}
        />
      </div>

      {Object.keys(overrides).length > 0 && (
        <button onClick={onReset}>Reset to recorded conditions</button>
      )}
    </div>
  );
}
