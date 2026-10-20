// Share message (DESIGN §6, fixed format) and GitHub links built from site.config.json.
import site from '../../site.config.json';
import type { Recipe } from '../types/recipe';
import { shownProtein } from './home';
import { formatNumber, formatQty } from './recipe';

export interface ShareOptions {
  ingredients: boolean;
  steps: boolean;
  note: string | null;
}

export function recipeUrl(id: string, siteUrl = site.site_url): string {
  return `${siteUrl.replace(/\/?$/, '/')}r/${id}/`;
}

/** GitHub's web editor for the recipe file (owner commits; others get a fork + suggestion). */
export function editUrl(id: string): string {
  return `https://github.com/${site.owner}/${site.repo}/edit/${site.branch}/data/recipes/${id}.json`;
}

function macroLine(r: Recipe): string {
  const { value, whole } = shownProtein(r);
  if (value === null) return 'Protein not worked out yet';
  const p = `${formatNumber(Math.round(value))} g protein`;
  if (whole) return `${p} for the whole recipe`;
  return r.per_portion.kcal !== null ? `${p} · ${Math.round(r.per_portion.kcal)} kcal per portion` : `${p} per portion`;
}

export function shareMessage(r: Recipe, o: ShareOptions, siteUrl = site.site_url): string {
  const blocks: string[] = [`*${r.title}*\n${macroLine(r)}`];
  if (o.ingredients && r.ingredients.length) {
    blocks.push(`*Ingredients*\n${r.ingredients.map((i) => [i.item, formatQty(i)].filter(Boolean).join(' ')).join(' · ')}`);
  }
  if (o.steps && r.steps.length) {
    blocks.push(`*Steps*\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
  }
  if (o.note && o.note.trim()) blocks.push(`*Note:* ${o.note.trim()}`);
  blocks.push([r.source.url ? `Video: ${r.source.url}` : '', `Full recipe: ${recipeUrl(r.id, siteUrl)}`].filter(Boolean).join('\n'));
  return blocks.join('\n\n');
}
