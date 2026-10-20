# Track A handoff — App

_Last updated: 2026-10-20 (A1 session)_

**Done (A1, PR open):**
- Vite 8 + TypeScript 7 + Preact 11 scaffold; `design/tokens.css` imported directly; theme script in `index.html` head (`pp.theme`).
- `schema/recipe.schema.json` (strict) → `src/types/recipe.ts` via `npm run gen:types` (CI fails if stale).
- `src/lib/validate.ts`: schema + rules + cross-file checks, reusable in the browser for A7. `scripts/validate.ts` wraps it for CI.
- 10 fixtures in `tests/fixtures/` (all 6 proteins, multi-protein, `soya-kebab` group of 2, 1 incomplete, 1 without kcal). 16 unit tests.
- Placeholder page shows the recipe count. Playwright smoke test: overflow check at 9 widths × light/dark, screenshots to `test-results/screens/`.
- `.github/workflows/ci.yml`: check on PRs; on main also deploy to Pages.

**Not done:** site isn't live until the PR merges (deploy runs on push to main). vite-plugin-pwa not installed yet (add in A6).

**Next:** Jatin approves the schema (D3) → merge → check the live URL (`site.config.json` → site_url). Then A2.

**Gotchas:**
- `VITE_FIXTURES=1` builds from fixtures instead of `data/recipes/` (dead-code-eliminated in normal builds). Use it for A2–A6 until B2 lands.
- e2e builds with `BASE_PATH=/`; the real build uses `base_path` from `site.config.json` (`/protein-plate/`). Use `import.meta.env.BASE_URL` for links.
- Playwright is pinned to 1.56.1 to match `/opt/pw-browsers` in cloud sessions — don't bump it without checking.
- Ajv runs in strict mode: conditional (`if/then`) sub-schemas need an explicit `type`.
- Cloud sessions are assigned a `claude/...` branch name, not `a2-home-grid` style; that's fine.
- If deploy fails with "Pages not enabled": Settings → Pages → Source: GitHub Actions (Phase 0 step 2).

**Open questions:** D3 (schema) — see the A1 PR.
