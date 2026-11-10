# Track A handoff — App

_Last updated: 2026-11-10 (V2-1 session)_

**Direction change (DECISIONS 2026-11-10):** v2 is a better catalog, not a meal planner. No plan/rotation/cook/household features. TRACKER rows V2-1 to V2-3.

**Done (V2-1, PR open):**
- Desserts and sauces are "extras": `EXTRA_TYPES`, `Tile.extra`, and `toTiles(…, extrasFirst)` in `src/lib/home.ts`. Sort order = search name matches → meals before extras → chosen sort → title. `picksExtras(filters)` (Dessert or Sauce picked) turns the demotion off; Home passes it. Real catalog: All = first extra at tile 209 of 261; Snack 61 of 102.
- **Leave out** a main protein: `Filters.skipProteins`, `pickProtein` / `skipProtein` (a protein is either picked or left out), `optionCounts().skipProteins` (counts assume the swap, so a picked protein's Leave out chip stays enabled), summary "Not Paneer or Soya", offered by `bestRelaxation`. UI: a "Leave out" section in `FilterSheet` (pick-chips, `aria-label="Leave out X"`) and a fieldset in `Sidebar`. Home protein chips use `pickProtein`.
- `DISH_LABELS.curry_sabzi` → "Sabzi" (tag unchanged).
- Tests: `tests/unit/home.test.ts` (Leave out, extras order); `tests/e2e/filters.spec.ts` (Leave out flow + `leave-out-390-light.png`; sidebar selectors anchored `^Soya` etc. because "Leave out Soya" also matches /Soya/).
- Docs: TRACKER (BL7 → done, PR 31), DECISIONS, CONTEXT §11 note, MANUAL-TEST J2 steps 8–9, README roadmap.

**Not done:** My recipes keeps the user's own order (no extras demotion there, on purpose).

**Next:** V2-2 (Classics + Add-ons filters) once Track B ships the tags. Likely as two more `QUICK` chips (`classic`, `addOn`) matching the tags; check the 320 px chip row still scrolls, not wraps.

**Requests for Track B (Track A can't edit the Track B table):**
1. Add tags `classic` and `add_on` to the schema enum + data. Rules (Jatin, 2026-11-10): **classic** = an everyday Indian dish a household already eats, made high-protein by adding or swapping a protein source (Soya Poha, Protein Upma, Moong Dal Idli, Soya Methi Thepla, High-Protein Rajma Chawal Bowl). **add_on** = a small protein side that goes with any plain meal (sautéed paneer, tempeh crumbles, soya granules). Never use the word "desi". Add both rules to `docs/ADD-RECIPES.md` so the inbox tags new recipes. List tagged recipes for Jatin to check.
2. Coverage gaps to watch as batches land: quick + ≤ 300 kcal snacks (2 today), quick soya/tofu/pulses/tempeh options, whey-free breakfasts.

**Gotchas:**
- Recipe page wrappers: `col-a` top, `col-b` right column, `col-c` Tried it + notes. Phone order = markup order.
- Lighthouse locally: `BASE_PATH=/ npx vite preview`; `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx lighthouse@12.8.2 …`.
- Preact 11 runs `useEffect` cleanups after paint on unmount; must-happen-before-next-screen work goes in `useLayoutEffect`.
- Don't `pkill -f` a pattern that matches your own command line.
- Lists, cards, share, exports and OG use `portionProtein`; only the recipe page macro card uses `shownProtein`/`shownNumbers`. `estimated_macros` stays on the recipe page only (`tests/unit/bl1.test.ts`).
- Tell Track B if `compactCatalog()`'s line format changes.

**Open questions:** none.
