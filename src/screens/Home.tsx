import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { recipes } from '../lib/catalog';
import {
  bestRelaxation, filterRecipes, MEALS, NO_FILTERS, PROTEINS, QUICK, summaryParts, toTiles, type Filters, type Personal,
} from '../lib/home';
import { Searcher } from '../lib/search';
import { synonymGroups } from '../lib/synonyms';
import { readDisliked, readMyList, subscribe } from '../lib/storage';
import { href } from '../lib/router';
import { MenuIcon, UiIcon } from '../components/Icon';
import { Tile } from '../components/Tile';
import { FilterSheet } from '../components/FilterSheet';
import { Sidebar } from '../components/Sidebar';
import { EmptyState } from '../components/EmptyState';
import { toggle } from '../components/filterParts';
import { MenuSheet } from '../components/MenuSheet';
import { InstallHint } from '../components/InstallHint';

let searcher: Searcher | null = null;
const getSearcher = () => (searcher ??= new Searcher(recipes, synonymGroups));

const readPersonal = (): Personal => ({ myList: readMyList(), disliked: readDisliked() });

// Kept for this visit only, so coming back from a recipe restores filters, search and scroll.
const memory = { filters: NO_FILTERS, query: '', scrollY: 0 };
const dishes = (n: number) => `${n} ${n === 1 ? 'dish' : 'dishes'}`;

export function Home() {
  const [filters, setFilters] = useState<Filters>(memory.filters);
  const [query, setQuery] = useState(memory.query);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [personal, setPersonal] = useState(readPersonal);
  const searchInput = useRef<HTMLInputElement>(null);

  memory.filters = filters;
  memory.query = query;
  useLayoutEffect(() => {
    scrollTo(0, memory.scrollY);
    const onScroll = () => { memory.scrollY = scrollY; };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Re-read after Restore, a change in another tab, or anything else that writes personal data.
    return subscribe(() => setPersonal(readPersonal()));
  }, []);

  const q = query.trim();
  const hits = useMemo(() => (q ? getSearcher().search(q) : undefined), [q]);
  const candidates = useMemo(() => (hits ? recipes.filter((r) => hits.has(r.id)) : recipes), [hits]);
  const tiles = useMemo(
    () => toTiles(filterRecipes(candidates, filters, personal), filters.sort, hits),
    [candidates, filters, personal, hits],
  );
  const parts = summaryParts(filters);
  const active = parts.length > 0 || q !== '';
  const relax = useMemo(
    () => (tiles.length === 0 && parts.length ? bestRelaxation(candidates, filters, personal) : null),
    [tiles.length, candidates, filters, personal],
  );
  const nameMatches = tiles.filter((t) => t.nameMatch).length;

  const clearAll = () => {
    setFilters({ ...NO_FILTERS, sort: filters.sort });
    setQuery('');
  };

  return (
    <div class={`home${q ? ' searching' : ''}`}>
      <div class="topbar">
        <header class="home-header">
          <h1 class="logo num">protein<span>/</span>plate</h1>
          <button class="icon-btn search-back" type="button" aria-label="Back" onClick={() => setQuery('')}>
            <UiIcon name="back" />
          </button>
          <label class="search">
            <UiIcon name="search" size={18} />
            <input
              ref={searchInput}
              type="search"
              enterKeyHint="search"
              placeholder="Search a dish or ingredient"
              aria-label="Search a dish or ingredient"
              value={query}
              onInput={(e) => setQuery(e.currentTarget.value)}
            />
            {query && (
              <button type="button" class="search-clear" aria-label="Clear search" onClick={() => { setQuery(''); searchInput.current?.focus(); }}>
                <UiIcon name="x" size={16} />
              </button>
            )}
          </label>
          <button
            class={`icon-btn filter-btn${parts.length ? ' on' : ''}`}
            type="button"
            aria-label={parts.length ? `Filters, ${parts.length} active` : 'Open filters'}
            aria-haspopup="dialog"
            onClick={() => setSheetOpen(true)}
          >
            <UiIcon name="filters" />
            {parts.length > 0 && <span class="badge" aria-hidden="true">{parts.length}</span>}
          </button>
          <span class="header-spacer" />
          {/* Add comes alive in A7. */}
          <a class="text-btn my-recipes-btn" href={href.myRecipes()}>
            <UiIcon name="bookmark" size={16} />My recipes
          </a>
          <button class="icon-btn menu-btn" type="button" aria-label="Menu" aria-haspopup="dialog" onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </button>
          <button class="icon-btn add-btn" type="button" aria-label="Add recipes">
            <UiIcon name="plus" strokeWidth={2.4} />
            <span class="add-label">Add recipes</span>
          </button>
        </header>
      </div>

      <main class="home-main">
        <Sidebar recipes={candidates} personal={personal} filters={filters} onChange={setFilters} />

        <div class="results">
          <nav class="meal-tabs" aria-label="Meal">
            {MEALS.map((m) => (
              <button key={m.key} type="button" class="meal-tab" aria-pressed={filters.meal === m.key}
                onClick={() => setFilters({ ...filters, meal: m.key })}>
                {m.label}
              </button>
            ))}
          </nav>

          <div class="toolbar">
            <div class="chips">
              <div class="chip-row protein-row" role="group" aria-label="Main protein">
                {PROTEINS.map((p) => (
                  <button key={p.key} type="button" class="protein-chip" data-tint={p.key} aria-pressed={filters.proteins.includes(p.key)}
                    onClick={() => setFilters({ ...filters, proteins: toggle(filters.proteins, p.key) })}>
                    <span class="dot" />{p.label}
                  </button>
                ))}
              </div>
              <span class="chip-divider" aria-hidden="true" />
              <div class="chip-row" role="group" aria-label="Quick picks">
                {QUICK.map((qk) => (
                  <button key={qk.key} type="button" class="quick-chip" aria-pressed={filters.quick.includes(qk.key)}
                    onClick={() => setFilters({ ...filters, quick: toggle(filters.quick, qk.key) })}>
                    {qk.label}
                  </button>
                ))}
              </div>
            </div>

            {active && (
              <div class="summary" aria-live="polite">
                <span class="summary-text">
                  {q ? (
                    <>
                      <b>{dishes(tiles.length)}</b> match “{q}”{nameMatches > 0 && ` · ${nameMatches} by name`}
                      {parts.length > 0 && ` · ${parts.join(' · ')}`}
                    </>
                  ) : (
                    <>{parts.join(' · ')} — <b>{dishes(tiles.length)}</b></>
                  )}
                </span>
                <button type="button" class="link-btn" onClick={clearAll}>Clear</button>
              </div>
            )}
          </div>

          {tiles.length > 0 ? (
            <ul class="grid" aria-label={dishes(tiles.length)}>
              {tiles.map((t) => (
                <li key={t.id}><Tile tile={t} /></li>
              ))}
            </ul>
          ) : recipes.length === 0 ? (
            <p class="no-results">No recipes yet.</p>
          ) : (
            <EmptyState
              parts={parts}
              query={q}
              relax={relax}
              tint={filters.proteins[0] ?? 'none'}
              onRelax={(r) => setFilters(r.filters)}
              onClearAll={clearAll}
            />
          )}
        </div>
      </main>

      {sheetOpen && (
        <FilterSheet
          recipes={candidates}
          personal={personal}
          filters={filters}
          onApply={(f) => { setFilters(f); setSheetOpen(false); }}
          onClose={() => setSheetOpen(false)}
        />
      )}
      {menuOpen && <MenuSheet onClose={() => setMenuOpen(false)} />}
      <InstallHint />
    </div>
  );
}
