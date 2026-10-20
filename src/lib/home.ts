// Home grid logic: filters, live counts, collapsing dish groups into one tile, sorting, summary line.
// Pure — no DOM. Filters are OR within a group and AND across groups (DESIGN §6).
import type { MainProtein, MealType, Recipe, Tag } from '../types/recipe';

export const PROTEINS: { key: MainProtein; label: string }[] = [
  { key: 'paneer', label: 'Paneer' },
  { key: 'soya', label: 'Soya' },
  { key: 'pulses', label: 'Pulses' },
  { key: 'tofu', label: 'Tofu' },
  { key: 'tempeh', label: 'Tempeh' },
  { key: 'whey', label: 'Whey' },
  // Not really high-protein (puddings, sorbets…): neutral colour, listed last (Jatin, 2026-10-20).
  { key: 'other', label: 'Others' },
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

/** short = filter grid, long = desktop sidebar. Order = filter grid order (first 8 shown). */
export const DISH_LABELS: Record<DishType, { short: string; long: string }> = {
  sandwich_toast: { short: 'Sandwich', long: 'Sandwich / toast' },
  salad_bowl: { short: 'Salad', long: 'Salad / bowl' },
  wrap_roll_taco: { short: 'Wrap', long: 'Wrap / roll' },
  kebab_tikki_cutlet: { short: 'Kebab', long: 'Kebab / tikki' },
  chilla_pancake_omelette: { short: 'Chilla', long: 'Chilla / pancake' },
  curry_sabzi: { short: 'Curry', long: 'Curry' },
  rice_pulao_biryani: { short: 'Rice', long: 'Rice' },
  pasta_noodles: { short: 'Pasta', long: 'Pasta / noodles' },
  chaat: { short: 'Chaat', long: 'Chaat' },
  paratha: { short: 'Paratha', long: 'Paratha' },
  pizza: { short: 'Pizza', long: 'Pizza' },
  dessert: { short: 'Dessert', long: 'Dessert' },
  sauce_dip: { short: 'Sauce', long: 'Sauce / dip' },
};

export type SortKey = 'protein' | 'kcal';

export interface Filters {
  meal: MealType | 'all';
  proteins: MainProtein[];
  dishTypes: DishType[];
  quick: QuickKey[];
  showDisliked: boolean;
  sort: SortKey;
}

export const NO_FILTERS: Filters = { meal: 'all', proteins: [], dishTypes: [], quick: [], showDisliked: false, sort: 'protein' };

/** Personal data that affects filtering (from browser storage). */
export interface Personal {
  myList: Set<string>;
  disliked: Set<string>;
}

export const NO_PERSONAL: Personal = { myList: new Set(), disliked: new Set() };

/** What search found for one recipe: title hit, and the ingredient to show as "uses …". */
export interface Hit {
  nameMatch: boolean;
  uses: string | null;
}

/**
 * Tile/page colour: the first main protein, or neutral when no source reaches 35 % (flagged no_main_protein).
 * `other` (not really high-protein) is neutral too; see NEUTRAL_TINTS.
 */
export type Tint = MainProtein | 'none';
export const NEUTRAL_TINTS: readonly Tint[] = ['none', 'other'];
export const tintOf = (r: Recipe): Tint => r.main_proteins[0] ?? 'none';

export const NO_MACROS = 'Macros not given';

export interface Tile {
  /** Recipe the tile opens: the recipe itself, or the highest-protein version of a group. */
  id: string;
  title: string;
  tint: Tint;
  /** "49", "35+" (lowest of several versions), or "—" when unknown. */
  protein: string;
  meta: string;
  versions: number;
  dishType: DishType | null;
  /** "uses whole-wheat bread" when search matched an ingredient, not the name. */
  uses: string | null;
  nameMatch: boolean;
  /** No written recipe: the video is the recipe (shows a "Video only" badge). */
  videoOnly: boolean;
  sortProtein: number | null;
  sortKcal: number | null;
}

/** Creator's protein when they don't say how many portions it covers (servings null) — shown as "whole recipe". */
export function wholeRecipeProtein(r: Recipe): number | null {
  if (r.per_portion.protein_g !== null || r.servings !== null) return null; // per-serving figures fill per_portion
  return r.stated_macros?.protein_g ?? null;
}

/** The numbers the macro card shows: per portion, or the creator's whole-recipe figures when no portion count. */
export function shownNumbers(r: Recipe): { kcal: number | null; carbs_g: number | null; fat_g: number | null; fibre_g: number | null } {
  const p = r.per_portion;
  const s = wholeRecipeProtein(r) !== null ? r.stated_macros : null;
  return s
    ? { kcal: s.kcal ?? null, carbs_g: s.carbs_g ?? null, fat_g: s.fat_g ?? null, fibre_g: null }
    : { kcal: p.kcal, carbs_g: p.carbs_g, fat_g: p.fat_g, fibre_g: p.fibre_g };
}

/**
 * Protein on cards, in sorting, share text, exports and preview cards: the creator's per-portion figure only.
 * Whole-dish totals (servings not stated) appear on the recipe page only, via shownProtein (Jatin, 2026-10-20).
 */
export const portionProtein = (r: Recipe): number | null => r.per_portion.protein_g;

/** Recipe page macro card: per portion when known, else the whole-recipe total, else null. */
export function shownProtein(r: Recipe): { value: number | null; whole: boolean } {
  if (r.per_portion.protein_g !== null) return { value: r.per_portion.protein_g, whole: false };
  const total = wholeRecipeProtein(r);
  return { value: total, whole: total !== null };
}

/** Sort tiers: recipes with a per-portion figure first, then the rest. */
const tier = (t: { sortProtein: number | null }) => (t.sortProtein === null ? 1 : 0);

function matchesQuick(r: Recipe, q: QuickKey, p: Personal): boolean {
  switch (q) {
    case 'quick': return r.tags.includes('quick');
    case 'global': return r.tags.includes('global');
    case 'airFryer': return r.tags.includes('air_fryer_required') || r.tags.includes('air_fryer_optional');
    case 'myList': return p.myList.has(r.id);
  }
}

export function matches(r: Recipe, f: Filters, p: Personal = NO_PERSONAL): boolean {
  return (
    (f.showDisliked || !p.disliked.has(r.id)) &&
    (f.meal === 'all' || r.meal_types.values.includes(f.meal)) &&
    (f.proteins.length === 0 || r.main_proteins.some((x) => f.proteins.includes(x))) &&
    (f.dishTypes.length === 0 || r.tags.some((t) => (f.dishTypes as string[]).includes(t))) &&
    f.quick.every((q) => matchesQuick(r, q, p))
  );
}

export function filterRecipes(recipes: Recipe[], f: Filters, p: Personal = NO_PERSONAL): Recipe[] {
  return recipes.filter((r) => matches(r, f, p));
}

/** Number of tiles these recipes make (versions of one dish count once). */
export function dishCount(recipes: Recipe[]): number {
  const groups = new Set<string>();
  let n = 0;
  for (const r of recipes) {
    if (!r.dish_group) n++;
    else if (!groups.has(r.dish_group)) { groups.add(r.dish_group); n++; }
  }
  return n;
}

export interface OptionCounts {
  proteins: Record<MainProtein, number>;
  dishTypes: Record<DishType, number>;
  quick: Record<QuickKey, number>;
}

/**
 * Live counts beside each option (DESIGN §4 row 3). Proteins and dish types (OR groups): dishes matching that
 * option with every other group as is. Quick picks (AND): dishes you'd get with that pick added.
 */
export function optionCounts(recipes: Recipe[], f: Filters, p: Personal = NO_PERSONAL): OptionCounts {
  const count = (g: Filters) => dishCount(filterRecipes(recipes, g, p));
  return {
    proteins: Object.fromEntries(PROTEINS.map(({ key }) => [key, count({ ...f, proteins: [key] })])) as OptionCounts['proteins'],
    dishTypes: Object.fromEntries(DISH_TYPES.map((d) => [d, count({ ...f, dishTypes: [d] })])) as OptionCounts['dishTypes'],
    quick: Object.fromEntries(
      QUICK.map(({ key }) => [key, count({ ...f, quick: f.quick.includes(key) ? f.quick : [...f.quick, key] })]),
    ) as OptionCounts['quick'],
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "soya-kebab" → "Soya kebab". */
export function groupTitle(group: string): string {
  return cap(group.replace(/-/g, ' '));
}

function proteinNames(ps: MainProtein[]): string {
  return ps.length ? cap(ps.map((p) => (p === 'other' ? 'others' : p)).join(' + ')) : '';
}

const recipeKey = (r: Recipe) => ({ sortProtein: portionProtein(r) });
const byProteinDesc = (a: Recipe, b: Recipe) => {
  const ka = recipeKey(a);
  const kb = recipeKey(b);
  return tier(ka) - tier(kb) || (kb.sortProtein ?? -1) - (ka.sortProtein ?? -1) || a.title.localeCompare(b.title);
};

function firstDishType(r: Recipe): DishType | null {
  return (r.tags.find((t) => (DISH_TYPES as readonly string[]).includes(t)) as DishType | undefined) ?? null;
}

function singleTile(r: Recipe, hit?: Hit): Tile {
  const p = portionProtein(r);
  const k = r.per_portion.kcal;
  const kcal =
    r.video_only ? 'video only'
    : r.status === 'incomplete' ? 'details pending'
    : p === null ? NO_MACROS
    : k !== null ? `${Math.round(k)} kcal` : '';
  return {
    id: r.id,
    title: r.title,
    tint: tintOf(r),
    protein: p === null ? '—' : String(Math.round(p)),
    meta: [proteinNames(r.main_proteins), kcal].filter(Boolean).join(' · '),
    versions: 1,
    dishType: firstDishType(r),
    uses: hit && !hit.nameMatch ? hit.uses : null,
    nameMatch: hit?.nameMatch ?? false,
    videoOnly: !!r.video_only,
    sortProtein: p,
    sortKcal: r.status === 'incomplete' ? null : k,
  };
}

function groupTile(group: string, versions: Recipe[], hits?: Map<string, Hit>): Tile {
  const sorted = [...versions].sort(byProteinDesc);
  const lead = sorted[0];
  // Lowest per-portion figure among the versions.
  const proteins = sorted.map(portionProtein).filter((x): x is number => x !== null);
  const kcals = sorted.map((r) => r.per_portion.kcal).filter((x): x is number => x !== null);
  const low = proteins.length ? Math.round(Math.min(...proteins)) : null;
  const avgKcal = kcals.length ? Math.round(kcals.reduce((a, b) => a + b, 0) / kcals.length) : null;
  const groupHits = sorted.map((r) => hits?.get(r.id)).filter((h): h is Hit => !!h);
  const nameMatch = groupHits.some((h) => h.nameMatch);
  return {
    id: lead.id,
    title: groupTitle(group),
    tint: tintOf(lead),
    protein: low === null ? '—' : `${low}+`,
    meta: [proteinNames(lead.main_proteins.slice(0, 1)), low === null ? NO_MACROS : avgKcal === null ? '' : `~${avgKcal} kcal`].filter(Boolean).join(' · '),
    versions: versions.length,
    dishType: firstDishType(lead),
    uses: nameMatch ? null : (groupHits.find((h) => h.uses)?.uses ?? null),
    nameMatch,
    videoOnly: false,
    sortProtein: low,
    sortKcal: avgKcal,
  };
}

/**
 * One tile per recipe, except versions of a dish group (among the given recipes) share one tile.
 * With search hits, name matches come first (DESIGN §6); then the chosen sort; unknown values last.
 */
export function toTiles(recipes: Recipe[], sort: SortKey = 'protein', hits?: Map<string, Hit>): Tile[] {
  const groups = new Map<string, Recipe[]>();
  const tiles: Tile[] = [];
  for (const r of recipes) {
    if (r.dish_group) groups.set(r.dish_group, [...(groups.get(r.dish_group) ?? []), r]);
    else tiles.push(singleTile(r, hits?.get(r.id)));
  }
  for (const [group, versions] of groups) {
    tiles.push(versions.length === 1 ? singleTile(versions[0], hits?.get(versions[0].id)) : groupTile(group, versions, hits));
  }
  const bySort = (a: Tile, b: Tile) =>
    sort === 'protein'
      ? tier(a) - tier(b) || (b.sortProtein ?? -1) - (a.sortProtein ?? -1)
      : (a.sortKcal ?? Infinity) - (b.sortKcal ?? Infinity);
  return tiles.sort(
    (a, b) => (hits ? Number(b.nameMatch) - Number(a.nameMatch) : 0) || bySort(a, b) || a.title.localeCompare(b.title),
  );
}

/** "Dinner", "Paneer or Soya", "Sandwich or Wrap", "Quick", "Air fryer", "incl. disliked" — one per active choice. */
export function summaryParts(f: Filters): string[] {
  const parts: string[] = [];
  if (f.meal !== 'all') parts.push(MEALS.find((m) => m.key === f.meal)!.label);
  if (f.proteins.length) parts.push(PROTEINS.filter((p) => f.proteins.includes(p.key)).map((p) => p.label).join(' or '));
  if (f.dishTypes.length) parts.push(DISH_TYPES.filter((d) => f.dishTypes.includes(d)).map((d) => DISH_LABELS[d].short).join(' or '));
  for (const q of QUICK) if (f.quick.includes(q.key)) parts.push(q.label);
  if (f.showDisliked) parts.push('incl. disliked');
  return parts;
}

/** Filters the sheet controls (everything except the meal tab), for its Clear all. */
export function clearSheet(f: Filters): Filters {
  return { ...NO_FILTERS, meal: f.meal };
}

export interface Relaxation {
  label: string;
  filters: Filters;
  dishes: number;
}

/**
 * Smart empty state: the single choice whose removal brings back the most dishes
 * (ties → the narrowest, i.e. the one listed last). null if no single removal helps.
 */
export function bestRelaxation(recipes: Recipe[], f: Filters, p: Personal = NO_PERSONAL): Relaxation | null {
  const options: { label: string; filters: Filters }[] = [];
  if (f.meal !== 'all') options.push({ label: MEALS.find((m) => m.key === f.meal)!.label, filters: { ...f, meal: 'all' } });
  if (f.proteins.length) options.push({ label: summaryParts({ ...NO_FILTERS, proteins: f.proteins })[0], filters: { ...f, proteins: [] } });
  if (f.dishTypes.length) options.push({ label: summaryParts({ ...NO_FILTERS, dishTypes: f.dishTypes })[0], filters: { ...f, dishTypes: [] } });
  for (const q of QUICK) {
    if (f.quick.includes(q.key)) options.push({ label: q.label, filters: { ...f, quick: f.quick.filter((x) => x !== q.key) } });
  }
  let best: Relaxation | null = null;
  for (const o of options) {
    const dishes = dishCount(filterRecipes(recipes, o.filters, p));
    if (dishes > 0 && (!best || dishes >= best.dishes)) best = { ...o, dishes };
  }
  return best;
}
