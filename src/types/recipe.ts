/* Generated from schema/recipe.schema.json by scripts/gen-types.ts — do not edit. Run `npm run gen:types`. */

/**
 * One recipe = one file data/recipes/<id>.json. All protein/kcal figures are per one person's portion (CONTEXT §4).
 */
export type Recipe = {
  /**
   * Kebab-case, unique, equals the file name without .json. Never changes once published (links depend on it).
   */
  id: string;
  title: string;
  source: Source;
  /**
   * incomplete = kept under its title with a missing[] list; never dropped.
   */
  status: 'complete' | 'incomplete';
  meal_types: MealTypes;
  /**
   * Every source supplying >= 35 % of the recipe's protein, larger contributor first. The first one sets the tile colour.
   *
   * @maxItems 6
   */
  main_proteins: MainProtein[];
  /**
   * Ingredient ids (data/ingredients.json) that add protein but are not main proteins, e.g. greek_yogurt, cheese.
   */
  supporting_proteins: Slug[];
  /**
   * One flat set. Order matters: the first dish-type tag picks the tile icon.
   */
  tags: Tag[];
  /**
   * Kebab-case id shared by intentional variants of one dish; null if none.
   */
  dish_group: string | null;
  /**
   * Short label that tells this version apart inside its dish group (e.g. 'with peas'). Required when dish_group is set.
   */
  variant_label: string | null;
  per_portion: PerPortion;
  /**
   * Macros as the creator stated them, kept alongside our estimate; null if the creator gave none.
   */
  stated_macros: StatedMacros | null;
  /**
   * Show the working: one line per protein source, e.g. '40 g dry soya × 52 = 20.8 g'.
   */
  protein_working: string[];
  /**
   * Portions the ingredient list makes, as the creator states it; null if not stated (then per_portion stays null and protein_working gives the whole-recipe total).
   */
  servings: number | null;
  ingredients: Ingredient[];
  /**
   * The creator's own words, in their order; only formatting changes (D5, revised 2026-10-20).
   */
  steps: string[];
  /**
   * Anything we inferred (dry weight, portion count, meal type...). Fidelity check exceptions go here.
   */
  assumptions: string[];
  /**
   * What the source does not give us. Must be non-empty when status is incomplete.
   */
  missing: string[];
  /**
   * Things Jatin must look at (shown in the admin list). Set by scripts/data/check.ts (no_macros, macros_basis_unclear, missing_details) or by hand (source_conflict, other). Removed once he resolves them.
   */
  flags?: Flag[];
  added_at: string;
};
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export type MainProtein = 'paneer' | 'soya' | 'tofu' | 'tempeh' | 'pulses' | 'whey';
export type Slug = string;
export type Tag =
  | 'sandwich_toast'
  | 'salad_bowl'
  | 'wrap_roll_taco'
  | 'kebab_tikki_cutlet'
  | 'chilla_pancake_omelette'
  | 'curry_sabzi'
  | 'rice_pulao_biryani'
  | 'pasta_noodles'
  | 'chaat'
  | 'paratha'
  | 'pizza'
  | 'dessert'
  | 'sauce_dip'
  | 'global'
  | 'quick'
  | 'air_fryer_required'
  | 'air_fryer_optional';
export type NullableAmount = number | null;

export interface Source {
  /**
   * Link to the original video/post. null only for the owner's own recipes.
   */
  url: string | null;
  platform: ('instagram' | 'youtube' | 'website' | 'other') | null;
  /**
   * Creator's display name or handle, credited on the recipe page.
   */
  creator: string | null;
  creator_url: string | null;
  /**
   * Where the raw entry lives, e.g. 'batches/2026-10-16-batch1.txt#12' (private raw repo). null for recipes added another way.
   */
  ref: string | null;
}
export interface MealTypes {
  /**
   * Multi-select. Empty for sauces/dips/marinades.
   */
  values: MealType[];
  /**
   * The subset of values the owner said; the rest were inferred.
   */
  stated_by_user: MealType[];
}
/**
 * The creator's own numbers for one portion as they state it (is_estimate false). Null when the creator gives none — never our estimate (Jatin, 2026-10-20).
 */
export interface PerPortion {
  protein_g: number | null;
  kcal: number | null;
  carbs_g: NullableAmount;
  fat_g: NullableAmount;
  fibre_g: NullableAmount;
  /**
   * true = our calculation (see protein_working); false = creator's numbers used as is.
   */
  is_estimate: boolean;
}
export interface StatedMacros {
  /**
   * As the creator put it, e.g. 'per serving', 'whole recipe'.
   */
  basis: string;
  protein_g: NullableAmount;
  kcal: NullableAmount;
  carbs_g?: NullableAmount;
  fat_g?: NullableAmount;
}
export interface Ingredient {
  /**
   * English name as shown on the recipe page.
   */
  item: string;
  /**
   * Optional group heading, e.g. 'chutney'. Ingredients without one go in the main card. Keep a section's ingredients together.
   */
  section?: string;
  /**
   * Canonical id in data/ingredients.json (jeera -> cumin_seeds). null until the dictionary has it.
   */
  ingredient_id: Slug | null;
  /**
   * Amount in `unit`; null for 'to taste' or unstated.
   */
  qty: number | null;
  unit:
    | (
        | 'g'
        | 'kg'
        | 'ml'
        | 'l'
        | 'tsp'
        | 'tbsp'
        | 'cup'
        | 'piece'
        | 'slice'
        | 'clove'
        | 'pinch'
        | 'handful'
        | 'to_taste'
      )
    | null;
  /**
   * Optional gram estimate when unit is not g (dry weight for dal/soya/pulses).
   */
  grams?: number | null;
  type: 'protein' | 'dairy' | 'grain' | 'produce' | 'spice' | 'pantry' | 'sauce';
  /**
   * Creator marked it optional.
   */
  optional?: boolean;
  /**
   * The source's exact wording — the fidelity anchor.
   */
  as_written: string;
}
export interface Flag {
  code: 'no_macros' | 'macros_basis_unclear' | 'missing_details' | 'source_conflict' | 'other';
  note: string;
}
