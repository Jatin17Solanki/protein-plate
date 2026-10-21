// Archive (/archive/): recipes kept out of the main catalog without deleting them (Jatin, 2026-10-21).
// Track B sets `archived` in the recipe file; removing it brings the recipe back everywhere.
import type { Recipe } from '../types/recipe';

export type ArchiveReason = NonNullable<Recipe['archived']>['reason'];

/** Page order and labels for the archive groups. */
export const ARCHIVE_INFO: { reason: ArchiveReason; label: string }[] = [
  { reason: 'drink', label: 'Drinks & coolers' },
  { reason: 'sweet_snack', label: 'Sweets & snacks' },
  { reason: 'breakfast_bowl', label: 'Breakfast bowls & oats' },
  { reason: 'sauce_dip', label: 'Sauces & dips' },
  { reason: 'condiment', label: 'Condiments' },
  { reason: 'staple', label: 'Staples' },
];

export const archiveLabel = (reason: ArchiveReason) => ARCHIVE_INFO.find((a) => a.reason === reason)?.label ?? reason;

/** Splits the bundled recipes: `active` feeds Home, search, My recipes, Review and the exports; `archived` only /archive/. */
export function splitArchived(all: Recipe[]): { active: Recipe[]; archived: Recipe[] } {
  return { active: all.filter((r) => !r.archived), archived: all.filter((r) => r.archived) };
}

/** Archived recipes grouped by reason (page order), each group sorted by title; empty groups left out. */
export function archiveGroups(archived: Recipe[]): { reason: ArchiveReason; label: string; recipes: Recipe[] }[] {
  return ARCHIVE_INFO.map(({ reason, label }) => ({
    reason,
    label,
    recipes: archived.filter((r) => r.archived?.reason === reason).sort((a, b) => a.title.localeCompare(b.title)),
  })).filter((g) => g.recipes.length > 0);
}
