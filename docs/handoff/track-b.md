# Track B handoff — Data

_Last updated: 2026-11-10 (B8 Classic and Add-on tags)_

**Done this session (B8, asked as "B7"; B7 is the recipe inbox):**
- Schema: tag enum + `classic`, `add_on` (Jatin allowed this one Track B schema edit); `npm run gen:types` regenerated `src/types/recipe.ts`.
- Live catalog tagged (269 live recipes, archived untouched): **30 `classic`, 7 `add_on`**, appended after the other tags (never the tile icon). Lists + borderline cases in the PR for Jatin.
- Rules in `docs/ADD-RECIPES.md` step 4 + Automated mode step 6/9, and in `prompts/add-recipes.md` §5 (the Add screen's Copy prompt and the inbox both read it).
- "desi" removed everywhere (ghee alias, a data-test caption). Rule: never write that word.
- B7 (recipe inbox) row set to done: PR 33 merged; first real batch B001 merged in PR 35.

**Next:**
- **Track A row V2-2 (Classics and Add-ons filters) can start once this PR merges.** Tag ids: `classic`, `add_on`. Today they only work through search ("classic", "add on").
- Apply Jatin's verdicts on the borderline list (add/remove the tag, log in `docs/DECISIONS.md`).

**State:** 362 recipes: 269 shown, 93 archived. 0 flagged except the inbox's own. Fidelity 361/361 (protein-oats-smoothie has no raw ref).

**Rules in force:**
- Steps = the creator's exact words (`fidelity.ts`). Numbers = the creator's only; `estimated_macros` only when Jatin asks.
- Servings: one portion unless the caption says otherwise. Whole-dish numbers stay on the recipe page.
- `classic`: everyday Indian dish + added/swapped protein; not when the protein is the dish's own (shahi paneer, chole, moong chilla), not fusion, sandwiches, wraps, sweets. `add_on`: small protein side for a plain meal; not full meals, gravies or sauces alone. Unsure → leave off, list it.
- Never put anyone's name in recipe data the app shows.

**Gotchas:**
- Automated inbox runs never edit TRACKER/handoff; tidy them in a human-run session.
- Raw entry N = the Nth line with a link (or an `ID:/URL:` block). New text goes in new batch files.
- Merge the private repo's branch into its `main`, or the next session can't run fidelity.
- Aliases: avoid bare generic words ("moong", "methi", "yogurt"). Plurals need their own alias.
- Validate warns on dips/spreads that keep a meal type (Jatin's notes); leave them.
- PR numbers are shared by both tracks. `docs/DECISIONS.md` conflicts often; keep both sides.
- After every push, check mergeability with `pull_request_read`.

**Open for Jatin:** borderline Classic/Add-on list (PR); a protein-per-100 g figure for "high-protein yogurt"; whether he wants a "fun to try" tag.

**Coordination:** Track A session "Dev 2 - phase A" (`session_01Qwkn8yZAbjE228CGzZT6xB`), via `send_message`.
