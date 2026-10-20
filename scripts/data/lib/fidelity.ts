// Fidelity check (PLAN B1): normalisation must never change the recipe.
// Compares one normalised recipe with its raw entry. Pure, so A7 can reuse it.
//
// Errors:
//  - a number in the raw entry (quantity, minutes, °C, macros, servings) is absent from the recipe
//  - a number in the recipe's steps / as_written / title is absent from the raw entry
//  - an `as_written` is not the source's exact wording
//  - an ingredient `qty` is not a number from its own `as_written`
//  - a dictionary ingredient named in the raw entry is neither an ingredient nor mentioned in steps
//  - an `ingredient_id` doesn't match its `as_written` / `item`
// Anything deliberately different is waived by saying so in `assumptions[]` (numbers and names there count).
import type { Recipe } from '../../../src/types/recipe';
import { normalizeText, type Matcher } from './dictionary';
import type { RawEntry } from './raw';

export interface FidelityResult {
  errors: string[];
  warnings: string[];
}

const FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667, '⅛': 0.125 };
const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, half: 0.5,
};

const key = (n: number) => String(Math.round(n * 1000) / 1000);

/** Text with links, @handles and leading list numbers ("3. ") removed, so they don't count as quantities. */
export function stripNoise(line: string): string {
  return line
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/@[\w.]+/g, ' ')
    .replace(/^\s*\d{1,2}[.)]\s+/, ' ');
}

/** Every number in a piece of text: 4–5 → 4, 5 · 1/2 → 0.5 · 1½ → 1.5 · "two" → 2. */
export function numbersIn(text: string): Set<string> {
  const out = new Set<string>();
  let t = text.normalize('NFC');
  t = t.replace(/(\d+)\s*([½¼¾⅓⅔⅛])/g, (_, w: string, f: string) => ` ${Number(w) + FRACTIONS[f]} `);
  t = t.replace(/[½¼¾⅓⅔⅛]/g, (f) => ` ${FRACTIONS[f]} `);
  t = t.replace(/(\d+)\s*\/\s*(\d+)/g, (_, a: string, b: string) => ` ${Number(a) / Number(b)} `);
  for (const m of t.matchAll(/\d+(?:\.\d+)?/g)) out.add(key(Number(m[0])));
  for (const m of t.toLowerCase().matchAll(/\b[a-z]+\b/g)) if (m[0] in WORDS) out.add(key(WORDS[m[0]]));
  return out;
}

function numbersOfLines(lines: string[]): Set<string> {
  const out = new Set<string>();
  for (const l of lines) for (const n of numbersIn(stripNoise(l))) out.add(n);
  return out;
}

/** Recipe text that must carry every raw number (our estimates and working excluded). */
function recipeLines(r: Recipe): string[] {
  const s = r.stated_macros;
  return [
    r.title,
    r.variant_label ?? '',
    r.servings === null ? '' : String(r.servings),
    s ? [s.basis, s.protein_g, s.kcal, s.carbs_g, s.fat_g].filter((v) => v !== null && v !== undefined).join(' ') : '',
    ...r.ingredients.flatMap((i) => [i.as_written, i.item, i.qty === null ? '' : String(i.qty)]),
    ...r.steps,
    ...r.assumptions,
    ...r.missing,
  ];
}

export function checkFidelity(r: Recipe, raw: RawEntry, matcher: Matcher): FidelityResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = raw.content.filter((l) => !/^recipe by\s+@/i.test(l));

  // Link-only or title-only entries: kept as incomplete placeholders, nothing to compare yet.
  const placeholder = r.ingredients.length === 0 && r.steps.length === 0;
  if (content.length <= 1 || placeholder) {
    if (r.status !== 'incomplete') errors.push('raw entry has no recipe text, so the recipe must be status "incomplete"');
    if (!placeholder) errors.push('raw entry has no recipe text but the recipe has ingredients or steps');
    if (placeholder && content.length > 1) errors.push('raw entry has recipe text but the recipe has no ingredients or steps');
    return { errors, warnings };
  }

  // 1. Every raw number is kept somewhere in the recipe.
  const rawNums = numbersOfLines(content);
  const recipeNums = numbersOfLines(recipeLines(r));
  for (const line of content) {
    const missingHere = [...numbersIn(stripNoise(line))].filter((n) => !recipeNums.has(n));
    if (missingHere.length) errors.push(`source number(s) ${missingHere.join(', ')} not in the recipe — "${line.slice(0, 90)}"`);
  }

  // 2. Nothing added: numbers in our steps / wording must come from the source (or be explained).
  const allowed = new Set([...rawNums, ...numbersOfLines(r.assumptions)]);
  const ours: [string, string][] = [
    ['title', r.title],
    ['variant_label', r.variant_label ?? ''],
    ...r.steps.map((s, i) => [`steps[${i}]`, s] as [string, string]),
    ...r.ingredients.map((g, i) => [`ingredients[${i}].as_written`, g.as_written] as [string, string]),
  ];
  for (const [where, text] of ours) {
    const extra = [...numbersIn(text)].filter((n) => !allowed.has(n));
    if (extra.length) errors.push(`${where} has number(s) ${extra.join(', ')} that are not in the source — "${text.slice(0, 90)}"`);
  }

  // 3–4. as_written is the source's wording; qty comes from it.
  const rawText = normalizeText(content.join(' \n '));
  r.ingredients.forEach((g, i) => {
    const aw = normalizeText(g.as_written);
    if (!rawText.includes(aw)) errors.push(`ingredients[${i}].as_written "${g.as_written}" is not the source's exact wording`);
    if (g.qty !== null) {
      const nums = numbersIn(g.as_written);
      const implicitOne = g.qty === 1 && (nums.size === 0 || /\b(a|an)\b/i.test(g.as_written));
      if (!nums.has(key(g.qty)) && !implicitOne) errors.push(`ingredients[${i}].qty ${g.qty} is not a number in "${g.as_written}"`);
    }
  });

  // 5. No ingredient dropped: every dictionary ingredient the source names is in the recipe.
  const ids = new Set(r.ingredients.map((g) => g.ingredient_id).filter(Boolean));
  const mentioned = new Set(matcher.find([...r.steps, ...r.assumptions, ...r.missing].join(' \n ')).map((m) => m.id));
  const reported = new Set<string>();
  for (const m of matcher.find(content.join(' \n '))) {
    if (ids.has(m.id) || mentioned.has(m.id) || reported.has(m.id)) continue;
    reported.add(m.id);
    errors.push(`source mentions "${m.alias}" (${m.id}) but it is not an ingredient, a step or an assumption`);
  }

  // 6. ingredient_id agrees with the wording.
  r.ingredients.forEach((g, i) => {
    if (g.ingredient_id === null) {
      warnings.push(`ingredients[${i}] "${g.item}" has no ingredient_id (add it to data/ingredients.json)`);
      return;
    }
    if (!matcher.byId.has(g.ingredient_id)) return; // reported by the dictionary check
    const found = matcher.find(`${g.as_written} \n ${g.item}`).map((m) => m.id);
    if (!found.includes(g.ingredient_id)) {
      errors.push(`ingredients[${i}].ingredient_id "${g.ingredient_id}" doesn't match "${g.as_written}" / "${g.item}" (add an alias?)`);
    }
  });

  return { errors, warnings };
}
