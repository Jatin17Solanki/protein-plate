# Track A handoff — App

_Last updated: 2026-10-20 (A5 session)_

**Done (A5, PR open):**
- `Sheet` component (bottom sheet / centred modal, focus trap, Escape, scroll lock, focus return); FilterSheet now uses it.
- **Share** (`ShareSheet`, `lib/share.ts`): DESIGN §6 message, toggles (ingredients on, steps off, note on if any), `navigator.share` → fallback Copy text; `recipeUrl`, `editUrl` from `site.config.json`.
- **Edit / Add details** (`EditSheet`): GitHub web-editor link, Copy recipe data (JSON), explainer open first time (`pp.editHelpSeen`).
- **Menu** (`MenuSheet`, from Home ⋯): My recipes, Add/Export (disabled until A7), Back up (download), Restore (file → `lib/backup.ts` parse/merge; asks once if notes/reactions differ), Appearance Light/Dark/Auto (`setTheme`).
- **Toast** (`lib/toast.ts` + `<Toast>` in app.tsx) and `copyText` with execCommand fallback. **Info** ⓘ button/box.
- **Install hint** (`InstallHint`, `lib/install.ts`; `captureInstallPrompt()` in main.tsx). `body.has-hint` pads Home.
- **Whole-recipe protein**: `wholeRecipeProtein` / `shownProtein` in `lib/home.ts`; tiles, recipe page, My recipes and share use it; tier sort (portion → whole → unknown).
- Tests: unit share/backup/whole-recipe; e2e `tests/e2e/sheets.spec.ts` (sheets at 9 widths × 2 themes + behaviour + hint).

**Not done:** Add recipes / Export catalog (A7). Android install button only appears once A6 adds a manifest + service worker.

**Next:** A6 (offline, static per-recipe pages with OG previews, 404, favicon). Then D7 (flags + admin view) if Jatin assigns it to Track A.

**Gotchas:**
- Whole-recipe total is parsed from text (`Total ≈ N g … whole recipe`). If Track B changes that wording, totals disappear (tiles fall back to "—"). D7 proposes a real field.
- Restore writes localStorage directly then calls `setTheme`, which notifies `subscribe` listeners; Home re-reads personal data via `subscribe`.
- Desktop Chromium has no `navigator.share`, so screenshots show Copy text as primary; phones show Share….
- e2e uses `permissions: ['clipboard-read','clipboard-write']` for copy tests.
- Don't run vitest with `--root /` (scans the disk).

**Open questions:** D7 — who builds flagging/admin view, and how.
