# Protein Plate

A free, mobile-first catalog of high-protein vegetarian recipes. Filter by meal, main protein and dish type, open a recipe, watch the source video, share it to WhatsApp, keep your own notes. No accounts, no servers: the catalog is JSON in this repo, the site runs on GitHub Pages, and your notes and lists stay in your browser.

**Want your own catalog?** Copy this repository (Fork), turn on GitHub Pages (Settings → Pages → Source: GitHub Actions), edit `site.config.json`, and replace the files in `data/recipes/`.

**For contributors and AI sessions:** start with `CLAUDE.md`.

## Develop

Node 22+.

```sh
npm ci
npm run dev                # local site with data/recipes
VITE_FIXTURES=1 npm run dev  # local site with the 10 test fixtures
npm run validate           # schema-check every data/recipes/*.json (CI blocks deploy on failure)
npm test                   # unit tests
npm run test:e2e           # Playwright: overflow check + screenshots at 9 widths, light + dark
npm run gen:types          # after editing schema/recipe.schema.json
```

- One recipe = one file: `data/recipes/<id>.json`, matching `schema/recipe.schema.json`.
- `site.config.json` holds everything that differs between forks (owner, repo, title, URL, base path). For a custom domain set `base_path` to `/`.
- CI (`.github/workflows/ci.yml`): every PR is validated, tested and built; every push to `main` is deployed to GitHub Pages.

Code licence: MIT (see `LICENSE`).
