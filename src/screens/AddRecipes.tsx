import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import prompt from '../../prompts/add-recipes.md?raw';
import schema from '../../schema/recipe.schema.json';
import dictionary from '../../data/ingredients.json';
import { recipes } from '../lib/catalog';
import {
  asVersion, buildAddPrompt, checkPaste, dictionaryIndex, fixItPrompt, matchReason, parsePaste, readyLine, submission,
  versionLabelProblem, type Match, type Submission, type Verdict,
} from '../lib/addRecipes';
import { goBack } from '../lib/router';
import { copyText, showToast } from '../lib/toast';
import type { Recipe } from '../types/recipe';
import { UiIcon } from '../components/Icon';
import { InfoBox, InfoButton } from '../components/Info';

const dictionaryIds = new Set(dictionary.map((d) => d.id));

type Decision =
  | { kind: 'version'; recipe: Recipe; existingUpdate: Recipe | null; label: string; of: string }
  | { kind: 'anyway' }
  | { kind: 'skip' };

const copy = async (text: string, done: string) => showToast((await copyText(text)) ? done : "Couldn't copy. Try again.");

function VersionForm({ verdict, match, onDone, onCancel }: {
  verdict: Verdict;
  match: Match;
  onDone: (d: Decision) => void;
  onCancel: () => void;
}) {
  const existing = match.existing!;
  const [label, setLabel] = useState(verdict.recipe!.variant_label ?? '');
  const [existingLabel, setExistingLabel] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const save = (e: Event) => {
    e.preventDefault();
    const p = versionLabelProblem(existing, recipes, label, existingLabel);
    if (p) return setProblem(p);
    const v = asVersion(verdict.recipe!, existing, label, existingLabel);
    onDone({ kind: 'version', ...v, label: label.trim(), of: existing.title });
  };
  return (
    <form class="version-form" onSubmit={save}>
      <label>
        <span>What's different in "{verdict.title}"?</span>
        <input type="text" value={label} placeholder="e.g. with peas" maxLength={40} onInput={(e) => setLabel(e.currentTarget.value)} />
      </label>
      {!existing.dish_group && (
        <label>
          <span>And in "{existing.title}"?</span>
          <input type="text" value={existingLabel} placeholder="e.g. classic" maxLength={40} onInput={(e) => setExistingLabel(e.currentTarget.value)} />
        </label>
      )}
      {problem && <p class="form-error" role="alert">{problem}</p>}
      <div class="verdict-actions">
        <button type="submit" class="chip-btn strong">Save</button>
        <button type="button" class="chip-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function decisionText(d: Decision): string {
  if (d.kind === 'skip') return 'Skipped. It won’t be submitted.';
  if (d.kind === 'anyway') return 'Will be added as a new recipe.';
  return `Will be added as a version of "${d.of}" (${d.label}).${d.existingUpdate ? ` "${d.of}" gets a label too.` : ''}`;
}

function VerdictRow({ v, items, decision, onDecide }: {
  v: Verdict;
  items: unknown[];
  decision: Decision | undefined;
  onDecide: (d: Decision | undefined) => void;
}) {
  const [form, setForm] = useState(false);
  const top = v.matches.find((m) => !m.sameGroup || m.layer === 'same_link');
  const icon = v.kind === 'ready' ? 'check' : v.kind === 'duplicate' ? 'warn' : 'error';
  return (
    <li class={`verdict ${v.kind}`} data-decision={decision?.kind}>
      <span class={`verdict-icon ${icon}`} aria-hidden="true">{icon === 'check' ? '✓' : icon === 'warn' ? '!' : '×'}</span>
      <div class="verdict-body">
        <p class="verdict-title">{v.title}</p>
        {v.kind === 'ready' && <p class="verdict-text">{readyLine(v.recipe!)}</p>}
        {v.kind === 'duplicate' && top && (
          <p class="verdict-text">
            {matchReason(top)}
            {v.matches.length > 1 && ` ${v.matches.length - 1} more possible ${v.matches.length === 2 ? 'match' : 'matches'}.`}
          </p>
        )}
        {v.kind === 'error' && (
          <>
            <p class="verdict-text">Won't be submitted until fixed:</p>
            <ul class="verdict-errors">
              {v.errors.slice(0, 4).map((e) => <li key={e}>{e}</li>)}
              {v.errors.length > 4 && <li>…and {v.errors.length - 4} more</li>}
            </ul>
          </>
        )}
        {v.kind !== 'error' && v.notes.map((n) => <p key={n} class="verdict-note">{n}</p>)}

        {v.kind === 'duplicate' && !decision && !form && (
          <div class="verdict-actions">
            {top?.existing && <button type="button" class="chip-btn" onClick={() => setForm(true)}>Add as version</button>}
            <button type="button" class="chip-btn" onClick={() => onDecide({ kind: 'anyway' })}>Add anyway</button>
            <button type="button" class="chip-btn" onClick={() => onDecide({ kind: 'skip' })}>Skip</button>
          </div>
        )}
        {form && top?.existing && !decision && (
          <VersionForm verdict={v} match={top} onCancel={() => setForm(false)} onDone={(d) => { setForm(false); onDecide(d); }} />
        )}
        {decision && (
          <p class="verdict-decision">
            {decisionText(decision)}{' '}
            <button type="button" class="link-btn" onClick={() => onDecide(undefined)}>Change</button>
          </p>
        )}
        {v.kind === 'error' && (
          <div class="verdict-actions">
            <button type="button" class="chip-btn" onClick={() => copy(fixItPrompt(items[v.index], v.errors), 'Fix-it prompt copied. Paste it into the same chat.')}>
              <UiIcon name="copy" size={14} />Copy fix-it prompt
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function SendRow({ s }: { s: Submission }) {
  const [opened, setOpened] = useState(false);
  return (
    <li class="send-row" data-opened={opened}>
      <div class="send-text">
        <p class="verdict-title">{s.edit ? `Update "${s.title}"` : s.title}</p>
        <p class="verdict-text">
          {s.edit
            ? 'Joins the new version group. Copy, then replace the whole file on GitHub with it.'
            : s.url ? `data/recipes/${s.id}.json` : 'Too long to pre-fill. Copy it, then paste it into the empty file on GitHub.'}
        </p>
      </div>
      <div class="verdict-actions">
        {!s.url && (
          <button type="button" class="chip-btn" onClick={() => copy(s.content, 'Recipe JSON copied.')}>
            <UiIcon name="copy" size={14} />Copy JSON
          </button>
        )}
        <a class="chip-btn strong" href={s.url ?? s.emptyUrl} target="_blank" rel="noopener" onClick={() => setOpened(true)}>
          <UiIcon name="github" size={14} />{opened ? 'Opened' : 'Open on GitHub'}
        </a>
      </div>
    </li>
  );
}

/** R5-Add: copy the prompt → paste the AI's JSON → per-recipe check → open GitHub pre-filled. */
export function AddRecipes() {
  const [help, setHelp] = useState(false);
  const [text, setText] = useState('');
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [sent, setSent] = useState<Submission[] | null>(null);
  const sendRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => scrollTo(0, 0), []);
  useEffect(() => {
    document.title = 'Add recipes · Protein Plate';
  }, []);

  const parsed = useMemo(() => (text.trim() ? parsePaste(text) : null), [text]);
  const items = useMemo(() => (parsed && 'items' in parsed ? parsed.items : []), [parsed]);
  const verdicts = useMemo(() => checkPaste(items, recipes, dictionaryIds), [items]);
  useEffect(() => {
    setDecisions({});
    setSent(null);
  }, [text]);
  useEffect(() => {
    if (sent) sendRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [sent]);

  const chosen = verdicts.flatMap((v): { recipe: Recipe; update: Recipe | null }[] => {
    const d = decisions[v.index];
    if (v.kind === 'ready') return [{ recipe: v.recipe!, update: null }];
    if (v.kind !== 'duplicate' || !d || d.kind === 'skip') return [];
    return d.kind === 'anyway' ? [{ recipe: v.recipe!, update: null }] : [{ recipe: d.recipe, update: d.existingUpdate }];
  });
  const waiting = verdicts.filter((v) => v.kind === 'duplicate' && !decisions[v.index]).length;
  const errors = verdicts.filter((v) => v.kind === 'error').length;

  const copyPrompt = () =>
    copy(
      buildAddPrompt({ prompt, schema, dictionary: dictionaryIndex(dictionary), catalog: recipes, today: new Date().toISOString().slice(0, 10) }),
      'Prompt copied. Paste it into ChatGPT or Claude, then add your links and captions.',
    );

  const submit = () => {
    const updates = new Map<string, Recipe>();
    for (const c of chosen) if (c.update) updates.set(c.update.id, c.update);
    setSent([...chosen.map((c) => submission(c.recipe)), ...[...updates.values()].map((u) => submission(u, true))]);
  };

  return (
    <div class="step-page">
      <main class="my-page add-page">
        <header class="my-head">
          <button type="button" class="icon-btn round" aria-label="Back" onClick={() => goBack()}>
            <UiIcon name="back" />
          </button>
          <h1>Add recipes</h1>
          <span class="header-spacer-flex" />
          <InfoButton open={help} onToggle={() => setHelp(!help)} label="How adding works" />
        </header>
        {help && (
          <InfoBox>
            <p class="info-title">How this works</p>
            <p>Recipes live in a GitHub repository, not in this app. An AI chat turns a reel's caption into a recipe record; this page checks it, then opens GitHub with the recipe filled in, one page per recipe.</p>
            <p><b>If it's your repository:</b> tap Commit changes on each page. A check runs and the recipe appears here in about 2 minutes. A broken recipe never goes live.</p>
            <p><b>If it's someone else's:</b> GitHub makes you a copy and sends them the recipe as a suggestion. They decide whether to add it.</p>
            <p>You need a free GitHub account. Nothing is sent until you commit on GitHub.</p>
          </InfoBox>
        )}

        <section class="card step-card" aria-labelledby="step1">
          <h2 id="step1" class="step-head"><span class="step-num">1</span>Get the JSON from any AI chat</h2>
          <p class="step-text">Copy the prompt, paste it into ChatGPT or Claude, then add each reel link with its caption below it. One or many recipes at once.</p>
          <button type="button" class="btn outline" onClick={copyPrompt}>Copy prompt</button>
        </section>

        <section class="card step-card" aria-labelledby="step2">
          <h2 id="step2" class="step-head"><span class="step-num">2</span>Paste what it returned</h2>
          <textarea
            class="paste-box"
            aria-labelledby="step2"
            spellcheck={false}
            autocapitalize="off"
            autocomplete="off"
            placeholder={'[{ "id": "paneer-bhurji-wrap", "title": "Paneer Bhurji Wrap", … }, { … }]'}
            value={text}
            onInput={(e) => setText(e.currentTarget.value)}
          />
          {parsed && 'error' in parsed && <p class="form-error" role="alert">{parsed.error}</p>}
        </section>

        {verdicts.length > 0 && (
          <section class="card step-card" aria-labelledby="step3">
            <h2 id="step3" class="step-head">
              <span class="step-num">3</span>Check · {verdicts.length} {verdicts.length === 1 ? 'recipe' : 'recipes'} found
            </h2>
            <ul class="verdicts">
              {verdicts.map((v) => (
                <VerdictRow
                  key={`${v.index}-${v.id}`}
                  v={v}
                  items={items}
                  decision={decisions[v.index]}
                  onDecide={(d) => {
                    setSent(null);
                    setDecisions((all) => {
                      const next = { ...all };
                      if (d) next[v.index] = d;
                      else delete next[v.index];
                      return next;
                    });
                  }}
                />
              ))}
            </ul>
          </section>
        )}

        {verdicts.length > 0 && (
          <div class="submit-block">
            <button type="button" class="btn primary" disabled={chosen.length === 0} onClick={submit}>
              Submit {chosen.length} {chosen.length === 1 ? 'recipe' : 'recipes'}
            </button>
            <p class="sheet-note">
              {waiting > 0 ? `Choose what to do with ${waiting} possible ${waiting === 1 ? 'duplicate' : 'duplicates'} first. ` : ''}
              {errors > 0 ? `${errors} with errors ${errors === 1 ? 'is' : 'are'} left out. ` : ''}
              Opens a pre-filled GitHub page per recipe. They appear here a few minutes after you commit.
            </p>
          </div>
        )}

        {sent && (
          <section ref={sendRef} class="card step-card" aria-labelledby="step4">
            <h2 id="step4" class="step-head"><span class="step-num">4</span>Send to GitHub</h2>
            <p class="step-text">Open each one and tap <b>Commit changes</b> (or <b>Propose changes</b> if it isn't your repository).</p>
            <ul class="verdicts">
              {sent.map((s) => <SendRow key={`${s.edit}-${s.id}`} s={s} />)}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
