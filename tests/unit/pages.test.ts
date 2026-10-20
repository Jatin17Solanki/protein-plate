import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { recipeCard, withMeta } from '../../scripts/build/pages';
import { readTokens } from '../../scripts/build/tokens';
import type { Recipe } from '../../src/types/recipe';

const load = (id: string): Recipe => JSON.parse(readFileSync(`tests/fixtures/${id}.json`, 'utf8'));
const HTML = '<!doctype html><html><head>\n    <title>Protein Plate</title>\n    <meta name="description" content="x" />\n  </head><body></body></html>';

describe('withMeta', () => {
  it('sets title, description and Open Graph tags, escaping quotes and ampersands', () => {
    const out = withMeta(HTML, { title: 'Corn & "Cheese"', description: '31 g <protein>', url: 'https://a.b/r/x/', image: 'https://a.b/og/x.png' });
    expect(out).toContain('<title>Corn &amp; &quot;Cheese&quot;</title>');
    expect(out).toContain('<meta name="description" content="31 g &lt;protein&gt;" />');
    expect(out).toContain('<meta property="og:image" content="https://a.b/og/x.png" />');
    expect(out).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(out).toContain('<link rel="canonical" href="https://a.b/r/x/" />');
    expect(out).not.toContain('noindex');
    expect(out.indexOf('og:title')).toBeLessThan(out.indexOf('</head>'));
  });

  it('replaces tags from an earlier pass instead of adding a second set', () => {
    const once = withMeta(HTML, { title: 'Home', description: 'd', url: 'https://a.b/', image: 'https://a.b/og/home.png' });
    const twice = withMeta(once, { title: 'Recipe', description: 'r', url: 'https://a.b/r/x/', image: 'https://a.b/og/x.png' });
    expect(twice.match(/og:title/g)).toHaveLength(1);
    expect(twice.match(/rel="canonical"/g)).toHaveLength(1);
    expect(twice).toContain('content="https://a.b/og/x.png"');
    expect(twice).not.toContain('og/home.png');
  });

  it('adds noindex when asked', () => {
    expect(withMeta(HTML, { title: 't', description: 'd', url: 'u', image: 'i', noindex: true })).toContain('<meta name="robots" content="noindex" />');
  });
});

describe('recipeCard', () => {
  it('per-portion recipe: number, kcal, protein and dish', () => {
    expect(recipeCard(load('soya-tikka-salad'))).toEqual({
      title: 'Soya Tikka Salad', big: '45 g', caption: 'protein per portion · 420 kcal', meta: 'Soya · Salad / bowl', tint: 'soya',
      description: '45 g protein per portion · 420 kcal · Soya · Salad / bowl.',
    });
  });

  it('incomplete recipe and missing numbers say so; no main protein → neutral', () => {
    expect(recipeCard(load('lasooni-dhaniya-paneer'))).toMatchObject({ big: 'Details pending', tint: 'paneer' });
    const r = load('tempeh-chilli-noodles');
    r.per_portion = { ...r.per_portion, protein_g: null, kcal: null };
    r.main_proteins = [];
    expect(recipeCard(r)).toMatchObject({ big: 'Macros not given', tint: null, meta: 'Pasta / noodles' });
  });
});

describe('readTokens', () => {
  it('reads light and dark values from design/tokens.css (skipping the one-line dark rule)', () => {
    expect(readTokens()).toMatchObject({ bg: '#FFFFFF', brand: '#17734A' });
    expect(readTokens(':root[data-theme="dark"] {')).toMatchObject({ bg: '#111614', brand: '#4CC487' });
  });
});
