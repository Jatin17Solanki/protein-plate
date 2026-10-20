import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkCatalog, checkSchema } from '../../src/lib/validate';
import type { Recipe } from '../../src/types/recipe';

const DIR = 'tests/fixtures';
const fixtures = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: join(DIR, f), data: JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Recipe }));
const byId = (id: string) => structuredClone(fixtures.find((f) => f.data.id === id)!.data);
const one = (r: unknown, file = `${(r as Recipe).id}.json`) => checkCatalog([{ file, data: r }]);

describe('fixtures', () => {
  it('are all valid', () => {
    const report = checkCatalog(fixtures);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.recipes).toHaveLength(10);
  });

  it('cover every main protein, multi-protein, a versions group, incomplete and missing macros', () => {
    const rs = fixtures.map((f) => f.data);
    const proteins = new Set(rs.flatMap((r) => r.main_proteins));
    expect([...proteins].sort()).toEqual(['paneer', 'pulses', 'soya', 'tempeh', 'tofu', 'whey']);
    expect(rs.some((r) => r.main_proteins.length > 1)).toBe(true);
    expect(rs.filter((r) => r.dish_group === 'soya-kebab')).toHaveLength(2);
    expect(rs.some((r) => r.status === 'incomplete')).toBe(true);
    expect(rs.some((r) => r.status === 'complete' && r.per_portion.kcal === null && r.stated_macros === null)).toBe(true);
  });
});

describe('schema', () => {
  it('rejects unknown fields (typos)', () => {
    const r = { ...byId('besan-chilla'), protien_g: 20 };
    expect(checkSchema(r)).toEqual(['(root): unknown field "protien_g"']);
  });

  it('rejects a protein outside the list', () => {
    const r = byId('besan-chilla');
    (r.main_proteins as string[]) = ['egg'];
    expect(checkSchema(r).join()).toMatch(/main_proteins\/0: must be one of paneer/);
  });

  it('rejects a bad id and a bad date', () => {
    const r = byId('besan-chilla');
    r.id = 'Besan Chilla';
    r.added_at = '20/10/2026';
    const errors = checkSchema(r).join('\n');
    expect(errors).toMatch(/\/id: must match pattern/);
    expect(errors).toMatch(/\/added_at: must match format "date"/);
  });

  it('requires protein, a main protein, ingredients and steps on complete recipes', () => {
    const r = byId('besan-chilla');
    r.per_portion.protein_g = null;
    r.main_proteins = [];
    r.ingredients = [];
    r.steps = [];
    const errors = checkSchema(r).join('\n');
    expect(errors).toMatch(/per_portion\/protein_g: must be number/);
    expect(errors).toMatch(/main_proteins: must NOT have fewer than 1 items/);
    expect(errors).toMatch(/ingredients: must NOT have fewer than 1 items/);
    expect(errors).toMatch(/steps: must NOT have fewer than 1 items/);
  });

  it('requires missing[] on incomplete recipes', () => {
    const r = byId('lasooni-dhaniya-paneer');
    r.missing = [];
    expect(checkSchema(r).join()).toMatch(/missing: must NOT have fewer than 1 items/);
  });

  it('requires variant_label when dish_group is set', () => {
    const r = byId('soya-pea-kebab');
    r.variant_label = null;
    expect(checkSchema(r).join()).toMatch(/variant_label: must be string/);
  });

  it('rejects http source links', () => {
    const r = byId('besan-chilla');
    r.source.url = 'http://example.com/x';
    expect(checkSchema(r).join()).toMatch(/source\/url: must match pattern/);
  });
});

describe('catalog rules', () => {
  it('id must match the file name', () => {
    expect(one(byId('besan-chilla'), 'data/recipes/chilla.json').errors[0].message).toMatch(/must match the file name/);
  });

  it('ids must be unique', () => {
    const r = byId('besan-chilla');
    const report = checkCatalog([{ file: 'a/besan-chilla.json', data: r }, { file: 'b/besan-chilla.json', data: r }]);
    expect(report.errors.map((e) => e.message)).toEqual(['duplicate id "besan-chilla" (also in a/besan-chilla.json)']);
  });

  it('stated_by_user must be a subset of values', () => {
    const r = byId('besan-chilla');
    r.meal_types.stated_by_user = ['dinner'];
    expect(one(r).errors[0].message).toMatch(/"dinner" which is not in meal_types.values/);
  });

  it('variant_label without dish_group is an error', () => {
    const r = byId('besan-chilla');
    r.variant_label = 'spicy';
    expect(one(r).errors[0].message).toBe('variant_label is set but dish_group is null');
  });

  it('air fryer is either required or optional, not both', () => {
    const r = byId('besan-chilla');
    r.tags.push('air_fryer_required', 'air_fryer_optional');
    expect(one(r).errors[0].message).toMatch(/both air_fryer_required and air_fryer_optional/);
  });

  it('labels repeat inside a group → error; a group of one → warning', () => {
    const a = byId('soya-pea-kebab');
    const b = byId('soya-paneer-tikki');
    b.variant_label = a.variant_label;
    const report = checkCatalog([{ file: `${a.id}.json`, data: a }, { file: `${b.id}.json`, data: b }]);
    expect(report.errors.map((e) => e.message)).toEqual(['variant_label "with peas" repeats in dish_group "soya-kebab"']);
    expect(one(a).warnings[0].message).toBe('dish_group "soya-kebab" has only one recipe');
  });

  it('a recipe that fails the schema is not returned', () => {
    const r = { ...byId('besan-chilla'), status: 'draft' };
    const report = one(r);
    expect(report.recipes).toEqual([]);
    expect(report.errors[0].message).toMatch(/status: must be one of complete, incomplete/);
  });
});
