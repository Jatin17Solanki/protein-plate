# Track B handoff — Data

_Last updated: 2026-10-20 (B1 session, after Jatin's review)_

**Done (B1, PR open):**
- `data/ingredients.json`: 116 canonical ingredients (aliases incl. Hindi/Hinglish, type, protein + kcal per 100 g, basis dry/cooked/as_sold, main_protein group, unit_grams).
- `prompts/add-recipes.md`: the one normalisation + categorisation + duplicate prompt.
- `scripts/data/`: `lib/` (pure, reusable by A7: raw parser, dictionary matcher, estimate, fidelity, dedupe) + CLIs `check.ts` (dictionary, ids, maths, 35 % rule; `--write` fills computed fields), `fidelity.ts` (needs raw repo), `dedupe.ts`, `review.ts`. 19 tests: `npx vitest run --config scripts/data/vitest.config.ts`.
- 10 recipes in `data/recipes/` (batch 1 entries #1, 4, 5, 6, 22, 35, 39, 41, 67, 71): all 6 proteins, `soya-kebab` group of 2, air fryer, 1 incomplete. Fidelity 10/10.
- Review sheet (raw vs normalised): private repo `protein-plate-raw`, branch `claude/busy-noether-s5qjwo`, `reviews/2026-10-20-B1-first-10.md`.
- After Jatin's review (D5 revised): **steps are the creator's exact words**, formatting only — `fidelity.ts` fails any step that isn't word-for-word in the caption and warns on any caption line left out. **No guessed portions**: `servings` only when stated, else null + no per-portion figure (schema `allOf` changed accordingly; types regenerated).

**Not done:** remaining ~70 entries of batch 1 (B2).

**Next:** B2 once Jatin merges B1. No field-by-field review any more: Jatin reads recipes in the app and sends notes by recipe title; trace each to its raw entry via `source.ref`. ~20 entries per session (B2a, B2b…). Jatin may send a new compilation with the original creators' names first — ask before B2 whether to wait for it. Per chunk: write records → `check.ts --write` → `check.ts` → `fidelity.ts` → `dedupe.ts --batch …` → `review.ts --out ../protein-plate-raw/reviews/…`.

**Gotchas:**
- "Recipe by @x" in batch 1 = the original recipe creator; the post and caption belong to a reviewer account (unknown handle). Stored as `source.creator` for now.
- Only promo lines, titles, headings, nutrition lines, keyword lists and Jatin's notes may be left out of steps; any other `fidelity.ts` "source line not in any step" warning is a mistake.
- Clone the raw repo next to this one (`../protein-plate-raw`) or pass `--raw <dir>`. Never copy raw text into this repo (tests use synthetic captions).
- `as_written` must be a verbatim substring of the caption; `qty` must be a number in it ("a tbsp" → 1).
- Fidelity "mentions" use the dictionary: a word like "the yogurt" in a caption needs the same word in a step, or an alias fix. Add missing ingredients to the dictionary rather than leaving `ingredient_id: null`.
- Recipe files are written by `check.ts --write` (2-space JSON); hand-added supporting proteins are kept after the computed ones.
- Entries #60–65 and #79–80 are link-only → incomplete. #66–70 are the dessert section, #71 air fryer, #72–78 "fun recipes".

**For Track A (other lane — not done here):**
- CI could also run `npx tsx scripts/data/check.ts` and the data tests (no raw files needed); `fidelity.ts` can't run in public CI (private raw repo).
- Optional npm scripts: `data:check`, `data:fidelity`, `data:dedupe`, `test:data`.
- Schema requests: `stated_macros.fibre_g` (creators often state fibre; now parked in assumptions); maybe a `fritter_pakora` tag (bhajiya is filed under kebab_tikki_cutlet).
- Done here with Jatin's OK (crossed lanes): schema no longer requires `per_portion.protein_g` when `servings` is null. A2/A4 tiles and recipe page must handle null protein per portion — show the whole-recipe total from the last `protein_working` line, labelled "portions not stated".
- Recipe page: show ingredients by `as_written` and steps as stored (creator's wording).

**Open questions for Jatin:** bhajiya tag; new compilation timing (see PR 3).
