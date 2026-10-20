// Home grid logic: filter, collapse dish groups into one tile, sort by protein. Pure — no DOM.
import type { MainProtein, MealType, Recipe, Tag } from '../types/recipe';

export const PROTEINS: { key: MainProtein; label: string }[] = [
  { key: 'paneer', label: 'Paneer' },
  { key: 'soya', label: 'Soya' },
  { key: 'pulses', label: 'Pulses' },
  { key: 'tofu', label: 'Tofu' },
  { key: 'tempeh', label: 'Tempeh' },
  { key: 'whey', label: 'Whey' },
];

export const MEALS: { key: MealType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'snack', label: 'Snack' },
  { key: 'dinner', label: 'Dinner' },
];

export type QuickKey = 'quick' | 'myList' | 'global' | 'airFryer';
export const QUICK: { key: QuickKey; label: string }[] = [
  { key: 'quick', label: 'Quick' },
  { key: 'myList', label: 'My list' },
  { key: 'global', label: 'Global' },
  { key: 'airFryer', label: 'Air fryer' },
];

export const DISH_TYPES = [
  'sandwich_toast', 'salad_bowl', 'wrap_roll_taco', 'kebab_tikki_cutlet', 'chilla_pancake_omelette', 'curry_sabzi',
  'rice_pulao_biryani', 'pasta_noodles', 'chaat', 'paratha', 'pizza', 'dessert', 'sauce_dip',
] as const satisfies readonly Tag[];
export type DishType = (typeof DISH_TYPES)[number];

export interface HomeFilters {
  meal: MealType | 'all';
  proteins: MainProtein[];
  quick: QuickKey[];
}

export const NO_FILTERS: HomeFilters = { meal: 'all', proteins: [], quick: [] };

export interface Tile {
  /** Recipe the tile opens: the recipe itself, or the highest-protein version of a group. */
  id: string;
  title: string;
  tint: MainProtein;
  /** "49", "35+" (lowest of several versions), or "—" when unknown. */
  protein: string;
  meta: string;
  versions: number;
  dishType: DishType | null;
  /** Sort key: protein shown on the tile; null sorts last. */
  sortProtein: number | null;
}

function matchesQuick(r: Recipe, q: QuickKey, myList: Set<string>): boolean {
  switch (q) {
    case 'quick': return r.tags.includes('quick');
    case 'global': return r.tags.includes('global');
    case 'airFryer': return r.tags.includes('air_fryer_required') || r.tags.includes('air_fryer_optional');
    case 'myList': return myList.has(r.id);
  }
}

/** Meal: one tab. Proteins: OR within the group. Quick chips: AND (each one narrows). */
export function filterRecipes(recipes: Recipe[], f: HomeFilters, myList: Set<string> = new Set()): Recipe[] {
  return recipes.filter(
    (r) =>
      (f.meal === 'all' || r.meal_types.values.includes(f.meal)) &&
      (f.proteins.length === 0 || r.main_proteins.some((p) => f.proteins.includes(p))) &&
      f.quick.every((q) => matchesQuick(r, q, myList)),
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "soya-kebab" → "Soya kebab". */
export function groupTitle(group: string): string {
  return cap(group.replace(/-/g, ' '));
}

function proteinNames(ps: MainProtein[]): string {
  return ps.length ? cap(ps.join(' + ')) : '';
}

const byProteinDesc = (a: Recipe, b: Recipe) =>
  (b.per_portion.protein_g ?? -1) - (a.per_portion.protein_g ?? -1) || a.title.localeCompare(b.title);

function firstDishType(r: Recipe): DishType | null {
  return (r.tags.find((t) => (DISH_TYPES as readonly string[]).includes(t)) as DishType | undefined) ?? null;
}

function singleTile(r: Recipe): Tile {
  const p = r.per_portion.protein_g;
  const kcal = r.status === 'incomplete' ? 'details pending' : r.per_portion.kcal !== null ? `${Math.round(r.per_portion.kcal)} kcal` : '';
  return {
    id: r.id,
    title: r.title,
    tint: r.main_proteins[0] ?? 'soya',
    protein: p === null ? '—' : String(Math.round(p)),
    meta: [proteinNames(r.main_proteins), kcal].filter(Boolean).join(' · '),
    versions: 1,
    dishType: firstDishType(r),
    sortProtein: p,
  };
}

function groupTile(group: string, versions: Recipe[]): Tile {
  const sorted = [...versions].sort(byProteinDesc);
  const lead = sorted[0];
  const proteins = sorted.map((r) => r.per_portion.protein_g).filter((p): p is number => p !== null);
  const kcals = sorted.map((r) => r.per_portion.kcal).filter((k): k is number => k !== null);
  const low = proteins.length ? Math.round(Math.min(...proteins)) : null;
  const kcal = kcals.length ? `~${Math.round(kcals.reduce((a, b) => a + b, 0) / kcals.length)} kcal` : '';
  return {
    id: lead.id,
    title: groupTitle(group),
    tint: lead.main_proteins[0] ?? 'soya',
    protein: low === null ? '—' : `${low}+`,
    meta: [proteinNames(lead.main_proteins.slice(0, 1)), kcal].filter(Boolean).join(' · '),
    versions: versions.length,
    dishType: firstDishType(lead),
    sortProtein: low,
  };
}

/** One tile per recipe, except versions of a dish group (among the given recipes) share one tile. */
export function toTiles(recipes: Recipe[]): Tile[] {
  const groups = new Map<string, Recipe[]>();
  const tiles: Tile[] = [];
  for (const r of recipes) {
    if (r.dish_group) groups.set(r.dish_group, [...(groups.get(r.dish_group) ?? []), r]);
    else tiles.push(singleTile(r));
  }
  for (const [group, versions] of groups) {
    tiles.push(versions.length === 1 ? singleTile(versions[0]) : groupTile(group, versions));
  }
  return tiles.sort(
    (a, b) => (b.sortProtein ?? -1) - (a.sortProtein ?? -1) || a.title.localeCompare(b.title),
  );
}
