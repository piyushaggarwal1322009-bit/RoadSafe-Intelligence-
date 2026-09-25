# RoadSafe Intelligence

RoadSafe Intelligence is a location-based safety planning dashboard that turns crash history, exposure patterns, and operational conditions into a clear risk picture and a recommended intervention strategy.

This version keeps the same Next.js foundation and risk model, but upgrades the product experience into a polished executive dashboard: a professional app shell, responsive metric cards, a map-first risk overview, contributor breakdowns, a scenario simulator, comparison tables, and forward-looking forecast panels.

## New UI structure

The app now follows a modern operations-dashboard pattern:

- A left navigation shell for Overview, Risk Map, Compare Corridors, Forecasts, Interventions, and Settings
- A top bar with location selection, period filter, notifications, and user profile
- A risk hero with the current score, status, and explanation summary
- A map-first layout with a selected corridor detail panel and risk legend
- Clear contributor bars and interactive scenario controls
- Responsive comparison tables and intervention prioritization cards

## Key files

- `src/app/page.js` — executive overview dashboard
- `src/components/RiskDashboard.jsx` — interactive dashboard UI and scenario logic
- `src/components/SegmentMap.jsx` — risk hotspot map with selected state support
- `src/app/compare/page.js` and `src/app/compare/ComparePanel.jsx` — corridor comparison experience
- `src/app/segment/[id]/SegmentClient.jsx` — detailed location drilldown
- `src/lib/risk.js`, `src/lib/forecast.js`, and `src/lib/interventions.js` — calculation and recommendation logic

## How to run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

## Backend API and data access

This project uses the existing Next.js app as its backend runtime. The data model remains Markdown-driven in `content/segments/`, while the reusable logic lives in `src/lib/roadsafe-service.js` and the route handlers expose it through API endpoints.

Available endpoints:

- `GET /api/health` — service status metadata
- `GET /api/segments` — list all segments with summary risk fields
- `GET /api/segments/:id` — detailed segment record plus risk, forecast, and interventions
- `POST /api/segments/:id` — same detail endpoint with override payloads for what-if recalculation
- `POST /api/segments/:id/whatif` — scenario-based recalculation payload
- `GET /api/segments/compare?a=ID1&b=ID2` — side-by-side score comparison

The route logic reuses the same scoring model as the UI so the dashboard and the API stay consistent.

## Interactive map

The app uses Leaflet with OpenStreetMap tiles for the risk hotspot map. This is intentionally client-only to avoid server-side `window` access during static prerendering.

- Map library: `leaflet` + `react-leaflet`
- Tiles: OpenStreetMap, no API key required
- Behavior: markers color-code risk band, fit bounds to the loaded segments, and open a popup with direct detail navigation

## Testing

The project includes a small Node-based regression suite for the shared service layer and health route:

```bash
npm test
```

## Adding or editing segment data

Segment records are still stored as Markdown frontmatter in `content/segments/`. The dashboard reads those files directly, so adding or editing a location remains a content change rather than a code change.

Example:

```markdown
---
id: my-road
name: My Road & 3rd St
lat: 40.71
lng: -74.02
roadType: intersection
speedLimit: 30
operating85thSpeed: 35
avgDailyTraffic: 15000
pedestrianVolumeDaily: 400
lighting: moderate
intersectionType: signalized
weatherExposureIndex: 0.2
crosswalkPresent: true
schoolZone: false
trafficGrowthRate: 0.02
crashesLast5yr: [5, 6, 4, 5, 7]
fatalCrashesLast5yr: 0
seriousInjuryCrashesLast5yr: 1
---
Free-text notes about the location go here.
```

## Design and product notes

- The dashboard keeps the transparent, rule-based safety model already in place instead of replacing the stack.
- The app remains mobile-first and uses semantic HTML, focus states, and high-contrast text to support accessibility.
- The UI is intentionally calm and operational: navy surfaces, white cards, teal accents, and restrained amber/red risk signals.
- Empty, loading, and interactive states are handled in the live dashboard flow without introducing fake UI.
