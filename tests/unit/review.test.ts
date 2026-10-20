import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { flagCounts, flagLabel, reviewItems, withFlag } from '../../src/lib/review';
import type { Recipe } from '../../src/types/recipe';

const DIR = 'tests/fixtures';
const base: Recipe[] = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const recipes = base.map((r) => {
  const c = structuredClone(r);
  if (c.id === 'besan-chilla') c.flags = [{ code: 'no_macros', note: 'The creator gives no macros.' }, { code: 'source_conflict', note: 'Soak 3 h vs 1 h.' }];
  if (c.id === 'protein-oats') c.flags = [{ code: 'macros_basis_unclear', note: 'Whole recipe.' }];
  if (c.id === 'tofu-bhurji-toast') c.flags = [];
  return c;
});

describe('reviewItems', () => {
  const items = reviewItems(recipes);

  it('lists flagged recipes and unflagged incomplete ones; clean recipes stay out', () => {
    expect(items.map((i) => i.recipe.id)).toEqual(['besan-chilla', 'lasooni-dhaniya-paneer', 'protein-oats', 'tempeh-chilli-noodles']);
  });

  it('per-recipe decisions sort first; flags inside a recipe follow the page order', () => {
    expect(items[0].flags.map((f) => f.code)).toEqual(['source_conflict', 'no_macros']);
  });

  it('an incomplete recipe without flags is shown as missing details, using missing[]', () => {
    expect(items[1].flags).toEqual([{ code: 'missing_details', note: 'ingredients; quantities; method; macros' }]);
  });

  it('counts recipes per code, and filters by code', () => {
    expect(flagCounts(items)).toEqual({ source_conflict: 1, missing_details: 1, macros_basis_unclear: 1, no_macros: 2, no_main_protein: 0, other: 0 });
    expect(withFlag(items, 'no_macros').map((i) => i.recipe.id)).toEqual(['besan-chilla', 'tempeh-chilli-noodles']);
    expect(withFlag(items, null)).toHaveLength(4);
  });

  it('labels', () => expect(flagLabel('macros_basis_unclear')).toBe('Portions unclear'));
});
