import { useMemo, useState } from 'preact/hooks';
import type { Recipe } from '../types/recipe';
import { clearSheet, DISH_LABELS, DISH_TYPES, optionCounts, PROTEINS, type Filters, type Personal } from '../lib/home';
import { SortOptions, toggle } from './filterParts';

const FIRST_DISH_TYPES = 5;

/** Desktop (≥1024) persistent filters: applies immediately. Quick picks stay as chips above the grid. */
export function Sidebar({ recipes, personal, filters, onChange }: {
  recipes: Recipe[];
  personal: Personal;
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const [allTypes, setAllTypes] = useState(false);
  const counts = useMemo(() => optionCounts(recipes, filters, personal), [recipes, filters, personal]);
  // Most-used types first; selected ones always visible.
  const ranked = [...DISH_TYPES].sort((a, b) => counts.dishTypes[b] - counts.dishTypes[a]);
  const types = allTypes ? ranked : ranked.filter((d, i) => i < FIRST_DISH_TYPES || filters.dishTypes.includes(d));

  return (
    <aside class="sidebar" aria-label="Filters">
      <div class="sidebar-head">
        <h2>Filters</h2>
        <button type="button" class="link-btn" onClick={() => onChange(clearSheet(filters))}>Clear all</button>
      </div>

      <fieldset>
        <legend>Main protein</legend>
        {PROTEINS.map((p) => {
          const on = filters.proteins.includes(p.key);
          const n = counts.proteins[p.key];
          return (
            <label key={p.key} class="check-row" data-tint={p.key}>
              <input type="checkbox" checked={on} disabled={!on && n === 0}
                onChange={() => onChange({ ...filters, proteins: toggle(filters.proteins, p.key) })} />
              <span class="dot" />
              <span class="check-label">{p.label}</span>
              <span class="count">{n}</span>
            </label>
          );
        })}
      </fieldset>

      <fieldset>
        <legend>Dish type</legend>
        {types.map((d) => {
          const on = filters.dishTypes.includes(d);
          const n = counts.dishTypes[d];
          return (
            <label key={d} class="check-row">
              <input type="checkbox" checked={on} disabled={!on && n === 0}
                onChange={() => onChange({ ...filters, dishTypes: toggle(filters.dishTypes, d) })} />
              <span class="check-label">{DISH_LABELS[d].long}</span>
              <span class="count">{n}</span>
            </label>
          );
        })}
        {!allTypes && (
          <button type="button" class="link-btn" onClick={() => setAllTypes(true)}>Show all {DISH_TYPES.length}</button>
        )}
      </fieldset>

      <label class="check-row">
        <input type="checkbox" checked={filters.showDisliked} onChange={(e) => onChange({ ...filters, showDisliked: e.currentTarget.checked })} />
        <span class="check-label">Show disliked recipes</span>
      </label>

      <fieldset>
        <legend>Sort</legend>
        <SortOptions name="sort-sidebar" value={filters.sort} onChange={(sort) => onChange({ ...filters, sort })} />
      </fieldset>
    </aside>
  );
}
