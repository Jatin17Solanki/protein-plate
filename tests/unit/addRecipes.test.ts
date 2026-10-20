import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  asVersion, buildAddPrompt, catalogIndex, checkPaste, fixItPrompt, matchReason, MAX_URL, newFileUrl, parsePaste, readyLine,
  submission, versionLabelProblem,
} from '../../src/lib/addRecipes';
import type { Recipe } from '../../src/types/recipe';

const DIR = 'tests/fixtures';
const all: Recipe[] = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const get = (id: string) => structuredClone(all.find((r) => r.id === id)!);
// The catalog is every fixture except tempeh-chilli-noodles, which plays a brand-new recipe.
const catalog = all.filter((r) => r.id !== 'tempeh-chilli-noodles');
const fresh = get('tempeh-chilli-noodles');

describe('parsePaste', () => {
  it('reads a bare array, a fenced block inside chat text, and a single object', () => {
    expect(parsePaste('[{"a":1},{"b":2}]')).toEqual({ items: [{ a: 1 }, { b: 2 }] });
    expect(parsePaste('Here you go:\n```json\n[{"a":1}]\n```\nAnything else?')).toEqual({ items: [{ a: 1 }] });
    expect(parsePaste('Sure! {"a":1} Enjoy.')).toEqual({ items: [{ a: 1 }] });
  });

  it('explains empty input, an empty list and broken JSON', () => {
    expect(parsePaste('  ')).toEqual({ error: expect.stringContaining('Paste') });
    expect(parsePaste('[]')).toEqual({ error: expect.stringContaining('empty') });
    expect(parsePaste('[{"a":1,}]')).toEqual({ error: expect.stringContaining("isn't valid JSON") });
  });
});

describe('checkPaste', () => {
  it('a valid recipe with no lookalike is ready', () => {
    const [v] = checkPaste([fresh], catalog);
    expect(v.kind).toBe('ready');
    expect(v.errors).toEqual([]);
    expect(readyLine(v.recipe!)).toBe('Ready · Tempeh · 31 g protein · Lunch, Dinner');
  });

  it('schema errors make an error verdict, titled from the record when it has one', () => {
    const [v] = checkPaste([{ title: 'Tofu scramble' }], catalog);
    expect(v.kind).toBe('error');
    expect(v.title).toBe('Tofu scramble');
    expect(v.errors.some((e) => e.includes("must have required property 'per_portion'"))).toBe(true);
    expect(checkPaste([42], catalog)[0].title).toBe('Recipe 1');
  });

  it('rule errors (the same checks CI runs) block too', () => {
    const r = { ...fresh, tags: [...fresh.tags, 'air_fryer_required', 'air_fryer_optional'] };
    const [v] = checkPaste([r], catalog);
    expect(v.kind).toBe('error');
    expect(v.errors).toContain('tags has both air_fryer_required and air_fryer_optional');
  });

  it('an id already in the catalog, or twice in the paste, is an error', () => {
    const [clash] = checkPaste([get('rajma-rice-bowl')], catalog);
    expect(clash.kind).toBe('error');
    expect(clash.errors[0]).toMatch(/already used by "Rajma Rice Bowl"/);
    const twice = checkPaste([fresh, fresh], catalog);
    expect(twice[1].errors).toContain('id "tempeh-chilli-noodles" is also used by recipe 1 in this paste.');
  });

  it("uses Track B's duplicate layers: same link against the catalog", () => {
    const copy = { ...get('besan-chilla'), id: 'besan-chilla-again', title: 'Besan Chilla Again' };
    const [v] = checkPaste([copy], catalog);
    expect(v.kind).toBe('duplicate');
    expect(v.matches[0]).toMatchObject({ id: 'besan-chilla', layer: 'same_link', sameGroup: false });
    expect(matchReason(v.matches[0])).toBe('Looks like "Besan Chilla" already in the catalog (same video link).');
  });

  it('catches repeats inside the paste', () => {
    const twin = { ...fresh, id: 'tempeh-noodles-twin', title: 'Tempeh Noodles Twin' };
    const [a, b] = checkPaste([fresh, twin], catalog);
    expect(a.kind).toBe('duplicate');
    expect(b.kind).toBe('duplicate');
    expect(matchReason(a.matches[0])).toBe('Looks like "Tempeh Noodles Twin" in this paste (same video link).');
    expect(a.matches[0].existing).toBeNull();
  });

  it('a recipe already in the same dish group is a known version, not a duplicate', () => {
    const v2 = { ...get('soya-pea-kebab'), id: 'soya-corn-kebab', title: 'Soya Corn Kebab', variant_label: 'with corn', source: { ...get('soya-pea-kebab').source, url: 'https://www.instagram.com/reel/NEW1/' } };
    const [v] = checkPaste([v2], catalog);
    expect(v.kind).toBe('ready');
    expect(v.notes.some((n) => n.startsWith('A version of'))).toBe(true);
  });

  it('a variant label already used in the group is an error', () => {
    const v2 = { ...get('soya-pea-kebab'), id: 'soya-pea-kebab-2', title: 'Soya Pea Kebab 2', source: { ...get('soya-pea-kebab').source, url: 'https://www.instagram.com/reel/NEW2/' } };
    expect(checkPaste([v2], catalog)[0].errors).toContain('variant_label "with peas" is already used in dish_group "soya-kebab".');
  });

  it('notes ingredient ids missing from the dictionary without blocking', () => {
    const [v] = checkPaste([fresh], catalog, new Set(['tempeh']));
    expect(v.kind).toBe('ready');
    expect(v.notes.join(' ')).toMatch(/Not in the ingredient dictionary yet: /);
  });
});

describe('versions', () => {
  const existing = get('besan-chilla');
  const r = { ...get('besan-chilla'), id: 'besan-chilla-paneer', title: 'Besan Chilla with Paneer' };

  it('joining an ungrouped recipe groups both and edits the existing file', () => {
    const { recipe, existingUpdate } = asVersion(r, existing, ' with paneer ', 'classic');
    expect(recipe).toMatchObject({ dish_group: 'besan-chilla', variant_label: 'with paneer' });
    expect(existingUpdate).toMatchObject({ id: 'besan-chilla', dish_group: 'besan-chilla', variant_label: 'classic' });
    expect(checkPaste([recipe], catalog.map((c) => (c.id === existing.id ? existingUpdate! : c)))[0].errors).toEqual([]);
  });

  it('joining an existing group leaves the other files alone', () => {
    const kebab = get('soya-pea-kebab');
    expect(asVersion(r, kebab, 'with besan', '').existingUpdate).toBeNull();
    expect(asVersion(r, kebab, 'with besan', '').recipe.dish_group).toBe('soya-kebab');
  });

  it('labels must be given, differ, and be new in the group', () => {
    expect(versionLabelProblem(existing, catalog, '', 'x')).toMatch(/different/);
    expect(versionLabelProblem(existing, catalog, 'a', '')).toMatch(/Besan Chilla/);
    expect(versionLabelProblem(existing, catalog, 'Same', 'same')).toBe('The two labels must differ.');
    expect(versionLabelProblem(get('soya-pea-kebab'), catalog, 'With Peas', '')).toMatch(/already a version/);
    expect(versionLabelProblem(get('soya-pea-kebab'), catalog, 'with corn', '')).toBeNull();
  });
});

describe('GitHub links', () => {
  it('new-file URL pre-fills the path and the 2-space JSON from site.config.json', () => {
    const url = newFileUrl('x-y', '{\n  "a": 1\n}\n');
    expect(url).toBe('https://github.com/Jatin17Solanki/protein-plate/new/main?filename=data%2Frecipes%2Fx-y.json&value=%7B%0A%20%20%22a%22%3A%201%0A%7D%0A');
  });

  it('pre-fills 2-space JSON, then one-line JSON, then falls back to copy + empty page', () => {
    const small = submission(get('protein-oats'));
    expect(small.url).not.toBeNull();
    expect(small.url!.length).toBeLessThanOrEqual(MAX_URL);
    expect(small.content).toBe(`${JSON.stringify(get('protein-oats'), null, 2)}\n`);
    expect(decodeURIComponent(small.url!.split('&value=')[1])).toBe(small.content);
    // Too long pretty-printed, fits on one line.
    const mid = { ...fresh, steps: [...fresh.steps, 'x'.repeat(MAX_URL - newFileUrl(fresh.id, `${JSON.stringify(fresh)}\n`).length - 400)] };
    const s = submission(mid);
    expect(decodeURIComponent(s.url!.split('&value=')[1])).toBe(`${JSON.stringify(mid)}\n`);
    expect(s.content).toBe(`${JSON.stringify(mid, null, 2)}\n`);
    const big = submission({ ...fresh, steps: [...fresh.steps, 'x'.repeat(MAX_URL)] });
    expect(big.url).toBeNull();
    expect(big.emptyUrl).toBe('https://github.com/Jatin17Solanki/protein-plate/new/main?filename=data%2Frecipes%2Ftempeh-chilli-noodles.json');
  });

  it('an existing file to update links to the GitHub editor', () => {
    const s = submission(get('besan-chilla'), true);
    expect(s.url).toBeNull();
    expect(s.emptyUrl).toBe('https://github.com/Jatin17Solanki/protein-plate/edit/main/data/recipes/besan-chilla.json');
  });
});

describe('prompts', () => {
  it('copy prompt = Track B prompt without its repo intro + chat notes + schema + dictionary + catalog index', () => {
    const text = buildAddPrompt({ prompt: 'Intro for repo sessions.\n\n---\n\nYou are adding recipes.', schema: { a: 1 }, dictionary: 'tempeh: tempeh', catalog, today: '2026-10-20' });
    expect(text.startsWith('You are adding recipes.')).toBe(true);
    expect(text).not.toContain('Intro for repo sessions');
    expect(text).toContain('`added_at`: `2026-10-20`');
    expect(text).toContain('{"a":1}');
    expect(text).toContain('tempeh: tempeh');
    expect(text).toContain(`## Catalog index (${catalog.length} recipes`);
    expect(text).toContain('besan-chilla | Besan Chilla | @Fixture Kitchen | https://www.instagram.com/reel/FIXTURE05/ | pulses | -');
  });

  it('catalog index: one line per recipe, sorted by id, dashes for nothing', () => {
    const lines = catalogIndex(catalog).split('\n');
    expect(lines).toHaveLength(catalog.length);
    expect(lines.find((l) => l.startsWith('protein-oats'))).toBe('protein-oats | Protein Oats | - | - | whey | -');
    expect(lines.find((l) => l.startsWith('soya-pea-kebab'))).toMatch(/\| soya-kebab$/);
  });

  it('fix-it prompt lists the problems and the record', () => {
    const text = fixItPrompt({ title: 'Tofu scramble' }, ['(root): must have required property \'id\'']);
    expect(text).toContain("- (root): must have required property 'id'");
    expect(text).toContain('"title": "Tofu scramble"');
  });
});
