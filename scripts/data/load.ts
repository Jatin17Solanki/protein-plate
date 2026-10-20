// File loading shared by the Track B CLIs (node only; the lib/ modules stay pure).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Recipe } from '../../src/types/recipe';
import type { DictEntry } from './lib/dictionary';
import { parseBatch, type RawEntry } from './lib/raw';

export const RECIPES_DIR = 'data/recipes';
export const DICT_FILE = 'data/ingredients.json';
/** The private raw repo, cloned next to this one in Track B sessions. Override with --raw <dir>. */
export const DEFAULT_RAW = '../protein-plate-raw';

export function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** Positional args (not flags or flag values). */
export function positionals(flagsWithValue: string[]): string[] {
  const out: string[] = [];
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (flagsWithValue.includes(argv[i])) i++;
    else if (!argv[i].startsWith('--')) out.push(argv[i]);
  }
  return out;
}

export function loadDict(): DictEntry[] {
  return JSON.parse(readFileSync(DICT_FILE, 'utf8'));
}

export function loadRecipes(dir = RECIPES_DIR): { file: string; recipe: Recipe }[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ file: join(dir, f), recipe: JSON.parse(readFileSync(join(dir, f), 'utf8')) as Recipe }));
}

const batches = new Map<string, RawEntry[]>();

/** Resolve `source.ref` ("batches/<file>.txt#12") to its raw entry, or explain why not. */
export function rawEntryFor(ref: string, rawRoot: string): RawEntry | string {
  const m = ref.match(/^(.+)#(\d+)$/);
  if (!m) return `source.ref "${ref}" is not "<batch file>#<entry>"`;
  const path = join(rawRoot, m[1]);
  if (!batches.has(path)) {
    if (!existsSync(path)) return `raw batch ${path} not found (attach protein-plate-raw, or pass --raw <dir>)`;
    batches.set(path, parseBatch(readFileSync(path, 'utf8')));
  }
  const entry = batches.get(path)![Number(m[2]) - 1];
  return entry ?? `${m[1]} has no entry #${m[2]}`;
}
