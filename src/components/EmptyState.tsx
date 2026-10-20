import type { Relaxation } from '../lib/home';
import type { MainProtein } from '../types/recipe';
import { DishIcon } from './Icon';

const NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const dishes = (n: number) => `${n} ${n === 1 ? 'dish' : 'dishes'}`;

/** R5-Empty: says why, offers the one removal that helps most, and Clear all. */
export function EmptyState({ parts, query, relax, tint, onRelax, onClearAll }: {
  parts: string[];
  query: string;
  relax: Relaxation | null;
  tint: MainProtein;
  onRelax: (r: Relaxation) => void;
  onClearAll: () => void;
}) {
  const constraints = parts.length + (query ? 1 : 0);
  const title = constraints === 2
    ? 'Nothing matches both'
    : constraints > 2
    ? `Nothing matches all ${NUM[constraints] ?? constraints}`
    : query ? `No dishes match “${query}”` : 'Nothing matches';
  const reason = relax
    ? `${dishes(relax.dishes)} ${relax.dishes === 1 ? 'matches' : 'match'} everything except “${relax.label}”.`
    : query ? 'Try another word, or check the spelling.' : 'Try fewer filters.';
  return (
    <div class="empty" role="status">
      <div class="empty-icon" data-tint={tint}><DishIcon type={null} size={44} /></div>
      <h2>{title}</h2>
      <p>{reason}</p>
      {relax && (
        <button type="button" class="btn primary" onClick={() => onRelax(relax)}>
          Remove “{relax.label}” · {dishes(relax.dishes)}
        </button>
      )}
      <button type="button" class={`btn ${relax ? 'secondary' : 'primary'}`} onClick={onClearAll}>
        {parts.length && query ? 'Clear search and filters' : parts.length ? 'Clear all filters' : 'Clear search'}
      </button>
    </div>
  );
}
