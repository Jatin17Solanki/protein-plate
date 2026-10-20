// Client-side search over title, ingredients and tags (DESIGN §6): synonyms, prefix, small-typo tolerance.
// Returns a Hit per matching recipe; the Home screen still applies meal tab and filters on top.
import MiniSearch, { type Query } from 'minisearch';
import type { Recipe } from '../types/recipe';
import type { Hit } from './home';

const TAG_WORDS: Record<string, string> = {
  air_fryer_required: 'air fryer',
  air_fryer_optional: 'air fryer',
  chilla_pancake_omelette: 'chilla pancake omelette cheela',
};

interface Doc {
  id: string;
  title: string;
  ingredients: string;
  tags: string;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();
const words = (s: string) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);

function ingredientText(i: Recipe['ingredients'][number]): string {
  return [i.item, i.ingredient_id?.replace(/_/g, ' ') ?? ''].join(' ');
}

export class Searcher {
  private index: MiniSearch<Doc>;
  private byId: Map<string, Recipe>;

  constructor(recipes: Recipe[], private synonyms: string[][] = []) {
    this.byId = new Map(recipes.map((r) => [r.id, r]));
    this.index = new MiniSearch<Doc>({
      fields: ['title', 'ingredients', 'tags'],
      searchOptions: {
        boost: { title: 3 },
        prefix: true,
        fuzzy: (term) => (term.length >= 5 ? 1 : term.length >= 4 ? 0.25 : false),
        combineWith: 'AND',
      },
    });
    this.index.addAll(
      recipes.map((r) => ({
        id: r.id,
        title: r.title,
        ingredients: r.ingredients.map(ingredientText).join(' · '),
        tags: [...r.tags.map((t) => TAG_WORDS[t] ?? t.replace(/_/g, ' ')), ...r.main_proteins].join(' '),
      })),
    );
  }

  /** Synonym phrases for a query (whole query first, else per word). */
  private expand(term: string): string[] {
    const t = norm(term);
    const out = new Set<string>([t]);
    for (const g of this.synonyms) {
      if (g.some((alias) => alias === t || (t.length >= 3 && !t.includes(' ') && words(alias).some((w) => w.startsWith(t))))) {
        g.forEach((a) => out.add(a));
      }
    }
    return [...out];
  }

  private phrase(p: string): Query {
    return { combineWith: 'AND', queries: [p] };
  }

  private buildQuery(q: string): Query {
    const whole = this.expand(q);
    if (whole.length > 1 && words(q).length > 1) return { combineWith: 'OR', queries: whole.map((p) => this.phrase(p)) };
    return {
      combineWith: 'AND',
      queries: words(q).map((w) => ({ combineWith: 'OR', queries: this.expand(w).map((p) => this.phrase(p)) })),
    };
  }

  search(q: string): Map<string, Hit> {
    const hits = new Map<string, Hit>();
    if (!words(q).length) return hits;
    for (const res of this.index.search(this.buildQuery(q))) {
      const r = this.byId.get(res.id as string)!;
      const fieldsByTerm = res.match as Record<string, string[]>;
      const nameMatch = Object.values(fieldsByTerm).some((f) => f.includes('title'));
      const ingTerms = Object.keys(fieldsByTerm).filter((t) => fieldsByTerm[t].includes('ingredients'));
      const ing = r.ingredients.find((i) => words(ingredientText(i)).some((w) => ingTerms.includes(w)));
      hits.set(r.id, { nameMatch, uses: ing ? ing.item : null });
    }
    return hits;
  }
}
