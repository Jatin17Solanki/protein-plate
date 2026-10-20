// Deterministic duplicate / variant detection (CONTEXT §4 "Duplicates ≠ variants").
// Layers: (1) same reel/video id, (2) same creator + similar title, (3) high overlap of the
// canonical ingredient set with a shared main protein, (4) looser overlap + same main protein +
// same dish type → possible variant (dish_group candidate). Reports only — never deletes. Pure.
import type { Recipe } from '../../../src/types/recipe';
import { linkKey } from './raw';

export type Layer = 'same_link' | 'same_creator_title' | 'ingredient_overlap' | 'possible_variant';

export interface Pair {
  a: string;
  b: string;
  layer: Layer;
  /** 0–1: title similarity (layer 2), ingredient Jaccard (3), overlap coefficient (4); 1 for the same link. */
  score: number;
  /** Both already in one dish_group → a known variant, not a duplicate. */
  same_group: boolean;
  detail: string;
}

export const TITLE_THRESHOLD = 0.5;
export const OVERLAP_THRESHOLD = 0.6;
export const VARIANT_THRESHOLD = 0.5;
/** A variant shares at least this many key ingredients (one shared paneer is not a variant). */
export const MIN_SHARED = 3;

/** Ingredient types that define a dish; spices and pantry staples are shared by everything. */
const DEFINING = new Set(['protein', 'dairy', 'grain', 'produce', 'sauce']);
/** Aromatics and cooking fats appear in most Indian recipes, so they say nothing about the dish. */
const COMMON = new Set(['onion', 'garlic', 'ginger', 'ginger_garlic_paste', 'green_chilli', 'coriander_leaves', 'lemon', 'tomato', 'ghee', 'butter']);
const DISH_TAGS = new Set([
  'sandwich_toast', 'salad_bowl', 'wrap_roll_taco', 'kebab_tikki_cutlet', 'chilla_pancake_omelette', 'curry_sabzi',
  'rice_pulao_biryani', 'pasta_noodles', 'chaat', 'paratha', 'pizza', 'dessert', 'sauce_dip',
]);
const STOP = new Set(['high', 'protein', 'recipe', 'with', 'and', 'the', 'a', 'of', 'healthy', 'easy', 'veg']);

function titleWords(t: string): Set<string> {
  return new Set(
    t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)),
  );
}

export function jaccard<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

function definingIds(r: Recipe): Set<string> {
  return new Set(
    r.ingredients.filter((g) => g.ingredient_id && DEFINING.has(g.type) && !COMMON.has(g.ingredient_id)).map((g) => g.ingredient_id!),
  );
}

/** |A ∩ B| / min(|A|, |B|): high when one recipe's key ingredients are mostly in the other. */
export function overlapCoefficient<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / Math.min(a.size, b.size);
}

function creatorKey(r: Recipe): string | null {
  return r.source.creator ? r.source.creator.toLowerCase().replace(/^@/, '').replace(/[^a-z0-9]/g, '') : null;
}

export function findPairs(recipes: Recipe[]): Pair[] {
  const pairs: Pair[] = [];
  for (let i = 0; i < recipes.length; i++) {
    for (let j = i + 1; j < recipes.length; j++) {
      const a = recipes[i];
      const b = recipes[j];
      const same_group = a.dish_group !== null && a.dish_group === b.dish_group;
      const base = { a: a.id, b: b.id, same_group };

      if (a.source.url && b.source.url && linkKey(a.source.url) === linkKey(b.source.url)) {
        pairs.push({ ...base, layer: 'same_link', score: 1, detail: linkKey(a.source.url) });
        continue;
      }
      const ca = creatorKey(a);
      if (ca && ca === creatorKey(b)) {
        const s = jaccard(titleWords(a.title), titleWords(b.title));
        if (s >= TITLE_THRESHOLD) {
          pairs.push({ ...base, layer: 'same_creator_title', score: s, detail: `"${a.title}" vs "${b.title}"` });
          continue;
        }
      }
      const sharedMain = a.main_proteins.filter((p) => b.main_proteins.includes(p));
      if (sharedMain.length) {
        const ia = definingIds(a);
        const ib = definingIds(b);
        const s = jaccard(ia, ib);
        const common = [...ia].filter((x) => ib.has(x));
        const detail = `${sharedMain.join('+')}; shared: ${common.join(', ')}`;
        if (s >= OVERLAP_THRESHOLD) {
          pairs.push({ ...base, layer: 'ingredient_overlap', score: s, detail });
          continue;
        }
        const sharedDish = a.tags.filter((t) => DISH_TAGS.has(t) && b.tags.includes(t));
        const oc = overlapCoefficient(ia, ib);
        if (sharedDish.length && oc >= VARIANT_THRESHOLD && common.length >= MIN_SHARED) {
          pairs.push({ ...base, layer: 'possible_variant', score: oc, detail: `${sharedDish.join('+')}, ${detail}` });
        }
      }
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}

/** Pairs between new recipes and the catalog, or among the new ones (Add recipes screen, B3 batches). */
export function findPairsAgainst(newOnes: Recipe[], catalog: Recipe[]): Pair[] {
  const fresh = new Set(newOnes.map((r) => r.id));
  const all = [...newOnes, ...catalog.filter((r) => !fresh.has(r.id))];
  return findPairs(all).filter((p) => fresh.has(p.a) || fresh.has(p.b));
}
