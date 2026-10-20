# Track B handoff — Data

_Last updated: 2026-10-20 (B6 review rounds 1–2 done)_

**Done:** batch 1 is in `data/recipes/`: 79 recipes after Jatin's removals. B6 round 1 ([PR 18](https://github.com/Jatin17Solanki/protein-plate/pull/18), merged) and round 2 (the 32 `macros_basis_unclear`) are done. **0 recipes flagged.** Every decision is in `docs/review-log.md`.

**Rules in force (Jatin, 2026-10-20):**
- Steps = the creator's exact words, formatting only (`fidelity.ts` enforces it).
- Numbers = the creator's (or ones Jatin read from the video) only.
  - `per_portion` copies `stated_macros` when `servings` is set or the basis starts with "per".
  - Otherwise `per_portion` is null and the numbers are a whole-dish figure: recipe page only.
  - `estimated_macros` = a rough estimate Jatin asked for: recipe page only, with a warning.
- Servings come from an explicit count: the creator's, or Jatin's ("the recipe is one portion" → `servings: 1`, basis "… — one portion (Jatin)").
- `flags[]` mark what Jatin must look at.
  - `check.ts --write` sets the auto flags, minus `accepted_flags`. Hand-added `source_conflict` / `other` are kept.
  - Sauces/dips never get `no_macros`. Video-only recipes only get `no_main_protein`.
- `main_proteins` can be `other` (Jatin's "Others"). A hand-set main protein is kept when the 35 % rule finds none.

**Next:**
- B5: export prompt. Track A swaps it into `askPrompt()` once it exists.
- B3 when Jatin sends the new compilation: run `dedupe.ts --batch <file>` (or `findPairsAgainst`), fix creator credits where it names them, add the recipes the same way.
- B4: the protein oats recipe and the 15 incomplete entries; Jatin will send them together. The My list seed was delivered in chat (never committed).

**Asked of Track A (2026-10-20, Dev 2 session):** keep whole-dish numbers (servings null and `per_portion.protein_g` null) off home cards and out of protein sorting. This covers mint-cheese-spread, protein-spaghetti and tempeh-pav-bhaji. `wholeRecipeProtein` / `shownProtein` in `src/lib/home.ts`.

**Gotchas:**
- Raw entry N = the Nth line with a link. New captions go in new batch files; never append to old ones.
- "Recipe by @x" = original creator; the post is by a reviewer account.
- Aliases: avoid bare generic words ("moong", "methi", "yogurt"). Plurals need their own alias.
- PR numbers are shared by both tracks. `docs/DECISIONS.md` conflicts often; keep both sides.
- After every push, check mergeability with `pull_request_read` (Jatin shouldn't have to report conflicts).
- Scratch generator pattern: write `data/recipes/*.json` with a script, then `check.ts --write`.

**Coordination:** the active Track A session is "Dev 2 - phase A" (`session_01Qwkn8yZAbjE228CGzZT6xB`); reach it with `send_message`. BL1 (Others, video-only badge, estimate box) is in [PR 19](https://github.com/Jatin17Solanki/protein-plate/pull/19).
