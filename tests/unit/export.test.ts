import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { askPrompt, catalogFile, catalogFileName, catalogText, compactCatalog, macroText } from '../../src/lib/export';
import type { BackupData } from '../../src/lib/backup';
import type { Recipe } from '../../src/types/recipe';

const DIR = 'tests/fixtures';
const recipes: Recipe[] = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const get = (id: string) => recipes.find((r) => r.id === id)!;
const SITE = 'https://example.org/pp';
const personal: BackupData = {
  mylist: ['besan-chilla'],
  reactions: { 'besan-chilla': 'like', 'tofu-bhurji-toast': 'dislike' },
  notes: { 'besan-chilla': 'Less  salt\nnext time' },
  ticks: {},
  theme: null,
  hintDismissed: false,
};

describe('macroText (creator numbers only, like the app)', () => {
  it('per portion, none, incomplete; whole-recipe totals are left out (recipe page only)', () => {
    expect(macroText(get('paneer-tikka-wrap'))).toMatch(/^\d+ g protein(, \d+ kcal)? per portion$/);
    expect(macroText(get('tempeh-chilli-noodles'))).toBe('31 g protein, 610 kcal per portion');
    const none = { ...get('besan-chilla'), per_portion: { ...get('besan-chilla').per_portion, protein_g: null }, stated_macros: null, servings: null };
    expect(macroText(none)).toBe('macros not given');
    const whole = { ...none, stated_macros: { basis: 'whole recipe', protein_g: 60, kcal: 900, carbs_g: null, fat_g: null } };
    expect(macroText(whole as Recipe)).toBe('macros not given');
    expect(macroText(get('lasooni-dhaniya-paneer'))).toBe('details pending');
  });
});

describe('compactCatalog', () => {
  const text = compactCatalog(recipes, SITE);
  it('one line per recipe, sorted by title, with the link', () => {
    const lines = text.split('\n');
    expect(lines).toHaveLength(recipes.length);
    expect(lines[0].startsWith('- Besan Chilla · ')).toBe(true);
    expect(lines[0]).toMatch(/· https:\/\/example\.org\/pp\/r\/besan-chilla\/$/);
    expect(lines[0]).toContain('Pulses');
    expect(lines[0]).toContain('ingredients: ');
  });
  it('personal data only when asked', () => {
    expect(text).not.toContain('I liked it');
    const mine = compactCatalog(recipes, SITE, personal);
    const besan = mine.split('\n')[0];
    expect(besan).toContain('on my list · I liked it · my note: "Less salt next time"');
    expect(mine).toContain('I disliked it');
  });
});

describe('askPrompt (Track B prompts/ask-catalog.md)', () => {
  const PROMPT = readFileSync('prompts/ask-catalog.md', 'utf8');

  it('prompt text after its ---, then "Catalog:" + one line per recipe, then "My question:"', () => {
    const p = askPrompt(PROMPT, recipes, SITE);
    expect(p.startsWith('You are helping me choose what to cook from **Protein Plate**')).toBe(true);
    expect(p).not.toContain('The Export screen'); // the file's intro for sessions stays out
    expect(p).toContain(`Catalog:\n${compactCatalog(recipes, SITE)}\n`);
    expect(p.endsWith('\n\nMy question:\n')).toBe(true);
    expect(p).not.toContain('whole recipe');
  });

  it('the "My data" bullet only when personal data is included', () => {
    expect(askPrompt(PROMPT, recipes, SITE)).not.toContain('**My data**');
    const mine = askPrompt(PROMPT, recipes, SITE, personal);
    expect(mine).toContain('- **My data** (only when included)');
    expect(mine).toContain('my note: "Less salt next time"');
  });

  it("the prompt's field guide still matches compactCatalog()'s line order", () => {
    expect(PROMPT).toContain('`Title · protein per portion · main protein · meals · dish type · extras · ingredients · my data · link`');
    const line = compactCatalog([get('besan-chilla')], SITE, personal);
    const order = ['- Besan Chilla · ', ' g protein', ' · Pulses', ' · Breakfast', ' · Chilla / pancake', ' · quick', ' · ingredients: ', ' · on my list', ' · https://example.org/pp/r/besan-chilla/'];
    const at = order.map((s) => line.indexOf(s));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });
});

describe('catalogText (/catalog.txt)', () => {
  const text = catalogText(recipes, SITE, 'Protein Plate');
  it('header, then every recipe in full; never personal data', () => {
    expect(text.startsWith(`Protein Plate — ${recipes.length} high-protein vegetarian recipes\nhttps://example.org/pp/\n`)).toBe(true);
    expect(text.match(/^## /gm)).toHaveLength(recipes.length);
    const besan = text.slice(text.indexOf('## Besan Chilla'), text.indexOf('## ', text.indexOf('## Besan Chilla') + 3));
    expect(besan).toContain('Link: https://example.org/pp/r/besan-chilla/');
    expect(besan).toContain('Video: https://www.instagram.com/reel/FIXTURE05/ (by Fixture Kitchen)');
    expect(besan).toMatch(/Ingredients:\n- /);
    expect(besan).toMatch(/Steps:\n1\. /);
    expect(text).toContain('Details missing:');
    expect(text).not.toMatch(/\n{3,}/);
  });
});

describe('catalogFile', () => {
  const now = new Date('2026-10-20T10:00:00Z');
  it('all recipes sorted by id; personal only when ticked', () => {
    const f = catalogFile(recipes, SITE, null, now);
    expect(f).toMatchObject({ kind: 'protein-plate-catalog', version: 1, exported_at: '2026-10-20T10:00:00.000Z', site: 'https://example.org/pp/', count: recipes.length });
    expect(f.recipes.map((r) => r.id)).toEqual(recipes.map((r) => r.id).sort());
    expect('personal' in f).toBe(false);
    expect(catalogFile(recipes, SITE, personal, now).personal).toEqual(personal);
    expect(catalogFileName(now)).toBe('protein-plate-catalog-2026-10-20.json');
  });
});
