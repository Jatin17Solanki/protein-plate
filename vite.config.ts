import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import site from './site.config.json' with { type: 'json' };

// Everything that differs between forks comes from site.config.json.
// BASE_PATH overrides base_path (e.g. "/" for a custom domain).
export default defineConfig({
  base: process.env.BASE_PATH ?? site.base_path,
  plugins: [
    preact(),
    {
      name: 'site-config-html',
      transformIndexHtml: (html) =>
        html.replaceAll('%SITE_TITLE%', site.title).replaceAll('%SITE_DESCRIPTION%', site.description),
    },
    {
      // GitHub Pages serves 404.html for unknown paths; a copy of the app lets deep links like /r/<id>/ work.
      name: 'spa-404',
      apply: 'build',
      writeBundle(options) {
        const dir = options.dir ?? 'dist';
        copyFileSync(join(dir, 'index.html'), join(dir, '404.html'));
      },
    },
  ],
});
