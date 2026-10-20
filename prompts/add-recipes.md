# Add recipes — normalise, categorise, check duplicates (prompt v1)

Use this in a Claude Code session on the `protein-plate` repo (or paste it into any AI chat with the raw captions below it). It turns raw recipe captions into JSON records for `data/recipes/<id>.json`.

---

You are adding recipes to **Protein Plate**, a catalog that helps a vegetarian eat 100–120 g protein a day. You will get raw entries: a link, the creator's caption, and sometimes notes from the owner (Jatin). Turn each entry into one JSON record that matches `schema/recipe.schema.json`.

## 0. Before you start
- Read `schema/recipe.schema.json` (field names and allowed values) and `data/ingredients.json` (the ingredient dictionary).
- Never drop an entry. One raw entry → one record, even if it's only a link.
- If something is unclear, write it down in `assumptions[]` or `missing[]`. Never guess silently.

## 1. Fidelity — the recipe must not change
- **Ingredients:** copy every ingredient and amount exactly; the ingredient list is extracted from the caption for search, filters and protein maths. `as_written` is the source's exact wording, copied character for character from the caption (a substring of it; emoji can be dropped). Allowed: an English `item` name, a unit from the schema's list. Not allowed: adding, removing, swapping or "improving" an ingredient, or changing an amount.
- Ingredients named only inside the method count too (e.g. "add the onions" when the list has none): add them with `qty: null` and say what's missing in `missing[]`.
- `qty` is a number taken from `as_written`. For a range ("2–3 cloves") use the lower number and keep the range in `as_written`. "a tbsp" / "pinch of" → `qty: 1`. No amount → `qty: null`. "to taste" → `unit: "to_taste"`.
- **Steps are the creator's own words.** Copy the method from the caption; only change the formatting: split it into steps at the creator's line breaks or sentences, drop emoji, bullets and step numbers, and fix capitals and punctuation. Never reword, shorten, summarise or fix spelling ("fame high", "toguet" stay as written). Keep the quantities that are written in the method ("To a bowl, add 250g low-fat paneer, 1 tbsp ginger-garlic paste…").
- A step may join consecutive caption lines (an "add:" line followed by its ingredient lines becomes one step). Instructions that sit inside the ingredient list ("For bread crumbs - Grind 1 slice whole wheat bread") are steps too.
- Leave out only lines that aren't recipe content: the title, headings, nutrition lines, hashtag/keyword lists, Jatin's notes, and promo lines ("comment 'fudge' and I'll DM you").
- Serving suggestions and creator tips ("serve with paneer", "if using frozen peas…") stay in the steps.
- Every number in the caption (amounts, minutes, °C, servings, macros) must appear somewhere in the record. A stated number with no field (e.g. fibre) goes in `assumptions[]`: "Creator also states 11 g fibre."
- If the caption contradicts itself (3 h soak in the list, 1 h in the method), keep both in the steps/`as_written` and note it in `assumptions[]`.

## 2. Owner's notes are instructions, not content
Lines like `Notes: breakfast, self cook` and section headings like `AIR FRYER:` or `HIGH PROTEIN DESSERT` tell you how to categorise. Never copy them onto the record.
- A meal named in a note → in `meal_types.values` **and** `meal_types.stated_by_user`.
- A section heading → the matching tag (dessert, air fryer, sauce/dip…).
- "Self cook" is **not** a tag — it belongs to the owner's personal My list (handled separately). Ignore it here.

## 3. Source and credit
- `source.url`: `https://www.instagram.com/p/<id>/` or `/reel/<id>/` — no `?hl=en`, `?igsh=` etc.
- `source.creator`: the handle from "Recipe by @handle" (without @), else `null` — the video link is the credit. `creator_url`: `https://www.instagram.com/<handle>/` or `null`.
- `source.ref`: `<batch file>#<entry number>`, e.g. `batches/2026-10-16-batch1.txt#12`. Entry N = the Nth line in the batch file that holds a link.
- `title`: the dish name in plain Title Case, no emoji or "Recipe ⬇️" (e.g. "Tempeh Pav Bhaji"). `id`: kebab-case of the title; never change it later.

## 4. Portions and nutrition — the creator's numbers only (Jatin, 2026-10-20)
- **We never show our own estimate.** Portions differ (3 chapatis or 4?), so a calculated figure would look like real data.
- `servings` = portions the ingredient list makes, **only as the creator states it** ("serves 3", "makes 2", "makes 1 serving", "batter makes 10" with per-chilla macros → 10). Otherwise `null`.
- `stated_macros`: the creator's numbers exactly, with `basis` in their terms ("per serving (serves 3)", "per chilla (batter makes 10)", "whole recipe (servings not stated)"). `null` if none. A stated fibre figure goes in `assumptions[]` ("Creator also states 11 g fibre.").
- `per_portion` = the creator's numbers copied from `stated_macros` (`is_estimate: false`); all `null` when the creator gives none. `protein_working: []`. `check.ts --write` fills both.
- **Flags** (`flags[]`) tell Jatin what to look at; he resolves them one by one later. `check.ts --write` sets these automatically:
  - `no_macros`: the creator gives no macros.
  - `macros_basis_unclear`: the creator gives numbers, but the caption doesn't say how many portions they cover.
  - `missing_details`: anything listed in `missing[]` (no amount for an ingredient, no method…).
  Add by hand, with a short note: `source_conflict` when the caption contradicts itself (3 h soak in the list, 1 h in the method), `other` for anything else that needs Jatin. Hand-added flags are kept.
- Weights (`grams`, dry weights for dal/soya/pulses) are only used behind the scenes to pick main/supporting proteins. Don't explain them in `assumptions[]`; assumptions are for the reader (e.g. "'2 garlic' read as 2 cloves").

Protein per 100 g (approx.): dry soya 52 · paneer 18 · low-fat paneer 25 · firm tofu 10 · silken tofu 5 · tempeh 19 · dry dals 23 · besan 22 · dry chole/kala chana 19 · dry rajma 22 · curd 3.5 · Greek yogurt 9 · skyr 10 · milk 3.3 · cheese 22 · peanuts 25 · oats 13 · sattu 20 · whey 78. Used only to classify main proteins (the dictionary holds these values).

## 5. Categorise
- **Main proteins** (`paneer, soya, tofu, tempeh, pulses, whey`): every group supplying **≥ 35 %** of the recipe's protein, larger first. Pulses = chana, rajma, moong, masoor, toor, kala chana, chickpeas, besan, sattu, sprouts, lentil pasta. Soya = chunks, granules, soybeans. If nothing reaches 35 %, leave it empty and flag it for Jatin.
- **Supporting proteins**: dictionary ids that give ≥ 10 % of the protein but aren't a main protein (Greek yogurt, cheese, peas…). You may add one whose amount is unknown (a yogurt dip) by hand.
- **Meal types** (multi-select): breakfast, lunch, snack, dinner. Mark the ones Jatin stated in `stated_by_user`; the rest are your inference ("Meal types are our guess." in assumptions). Sauces, dips and marinades get **no** meal type.
- **Tags** (one flat set; first dish-type tag picks the tile icon): `sandwich_toast, salad_bowl, wrap_roll_taco, kebab_tikki_cutlet, chilla_pancake_omelette, curry_sabzi, rice_pulao_biryani, pasta_noodles, chaat, paratha, pizza, dessert, sauce_dip` · `global` (fusion / non-Indian) · `quick` (≲ 20 min hands-on, no overnight soak or set, no pressure cooker — your estimate, say so in assumptions) · `air_fryer_required` or `air_fryer_optional` (never both).
- **Dish groups**: intentional variants of one dish (e.g. soya kebabs made with peas vs corn & cheese) share a `dish_group` (kebab-case) and each gets a short `variant_label` naming what's different ("with peas"). Unrelated dishes that just share ingredients are not a group.

## 6. Ingredients
- Each ingredient: `item` (English, as shown on the page), `ingredient_id` (dictionary id), `qty`, `unit`, optional `grams`, `type` (protein | dairy | grain | produce | spice | pantry | sauce — same as the dictionary), `optional: true` only if the creator says optional, `as_written`.
- Hindi/Hinglish names map through the dictionary's aliases (jeera → cumin_seeds, jeera powder → cumin_powder, haldi → turmeric, dahi → curd). If an ingredient isn't in `data/ingredients.json`, add it (id, name, aliases, type, protein and kcal per 100 g, basis, main_protein, unit_grams) rather than leaving `ingredient_id: null`.
- Sub-recipes (dressing, chutney, dip) stay in the same list; put the part in brackets in `item`: "Greek yogurt (dressing)".

## 7. Incomplete entries
Link-only or title-only entries are kept: `status: "incomplete"`, empty `ingredients`/`steps`, `per_portion` all `null`, and `missing[]` saying what's absent ("Ingredients and quantities (the post has no caption)", "Method", "Servings and macros"). Use the title and Jatin's notes for main protein, tags and meal types.

## 8. Duplicates
Never merge or drop anything yourself. After writing the records, run `npx tsx scripts/data/dedupe.ts --batch <raw batch file>` and paste its "possible duplicates / variants" list into the PR for Jatin to decide: duplicate (same recipe re-posted) → keep one; variant → give both the same `dish_group`; unrelated → nothing.

## 9. Check before the PR
```
npm run validate                                   # schema + rules
npx tsx scripts/data/check.ts                      # dictionary, ids, maths, 35 % rule
npx tsx scripts/data/fidelity.ts                   # raw vs normalised (needs ../protein-plate-raw)
npx vitest run --config scripts/data/vitest.config.ts
npx tsx scripts/data/review.ts --out ../protein-plate-raw/reviews/<date>-<phase>.md
```
The review sheet quotes raw captions, so it goes in the **private** raw repo; link it from the PR.

## Output
A JSON array of records (or one file per record in `data/recipes/`), each matching the schema exactly — no extra fields. Example of one ingredient and a flag:

```json
{ "item": "boiled black chana", "ingredient_id": "kala_chana", "qty": 100, "unit": "g", "grams": 40, "type": "protein", "as_written": "100g Boiled black Channa" }
```
```json
"flags": [{ "code": "source_conflict", "note": "Soaking time: 3 hours in the ingredient list, 1 hour in the method." }]
```
