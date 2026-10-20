import { recipes } from '../lib/catalog';
import { href } from '../lib/router';
import { UiIcon } from '../components/Icon';

// Minimal recipe screen so tiles lead somewhere; the full recipe page is A4.
export function RecipeStub({ id }: { id: string | null }) {
  const r = id === null ? undefined : recipes.find((x) => x.id === id);
  return (
    <div class="page">
      <a class="icon-btn back-btn" href={href.home()} aria-label="Back to all recipes">
        <UiIcon name="back" />
      </a>
      {r ? (
        <>
          <h1 class="page-title">{r.title}</h1>
          <p class="page-meta">
            {r.per_portion.protein_g !== null ? `${Math.round(r.per_portion.protein_g)} g protein` : 'Protein unknown'}
            {r.per_portion.kcal !== null && ` · ${Math.round(r.per_portion.kcal)} kcal`} per portion
          </p>
          {r.source.url && (
            <p>
              <a class="watch-btn" href={r.source.url} target="_blank" rel="noopener">Watch video</a>
            </p>
          )}
          <p class="page-meta">The full recipe page is coming soon.</p>
        </>
      ) : (
        <>
          <h1 class="page-title">{id === null ? 'Page not found' : 'Recipe not found'}</h1>
          <p class="page-meta">It may have been renamed or removed.</p>
        </>
      )}
    </div>
  );
}
