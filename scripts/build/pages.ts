// Static pages written after the build (PLAN A6): one per recipe at r/<id>/index.html with Open Graph tags and a
// preview image, so a link shared in WhatsApp shows a card. The page is the app itself; only <head> differs.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Recipe } from '../../src/types/recipe';
import { DISH_LABELS, DISH_TYPES, NO_MACROS, PROTEINS, shownNumbers, shownProtein, tintOf } from '../../src/lib/home';
import type { OgCard } from './og';

export interface PageMeta {
  title: string;
  description: string;
  /** absolute URL of this page */
  url: string;
  /** absolute URL of the 1200×630 image */
  image: string;
  noindex?: boolean;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Puts title, description and Open Graph / Twitter tags into the built index.html. */
export function withMeta(html: string, m: PageMeta): string {
  const tags = [
    `<link rel="canonical" href="${esc(m.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Protein Plate" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(m.url)}" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...(m.noindex ? ['<meta name="robots" content="noindex" />'] : []),
  ].join('\n    ');
  return html
    // Drop tags from an earlier pass (the built index.html already carries the home page's), so crawlers see one set.
    .replace(/\s*<(?:meta (?:property="og:|name="twitter:|name="robots")|link rel="canonical")[^>]*>/g, '')
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(m.description)}" />`)
    .replace(/(\s*)<\/head>/, `\n    ${tags}$1</head>`);
}

const proteinLabel = (k: string) => PROTEINS.find((p) => p.key === k)?.label ?? k;

/** Preview card + description for one recipe. Same numbers as the app: creator's figures only. */
export function recipeCard(r: Recipe): OgCard & { description: string } {
  const { value, whole } = shownProtein(r);
  const kcal = shownNumbers(r).kcal;
  const dish = DISH_TYPES.find((d) => r.tags.includes(d));
  const meta = [r.main_proteins.map(proteinLabel).join(' + '), dish ? DISH_LABELS[dish].long : ''].filter(Boolean).join(' · ');
  if (r.status === 'incomplete') {
    return { title: r.title, big: 'Details pending', caption: 'watch the video for the recipe', meta, tint: tintOf(r) === 'none' ? null : tintOf(r), description: `${r.title}: details pending. Watch the video.` };
  }
  if (value === null) {
    return { title: r.title, big: NO_MACROS, caption: 'the creator gives no numbers', meta, tint: tintOf(r) === 'none' ? null : tintOf(r), description: `${r.title}. ${meta}.` };
  }
  const g = `${Math.round(value)} g`;
  const caption = whole
    ? `protein, whole recipe${kcal !== null ? ` · ${Math.round(kcal)} kcal` : ''}`
    : `protein per portion${kcal !== null ? ` · ${Math.round(kcal)} kcal` : ''}`;
  return {
    title: r.title,
    big: g,
    caption,
    meta,
    tint: tintOf(r) === 'none' ? null : tintOf(r),
    description: `${g} ${caption}${meta ? ` · ${meta}` : ''}.`,
  };
}

export function writePage(dist: string, path: string, html: string): void {
  const dir = join(dist, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

export function readRecipes(dir: string): Recipe[] {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
}
