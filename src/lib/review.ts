// Review page (/review/, TRACKER D7): recipes Jatin must look at. Track B sets and clears `flags`; this only reads them.
import type { Flag, Recipe } from '../types/recipe';

export type FlagCode = Flag['code'];

/** Page order: per-recipe decisions first, then the ones a single rule can clear in bulk. */
export const FLAG_INFO: { code: FlagCode; label: string; decide: string }[] = [
  { code: 'source_conflict', label: 'Source conflict', decide: 'The caption contradicts itself. Which version is right?' },
  { code: 'missing_details', label: 'Missing details', decide: 'Something the recipe needs isn’t in the post. Fill it in from the video.' },
  { code: 'macros_basis_unclear', label: 'Portions unclear', decide: 'The creator gives numbers but not how many portions they cover.' },
  { code: 'no_macros', label: 'No macros', decide: 'The creator gives no numbers. Leave blank, or supply them.' },
  { code: 'no_main_protein', label: 'No main protein', decide: 'No protein source reaches 35 %. Accept "none", or pick one.' },
  { code: 'other', label: 'Other', decide: 'See the note.' },
];

export const flagLabel = (code: FlagCode) => FLAG_INFO.find((f) => f.code === code)?.label ?? code;

export interface ReviewItem {
  recipe: Recipe;
  flags: Flag[];
}

/**
 * Flagged recipes, plus incomplete ones the data forgot to flag (shown as missing details). Video-only recipes are
 * complete as far as Jatin is concerned, archived ones are out of the catalog, and flags he accepted (`accepted_flags`) are decided: neither is listed.
 */
export function reviewItems(recipes: Recipe[]): ReviewItem[] {
  const order = (c: FlagCode) => FLAG_INFO.findIndex((f) => f.code === c);
  return recipes
    .filter((recipe) => !recipe.video_only && !recipe.archived)
    .map((recipe) => {
      const accepted = new Set<FlagCode>(recipe.accepted_flags ?? []);
      const flags = (recipe.flags ?? []).filter((f) => !accepted.has(f.code));
      if (recipe.status === 'incomplete' && !accepted.has('missing_details') && !flags.some((f) => f.code === 'missing_details')) {
        flags.push({ code: 'missing_details', note: recipe.missing.join('; ') || 'Marked incomplete.' });
      }
      return { recipe, flags: flags.sort((a, b) => order(a.code) - order(b.code)) };
    })
    .filter((i) => i.flags.length > 0)
    .sort((a, b) => order(a.flags[0].code) - order(b.flags[0].code) || a.recipe.title.localeCompare(b.recipe.title));
}

export function flagCounts(items: ReviewItem[]): Record<FlagCode, number> {
  const counts = Object.fromEntries(FLAG_INFO.map((f) => [f.code, 0])) as Record<FlagCode, number>;
  for (const i of items) for (const code of new Set(i.flags.map((f) => f.code))) counts[code]++;
  return counts;
}

export function withFlag(items: ReviewItem[], code: FlagCode | null): ReviewItem[] {
  return code ? items.filter((i) => i.flags.some((f) => f.code === code)) : items;
}
