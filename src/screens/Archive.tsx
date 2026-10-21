import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { archivedRecipes, recipes } from '../lib/catalog';
import { ARCHIVE_INFO, archiveGroups, type ArchiveReason } from '../lib/archive';
import { NO_MACROS, shownProtein, tintOf } from '../lib/home';
import { goBack, href } from '../lib/router';
import { FilledIcon, UiIcon } from '../components/Icon';

const groups = archiveGroups(archivedRecipes);

function readReason(): ArchiveReason | null {
  const r = new URLSearchParams(location.search).get('group');
  return ARCHIVE_INFO.some((x) => x.reason === r) ? (r as ArchiveReason) : null;
}

/**
 * Hidden admin page: recipes kept out of the main catalog (drinks, sweets, breakfast bowls, staples) without deleting
 * them. Read-only: to bring one back, tell the Track B session the recipe title and it removes `archived` from the file.
 */
export function Archive() {
  const [reason, setReason] = useState<ArchiveReason | null>(readReason);
  useLayoutEffect(() => scrollTo(0, 0), []);
  useEffect(() => {
    document.title = 'Archive · Protein Plate';
    // Keep the admin page out of search results (the static archive/ page already has the tag; in-app visits don't).
    if (document.querySelector('meta[name="robots"]')) return;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const pick = (r: ArchiveReason | null) => {
    setReason(r);
    history.replaceState(history.state, '', r ? `${href.archive()}?group=${r}` : href.archive());
  };
  const shown = reason ? groups.filter((g) => g.reason === reason) : groups;

  return (
    <main class="my-page review-page archive-page">
      <header class="my-head">
        <button type="button" class="icon-btn round" aria-label="Back" onClick={() => goBack()}>
          <UiIcon name="back" />
        </button>
        <div>
          <h1>Archive</h1>
          <p class="review-sub">
            {archivedRecipes.length} {archivedRecipes.length === 1 ? 'recipe' : 'recipes'} kept out of the catalog of {recipes.length}
          </p>
        </div>
      </header>

      <p class="info-box">
        <UiIcon name="info" size={18} />
        <span>
          Not linked in the menu. These stay out of Home, search, My recipes and the exports. To bring one back, tell the
          Track B session the <b>recipe title</b>.
        </span>
      </p>

      {groups.length === 0 ? (
        <p class="my-empty">Nothing archived.</p>
      ) : (
        <>
          <div class="chip-row review-chips" role="group" aria-label="Filter by group">
            <button type="button" class="quick-chip" aria-pressed={reason === null} onClick={() => pick(null)}>
              All <span class="count">{archivedRecipes.length}</span>
            </button>
            {groups.map((g) => (
              <button key={g.reason} type="button" class="quick-chip" aria-pressed={reason === g.reason} onClick={() => pick(g.reason)}>
                {g.label} <span class="count">{g.recipes.length}</span>
              </button>
            ))}
          </div>

          {shown.map((g) => (
            <section key={g.reason} class="archive-group" aria-labelledby={`archive-${g.reason}`}>
              <h2 id={`archive-${g.reason}`} class="section-title">{g.label}</h2>
              <ul class="review-list">
                {g.recipes.map((r) => {
                  const p = shownProtein(r);
                  return (
                    <li key={r.id} class="card review-card" data-tint={tintOf(r)}>
                      <div class="review-head">
                        <a class="review-title" href={href.recipe(r.id)}>{r.title}</a>
                      </div>
                      <p class="review-meta">
                        {p.value === null ? NO_MACROS : `${Math.round(p.value)} g protein${p.whole ? ', whole recipe' : ''}`}
                        {r.source.creator ? ` · ${r.source.creator}` : ''}
                      </p>
                      {r.source.url && (
                        <div class="review-links">
                          <a class="chip-btn" href={r.source.url} target="_blank" rel="noopener">
                            <FilledIcon name="play" size={12} />Video
                          </a>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}
    </main>
  );
}
