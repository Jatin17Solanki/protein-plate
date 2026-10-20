import type { Recipe } from '../types/recipe';

// Every data/recipes/*.json is bundled at build time; CI validates them before the build runs.
// VITE_FIXTURES=1 builds with tests/fixtures instead (dev and e2e tests until real data lands).
const files = import.meta.env.VITE_FIXTURES === '1'
  ? import.meta.glob<Recipe>('../../tests/fixtures/*.json', { eager: true, import: 'default' })
  : import.meta.glob<Recipe>('../../data/recipes/*.json', { eager: true, import: 'default' });

export const recipes: Recipe[] = Object.values(files);
