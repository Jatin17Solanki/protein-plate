# Protein Plate — Phased Build Plan (v1)

Each phase = **one Claude Code session = one branch = one PR**. A phase must fit comfortably in one session; if it doesn't, split it and record the split in `docs/TRACKER.md`.

Two tracks run **in parallel** after Phase A1:
- **Track A — App** (`src/`, `public/`, `.github/`, `tests/`)
- **Track B — Data** (`data/`, `prompts/`, `scripts/data/`)

They touch different folders, so two sessions can run at the same time without conflicts. Each track has its own handoff file (`docs/handoff/track-a.md`, `docs/handoff/track-b.md`) and its own section in the tracker.

Reading list per phase is deliberately short. Read only what's listed; everything else is reference.

---

## Phase 0 — Repo setup (Jatin, ~10 min, phone or laptop)
1. Create a **public** GitHub repo `protein-plate` (GitHub Pages is free only for public repos).
2. Settings → Pages → Source: **GitHub Actions**.
3. Make sure Claude (claude.ai/code) has access to the repo.
4. Get the starter kit into the repo: either tell the claude.ai session to push it (it can, once the repo exists), or upload the kit files.
5. Answer the open decisions marked **[J]** in `docs/TRACKER.md` → "Decisions needed".

---

## Track A — App

### A1 — Scaffold, schema, CI, deploy (blocks everything)
**Read:** CLAUDE.md · CONTEXT §4–5, §7 · DESIGN §2, §5.
**Do:**
- Stack (proposal — confirm with Jatin at the start of the session if he hasn't already in "Decisions needed"): **Vite + TypeScript + Preact**, CSS with the tokens file (no CSS framework), **vite-plugin-pwa** (offline), **MiniSearch** (search), **Ajv** + JSON Schema (validation), **Playwright** (screenshots/tests), **Vitest** (unit).
- Repo layout: `data/recipes/<id>.json` (one file per recipe — required for the Edit deep link), `data/ingredients.json` (dictionary, from Track B), `src/`, `public/`, `scripts/`, `prompts/`, `design/`, `docs/`, `tests/`.
- **JSON Schema** `schema/recipe.schema.json` + generated TS types, from CONTEXT §5 (draft). Present the final field list to Jatin in the PR description and get a yes before merge — this unblocks Track B.
- `scripts/validate.ts` — validates every recipe file; fails CI on any error.
- `site.config.json` — repo owner/name, site URL, title. Everything that differs between forks lives here.
- GitHub Actions: on PR → install, validate, unit tests, build. On push to `main` → same + deploy to Pages. A broken recipe never deploys.
- A placeholder page that renders the recipe count, deployed, so Jatin can open the live URL on his phone.
- 10 hand-written **fixture** recipes in `tests/fixtures/` (not in `data/`) covering every protein, multi-protein, versions group, incomplete, missing macros.
**Done when:** CI green, site live on Pages, schema approved, tracker updated.

### A2 — App shell + Home grid
**Read:** DESIGN §1–5, `design/screens/F1-Home.png`, `F7-HomeDark.png`, `F10-Tablet.png`, `F11-Desktop.png`, mockup sources for exact px.
**Do:** tokens.css wired; theme (Light/Dark/Auto, no flash); header; search field (static for now); meal tabs; protein chips; quick chips; tile grid (2/3/4 columns by breakpoint) from fixtures or real data; versions collapse to one tile; sort by protein. Routing: `/` and `/r/:id` (hash or history — pick what works on GitHub Pages with static per-recipe pages later in A6).
**Verify:** DESIGN §8 at all widths, light + dark.

### A3 — Filters + search + empty state
**Read:** DESIGN §3 (Filters, Result summary, Empty state), §6 · `F4-Filters.png`, `F9-FiltersDark.png`, `R4-HomeFiltered.png`, `R5-Search.png`, `R5-Empty.png`, `F11-Desktop.png` (sidebar).
**Do:** filter state (OR within / AND across), live counts, disabled zero options, sheet on phone / modal on tablet / sidebar on desktop, summary line + Clear, MiniSearch index with synonym expansion from `data/ingredients.json` (stub if Track B hasn't delivered), "uses …" badge, smart empty state. Unit tests for filter logic and counts.

### A4 — Recipe page + personal data + My recipes
**Read:** DESIGN §3 (recipe components), §6 · `F2-Recipe.png`, `F8-RecipeDark.png`, `F12-DesktopRecipe.png`, `F5-MyRecipes.png`, `R5-Incomplete.png`.
**Do:** recipe page (all cards), Other versions, incomplete state, storage module (`pp.*` keys, `navigator.storage.persist()`), My list, Like/Dislike (dislike hides everywhere), notes autosave, ingredient ticks + Clear, My recipes screen. Unit tests for the storage module.

### A5 — Share, Edit, Menu, theme switch, backup/restore, home-screen hint
**Read:** DESIGN §3, §4 rows 8–11, §6 (share format) · `F3-Share.png`, `F6-Edit.png`, `R5-Menu.png`, `F1-Home.png` (hint).
**Do:** share sheet with `navigator.share` + copy fallback; Edit sheet (GitHub editor URL from `site.config.json`, copy recipe JSON); menu; theme setting; backup download / restore merge; Add-to-Home-Screen hint (iOS) and install prompt (Android); ⓘ explainers.

### A6 — Offline, share previews, production polish
**Do:** PWA (manifest, icons, service worker, "New recipes available — Refresh" toast); build step that generates a static page per recipe at `/r/<id>/` with Open Graph tags and a generated preview image (protein number on the protein tint) so WhatsApp shows a card; 404 page; favicon.
**Verify:** offline reload works; link preview checked with a real WhatsApp message by Jatin.

### A7 — Add recipes + Export
**Read:** DESIGN §4 rows 12–13 · `R5-Add.png`, `R5-Export.png` · `prompts/add-recipes.md` (from Track B; blocks this phase).
**Do:** "Copy prompt" = prompt file + compact catalog index; paste box; parse JSON array; schema validation; deterministic duplicate check (shared module with Track B's `scripts/data/dedupe.ts`); per-recipe verdicts; Submit → open GitHub's "new file" page pre-filled for each ready recipe (owner) — falls back to "copy JSON" if the URL is too long; Export: prompt + compact catalog, plain-text page at `/catalog.txt`, full JSON download.

### A8 — QA pass (use Opus)
Full DESIGN §8 matrix; Lighthouse; keyboard pass; fix list; real-phone checklist for Jatin (iPhone Chrome + Safari, one Android if available).

---

## Track B — Data (normalisation, deduplication, categorisation)

Use **Opus** for every Track B phase — the work is judgment (nutrition maths, what counts as a duplicate vs a version).

### B1 — Rules, dictionary, prompt v1, first 10 recipes (needs A1 schema)
**Raw data:** private repo `Jatin17Solanki/protein-plate-raw`, folder `batches/`. Attach it to the session (add the repo) and read from there; never copy raw files into this public repo.

**Fidelity rules (non-negotiable — normalisation must never change the recipe):**
- Ingredients and quantities are copied exactly. Allowed: unit conversion (keep `as_written`), translating names to English (keep the original as an alias). Not allowed: adding, removing, substituting or "improving" ingredients, or changing amounts.
- Steps keep the same order, actions, times, temperatures and equipment. Allowed: splitting into one action per step, fixing grammar, plain wording. Not allowed: new techniques, merged or dropped steps.
- Anything unclear or missing goes into `missing[]` / `assumptions[]` — never guessed silently.
- Every recipe stores `source_ref` (batch file + entry number) and the source URL, so it can always be compared with the original.
- `scripts/data/fidelity.ts`: for each recipe, check that every ingredient and every number (quantity, minutes, °C) in the raw entry appears in the normalised recipe, and nothing extra was added; fail the PR on any mismatch unless it's listed in `assumptions[]`.
- The PR shows raw vs normalised side by side for every recipe, so Jatin can review quickly.

**Read:** CONTEXT §1, §4–6 · `data/raw/*` (or the raw text Jatin provides — see "Decisions needed") · schema.
**Do:**
- `data/ingredients.json`: canonical ingredient dictionary (id, English name, aliases incl. Hindi/Hinglish, type: protein|dairy|grain|produce|spice|pantry|sauce, protein g per 100 g, kcal per 100 g, dry/cooked basis).
- `prompts/add-recipes.md`: the single normalisation + categorisation + duplicate prompt (rules from CONTEXT §4: per-portion basis, 35 % main-protein rule, multi-select meals, flat tag set, dish groups, dry weights, "show your working", steps rewritten in plain words with credit + link to the creator, output = JSON array matching the schema).
- `scripts/data/dedupe.ts`: deterministic duplicate/variant detection (normalised URL/reel id → same creator + title similarity → ingredient-set overlap + main protein). Outputs a report; never deletes.
- Normalise **10 recipes** spanning all proteins → PR for Jatin to review field by field.

### B2 — Normalise the rest of batch 1
Remaining ~70 recipes, in chunks of ~20 per session if needed (split into B2a/B2b/…). Every chunk ends with the dedupe report and a "possible duplicates / variants" list for Jatin to confirm in the PR. Incomplete entries kept with `status: "incomplete"`.

### B3 — Batch 2 (Jatin's new scrape)
Same as B2, deduplicated against the whole catalog.

### B4 — Fill gaps (whenever Jatin supplies details)
13 incomplete entries + protein oats breakfast; My list seed file (Jatin's self-cook marks) delivered as a personal backup JSON (`exports/jatin-mylist.backup.json`, **not** committed if the repo is public — attach to the PR instead).

### B5 — Export prompt + agent questions (later, can be done in claude.ai)
Starter prompt for "ask an AI about my catalog" and the list of questions it should handle (leftovers, cook absent, coverage gaps, spices to stock).

---

## Merge point
After **A2** and **B2** are both merged, the app runs on real data. Any later Track A phase replaces fixtures with `data/` as a first step.

## Out of scope for v1
See CONTEXT §11 (backlog): meal plan, last made/planned, rotation builder, recommendations, inventory, sync, in-app AI.
