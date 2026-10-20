import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { recipes } from '../lib/catalog';
import { formatNumber, formatQty, groupIngredients, macroFootnote, tagChips, versionLine, versionsOf } from '../lib/recipe';
import { goBack, href } from '../lib/router';
import {
  clearTicks, getMyList, getNote, getReaction, getTicks, setNote, setOnMyList, setReaction, setTick, useStorage,
  type Reaction,
} from '../lib/storage';
import { PROTEINS } from '../lib/home';
import { FilledIcon, UiIcon } from '../components/Icon';
import type { Recipe as RecipeData } from '../types/recipe';

const proteinLabel = (k: string) => PROTEINS.find((p) => p.key === k)?.label ?? k;

export function Recipe({ id }: { id: string | null }) {
  useStorage();
  const r = id === null ? undefined : recipes.find((x) => x.id === id);

  useLayoutEffect(() => scrollTo(0, 0), [id]);
  useEffect(() => {
    if (r) document.title = `${r.title} · Protein Plate`;
  }, [r]);

  if (!r) {
    return (
      <div class="recipe-page">
        <div class="recipe-topbar"><BackButton /></div>
        <div class="recipe-missing">
          <h1 class="recipe-title">{id === null ? 'Page not found' : 'Recipe not found'}</h1>
          <p>It may have been renamed or removed.</p>
          <a class="btn primary" href={href.home()}>All recipes</a>
        </div>
      </div>
    );
  }

  const versions = versionsOf(r, recipes);
  const others = versions.filter((v) => v.id !== r.id);
  const onList = getMyList().includes(r.id);
  const incomplete = r.status === 'incomplete';
  const tint = r.main_proteins[0] ?? 'soya';
  const line = versionLine(r, versions);

  return (
    <div class="recipe-page" data-tint={tint}>
      <div class="recipe-topbar">
        <div class="recipe-topbar-inner">
          <BackButton />
          <a class="desk-logo logo num" href={href.home()}>protein<span>/</span>plate</a>
          {line && <span class="version-line top">{line}</span>}
          <span class="spacer" />
          {!incomplete && (
            // Edit sheet arrives in A5.
            <button type="button" class="icon-btn outline edit-btn" aria-label="Edit">
              <UiIcon name="pencil" size={18} /><span class="desk-label">Edit</span>
            </button>
          )}
          <button
            type="button"
            class={`icon-btn mylist-btn${onList ? ' on' : ' outline'}`}
            aria-pressed={onList}
            aria-label={onList ? 'In My list' : 'Add to My list'}
            onClick={() => setOnMyList(r.id, !onList)}
          >
            {onList ? <FilledIcon name="bookmark" size={18} /> : <UiIcon name="bookmark" size={18} />}
            <span class="desk-label">{onList ? 'In My list' : 'Add to My list'}</span>
          </button>
        </div>
      </div>

      <main class="recipe-body">
        <div class="col-a">
          {line && <p class="version-line side">{line}</p>}
          <h1 class="recipe-title">{r.title}</h1>
          <ul class="tag-chips" aria-label="Tags">
            {r.main_proteins.map((p) => (
              <li key={p} class="tag-chip protein" data-tint={p}>{proteinLabel(p)}</li>
            ))}
            {tagChips(r).map((t) => <li key={t} class="tag-chip">{t}</li>)}
          </ul>

          {incomplete ? <MissingCard r={r} /> : <MacroCard r={r} />}

          <div class="action-row">
            {r.source.url && (
              <a class="btn inv" href={r.source.url} target="_blank" rel="noopener">
                <FilledIcon name="play" size={16} />Watch video
              </a>
            )}
            {/* Share and Add details (Edit sheet) arrive in A5. */}
            <button type="button" class="btn secondary">
              {incomplete ? 'Add details' : <><UiIcon name="share" size={18} />Share</>}
            </button>
          </div>
          {r.source.creator && (
            <p class="credit">
              Recipe by{' '}
              {r.source.creator_url
                ? <a href={r.source.creator_url} target="_blank" rel="noopener">{r.source.creator}</a>
                : r.source.creator}
              {r.steps.length > 0 && '. Steps in our own words.'}
            </p>
          )}

          {!incomplete && <TriedIt id={r.id} />}
          <Notes id={r.id} incomplete={incomplete} />
        </div>

        <div class="col-b">
          {others.length > 0 && (
            <section class="versions" aria-labelledby="versions-h">
              <h2 id="versions-h" class="section-title">Other versions</h2>
              <ul class="versions-row">
                {others.map((v) => (
                  <li key={v.id}>
                    <a class="version-card" href={href.recipe(v.id)} data-tint={v.main_proteins[0] ?? 'soya'}>
                      <span class="num version-protein">
                        {v.per_portion.protein_g === null ? '—' : `${Math.round(v.per_portion.protein_g)} g`}
                      </span>
                      <span class="version-label">{v.variant_label}</span>
                      <span class="version-meta">
                        {v.status === 'incomplete' ? 'Need details' : v.per_portion.kcal !== null ? `${Math.round(v.per_portion.kcal)} kcal` : v.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {r.ingredients.length > 0 && <Ingredients r={r} />}

          {r.steps.length > 0 && (
            <section class="card steps" aria-labelledby="steps-h">
              <h2 id="steps-h" class="card-title">Steps</h2>
              <ol>
                {r.steps.map((s, i) => (
                  <li key={i}><span class="num step-no">{i + 1}</span><span>{s}</span></li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function BackButton() {
  return (
    <button type="button" class="icon-btn outline back" aria-label="Back to all recipes" onClick={() => goBack()}>
      <UiIcon name="back" />
      <span class="desk-label">All recipes</span>
    </button>
  );
}

function MacroCard({ r }: { r: RecipeData }) {
  const p = r.per_portion;
  const est = p.is_estimate;
  const cell = (v: number | null, label: string) => (
    <div class="macro-cell">
      <span class="macro-value">{v === null ? '—' : `${est ? '~' : ''}${formatNumber(Math.round(v))} g`}</span>
      <span class="macro-label">{label}{v !== null && est ? ' (est.)' : ''}</span>
    </div>
  );
  return (
    <section class="card macro" aria-label="Nutrition per portion">
      <div class="macro-band">
        <div>
          <div class="num macro-protein">{p.protein_g === null ? '—' : `${formatNumber(Math.round(p.protein_g))} g`}</div>
          <div class="macro-caption">protein per portion</div>
        </div>
        <div class="macro-kcal">
          <div class="num">{p.kcal === null ? '—' : Math.round(p.kcal)}</div>
          <div class="macro-caption">kcal</div>
        </div>
      </div>
      <div class="macro-row">
        {cell(p.carbs_g, 'carbs')}
        {cell(p.fat_g, 'fat')}
        {cell(p.fibre_g, 'fibre')}
      </div>
      <p class="macro-note">{macroFootnote(r)}</p>
      {r.protein_working.length > 0 && (
        <details class="working">
          <summary>How the protein adds up</summary>
          <ul>{r.protein_working.map((w) => <li key={w}>{w}</li>)}</ul>
        </details>
      )}
    </section>
  );
}

function MissingCard({ r }: { r: RecipeData }) {
  return (
    <section class="missing-card" aria-labelledby="missing-h">
      <div class="missing-head">
        <span class="missing-mark" aria-hidden="true">!</span>
        <h2 id="missing-h">Details missing</h2>
      </div>
      <p>Only part of this recipe is saved, so it doesn't count toward daily protein until the details are added.</p>
      <ul class="missing-list">
        {r.missing.map((m) => <li key={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</li>)}
      </ul>
    </section>
  );
}

function Ingredients({ r }: { r: RecipeData }) {
  const ticks = getTicks(r.id);
  const groups = groupIngredients(r.ingredients);
  return (
    <div class="ingredient-cards">
      {groups.map((g, gi) => (
        <section key={g.section ?? ''} class="card ingredients" aria-label={g.section ? `Ingredients, ${g.section}` : 'Ingredients'}>
          <div class="card-head">
            <h2 class="card-title">Ingredients{g.section ? ` · ${g.section}` : ''}</h2>
            {gi === 0 && (
              <button type="button" class="chip-btn" disabled={ticks.length === 0} onClick={() => clearTicks(r.id)}>
                <UiIcon name="reset" size={14} />Clear
              </button>
            )}
          </div>
          <ul>
            {g.items.map(({ ingredient: i, index }) => (
              <li key={index}>
                <label class="ing-row">
                  <input type="checkbox" checked={ticks.includes(index)} onChange={(e) => setTick(r.id, index, e.currentTarget.checked)} />
                  <span class="ing-name">{i.item}{i.optional ? ' (optional)' : ''}</span>
                  <span class="ing-qty">{formatQty(i)}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TriedIt({ id }: { id: string }) {
  const current = getReaction(id);
  const pick = (r: Reaction) => setReaction(id, current === r ? null : r);
  return (
    <section class="card tried" aria-labelledby="tried-h">
      <h2 id="tried-h" class="card-title">Tried it?</h2>
      <div class="tried-row">
        <button type="button" class="btn react" aria-pressed={current === 'like'} onClick={() => pick('like')}>
          <UiIcon name="thumbsUp" size={18} />{current === 'like' ? 'Liked' : 'Like'}
        </button>
        <button type="button" class="btn react" aria-pressed={current === 'dislike'} onClick={() => pick('dislike')}>
          <UiIcon name="thumbsDown" size={18} />{current === 'dislike' ? 'Disliked' : 'Dislike'}
        </button>
      </div>
      <p class="hint">Dislike hides it everywhere. Find it again in <a href={href.myRecipes()}>My recipes</a>.</p>
    </section>
  );
}

function Notes({ id, incomplete }: { id: string; incomplete: boolean }) {
  const [text, setText] = useState(() => getNote(id));
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(text);

  useEffect(() => {
    setText(getNote(id));
    latest.current = getNote(id);
    // Save anything still pending when leaving the recipe, hiding the tab or closing the page.
    const flush = () => {
      if (timer.current !== undefined) {
        clearTimeout(timer.current);
        timer.current = undefined;
        setNote(id, latest.current);
      }
    };
    const onHide = () => document.visibilityState === 'hidden' && flush();
    addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [id]);

  const onInput = (v: string) => {
    setText(v);
    latest.current = v;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setNote(id, v);
    }, 400);
  };

  return (
    <section class="card notes" aria-labelledby="notes-h">
      <h2 id="notes-h" class="card-title">My notes</h2>
      <textarea
        aria-labelledby="notes-h"
        placeholder={incomplete ? 'Jot what you see in the video until the details are added' : 'Your tweaks, e.g. half the chilli'}
        value={text}
        onInput={(e) => onInput(e.currentTarget.value)}
      />
      <p class="hint with-icon">
        <UiIcon name="info" size={14} />
        Saved on this device only. Use Back up in the menu to move it.
      </p>
    </section>
  );
}
