# Track A handoff — App

_Last updated: 2026-10-20 (A6b session; this session also did A1–A5)_

**Done (A6b, PR open):**
- `/review/` (hidden, `noindex`, not in the menu): `src/screens/Review.tsx` + `src/lib/review.ts` (`FLAG_INFO` labels/order, `reviewItems`, `flagCounts`, `withFlag`). Incomplete recipes without flags show as "Missing details". Filter chips with counts, filter in the URL (`?flag=no_macros`), Copy title, links to recipe / video / Edit on GitHub. Real data: 62 of 80.
- `tintOf(r)` → `'none'` when `main_proteins` is empty; `[data-tint="none"]` uses `--muted`/`--text2`. `NO_MACROS` ("Macros not given") on tiles, groups, recipe macro band, version cards, My recipes.
- Fixtures `besan-chilla` and `tempeh-chilli-noodles` now carry `flags` (no other change); e2e `tests/e2e/review.spec.ts`.

**Agreed with Track B (D7):** Track B owns `flags[]` (set/clear, code list); Track A only reads. Creator's numbers only. When `servings` is null, whole-recipe figures come from `stated_macros` (`wholeRecipeProtein`, `shownNumbers` in `lib/home.ts`, written by Track B in PR 10). Keep those functions. If Track B adds a flag code, add it to `FLAG_INFO`. An unknown code still renders, showing the raw code.

**Next:** A6 (offline/PWA, static `/r/<id>/` pages with OG previews, 404, favicon), then A7, A8.

**Gotchas:**
- Since PR 10, `main_proteins` may be empty and `per_portion.protein_g` may be null on complete recipes. Always use `shownProtein`/`tintOf`, never `per_portion` directly, for display.
- `.chip-row` turns into `display: contents` from 600 px (Home chip rows merge). Any other chip row needs its own flex rule (see `.review-chips`).
- Tiles: 73 from 80 recipes (versions collapse). Fixture e2e counts still assume 9 tiles.
- Don't `pkill -f "playwright test"` from the same Bash call that runs Playwright. Kill a stale `vite preview` on :4173 before e2e.
- Context: this session ran A1–A6b and is ~60 % full. Start A6 in a fresh session (`Start phase A6`).

**Open questions:** none for Track A. B6 (resolving the 62 flags) is Jatin ↔ Track B.
