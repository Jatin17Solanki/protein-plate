// Per-portion protein/kcal estimate, protein working lines and the 35 % main-protein rule
// (CONTEXT §4), computed from a recipe's ingredients and the dictionary. Pure.
import type { Ingredient, MainProtein, Recipe } from '../../../src/types/recipe';
import type { DictEntry } from './dictionary';

export interface Contribution {
  ingredient: Ingredient;
  entry: DictEntry;
  grams: number;
  protein: number;
  kcal: number;
}

export interface Estimate {
  /** Whole recipe ÷ servings; null when the creator doesn't say how many portions it makes (no guessing). */
  protein_g: number | null;
  kcal: number | null;
  /** Whole recipe, always available. */
  total_protein_g: number;
  total_kcal: number;
  contributions: Contribution[];
  working: string[];
  main_proteins: MainProtein[];
  /** Ingredient ids giving ≥ 10 % of the protein that are not part of a main protein. */
  supporting_proteins: string[];
  /** Ingredients that carry protein or calories but whose weight we can't work out. */
  unweighed: string[];
}

const MAIN_SHARE = 0.35;
const SUPPORT_SHARE = 0.1;

const round1 = (n: number) => Math.round(n * 10) / 10;
const fmt = (n: number) => String(round1(n));

/** Grams for one recipe ingredient: explicit `grams`, else g/kg/ml/l, else the dictionary's unit weight. */
export function gramsOf(ing: Ingredient, entry: DictEntry | undefined): number | null {
  if (typeof ing.grams === 'number') return ing.grams;
  if (ing.qty === null) return null;
  switch (ing.unit) {
    case 'g':
    case 'ml':
      return ing.qty;
    case 'kg':
    case 'l':
      return ing.qty * 1000;
  }
  const per = ing.unit ? entry?.unit_grams?.[ing.unit] : undefined;
  return per === undefined ? null : ing.qty * per;
}

export function estimate(recipe: Recipe, byId: Map<string, DictEntry>): Estimate {
  const servings = recipe.servings;
  const contributions: Contribution[] = [];
  const unweighed: string[] = [];
  for (const ing of recipe.ingredients) {
    const entry = ing.ingredient_id ? byId.get(ing.ingredient_id) : undefined;
    if (!entry) continue;
    const grams = gramsOf(ing, entry);
    if (grams === null) {
      if (entry.type !== 'spice' && (entry.protein_per_100g >= 5 || entry.kcal_per_100g >= 200)) unweighed.push(ing.item);
      continue;
    }
    contributions.push({ ingredient: ing, entry, grams, protein: (grams * entry.protein_per_100g) / 100, kcal: (grams * entry.kcal_per_100g) / 100 });
  }

  const totalProtein = contributions.reduce((s, c) => s + c.protein, 0);
  const totalKcal = contributions.reduce((s, c) => s + c.kcal, 0);

  // Main proteins: group contributions by dictionary main_protein, keep groups ≥ 35 %.
  const byGroup = new Map<MainProtein, number>();
  for (const c of contributions) {
    if (c.entry.main_protein) byGroup.set(c.entry.main_protein, (byGroup.get(c.entry.main_protein) ?? 0) + c.protein);
  }
  const main_proteins = [...byGroup.entries()]
    .filter(([, p]) => totalProtein > 0 && p / totalProtein >= MAIN_SHARE)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g);

  const supportById = new Map<string, number>();
  for (const c of contributions) {
    if (c.entry.main_protein && main_proteins.includes(c.entry.main_protein)) continue;
    supportById.set(c.entry.id, (supportById.get(c.entry.id) ?? 0) + c.protein);
  }
  const supporting_proteins = [...supportById.entries()]
    .filter(([, p]) => totalProtein > 0 && p / totalProtein >= SUPPORT_SHARE)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  // Working: one line per ingredient giving ≥ 1 g protein to the whole recipe, then the total.
  const working = contributions
    .filter((c) => c.protein >= 1)
    .sort((a, b) => b.protein - a.protein)
    .map((c) => {
      const { ingredient: ing, entry } = c;
      const weight = ing.unit === 'g' && typeof ing.grams !== 'number' ? `${fmt(c.grams)} g` : `"${ing.as_written.split(/[(,]/)[0].trim()}" ≈ ${fmt(c.grams)} g`;
      const dry = entry.basis === 'dry' ? ' dry' : '';
      return `${weight}${dry} ${entry.name} × ${entry.protein_per_100g}/100 g = ${fmt(c.protein)} g`;
    });
  if (working.length) {
    const total = `Total ≈ ${fmt(totalProtein)} g`;
    if (servings === null) working.push(`${total} for the whole recipe (portions not stated)`);
    else working.push(servings > 1 ? `${total} ÷ ${servings} portions = ${fmt(totalProtein / servings)} g per portion` : `${total} per portion`);
  }

  return {
    protein_g: servings === null ? null : Math.round(totalProtein / servings),
    kcal: servings === null ? null : Math.round(totalKcal / servings / 10) * 10,
    total_protein_g: Math.round(totalProtein),
    total_kcal: Math.round(totalKcal / 10) * 10,
    contributions,
    working,
    main_proteins,
    supporting_proteins,
    unweighed,
  };
}
