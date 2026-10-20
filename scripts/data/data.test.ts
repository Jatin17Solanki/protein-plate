// Tests use synthetic captions only — real raw text stays in the private repo.
import { describe, expect, it } from 'vitest';
import dictJson from '../../data/ingredients.json';
import type { Recipe } from '../../src/types/recipe';
import { checkDictionary, makeMatcher, type DictEntry } from './lib/dictionary';
import { findPairs } from './lib/dedupe';
import { estimate } from './lib/estimate';
import { checkFidelity, numbersIn } from './lib/fidelity';
import { canonicalUrl, linkKey, parseBatch } from './lib/raw';

const dict = dictJson as DictEntry[];
const matcher = makeMatcher(dict);

const BATCH = `https://www.instagram.com/p/AAA111/?hl=en

Soya Peas Tikki

Recipe by @test.kitchen

To a bowl add 50g soya chunks
1/2 cup green peas
2 tsp jeera
Salt, to taste
Boil the soya for 5 minutes, then mash with the peas and jeera.
Shape and pan fry at medium heat for 8–10 minutes.

Nutrition (serves 2) Protein - 15g, Calories - 200
soya tikki, high protein, healthy snack, vegetarian, easy recipes
Notes: snack, self cook
------------------------------------------------------------
------------------------------------------------------------
AIR FRYER:

https://www.instagram.com/reel/BBB222/?igsh=xyz

Paneer bites
------------------------------------------------------------
Link only: https://www.instagram.com/p/CCC333/
`;

const entries = parseBatch(BATCH);

function tikki(): Recipe {
  return {
    id: 'soya-peas-tikki',
    title: 'Soya Peas Tikki',
    source: { url: 'https://www.instagram.com/p/AAA111/', platform: 'instagram', creator: 'test.kitchen', creator_url: null, ref: 'test#1' },
    status: 'complete',
    meal_types: { values: ['snack'], stated_by_user: ['snack'] },
    main_proteins: ['soya'],
    supporting_proteins: [],
    tags: ['kebab_tikki_cutlet'],
    dish_group: null,
    variant_label: null,
    per_portion: { protein_g: null, kcal: null, carbs_g: null, fat_g: null, fibre_g: null, is_estimate: true },
    stated_macros: { basis: 'per serving (serves 2)', protein_g: 15, kcal: 200 },
    protein_working: [],
    servings: 2,
    ingredients: [
      { item: 'soya chunks', ingredient_id: 'soya_chunks', qty: 50, unit: 'g', type: 'protein', as_written: '50g soya chunks' },
      { item: 'green peas', ingredient_id: 'green_peas', qty: 0.5, unit: 'cup', type: 'produce', as_written: '1/2 cup green peas' },
      { item: 'cumin seeds', ingredient_id: 'cumin_seeds', qty: 2, unit: 'tsp', type: 'spice', as_written: '2 tsp jeera' },
      { item: 'salt', ingredient_id: 'salt', qty: null, unit: 'to_taste', type: 'spice', as_written: 'Salt, to taste' },
    ],
    steps: ['Boil the soya for 5 minutes, then mash with the peas and jeera.', 'Shape and pan fry at medium heat for 8–10 minutes.'],
    assumptions: [],
    missing: [],
    added_at: '2026-10-20',
  };
}

describe('parseBatch', () => {
  it('numbers entries by link line and keeps sections, credit and notes apart', () => {
    expect(entries.map((e) => e.n)).toEqual([1, 2, 3]);
    expect(entries[0].credit).toBe('test.kitchen');
    expect(entries[0].notes).toEqual(['Notes: snack, self cook']);
    expect(entries[0].content.some((l) => l.includes('healthy snack'))).toBe(false);
    expect(entries[0].section).toBeNull();
    expect(entries[1].section).toBe('AIR FRYER');
    expect(entries[2].label).toBe('Link only');
  });
  it('keeps long comma-heavy method lines but drops keyword lists', () => {
    const text = 'https://www.instagram.com/p/X1/\nDish\nAdd the puree along with turmeric, chilli powder, masala, cumin powder, garam masala, and salt. Cook well.\nquick dinner, high protein, veg recipes, easy meals, desi food\n';
    expect(parseBatch(text)[0].content).toEqual(['Dish', 'Add the puree along with turmeric, chilli powder, masala, cumin powder, garam masala, and salt. Cook well.']);
  });
  it('normalises links', () => {
    expect(linkKey(entries[1].url)).toBe('ig:BBB222');
    expect(canonicalUrl(entries[1].url)).toBe('https://www.instagram.com/reel/BBB222/');
  });
});

describe('numbersIn', () => {
  it('reads ranges, fractions and number words', () => {
    expect([...numbersIn('4–5 tomatoes, ½ tsp, 1/4tsp, 1½ cups, two minutes, 200°C')].sort()).toEqual(
      ['0.25', '0.5', '1.5', '2', '200', '4', '5'].sort(),
    );
  });
});

describe('dictionary', () => {
  it('is well formed', () => {
    expect(checkDictionary(dict)).toEqual([]);
  });
  it('prefers longer aliases and matches plurals', () => {
    expect(matcher.find('1 tsp jeera powder and 2 green chillies').map((m) => m.id)).toEqual(['cumin_powder', 'green_chilli']);
    expect(matcher.find('coriander powder, coriander').map((m) => m.id)).toEqual(['coriander_powder', 'coriander_leaves']);
  });
});

describe('checkFidelity', () => {
  const run = (r: Recipe) => checkFidelity(r, entries[0], matcher).errors;

  it('passes a faithful recipe', () => {
    expect(run(tikki())).toEqual([]);
  });
  it('catches a dropped ingredient', () => {
    const r = tikki();
    r.ingredients = r.ingredients.filter((g) => g.ingredient_id !== 'green_peas');
    r.steps[0] = 'Boil the soya for 5 minutes, then mash with the peas and jeera.';
    expect(run(r).join('\n')).toMatch(/green peas|1\/2|0\.5/);
  });
  it('catches a changed amount', () => {
    const r = tikki();
    r.ingredients[0].qty = 60;
    expect(run(r).join('\n')).toMatch(/qty 60/);
  });
  it('catches a number added to a step', () => {
    const r = tikki();
    r.steps[0] = 'Boil the soya for 7 minutes, then mash with the peas and jeera.';
    expect(run(r).join('\n')).toMatch(/steps\[0\].*7/);
  });
  it('catches a reworded step, but allows formatting', () => {
    const r = tikki();
    r.steps[0] = 'Cook the soya for 5 minutes, then mash it with the peas and jeera.';
    expect(run(r).join('\n')).toMatch(/steps\[0\] is not the source's wording/);
    r.steps = ['Boil the soya for 5 minutes', 'then mash with the peas and jeera!', 'Shape and pan fry at medium heat for 8–10 minutes'];
    expect(run(r)).toEqual([]);
  });
  it('warns about a source line left out of the steps', () => {
    const r = tikki();
    r.steps = r.steps.slice(0, 1);
    r.assumptions.push('Frying time 8–10 minutes.');
    const res = checkFidelity(r, entries[0], matcher);
    expect(res.errors).toEqual([]);
    expect(res.warnings.join('\n')).toMatch(/not in any step.*pan fry/);
  });
  it('catches reworded as_written', () => {
    const r = tikki();
    r.ingredients[2].as_written = '2 tsp cumin seeds';
    expect(run(r).join('\n')).toMatch(/exact wording/);
  });
  it('catches an invented ingredient', () => {
    const r = tikki();
    r.ingredients.push({ item: 'paneer', ingredient_id: 'paneer', qty: 50, unit: 'g', type: 'protein', as_written: '50g paneer' });
    expect(run(r).join('\n')).toMatch(/50g paneer/);
  });
  it('accepts a difference explained in assumptions', () => {
    const r = tikki();
    r.ingredients = r.ingredients.filter((g) => g.ingredient_id !== 'salt');
    expect(run(r).join('\n')).toMatch(/salt/);
    r.assumptions.push('Salt left to the cook.');
    expect(run(r)).toEqual([]);
  });
  it('requires a caption-less entry to be incomplete', () => {
    const r = { ...tikki(), ingredients: [], steps: [] };
    expect(checkFidelity(r, entries[1], matcher).errors.join('\n')).toMatch(/incomplete/);
    expect(checkFidelity({ ...r, status: 'incomplete', missing: ['everything'] }, entries[1], matcher).errors).toEqual([]);
  });
});

describe('estimate', () => {
  const byId = matcher.byId;
  it('applies the 35 % rule per protein group, larger first', () => {
    const r = tikki();
    r.ingredients.push({ item: 'paneer', ingredient_id: 'paneer', qty: 150, unit: 'g', type: 'protein', as_written: '150g paneer' });
    const e = estimate(r, byId);
    // soya 26 g, paneer 27 g, peas ~3.9 g → both mains, paneer first
    expect(e.main_proteins).toEqual(['paneer', 'soya']);
    expect(e.protein_g).toBe(Math.round((26 + 27 + 72.5 * 0.054 + 4 * 0.18) / 2));
    expect(e.working.at(-1)).toMatch(/÷ 2 portions/);
  });
  it('gives no per-portion figure when servings are not stated', () => {
    const e = estimate({ ...tikki(), servings: null }, byId);
    expect(e.protein_g).toBeNull();
    expect(e.total_protein_g).toBe(Math.round(26 + 72.5 * 0.054 + 4 * 0.18));
    expect(e.working.at(-1)).toMatch(/whole recipe \(portions not stated\)/);
  });
  it('lists supporting proteins at ≥ 10 %', () => {
    const r = tikki();
    r.ingredients.push({ item: 'Greek yogurt', ingredient_id: 'greek_yogurt', qty: 100, unit: 'g', type: 'dairy', as_written: '100g greek yogurt' });
    expect(estimate(r, byId).supporting_proteins).toEqual(['greek_yogurt']);
  });
});

describe('findPairs', () => {
  it('flags the same reel as a duplicate, even with a different query string', () => {
    const a = tikki();
    const b = { ...tikki(), id: 'copy', source: { ...a.source, url: 'https://www.instagram.com/reel/AAA111/' } };
    expect(findPairs([a, b])[0]).toMatchObject({ layer: 'same_link', same_group: false });
  });
  it('flags the same creator with a similar title', () => {
    const a = tikki();
    const b = { ...tikki(), id: 'b', title: 'Soya Peas Tikki (air fryer)', source: { ...a.source, url: 'https://www.instagram.com/p/ZZZ/' } };
    expect(findPairs([a, b])[0].layer).toBe('same_creator_title');
  });
  it('flags a near-identical ingredient set with the same main protein', () => {
    const a = tikki();
    const b = { ...tikki(), id: 'b', title: 'Matar soya cutlet', source: { ...a.source, creator: 'other', url: 'https://www.instagram.com/p/YYY/' } };
    expect(findPairs([a, b])[0].layer).toBe('ingredient_overlap');
  });
  it('says nothing about unrelated recipes', () => {
    const a = tikki();
    const b: Recipe = { ...tikki(), id: 'b', title: 'Paneer curry', main_proteins: ['paneer'], source: { ...a.source, creator: 'x', url: 'https://www.instagram.com/p/XXX/' } };
    expect(findPairs([a, b])).toEqual([]);
  });
});
