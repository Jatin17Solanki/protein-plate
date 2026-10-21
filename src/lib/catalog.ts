import type { Recipe } from '../types/recipe';
import { splitArchived } from './archive';

// Every data/recipes/*.json is bundled at build time; CI validates them before the build runs.
// VITE_FIXTURES=1 builds with tests/fixtures instead (dev and e2e tests); archived fixtures sit in their own folder so
// the unit tests that read tests/fixtures/*.json keep their counts.
const files = import.meta.env.VITE_FIXTURES === '1'
  ? import.meta.glob<Recipe>(['../../tests/fixtures/*.json', '../../tests/fixtures/archived/*.json'], { eager: true, import: 'default' })
  : import.meta.glob<Recipe>('../../data/recipes/*.json', { eager: true, import: 'default' });

/** Every bundled recipe, archived ones included: recipe pages and the duplicate check use this. */
export const allRecipes: Recipe[] = Object.values(files);

const split = splitArchived(allRecipes);
/** The main catalog (archived recipes left out): Home, search, My recipes, Review and the exports. */
export const recipes: Recipe[] = split.active;
/** Recipes kept out of the main catalog; listed only on /archive/. */
export const archivedRecipes: Recipe[] = split.archived;
