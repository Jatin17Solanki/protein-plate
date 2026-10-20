# Track A handoff — App

_Last updated: 2026-10-20 (A6 session; this session also did A1–A6b)_

**Done (A6, PR open):**
- **Offline:** `vite-plugin-pwa` (generateSW, `registerType: 'prompt'`, manual register in `src/components/UpdatePrompt.tsx` via `virtual:pwa-register`). Precache: app shell, CSS/JS, woff2, icons (~520 KB). `navigateFallback` = cached `index.html`. Manifest from `site.config.json` + tokens.
- **Fonts:** self-hosted via `@fontsource` (`src/fonts.ts`); no Google Fonts.
- **Link previews:** `vite.config.ts` plugin `static-pages` (closeBundle) → `dist/r/<id>/index.html` (`withMeta`), `dist/og/<id>.png` (`scripts/build/og.ts`, Satori + resvg), `dist/og/home.png`, `dist/my/`, `dist/review/` (noindex). Home OG tags via `transformIndexHtml`. Same data switch as the app (`VITE_FIXTURES`).
- **Icons:** `public/icons/*` from `npm run icons` (committed). Favicon + apple-touch-icon + theme-color (light/dark) in `index.html`.
- **Toasts:** `showToast(text, { quiet })`; quiet ones never replace a visible toast.
- Tests: `tests/unit/pages.test.ts` (meta tags, cards, tokens), `tests/e2e/offline.spec.ts` (offline reload/deep link/navigation, static page tags + PNG, manifest/icons, no external requests, 404).

**Not done / needs Jatin:** real WhatsApp preview check; airplane-mode check on his phone. The "New recipes available" prompt has no e2e test: it needs two deploys, so check it on the next merge.

**Next:** A7 (Add recipes + Export), then A8 (QA). Start in a fresh session: this one is past 60 % context.

**Gotchas:**
- Satori uses content-box sizing: padding is added outside width/height (see `og.ts`).
- `tokens.css` has a one-line `:root[data-theme="dark"]` rule before the real block; `readTokens` skips blocks without variables.
- `withMeta` strips earlier OG/twitter/canonical/robots tags, because the built index.html already has the home set.
- With the service worker active, navigations get the cached `index.html`, so a page's own `<head>` only matters to crawlers.
- `npm audit`: moderate fflate advisory via satori (build-time only), accepted (DECISIONS).
- Since PR 10, display code must use `shownProtein`/`shownNumbers`/`tintOf`, not `per_portion` directly.
- Don't `pkill -f "playwright test"` from the same Bash call that runs Playwright.

**Open questions:** none.
