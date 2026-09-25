# RoadSafe Intelligence

An interactive road-safety intelligence platform: pick a road segment, see
its computed risk score and the factors driving it, compare it against
another segment, see where risk is trending, and get concrete, justified
safety interventions — then change conditions (speed limit, lighting,
crosswalks, traffic volume...) and watch the score recompute live.

Road segment data lives as **Markdown files with frontmatter** under
`content/segments/`, so adding or editing a location is a content change,
not a code change. The app itself is a small Next.js project, deployable
to Vercel with zero configuration.

## How the "must haves" are met

| Requirement | Where |
|---|---|
| Interactive view of road-safety info | `/` — SVG map + sortable segment list |
| Risk score for a location | `src/lib/risk.js` → shown on `/segment/[id]` |
| Major contributing factors | `FactorBreakdown` component, sorted by point contribution |
| Compare locations/conditions | `/compare` — side-by-side score, factors, outlook, raw conditions table |
| Forward-looking risk indication | `src/lib/forecast.js` — trend + planned-growth projection, shown as an outlook panel |
| Recommended interventions | `src/lib/interventions.js` — rule-based, tied to the top factors |
| Show risk changing with conditions | "What-if" panel on `/segment/[id]` — every control recomputes the score live, client-side |

## Architecture

```
content/segments/*.md   → segment data (frontmatter) + narrative notes (body)
src/lib/markdown.js     → zero-dependency frontmatter parser + loader (server-only, uses fs)
src/lib/risk.js         → pure risk-scoring function (isomorphic — runs on server AND in the browser)
src/lib/forecast.js     → linear trend + growth-rate projection
src/lib/interventions.js→ rule-based factor → intervention mapping
src/components/*        → presentational + interactive UI pieces
src/app/*               → Next.js App Router pages (server components load data, client components handle interactivity)
```

The scoring, forecasting, and intervention logic is deliberately **rule-based
and transparent**, not a black-box ML model — every number on screen can be
traced back to a specific, named factor and weight. That's what lets the
"what-if" panel recompute instantly in the browser with no server round-trip:
`risk.js` has no dependency on Node APIs, so the exact same function that
renders the initial score on the server also re-runs on every slider change.

### Risk model

Composite score (0–100) is a weighted sum of seven normalized (0–1) factors:
crash history & severity (30%), speed differential (15%), pedestrian/cyclist
exposure (15%), lighting (10%), traffic volume (10%), intersection
complexity (10%), adverse-weather exposure (10%). Weights and the
normalization curve for each factor are documented inline in
`src/lib/risk.js`.

### Adding a new segment

Create a new file in `content/segments/`, e.g. `content/segments/my-road.md`:

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

It will automatically appear on the map, in the segment list, and as a
comparison option — no code changes needed.

## Local development

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

```bash
npm run build && npm start   # production build, local
```

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel: **New Project → Import** the repo. Framework preset
   `Next.js` is auto-detected — no build command or environment
   variables are required.
3. Deploy. Every push to the default branch redeploys automatically.

Alternatively, from the CLI:

```bash
npm i -g vercel
vercel --prod
```

Note on data updates: since segment data is read from Markdown files at
build time, editing a `.md` file and pushing/redeploying is how you update
the dataset in production — there is no runtime database to manage.

## Project structure notes / trade-offs

- **No map-tile provider (Leaflet/Mapbox) and no chart library.** The map
  is a coordinate-normalized SVG scatter plot and all charts are plain SVG
  bars — this keeps the dependency list to just `next`/`react`/`react-dom`,
  avoids API keys, and means the app has no external network dependency to
  render. Swapping in a real tile provider later only touches
  `SegmentMap.jsx`.
- **Frontmatter parser is hand-rolled**, not `gray-matter`, for the same
  reason: one fewer dependency for a schema this small.
- **`next.config.js` explicitly includes `content/segments/` in the
  serverless function bundle** (`outputFileTracingIncludes`). Next's
  automatic file-tracing can miss `fs` reads built from a dynamic path
  (as `markdown.js` does), which would otherwise cause the API route to
  fail in production despite working locally.

## Repository contents

```
content/segments/*.md      sample data (5 segments)
src/lib/                   risk, forecast, intervention, markdown-loader logic
src/components/            reusable UI pieces
src/app/                   pages (Next.js App Router)
README.md                  this file
AI_USAGE_NOTE.md           AI usage disclosure
```
