// Canonical ingredient dictionary (data/ingredients.json) and the alias matcher used by the
// fidelity and dedupe checks. Pure, so the Add recipes screen (A7) can reuse it.
import type { MainProtein } from '../../../src/types/recipe';

export type IngredientType = 'protein' | 'dairy' | 'grain' | 'produce' | 'spice' | 'pantry' | 'sauce';
export type Basis = 'dry' | 'cooked' | 'as_sold';

export interface DictEntry {
  id: string;
  name: string;
  /** Lower-case names as they appear in captions (English, Hindi, Hinglish). Plurals match automatically. */
  aliases: string[];
  type: IngredientType;
  protein_per_100g: number;
  kcal_per_100g: number;
  /** What the per-100 g values refer to: dry (dal, soya), cooked, or as sold (paneer, curd). */
  basis: Basis;
  /** Filterable main-protein group this ingredient counts towards, or null (supporting only). */
  main_protein: MainProtein | null;
  /** Grams per spoon/cup/piece, used when a recipe ingredient has no `grams`. */
  unit_grams?: Partial<Record<string, number>>;
  note?: string;
}

export interface Match {
  id: string;
  alias: string;
  index: number;
}

const TYPES: IngredientType[] = ['protein', 'dairy', 'grain', 'produce', 'spice', 'pantry', 'sauce'];
const BASES: Basis[] = ['dry', 'cooked', 'as_sold'];
const MAIN: MainProtein[] = ['paneer', 'soya', 'tofu', 'tempeh', 'pulses', 'whey'];

/** Structural checks for the dictionary itself. Returns readable errors; empty = valid. */
export function checkDictionary(dict: DictEntry[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const aliases = new Map<string, string>();
  for (const d of dict) {
    const at = d.id ?? '(no id)';
    if (!/^[a-z0-9]+(_[a-z0-9]+)*$/.test(d.id)) errors.push(`${at}: id must be snake_case`);
    if (ids.has(d.id)) errors.push(`${at}: duplicate id`);
    ids.add(d.id);
    if (!d.name) errors.push(`${at}: name is empty`);
    if (!Array.isArray(d.aliases) || d.aliases.length === 0) errors.push(`${at}: needs at least one alias`);
    for (const a of d.aliases ?? []) {
      if (a !== a.toLowerCase()) errors.push(`${at}: alias "${a}" must be lower-case`);
      const other = aliases.get(a);
      if (other) errors.push(`${at}: alias "${a}" is also used by ${other}`);
      aliases.set(a, d.id);
    }
    if (!TYPES.includes(d.type)) errors.push(`${at}: type must be one of ${TYPES.join(', ')}`);
    if (!BASES.includes(d.basis)) errors.push(`${at}: basis must be one of ${BASES.join(', ')}`);
    if (d.main_protein !== null && !MAIN.includes(d.main_protein)) errors.push(`${at}: main_protein must be one of ${MAIN.join(', ')} or null`);
    for (const k of ['protein_per_100g', 'kcal_per_100g'] as const) {
      if (typeof d[k] !== 'number' || d[k] < 0 || d[k] > 900) errors.push(`${at}: ${k} must be a number 0–900`);
    }
    if (d.protein_per_100g > 100) errors.push(`${at}: protein_per_100g over 100`);
  }
  return errors;
}

/** Lower-case, strip emoji and punctuation noise, collapse spaces. Used on both sides of every comparison. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}\u{20E3}]/gu, ' ')
    .replace(/[\u200B\u200C\u2060\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface Matcher {
  /** Every dictionary ingredient named in the text; longer aliases win ("cumin powder" over "cumin"). */
  find(text: string): Match[];
  byId: Map<string, DictEntry>;
}

export function makeMatcher(dict: DictEntry[]): Matcher {
  const all = dict
    .flatMap((d) => d.aliases.map((alias) => ({ id: d.id, alias })))
    .sort((a, b) => b.alias.length - a.alias.length);
  const patterns = all.map((a) => ({ ...a, re: new RegExp(`(?<![\\p{L}\\p{N}])${escape(a.alias)}(?:e?s)?(?![\\p{L}\\p{N}])`, 'gu') }));
  return {
    byId: new Map(dict.map((d) => [d.id, d])),
    find(text: string): Match[] {
      const t = normalizeText(text);
      const taken = new Array<boolean>(t.length).fill(false);
      const out: Match[] = [];
      for (const p of patterns) {
        for (const m of t.matchAll(p.re)) {
          const start = m.index!;
          const end = start + m[0].length;
          if (taken.slice(start, end).some(Boolean)) continue;
          for (let i = start; i < end; i++) taken[i] = true;
          out.push({ id: p.id, alias: p.alias, index: start });
        }
      }
      return out.sort((a, b) => a.index - b.index);
    },
  };
}
