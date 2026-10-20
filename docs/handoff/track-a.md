# Track A handoff — App

_Last updated: 2026-10-20 (A2 session)_

**Done (A2, PR open):** Home screen to F1/F7/F10/F11.
- `src/lib/home.ts` (pure): `filterRecipes` (meal tab; proteins OR; quick chips AND; My list via `pp.myList`), `toTiles` (collapses dish groups, sorts protein desc, unknown last). Unit-tested in `tests/unit/home.test.ts`.
- `src/lib/router.ts`: History API router, `/` and `/r/<id>/` under `import.meta.env.BASE_URL`; global click handler intercepts in-app `<a>`s. Build copies `index.html` → `404.html` (vite plugin `spa-404`) for deep links on Pages.
- Components: `Icon.tsx` (UI icons + 13 dish icons; chaat/paratha/dessert/sauce drawn new), `Tile.tsx`. Screens: `Home.tsx`, `RecipeStub.tsx` (title, macros, Watch video — replace in A4).
- CSS in `src/styles/app.css`, tokens only; `[data-tint]` sets `--tint`/`--tint-bg`. Breakpoints 360 / 600 / 1024 / 1200.
- e2e `tests/e2e/home.spec.ts`: DESIGN §8 overflow check at 9 widths × light/dark + screenshots, chip filtering, navigation, deep link, Auto theme.

**Not done (by design, later phases):** search input, filter button, menu, Add, My recipes are visual only. Desktop has no sidebar yet — chips sit above the grid (A3 adds the sidebar and hides protein chips there). No summary line / smart empty state (A3). Add-to-Home-Screen hint (A5). Dislike hiding (A4).

**Next:** A3 (filters + search) or A4 (recipe page) — both depend only on A2.

**Gotchas:**
- Header is one CSS grid; layout per breakpoint is just `grid-template-areas` (phone 2 rows, tablet 1 row, desktop adds My recipes + labelled Add).
- On tablet the two chip rows merge via `.chip-row { display: contents }` with a divider.
- Overflow check skips `.chip-row` and `.meal-tabs` (allowed to scroll sideways). Add any new sideways scroller (Other versions) to that selector.
- `VITE_FIXTURES=1` for dev until real data lands; e2e counts assume the 10 fixtures (9 tiles).
- Playwright pinned 1.56.1 (matches `/opt/pw-browsers`).
- Fonts come from Google Fonts; self-host in A6 for offline.

**Open questions:** none.
