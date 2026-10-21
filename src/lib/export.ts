// Export (DESIGN §4 row 13, PLAN A7): the catalog as a compact text for an AI chat, as a plain-text page
// (/catalog.txt, written at build time) and as one JSON file. Pure — used by the Export screen and vite.config.ts.
import type { Recipe } from '../types/recipe';
import type { BackupData } from './backup';
import { DISH_LABELS, DISH_TYPES, MEALS, portionProtein, PROTEINS } from './home';
import { formatQty } from './recipe';

const proteinLabel = (k: string) => PROTEINS.find((p) => p.key === k)?.label ?? k;
const meals = (r: Recipe) => MEALS.filter((m) => m.key !== 'all' && r.meal_types.values.includes(m.key)).map((m) => m.label).join(', ');
const dishes = (r: Recipe) => DISH_TYPES.filter((d) => r.tags.includes(d)).map((d) => DISH_LABELS[d].long).join(', ');
const site = (siteUrl: string) => siteUrl.replace(/\/?$/, '/');

/** "32 g protein, 450 kcal per portion": the creator's per-portion numbers only, same as the tiles. */
export function macroText(r: Recipe): string {
  if (r.video_only) return 'video only (no written recipe)';
  if (r.status === 'incomplete') return 'details pending';
  const value = portionProtein(r);
  if (value === null) return 'macros not given';
  const kcal = r.per_portion.kcal;
  return `${Math.round(value)} g protein${kcal !== null ? `, ${Math.round(kcal)} kcal` : ''} per portion`;
}

function extras(r: Recipe): string[] {
  return [
    r.tags.includes('quick') ? 'quick' : '',
    r.tags.includes('global') ? 'global' : '',
    r.tags.includes('air_fryer_required') ? 'air fryer' : r.tags.includes('air_fryer_optional') ? 'air fryer optional' : '',
  ].filter(Boolean);
}

/** What I think of a recipe, for the AI: only filled in when the user ticks "include my data". */
function personalBits(id: string, p: BackupData): string[] {
  return [
    p.mylist.includes(id) ? 'on my list' : '',
    p.reactions[id] === 'like' ? 'I liked it' : p.reactions[id] === 'dislike' ? 'I disliked it' : '',
    p.notes[id] ? `my note: "${p.notes[id].replace(/\s+/g, ' ').trim()}"` : '',
  ].filter(Boolean);
}

/** One line per recipe: name, numbers, proteins, meals, dish, ingredients, link. */
export function compactCatalog(recipes: Recipe[], siteUrl: string, personal: BackupData | null = null): string {
  return [...recipes]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((r) => {
      const parts = [
        r.title,
        macroText(r),
        r.main_proteins.map(proteinLabel).join(' + '),
        meals(r),
        dishes(r),
        ...extras(r),
        r.ingredients.length ? `ingredients: ${[...new Set(r.ingredients.map((i) => i.item))].join(', ')}` : '',
        ...(personal ? personalBits(r.id, personal) : []),
        `${site(siteUrl)}r/${r.id}/`,
      ];
      return `- ${parts.filter(Boolean).join(' · ')}`;
    })
    .join('\n');
}

/**
 * "Copy prompt + catalog": Track B's prompts/ask-catalog.md (the text after its first `---`), then the catalog and
 * "My question:". Its "My data" bullet is kept only when personal data is included. The prompt's field guide
 * describes compactCatalog()'s line format: tell Track B if that format changes.
 */
export function askPrompt(prompt: string, recipes: Recipe[], siteUrl: string, personal: BackupData | null = null): string {
  const cut = prompt.indexOf('\n---\n');
  const body = (cut >= 0 ? prompt.slice(cut + 5) : prompt).trim();
  const text = personal ? body : body.split('\n').filter((l) => !l.startsWith('- **My data**')).join('\n');
  return [text, '', 'Catalog:', compactCatalog(recipes, siteUrl, personal), '', 'My question:', ''].join('\n');
}

/** The public /catalog.txt page: every recipe in full, as plain text, for AI tools that can read a link. */
export function catalogText(recipes: Recipe[], siteUrl: string, title = 'Protein Plate'): string {
  const head = [
    `${title} — ${recipes.length} high-protein vegetarian recipes\n${site(siteUrl)}`,
    'Protein and kcal are the creators\' own numbers: per portion, or for the whole recipe when the creator doesn\'t say how many portions it makes. "Macros not given" means the creator gives none.',
  ];
  const blocks = [...recipes]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((r) => {
      const lines = [
        `## ${r.title}`,
        `Link: ${site(siteUrl)}r/${r.id}/`,
        r.source.url ? `Video: ${r.source.url}${r.source.creator ? ` (by ${r.source.creator})` : ''}` : '',
        `Protein: ${macroText(r)}`,
        r.main_proteins.length ? `Main protein: ${r.main_proteins.map(proteinLabel).join(' + ')}` : '',
        meals(r) ? `Meal: ${meals(r)}` : '',
        dishes(r) ? `Dish: ${dishes(r)}` : '',
        extras(r).length ? `Also: ${extras(r).join(', ')}` : '',
        r.servings !== null ? `Serves: ${r.servings}` : '',
      ].filter(Boolean);
      if (r.ingredients.length) {
        lines.push('', 'Ingredients:', ...r.ingredients.map((i) => `- ${[i.item, formatQty(i)].filter(Boolean).join(': ')}${i.optional ? ' (optional)' : ''}`));
      }
      if (r.steps.length) lines.push('', 'Steps:', ...r.steps.map((s, i) => `${i + 1}. ${s}`));
      if (r.status === 'incomplete' && r.missing.length) lines.push('', `Details missing: ${r.missing.join('; ')}`);
      return lines.join('\n');
    });
  return `${[...head, ...blocks].join('\n\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

export const CATALOG_KIND = 'protein-plate-catalog';

export interface CatalogFile {
  kind: typeof CATALOG_KIND;
  version: 1;
  exported_at: string;
  site: string;
  count: number;
  recipes: Recipe[];
  /** Only when the user ticks "include my data" (same shape as a backup's data). */
  personal?: BackupData;
}

export function catalogFile(recipes: Recipe[], siteUrl: string, personal: BackupData | null, now = new Date()): CatalogFile {
  const sorted = [...recipes].sort((a, b) => a.id.localeCompare(b.id));
  return {
    kind: CATALOG_KIND,
    version: 1,
    exported_at: now.toISOString(),
    site: site(siteUrl),
    count: sorted.length,
    recipes: sorted,
    ...(personal ? { personal } : {}),
  };
}

export function catalogFileName(now = new Date()): string {
  return `protein-plate-catalog-${now.toISOString().slice(0, 10)}.json`;
}
