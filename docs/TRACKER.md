# Tracker

Status: `todo` · `doing` · `review` (PR open) · `done` · `blocked` · `backlog` (parked until its dependency is done)
Update your own row at the end of every session. Track A sessions edit only the Track A table; Track B sessions only the Track B table (avoids merge conflicts).

## Decisions needed  [J] = Jatin
| # | Decision | Recommendation | Needed by | Answer |
|---|---|---|---|---|
| D1 | [J] Raw recipe dumps contain personal notes and copied captions. A public repo makes them public. | Don't commit raw dumps. Keep them in a **private** repo `protein-plate-raw` that Track B sessions can read, or paste them into the session. Only normalised recipes go in the public repo. | B1 | **Agreed 2026-10-20.** Done: private repo `Jatin17Solanki/protein-plate-raw` created; batch 1 uploaded to `batches/2026-10-16-batch1.txt`. |
| D2 | [J] Tech stack | Vite + TypeScript + Preact + vite-plugin-pwa + MiniSearch + Ajv + Playwright + Vitest | A1 | **Agreed 2026-10-20.** |
| D3 | [J] Schema field names | Claude proposes in A1's PR | A1 merge | **Agreed 2026-10-20** (schema as proposed in the A1 PR). |
| D4 | [J] Previews before merge | v1: no preview hosting; every UI PR carries screenshots; Jatin checks the live site on his phone after merge (rollback = revert). Revisit if this hurts. | A2 | **Agreed 2026-10-20.** |
| D5 | [J] Recipe text on a public site | Steps rewritten in our own words, always crediting the creator with a link; ingredient lists as facts. (Not legal advice.) | B1 | **Revised 2026-10-20 (B1 review):** steps keep the creator's exact wording, formatting only; creator credited with a link. Jatin accepts the risk; rewording can't be verified at 180+ recipes. |
| D6 | [J] Licence for the code | MIT | A1 | **Agreed 2026-10-20.** |
| D7 | [J] **Flag recipes for Jatin's review + admin view.** Recipes with open questions need to be marked, and Jatin needs one place to see them and decide. | Track B owns the data: optional `flags: [{code, note}]` (codes `no_macros`, `macros_basis_unclear`, `missing_details`, `no_main_protein`, `source_conflict`, `other`), set by `scripts/data/check.ts` or by hand, removed when resolved. Track A owns the hidden read-only page `/review/`. Jatin resolves by telling the Track B session the recipe title + decision. | B2 | **Agreed 2026-10-20** (Jatin; Track A and Track B confirmed with each other). Flags built in B2 (PR 10); whole-recipe figures come from `stated_macros` when `servings` is null; creator's numbers only. `/review/` built in A6b. Review itself = B6 (Jatin ↔ Track B, by recipe title, decisions logged in the repo). |

## Track A — App
| ID | Phase | Depends on | Status | Branch / PR | Model | Notes |
|---|---|---|---|---|---|---|
| A1 | Scaffold, schema, CI, deploy | Phase 0 | done | `claude/compassionate-clarke-bxgv06` / [PR 1](https://github.com/Jatin17Solanki/protein-plate/pull/1) | Opus | Schema approved (D3). Site goes live on first push to main. |
| A2 | App shell + Home grid | A1 | done | `claude/compassionate-clarke-bxgv06` / [PR 2](https://github.com/Jatin17Solanki/protein-plate/pull/2) | Opus | Search, filter button, menu, add, My recipes are visual only (A3/A5/A7). Desktop shows chips instead of the sidebar until A3. |
| A3 | Filters + search + empty state | A2 | done | `claude/compassionate-clarke-bxgv06` / [PR 4](https://github.com/Jatin17Solanki/protein-plate/pull/4) | Opus | Search uses a built-in synonym stub until Track B ships `data/ingredients.json`. |
| A4 | Recipe page + personal data + My recipes | A2 | done | `claude/compassionate-clarke-bxgv06` / [PR 5](https://github.com/Jatin17Solanki/protein-plate/pull/5), fix [PR 6](https://github.com/Jatin17Solanki/protein-plate/pull/6) | Opus | Main went red after merge (notes test race); fix PR saves notes on page hide too. |
| A5 | Share, Edit, Menu, theme, backup, hint | A4 | done | `claude/compassionate-clarke-bxgv06` / [PR 9](https://github.com/Jatin17Solanki/protein-plate/pull/9) | Opus | Also whole-recipe protein when portions aren't stated (Jatin). Flagging/admin view → D7. |
| A6b | Review page `/review/` for flagged recipes; "Macros not given"; neutral tint | A5, B2 flags | done | `claude/compassionate-clarke-bxgv06` / [PR 12](https://github.com/Jatin17Solanki/protein-plate/pull/12) | Opus | Live list: 62 of 80 recipes. Not linked in the menu (bookmark `/review/`). |
| A6 | Offline, share previews, polish | A5 | done | `claude/compassionate-clarke-bxgv06` / [PR 13](https://github.com/Jatin17Solanki/protein-plate/pull/13) | Opus | Jatin: send one recipe link in WhatsApp to check the preview card; try the site in airplane mode after one visit. Fix after merge: share link order (WhatsApp preview), [PR 15](https://github.com/Jatin17Solanki/protein-plate/pull/15). |
| A7 | Add recipes + Export | A3, B1 | done | `claude/phase-a7-recipes-export-co5avf` / [PR 14](https://github.com/Jatin17Solanki/protein-plate/pull/14) | Opus | Jatin: try Add with one real reel on your phone (Copy prompt → ChatGPT/Claude → paste → Submit → Commit on GitHub). Requests for Track B in `docs/handoff/track-a.md`. |
| A8 | QA pass | A1–A7 | done | `claude/phase-a7-recipes-export-co5avf` / [PR 16](https://github.com/Jatin17Solanki/protein-plate/pull/16) | Opus | Report `docs/QA.md` (6 fixes). Manual test happens once at the end (`docs/MANUAL-TEST.md`); results become the next Track A fix list. |

## Backlog (not scheduled; becomes a phase when its dependency is done)
| ID | Item | Depends on | Status | Branch / PR | Model | Notes |
|---|---|---|---|---|---|---|
| BL1 | "Others" protein + video-only recipes (app side), plus accepted flags and estimated macros from the same Track B PR | [PR 18](https://github.com/Jatin17Solanki/protein-plate/pull/18) (merged) | done | `claude/phase-a7-recipes-export-co5avf` / [PR 19](https://github.com/Jatin17Solanki/protein-plate/pull/19) | Opus | Others chip + neutral tint; ▶ Video only badge/card; /review/ skips video-only + accepted flags; estimate shown on the recipe page only, with a warning. Fixed a My recipes crash on `other`. |
| BL2 | Whole-dish creator numbers only on the recipe page: tiles, sorting, My recipes, version cards, share text, exports, `catalog.txt` and preview cards use per-portion figures only (`portionProtein`) | BL1, Track B PR 20 | review | `claude/phase-a7-recipes-export-co5avf` / [PR 21](https://github.com/Jatin17Solanki/protein-plate/pull/21) | Opus | Affects mint-cheese-spread, protein-spaghetti, tempeh-pav-bhaji (Jatin via Track B, 2026-10-20). |
| BL3 | Full README: what the app does; architecture and key decisions (static site, no servers, Git as the source of truth, creator-numbers-only, personal data in the browser); **"Run your own copy"** section for forks (`site.config.json`, GitHub Pages, adding recipes, the two-track setup); **recipe credit** section (recipes belong to their creators, linked and credited; not Jatin's own); user journeys supported today; v1 scope vs v2 (meal planning / weekly rotation, CONTEXT §11 backlog) | — | backlog | | any | Docs only (`README.md`, Track A). Pull from CONTEXT §1–3, §11, DECISIONS. |
| BL4 | In-app **Send feedback**: menu item (+ link on the recipe page) offering **Email** (mailto, pre-filled with page + device) and **GitHub issue** (pre-filled issue form; label `feedback`). Address and repo from `site.config.json` so forks get their own | — | backlog | | any | Decided 2026-10-20: both channels. **Needs from Jatin before building:** the feedback email address (a separate one is best; it becomes public). Add to MANUAL-TEST. |

## Track B — Data
| ID | Phase | Depends on | Status | Branch / PR | Model | Notes |
|---|---|---|---|---|---|---|
| B1 | Rules, dictionary, prompt v1, first 10 | A1 schema, D1, D5 | done | `claude/busy-noether-s5qjwo` / [PR 3](https://github.com/Jatin17Solanki/protein-plate/pull/3) | Opus | Review sheet in private repo `reviews/2026-10-20-B1-first-10.md` |
| B2 | Rest of batch 1 | B1 approved | review | `claude/busy-noether-s5qjwo` / [PR 10](https://github.com/Jatin17Solanki/protein-plate/pull/10) | Opus | Done as B2a + one batch for the last 50 (Jatin: no more small batches). All 80 entries in the catalog. |
| B2a | Batch 1 entries #2, 3, 7–21, 23–25 (20) | B1 | done | `claude/busy-noether-s5qjwo` / [PR 7](https://github.com/Jatin17Solanki/protein-plate/pull/7) | Opus | 30 recipes in catalog; review sheet `reviews/2026-10-20-B2a.md` (private repo) |
| B2b | Batch 1 entries #26–80 (the last 50) + creator-numbers-only + flags | B2a | review | `claude/busy-noether-s5qjwo` / [PR 10](https://github.com/Jatin17Solanki/protein-plate/pull/10) | Opus | Review sheet `reviews/2026-10-20-B2b-rest.md` (private repo) |
| B6 | Resolve flagged recipes with Jatin | B2, /review/ page | review | `claude/busy-noether-s5qjwo` / round 1 [PR 18](https://github.com/Jatin17Solanki/protein-plate/pull/18) (merged), round 2 [PR 20](https://github.com/Jatin17Solanki/protein-plate/pull/20) | Opus | Round 1: conflicts, main proteins (+`other`), missing details (+`video_only`), macros (+`accepted_flags`, `estimated_macros`). Round 2: the 32 `macros_basis_unclear`. **0 flagged.** Whole-dish numbers off home cards = Track A request. Log: docs/review-log.md |
| B3 | Batch 2 (new scrape) | B2 | review | `b3-2026-10-21` / [PR 25](https://github.com/Jatin17Solanki/protein-plate/pull/25) | Opus | 283 recipes added (362 in catalog); 37 entries left out, 48 already in the catalog. Review sheet `reviews/2026-10-21-B3-batch2.md` (private repo). Flags to resolve with Jatin (B6 round 3). |
| B4 | Incomplete entries, oats, My list seed | Jatin's details | todo | | Opus | My list seed delivered 2026-10-20 (13 recipes, backup file sent in chat, not committed). Waiting on Jatin: protein oats recipe + details for the 15 incomplete entries. |
| B5 | Export prompt + agent questions | B2 | todo | | any | can be done in claude.ai |

## Jatin's tasks
| Task | When |
|---|---|
| Phase 0 setup | now |
| Answer D1–D6 | before A1 / B1 start |
| Review schema in A1 PR | A1 |
| Review 10 normalised recipes (B1), confirm duplicate lists (B2, B3) | per PR |
| Send new scrape (B3), incomplete details + oats (B4) | when ready |
| Manual test by user journey (`docs/MANUAL-TEST.md`, J1–J12, ~2 h, any order); log feedback, then a triage session decides fix / later / won't fix | once, at the end (when both tracks are done) |
