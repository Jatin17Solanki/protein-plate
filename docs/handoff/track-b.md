# Track B handoff — Data

_Last updated: 2026-10-20 (B1 session)_

**Done (B1, PR open):**
- `data/ingredients.json`: 116 canonical ingredients (aliases incl. Hindi/Hinglish, type, protein + kcal per 100 g, basis dry/cooked/as_sold, main_protein group, unit_grams).
- `prompts/add-recipes.md`: the one normalisation + categorisation + duplicate prompt.
- `scripts/data/`: `lib/` (pure, reusable by A7: raw parser, dictionary matcher, estimate, fidelity, dedupe) + CLIs `check.ts` (dictionary, ids, maths, 35 % rule; `--write` fills computed fields), `fidelity.ts` (needs raw repo), `dedupe.ts`, `review.ts`. 19 tests: `npx vitest run --config scripts/data/vitest.config.ts`.
- 10 recipes in `data/recipes/` (batch 1 entries #1, 4, 5, 6, 22, 35, 39, 41, 67, 71): all 6 proteins, `soya-kebab` group of 2, air fryer, 1 incomplete. Fidelity 10/10.
- Review sheet (raw vs normalised): private repo `protein-plate-raw`, branch `claude/busy-noether-s5qjwo`, `reviews/2026-10-20-B1-first-10.md`.

**Not done:** remaining ~70 entries of batch 1 (B2).

**Next:** B2 after Jatin approves B1 field by field. Apply his feedback to the 10 first, then ~20 entries per session (B2a, B2b…). Per chunk: write records → `check.ts --write` → `check.ts` → `fidelity.ts` → `dedupe.ts --batch …` → `review.ts --out ../protein-plate-raw/reviews/…`.

**Gotchas:**
- Clone the raw repo next to this one (`../protein-plate-raw`) or pass `--raw <dir>`. Never copy raw text into this repo (tests use synthetic captions).
- `as_written` must be a verbatim substring of the caption; `qty` must be a number in it ("a tbsp" → 1).
- Fidelity "mentions" use the dictionary: a word like "the yogurt" in a caption needs the same word in a step, or an alias fix. Add missing ingredients to the dictionary rather than leaving `ingredient_id: null`.
- Recipe files are written by `check.ts --write` (2-space JSON); hand-added supporting proteins are kept after the computed ones.
- Entries #60–65 and #79–80 are link-only → incomplete. #66–70 are the dessert section, #71 air fryer, #72–78 "fun recipes".

**For Track A (other lane — not done here):**
- CI could also run `npx tsx scripts/data/check.ts` and the data tests (no raw files needed); `fidelity.ts` can't run in public CI (private raw repo).
- Optional npm scripts: `data:check`, `data:fidelity`, `data:dedupe`, `test:data`.
- Schema requests: `stated_macros.fibre_g` (creators often state fibre; now parked in assumptions); maybe a `fritter_pakora` tag (bhajiya is filed under kebab_tikki_cutlet).

**Open questions for Jatin:** see the B1 PR (portion guesses, bhajiya tag, per_portion = our estimate, review sheet location).
