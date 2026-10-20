// Recipe validation shared by scripts/validate.ts (CI) and, later, the Add recipes screen (A7).
// Schema errors and cross-recipe errors block a deploy; warnings are printed but don't.
import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../../schema/recipe.schema.json';
import type { Recipe } from '../types/recipe';

export interface Issue {
  file: string;
  message: string;
}

export interface CatalogReport {
  errors: Issue[];
  warnings: Issue[];
  recipes: Recipe[];
}

const ajv = new Ajv({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
const validateSchema = ajv.compile<Recipe>(schema);

function formatAjvError(e: ErrorObject): string {
  const where = e.instancePath || '(root)';
  if (e.keyword === 'additionalProperties') {
    return `${where}: unknown field "${(e.params as { additionalProperty: string }).additionalProperty}"`;
  }
  if (e.keyword === 'enum') {
    return `${where}: must be one of ${(e.params as { allowedValues: unknown[] }).allowedValues.join(', ')}`;
  }
  return `${where}: ${e.message}`;
}

/** Schema check for one parsed JSON value. Returns readable messages; empty = valid. */
export function checkSchema(data: unknown): string[] {
  if (validateSchema(data)) return [];
  const errors = validateSchema.errors ?? [];
  // `if/then` and `anyOf` wrappers repeat the real error; keep the specific ones.
  const specific = errors.filter((e) => e.keyword !== 'if' && e.keyword !== 'anyOf');
  return [...new Set((specific.length ? specific : errors).map(formatAjvError))];
}

/** Rules a single recipe must follow that JSON Schema can't express. */
export function checkRules(r: Recipe): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const meals = new Set(r.meal_types.values);
  for (const m of r.meal_types.stated_by_user) {
    if (!meals.has(m)) errors.push(`meal_types.stated_by_user has "${m}" which is not in meal_types.values`);
  }
  if (r.variant_label !== null && r.dish_group === null) {
    errors.push('variant_label is set but dish_group is null');
  }
  if (r.tags.includes('air_fryer_required') && r.tags.includes('air_fryer_optional')) {
    errors.push('tags has both air_fryer_required and air_fryer_optional');
  }
  if (r.tags.includes('sauce_dip') && r.meal_types.values.length > 0) {
    warnings.push('sauces/dips/marinades normally have no meal type');
  }
  if (r.status === 'complete' && r.per_portion.is_estimate && r.protein_working.length === 0) {
    warnings.push('protein is an estimate but protein_working is empty');
  }
  return { errors, warnings };
}

/** Validate a whole catalog: per-file schema + rules, then cross-file checks. */
export function checkCatalog(files: { file: string; data: unknown }[]): CatalogReport {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const recipes: Recipe[] = [];
  const byId = new Map<string, string>();

  for (const { file, data } of files) {
    const schemaErrors = checkSchema(data);
    if (schemaErrors.length) {
      errors.push(...schemaErrors.map((message) => ({ file, message })));
      continue;
    }
    const r = data as Recipe;
    const base = file.split(/[\\/]/).pop()!.replace(/\.json$/, '');
    if (base !== r.id) errors.push({ file, message: `id "${r.id}" must match the file name "${base}.json"` });
    const seen = byId.get(r.id);
    if (seen) errors.push({ file, message: `duplicate id "${r.id}" (also in ${seen})` });
    else byId.set(r.id, file);
    const rules = checkRules(r);
    errors.push(...rules.errors.map((message) => ({ file, message })));
    warnings.push(...rules.warnings.map((message) => ({ file, message })));
    recipes.push(r);
  }

  const groups = new Map<string, Recipe[]>();
  for (const r of recipes) {
    if (r.dish_group) groups.set(r.dish_group, [...(groups.get(r.dish_group) ?? []), r]);
  }
  for (const [group, members] of groups) {
    if (members.length < 2) {
      warnings.push({ file: byId.get(members[0].id)!, message: `dish_group "${group}" has only one recipe` });
    }
    const labels = new Set<string>();
    for (const m of members) {
      if (labels.has(m.variant_label!)) {
        errors.push({ file: byId.get(m.id)!, message: `variant_label "${m.variant_label}" repeats in dish_group "${group}"` });
      }
      labels.add(m.variant_label!);
    }
  }

  return { errors, warnings, recipes };
}
