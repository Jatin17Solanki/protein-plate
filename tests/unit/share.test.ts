import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { editUrl, recipeUrl, shareMessage } from '../../src/lib/share';
import type { Recipe } from '../../src/types/recipe';

const load = (id: string): Recipe => JSON.parse(readFileSync(`tests/fixtures/${id}.json`, 'utf8'));
const SITE = 'https://example.github.io/protein-plate/';

describe('shareMessage (DESIGN §6 format)', () => {
  it('title, macros, ingredients, note, video and link', () => {
    const msg = shareMessage(load('soya-tikka-salad'), { ingredients: true, steps: false, note: 'Half the chilli.' }, SITE);
    expect(msg).toBe(
      [
        '*Soya Tikka Salad*\n45 g protein · 420 kcal per portion',
        '*Ingredients*\nsoya chunks 40 g · Greek yogurt 200 g · besan 2 tbsp · cucumber 1 · salt to taste',
        '*Note:* Half the chilli.',
        'Full recipe: https://example.github.io/protein-plate/r/soya-tikka-salad/\nVideo: https://www.instagram.com/reel/FIXTURE02/',
      ].join('\n\n'),
    );
  });

  it('steps are numbered; empty note and toggles off are left out', () => {
    const msg = shareMessage(load('tempeh-chilli-noodles'), { ingredients: false, steps: true, note: '  ' }, SITE);
    expect(msg).toContain('*Steps*\n1. Boil the noodles.\n2. Pan-fry the tempeh until golden.\n3. Toss everything with the sauces.');
    expect(msg).not.toContain('*Ingredients*');
    expect(msg).not.toContain('*Note:*');
  });

  it('whole-recipe total and missing kcal are said plainly; no video line without a URL', () => {
    const r = load('protein-oats');
    r.servings = null;
    r.per_portion = { ...r.per_portion, protein_g: null, kcal: null };
    r.stated_macros = { basis: 'whole recipe (servings not stated)', protein_g: 36.9, kcal: null };
    const msg = shareMessage(r, { ingredients: false, steps: false, note: null }, SITE);
    expect(msg).toBe('*Protein Oats*\n37 g protein for the whole recipe\n\nFull recipe: https://example.github.io/protein-plate/r/protein-oats/');
    expect(shareMessage(load('rajma-rice-bowl'), { ingredients: false, steps: false, note: null }, SITE)).toContain('21 g protein per portion');
    expect(shareMessage(load('lasooni-dhaniya-paneer'), { ingredients: true, steps: true, note: null }, SITE)).toContain('Protein not worked out yet');
  });
});

describe('link order', () => {
  it('our recipe link is the first URL, so WhatsApp previews our card, not the reel', () => {
    for (const steps of [false, true]) {
      const msg = shareMessage(load('soya-tikka-salad'), { ingredients: true, steps, note: 'x' }, SITE);
      expect(msg.match(/https?:\/\/\S+/)![0]).toBe('https://example.github.io/protein-plate/r/soya-tikka-salad/');
    }
  });
});

describe('links', () => {
  it('recipe URL tolerates a missing trailing slash', () => {
    expect(recipeUrl('x', 'https://a.b/c')).toBe('https://a.b/c/r/x/');
  });
  it('edit URL points at the recipe file in the configured repo', () => {
    expect(editUrl('besan-chilla')).toBe('https://github.com/Jatin17Solanki/protein-plate/edit/main/data/recipes/besan-chilla.json');
  });
});
