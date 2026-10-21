# Add recipes — runbook (Track B)

The drill for turning new raw recipes into catalog entries in a Claude Code session. Follow it top to bottom. The conversion rules live in `prompts/add-recipes.md`; this page says **when and in what order** to apply them.

**How Jatin starts it:** a new Claude Code session with **both** repos attached (`protein-plate` and `protein-plate-raw`), then:

> Add these recipes to the catalog — follow docs/ADD-RECIPES.md.
> *(paste the links + captions + notes, or name a file)*

One batch at a time: two recipe sessions in parallel would both edit `data/ingredients.json`. Running alongside Track A work is fine (different files).

## 1. Start
1. Read `CLAUDE.md`, `docs/TRACKER.md` (B3 row), `docs/handoff/track-b.md`, then `prompts/add-recipes.md` and `schema/recipe.schema.json` in full. Skim `data/ingredients.json` (one entry per line) — don't paste it into the chat.
2. Clone `protein-plate-raw` next to the public repo (`../protein-plate-raw`); the scripts look there. Its `main` must hold every earlier batch file (`fidelity.ts` re-checks all recipes against them); if a file a recipe's `source.ref` names is missing, tell Jatin an earlier raw-repo PR is unmerged.
3. Work on the session's designated branch in both repos (or `b3-<date>` if none was given). Set the TRACKER row to `doing`.

## 2. Save the raw input (private repo)
- Write Jatin's paste **exactly as given** to a **new** file: `protein-plate-raw/batches/<YYYY-MM-DD>-<short-name>.txt`. One entry = a line with a link, followed by its caption and Jatin's notes. Never edit or append to an existing batch file.
- Commit and push it to the private repo. Raw captions **never** go into the public repo (not in recipes, PRs, commit messages or comments).
- Entry N = the Nth line in that file that holds a link; every recipe records it as `source.ref: "batches/<file>#N"`.

## 3. Check the input, and ask
Before converting, read every entry and list anything unclear. **Ask Jatin in the chat, then and there**, as one short numbered list — don't guess and don't park it for the PR. Typical questions:
- A link with no caption: is there a written recipe (comments, another post), or is it video only?
- Two entries that look like the same recipe, or a link already in the catalog (`npx tsx scripts/data/dedupe.ts --batch <file>` lists links already present).
- A note you can't map ("try", "for mom"), a garbled caption, an entry that isn't vegetarian.

Jatin's answers that add recipe content (a caption he pastes, numbers he read from the video) go into a **new** batch file too, so every number is traceable. Decisions go in `docs/review-log.md`.

## 4. Normalise and categorise
Follow `prompts/add-recipes.md` §0–§7 for every entry. In short:
- **Normalisation (fidelity):** ingredients and amounts exactly as written (`as_written` is a substring of the caption); steps are the creator's own words, only reformatted; every number in the caption ends up in the record. No caption → `status: "incomplete"` (`video_only: true` when the video is the recipe).
- **Numbers:** the creator's only. `servings` only from a stated count (or Jatin's answer). Never estimate.
- **Categorisation:** main proteins by the 35 % rule (computed — see step 5), meal types from Jatin's notes (else our guess, said so in `assumptions`), tags and dish groups per §5.
- Missing dictionary ingredients: add them to `data/ingredients.json` (with aliases; avoid bare generic words like "moong").
- Write one file per recipe: `data/recipes/<id>.json`.

## 5. Run the checks
```
npx tsx scripts/data/check.ts --write     # fills per_portion, main/supporting proteins, flags; re-formats
npm run validate                          # schema + rules
npx tsx scripts/data/check.ts             # 0 errors
npx tsx scripts/data/fidelity.ts          # raw vs normalised, must be N/N
npx vitest run --config scripts/data/vitest.config.ts
npx vitest run && npm run typecheck && npm run build
```
Fix every fidelity error by fixing the record (or, if the caption really is odd, explaining it in `assumptions`). Never weaken a check to pass.

## 6. Duplicates
`npx tsx scripts/data/dedupe.ts --batch ../protein-plate-raw/batches/<file>` compares the new recipes with each other and the whole catalog (same link, same creator + title, ingredient overlap, possible variant). **Never merge or delete on your own.** Clear cases (same link) → ask Jatin now; the rest go in the PR list for him: duplicate → keep one, variant → same `dish_group`, unrelated → nothing.

## 7. Review sheet (private)
`npx tsx scripts/data/review.ts --out ../protein-plate-raw/reviews/<date>-<name>.md <new ids…>` — raw vs normalised side by side. Commit it to the private repo.

## 8. PR
Only when the checks are clean and Jatin's questions from step 3 are answered:
- Update `docs/TRACKER.md` (row → `review` + PR link), `docs/DECISIONS.md` (append), `docs/handoff/track-b.md` (overwrite, ≤ 40 lines).
- Commit, push, open the PR. Body: how many recipes added; the **flagged list** (`check.ts` prints it: id + reason); the **duplicates/variants list**; dictionary additions; link to the private review sheet; verification output.
- After every push, check the PR is mergeable (`pull_request_read` → `mergeable_state`); if main moved, merge main in and resolve (DECISIONS.md: keep both sides). Don't wait for Jatin to report conflicts.

## 9. Resolve flags with Jatin
Flags (`no_macros`, `macros_basis_unclear`, `missing_details`, `no_main_protein`, `source_conflict`, `other`) are questions for Jatin; the `/review/` page lists them. Go **one flag type at a time, smallest group first**: for each recipe give the title, the issue and the reel link. Apply his answers:
- a fact (servings, numbers from the video, the main protein) → edit the recipe; the auto flag disappears.
- "fine as it is" → add the code to `accepted_flags`.
- "estimate it" → `estimated_macros` (recipe page only, with a warning). Never otherwise.
Log each decision in `docs/review-log.md`, re-run step 5, push to the same PR (or a new one if it has merged).
