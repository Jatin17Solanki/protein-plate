# Track B handoff — Data

_Last updated: 2026-10-20 (B2 complete)_

**Done:** all 80 entries of batch 1 are in `data/recipes/` (65 complete, 15 incomplete). Dictionary: 167 ingredients. Review sheets in the private repo (`reviews/`, branch `claude/busy-noether-s5qjwo`).

**Rules in force (Jatin, 2026-10-20):**
- Steps = the creator's exact words, formatting only (`fidelity.ts` enforces it).
- Servings only from an explicit count.
- Numbers = the creator's only. `per_portion` copies `stated_macros`; no estimate is ever shown. The dictionary estimate only picks main/supporting proteins.
- `flags[]` marks what Jatin must look at; `check.ts --write` sets `no_macros`, `macros_basis_unclear`, `missing_details`, `no_main_protein` and keeps hand-added `source_conflict` / `other`. 62 of 80 recipes are flagged; `check.ts` prints the list.
- No field-by-field review: Jatin reads recipes in the app and sends notes by title; trace via `source.ref`.

**Next:**
- B3 when Jatin sends the new compilation: dedupe against the catalog (`dedupe.ts --batch <file>`), correct creator credits where it names them, add new recipes the same way.
- B6: resolve flags with Jatin. When he gives a fix, edit the recipe and remove the flag (hand-added) or fix the cause (auto flags disappear once the data is complete, e.g. add `servings`).
- B4 (oats breakfast, My list seed) still open.

**Gotchas:**
- "Recipe by @x" = original creator; the post is by a reviewer account. Credited as is for now.
- Allowed fidelity warnings: promo lines ("Should I do more…?"), headings, creator tips on incomplete recipes, "also works with" lists. Anything else is a mistake.
- Aliases: avoid bare generic words ("moong", "methi", "yogurt", "cloves"); search treats aliases as synonyms. Plurals like leaf→leaves need their own alias.
- Ingredients only named in the method get added with no amount; sub-recipes keep the part in brackets ("(dressing)").
- Scratch generator pattern: Python `I()`/`R()` helpers write `data/recipes/*.json`, then `check.ts --write`.

**For Track A:**
- Admin list of flagged recipes (Jatin's request): list recipes with `flags[]` (code + note) and incomplete ones, link to each recipe; flags are removed in data commits (no server).
- Recipe page: when `per_portion` is null show "Macros not given"; when `macros_basis_unclear`, show the creator's basis (the footnote already does).
- `main_proteins` can be empty → tile colour fallback.
- Theme switch (A5) — Jatin asked how to switch to light mode.
- Optional: `stated_macros.fibre_g`; tags for fritter/pakora, poha, upma.
