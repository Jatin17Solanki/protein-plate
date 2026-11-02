// How many recipes the hidden /review/ page lists, using the page's own rule (src/lib/review.ts).
// For the automated inbox run's PR summary and push notification (docs/ADD-RECIPES.md, Automated mode).
//   npx tsx scripts/data/review-count.ts            → one summary line + per-flag counts
//   npx tsx scripts/data/review-count.ts --new a b  → also how many of the given recipe ids are listed
import { flagLabel, reviewItems } from '../../src/lib/review';
import { loadRecipes, positionals } from './load';

const items = reviewItems(loadRecipes().map((r) => r.recipe));
const byFlag = new Map<string, number>();
for (const i of items) for (const f of i.flags) byFlag.set(f.code, (byFlag.get(f.code) ?? 0) + 1);

const newIds = process.argv.includes('--new') ? new Set(positionals([])) : null;
const newListed = newIds ? items.filter((i) => newIds.has(i.recipe.id)).length : null;

console.log(`${items.length} waiting on /review/${newListed === null ? '' : ` (${newListed} from this batch)`}`);
for (const [code, n] of byFlag) console.log(`  ${flagLabel(code as never)}: ${n}`);
