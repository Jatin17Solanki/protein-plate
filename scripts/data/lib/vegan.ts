// Is a recipe vegan? Worked out from the dictionary (data/ingredients.json: `vegan: false` marks animal
// products and foods that usually contain them). check.ts --write keeps the `vegan` tag in line with it.
import type { Recipe } from '../../../src/types/recipe';
import type { DictEntry } from './dictionary';
import { normalizeText } from './dictionary';

/** Plant-based phrases taken out of the title before looking for animal words. */
const TITLE_PLANT = /\b(peanut|almond|nut|cashew|seed|cocoa) butter\b|\b(coconut|almond|oat|soy|soya|seed|cashew|rice) (milk|cream|curd|yogh?urt)\b|\bsesame seed milk\b/g;
/** Title words that mean an animal product (dairy, honey, whey). */
const TITLE_ANIMAL = /\b(paneer|cottage cheese|cheese|cheesy|cheesecake|yogh?urt|curd|dahi|raita|skyr|whey|milk|milkshake|malai|cream|creamy|butter|ghee|honey|kheer|halwa|lassi|chaas|kulfi|rabri)\b/;

export type VeganStatus = 'vegan' | 'not_vegan' | 'unknown';

export interface VeganResult {
  status: VeganStatus;
  /** Ingredients that make it not vegan (by item name). */
  animal: string[];
  /** Non-optional ingredients with no dictionary id, so we can't tell. */
  unknown: string[];
}

/**
 * vegan: every ingredient you must use is plant-based. Optional ingredients don't count (you can leave them out).
 * not_vegan: a required ingredient is marked `vegan: false`.
 * Also not_vegan when the title names one ("… with Yogurt Dip", "Paneer …", "… Raita"): captions often leave the
 * dip or side out of the ingredient list. Plant phrases ("peanut butter", "coconut milk", "seed milk") don't count.
 * unknown: no ingredient list (incomplete / video only), or a required ingredient has no dictionary id.
 * The tag is then left as a person set it.
 */
export function veganStatus(r: Recipe, byId: Map<string, DictEntry>): VeganResult {
  const animal: string[] = [];
  const unknown: string[] = [];
  const word = normalizeText(r.title).replace(TITLE_PLANT, ' ').match(TITLE_ANIMAL);
  if (word) animal.push(`"${word[1]}" in the title`);
  if (animal.length) return { status: 'not_vegan', animal, unknown };
  if (r.status !== 'complete' || r.video_only || r.ingredients.length === 0) return { status: 'unknown', animal, unknown };
  for (const g of r.ingredients) {
    if (g.optional) continue;
    const d = g.ingredient_id ? byId.get(g.ingredient_id) : undefined;
    if (!d) unknown.push(g.item);
    else if (d.vegan === false) animal.push(g.item);
  }
  const status: VeganStatus = animal.length ? 'not_vegan' : unknown.length ? 'unknown' : 'vegan';
  return { status, animal, unknown };
}
