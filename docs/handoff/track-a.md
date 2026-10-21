# Track A handoff — App

_Last updated: 2026-10-21 (BL6 archive built by the Track B session in PR 25)_

**BL6 (by Track B, PR 25):** optional `archived: {reason}` in the schema (types regenerated). `src/lib/catalog.ts` now exports `allRecipes` (recipe pages, Add recipes duplicate check and prompt index), `recipes` (main catalog: Home, search, My recipes, Review, Export) and `archivedRecipes`. New hidden `/archive/` page (`src/screens/Archive.tsx`, `src/lib/archive.ts`), an "Archived" note on archived recipe pages, `archive/` static page; `catalog.txt` and home counts use the main catalog. Fixture: `tests/fixtures/archived/` (own folder so unit-test fixture counts stay 10). Tests: `tests/unit/archive.test.ts`, `tests/e2e/archive.spec.ts`, a11y states.

**Done (BL5, PR open):** Export's "Copy prompt + catalog" now uses Track B's `prompts/ask-catalog.md` via `askPrompt(prompt, recipes, siteUrl, personal)`: text after its first `---`, then `Catalog:` + `compactCatalog()`, then `My question:`; the "- **My data**" bullet is dropped unless personal data is ticked. The `?raw` import lives in `Export.tsx` (export.ts stays importable from vite.config). `tests/unit/export.test.ts` checks the prompt's field guide against `compactCatalog()`'s order: if you change the line format, tell Track B.

**Done before:** A1–A8, BL1, BL2 merged (BL2: whole-dish numbers only on the recipe page, `portionProtein`) (BL1: Others protein, video-only, accepted flags, estimate box) (A8 QA report: `docs/QA.md`; manual plan: `docs/MANUAL-TEST.md`).

**Not done / needs Jatin:** the manual test itself (TRACKER "Jatin's tasks"). The first real Add-recipes commit is still untested (the 8,000-char GitHub link cap, `MAX_URL` in `src/lib/addRecipes.ts`).

**Next:** BL3 (README) can start any time; BL4 (feedback) needs Jatin's feedback email. Otherwise wait for the manual test (`docs/MANUAL-TEST.md`, J1–J12); its feedback log becomes the next fix list after triage. Next Track A work comes from Jatin's results log in `docs/MANUAL-TEST.md` (fix list → new TRACKER rows, e.g. `A9 fixes from manual test`), plus the requests for Track B below.

**Still open for Track B:** nothing from Track A. Keep `prompts/ask-catalog.md`'s field guide in step with `compactCatalog()`.

**Gotchas:**
- Recipe page: put new sections in the right wrapper. `col-a` = top (title, macros, actions, credit), `col-b` = right column, `col-c` = Tried it + notes. Phone order = markup order.
- Lighthouse locally: `BASE_PATH=/ npx vite preview` (without it the preview serves `/protein-plate/`); `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx lighthouse@12.8.2 …`. SEO "robots.txt invalid" is a local-preview artefact.
- Preact 11 runs `useEffect` cleanups **after paint** on unmount. Anything that must happen before the next screen shows (saving a pending note) belongs in `useLayoutEffect`. This made `main` CI red after PR 19/21 (fixed in PR 22).
- Don't `pkill -f` a pattern that matches your own Bash command line (kills the shell; same for Playwright).
- `src/` imports `scripts/data/lib/{dedupe,raw}.ts`: keep those pure.
- Lists, cards, share, exports and OG use `portionProtein`; only the recipe page macro card uses `shownProtein`/`shownNumbers`. Colour via `tintOf`. `estimated_macros` is read only by `EstimateNote` (recipe page); keep it out of everything else (`tests/unit/bl1.test.ts` guards it).

**Open questions:** none.
