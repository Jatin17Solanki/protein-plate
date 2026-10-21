# Track B handoff — Data

_Last updated: 2026-10-21 (all Track B phases done; tracker tidied)_

**State:** B1–B6 are done and merged. The catalog has 353 recipes in all: 260 shown, plus 93 archived (`archived: {reason}`: hidden everywhere except their own page and `/archive/`). **0 flagged.**
- Every raw file is on the private repo's `main`; `fidelity.ts` passes 352/352. The 353rd, protein-oats-smoothie, is Jatin's own recipe with `ref: null`, which fidelity skips.
- Decisions are in `docs/review-log.md` (batch 1) and `docs/DECISIONS.md`.

**Rules in force:**
- Steps = the creator's exact words, formatting only (`fidelity.ts` enforces it).
- Numbers = the creator's, or ones Jatin read from the video. For Jatin's own recipes, numbers worked out from pack labels when he asks, and the basis says so.
- Servings: one portion unless the caption says otherwise (Jatin, B3). Whole-dish numbers stay on the recipe page only.
- `estimated_macros`: only when Jatin asks; recipe page only, with a warning.
- `flags[]` / `accepted_flags`: `check.ts --write` sets the auto flags. Sauces/dips never get `no_macros`; video-only recipes only get `no_main_protein`.
- `main_proteins` can be `other`. A hand-set main protein is kept when the 35 % rule finds none.
- Never put anyone's name in recipe data the app shows.

**Next:**
- Every new batch follows `docs/ADD-RECIPES.md`: a new session with both repos, then "Add these recipes to the catalog — follow docs/ADD-RECIPES.md".
- **Open for Jatin:**
  - a protein-per-100 g figure for "high-protein yogurt" (many batch-2 recipes have `ingredient_id: null`);
  - whether he wants a "fun to try" tag (needs a Track A schema change).
- **Prompts:**
  - `prompts/ask-catalog.md` is wired into Export (BL5).
  - Track A's `tests/unit/export.test.ts` checks its field-guide line against `compactCatalog()`. Reword that line → update the test.

**Gotchas:**
- Raw entry N = the Nth line with a link (or an `ID:/URL:` block in structured batches). New text goes in new batch files; never append to old ones.
- Merge the private repo's branch into its `main` too, or the next session can't check fidelity (it happened twice).
- "Recipe by @x" = original creator.
- Batch-2 working files are in the private repo `tools/b3-gen/`. Don't re-run them: edits after conversion went into the JSON directly.
- Aliases: avoid bare generic words ("moong", "methi", "yogurt", "cloves"). Plurals need their own alias.
- Validate warns on 5 dips/spreads that keep a snack meal (Jatin's notes); leave them.
- PR numbers are shared by both tracks. `docs/DECISIONS.md` conflicts often; keep both sides.
- After every push, check mergeability with `pull_request_read`.

**Coordination:** the Track A session is "Dev 2 - phase A" (`session_01Qwkn8yZAbjE228CGzZT6xB`), reached with `send_message`. Its backlog is BL3 (README) and BL4 (feedback; needs Jatin's email).
