import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { filterRecipes, groupTitle, NO_FILTERS, toTiles } from '../../src/lib/home';
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
    expect(ids(filterRecipes(recipes, { meal: 'snack', proteins: ['soya'], quick: ['airFryer'] }))).toEqual(['soya-paneer-tikki', 'soya-pea-kebab']);
  });

  it('My list uses the ids passed in', () => {
    expect(ids(filterRecipes(recipes, { ...NO_FILTERS, quick: ['myList'] }, new Set(['besan-chilla'])))).toEqual(['besan-chilla']);
    expect(filterRecipes(recipes, { ...NO_FILTERS, quick: ['myList'] })).toEqual([]);
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
