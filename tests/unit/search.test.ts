import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { toTiles } from '../../src/lib/home';
import { Searcher } from '../../src/lib/search';
import { groupsFromDictionary, synonymGroups } from '../../src/lib/synonyms';
import type { Recipe } from '../../src/types/recipe';

const DIR = 'tests/fixtures';
const recipes: Recipe[] = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const s = new Searcher(recipes, synonymGroups);
const found = (q: string) => [...s.search(q).keys()].sort();

describe('Searcher', () => {
  it('matches title words, with title hits flagged', () => {
    expect(s.search('chilla').get('besan-chilla')).toEqual({ nameMatch: true, uses: null });
  });

  it('matches ingredients and says which one', () => {
    const hits = s.search('cucumber');
    expect([...hits.keys()]).toEqual(['soya-tikka-salad']);
    expect(hits.get('soya-tikka-salad')).toEqual({ nameMatch: false, uses: 'cucumber' });
  });

  it('prefix: "yog" finds the Greek yogurt recipes', () => {
    expect(found('yog')).toEqual(['paneer-tikka-wrap', 'soya-tikka-salad']);
  });

  it('small typos are tolerated', () => {
    expect(found('cucmber')).toEqual(['soya-tikka-salad']);
    expect(found('tempe')).toContain('tempeh-chilli-noodles');
  });

  it('synonyms: dahi → curd, gram flour → besan, haldi → turmeric', () => {
    expect(found('dahi')).toEqual(['besan-chilla', 'rajma-rice-bowl']);
    expect(found('gram flour')).toEqual(['besan-chilla', 'soya-tikka-salad']);
    expect(s.search('haldi').get('tofu-bhurji-toast')).toEqual({ nameMatch: false, uses: 'turmeric' });
  });

  it('several words must all match', () => {
    expect(found('soya paneer')).toEqual(['soya-paneer-tikki']);
  });

  it('tags are searchable ("air fryer")', () => {
    expect(found('air fryer')).toEqual(['paneer-tikka-wrap', 'soya-paneer-tikki', 'soya-pea-kebab', 'soya-tikka-salad']);
  });

  it('empty or junk query → nothing', () => {
    expect(s.search('  ').size).toBe(0);
    expect(s.search('zzzzqqq').size).toBe(0);
  });

  it('tiles: name matches first, then protein; ingredient matches get a "uses" badge', () => {
    const hits = s.search('paneer');
    const tiles = toTiles(recipes.filter((r) => hits.has(r.id)), 'protein', hits);
    expect(tiles.map((t) => [t.title, t.nameMatch, t.uses])).toEqual([
      ['Paneer Tikka Wrap', true, null],
      ['Soya Paneer Tikki', true, null],
      ['Lasooni Dhaniya Paneer', true, null],
    ]);
  });
});

describe('groupsFromDictionary', () => {
  it('builds groups from name, id and aliases; drops entries with nothing to add', () => {
    expect(groupsFromDictionary([
      { id: 'curd', name: 'Curd', aliases: ['dahi', 'Dahi'] },
      { id: 'salt', name: 'salt', aliases: [] },
      { id: 'greek_yogurt', name: 'Greek yogurt' },
    ])).toEqual([['curd', 'dahi']]);
  });
});
