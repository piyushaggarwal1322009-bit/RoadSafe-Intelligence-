# AI Usage Note

**Tool used:** Claude (Anthropic), used conversationally to generate the
initial implementation of this project from the challenge brief.

**Major tasks delegated to AI:**
- Designing the overall architecture (Markdown-as-data + Next.js on Vercel).
- Writing the risk-scoring engine (`src/lib/risk.js`), forecast engine
  (`src/lib/forecast.js`), and rule-based intervention engine
  (`src/lib/interventions.js`).
- Writing the zero-dependency frontmatter parser (`src/lib/markdown.js`).
- Writing all React components and Next.js pages (map, factor breakdown,
  what-if controls, forecast panel, intervention list, compare view).
- Drafting the sample dataset (5 road segments) and this documentation.

**Verification performed:** The risk, forecast, and intervention engines
were unit-tested directly with Node (outside the Next.js app) against a
sample intersection, including a "what-if" override run, to confirm the
scoring logic, factor ranking, and recommendation matching behave as
intended before being wired into the UI. The Markdown loader was tested
against all 5 sample content files to confirm correct type coercion
(numbers, booleans, arrays).

**Important changes / decisions a participant should still make:**
- The risk-model weights and normalization curves in `risk.js` are a
  reasonable starting point, not validated against real crash data —
  before using this on a real dataset, calibrate weights against actual
  historical outcomes for your jurisdiction.
- The sample segments are illustrative/fictional, not real locations.
- No automated test suite (Jest/Playwright) is included; only manual
  Node-script verification of the core logic was performed in this
  session. Add proper tests before treating this as production-ready.
- `npm install` / `next build` were not run in the authoring environment
  (no package-registry network access there); verify a clean install and
  build locally before submission.
