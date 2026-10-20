# Track A handoff — App

_Last updated: 2026-10-20 (A4 session)_

**Done (A4, PR open):** recipe page, incomplete state, personal data, My recipes.
- Schema: optional `ingredients[].section` (Jatin approved). **Track B: use it for sub-recipes like chutney.**
- `src/lib/storage.ts`: `pp.mylist`, `pp.reactions`, `pp.notes`, `pp.ticks` getters/setters, `subscribe` + `useStorage()` hook (re-render on any change, incl. other tabs), `persist()` on first save. Unit tests (happy-dom).
- `src/lib/recipe.ts` (pure): `formatQty`, `groupIngredients`, `versionsOf`, `versionLine`, `tagChips`, `macroFootnote`. Unit tests.
- `src/screens/Recipe.tsx`: F2 phone / F12 desktop (two columns via `.col-a/.col-b`, `display: contents` + `order` on phone). Macro card, missing card, action row, credit, Other versions, ingredient cards with ticks + Clear, steps, Tried it?, notes (400 ms debounce, flush on leave).
- `src/screens/MyRecipes.tsx` at `/my/`: segmented Liked · My list · Disliked with counts; unbookmark / unlike / Undo.
- Router: `myRecipes` route, `goBack()` (history.back when in-app, else home). Home remembers filters, search and scroll for the visit (module `memory`); `history.scrollRestoration = 'manual'`.
- e2e `tests/e2e/recipe.spec.ts`: recipe / incomplete / My recipes at 9 widths × 2 themes + behaviour.

**Not done (A5):** Edit, Share, Add details buttons and the ⋯ menu do nothing yet; phone has no way to reach My recipes until the menu exists (desktop has the header link; Tried it? hint links to it).

**Next:** A5 — Share sheet, Edit sheet, menu (My recipes first), theme switch, backup/restore of all `pp.*`, home-screen hint.

**Gotchas:**
- Ticks are stored by ingredient *index*; editing a recipe's ingredient order shifts ticks (acceptable; Clear fixes).
- Recipe page tint comes from `data-tint` on `.recipe-page`; nested `data-tint` (protein chips, version cards) override it.
- `Recipe` is keyed by id in `app.tsx` so notes state resets between versions.
- Don't `pkill -f "playwright test"` in the same Bash call that runs Playwright. Kill a stale `vite preview` on :4173 before e2e.

**Open questions:** none.
