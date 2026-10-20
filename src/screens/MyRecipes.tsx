import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { recipes } from '../lib/catalog';
import { NO_MACROS, PROTEINS, shownProtein, tintOf } from '../lib/home';
import { goBack, href } from '../lib/router';
import { getMyList, getReactions, setOnMyList, setReaction, useStorage } from '../lib/storage';
import { FilledIcon, UiIcon } from '../components/Icon';
import type { Recipe } from '../types/recipe';

type Tab = 'liked' | 'myList' | 'disliked';
const TABS: { key: Tab; label: string }[] = [
  { key: 'liked', label: 'Liked' },
  { key: 'myList', label: 'My list' },
  { key: 'disliked', label: 'Disliked' },
];

const EMPTY: Record<Tab, string> = {
  liked: 'Tap Like on a recipe you enjoyed and it shows up here.',
  myList: 'Tap the bookmark on a recipe to save it to My list.',
  disliked: 'Recipes you dislike are hidden everywhere else and listed here, so you can undo.',
};

/** F5: Liked · My list · Disliked, with a one-tap way to undo each. */
export function MyRecipes() {
  useStorage();
  const [tab, setTab] = useState<Tab>('myList');
  useLayoutEffect(() => scrollTo(0, 0), []);
  useEffect(() => {
    document.title = 'My recipes · Protein Plate';
  }, []);

  const byId = new Map(recipes.map((r) => [r.id, r]));
  const reactions = getReactions();
  const lists: Record<Tab, Recipe[]> = {
    myList: getMyList().map((id) => byId.get(id)).filter((r): r is Recipe => !!r),
    liked: Object.keys(reactions).filter((id) => reactions[id] === 'like').map((id) => byId.get(id)).filter((r): r is Recipe => !!r),
    disliked: Object.keys(reactions).filter((id) => reactions[id] === 'dislike').map((id) => byId.get(id)).filter((r): r is Recipe => !!r),
  };
  const rows = lists[tab];

  return (
    <main class="my-page">
      <header class="my-head">
        <button type="button" class="icon-btn round" aria-label="Back" onClick={() => goBack()}>
          <UiIcon name="back" />
        </button>
        <h1>My recipes</h1>
      </header>

      <div class="segmented" role="tablist" aria-label="My recipes">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label} <span class="count">{lists[t.key].length}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p class="my-empty" role="tabpanel">{EMPTY[tab]}</p>
      ) : (
        <ul class="my-rows" role="tabpanel">
          {rows.map((r) => (
            <li key={r.id} class="my-row">
              <a class="my-link" href={href.recipe(r.id)}>
                <span class="my-block" data-tint={tintOf(r)}>
                  <span class="num">{shownProtein(r).value === null ? '—' : Math.round(shownProtein(r).value!)}</span>
                  <span class="my-block-unit">{shownProtein(r).whole ? 'g total' : 'g protein'}</span>
                </span>
                <span class="my-text">
                  <span class="my-name">{r.title}</span>
                  <span class="my-meta">
                    {[
                      r.main_proteins.map((p) => PROTEINS.find((x) => x.key === p)!.label).join(' + '),
                      r.video_only ? 'video only'
                        : r.status === 'incomplete' ? 'details pending'
                        : shownProtein(r).value === null ? NO_MACROS
                        : shownProtein(r).whole ? 'whole recipe'
                        : r.per_portion.kcal !== null ? `${Math.round(r.per_portion.kcal)} kcal` : '',
                    ].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </a>
              {tab === 'myList' && (
                <button type="button" class="icon-btn round row-action" aria-label={`Remove ${r.title} from My list`} onClick={() => setOnMyList(r.id, false)}>
                  <FilledIcon name="bookmark" size={18} />
                </button>
              )}
              {tab === 'liked' && (
                <button type="button" class="icon-btn round row-action" aria-label={`Unlike ${r.title}`} onClick={() => setReaction(r.id, null)}>
                  <UiIcon name="thumbsUp" size={18} />
                </button>
              )}
              {tab === 'disliked' && (
                <button type="button" class="undo-btn" aria-label={`Undo dislike for ${r.title}`} onClick={() => setReaction(r.id, null)}>
                  Undo
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <p class="info-box">
        <UiIcon name="info" size={18} />
        <span>Likes, dislikes, My list and notes are saved on this device only. Other people using this site have their own. To move yours, use <b>Back up</b> in the menu.</span>
      </p>
    </main>
  );
}
