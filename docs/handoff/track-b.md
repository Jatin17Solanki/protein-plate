# Track B handoff — Data

_Last updated: 2026-10-20 (B2a session)_

**Done:**
- B1 merged (PR 3): dictionary, prompt, data scripts, 10 recipes.
- B2a (PR open): 20 more batch-1 entries (#2, 3, 7–21, 23–25) → 30 recipes. 3 incomplete (hara-bhara-kebab, chipotle-paneer-sandwich, soya-tikki — ingredients kept, no method). Dish groups: soya-tikki joins `soya-kebab`; `rajma-taco` (partner #46) and `protein-pasta` (partner #40) have one member each until B2b/B2c.
- Dictionary 116 → 141 entries. Checker fixes: keycap step numbers (1️⃣), more headings skipped, hashtag-list filter no longer eats method sentences, title line excluded from the ingredient-mention check.
- Review sheet: private repo `reviews/2026-10-20-B2a.md` (branch `claude/busy-noether-s5qjwo`).

**Next:** B2b — entries #26–34, 36–38, 40, 42–48. Give #40 `dish_group: "protein-pasta"` (label e.g. "lentil spaghetti") and #46 `"rajma-taco"`. Per chunk: write records (steps verbatim) → `check.ts --write` → `check.ts` → `fidelity.ts` → `dedupe.ts --batch …` → `review.ts --out ../protein-plate-raw/reviews/…`.

**Rules now in force (Jatin, 2026-10-20):**
- Steps = creator's exact words, formatting only; `fidelity.ts` fails anything else. Typos stay.
- Servings only from an explicit count; otherwise null, no per-portion figure, "Servings…" in `missing[]`.
- No field-by-field review: Jatin reads recipes in the app and sends notes by title; trace via `source.ref`.

**Gotchas:**
- "Recipe by @x" = original creator; the post is by a reviewer account. Kept as `source.creator`. Jatin may send a new compilation with creator names.
- Allowed fidelity warnings: promo lines, sub-recipe headings ("- guac"), creator tips on incomplete recipes. Anything else is a mistake.
- Bare words map loosely: don't add aliases like "moong", "yogurt" or "cloves" (garlic cloves!) — use specific ones ("laung", "plain yogurt" was also dropped because search treats aliases as synonyms).
- Boiled/soaked pulses: keep `qty`, put dry estimate in `grams` (cooked ≈ 2.5× dry; soaked moong ≈ 2× dry).
- Scratch generator pattern: a Python file with `I()`/`R()` helpers writing `data/recipes/*.json`, then `check.ts --write`.

**For Track A:** show whole-recipe protein when `per_portion.protein_g` is null (last `protein_working` line); show ingredients by `as_written`; search synonym expansion is broad (multi-word aliases); possible tags: fritter/pakora (moong bhajiya), poha.

**Open questions for Jatin:** wait for the new compilation before B2b? (see PR)
