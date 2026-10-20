// BL1: "Others" protein, video-only recipes, accepted flags, estimated macros (Track B PR 18 data).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { recipeCard } from '../../scripts/build/pages';
import { buildAddPrompt, readyLine } from '../../src/lib/addRecipes';
import { catalogText, compactCatalog, macroText } from '../../src/lib/export';
import { filterRecipes, NEUTRAL_TINTS, NO_FILTERS, NO_PERSONAL, optionCounts, PROTEINS, shownProtein, summaryParts, tintOf, toTiles } from '../../src/lib/home';
import { reviewItems } from '../../src/lib/review';
import type { Recipe } from '../../src/types/recipe';

const DIR = 'tests/fixtures';
const all: Recipe[] = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const get = (id: string) => structuredClone(all.find((r) => r.id === id)!);

const pudding: Recipe = { ...get('protein-oats'), id: 'chocolate-pudding', title: 'Chocolate Pudding', main_proteins: ['other'], dish_group: null, variant_label: null };
const videoOnly: Recipe = {
  ...get('lasooni-dhaniya-paneer'), id: 'five-marinations', title: 'Five Paneer Marinations', video_only: true,
  missing: ['Written recipe (no caption; the video is the recipe)'],
};
const estimated: Recipe = {
  ...get('tempeh-chilli-noodles'), id: 'tacos', title: 'Tacos',
  per_portion: { ...get('tempeh-chilli-noodles').per_portion, protein_g: null, kcal: null }, stated_macros: null, servings: null,
  estimated_macros: { basis: 'whole recipe (4 tacos)', protein_g: 53, kcal: 1260, note: 'Rough estimate from the ingredients.' },
};
const recipes = [...all, pudding, videoOnly, estimated];

describe('"Others" protein', () => {
  it('is the last protein option, labelled Others, with a neutral tint', () => {
    expect(PROTEINS.at(-1)).toEqual({ key: 'other', label: 'Others' });
    expect(tintOf(pudding)).toBe('other');
    expect(NEUTRAL_TINTS).toContain('other');
  });

  it('filters, live counts and the summary line know it', () => {
    expect(filterRecipes(recipes, { ...NO_FILTERS, proteins: ['other'] }).map((r) => r.id)).toEqual(['chocolate-pudding']);
    expect(optionCounts(recipes, NO_FILTERS, NO_PERSONAL).proteins.other).toBe(1);
    expect(summaryParts({ ...NO_FILTERS, proteins: ['other'] })).toContain('Others');
  });

  it('tile says "Others", preview card is neutral, exports say Others', () => {
    const tile = toTiles([pudding]).find((t) => t.id === 'chocolate-pudding')!;
    expect(tile.tint).toBe('other');
    expect(tile.meta.startsWith('Others')).toBe(true);
    expect(recipeCard(pudding).tint).toBeNull();
    expect(compactCatalog([pudding], 'https://x/')).toContain(' · Others · ');
    expect(readyLine(pudding)).toContain(' · Others · ');
  });
});

describe('video-only recipes', () => {
  it('stay in the grid, with a "video only" tile and no protein figure', () => {
    expect(filterRecipes(recipes, NO_FILTERS).map((r) => r.id)).toContain('five-marinations');
    const tile = toTiles([videoOnly])[0];
    expect(tile).toMatchObject({ videoOnly: true, protein: '—', sortProtein: null });
    expect(tile.meta).toBe('Paneer · video only');
    expect(shownProtein(videoOnly).value).toBeNull();
  });

  it('sort with the no-number recipes (last)', () => {
    const tiles = toTiles(recipes);
    const i = tiles.findIndex((t) => t.id === 'five-marinations');
    expect(tiles.slice(i).every((t) => t.sortProtein === null)).toBe(true);
  });

  it('are kept off the review page', () => {
    expect(reviewItems([videoOnly])).toEqual([]);
    expect(reviewItems([{ ...videoOnly, video_only: false }])).toHaveLength(1);
  });

  it('preview card and exports say video only', () => {
    expect(recipeCard(videoOnly)).toMatchObject({ big: 'Video only', caption: 'the recipe is in the video' });
    expect(macroText(videoOnly)).toBe('video only (no written recipe)');
    expect(readyLine(videoOnly)).toContain('video only');
  });
});

describe('accepted flags', () => {
  it('hide the flags Jatin accepted, keep the rest', () => {
    const r: Recipe = { ...get('besan-chilla'), flags: [{ code: 'no_macros', note: 'x' }, { code: 'source_conflict', note: 'y' }], accepted_flags: ['no_macros'] };
    expect(reviewItems([r])[0].flags.map((f) => f.code)).toEqual(['source_conflict']);
    expect(reviewItems([{ ...r, flags: [{ code: 'no_macros', note: 'x' }] }])).toEqual([]);
  });

  it('an accepted missing_details stops the automatic "missing details" for an incomplete recipe', () => {
    const r = get('lasooni-dhaniya-paneer');
    expect(reviewItems([r])).toHaveLength(1);
    expect(reviewItems([{ ...r, accepted_flags: ['missing_details'] }])).toEqual([]);
  });
});

describe('estimated macros (recipe page only)', () => {
  it('never reach tiles, sorting, preview cards or exports', () => {
    expect(shownProtein(estimated)).toEqual({ value: null, whole: false });
    expect(toTiles([estimated])[0]).toMatchObject({ protein: '—', sortProtein: null });
    expect(recipeCard(estimated).big).toBe('Macros not given');
    expect(macroText(estimated)).toBe('macros not given');
    expect(catalogText([estimated], 'https://x/')).not.toContain('53');
  });
});

describe('Add recipes prompt', () => {
  it('points chats to §10 of the prompt instead of repeating its rules', () => {
    const text = buildAddPrompt({ prompt: 'x\n---\nbody', schema: {}, dictionary: '', catalog: [], today: '2026-10-21' });
    expect(text).toContain("Follow §10 above. Today's date (for `added_at`) is 2026-10-21.");
    expect(text).not.toContain('protein_working');
  });
});
