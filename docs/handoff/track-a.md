# Track A handoff — App

_Last updated: 2026-11-10 (V2-2 session)_

**Direction change (DECISIONS 2026-11-10):** v2 is a better catalog, not a meal planner. No plan/rotation/cook/household features. TRACKER rows V2-1 to V2-3.

**Done (V2-2, PR open):** `QUICK` gains `classic` ("Classics") and `addOn` ("Add-ons") right after Quick; `matchesQuick` reads tags `classic` / `add_on` (Track B, B8, PR 37: 30 + 7 live recipes). Shows on the Home chip row, filter sheet quick picks, desktop chip row. Recipe page `tagChips` adds "Classic" / "Add-on". Fixtures: `rajma-rice-bowl` + `classic`, `lasooni-dhaniya-paneer` + `add_on`. Tests: unit (home, recipe), e2e `filters.spec.ts` "Classics and Add-ons…" + `classics-390-light.png`. MANUAL-TEST J4 step 3 now uses the chips.

**Done before (V2-1, PR 36 merged):** desserts and sauces sort last (`EXTRA_TYPES`, `Tile.extra`, `picksExtras`); **Leave out** a main protein (`skipProteins`, `pickProtein` / `skipProtein`, swap-aware counts); "Curry" → "Sabzi"; CI pinned to `ubuntu-24.04` (Playwright 1.56 can't install on 26.04: unpin after a Playwright upgrade).

**Not done:** My recipes keeps the user's own order (no extras demotion there, on purpose).

**Next:** nothing scheduled in Track A. V2-3 is deferred (shareable selections, ingredient exclusion, coverage page). If Jatin's borderline verdicts change Track B's tags, nothing to do here.

**Requests for Track B:** none open. Keep watching coverage gaps as batches land: quick + ≤ 300 kcal snacks, quick soya/tofu/pulses/tempeh, whey-free breakfasts.

**Gotchas:**
- Recipe page wrappers: `col-a` top, `col-b` right column, `col-c` Tried it + notes. Phone order = markup order.
- Lighthouse locally: `BASE_PATH=/ npx vite preview`; `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx lighthouse@12.8.2 …`.
- Preact 11 runs `useEffect` cleanups after paint on unmount; must-happen-before-next-screen work goes in `useLayoutEffect`.
- Don't `pkill -f` a pattern that matches your own command line.
- Lists, cards, share, exports and OG use `portionProtein`; only the recipe page macro card uses `shownProtein`/`shownNumbers`. `estimated_macros` stays on the recipe page only (`tests/unit/bl1.test.ts`).
- Tell Track B if `compactCatalog()`'s line format changes.

**Open questions:** none.
