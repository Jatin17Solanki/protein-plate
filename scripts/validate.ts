// Validates every recipe file. Exit code 1 on any error, so CI blocks the deploy.
// Usage: tsx scripts/validate.ts [dir ...]   (default: data/recipes)
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkCatalog } from '../src/lib/validate';

const dirs = process.argv.slice(2).length ? process.argv.slice(2) : ['data/recipes'];
let failed = false;

for (const dir of dirs) {
  if (!existsSync(dir)) {
    console.error(`✗ ${dir} does not exist`);
    failed = true;
    continue;
  }
  const files: { file: string; data: unknown }[] = [];
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const file = join(dir, name);
    try {
      files.push({ file, data: JSON.parse(readFileSync(file, 'utf8')) });
    } catch (e) {
      console.error(`✗ ${file}: not valid JSON — ${(e as Error).message}`);
      failed = true;
    }
  }
  const { errors, warnings, recipes } = checkCatalog(files);
  for (const w of warnings) console.warn(`! ${w.file}: ${w.message}`);
  for (const e of errors) console.error(`✗ ${e.file}: ${e.message}`);
  if (errors.length) failed = true;
  console.log(`${dir}: ${recipes.length}/${files.length} valid, ${errors.length} errors, ${warnings.length} warnings`);
}

process.exit(failed ? 1 : 0);
