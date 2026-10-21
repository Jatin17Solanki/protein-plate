import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { archiveGroups, archiveLabel, splitArchived } from '../../src/lib/archive';
import { reviewItems } from '../../src/lib/review';
import { parse } from '../../src/lib/router';
import type { Recipe } from '../../src/types/recipe';

const read = (dir: string): Recipe[] =>
  readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
const active = read('tests/fixtures');
const archivedFixture = read('tests/fixtures/archived');
const all = [...active, ...archivedFixture];

const archive = (r: Recipe, reason: NonNullable<Recipe['archived']>['reason'], title = r.title): Recipe => ({ ...structuredClone(r), title, archived: { reason } });

describe('splitArchived', () => {
  it('keeps archived recipes out of the main catalog without dropping them', () => {
    const { active: a, archived } = splitArchived(all);
    expect(a.map((r) => r.id)).toEqual(active.map((r) => r.id));
    expect(archived.map((r) => r.id)).toEqual(['cucumber-mint-cooler']);
  });
});

describe('archiveGroups', () => {
  it('groups by reason in page order, sorted by title, without empty groups', () => {
    const list = [
      archive(active[0], 'sweet_snack', 'Zebra Laddu'),
      archive(active[1], 'sweet_snack', 'Apple Halwa'),
      ...archivedFixture,
      archive(active[2], 'staple', 'Homemade Paneer'),
    ];
    const groups = archiveGroups(list);
    expect(groups.map((g) => g.label)).toEqual(['Drinks & coolers', 'Sweets & snacks', 'Staples']);
    expect(groups[1].recipes.map((r) => r.title)).toEqual(['Apple Halwa', 'Zebra Laddu']);
  });
  it('labels every reason', () => {
    expect(archiveLabel('breakfast_bowl')).toBe('Breakfast bowls & oats');
  });
});

describe('review list', () => {
  it('leaves archived recipes out even when they carry flags', () => {
    const flagged = { ...archivedFixture[0], flags: [{ code: 'no_macros' as const, note: 'The creator gives no macros.' }] };
    expect(reviewItems([flagged]).length).toBe(0);
  });
});

describe('router', () => {
  it('parses the hidden archive page', () => {
    expect(parse('/protein-plate/archive/', '/protein-plate/')).toEqual({ name: 'archive' });
  });
});
