# Review log — flagged recipes

Decisions Jatin makes about flagged recipes (`flags[]` in `data/recipes/*.json`), newest last. One line per decision: date · recipe (or rule) · decision · data change. Track B applies each one and runs `scripts/data/check.ts`. Raw caption text never goes here (it lives in the private repo).

Flag codes: `no_macros` · `macros_basis_unclear` · `missing_details` · `no_main_protein` · `source_conflict` · `other` (see `prompts/add-recipes.md` §4).

## Bulk rules

- 2026-10-20 · rule · new main protein value `other` for recipes that aren't really high-protein / have no significant protein source (Jatin) · schema enum + data; the filter chip and tile colour are Track A's
- 2026-10-20 · rule · when the 35 % rule finds no main protein, Jatin's choice is kept (check.ts) · `no_main_protein` clears once one is set

- 2026-10-20 · rule · posts with no written recipe are `video_only: true` (no transcribing, off the review list). They **stay in the main catalog** with a "video only" icon so they aren't lost; notes still work; no macros is accepted (Jatin). App badge = Track A
- 2026-10-20 · rule · a caption with ingredients but no method gets the single step "No written method — watch the video for the steps."; missing amounts are kept as is with a "watch the video" note

## Per recipe

- 2026-10-20 · bread-pakoda-sandwich, paneer-chole-salad-bowl, ragda-patty-chaat, soya-pulav · creator's numbers are "per serving"/"per sandwich", so they are per-portion figures even without a serving count (fix by Claude, not a Jatin decision) · `per_portion` filled; `macros_basis_unclear` cleared
- 2026-10-20 · galouti-kebab-bowl · source_conflict (Soya: 'dry soya chunks' in the ingredient list, 'soya granules' in the method.) → Jatin: use dry soya chunks · note added to assumptions; flag removed
- 2026-10-20 · high-protein-pasta · source_conflict (Whole wheat flour: ½ tbsp in the ingredient list, 1 tsp in the method.) → Jatin: use 1 tsp whole wheat flour · note added to assumptions; flag removed
- 2026-10-20 · moong-bhajiya · source_conflict (Soaking time: 3 hours in the ingredient list, 1 hour in the method.) → Jatin: soak 1 to 3 hours · note added to assumptions; flag removed
- 2026-10-20 · protein-upma · source_conflict (Water: 150 ml in the ingredient list, 200 ml in the method.) → Jatin: use 150 ml water · note added to assumptions; flag removed
- 2026-10-20 · soya-poha · source_conflict (Soya granules: 30 g in the ingredient list, 25 g in the method.) → Jatin: use 25 g soya granules · note added to assumptions; flag removed
- 2026-10-20 · chickpea-pea-taco · no_main_protein → Jatin: pulses · main_proteins set; flag removed
- 2026-10-20 · cucumber-sushi-boats · no_main_protein → Jatin: pulses · main_proteins set; flag removed
- 2026-10-20 · protein-upma · no_main_protein → Jatin: tofu · main_proteins set; flag removed
- 2026-10-20 · besan-toast-breakfast-sandwich · no_main_protein → Jatin: paneer · main_proteins set; flag removed
- 2026-10-20 · chocolate-pudding · no_main_protein → Jatin: other · main_proteins set; flag removed
- 2026-10-20 · watermelon-sorbet · no_main_protein → Jatin: other · main_proteins set; flag removed
- 2026-10-20 · idli-shakshuka · no_main_protein → Jatin: other · main_proteins set; flag removed
- 2026-10-20 · avocado-burrata-toast · removed from the catalog (Jatin: the post only links to a website) · file deleted
- 2026-10-20 · batch-1 #79/#80 (sauces section) · the batch file had only links; titles were swapped. Jatin supplied both captions (private repo `batches/2026-10-20-jatin-captions.txt`) · `C8bV56bo7yT` → new **chipotle-paneer-dip-sandwich**; `DIk-CWWtQI1` → **chipotle-sauce** (was the `sauce` placeholder, now removed); both complete, flagged `no_macros`
- 2026-10-20 · chana-soya-galouti-kebab · missing_details (link only) → Jatin: video only; main protein soya · `video_only: true`; flags cleared
- 2026-10-20 · chickpea-salad · missing_details (link only) → Jatin: video only; main protein pulses; salad_bowl · `video_only: true`; flags cleared
- 2026-10-20 · lasooni-dhaniya-paneer · missing_details (link only) → Jatin: video only; main protein paneer; curry_sabzi; meals lunch, dinner · `video_only: true`; flags cleared
- 2026-10-20 · five-paneer-marinations · missing_details (link only) → Jatin: video only; main protein paneer · `video_only: true`; flags cleared
- 2026-10-20 · protein-kebab-air-fryer · missing_details (link only) → Jatin: video only · `video_only: true`; flags cleared
- 2026-10-20 · soya-chana-dal-tikki · missing_details (link only) → Jatin: video only; main protein soya · `video_only: true`; flags cleared
- 2026-10-20 · bread-pakoda-sandwich · missing_details (no method) → Jatin: method says 'watch the video' · steps = standard video step; status complete; missing cleared
- 2026-10-20 · tofu-paratha · missing_details (no method) → Jatin: method says 'watch the video' · steps = standard video step; status complete; missing cleared
- 2026-10-20 · hara-bhara-kebab · missing_details (no method) → Jatin: method says 'watch the video' · steps = standard video step; status complete; missing cleared
- 2026-10-20 · soya-tikki · missing_details (no method) → Jatin: method says 'watch the video' · steps = standard video step; status complete; missing cleared
- 2026-10-20 · chipotle-paneer-sandwich · missing_details (no method) → Jatin: method says 'watch the video' · steps = standard video step; status complete; missing cleared
- 2026-10-20 · green-moong-spinach-chilla · missing_details (one amount) → Jatin: fine as is · note added; missing cleared
- 2026-10-20 · soya-pea-kebab · missing_details (one amount) → Jatin: fine as is · note added; missing cleared
- 2026-10-20 · tempeh-pav-bhaji · missing_details (one amount) → Jatin: fine as is · note added; missing cleared
- 2026-10-20 · paneer-marinades · link only → Jatin supplied the recipe from the post's comments (private repo `batches/2026-10-20-jatin-captions-2.txt`) · now complete: 3 marinades, method = 'watch the video'; flagged no_macros
- 2026-10-20 · protein-kebab-air-fryer · Jatin confirms: video only · main protein still open
