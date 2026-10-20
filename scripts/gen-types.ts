// Generates src/types/recipe.ts from schema/recipe.schema.json.
// `--check` fails if the committed file is out of date (run in CI).
import { readFileSync, writeFileSync } from 'node:fs';
import { compile } from 'json-schema-to-typescript';

const SCHEMA = 'schema/recipe.schema.json';
const OUT = 'src/types/recipe.ts';

const schema = JSON.parse(readFileSync(SCHEMA, 'utf8'));
const ts = await compile(schema, 'Recipe', {
  bannerComment: `/* Generated from ${SCHEMA} by scripts/gen-types.ts — do not edit. Run \`npm run gen:types\`. */`,
  additionalProperties: false,
  maxItems: -1,
  style: { singleQuote: true },
});

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(OUT, 'utf8'); } catch {}
  if (current !== ts) {
    console.error(`${OUT} is out of date. Run: npm run gen:types`);
    process.exit(1);
  }
  console.log(`${OUT} is up to date.`);
} else {
  writeFileSync(OUT, ts);
  console.log(`Wrote ${OUT}`);
}
