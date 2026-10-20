# Tracker

Status: `todo` · `doing` · `review` (PR open) · `done` · `blocked`
Update your own row at the end of every session. Track A sessions edit only the Track A table; Track B sessions only the Track B table (avoids merge conflicts).

## Decisions needed  [J] = Jatin
| # | Decision | Recommendation | Needed by | Answer |
|---|---|---|---|---|
| D1 | [J] Raw recipe dumps contain personal notes and copied captions. A public repo makes them public. | Don't commit raw dumps. Keep them in a **private** repo `protein-plate-raw` that Track B sessions can read, or paste them into the session. Only normalised recipes go in the public repo. | B1 | **Agreed 2026-10-20.** Done: private repo `Jatin17Solanki/protein-plate-raw` created; batch 1 uploaded to `batches/2026-10-16-batch1.txt`. |
| D2 | [J] Tech stack | Vite + TypeScript + Preact + vite-plugin-pwa + MiniSearch + Ajv + Playwright + Vitest | A1 | **Agreed 2026-10-20.** |
| D3 | [J] Schema field names | Claude proposes in A1's PR | A1 merge | **Agreed 2026-10-20** (schema as proposed in the A1 PR). |
| D4 | [J] Previews before merge | v1: no preview hosting; every UI PR carries screenshots; Jatin checks the live site on his phone after merge (rollback = revert). Revisit if this hurts. | A2 | **Agreed 2026-10-20.** |
| D5 | [J] Recipe text on a public site | Steps rewritten in our own words, always crediting the creator with a link; ingredient lists as facts. (Not legal advice.) | B1 | **Agreed 2026-10-20**, with the fidelity rules in PLAN B1 (normalisation must never change the recipe). |
| D6 | [J] Licence for the code | MIT | A1 | **Agreed 2026-10-20.** |

## Track A — App
| ID | Phase | Depends on | Status | Branch / PR | Model | Notes |
|---|---|---|---|---|---|---|
| A1 | Scaffold, schema, CI, deploy | Phase 0 | review | `claude/compassionate-clarke-bxgv06` / [PR 1](https://github.com/Jatin17Solanki/protein-plate/pull/1) | Opus | Schema approved (D3). Site goes live on first push to main. |
| A2 | App shell + Home grid | A1 | todo | | Sonnet | |
| A3 | Filters + search + empty state | A2 | todo | | Sonnet | |
| A4 | Recipe page + personal data + My recipes | A2 | todo | | Sonnet | |
| A5 | Share, Edit, Menu, theme, backup, hint | A4 | todo | | Sonnet | |
| A6 | Offline, share previews, polish | A5 | todo | | Sonnet | |
| A7 | Add recipes + Export | A3, B1 | todo | | Sonnet | |
| A8 | QA pass | A1–A7 | todo | | Opus | |

## Track B — Data
| ID | Phase | Depends on | Status | Branch / PR | Model | Notes |
|---|---|---|---|---|---|---|
| B1 | Rules, dictionary, prompt v1, first 10 | A1 schema, D1, D5 | review | `claude/busy-noether-s5qjwo` / [PR 3](https://github.com/Jatin17Solanki/protein-plate/pull/3) | Opus | Review sheet in private repo `reviews/2026-10-20-B1-first-10.md` |
| B2 | Rest of batch 1 (split B2a, B2b… ~20 each) | B1 approved | todo | | Opus | |
| B3 | Batch 2 (new scrape) | B2 | todo | | Opus | Jatin supplies the file |
| B4 | Incomplete entries, oats, My list seed | Jatin's details | todo | | Opus | |
| B5 | Export prompt + agent questions | B2 | todo | | any | can be done in claude.ai |

## Jatin's tasks
| Task | When |
|---|---|
| Phase 0 setup | now |
| Answer D1–D6 | before A1 / B1 start |
| Review schema in A1 PR | A1 |
| Review 10 normalised recipes (B1), confirm duplicate lists (B2, B3) | per PR |
| Phone check of the live site after each UI merge | A2 onwards |
| Send new scrape (B3), incomplete details + oats (B4) | when ready |
