// Add recipes (DESIGN §4 row 12, PLAN A7): build the prompt, read what the AI returned, give each recipe a verdict
// and turn the ready ones into GitHub "new file" links. Pure — no DOM. The duplicate check is Track B's own
// findPairs (scripts/data/lib/dedupe.ts), so the app and the data scripts can never disagree.
import site from '../../site.config.json';
import { findPairs, type Layer } from '../../scripts/data/lib/dedupe';
import { canonicalUrl } from '../../scripts/data/lib/raw';
import type { Recipe } from '../types/recipe';
import { MEALS, PROTEINS, shownProtein } from './home';
import { checkRules, checkSchema } from './validate';

/** One line per recipe, so the AI can spot repeats and reuse dish groups. */
export function catalogIndex(recipes: Recipe[]): string {
  return [...recipes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((r) =>
      [r.id, r.title, r.source.creator ? `@${r.source.creator}` : '-', r.source.url ? canonicalUrl(r.source.url) : '-', r.main_proteins.join('+') || '-', r.dish_group ?? '-'].join(' | '),
    )
    .join('\n');
}

/** Only the ids and names: enough to pick `ingredient_id`, small enough to paste. */
export function dictionaryIndex(dict: { id: string; name: string; aliases?: string[] }[]): string {
  return dict.map((d) => {
    const extra = (d.aliases ?? []).filter((a) => a !== d.name).slice(0, 4);
    return `${d.id}: ${[d.name, ...extra].join(', ')}`;
  }).join('\n');
}

/**
 * The text "Copy prompt" puts on the clipboard: Track B's prompts/add-recipes.md (without its intro for repo
 * sessions), a short note for chats that can't open the repo, then the schema, dictionary and catalog index.
 */
export function buildAddPrompt(o: { prompt: string; schema: unknown; dictionary: string; catalog: Recipe[]; today: string }): string {
  const body = o.prompt.includes('\n---\n') ? o.prompt.slice(o.prompt.indexOf('\n---\n') + 5).trim() : o.prompt.trim();
  return [
    body,
    '---',
    '## You are in a chat, not in the repository',
    "- You can't open files or run the scripts in §8–9. Everything you need is below: the schema, the ingredient dictionary and the catalog index.",
    "- Use `ingredient_id` values from the dictionary. If an ingredient isn't in it, use `null` and add `New dictionary entry needed: <name>` to `assumptions[]`.",
    '- Fill `per_portion`, `protein_working` and `flags[]` yourself, following §4.',
    `- \`source.ref\`: \`null\`. \`added_at\`: \`${o.today}\`.`,
    "- If an entry's link is already in the catalog index, say so and leave it out. If it's a version of a catalog dish, reuse that `dish_group`.",
    '- Reply with the JSON array only, in one ```json code block.',
    '',
    '## Schema (schema/recipe.schema.json)',
    '```json',
    JSON.stringify(o.schema),
    '```',
    '',
    '## Ingredient dictionary (id: names)',
    o.dictionary,
    '',
    `## Catalog index (${o.catalog.length} recipes: id | title | creator | link | main proteins | dish_group)`,
    catalogIndex(o.catalog),
    '',
    '## Recipes to add',
    '(Paste each link with its caption below.)',
  ].join('\n');
}

/** Pulls the JSON out of an AI reply: code fences and chat around it are fine; one object counts as one recipe. */
export function parsePaste(text: string): { items: unknown[] } | { error: string } {
  const t = text.trim();
  if (!t) return { error: 'Paste what the AI returned first.' };
  const fenced = t.match(/```(?:json)?\s*\n([\s\S]*?)```/);
  const candidates = [fenced?.[1] ?? '', t];
  const start = t.search(/[[{]/);
  const end = Math.max(t.lastIndexOf(']'), t.lastIndexOf('}'));
  if (start >= 0 && end > start) candidates.push(t.slice(start, end + 1));
  for (const c of candidates) {
    if (!c.trim()) continue;
    try {
      const v: unknown = JSON.parse(c);
      if (Array.isArray(v)) return v.length ? { items: v } : { error: 'The list is empty: no recipes found.' };
      if (v && typeof v === 'object') return { items: [v] };
    } catch {}
  }
  return { error: "This isn't valid JSON. Copy the AI's whole reply (or just the JSON block) and paste it again." };
}

export interface Match {
  /** Catalog id, or the title of another recipe in the same paste. */
  id: string | null;
  title: string;
  layer: Layer;
  score: number;
  /** Already in the same dish_group: an intentional version, not a duplicate. */
  sameGroup: boolean;
  /** The other recipe, when it's in the catalog (for "Add as version"). */
  existing: Recipe | null;
}

export type Kind = 'ready' | 'duplicate' | 'error';

export interface Verdict {
  index: number;
  title: string;
  id: string | null;
  recipe: Recipe | null;
  kind: Kind;
  errors: string[];
  /** Non-blocking notes (dictionary gaps, rule warnings, known versions). */
  notes: string[];
  matches: Match[];
}

const titleOf = (v: unknown, i: number) => {
  const t = v && typeof v === 'object' ? (v as { title?: unknown }).title : undefined;
  return typeof t === 'string' && t.trim() ? t.trim() : `Recipe ${i + 1}`;
};
const idOf = (v: unknown) => {
  const id = v && typeof v === 'object' ? (v as { id?: unknown }).id : undefined;
  return typeof id === 'string' ? id : null;
};

/**
 * Schema + rules (the same checks CI runs), then ids against the catalog, then Track B's duplicate layers over
 * catalog + paste together, so repeats inside the paste are caught too.
 */
export function checkPaste(items: unknown[], catalog: Recipe[], dictionaryIds?: Set<string>): Verdict[] {
  const byId = new Map(catalog.map((r) => [r.id, r]));
  const seen = new Map<string, number>();
  const verdicts: Verdict[] = items.map((item, index) => {
    const v: Verdict = { index, title: titleOf(item, index), id: idOf(item), recipe: null, kind: 'ready', errors: [], notes: [], matches: [] };
    const schema = checkSchema(item);
    if (schema.length) {
      v.errors = schema;
      v.kind = 'error';
      return v;
    }
    const r = item as Recipe;
    const rules = checkRules(r);
    v.errors.push(...rules.errors);
    v.notes.push(...rules.warnings);
    const clash = byId.get(r.id);
    if (clash) v.errors.push(`id "${r.id}" is already used by "${clash.title}". If it's the same recipe, skip it; otherwise give it a new id.`);
    if (seen.has(r.id)) v.errors.push(`id "${r.id}" is also used by recipe ${seen.get(r.id)! + 1} in this paste.`);
    else seen.set(r.id, index);
    if (dictionaryIds) {
      const unknown = [...new Set([...r.ingredients.map((g) => g.ingredient_id), ...r.supporting_proteins].filter((x): x is string => !!x && !dictionaryIds.has(x)))];
      if (unknown.length) v.notes.push(`Not in the ingredient dictionary yet: ${unknown.join(', ')}. It can still be added; the dictionary gets them later.`);
    }
    if (r.dish_group) {
      const group = catalog.filter((x) => x.dish_group === r.dish_group);
      if (group.some((x) => x.variant_label === r.variant_label)) v.errors.push(`variant_label "${r.variant_label}" is already used in dish_group "${r.dish_group}".`);
    }
    v.recipe = r;
    if (v.errors.length) v.kind = 'error';
    return v;
  });

  // New recipes get a key that can't collide with a catalog id, so pairs say which side is new.
  const key = (i: number) => `\u0000new${i}`;
  const fresh = verdicts.filter((v) => v.recipe);
  const pairs = findPairs([...catalog, ...fresh.map((v) => ({ ...v.recipe!, id: key(v.index) }))]);
  const newIndex = (id: string) => (id.startsWith('\u0000new') ? Number(id.slice(4)) : null);
  for (const p of pairs) {
    const ia = newIndex(p.a);
    const ib = newIndex(p.b);
    if (ia === null && ib === null) continue;
    for (const [mine, other] of [[ia, p.b], [ib, p.a]] as const) {
      if (mine === null) continue;
      const otherNew = newIndex(other);
      const existing = otherNew === null ? byId.get(other)! : null;
      verdicts[mine].matches.push({
        id: existing?.id ?? null,
        title: existing?.title ?? verdicts[otherNew!].title,
        layer: p.layer,
        score: p.score,
        sameGroup: p.same_group,
        existing,
      });
    }
  }
  for (const v of verdicts) {
    if (v.kind !== 'ready') continue;
    for (const m of v.matches.filter((x) => x.sameGroup && x.layer !== 'same_link')) v.notes.push(`A version of "${m.title}" (same dish group).`);
    if (v.matches.some((m) => !m.sameGroup || m.layer === 'same_link')) v.kind = 'duplicate';
  }
  return verdicts;
}

/** Plain-language reason for the "possible duplicate" line, as in R5-Add. */
export function matchReason(m: Match): string {
  const where = m.existing ? `"${m.title}" already in the catalog` : `"${m.title}" in this paste`;
  const pct = Math.round(m.score * 100);
  const why = {
    same_link: 'same video link',
    same_creator_title: `same creator, ${pct}% similar title`,
    ingredient_overlap: `${pct}% same key ingredients and main protein`,
    possible_variant: `same dish type and main protein, ${pct}% shared key ingredients`,
  }[m.layer];
  return `Looks like ${where} (${why}).`;
}

/** "Ready · Paneer · 32 g protein · Breakfast, Lunch" */
export function readyLine(r: Recipe): string {
  const { value, whole } = shownProtein(r);
  const protein = r.status === 'incomplete' ? 'details pending' : value === null ? 'macros not given' : `${Math.round(value)} g protein${whole ? ' (whole recipe)' : ''}`;
  return [
    'Ready',
    r.main_proteins.map((p) => PROTEINS.find((x) => x.key === p)?.label ?? p).join(' + '),
    protein,
    MEALS.filter((m) => m.key !== 'all' && r.meal_types.values.includes(m.key)).map((m) => m.label).join(', '),
  ].filter(Boolean).join(' · ');
}

/** What to send back to the AI when a recipe fails the checks. */
export function fixItPrompt(item: unknown, errors: string[]): string {
  return [
    'This Protein Plate recipe record fails the checks. Fix only these problems, keep everything else exactly as it is, and reply with the corrected record as a one-item JSON array in a ```json code block.',
    '',
    'Problems:',
    ...errors.map((e) => `- ${e}`),
    '',
    'Record:',
    '```json',
    JSON.stringify(item, null, 2),
    '```',
  ].join('\n');
}

/** Kebab-case group name for a new version group, from the existing recipe. */
export function groupFor(existing: Recipe): string {
  return existing.dish_group ?? existing.id;
}

/**
 * "Add as version": the new recipe joins the existing recipe's dish group. When the existing one isn't in a group
 * yet, it needs the same dish_group and its own label too; that's an edit to its file (returned as `existingUpdate`).
 */
export function asVersion(r: Recipe, existing: Recipe, label: string, existingLabel: string): { recipe: Recipe; existingUpdate: Recipe | null } {
  const dish_group = groupFor(existing);
  const recipe = { ...r, dish_group, variant_label: label.trim() };
  const existingUpdate = existing.dish_group ? null : { ...existing, dish_group, variant_label: existingLabel.trim() };
  return { recipe, existingUpdate };
}

/** Labels must be filled in and differ from every other label in the group. Returns a message or null. */
export function versionLabelProblem(existing: Recipe, catalog: Recipe[], label: string, existingLabel: string): string | null {
  const l = label.trim();
  if (!l) return 'Say in a few words what makes this version different.';
  if (!existing.dish_group) {
    const e = existingLabel.trim();
    if (!e) return `Say in a few words what makes "${existing.title}" different.`;
    if (e.toLowerCase() === l.toLowerCase()) return 'The two labels must differ.';
    return null;
  }
  const used = catalog.filter((x) => x.dish_group === existing.dish_group).map((x) => (x.variant_label ?? '').toLowerCase());
  return used.includes(l.toLowerCase()) ? `"${l}" is already a version in this group.` : null;
}

/** Same layout as the files in data/recipes (2-space JSON, trailing newline): what "Copy JSON" copies. */
export function fileText(r: Recipe): string {
  return `${JSON.stringify(r, null, 2)}\n`;
}

/** GitHub's own page caps URLs at about 8 KB; longer ones fall back to "copy JSON" + an empty new-file page. */
export const MAX_URL = 8000;

/** GitHub "new file" page with the recipe pre-filled (owner commits; anyone else gets a fork + pull request). */
export function newFileUrl(id: string, content: string | null): string {
  const base = `https://github.com/${site.owner}/${site.repo}/new/${site.branch}?filename=${encodeURIComponent(`data/recipes/${id}.json`)}`;
  return content === null ? base : `${base}&value=${encodeURIComponent(content)}`;
}

export interface Submission {
  id: string;
  title: string;
  content: string;
  /** Pre-filled link, or null when it would be too long (then: copy + open the empty page). */
  url: string | null;
  emptyUrl: string;
  /** Edit an existing recipe's file (it joins a new version group). */
  edit: boolean;
}

export function submission(r: Recipe, edit = false): Submission {
  const content = fileText(r);
  const emptyUrl = edit ? `https://github.com/${site.owner}/${site.repo}/edit/${site.branch}/data/recipes/${r.id}.json` : newFileUrl(r.id, null);
  // Most recipes only fit pre-filled as one-line JSON (27 of 80 fit pretty-printed, 74 of 80 on one line).
  const url = edit ? null : [newFileUrl(r.id, content), newFileUrl(r.id, `${JSON.stringify(r)}\n`)].find((u) => u.length <= MAX_URL) ?? null;
  return { id: r.id, title: r.title, content, url, emptyUrl, edit };
}
