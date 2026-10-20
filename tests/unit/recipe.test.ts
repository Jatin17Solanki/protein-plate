import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatNumber, formatQty, groupIngredients, macroFootnote, tagChips, versionLine, versionsOf } from '../../src/lib/recipe';
import type { Ingredient, Recipe } from '../../src/types/recipe';

const DIR = 'tests/fixtures';
const recipes: Recipe[] = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const byId = (id: string) => structuredClone(recipes.find((r) => r.id === id)!);
const ing = (o: Partial<Ingredient>): Ingredient => ({ item: 'x', ingredient_id: null, qty: null, unit: null, type: 'pantry', as_written: 'x', ...o });

describe('formatQty', () => {
  it.each([
    [{ qty: 40, unit: 'g' }, '40 g'],
    [{ qty: 0.5, unit: 'cup' }, '½ cup'],
    [{ qty: 2, unit: 'cup' }, '2 cups'],
    [{ qty: 1.5, unit: 'tbsp' }, '1.5 tbsp'],
    [{ qty: 0.5, unit: 'piece' }, '½'],
    [{ qty: 1, unit: 'piece' }, '1'],
    [{ qty: null, unit: 'to_taste' }, 'to taste'],
    [{ qty: 1, unit: 'handful' }, '1 handful'],
    [{ qty: null, unit: 'handful' }, 'handful'],
    [{ qty: null, unit: null }, ''],
    [{ qty: 0.25, unit: 'tsp' }, '¼ tsp'],
  ] as const)('%o → %s', (o, out) => expect(formatQty(ing(o as Partial<Ingredient>))).toBe(out));

  it('formatNumber rounds to 2 places', () => expect(formatNumber(1.333333)).toBe('1.33'));
});

describe('groupIngredients', () => {
  it('main (unsectioned) first, then sections in first-seen order, keeping original indexes', () => {
    const g = groupIngredients([ing({ item: 'a', section: 'chutney' }), ing({ item: 'b' }), ing({ item: 'c', section: 'chutney' }), ing({ item: 'd', section: 'Topping' })]);
    expect(g.map((x) => [x.section, x.items.map((i) => `${i.ingredient.item}${i.index}`)])).toEqual([
      [null, ['b1']],
      ['chutney', ['a0', 'c2']],
      ['Topping', ['d3']],
    ]);
  });

  it('no sections → one group', () => expect(groupIngredients(byId('besan-chilla').ingredients)).toHaveLength(1));
});

describe('versions', () => {
  it('sorted by protein; version line shows position', () => {
    const r = byId('soya-pea-kebab');
    const v = versionsOf(r, recipes);
    expect(v.map((x) => x.id)).toEqual(['soya-paneer-tikki', 'soya-pea-kebab']);
    expect(versionLine(recipes.find((x) => x.id === 'soya-pea-kebab')!, v)).toBe('Soya kebab · version 2 of 2');
  });

  it('single recipe → no versions, no line', () => {
    expect(versionsOf(byId('besan-chilla'), recipes)).toEqual([]);
    expect(versionLine(byId('besan-chilla'), [])).toBeNull();
  });
});

describe('tagChips', () => {
  it('dish types, meals, air fryer, quick, global', () => {
    expect(tagChips(byId('paneer-tikka-wrap'))).toEqual(['Wrap / roll', 'Lunch · Dinner', 'Air fryer · optional']);
    expect(tagChips(byId('tempeh-chilli-noodles'))).toEqual(['Pasta / noodles', 'Lunch · Dinner', 'Global']);
    expect(tagChips(byId('besan-chilla'))).toEqual(['Chilla / pancake', 'Breakfast · Snack', 'Quick']);
  });
});

describe('macroFootnote', () => {
  it('creator numbers used as is', () => {
    expect(macroFootnote(byId('soya-pea-kebab'))).toBe('Protein and kcal as stated by the creator. Carbs, fat and fibre not known.');
  });
  it('estimate with the creator figure alongside', () => {
    expect(macroFootnote(byId('paneer-tikka-wrap'))).toBe('Our estimate; the creator says 40 g protein and 500 kcal (per wrap). Fibre not known.');
  });
  it('estimate, nothing from the creator', () => {
    expect(macroFootnote(byId('besan-chilla'))).toBe('Protein and kcal are our estimate. Carbs, fat and fibre not known.');
  });
});
