# Track B handoff — Data

_Last updated: 2026-11-23 (B9 vegan tag)_

**Done this session (B9):**
- Schema: tag enum + `vegan` (Jatin allowed the edit); `npm run gen:types` regenerated `src/types/recipe.ts`.
- `vegan` is **computed**: `scripts/data/lib/vegan.ts`, applied by `check.ts --write`. Vegan = every required ingredient is plant-based (optional ones don't count) and the title names no dairy/honey ("… with Yogurt Dip", "Raita"; "peanut butter", "coconut milk", "seed milk" are fine). No ingredient list or an ingredient without a dictionary id → can't tell, the tag stays as set by hand, and `check.ts` prints it under "vegan unknown".
- Dictionary: `"vegan": false` on 32 entries (all dairy, paneer, whey, chicken, honey, and bought foods that usually contain dairy). Absent = plant-based. `date_syrup` split out of `honey`; "buttermilk protein powder" alias dropped from `yeast_protein`.
- Catalog: **30 live recipes vegan** (+13 archived). List in the PR.
- Rules: `docs/ADD-RECIPES.md` step 4/5 + Automated mode 6/9, `prompts/add-recipes.md` §5. The inbox runs `check.ts --write`, so it tags vegan by itself; it must give new dictionary entries `vegan: false` when needed.
- Asked the Dev 2 session for a **Vegan** filter chip (Track A row to add).
- B8 row → done (PR 37 merged).

**Next:**
- Jatin's verdicts on the conservative bought-food list (dark chocolate, protein bread…) and the B8 borderline list.
- `paneer-kali-mirch` fails fidelity on main ("tsp yogurt" alias of `yogurt` matches the caption); pre-existing, not from B9. Fix with an assumption or an alias change in a data session.

**State:** 382 recipes on main. 0 errors in `check.ts`; fidelity 380/381 (the one above).

**Rules in force:**
- Steps = the creator's exact words (`fidelity.ts`). Numbers = the creator's only; `estimated_macros` only when Jatin asks.
- Servings: one portion unless the caption says otherwise. Whole-dish numbers stay on the recipe page.
- `classic` / `add_on`: see ADD-RECIPES step 4; unsure → leave off, list it. `vegan`: computed, never hand-set when it can be worked out.
- Never write the word d-e-s-i. Never put anyone's name in recipe data the app shows.

**Gotchas:**
- Automated inbox runs never edit TRACKER/handoff; tidy them in a human-run session.
- Raw entry N = the Nth line with a link (or an `ID:/URL:` block). New text goes in new batch files.
- Merge the private repo's branch into its `main`, or the next session can't run fidelity.
- Aliases: avoid bare generic words. Splitting an alias into a new entry can break fidelity on old recipes that wrote both ("Honey/Date Syrup"); explain it in `assumptions`.
- PR numbers are shared by both tracks. `docs/DECISIONS.md` conflicts often; keep both sides.
- After every push, check CI with `gh api repos/Jatin17Solanki/protein-plate/commits/<sha>/check-runs` (GitHub MCP tools retired).

**Scheduled tasks:** "recipe inbox" (`trig_0134ycguz44pck7shDVZnZ6V`) reads this runbook from main each run; on demand: claude.ai → scheduled tasks → *Run now*. "raw archive" (`trig_01QmEycMcpBMKfzrX5S4wfEy`).

**Coordination:** Track A session "Dev 2 - phase A" (`session_01Qwkn8yZAbjE228CGzZT6xB`), via `send_message`.
