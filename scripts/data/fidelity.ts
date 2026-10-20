// Fidelity check for every recipe that came from a raw batch (PLAN B1). Exit 1 on any mismatch.
// Needs the private raw repo, so it runs in Track B sessions, not in public CI.
// Usage: tsx scripts/data/fidelity.ts [--raw ../protein-plate-raw] [recipe-id ...]
import { canonicalUrl, linkKey } from './lib/raw';
import { makeMatcher } from './lib/dictionary';
import { checkFidelity } from './lib/fidelity';
import { arg, DEFAULT_RAW, loadDict, loadRecipes, positionals, rawEntryFor } from './load';

const rawRoot = arg('--raw') ?? DEFAULT_RAW;
const only = new Set(positionals(['--raw']));
const matcher = makeMatcher(loadDict());
let failed = 0;
let checked = 0;

for (const { file, recipe: r } of loadRecipes()) {
  if (only.size && !only.has(r.id)) continue;
  if (!r.source.ref) continue;
  checked++;
  const entry = rawEntryFor(r.source.ref, rawRoot);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (typeof entry === 'string') errors.push(entry);
  else {
    if (r.source.url && linkKey(r.source.url) !== linkKey(entry.url)) errors.push(`source.url ${r.source.url} doesn't match the raw entry's link ${entry.url}`);
    if (r.source.url && r.source.url !== canonicalUrl(r.source.url)) warnings.push(`source.url should be ${canonicalUrl(r.source.url)}`);
    const res = checkFidelity(r, entry, matcher);
    errors.push(...res.errors);
    warnings.push(...res.warnings);
  }
  for (const w of warnings) console.warn(`! ${file}: ${w}`);
  for (const e of errors) console.error(`✗ ${file}: ${e}`);
  if (errors.length) failed++;
  else console.log(`✓ ${file}`);
}

console.log(`fidelity: ${checked - failed}/${checked} recipes match their raw entry`);
process.exit(failed ? 1 : 0);
