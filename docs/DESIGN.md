# Protein Plate — Design System & Screen Spec

Version 1.0 · 2026-10-20 · Status: **locked for v1**. Change only with Jatin's sign-off; record changes in `docs/DECISIONS.md`.

This file, `design/tokens.css`, `design/screens/*.png` and `design/mockups/*.dc.html` are the complete visual spec. Build to them exactly.

- **`design/screens/*.png`** — rendered references at 2× scale. They are the source of truth for **how it looks**.
- **`design/mockups/*.dc.html`** — the mockup sources. Use them for **exact px values** (every element has inline styles). They are templates (`{{…}}`, `<sc-for>`, `<sc-if>`) from a design tool, so read them; don't ship them. In them, the class `.pp` / `.pp.dark` stands in for `:root` / `:root[data-theme="dark"]`.
- **`design/tokens.css`** — the only place colours, fonts, radii and spacing are defined. Import it once. Never hard-code a hex value in a component.

If a PNG and this document disagree, this document wins (it carries the decisions made after some mockups were drawn — see §9).

---

## 1. Principles

1. **Mobile first.** The main device is a phone in Chrome (iPhone and Android). Design at 390 px wide, then scale up.
2. **Protein leads.** Every recipe shows protein per portion first and biggest, then kcal.
3. **Colour means protein.** Each main protein has a tint; tiles, dots, badges and the macro band use it. Colour is never the only signal — the protein name is always also written.
4. **Few levers.** Meal tabs + protein chips + 4 quick chips are always visible; everything else is in the Filters sheet.
5. **No clutter.** No ads, recommendations, banners, ratings, carousels of promos.

## 2. Foundations

### Colour (see `design/tokens.css` for values)
| Token | Use |
|---|---|
| `--bg` | Page background (home, lists, menus) |
| `--surface` | Page background behind cards (recipe, add, export) |
| `--card` | Cards and sheets |
| `--muted` | Search field, quiet buttons, quick chips, segmented-control track |
| `--line` / `--line2` | Dividers / control borders |
| `--text` / `--text2` | Primary / secondary text |
| `--brand` / `--on-brand` | Primary action (Add, Show N dishes, Share…), active meal-tab underline, checkbox accent |
| `--inv` / `--on-inv` | "Watch video" button, active quick chip, floating hint |
| `--{protein}-bg` / `--{protein}` | Tile background / text, icon and dot colour. Proteins: `soya, paneer, pulses, tofu, tempeh, whey` |
| `--warn*` / `--err*` | Add-recipes check results, "Needs details" badge |

A recipe's tint = its **first** main protein (the larger contributor).

**Dark mode:** same token names, values in the dark block. Theme setting lives in the menu: **Light / Dark / Auto** (default Auto = follows the OS). Store the choice in `localStorage` key `pp.theme` and set `<html data-theme>`; remove the attribute for Auto. Apply it before first paint (inline script in `<head>`) to avoid a flash.

### Type
| Role | Font | Size / weight |
|---|---|---|
| Logo `protein/plate` (slash in `--brand`) | Space Grotesk | 24 px / 700 (phone), 26 px (≥600) |
| Screen title | Plus Jakarta Sans | 22 px / 800 |
| Recipe title | Plus Jakarta Sans | 28 px / 800, letter-spacing −0.7 px (34 px on desktop) |
| Tile protein number | Space Grotesk | 32 px / 700, −1 px (36 px at ≥600) + "g" 12 px / 700 |
| Macro band protein | Space Grotesk | 48 px / 700, −2 px (52 px desktop) |
| Card heading | Plus Jakarta Sans | 16 px / 800 |
| Body | Plus Jakarta Sans | 14 px / 400–600, line-height 1.45 |
| Secondary / meta | Plus Jakarta Sans | 11–13 px / 600, `--text2` or protein colour |

Load both fonts from Google Fonts with `display=swap`, weights: Jakarta 400/500/600/700/800, Space Grotesk 600/700. Self-hosting is fine too (better offline).

### Spacing, radius, size
- Spacing scale: 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40 px. Phone side gutter **16 px**; tablet 24; desktop 40 inside a **max-width 1200 px** centred container.
- Radius: quick chip 8 · control/button 14 · tile & card 18 (20 at ≥600) · sheet 24 (top corners) · protein chip pill.
- Touch targets ≥ **44 × 44 px** everywhere (icon buttons are 44–48).

### Icons
- **UI icons**: 24-px grid, 2 px stroke, round caps/joins, `currentColor`. Use [Lucide](https://lucide.dev) (MIT) equivalents: search, sliders-horizontal (filters), ellipsis (menu), plus, chevron-left, pencil (edit), bookmark (My list; filled when on), share (upload arrow), play (filled), thumbs-up, thumbs-down, rotate-ccw (clear), info, x.
- **Dish-type icons** (tile top-right, filter grid): outline, **1.4 px stroke** at 40–44 px. Use the paths in `design/mockups/F1-Home.dc.html` / `F4-Filters.dc.html` for sandwich, salad/bowl, wrap, kebab, chilla, curry, rice, pasta, pizza. Draw the remaining four (chaat, paratha, dessert, sauce) in the same style. One icon per dish-type tag; the tile uses the recipe's first dish type.

## 3. Components

| Component | Spec (phone) | Where |
|---|---|---|
| **Recipe tile** | Height 156 (176 at ≥600). Background `--{p}-bg`, padding 12, radius 18. Top row: protein number in `--{p}` (left), dish icon 40 px in `--{p}` (right). Bottom: name 14/800 (max 2 lines, ellipsis), meta 11/600 in `--{p}` = "Protein · kcal", optional versions badge (10/700, bg `--{p}`, text `--{p}-bg`, radius 6). Whole tile is one link. | F1, F7, F10, F11 |
| **Meal tabs** | Text tabs, gap 18, height 42; active: `--text` 700 + 2.5 px `--brand` underline; inactive `--text2` 500. Bottom border `--line`. Always visible. | Home |
| **Protein chip** | Pill, height 34, border `--line2`, 14 px dot in `--{p}`, label 13/600. Selected: bg `--{p}-bg`, 1.5 px border `--{p}`, 700. Horizontal scroll row on phone. | Home, Filters |
| **Quick chip** | Height 32, radius 8, bg `--muted`, 12/600. Selected: bg `--inv`, text `--on-inv`. Items: **Quick, My list, Global, Air fryer**. | Home |
| **Filter button** | 46 × 46, radius 14, beside search. With active filters: bg `--brand`, white icon, count badge (20 px circle, `--inv`, 2 px `--bg` ring) top-right. | Home |
| **Result summary line** | Shown only when filters/search are active: "Dinner · Paneer or Soya · Quick — **7 dishes**" + **Clear** link. | F-filtered, R5-Search |
| **Bottom sheet** | Scrim `--scrim`; sheet bg `--card`, top radius 24, grabber 40 × 5; header row (title 20/800 + text action); sticky footer with Close (secondary) + primary (flex 2). | Filters, Share, Edit, Menu |
| **Primary button** | Height 50–52, radius 14, `--brand`/`--on-brand`, 15/700. | everywhere |
| **Secondary button** | Same size, 1 px `--line2` border, `--card` bg. | everywhere |
| **Macro card** | Card with band in `--{p}-bg`: protein 48 px left, kcal 26 px right; below a 3-column row carbs · fat · fibre ("—" when unknown, "(est.)" when estimated); footnote 12 px stating what's from the creator vs estimated. | Recipe |
| **Action row** | Two equal buttons under the macro card: **Watch video** (`--inv`) and **Share** (secondary). | Recipe |
| **Other versions** | Horizontal row of 128-px cards: protein (Space Grotesk 18, `--{p}`), label 13/700, difference 11 px. Current version not repeated. | Recipe |
| **Ingredient card** | Card radius 18, heading + **Clear** chip (resets ticks for the whole recipe; only on the first ingredient card). Rows: checkbox 18 px (`--brand` accent), name, quantity right in `--text2`. Ticks persist per recipe until Clear. | Recipe |
| **Steps card** | Numbered (Space Grotesk, `--brand`), 14 px, line-height 1.45. | Recipe |
| **Tried it? card** | Two buttons: **Like** / **Dislike** (mutually exclusive, tap again to unset). Selected Like: `--{p}-bg` with 1.5 px `--brand` border. Helper text: "Dislike hides it everywhere. Find it again in My recipes." | Recipe |
| **My notes card** | Textarea (min-height 100, bg `--surface`), autosave on input (debounced 400 ms). Info line with ⓘ: "Saved on this device only. Use Back up in the menu to move it." | Recipe |
| **Info (ⓘ)** | 36-px round button, `--soya-bg`/`--brand`, toggles an inline explainer box (bg `--soya-bg`, 13 px, line-height 1.55). Copy is written for someone who does **not** own the repo. Used on: Edit, Add recipes, Export, Back up / Restore, and the "saved on this device" lines. | F6, R5 |
| **Add to Home Screen hint** | Floating card bottom 16 px, `--inv` bg, title 15/800 + 13 px body + dismiss (36 px). Shown once on first visit on mobile when not already installed; iOS copy "Tap Share, then Add to Home Screen"; on Android show Chrome's install prompt instead if available. Dismissal stored in `pp.hintDismissed`. | F1 |
| **Segmented tabs** | Track `--muted` radius 12, 4 px padding; active segment `--card`, 700. | My recipes, Menu theme |
| **Empty state** | 96-px tinted icon tile, title 18/800, one-line reason, primary = remove the narrowest filter ("Remove Air fryer · 2 dishes"), secondary = Clear all filters. | R5-Empty |

## 4. Screen inventory (v1)

| # | Screen | Reference | Notes |
|---|---|---|---|
| 1 | Home | `F1-Home` (light), `F7-HomeDark` | Header: logo · ⋯ menu · + add. Search + filter button. Meal tabs. Protein chips. Quick chips. 2-col tile grid. First-visit hint. |
| 2 | Home, filtered | `R4-HomeFiltered` look + tokens | Filter button active with count; summary line + Clear. |
| 3 | Filters sheet | `F4-Filters`, `F9-FiltersDark` | Main protein (OR), Dish type grid 8 + "Show all 13" (OR), Quick picks (AND), "Show disliked recipes" toggle, Sort (Protein high→low default; Calories low→high). **Live count** beside every option = dishes you'd get if you toggled it, given the other current filters; options with 0 are dimmed (opacity 0.4) and disabled. Footer "Show N dishes". |
| 4 | Search results | `R5-Search` | Same grid; each tile gets a badge "uses ‹matched ingredient›" when the match was on an ingredient. |
| 5 | No results | `R5-Empty` | See Empty state. |
| 6 | Recipe | `F2-Recipe`, `F8-RecipeDark` | Header: back · "Dish · version x of n" · Edit (pencil) · My list (bookmark, filled when on). Title, tag chips, macro card, action row, Other versions, ingredient cards, steps, Tried it?, My notes. |
| 7 | Incomplete recipe | `R5-Incomplete` | Dashed "Details missing" card listing what's missing; Watch video + Add details; notes still work. Not counted in totals. |
| 8 | Share sheet | `F3-Share` | Single Share. Preview of the exact message; toggles: Include ingredients (on), Include steps (off), Include my note (on). "Share…" uses `navigator.share` (fallback: copy). Secondary "Copy text". |
| 9 | Edit sheet | `F6-Edit` | ⓘ explainer open by default the first time. "Edit on GitHub" → GitHub web editor URL for `data/recipes/<id>.json` in the configured repo. "Copy recipe data" copies the recipe JSON. |
| 10 | My recipes | `F5-MyRecipes` | Segmented: Liked · My list · Disliked (counts). Rows: 56-px tinted block with protein, name, meta, trailing action (Unbookmark / Unlike / **Undo** for disliked). Info box about device-only storage. |
| 11 | Menu sheet | `R5-Menu` + changes | Items: **My recipes**, Add recipes, Export catalog, Back up my data, Restore from backup; Appearance: Light / Dark / Auto. |
| 12 | Add recipes | `R5-Add` | 1 Copy prompt (prompt file + compact catalog index inlined) → 2 paste JSON array → 3 per-recipe check: ✓ ready / ! possible duplicate (Add as version · Add anyway · Skip) / × error (Copy fix-it prompt) → Submit. ⓘ explains the GitHub step. |
| 13 | Export | `R5-Export` | Ask an AI (prompt + compact catalog, primary) · Link for AI tools (plain-text page) · Full catalog JSON. Checkbox to include my personal data (off). |
| 14 | Tablet ≥600 | `F10-Tablet` | Header in one row (logo, search, filter, menu, add). Chips in one wrapping row with a divider. 3-col grid. Sheets become centred modals (max-width 560). |
| 15 | Desktop ≥1024 | `F11-Desktop`, `F12-DesktopRecipe` | Top bar with "My recipes" + "Add recipes" text buttons. **Filters become a persistent left sidebar (228 px)** with checkboxes + counts; filter button hidden. 4-col grid. Recipe: two columns — left 420 px (title, macros, actions, Tried it?, notes), right (versions grid, ingredient cards side by side, steps). |

## 5. Responsive rules

| Width | Layout |
|---|---|
| **320–599 (phone)** | Gutter 16. Grid `repeat(2, minmax(0,1fr))`, gap 10. Chip rows scroll horizontally (no wrapping, no visible scrollbar). Sheets are bottom sheets (max-height 92dvh, inner scroll, sticky footer). At ≤359 px: tile height 148, tile number 28 px, recipe title 24 px. |
| **600–1023 (tablet)** | Gutter 24. Grid 3 columns, gap 14, tile 176. Header in one row. Chips wrap. Sheets are centred modals, max-width 560, max-height 85dvh. Recipe stays one column, max-width 640, centred. |
| **≥1024 (desktop)** | Container max-width 1200, padding 40. Left filter sidebar 228 px + grid of 4 (3 at 1024–1199). Recipe two-column (420 px + flexible). |

Hard rules:
- **No horizontal page scroll at any width from 320 px up.** Only chip rows and "Other versions" may scroll sideways, inside their own box.
- Use `min-width: 0` on flex/grid children that hold text; long names wrap to 2 lines then ellipsis.
- Heights: use `dvh`, never `vh`, for full-screen sheets (iOS address bar). Respect `env(safe-area-inset-bottom)` on sheet footers and the hint.
- Inputs are ≥16 px font on phone (prevents iOS zoom on focus).
- Images: none in v1 (no thumbnails). Icons are inline SVG.
- Landscape phone: same as phone rules; sheets max-height 92dvh with scroll.

## 6. Behaviour rules that affect UI

- **Filters:** OR within a group, AND across groups. Meal tab is a group of its own. Sort default: protein per portion, high → low.
- **Disliked** recipes are hidden from home, filters and search unless "Show disliked recipes" is on; always visible in My recipes › Disliked.
- **Versions:** a dish group shows as one tile (the highest-protein version) with an "N versions" badge; tapping opens that version; switch via Other versions.
- **Search:** client-side over title, ingredients and tags with synonyms from the ingredient dictionary (dahi = curd, besan = gram flour…), prefix and small-typo tolerance; title matches rank first; meal tab and filters still apply.
- **Personal data** (localStorage, namespaced `pp.*`): `pp.mylist`, `pp.reactions` (like/dislike by recipe id), `pp.notes`, `pp.ticks`, `pp.theme`, `pp.hintDismissed`. Back up = one JSON file of all `pp.*`; Restore merges (ask before overwriting). Call `navigator.storage.persist()` on first save.
- **Share message format** (fixed):
  ```
  *{title}*
  {protein} g protein · {kcal} kcal per portion

  *Ingredients*            ← if toggled
  {item qty · item qty · …}

  *Steps*                  ← if toggled
  1. … 2. …

  *Note:* {my note}        ← if toggled and not empty

  Video: {source url}
  Full recipe: {site url}/r/{id}
  ```

## 7. Accessibility
- Real `<button>`, `<a href>`, `<input>`/`<label>` only; icon-only buttons get `aria-label`; toggles use `aria-pressed`.
- Text contrast ≥ 4.5:1 in both themes (tokens are chosen for this; don't put `--text2` on protein tiles — use the protein colour).
- Focus ring: 2 px `--brand` outline, 2 px offset.
- Respect `prefers-reduced-motion` (sheets fade instead of slide).

## 8. Verification (required before any UI PR is opened)
1. Playwright screenshots of Home, Filters sheet, Recipe, My recipes, Share sheet at widths **320, 360, 390, 430, 768, 834, 1024, 1280, 1440** in **light and dark**. Save to `test-results/screens/` and attach the 390 / 834 / 1280 ones to the PR description.
2. Automated check at each width: `document.documentElement.scrollWidth <= window.innerWidth` (fails on horizontal overflow); no element with `getBoundingClientRect().right > innerWidth` except inside chip rows.
3. Compare 390-px light/dark and 834/1280 shots side by side with `design/screens/*.png`; list any visible difference in the PR and fix or justify it.
4. Lighthouse (mobile) accessibility ≥ 95.

## 9. Changes since some mockups were drawn (these override the PNGs)
- R5 screens (Menu, Add, Export, Incomplete, Search, Empty) use hard-coded light colours; build them with tokens so they work in dark mode.
- "Self cook" is now **My list** (bookmark). "Keep / Not for me" is now **Like / Dislike**.
- Share is a **single** button/sheet (R5-Share is superseded by F3-Share).
- Menu gains **My recipes** at the top.
- R3/R4 boards are superseded by F1–F12 where both exist.
