// Raw-vs-normalised review sheet for Jatin (PLAN B1). It quotes the raw captions, so write it
// into the PRIVATE raw repo, never into this public one.
// Usage: tsx scripts/data/review.ts --out ../protein-plate-raw/reviews/<name>.md [--raw <dir>] [recipe-id ...]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { makeMatcher } from './lib/dictionary';
import { checkFidelity } from './lib/fidelity';
import { arg, DEFAULT_RAW, loadDict, loadRecipes, positionals, rawEntryFor } from './load';

const out = arg('--out');
const rawRoot = arg('--raw') ?? DEFAULT_RAW;
if (!out) {
  console.error('--out <file> is required (inside the private raw repo)');
  process.exit(1);
}
if (!resolve(out).startsWith(resolve(rawRoot))) {
  console.error(`refusing to write raw captions outside ${rawRoot}`);
  process.exit(1);
}
const only = new Set(positionals(['--out', '--raw']));
const matcher = makeMatcher(loadDict());
const cell = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v).replace(/\|/g, '\\|'));
const md: string[] = [];
const entryNo = (ref: string) => Number(ref.split('#').pop());
const recipes = loadRecipes()
  .map((x) => x.recipe)
  .filter((r) => r.source.ref && (!only.size || only.has(r.id)))
  .sort((a, b) => entryNo(a.source.ref!) - entryNo(b.source.ref!));

md.push(`# Review: ${recipes.length} normalised recipes`, '');
md.push('Each recipe: the raw entry, then the normalised fields. Jatin\'s notes are shown but never stored on a recipe.', '');
md.push('| # | Recipe | Main | Protein / portion (ours · creator) | Fidelity |', '|---|---|---|---|---|');
const sections: string[] = [];

for (const r of recipes) {
  const entry = rawEntryFor(r.source.ref!, rawRoot);
  if (typeof entry === 'string') {
    md.push(`| ? | ${r.id} | — | — | ✗ ${entry} |`);
    continue;
  }
  const fid = checkFidelity(r, entry, matcher);
  const ours = r.per_portion.protein_g === null ? '—' : `${r.per_portion.protein_g} g`;
  const theirs = r.stated_macros?.protein_g == null ? '—' : `${r.stated_macros.protein_g} g (${r.stated_macros.basis})`;
  md.push(`| ${entry.n} | [${r.title}](#${r.id}) | ${r.main_proteins.join(', ') || '—'} | ${ours} · ${theirs} | ${fid.errors.length ? `✗ ${fid.errors.length}` : '✓'} |`);

  const s: string[] = [];
  s.push(`---`, '', `## ${r.title}`, '', `<a id="${r.id}"></a>\`${r.id}\` · entry #${entry.n}${entry.section ? ` (section: ${entry.section})` : ''} · [video](${r.source.url}) · status **${r.status}**`, '');
  s.push('### Raw', '', '```text', ...entry.lines.map((l) => l.trimEnd()).join('\n').trim().split('\n'), '```', '');
  if (r.ingredients.length) {
    s.push('### Ingredients', '', '| Source wording | Item | Qty | Unit | g est. | Dictionary id | Type |', '|---|---|---|---|---|---|---|');
    for (const g of r.ingredients) {
      s.push(`| ${cell(g.as_written)} | ${cell(g.item)}${g.optional ? ' (optional)' : ''} | ${cell(g.qty)} | ${cell(g.unit)} | ${cell(g.grams)} | ${cell(g.ingredient_id)} | ${g.type} |`);
    }
    s.push('');
  }
  if (r.steps.length) s.push('### Steps (our words)', '', ...r.steps.map((x, i) => `${i + 1}. ${x}`), '');
  s.push('### Classification', '');
  s.push(`- Meal types: ${r.meal_types.values.join(', ') || '—'}${r.meal_types.stated_by_user.length ? ` (stated by Jatin: ${r.meal_types.stated_by_user.join(', ')})` : ' (all inferred)'}`);
  s.push(`- Main proteins: ${r.main_proteins.join(', ') || '—'} · supporting: ${r.supporting_proteins.join(', ') || '—'}`);
  s.push(`- Tags: ${r.tags.join(', ') || '—'}`);
  s.push(`- Dish group: ${r.dish_group ? `${r.dish_group} — "${r.variant_label}"` : '—'}`);
  s.push(`- Servings: ${r.servings ?? '—'} · creator: ${r.source.creator ?? '—'}`, '');
  s.push('### Nutrition', '');
  s.push(`- Ours: ${ours}, ${r.per_portion.kcal ?? '—'} kcal per portion${r.per_portion.is_estimate ? ' (estimate)' : ''}`);
  s.push(`- Creator: ${r.stated_macros ? `${r.stated_macros.protein_g ?? '—'} g protein, ${r.stated_macros.kcal ?? '—'} kcal (${r.stated_macros.basis})` : '—'}`);
  for (const w of r.protein_working) s.push(`  - ${w}`);
  s.push('');
  if (r.assumptions.length) s.push('### Assumptions', '', ...r.assumptions.map((a) => `- ${a}`), '');
  if (r.missing.length) s.push('### Missing', '', ...r.missing.map((a) => `- ${a}`), '');
  s.push('### Fidelity check', '', ...(fid.errors.length ? fid.errors.map((e) => `- ✗ ${e}`) : ['- ✓ every source number and ingredient is accounted for; nothing added']), ...fid.warnings.map((w) => `- ! ${w}`), '');
  sections.push(...s);
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, [...md, '', ...sections].join('\n'));
console.log(`wrote ${out}`);
