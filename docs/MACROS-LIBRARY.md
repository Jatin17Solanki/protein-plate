# Macros library

`data/macros-library.json` holds Jatin's own pantry: the exact brands he buys, with calories, protein, carbs, fat, fibre and cost for the portion he normally eats. It is separate from the ingredient dictionary (`data/ingredients.json`), which holds generic values for matching recipe text.

Built 2026-11-24/25 in the Claude chat for the "Personal Health" project, from pack labels (Jatin's photos), brand listings on BigBasket, Zepto, Swiggy and Flipkart, and USDA / IFCT 2017 reference values where no label was found. An interactive view of it lives as a private Claude artifact ("Macros Library").

## What it is for
- Working out what Jatin actually ate: plate builder, daily protein against the 100–120 g target, rupees per 10 g protein.
- Brand-accurate values when Jatin **asks** for an estimate on a recipe (`estimated_macros`). It does **not** replace creator numbers: recipe macros stay the creator's own unless Jatin asks.

## Shape (schema_version 1.1)
Top level: `title`, `as_of`, `conventions` (read these first), `items[]`.

Each item:

| Field | Meaning |
|---|---|
| `id` | Stable slug, e.g. `soya_chunks_fortune` |
| `ingredient_id` | Matching id in `data/ingredients.json`, or `null` (meals, fruit) |
| `brand`, `product`, `name` | Who makes it; brand + product name; plain name. `Generic` = no brand |
| `category` | `dairy_protein`, `soy_protein`, `dairy`, `supplement`, `grain`, `seed`, `pulse`, `buffer` (veg, oil, fruit as standard portions), `meal` (built from other items) |
| `serving` | `{amount, unit, form, label}`. `form` is `dry`, `raw`, `cooked` or `prepared` and matters: 50 g dry dal is not 50 g cooked dal |
| `per_100` | Per 100 g / 100 ml in that form. For `unit: piece` it is per piece. Absent on `meal` and the roti |
| `per_serving` | Values for one `serving` |
| `cost` | `cost_per_serving_inr`, `cost_per_10g_protein_inr`, pack size and price, source, `price_as_of` |
| `confidence` | `high` = pack label or official listing; `medium` = crowd-sourced, reference value or estimate |
| `source`, `notes` | Where each number came from; caveats |
| `components` | `meal` only: the items and servings it is made of; its macros are their sum |
| `derivation` | Roti only: how 35 g cooked roti maps to ~26 g dry flour (50% Aashirvaad atta, 25% Tata Sampann besan, 25% FirstClub full-fat soya flour) + ~2 g ghee |
| `kcal_check` | Flags labels whose kcal disagree with their own macros by > 15% (Mooz tofu) |

`carbs_g` always **includes** fibre (net carbs = `carbs_g - fibre_g`).

## Known gaps
- Tata Sampann kabuli chana, rajma and kala chana: label not found online, reference values used (`confidence: medium`). Replace from pack photos.
- Moong dal fibre, the FirstClub soya flour price and the rice variety/price are assumptions.
- Cooked pulse dishes: Jatin will send plate weights. Convert with a dish's yield (`dry × your portion ÷ total cooked weight`); default yields are thin dal 5–6×, medium dal ~4×, rajma/chole curry 3.5–4×, dry sabzi ~2.5× until measured.

## Changing it
Edit the values in `scripts/data/macros/build_library.py`, then run `python3 scripts/data/macros/build_library.py` from the repo root. It recomputes servings, costs, meals and the kcal check. Don't hand-edit derived fields in the JSON.
