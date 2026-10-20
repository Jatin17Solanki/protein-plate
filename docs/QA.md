# QA report — A8 (2026-10-20)

Automated pass over the whole app before Jatin's manual test (`docs/MANUAL-TEST.md`). Production build with the real 80 recipes unless noted.

## Results
| Check | How | Result |
|---|---|---|
| DESIGN §8.1–2: screenshots + no overflow | Playwright, 9 widths (320–1440) × light/dark: home, filters, search, empty, recipe (+ incomplete), share, edit, menu, My recipes, review, add, export | pass (253 e2e tests) |
| DESIGN §8.3: compare with `design/screens` | 390 light/dark, 834, 1280 vs F1/F2/F7/F8/F11/F12/R5 | matches; known differences are the ones listed in DESIGN §9 and DECISIONS |
| DESIGN §8.4: Lighthouse mobile accessibility ≥ 95 | Lighthouse 12.8.2 (mobile, simulated 4G): home, recipe, my, add, export, review | **100** on all six |
| Lighthouse performance / best practices | same | performance 94–99, best practices 100 |
| Lighthouse SEO | same | 92 on home and recipes (only `robots.txt`, see below); 58 on my/add/export/review because they're `noindex` on purpose |
| Accessibility, all states | axe-core 4.10 (WCAG 2.0/2.1 A + AA + best practice), 14 screens/sheets × light/dark × 390/1280 | 9 kinds of issue found → **0** after fixes; now a CI test (`tests/e2e/a11y.spec.ts`) |
| Keyboard | Tab / Shift+Tab / Enter / Esc on every page and sheet, focus ring check | 1 order issue + 1 unreachable scroll box found → fixed; now a CI test (`tests/e2e/keyboard.spec.ts`) |

## Fix list
| # | Found | Severity | Fix |
|---|---|---|---|
| 1 | Share sheet: the message preview scrolls but can't be reached by keyboard (axe `scrollable-region-focusable`) | serious | preview is focusable, labelled "Message preview" |
| 2 | Phone recipe page: keyboard / VoiceOver order was title → buttons → **Tried it → notes** → versions → ingredients → steps, while the screen shows Tried it and notes last (CSS `order`) | serious for screen readers | page order now matches the screen; desktop keeps two columns with grid areas (pixel-identical) |
| 3 | My recipes, Add, Export, Review, Page not found: no `<main>` landmark; recipe top bar outside any landmark | moderate | `<main>` on every page; recipe top bar is a `<header>` |
| 4 | Phone search mode hid the only `<h1>` (the logo) | moderate | logo hidden visually only while searching |
| 5 | Recipe credit said "Steps in our own words." — wrong since D5 was revised (steps are the creator's words) | content | now "Recipe by ‹creator›." |
| 6 | Sheet focus trap counted the hidden backup file input as focusable | minor (no visible effect today) | inputs with `tabindex="-1"` are skipped |

## Not fixed / notes
- **`robots.txt`:** the local preview returns the app for `/robots.txt`. On GitHub Pages the file lives at `jatin17solanki.github.io/robots.txt`, which this repo doesn't control; a missing file there is fine for SEO. Nothing to do.
- **Performance:** first paint ~2.1 s on simulated slow 4G. The main JS (86 KB gzip) carries all 80 recipes. Fine now; if the catalog grows past ~300 recipes, split the recipe data out of the bundle (backlog, not needed for v1).
- **Search field focus ring** is drawn on the field's box (`.search:focus-within`), not the input itself; tests accept either.
- **Not covered by automation:** real devices, VoiceOver, large text, WhatsApp previews, GitHub commits, the update prompt. All in `docs/MANUAL-TEST.md`.
