# Track A handoff — App

_Last updated: 2026-10-20 (BL1 session)_

**Done (BL1, PR open):** app side of Track B's PR 18 (schema: `MainProtein: other`, `video_only`, `accepted_flags`, `estimated_macros`).
- `PROTEINS` gains `{ key: 'other', label: 'Others' }` (last). `NEUTRAL_TINTS` = none + other (CSS `[data-tint="other"]`, OG `ogTint`). Fixed My recipes crashing on `other` (`find(...)!.label`).
- Video-only: `Tile.videoOnly` → "▶ Video only" badge + "video only" meta; recipe page `VideoOnlyCard` + wide Watch video; OG card "Video only"; exports "video only (no written recipe)".
- `reviewItems` skips `video_only` and drops flags in `accepted_flags` (also the synthetic missing_details).
- `EstimateNote` on the recipe page only (amber, role=note). Nothing else reads `estimated_macros`; unit test guards tiles/sort/OG/exports.
- Steps: a lone "No written method…" step renders as a hint.
- Add recipes prompt: the appended chat note is now a pointer to §10 of `prompts/add-recipes.md` + today's date.
- Tests: `tests/unit/bl1.test.ts`; e2e estimate + Others chip (fixture `besan-chilla` has `estimated_macros`). Real data checked with axe + screenshots (pudding, video-only, estimate, step hint, review: 32 of 79).

**Done before:** A1–A8 merged (A8 QA report: `docs/QA.md`; manual plan: `docs/MANUAL-TEST.md`).

**Not done / needs Jatin:** the manual test itself (TRACKER "Jatin's tasks"). The first real Add-recipes commit is still untested (the 8,000-char GitHub link cap, `MAX_URL` in `src/lib/addRecipes.ts`).

**Next:** no Track A phase or backlog item left. Next Track A work comes from Jatin's results log in `docs/MANUAL-TEST.md` (fix list → new TRACKER rows, e.g. `A9 fixes from manual test`), plus the requests for Track B below.

**Still open for Track B:** B5 export prompt → swap into `askPrompt()` in `src/lib/export.ts`. (Done by Track B: chat rules in §10 of the prompt; `check.ts --write` re-formats app-added one-line files.)

**Gotchas:**
- Recipe page: put new sections in the right wrapper. `col-a` = top (title, macros, actions, credit), `col-b` = right column, `col-c` = Tried it + notes. Phone order = markup order.
- Lighthouse locally: `BASE_PATH=/ npx vite preview` (without it the preview serves `/protein-plate/`); `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx lighthouse@12.8.2 …`. SEO "robots.txt invalid" is a local-preview artefact.
- Don't `pkill -f` a pattern that matches your own Bash command line (kills the shell; same for Playwright).
- `src/` imports `scripts/data/lib/{dedupe,raw}.ts`: keep those pure.
- Display code uses `shownProtein`/`shownNumbers`/`tintOf`, not `per_portion` directly. `estimated_macros` is read only by `EstimateNote` (recipe page); keep it out of everything else (`tests/unit/bl1.test.ts` guards it).

**Open questions:** none.
