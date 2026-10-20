# Track A handoff — App

_Last updated: 2026-10-20 (A8 session)_

**Done (A8, PR open):** QA pass, report in `docs/QA.md`.
- Lighthouse (mobile, real data): accessibility 100 on home/recipe/my/add/export/review; performance 94–99; best practices 100.
- axe-core over 14 screens/sheets × light/dark × 390/1280: found 9 kinds of issue, now 0. Now a CI test: `tests/e2e/a11y.spec.ts` (`axe-core` dev dependency).
- Keyboard pass: `tests/e2e/keyboard.spec.ts` checks focus rings, sheet focus trap and return, phone recipe tab order, and the desktop two-column layout.
- Fixes:
  - share preview can be scrolled by keyboard
  - recipe markup is in phone order (`col-a` / `col-b` / `col-c`; desktop uses grid areas `"a b" "c b"`, no more CSS `order`)
  - `<main>` on My recipes / Add / Export / Review / Not found; recipe top bar is a `<header>`
  - logo (h1) only visually hidden while searching on phone
  - credit no longer says "Steps in our own words"
  - sheet focus trap skips `tabindex="-1"`
- `docs/MANUAL-TEST.md`: Jatin's full real-device test plan (14 sections, device matrix, results log). CLAUDE.md now has every phase update it.
- TRACKER: A7 → done.

**Not done / needs Jatin:** the manual test itself (TRACKER "Jatin's tasks"). The first real Add-recipes commit is still untested (the 8,000-char GitHub link cap, `MAX_URL` in `src/lib/addRecipes.ts`).

**Next:** no Track A phase left in PLAN. Next Track A work comes from Jatin's results log in `docs/MANUAL-TEST.md` (fix list → new TRACKER rows, e.g. `A9 fixes from manual test`), plus the requests for Track B below.

**Still open for Track B (from A7):**
1. Fold the chat note from `buildAddPrompt` into `prompts/add-recipes.md` (keep the intro → `---` layout).
2. Re-format one-line recipe files added from the app.
3. Add dictionary entries for `ingredient_id: null` / new ids from app-added recipes.
4. Optional: `findPairsAgainst` in `lib/dedupe.ts`.
5. B5 export prompt → swap into `askPrompt()`.

**Gotchas:**
- Recipe page: put new sections in the right wrapper. `col-a` = top (title, macros, actions, credit), `col-b` = right column, `col-c` = Tried it + notes. Phone order = markup order.
- Lighthouse locally: `BASE_PATH=/ npx vite preview` (without it the preview serves `/protein-plate/`); `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx lighthouse@12.8.2 …`. SEO "robots.txt invalid" is a local-preview artefact.
- Don't `pkill -f` a pattern that matches your own Bash command line (kills the shell; same for Playwright).
- `src/` imports `scripts/data/lib/{dedupe,raw}.ts`: keep those pure.
- Display code uses `shownProtein`/`shownNumbers`/`tintOf`, not `per_portion` directly.

**Open questions:** none.
