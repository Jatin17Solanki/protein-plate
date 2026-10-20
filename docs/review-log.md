# Review log — flagged recipes

Decisions Jatin makes about flagged recipes (`flags[]` in `data/recipes/*.json`), newest last. One line per decision: date · recipe (or rule) · decision · data change. Track B applies each one and runs `scripts/data/check.ts`. Raw caption text never goes here (it lives in the private repo).

Flag codes: `no_macros` · `macros_basis_unclear` · `missing_details` · `no_main_protein` · `source_conflict` · `other` (see `prompts/add-recipes.md` §4).

## Bulk rules

## Per recipe

- 2026-10-20 · bread-pakoda-sandwich, paneer-chole-salad-bowl, ragda-patty-chaat, soya-pulav · creator's numbers are "per serving"/"per sandwich", so they are per-portion figures even without a serving count (fix by Claude, not a Jatin decision) · `per_portion` filled; `macros_basis_unclear` cleared
- 2026-10-20 · galouti-kebab-bowl · source_conflict (Soya: 'dry soya chunks' in the ingredient list, 'soya granules' in the method.) → Jatin: use dry soya chunks · note added to assumptions; flag removed
- 2026-10-20 · high-protein-pasta · source_conflict (Whole wheat flour: ½ tbsp in the ingredient list, 1 tsp in the method.) → Jatin: use 1 tsp whole wheat flour · note added to assumptions; flag removed
- 2026-10-20 · moong-bhajiya · source_conflict (Soaking time: 3 hours in the ingredient list, 1 hour in the method.) → Jatin: soak 1 to 3 hours · note added to assumptions; flag removed
- 2026-10-20 · protein-upma · source_conflict (Water: 150 ml in the ingredient list, 200 ml in the method.) → Jatin: use 150 ml water · note added to assumptions; flag removed
- 2026-10-20 · soya-poha · source_conflict (Soya granules: 30 g in the ingredient list, 25 g in the method.) → Jatin: use 25 g soya granules · note added to assumptions; flag removed
