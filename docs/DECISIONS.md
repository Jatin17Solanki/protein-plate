# Decisions log
Append-only. Format: `YYYY-MM-DD · decision · why · who`. Full reasoning for everything before 2026-10-20 is in `docs/CONTEXT.md`.

- 2026-10-11 · Validate the problem before building; no app until the need was clear · avoid building a gimmick · Jatin
- 2026-10-16 · Capture raw recipes as plain text; normalise once with all recipes in view · consistent tags · Jatin
- 2026-10-16 · Per-portion protein/kcal; main protein = any source ≥ 35 % of the recipe's protein (can be more than one); proteins: paneer, soya, tofu, tempeh, pulses (incl. besan), whey · day totals must add up; multi-protein recipes exist · Jatin
- 2026-10-16 · Intentional variants are separate recipes linked by a dish group; duplicates are not allowed · variants differ in flavour · Jatin
- 2026-10-19 · Static site on GitHub Pages, JSON in Git, changes via Claude Code PRs or the GitHub editor · free, no infra · Jatin
- 2026-10-19 · No video thumbnails; "Watch video" button · Instagram oEmbed no longer returns thumbnails (Nov 2025) · Claude/Jatin
- 2026-10-19 · Visual direction: Mix 1 colours, filled tiles with corner dish icons, protein-tinted tiles; recipe screen = Mix 2 layout with Mix 1 action buttons · Jatin
- 2026-10-20 · Personal data (My list, Like/Dislike, notes, ticks, theme) stays in each visitor's browser; backup file to move it · no database, privacy, free · Jatin
- 2026-10-20 · Single Share button (message + link at the end) · two share buttons were confusing · Jatin
- 2026-10-20 · Like / Dislike / My list replace Keep / Not for me / Self cook; Dislike hides everywhere; My recipes screen to manage · Jatin
- 2026-10-20 · Catalog sharing: view by link, copy the repo, or copy one recipe's data; no whole-catalog import or merge · keeps Git as the only source of truth · Jatin
- 2026-10-20 · Last made / last planned moved to backlog with the meal plan · plan ≠ eaten · Jatin
- 2026-10-20 · Offline mode + Add-to-Home-Screen hint in v1 · protects browser storage on iOS, works in kitchen · Jatin
- 2026-10-20 · Filter sheet shows live counts; filters OR within a group, AND across groups · avoids confusing dead ends · Jatin
- 2026-10-20 · Two parallel tracks (App, Data) with phase-per-session protocol and tracker files · avoid context compaction · Jatin
