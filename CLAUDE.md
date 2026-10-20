# Protein Plate — instructions for every Claude Code session

A free, mobile-first, static recipe catalog (GitHub Pages) that helps a vegetarian hit 100–120 g protein a day. Owner: Jatin.

## Files that hold the context (the repo is the memory, not the chat)
| File | What it is | When to read |
|---|---|---|
| `docs/TRACKER.md` | Status of every phase + decisions needed | **Always, first** |
| `docs/handoff/track-a.md`, `docs/handoff/track-b.md` | What the last session in that track did, what's next, gotchas | **Always, for your track** |
| `docs/PLAN.md` | Phase-by-phase plan with a reading list per phase | **Always, your phase only** |
| `docs/CONTEXT.md` | Full decision record: problem, journeys, data rules, rejected ideas, backlog | Only the sections your phase lists |
| `docs/DESIGN.md` + `design/` | Design system, screen spec, references | Track A: the sections your phase lists |
| `docs/DECISIONS.md` | Dated log of decisions | Append only |

## Session protocol
1. **Start:** read TRACKER → your track's handoff → your phase in PLAN → the listed sections. Don't ask Jatin to re-explain anything written in these files. If something is genuinely undecided, ask a short question instead of assuming.
2. **One phase per session.** Pick the phase Jatin names, or the next `todo` in your track whose dependencies are `done`. Set it to `doing`. Branch `a2-home-grid`, `b1-rules`, etc.
3. **Stay in your lane:** Track A touches `src/ public/ tests/ .github/ schema/ scripts/` (not `scripts/data/`); Track B touches `data/ prompts/ scripts/data/`. Need a change in the other lane? Note it in your handoff instead.
4. **Keep context small:** don't read whole folders; read files you need. If the phase is bigger than expected, finish a coherent part, mark the rest as a new row in TRACKER, and hand off.
5. **Verify before the PR:** tests + validation pass; for UI work run the DESIGN §8 screenshot/overflow check and attach the 390 / 834 / 1280 screenshots (light + dark) to the PR.
6. **End of session (always, even if unfinished):**
   - TRACKER: your row → `review` with the PR link (or `blocked` + why).
   - `docs/DECISIONS.md`: append any decision made (date · decision · why · who).
   - Overwrite your track's handoff file: done / not done / next step / gotchas / open questions (≤ 40 lines).
   - Commit, push, open the PR with a summary and the verification evidence. Then stop.

## Non-negotiables
- No paid services, no servers, no API keys. Static site + GitHub Actions only.
- Mobile first; no horizontal scroll at any width ≥ 320 px; light + dark.
- Only tokens from `design/tokens.css`; build to `design/screens/*.png` and DESIGN.md.
- Git is the single source of truth for recipes; personal data stays in the browser (`pp.*` keys).
- A recipe that fails schema validation must never deploy.
- Commit messages and PR descriptions follow the attribution lines Claude Code is configured with.
