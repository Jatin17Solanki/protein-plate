// Data checks that need no raw files (safe for public CI):
//  - data/ingredients.json is well formed
//  - every ingredient_id / supporting protein exists in the dictionary
//  - per_portion holds the creator's own numbers (stated_macros) when servings are stated, never our estimate
//    (Jatin, 2026-10-20); otherwise it is empty and the app shows stated_macros as "whole recipe"
//  - main_proteins / supporting_proteins follow the 35 % / 10 % rule (CONTEXT §4), using the dictionary
//    estimate behind the scenes — the only place the estimate is used
//  - flags[] lists what Jatin must look at: no_macros, macros_basis_unclear, missing_details and no_main_protein are set
//    automatically; source_conflict / other are added by hand and kept
// Usage: tsx scripts/data/check.ts [--write]   (--write fills those computed fields in place)
import { writeFileSync } from 'node:fs';
import type { Flag, Recipe } from '../../src/types/recipe';
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
const AUTO = new Set<Flag['code']>(['no_macros', 'macros_basis_unclear', 'missing_details', 'no_main_protein']);
/** Old missing[] lines that are now flags instead. */
const NOW_FLAGS = [/^Macros: the creator gives none/, /^Servings: the caption doesn't say/, /^Servings$/, /^Servings and macros$/];
const flagged = new Map<string, string[]>();

function autoFlags(r: Recipe): Flag[] {
  const flags: Flag[] = [];
  const s = r.stated_macros;
  if (s === null) flags.push({ code: 'no_macros', note: 'The creator gives no macros.' });
  else if (r.servings === null) flags.push({ code: 'macros_basis_unclear', note: `The creator's numbers are "${s.basis}", and the caption doesn't say how many portions that is.` });
  if (r.missing.length) flags.push({ code: 'missing_details', note: r.missing.join('; ') });
  if (r.main_proteins.length === 0) flags.push({ code: 'no_main_protein', note: 'No protein source reaches 35 % of the protein (CONTEXT §4), so it has no main protein.' });
  return flags;
}

for (const { file, recipe: r } of loadRecipes()) {
  r.ingredients.forEach((g, i) => {
    if (g.ingredient_id && !byId.has(g.ingredient_id)) err(file, `ingredients[${i}].ingredient_id "${g.ingredient_id}" is not in data/ingredients.json`);
    const d = g.ingredient_id ? byId.get(g.ingredient_id) : undefined;
    if (d && d.type !== g.type) warn(file, `ingredients[${i}] type "${g.type}" differs from the dictionary's "${d.type}"`);
  });
  for (const s of r.supporting_proteins) if (!byId.has(s)) err(file, `supporting_proteins "${s}" is not in data/ingredients.json`);

  const next: Recipe = structuredClone(r);
  next.missing = r.missing.filter((m) => !NOW_FLAGS.some((re) => re.test(m)));
  // Creator's numbers, as stated; nothing of ours. Without a portion count they stay in stated_macros only
  // (the app shows them as "whole recipe").
  const s = r.servings === null ? null : r.stated_macros;
  next.per_portion = {
    protein_g: s?.protein_g ?? null,
    kcal: s?.kcal ?? null,
    carbs_g: s?.carbs_g ?? null,
    fat_g: s?.fat_g ?? null,
    fibre_g: null,
    is_estimate: false,
  };
  next.protein_working = [];
  if (r.status === 'complete' && r.ingredients.length) {
    const est = estimate(r, byId);
    next.main_proteins = est.main_proteins;
    const ingredientIds = new Set(r.ingredients.map((g) => g.ingredient_id));
    // Computed supporting proteins first; keep hand-added ones (e.g. an unweighed yogurt dip) after them.
    next.supporting_proteins = [...new Set([...est.supporting_proteins, ...r.supporting_proteins.filter((x) => ingredientIds.has(x))])];
  }
  const manual = (r.flags ?? []).filter((f) => !AUTO.has(f.code));
  next.flags = [...autoFlags(next), ...manual];
  if (next.flags.length) flagged.set(r.id, next.flags.map((f) => f.code));

  if (write) {
    if (!same(next, r)) writeFileSync(file, JSON.stringify(next, null, 2) + '\n');
    continue;
  }
  if (!same(next.main_proteins, r.main_proteins)) err(file, `main_proteins should be ${JSON.stringify(next.main_proteins)} by the 35 % rule`);
  if (!same(next.supporting_proteins, r.supporting_proteins)) err(file, `supporting_proteins should be ${JSON.stringify(next.supporting_proteins)}`);
  if (!same(next.per_portion, r.per_portion)) err(file, 'per_portion must be the creator\'s stated numbers (run with --write)');
  if (r.protein_working.length) err(file, 'protein_working must be empty — we show no estimates');
  if (!same(next.missing, r.missing) || !same(next.flags, r.flags ?? [])) err(file, 'flags/missing are out of date (run with --write)');
}

console.log(`flagged for Jatin: ${flagged.size} recipes`);
for (const [id, codes] of flagged) console.log(`  ${id}: ${codes.join(', ')}`);
console.log(`data check: ${errors} errors${write ? ' (computed fields written)' : ''}`);
process.exit(errors ? 1 : 0);
