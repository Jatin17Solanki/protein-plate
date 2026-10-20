import { useMemo, useState } from 'preact/hooks';
import { recipes } from '../lib/catalog';
import { filterRecipes, MEALS, NO_FILTERS, PROTEINS, QUICK, toTiles, type HomeFilters, type QuickKey } from '../lib/home';
import { readMyList } from '../lib/storage';
import { MenuIcon, UiIcon } from '../components/Icon';
import { Tile } from '../components/Tile';
import type { MainProtein } from '../types/recipe';

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function Home() {
  const [filters, setFilters] = useState<HomeFilters>(NO_FILTERS);
  const myList = useMemo(readMyList, []);
  const tiles = useMemo(() => toTiles(filterRecipes(recipes, filters, myList)), [filters, myList]);

  return (
    <div class="home">
      <div class="topbar">
        <header class="home-header">
          <h1 class="logo num">protein<span>/</span>plate</h1>
          {/* Search, filters, menu, add and My recipes come alive in A3, A5 and A7. */}
          <label class="search">
            <UiIcon name="search" size={18} />
            <input type="search" placeholder="Search a dish or ingredient" aria-label="Search a dish or ingredient" />
          </label>
          <button class="icon-btn filter-btn" type="button" aria-label="Open filters">
            <UiIcon name="filters" />
          </button>
          <span class="header-spacer" />
          <button class="text-btn my-recipes-btn" type="button">
            <UiIcon name="bookmark" size={16} />My recipes
          </button>
          <button class="icon-btn menu-btn" type="button" aria-label="Menu">
            <MenuIcon />
          </button>
          <button class="icon-btn add-btn" type="button" aria-label="Add recipes">
            <UiIcon name="plus" strokeWidth={2.4} />
            <span class="add-label">Add recipes</span>
          </button>
        </header>
      </div>

      <main class="home-main">
        <nav class="meal-tabs" aria-label="Meal">
          {MEALS.map((m) => (
            <button
              key={m.key}
              type="button"
              class="meal-tab"
              aria-pressed={filters.meal === m.key}
              onClick={() => setFilters({ ...filters, meal: m.key })}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <div class="chips">
          <div class="chip-row" role="group" aria-label="Main protein">
            {PROTEINS.map((p) => (
              <button
                key={p.key}
                type="button"
                class="protein-chip"
                data-tint={p.key}
                aria-pressed={filters.proteins.includes(p.key)}
                onClick={() => setFilters({ ...filters, proteins: toggle<MainProtein>(filters.proteins, p.key) })}
              >
                <span class="dot" />
                {p.label}
              </button>
            ))}
          </div>
          <span class="chip-divider" aria-hidden="true" />
          <div class="chip-row" role="group" aria-label="Quick picks">
            {QUICK.map((q) => (
              <button
                key={q.key}
                type="button"
                class="quick-chip"
                aria-pressed={filters.quick.includes(q.key)}
                onClick={() => setFilters({ ...filters, quick: toggle<QuickKey>(filters.quick, q.key) })}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {tiles.length > 0 ? (
          <ul class="grid" aria-label={`${tiles.length} dishes`}>
            {tiles.map((t) => (
              <li key={t.id}>
                <Tile tile={t} />
              </li>
            ))}
          </ul>
        ) : (
          <p class="no-results">{recipes.length === 0 ? 'No recipes yet.' : 'No dishes match these choices.'}</p>
        )}
      </main>
    </div>
  );
}
