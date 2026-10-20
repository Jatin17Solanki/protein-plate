// Data checks that need no raw files (safe for public CI):
//  - data/ingredients.json is well formed
//  - every ingredient_id / supporting protein exists in the dictionary
//  - per_portion (when is_estimate), protein_working, main_proteins and supporting_proteins
//    agree with the estimate computed from the ingredients (CONTEXT §4: 35 % rule, show the working)
// Usage: tsx scripts/data/check.ts [--write]   (--write fills those computed fields in place)
import { writeFileSync } from 'node:fs';
import type { Recipe } from '../../src/types/recipe';
import { checkDictionary } from './lib/dictionary';
import { estimate } from './lib/estimate';
import { loadDict, loadRecipes } from './load';

const write = process.argv.includes('--write');
const dict = loadDict();
const byId = new Map(dict.map((d) => [d.id, d]));
let errors = 0;
const err = (file: string, msg: string) => { errors++; console.error(`✗ ${file}: ${msg}`); };
const warn = (file: string, msg: string) => console.warn(`! ${file}: ${msg}`);

for (const e of checkDictionary(dict)) err('data/ingredients.json', e);

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

for (const { file, recipe: r } of loadRecipes()) {
  r.ingredients.forEach((g, i) => {
    if (g.ingredient_id && !byId.has(g.ingredient_id)) err(file, `ingredients[${i}].ingredient_id "${g.ingredient_id}" is not in data/ingredients.json`);
    const d = g.ingredient_id ? byId.get(g.ingredient_id) : undefined;
    if (d && d.type !== g.type) warn(file, `ingredients[${i}] type "${g.type}" differs from the dictionary's "${d.type}"`);
  });
  for (const s of r.supporting_proteins) if (!byId.has(s)) err(file, `supporting_proteins "${s}" is not in data/ingredients.json`);
  if (r.status !== 'complete' || r.ingredients.length === 0) continue;

  const est = estimate(r, byId);
  for (const u of est.unweighed) warn(file, `"${u}" has no weight, so it is left out of the estimate`);
  if (est.main_proteins.length === 0) warn(file, 'no main protein — flag for Jatin (CONTEXT §4)');

  const next: Recipe = structuredClone(r);
  next.main_proteins = est.main_proteins;
  const ingredientIds = new Set(r.ingredients.map((g) => g.ingredient_id));
  // Computed supporting proteins first; keep hand-added ones (e.g. an unweighed yogurt dip) after them.
  next.supporting_proteins = [...new Set([...est.supporting_proteins, ...r.supporting_proteins.filter((s) => ingredientIds.has(s))])];
  next.protein_working = est.working;
  if (r.per_portion.is_estimate) {
    next.per_portion.protein_g = est.protein_g;
    next.per_portion.kcal = est.kcal;
  }
  if (write) {
    if (!same(next, r)) writeFileSync(file, JSON.stringify(next, null, 2) + '\n');
    continue;
  }
  if (!same(next.main_proteins, r.main_proteins)) err(file, `main_proteins should be ${JSON.stringify(next.main_proteins)} by the 35 % rule`);
  if (!same(next.supporting_proteins, r.supporting_proteins)) err(file, `supporting_proteins should be ${JSON.stringify(next.supporting_proteins)}`);
  if (!same(next.protein_working, r.protein_working)) err(file, 'protein_working is out of date (run with --write)');
  if (!same(next.per_portion, r.per_portion)) err(file, `per_portion should be protein ${next.per_portion.protein_g} g, ${next.per_portion.kcal} kcal`);
  const stated = r.stated_macros;
  if (stated?.protein_g && r.per_portion.protein_g && r.servings !== null) {
    const diff = Math.abs(r.per_portion.protein_g - stated.protein_g) / stated.protein_g;
    if (diff > 0.2) warn(file, `our ${r.per_portion.protein_g} g vs creator's ${stated.protein_g} g (${stated.basis}) differ by ${Math.round(diff * 100)} % — if that is the same portion, explain the gap in assumptions`);
  }
}

console.log(`data check: ${errors} errors${write ? ' (computed fields written)' : ''}`);
process.exit(errors ? 1 : 0);
