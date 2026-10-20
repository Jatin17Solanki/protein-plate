import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import site from './site.config.json' with { type: 'json' };
import { readTokens } from './scripts/build/tokens';
import { ogImage } from './scripts/build/og';
import { readRecipes, recipeCard, withMeta, writePage } from './scripts/build/pages';
import { catalogText } from './src/lib/export';

// Everything that differs between forks comes from site.config.json.
// BASE_PATH overrides base_path (e.g. "/" for a custom domain).
const base = process.env.BASE_PATH ?? site.base_path;
const siteUrl = site.site_url.replace(/\/?$/, '/');
// Same switch as src/lib/catalog.ts: VITE_FIXTURES=1 builds from the test fixtures.
const recipesDir = process.env.VITE_FIXTURES === '1' ? 'tests/fixtures' : 'data/recipes';
const light = readTokens();
const dark = readTokens(':root[data-theme="dark"] {');

const homeMeta = (count: number) => ({
  title: site.title,
  description: `${count} high-protein vegetarian recipes. ${site.description}`,
  url: siteUrl,
  image: `${siteUrl}og/home.png`,
});

export default defineConfig({
  base,
  plugins: [
    preact(),
    {
      name: 'site-config-html',
      transformIndexHtml: (html) =>
        withMeta(
          html
            .replaceAll('%SITE_TITLE%', site.title)
            .replaceAll('%SITE_DESCRIPTION%', site.description)
            .replaceAll('%THEME_LIGHT%', light.bg)
            .replaceAll('%THEME_DARK%', dark.bg),
          homeMeta(readRecipes(recipesDir).length),
        ),
    },
    VitePWA({
      // Offline (PLAN A6): app shell, fonts and icons are precached; recipes ship inside the JS bundle.
      // 'prompt': a new deploy shows "New recipes available — Refresh" instead of reloading under the user.
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: site.title,
        short_name: site.title,
        description: site.description,
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: light.bg,
        theme_color: light.brand,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png}'],
        globIgnores: ['og/**', 'r/**', 'my/**', 'review/**', 'add/**', 'export/**', '404.html'],
        navigateFallback: `${base}index.html`,
        // Opening /catalog.txt must reach the real file, not the app shell.
        navigateFallbackDenylist: [/\/catalog\.txt$/],
        cleanupOutdatedCaches: true,
      },
    }),
    {
      // GitHub Pages serves 404.html for unknown paths; a copy of the app shows its own "Page not found".
      name: 'spa-404',
      apply: 'build',
      writeBundle(options) {
        const dir = options.dir ?? 'dist';
        copyFileSync(join(dir, 'index.html'), join(dir, '404.html'));
      },
    },
    {
      // Static pages with link previews: r/<id>/ for every recipe, plus my/, review/, add/ and export/ (PLAN A6, A7),
      // and catalog.txt: every recipe as plain text for AI tools that can read a link (PLAN A7).
      name: 'static-pages',
      apply: 'build',
      async closeBundle() {
        const dist = 'dist';
        const recipes = readRecipes(recipesDir);
        const index = (await import('node:fs')).readFileSync(join(dist, 'index.html'), 'utf8');
        mkdirSync(join(dist, 'og'), { recursive: true });
        writeFileSync(
          join(dist, 'og', 'home.png'),
          await ogImage({
            title: 'High-protein vegetarian recipes',
            big: `${recipes.length} recipes`,
            caption: 'filtered by meal, protein and dish',
            meta: 'Paneer · Soya · Pulses · Tofu · Tempeh · Whey',
            tint: 'soya',
          }),
        );
        for (const r of recipes) {
          const card = recipeCard(r);
          writeFileSync(join(dist, 'og', `${r.id}.png`), await ogImage(card));
          writePage(dist, `r/${r.id}`, withMeta(index, {
            title: `${r.title} · ${site.title}`,
            description: card.description,
            url: `${siteUrl}r/${r.id}/`,
            image: `${siteUrl}og/${r.id}.png`,
          }));
        }
        writePage(dist, 'my', withMeta(index, { ...homeMeta(recipes.length), title: `My recipes · ${site.title}`, url: `${siteUrl}my/`, noindex: true }));
        writePage(dist, 'add', withMeta(index, { ...homeMeta(recipes.length), title: `Add recipes · ${site.title}`, url: `${siteUrl}add/`, noindex: true }));
        writePage(dist, 'export', withMeta(index, { ...homeMeta(recipes.length), title: `Export catalog · ${site.title}`, url: `${siteUrl}export/`, noindex: true }));
        writeFileSync(join(dist, 'catalog.txt'), catalogText(recipes, siteUrl, site.title));
        writePage(dist, 'review', withMeta(index, { ...homeMeta(recipes.length), title: `Review · ${site.title}`, url: `${siteUrl}review/`, noindex: true }));
        console.log(`static-pages: ${recipes.length} recipe pages + previews`);
      },
    },
  ],
});
