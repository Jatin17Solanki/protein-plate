# Track B handoff — Data

_Last updated: 2026-10-21 (B3 batch 2 in review; B5 export prompt and B6 done earlier)_

**Done (B3):** batch 2 (`batches/2026-10-21-batch2.txt`, 370 links) is converted: **283 new recipes**, then 12 removed by Jatin (2 missing details, 10 duplicates): 259 in the catalog + 93 archived. Left out: 48 already in the catalog, 25 older reposts, NOODLES-D (chicken), CHAI-A (promo), 10 multi-recipe posts. 34 existing recipes now credit fit.khurana. Two recipes come from pinned comments Jatin pasted (`batches/2026-10-21-jatin-captions.txt`). Checks: validate 362/362, fidelity 362/362, data + app tests, typecheck, build all pass. Review sheet + dedupe report: private repo `reviews/2026-10-21-B3-batch2*.md`.

**Next (B6 round 3):** `macros_basis_unclear` is done (Jatin's rule: one portion unless the caption says otherwise; 17 exceptions accepted). `missing_details` done (both removed). `no_macros` done: 39 archived (see below), 20 meals kept blank. `no_main_protein`: sweets/condiments archived, breakfast bowls → `other`, 5 set to soya/pulses. The last 17 savoury ones → archived as low-protein dishes. **0 flagged.** Duplicates resolved (DECISIONS 2026-10-21). **B3 is done** once PR 25 merges.

**Archive (built in this PR, see TRACKER BL6):** `archived: {reason}` (`drink` / `sweet_snack` / `breakfast_bowl` / `sauce_dip` / `condiment` / `low_protein` / `staple`) hides a recipe everywhere except its own page and `/archive/`. To bring one back, delete the field. `check.ts` doesn't list archived recipes as flagged.

**Next:**
- B5: `prompts/ask-catalog.md` written and tested ([PR 26](https://github.com/Jatin17Solanki/protein-plate/pull/26)). Track A swaps it into `askPrompt()`: text after its `---`, then the catalog and "My question:"; drop the "my data" bullet when personal data isn't included. Keep its field guide in step with `compactCatalog()`.
- Every future batch: follow `docs/ADD-RECIPES.md`. When Jatin sends the new compilation: run `dedupe.ts --batch <file>` (or `findPairsAgainst`), fix creator credits where it names them, add the recipes the same way.
- B4: the protein oats recipe (Jatin will send it). Only 6 incomplete recipes remain, all video only, kept as is by Jatin. The My list seed was delivered in chat (never committed).

**Track A requests:**
- A "fun to try" tag (Jatin's notes mark many posts that way); not in the schema yet.
- Many new recipes use "high-protein yogurt" with `ingredient_id: null` (no protein estimate). Fine for creator numbers; a dictionary entry would need Jatin's protein figure.

**Gotchas (new this session):**
- Conversion working files (generator + per-entry specs) are in the private repo `tools/b3-gen/`; re-run with `run.sh specsNN` after `npm i`. Paths in them are absolute to this container.
- `fidelity.ts` changes: thousands separators, @handles in steps, promo cues (`isPromoLine`), mixed fractions. `raw.ts`: structured `ID:/URL:` batches.
- Dictionary: `chilli_garlic` (a broken entry) removed; "powdered sugar"/"caster sugar" are sugar, not sweetener; added "chillie flakes/powder", "dried red chilles", "red chillies dried".
- Validate warns on 5 dips/spreads that keep a snack meal (Jatin's notes said snack). Leave unless he says otherwise.
- Never put Jatin's (or anyone's) name in recipe data the app shows: basis "… — one portion", assumptions "The recipe makes one portion.", "Main protein set by hand."
- Edits after conversion were made to the JSON directly; don't re-run the `tools/b3-gen` specs (they'd undo them).
- Raw entry N = the Nth line with a link. "Recipe by @x" = original creator.
- After every push, check mergeability with `pull_request_read`.
- Aliases: avoid bare generic words ("moong", "methi", "yogurt", "cloves"); they break existing recipes. Plurals need their own alias.
- PR numbers are shared by both tracks; `docs/DECISIONS.md` conflicts often, keep both sides.

**Open questions for Jatin:** none blocking; the flag rounds above.
