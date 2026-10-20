// Possible duplicates / variants report (CONTEXT §4). Never deletes or edits anything.
// Usage: tsx scripts/data/dedupe.ts [--batch <raw batch file>] [--out report.md]
//   --batch also lists raw entries whose link is already in the catalog (for B2/B3 batches).
import { readFileSync, writeFileSync } from 'node:fs';
import { findPairs } from './lib/dedupe';
import { linkKey, parseBatch } from './lib/raw';
import { arg, loadRecipes } from './load';

const recipes = loadRecipes().map((x) => x.recipe);
const pairs = findPairs(recipes);
const out: string[] = [`# Possible duplicates / variants — ${recipes.length} recipes`, ''];

const label = { same_link: 'Same link (duplicate)', same_creator_title: 'Same creator, similar title', ingredient_overlap: 'Ingredient overlap + same main protein', possible_variant: 'Same dish type + main protein, partial overlap (variant?)' };
const fresh = pairs.filter((p) => !p.same_group);
const known = pairs.filter((p) => p.same_group);
out.push('## To confirm (duplicate, variant → dish_group, or unrelated)', '');
if (!fresh.length) out.push('None.', '');
for (const p of fresh) out.push(`- **${p.a}** ↔ **${p.b}** — ${label[p.layer]} (${Math.round(p.score * 100)} %): ${p.detail}`);
out.push('', '## Already grouped as variants', '');
if (!known.length) out.push('None.', '');
for (const p of known) out.push(`- ${p.a} ↔ ${p.b} — ${label[p.layer]} (${Math.round(p.score * 100)} %)`);

const batch = arg('--batch');
if (batch) {
  const byLink = new Map(recipes.filter((r) => r.source.url).map((r) => [linkKey(r.source.url!), r.id]));
  const entries = parseBatch(readFileSync(batch, 'utf8'));
  const seen = new Map<string, number>();
  out.push('', `## ${batch}: ${entries.length} entries`, '');
  let any = false;
  for (const e of entries) {
    const k = linkKey(e.url);
    if (byLink.has(k)) { any = true; out.push(`- #${e.n} is already in the catalog as **${byLink.get(k)}**`); }
    if (seen.has(k)) { any = true; out.push(`- #${e.n} repeats #${seen.get(k)} (same link)`); }
    seen.set(k, e.n);
  }
  if (!any) out.push('No entry repeats a catalog link or another entry.');
}

const text = out.join('\n') + '\n';
const file = arg('--out');
if (file) writeFileSync(file, text);
console.log(text);
