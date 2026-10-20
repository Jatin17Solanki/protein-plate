// Recipe page logic (pure): quantities, versions, ingredient sections, tag chips, macro footnote.
import type { Ingredient, Recipe } from '../types/recipe';
import { DISH_LABELS, DISH_TYPES, groupTitle, MEALS, type DishType } from './home';

const FRACTIONS: [number, string][] = [[0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']];

/** 0.5 → "½", 1.5 → "1.5", 2 → "2". */
export function formatNumber(n: number): string {
  if (n > 0 && n < 1) {
    const f = FRACTIONS.find(([v]) => Math.abs(v - n) < 0.01);
    if (f) return f[1];
  }
  return String(Math.round(n * 100) / 100);
}

const UNIT_TEXT: Record<string, (n: number) => string> = {
  g: () => 'g', kg: () => 'kg', ml: () => 'ml', l: () => 'l', tsp: () => 'tsp', tbsp: () => 'tbsp',
  cup: (n) => (n > 1 ? 'cups' : 'cup'), slice: (n) => (n > 1 ? 'slices' : 'slice'),
  clove: (n) => (n > 1 ? 'cloves' : 'clove'), pinch: () => 'pinch', handful: () => 'handful', piece: () => '',
};

/** Right-hand quantity on an ingredient row: "40 g", "½ cup", "1", "to taste", "handful". */
export function formatQty(i: Ingredient): string {
  if (i.unit === 'to_taste') return 'to taste';
  if (i.qty === null) return i.unit && i.unit !== 'piece' ? UNIT_TEXT[i.unit](1) : '';
  const unit = i.unit ? UNIT_TEXT[i.unit](i.qty) : '';
  return [formatNumber(i.qty), unit].filter(Boolean).join(' ');
}

export interface IngredientGroup {
  section: string | null;
  items: { ingredient: Ingredient; index: number }[];
}

/** Groups by `section` in first-seen order; unsectioned ingredients come first as the main card. */
export function groupIngredients(ingredients: Ingredient[]): IngredientGroup[] {
  const groups: IngredientGroup[] = [];
  ingredients.forEach((ingredient, index) => {
    const section = ingredient.section?.trim() || null;
    let g = groups.find((x) => x.section === section);
    if (!g) {
      g = { section, items: [] };
      if (section === null) groups.unshift(g);
      else groups.push(g);
    }
    g.items.push({ ingredient, index });
  });
  return groups;
}

/** All versions in the recipe's dish group (incl. itself), highest protein first; [] if not grouped. */
export function versionsOf(r: Recipe, all: Recipe[]): Recipe[] {
  if (!r.dish_group) return [];
  return all
    .filter((x) => x.dish_group === r.dish_group)
    .sort((a, b) => (b.per_portion.protein_g ?? -1) - (a.per_portion.protein_g ?? -1) || a.title.localeCompare(b.title));
}

/** Header context: "Soya kebab · version 1 of 6", or null for a single recipe. */
export function versionLine(r: Recipe, versions: Recipe[]): string | null {
  if (versions.length < 2) return null;
  return `${groupTitle(r.dish_group!)} · version ${versions.indexOf(r) + 1} of ${versions.length}`;
}

/** Chips under the title (after the protein chip): dish types, meals, air fryer, quick, global. */
export function tagChips(r: Recipe): string[] {
  const chips = r.tags
    .filter((t): t is DishType => (DISH_TYPES as readonly string[]).includes(t))
    .map((t) => DISH_LABELS[t].long);
  const meals = MEALS.filter((m) => m.key !== 'all' && r.meal_types.values.includes(m.key)).map((m) => m.label);
  if (meals.length) chips.push(meals.join(' · '));
  if (r.tags.includes('air_fryer_required')) chips.push('Air fryer');
  if (r.tags.includes('air_fryer_optional')) chips.push('Air fryer · optional');
  if (r.tags.includes('quick')) chips.push('Quick');
  if (r.tags.includes('global')) chips.push('Global');
  return chips;
}

/** Footnote under the macro band: where the numbers come from. */
export function macroFootnote(r: Recipe): string {
  const p = r.per_portion;
  const s = r.stated_macros;
  const parts: string[] = [];
  if (!p.is_estimate) parts.push('Protein and kcal as stated by the creator.');
  else if (s && s.protein_g !== null) parts.push(`Our estimate; the creator says ${formatNumber(s.protein_g)} g protein${s.kcal !== null ? ` and ${formatNumber(s.kcal)} kcal` : ''} (${s.basis}).`);
  else parts.push('Protein and kcal are our estimate.');
  const unknown = (['carbs_g', 'fat_g', 'fibre_g'] as const).filter((k) => p[k] === null).map((k) => k.replace('_g', ''));
  if (unknown.length === 3) parts.push('Carbs, fat and fibre not known.');
  else if (unknown.length) parts.push(`${unknown.join(' and ').replace(/^./, (c) => c.toUpperCase())} not known.`);
  return parts.join(' ');
}
