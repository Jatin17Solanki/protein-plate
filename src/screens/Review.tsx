import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { recipes } from '../lib/catalog';
import { NO_MACROS, shownProtein, tintOf } from '../lib/home';
import { FLAG_INFO, flagCounts, flagLabel, reviewItems, withFlag, type FlagCode } from '../lib/review';
import { goBack, href } from '../lib/router';
import { editUrl } from '../lib/share';
import { copyText, showToast } from '../lib/toast';
import { FilledIcon, UiIcon } from '../components/Icon';

const items = reviewItems(recipes);
const counts = flagCounts(items);

function readFlag(): FlagCode | null {
  const f = new URLSearchParams(location.search).get('flag');
  return FLAG_INFO.some((x) => x.code === f) ? (f as FlagCode) : null;
}

/**
 * Hidden admin page (TRACKER D7): every flagged or incomplete recipe with its notes. Read-only: Jatin tells Track B
 * what to change by recipe title, and a flag disappears when the recipe file is fixed.
 */
export function Review() {
  const [flag, setFlag] = useState<FlagCode | null>(readFlag);
  useLayoutEffect(() => scrollTo(0, 0), []);
  useEffect(() => {
    document.title = 'Review · Protein Plate';
    // Keep the admin page out of search results.
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const pick = (code: FlagCode | null) => {
    setFlag(code);
    history.replaceState(history.state, '', code ? `${href.review()}?flag=${code}` : href.review());
  };
  const shown = withFlag(items, flag);
  const info = FLAG_INFO.find((f) => f.code === flag);

  return (
    <div class="my-page review-page">
      <header class="my-head">
        <button type="button" class="icon-btn round" aria-label="Back" onClick={() => goBack()}>
          <UiIcon name="back" />
        </button>
        <div>
          <h1>Review</h1>
          <p class="review-sub">
            {items.length} of {recipes.length} recipes need a look
          </p>
        </div>
      </header>

      <p class="info-box">
        <UiIcon name="info" size={18} />
        <span>
          Not linked in the menu. To resolve one, tell the Track B session the <b>recipe title</b> and your decision. The
          flag goes away once the recipe file is fixed and the site updates.
        </span>
      </p>

      <div class="chip-row review-chips" role="group" aria-label="Filter by flag">
        <button type="button" class="quick-chip" aria-pressed={flag === null} onClick={() => pick(null)}>
          All <span class="count">{items.length}</span>
        </button>
        {FLAG_INFO.filter((f) => counts[f.code] > 0).map((f) => (
          <button key={f.code} type="button" class="quick-chip" aria-pressed={flag === f.code} onClick={() => pick(f.code)}>
            {f.label} <span class="count">{counts[f.code]}</span>
          </button>
        ))}
      </div>
      {info && <p class="review-decide">{info.decide}</p>}

      {shown.length === 0 ? (
        <p class="my-empty">Nothing to review. 🎉</p>
      ) : (
        <ul class="review-list">
          {shown.map(({ recipe: r, flags }) => {
            const p = shownProtein(r);
            return (
              <li key={r.id} class="card review-card" data-tint={tintOf(r)}>
                <div class="review-head">
                  <a class="review-title" href={href.recipe(r.id)}>{r.title}</a>
                  <button
                    type="button"
                    class="chip-btn"
                    aria-label={`Copy the title "${r.title}"`}
                    onClick={async () => showToast((await copyText(r.title)) ? `Copied "${r.title}"` : "Couldn't copy.")}
                  >
                    <UiIcon name="copy" size={14} />Title
                  </button>
                </div>
                <p class="review-meta">
                  {r.status === 'incomplete' ? 'Incomplete' : p.value === null ? NO_MACROS : `${Math.round(p.value)} g protein${p.whole ? ', whole recipe' : ''}`}
                  {r.source.ref ? ` · ${r.source.ref}` : ''}
                </p>
                <ul class="review-flags">
                  {flags.map((f) => (
                    <li key={f.code + f.note}>
                      <span class={`flag-pill flag-${f.code}`}>{flagLabel(f.code)}</span>
                      <span class="flag-note">{f.note}</span>
                    </li>
                  ))}
                </ul>
                <div class="review-links">
                  {r.source.url && (
                    <a class="chip-btn" href={r.source.url} target="_blank" rel="noopener">
                      <FilledIcon name="play" size={12} />Video
                    </a>
                  )}
                  <a class="chip-btn" href={editUrl(r.id)} target="_blank" rel="noopener">
                    <UiIcon name="github" size={14} />Edit on GitHub
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
