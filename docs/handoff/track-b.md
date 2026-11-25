# Track B handoff — Data

_Last updated: 2026-11-25 (B10 macros library follow-up)_

**Done:**
- B10 (macros library, PR 46) was built in the Personal Health chat and is merged. This session read it end to end and recorded the follow-ups: tracker B10 → done, B9 → done (PR 44 merged), new B11 row, new decision D8. No data or code changed.
- Checked: all 29 library `ingredient_id`s exist in `data/ingredients.json`; `build_library.py` rebuilds the committed JSON byte for byte; nothing in `src/`, `public/`, `scripts/` or `tests/` reads the library.
- B9 (vegan tag) is merged; V2-5 (Track A chip) is in review in PR 45.

**Not done / open:**
- **D8 (Jatin):** the library puts brands, prices, his own meals and his first name in the public repo. Options in the TRACKER row (keep / anonymise / move to private repo).
- **B11 (backlog):** replace the 10 `medium` items from pack photos; add soya granules, chana dal, tempeh slices, protein pav; Jatin's roti weigh-in and cooked plate weights. Needs from Jatin are listed in the TRACKER row and `docs/MACROS-LIBRARY.md` Known gaps.
- Nothing validates the library: no schema in `schema/`, `check.ts` ignores it, no CI test that the JSON matches the build script. Decide in B11.
- `paneer-kali-mirch` still fails fidelity on main (alias "tsp yogurt" → `yogurt`). Pre-existing.

**Next step:** wait for D8; when Jatin sends photos or weights, run B11 (edit values in `build_library.py`, rerun, never hand-edit the JSON).

**State:** 382 recipes on main; `check.ts` 0 errors; fidelity 380/381 (the one above).

**Rules in force:**
- Steps = the creator's exact words (`fidelity.ts`). Numbers = the creator's only; `estimated_macros` only when Jatin asks, and then from the library.
- `carbs_g` in the library includes fibre. Library = brand-accurate; dictionary = generic. They disagree on purpose (tofu 14.2 vs 10 g/100 g, tempeh 21 vs 19, roti ~15 vs 9); say which one an estimate used.
- Servings: one portion unless the caption says otherwise. `classic` / `add_on`: ADD-RECIPES step 4. `vegan` is computed.
- Never write the word d-e-s-i. Never put anyone's name in recipe data the app shows.

**Gotchas:**
- Library edits come from the Personal Health chat as PRs (`data/macros-library`); keep the build script as the only place values change.
- Automated inbox runs never edit TRACKER/handoff; tidy them in a human-run session.
- Raw entry N = the Nth line with a link (or an `ID:/URL:` block). New text goes in new batch files.
- Merge the private repo's branch into its `main`, or the next session can't run fidelity.
- Aliases: avoid bare generic words; explain alias splits in `assumptions`.
- PR numbers are shared by both tracks. `docs/DECISIONS.md` conflicts often; keep both sides.
- After every push, check CI with `gh api repos/Jatin17Solanki/protein-plate/commits/<sha>/check-runs`.

**Scheduled tasks:** "recipe inbox" (`trig_0134ycguz44pck7shDVZnZ6V`) reads this runbook from main each run; "raw archive" (`trig_01QmEycMcpBMKfzrX5S4wfEy`).

**Coordination:** Track A session "Dev 2 - phase A" (`session_01Qwkn8yZAbjE228CGzZT6xB`), via `send_message`.
