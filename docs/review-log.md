# Review log — flagged recipes

Decisions Jatin makes about flagged recipes (`flags[]` in `data/recipes/*.json`), newest last. One line per decision: date · recipe (or rule) · decision · data change. Track B applies each one and runs `scripts/data/check.ts`. Raw caption text never goes here (it lives in the private repo).

Flag codes: `no_macros` · `macros_basis_unclear` · `missing_details` · `no_main_protein` · `source_conflict` · `other` (see `prompts/add-recipes.md` §4).

## Bulk rules

## Per recipe

- 2026-10-20 · bread-pakoda-sandwich, paneer-chole-salad-bowl, ragda-patty-chaat, soya-pulav · creator's numbers are "per serving"/"per sandwich", so they are per-portion figures even without a serving count (fix by Claude, not a Jatin decision) · `per_portion` filled; `macros_basis_unclear` cleared
