# Track A handoff — App

_Last updated: 2026-10-20 (A7 session)_

**Done (A7, PR open):**
- **Add recipes** `/add/` (`src/screens/AddRecipes.tsx`, lazy-loaded; logic in `src/lib/addRecipes.ts`). Home "+", desktop "Add recipes" and the menu open it.
  1 Copy prompt = `prompts/add-recipes.md` (from its first `---`) + chat note + schema + ingredient ids/names + catalog index. 2 Paste (fences/chat text tolerated). 3 Verdicts: ✓ ready · ! possible duplicate (Add as version / Add anyway / Skip) · × error (Copy fix-it prompt). Submit → 4 "Send to GitHub": one pre-filled new-file link per recipe; "Update <title>" (copy + GitHub editor) when Add as version groups an ungrouped recipe.
  Checks = `checkSchema`/`checkRules` (same as CI) + Track B's `findPairs` imported from `scripts/data/lib/dedupe.ts` (not copied) + id clash + label clash. Unknown dictionary ids → note only.
- **Export** `/export/` (`src/screens/Export.tsx`, `src/lib/export.ts`): Copy prompt + compact catalog · Copy link to `/catalog.txt` (built in `vite.config.ts`, every recipe in full, no personal data) · Download JSON. "Include my notes, My list and Like / Dislike" (off) adds personal data to the prompt and file only.
- `downloadJson` moved to `src/lib/download.ts` (menu backup uses it). SW `navigateFallbackDenylist` keeps `/catalog.txt` out of the app shell. Static `add/` + `export/` pages (noindex).
- Tests: `tests/unit/addRecipes.test.ts`, `tests/unit/export.test.ts`, `tests/e2e/add.spec.ts` (flows + §8 screenshots/overflow for add + export at 9 widths × 2 themes).

**Not done / needs Jatin:** a real end-to-end add from his phone (Commit on GitHub, CI, deploy). The 8,000-character pre-fill cap couldn't be checked against GitHub from the session; if GitHub rejects a long link, lower `MAX_URL` in `src/lib/addRecipes.ts`. Lighthouse is left for A8.

**Requests for Track B (I didn't touch `prompts/` or `scripts/data/`):**
1. `prompts/add-recipes.md`: fold in the chat note that `buildAddPrompt` appends (no file access → `ingredient_id: null` + "New dictionary entry needed: …" in assumptions, `source.ref: null`, fill `per_portion`/`flags[]` yourself, JSON only). Keep the intro → `---` layout: the app drops everything before the first `---`.
2. Recipes added from the app may be **one-line JSON** (that's what fits in a GitHub link). Re-format them (2-space) when you next run `check.ts --write`, or add a formatter step.
3. App-added recipes have `source.ref: null` and may have `ingredient_id: null` / new ids: add dictionary entries, and run `check.ts` (flags, 35 % rule) on them.
4. Optional: a `findPairsAgainst(newOnes, catalog)` in `lib/dedupe.ts` would replace the id-prefix trick in `checkPaste`.
5. B5: when the export prompt exists (e.g. `prompts/ask-catalog.md`), tell Track A; the starter text now lives in `askPrompt()` in `src/lib/export.ts`.

**Next:** A8 (QA pass). Start in a fresh session.

**Gotchas:**
- `src/` imports `scripts/data/lib/{dedupe,raw}.ts`: keep those modules pure (no `node:` imports) or the app build breaks.
- `?raw` import of the prompt and the JSON imports of schema + dictionary live only in the lazy Add chunk (~53 KB gzip); keep them out of the main bundle.
- Since PR 10, display code must use `shownProtein`/`shownNumbers`/`tintOf`, not `per_portion` directly.
- Don't `pkill -f "playwright test"` from the same Bash call that runs Playwright.

**Open questions:** none.
