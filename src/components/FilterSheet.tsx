import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Recipe } from '../types/recipe';
import {
  clearSheet, DISH_LABELS, DISH_TYPES, dishCount, filterRecipes, optionCounts, PROTEINS, QUICK,
  type Filters, type Personal,
} from '../lib/home';
import { DishIcon } from './Icon';
import { SortOptions, toggle } from './filterParts';

const FIRST_DISH_TYPES = 8;

/** Bottom sheet on phone, centred modal on tablet. Edits a draft; "Show N dishes" applies it, Close discards it. */
export function FilterSheet(props: {
  recipes: Recipe[];
  personal: Personal;
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const { recipes, personal } = props;
  const [draft, setDraft] = useState(props.filters);
  const [allTypes, setAllTypes] = useState(() => props.filters.dishTypes.some((d) => DISH_TYPES.indexOf(d) >= FIRST_DISH_TYPES));
  const counts = useMemo(() => optionCounts(recipes, draft, personal), [recipes, draft, personal]);
  const total = useMemo(() => dishCount(filterRecipes(recipes, draft, personal)), [recipes, draft, personal]);
  const sheet = useRef<HTMLDivElement>(null);

  // Layout effect: listeners must be live before the next key press, not after paint.
  useLayoutEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    sheet.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose();
      if (e.key === 'Tab' && sheet.current) {
        const els = sheet.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)');
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  const types = allTypes ? DISH_TYPES : DISH_TYPES.slice(0, FIRST_DISH_TYPES);

  return (
    <div class="scrim" onClick={(e) => e.target === e.currentTarget && props.onClose()}>
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="filters-title" ref={sheet} tabIndex={-1}>
        <div class="grabber" aria-hidden="true" />
        <div class="sheet-head">
          <h2 id="filters-title">Filters</h2>
          <button type="button" class="link-btn" onClick={() => setDraft(clearSheet(draft))}>Clear all</button>
        </div>

        <div class="sheet-body">
          <section class="sheet-section">
            <div class="section-head"><h3>Main protein</h3><span>any of these</span></div>
            <div class="wrap-row">
              {PROTEINS.map((p) => {
                const on = draft.proteins.includes(p.key);
                const n = counts.proteins[p.key];
                return (
                  <button key={p.key} type="button" class="protein-chip lg" data-tint={p.key} aria-pressed={on} disabled={!on && n === 0}
                    onClick={() => setDraft({ ...draft, proteins: toggle(draft.proteins, p.key) })}>
                    <span class="dot" />{p.label}<span class="count">{n}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section class="sheet-section">
            <div class="section-head"><h3>Dish type</h3><span>any of these</span></div>
            <div class="type-grid">
              {types.map((d) => {
                const on = draft.dishTypes.includes(d);
                const n = counts.dishTypes[d];
                return (
                  <button key={d} type="button" class="type-btn" aria-pressed={on} disabled={!on && n === 0}
                    onClick={() => setDraft({ ...draft, dishTypes: toggle(draft.dishTypes, d) })}>
                    <DishIcon type={d} size={24} />
                    <span class="type-label">{DISH_LABELS[d].short}</span>
                    <span class="count">{n}</span>
                  </button>
                );
              })}
            </div>
            {!allTypes && (
              <button type="button" class="link-btn" onClick={() => setAllTypes(true)}>Show all {DISH_TYPES.length} types</button>
            )}
          </section>

          <section class="sheet-section">
            <div class="section-head"><h3>Quick picks</h3><span>must match all</span></div>
            <div class="wrap-row">
              {QUICK.map((q) => {
                const on = draft.quick.includes(q.key);
                const n = counts.quick[q.key];
                return (
                  <button key={q.key} type="button" class="pick-chip" aria-pressed={on} disabled={!on && n === 0}
                    onClick={() => setDraft({ ...draft, quick: toggle(draft.quick, q.key) })}>
                    {q.label}<span class="count">{n}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <label class="toggle-row">
            <span>Show disliked recipes</span>
            <input type="checkbox" checked={draft.showDisliked} onChange={(e) => setDraft({ ...draft, showDisliked: e.currentTarget.checked })} />
          </label>

          <section class="sheet-section">
            <h3>Sort by</h3>
            <SortOptions name="sort-sheet" value={draft.sort} onChange={(sort) => setDraft({ ...draft, sort })} />
          </section>
        </div>

        <div class="sheet-foot">
          <button type="button" class="btn secondary" onClick={props.onClose}>Close</button>
          <button type="button" class="btn primary" onClick={() => props.onApply(draft)}>
            Show {total} {total === 1 ? 'dish' : 'dishes'}
          </button>
        </div>
      </div>
    </div>
  );
}
