import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  bestRelaxation, dishCount, filterRecipes, groupTitle, NO_FILTERS, NO_PERSONAL, optionCounts, pickProtein, picksExtras, shownProtein,
  skipProtein, summaryParts, toTiles, portionProtein, wholeRecipeProtein, type Filters,
} from '../../src/lib/home';
import { parse } from '../../src/lib/router';
import type { Recipe } from '../../src/types/recipe';

const DIR = 'tests/fixtures';
const recipes: Recipe[] = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const ids = (rs: Recipe[]) => rs.map((r) => r.id).sort();

describe('filterRecipes', () => {
  it('no filters → everything', () => {
    expect(filterRecipes(recipes, NO_FILTERS)).toHaveLength(10);
  });

  it('meal tab matches any of a recipe’s meal types', () => {
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, meal: 'breakfast' }))).toEqual(['besan-chilla', 'protein-oats', 'tofu-bhurji-toast']);
  });

  it('proteins are OR, and a multi-protein recipe matches either', () => {
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, proteins: ['tofu', 'tempeh'] }))).toEqual(['tempeh-chilli-noodles', 'tofu-bhurji-toast']);
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, proteins: ['paneer'] }))).toContain('soya-paneer-tikki');
  });

  it('quick chips are AND, and combine with meal and protein', () => {
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, quick: ['quick'] }))).toEqual(['besan-chilla', 'protein-oats', 'tofu-bhurji-toast']);
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, quick: ['quick', 'global'] }))).toEqual([]);
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, meal: 'snack', proteins: ['soya'], quick: ['airFryer'] }))).toEqual(['soya-paneer-tikki', 'soya-pea-kebab']);
  });

  it('Classics and Add-ons match the classic / add_on tags', () => {
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, quick: ['classic'] }))).toEqual(['rajma-rice-bowl']);
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, quick: ['addOn'] }))).toEqual(['lasooni-dhaniya-paneer']);
    expect(summaryParts({ ...NO_FILTERS, quick: ['classic', 'addOn'] })).toEqual(['Classics', 'Add-ons']);
  });

  it('My list uses the ids passed in', () => {
    const p = { ...NO_PERSONAL, myList: new Set(['besan-chilla']) };
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, quick: ['myList'] }, p))).toEqual(['besan-chilla']);
    expect(filterRecipes(recipes, { ...NO_FILTERS, quick: ['myList'] })).toEqual([]);
  });

  it('dish types are OR and match any tag of the recipe', () => {
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, dishTypes: ['salad_bowl', 'pasta_noodles'] }))).toEqual([
      'rajma-rice-bowl', 'soya-tikka-salad', 'tempeh-chilli-noodles',
    ]);
  });

  it('disliked recipes are hidden unless "Show disliked" is on', () => {
    const p = { ...NO_PERSONAL, disliked: new Set(['besan-chilla']) };
    expect(ids(filterRecipes(recipes, NO_FILTERS, p))).not.toContain('besan-chilla');
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, showDisliked: true }, p))).toContain('besan-chilla');
  });
});

describe('dishCount + optionCounts', () => {
  it('counts a dish group once', () => {
    expect(dishCount(recipes)).toBe(9);
  });

  it('OR groups: count = that option with the other groups as is; AND picks: count with the pick added', () => {
    const f = { ...NO_FILTERS, meal: 'snack' as const, proteins: ['soya' as const] };
    const c = optionCounts(recipes, f);
    expect(c.proteins).toEqual({ other: 0, paneer: 1, soya: 1, pulses: 1, tofu: 0, tempeh: 0, whey: 0 });
    expect(c.dishTypes.kebab_tikki_cutlet).toBe(1);
    expect(c.dishTypes.salad_bowl).toBe(0);
    expect(c.quick).toEqual({ quick: 0, classic: 0, addOn: 0, myList: 0, global: 0, airFryer: 1 });
  });
});

describe('summaryParts + bestRelaxation', () => {
  it('one part per active choice', () => {
    expect(summaryParts({ ...NO_FILTERS, meal: 'dinner', proteins: ['soya', 'paneer'], quick: ['quick'] })).toEqual([
      'Dinner', 'Paneer or Soya', 'Quick',
    ]);
    expect(summaryParts({ ...NO_FILTERS, dishTypes: ['wrap_roll_taco', 'sandwich_toast'], showDisliked: true })).toEqual([
      'Sandwich or Wrap', 'incl. disliked',
    ]);
  });

  it('suggests the removal that brings back the most dishes', () => {
    const f = { ...NO_FILTERS, meal: 'breakfast' as const, proteins: ['tofu' as const], quick: ['airFryer' as const] };
    expect(dishCount(filterRecipes(recipes, f))).toBe(0);
    expect(bestRelaxation(recipes, f)).toMatchObject({ label: 'Air fryer', dishes: 1, filters: { ...f, quick: [] } });
  });

  it('returns null when no single removal helps', () => {
    const f = { ...NO_FILTERS, meal: 'breakfast' as const, proteins: ['tempeh' as const], quick: ['airFryer' as const] };
    expect(bestRelaxation(recipes, f)).toBeNull();
  });
});

describe('toTiles', () => {
  const tiles = toTiles(recipes);

  it('collapses a dish group into one tile and sorts by protein, unknown last', () => {
    expect(tiles).toHaveLength(9);
    expect(tiles.map((t) => t.protein)).toEqual(['45', '38', '36', '31', '24', '22+', '21', '20', '—']);
  });

  it('group tile: lowest protein with "+", average kcal, version count, opens the top version', () => {
    const g = tiles.find((t) => t.versions > 1)!;
    expect(g).toMatchObject({ id: 'soya-paneer-tikki', title: 'Soya kebab', protein: '22+', meta: 'Soya · ~280 kcal', versions: 2, tint: 'soya', dishType: 'kebab_tikki_cutlet' });
  });

  it('single tile meta: proteins + kcal; missing kcal omitted; incomplete says details pending', () => {
    const by = (id: string) => tiles.find((t) => t.id === id)!;
    expect(by('soya-tikka-salad')).toMatchObject({ meta: 'Soya · 420 kcal', tint: 'soya', dishType: 'salad_bowl' });
    expect(by('rajma-rice-bowl').meta).toBe('Pulses');
    expect(by('lasooni-dhaniya-paneer')).toMatchObject({ protein: '—', meta: 'Paneer · details pending' });
    expect(by('protein-oats').dishType).toBeNull();
  });

  it('a group with only one matching version shows as a normal tile', () => {
    const one = toTiles(recipes.filter((r) => r.id === 'soya-pea-kebab'));
    expect(one).toMatchObject([{ title: 'Soya Pea Kebab', protein: '22', versions: 1 }]);
  });

  it('multi-protein meta joins names', () => {
    const r = recipes.find((x) => x.id === 'soya-paneer-tikki')!;
    expect(toTiles([r])[0].meta).toBe('Soya + paneer · 300 kcal');
  });
});

describe('Leave out (skip proteins)', () => {
  it('hides recipes with any left-out main protein, including multi-protein ones', () => {
    const left = ids(filterRecipes(recipes, { ...NO_FILTERS, skipProteins: ['paneer'] }));
    expect(left).not.toContain('soya-paneer-tikki');
    expect(left).not.toContain('paneer-tikka-wrap');
    expect(left).toContain('soya-pea-kebab');
  });

  it('a protein is either picked or left out, never both', () => {
    const f = pickProtein(NO_FILTERS, 'paneer');
    expect(skipProtein(f, 'paneer')).toMatchObject({ proteins: [], skipProteins: ['paneer'] });
    expect(pickProtein(skipProtein(NO_FILTERS, 'soya'), 'soya')).toMatchObject({ proteins: ['soya'], skipProteins: [] });
  });

  it('count = dishes left with that protein also left out; summary and relaxation name it', () => {
    const c = optionCounts(recipes, { ...NO_FILTERS, skipProteins: ['soya'] });
    expect(c.skipProteins.soya).toBe(dishCount(filterRecipes(recipes, { ...NO_FILTERS, skipProteins: ['soya'] })));
    expect(c.skipProteins.tofu).toBe(dishCount(filterRecipes(recipes, { ...NO_FILTERS, skipProteins: ['soya', 'tofu'] })));
    expect(summaryParts({ ...NO_FILTERS, skipProteins: ['soya', 'paneer'] })).toEqual(['Not Paneer or Soya']);
    // Picked under Main protein → its Leave out count is what you'd get after the swap, so the chip stays usable.
    const picked = optionCounts(recipes, { ...NO_FILTERS, proteins: ['paneer'] });
    expect(picked.skipProteins.paneer).toBe(dishCount(filterRecipes(recipes, { ...NO_FILTERS, skipProteins: ['paneer'] })));
    expect(optionCounts(recipes, { ...NO_FILTERS, skipProteins: ['soya'] }).proteins.soya).toBeGreaterThan(0);
    const f = { ...NO_FILTERS, skipProteins: ['paneer', 'soya', 'pulses', 'tofu', 'tempeh', 'whey'] as Filters['skipProteins'] };
    expect(dishCount(filterRecipes(recipes, f))).toBe(0);
    expect(bestRelaxation(recipes, f)).toMatchObject({ label: 'Not Paneer or Soya or Pulses or Tofu or Tempeh or Whey', filters: NO_FILTERS });
  });
});

describe('extras (desserts, sauces) sort last', () => {
  const as = (id: string, protein: number, tags: Recipe['tags']): Recipe => {
    const base = recipes.find((r) => r.id === 'soya-tikka-salad')!;
    return { ...base, id, title: id, dish_group: null, tags, per_portion: { ...base.per_portion, protein_g: protein } };
  };
  const list = [as('cheesecake', 60, ['dessert']), as('dip', 40, ['sauce_dip']), as('sabzi', 30, ['curry_sabzi']), as('wrap', 20, ['wrap_roll_taco'])];

  it('meals first by the chosen sort, then extras by the same sort', () => {
    expect(toTiles(list).map((t) => t.id)).toEqual(['sabzi', 'wrap', 'cheesecake', 'dip']);
    expect(toTiles(list, 'kcal').slice(2).every((t) => t.extra)).toBe(true);
  });

  it('picking Dessert or Sauce keeps the plain sort', () => {
    expect(picksExtras({ ...NO_FILTERS, dishTypes: ['dessert'] })).toBe(true);
    expect(picksExtras({ ...NO_FILTERS, dishTypes: ['curry_sabzi'] })).toBe(false);
    expect(toTiles(list, 'protein', undefined, true).map((t) => t.id)).toEqual(['cheesecake', 'dip', 'sabzi', 'wrap']);
  });

  it('a search name match still comes before everything', () => {
    const hits = new Map([['cheesecake', { nameMatch: true, uses: null }]]);
    expect(toTiles(list, 'protein', hits)[0].id).toBe('cheesecake');
  });
});

describe('groupTitle', () => {
  it('turns the group id into a title', () => expect(groupTitle('protein-pasta')).toBe('Protein pasta'));
});

describe('router.parse', () => {
  const base = '/protein-plate/';
  it.each([
    ['/protein-plate/', { name: 'home' }],
    ['/protein-plate', { name: 'home' }],
    ['/protein-plate/index.html', { name: 'home' }],
    ['/protein-plate/r/besan-chilla/', { name: 'recipe', id: 'besan-chilla' }],
    ['/protein-plate/r/besan-chilla', { name: 'recipe', id: 'besan-chilla' }],
    ['/protein-plate/r/Bad_Id/', { name: 'notFound' }],
    ['/protein-plate/other', { name: 'notFound' }],
  ])('%s', (path, route) => expect(parse(path, base)).toEqual(route));
});

describe('whole-recipe protein (no portion count)', () => {
  const noPortions = (id: string, total: number) => {
    const r = structuredClone(recipes.find((x) => x.id === id)!);
    r.servings = null;
    r.per_portion = { ...r.per_portion, protein_g: null, kcal: null };
    r.stated_macros = { basis: 'whole recipe (servings not stated)', protein_g: total, kcal: null };
    return r;
  };

  it("uses the creator's figure when no portion count is given; null when there is one or no figure", () => {
    expect(wholeRecipeProtein(noPortions('besan-chilla', 47.2))).toBe(47.2);
    expect(wholeRecipeProtein(recipes.find((x) => x.id === 'besan-chilla')!)).toBeNull();
    expect(wholeRecipeProtein(recipes.find((x) => x.id === 'lasooni-dhaniya-paneer')!)).toBeNull();
    expect(shownProtein(noPortions('besan-chilla', 47.2))).toEqual({ value: 47.2, whole: true });
  });

  // Jatin, 2026-10-20: whole-dish totals stay on the recipe page; tiles and sorting use per-portion figures only.
  it('tile shows no number and sorts with the unknowns', () => {
    const rs = recipes.map((r) => (r.id === 'besan-chilla' ? noPortions('besan-chilla', 90) : r));
    const tiles = toTiles(rs);
    const t = tiles.find((x) => x.id === 'besan-chilla')!;
    expect(t).toMatchObject({ protein: '—', meta: 'Pulses · Macros not given', sortProtein: null });
    expect(tiles.map((x) => x.protein)).toEqual(['45', '38', '36', '31', '24', '22+', '21', '—', '—']);
    expect(portionProtein(noPortions('besan-chilla', 90))).toBeNull();
  });

  it('group: only per-portion versions count', () => {
    const a = noPortions('soya-pea-kebab', 31);
    const b = noPortions('soya-paneer-tikki', 50);
    expect(toTiles([a, b])[0]).toMatchObject({ protein: '—', meta: 'Soya · Macros not given' });
    const real = recipes.find((x) => x.id === 'soya-paneer-tikki')!;
    expect(toTiles([a, real])[0]).toMatchObject({ protein: '29+' });
  });
});

describe('empty values (Track B request)', () => {
  it('no main protein → neutral tint; no numbers → "Macros not given"', () => {
    const r = structuredClone(recipes.find((x) => x.id === 'tempeh-chilli-noodles')!);
    r.main_proteins = [];
    r.per_portion = { ...r.per_portion, protein_g: null, kcal: null };
    expect(toTiles([r])[0]).toMatchObject({ tint: 'none', protein: '—', meta: 'Macros not given' });
  });
});
