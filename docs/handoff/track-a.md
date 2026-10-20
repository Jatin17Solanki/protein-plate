# Track A handoff — App

_Last updated: 2026-10-20 (A3 session)_

**Done (A3, PR open):** filters, search, summary line, empty state, desktop sidebar.
- `src/lib/home.ts` (pure): `Filters` {meal, proteins, dishTypes, quick, showDisliked, sort}, `Personal` {myList, disliked}; `matches/filterRecipes`, `dishCount` (versions once), `optionCounts` (live counts), `toTiles(recipes, sort, hits)`, `summaryParts`, `bestRelaxation` (empty state), `clearSheet`.
- `src/lib/search.ts`: `Searcher` (MiniSearch) → `Map<id, Hit{nameMatch, uses}>`. `src/lib/synonyms.ts`: groups from `data/ingredients.json` (optional, via `import.meta.glob`) + built-in stub.
- `src/lib/storage.ts`: keys `pp.theme`, `pp.mylist`, `pp.reactions`; `readMyList`, `readDisliked`. Home re-reads on mount and on the `storage` event.
- Components: `FilterSheet` (draft; bottom sheet <600, centred modal 600–1023; focus trap, Escape, body scroll lock), `Sidebar` (≥1024, live), `EmptyState`, `filterParts` (`toggle`, `SortOptions`). Tile shows "uses …".
- e2e: `tests/e2e/filters.spec.ts` (sheet/sidebar at 9 widths × 2 themes + behaviour), shared `helpers.ts`.

**Not done:** nothing in A3's scope. Filters/search are not kept in the URL or storage (reload resets) — fine for v1, revisit if Jatin wants it.

**Next:** A4 (recipe page + personal data + My recipes). A4 must write `pp.mylist` (array of ids) and `pp.reactions` (`{id: 'like'|'dislike'}`) — Home already reads them.

**Gotchas:**
- Counts are in *dishes* (a dish group counts once); keep that if you add counts elsewhere.
- `.check-row:has(input:disabled)` dims sidebar rows — `:has` needs Safari 15.4+/Chrome 105+ (fine for target phones).
- Phone search mode is pure CSS on `.home.searching` (<600 only).
- Don't `pkill -f "playwright test"` from a Bash call that also runs Playwright: it kills its own shell. A stale `vite preview` on :4173 makes e2e test an old build (`reuseExistingServer` locally) — kill it first.
- e2e counts assume the 10 fixtures (9 dishes).

**Open questions:** none.
