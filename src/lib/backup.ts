// Back up / Restore of personal data (DESIGN §6): one JSON file with every `pp.*` key.
// Restore merges into what's on this device; where both sides differ, the caller asks which to keep.
import { KEYS, readJSON } from './storage';

export const BACKUP_KIND = 'protein-plate-backup';

export interface BackupData {
  mylist: string[];
  reactions: Record<string, 'like' | 'dislike'>;
  notes: Record<string, string>;
  ticks: Record<string, number[]>;
  theme: 'light' | 'dark' | null;
  hintDismissed: boolean;
}

export interface BackupFile {
  kind: typeof BACKUP_KIND;
  version: 1;
  exported_at: string;
  data: BackupData;
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Coerces anything into clean BackupData (drops unknown or malformed entries). */
export function cleanData(v: unknown): BackupData {
  const d = isObj(v) ? v : {};
  const mylist = Array.isArray(d.mylist) ? [...new Set(d.mylist.filter((x): x is string => typeof x === 'string'))] : [];
  const reactions = Object.fromEntries(
    Object.entries(isObj(d.reactions) ? d.reactions : {}).filter(([, x]) => x === 'like' || x === 'dislike'),
  ) as BackupData['reactions'];
  const notes = Object.fromEntries(
    Object.entries(isObj(d.notes) ? d.notes : {}).filter(([, x]) => typeof x === 'string' && x.trim() !== ''),
  ) as BackupData['notes'];
  const ticks = Object.fromEntries(
    Object.entries(isObj(d.ticks) ? d.ticks : {})
      .map(([k, x]) => [k, Array.isArray(x) ? x.filter((i): i is number => Number.isInteger(i)) : []] as const)
      .filter(([, x]) => x.length > 0),
  );
  const theme = d.theme === 'light' || d.theme === 'dark' ? d.theme : null;
  return { mylist, reactions, notes, ticks, theme, hintDismissed: d.hintDismissed === true };
}

/** What's stored on this device now. */
export function currentData(): BackupData {
  let theme: unknown = null;
  let hint: unknown = null;
  try {
    theme = localStorage.getItem(KEYS.theme);
    hint = localStorage.getItem(KEYS.hintDismissed);
  } catch {}
  return cleanData({
    mylist: readJSON(KEYS.myList, []),
    reactions: readJSON(KEYS.reactions, {}),
    notes: readJSON(KEYS.notes, {}),
    ticks: readJSON(KEYS.ticks, {}),
    theme,
    hintDismissed: hint === '1',
  });
}

export function makeBackup(data: BackupData, now = new Date()): BackupFile {
  return { kind: BACKUP_KIND, version: 1, exported_at: now.toISOString(), data };
}

export function backupFileName(now = new Date()): string {
  return `protein-plate-backup-${now.toISOString().slice(0, 10)}.json`;
}

/** Parses a backup file's text. Throws a readable Error for anything that isn't one. */
export function parseBackup(text: string): BackupData {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    throw new Error("This file isn't a Protein Plate backup (it isn't valid JSON).");
  }
  if (!isObj(v) || v.kind !== BACKUP_KIND) throw new Error("This file isn't a Protein Plate backup.");
  if (v.version !== 1) throw new Error('This backup was made by a newer version of the site. Reload the page and try again.');
  return cleanData(v.data);
}

export interface Conflict {
  kind: 'reaction' | 'note';
  id: string;
}

/** Recipes where this device and the backup disagree (reaction or note text). */
export function conflicts(mine: BackupData, theirs: BackupData): Conflict[] {
  const out: Conflict[] = [];
  for (const [id, r] of Object.entries(theirs.reactions)) {
    if (mine.reactions[id] && mine.reactions[id] !== r) out.push({ kind: 'reaction', id });
  }
  for (const [id, n] of Object.entries(theirs.notes)) {
    if (mine.notes[id] && mine.notes[id].trim() !== n.trim()) out.push({ kind: 'note', id });
  }
  return out;
}

/**
 * Merge: My list is the union (this device's order first); reactions, notes and ticks from the backup fill gaps;
 * where both differ, `prefer` decides. Theme and hint follow this device unless it has none.
 */
export function merge(mine: BackupData, theirs: BackupData, prefer: 'mine' | 'backup'): BackupData {
  const pick = <T>(a: Record<string, T>, b: Record<string, T>) => (prefer === 'mine' ? { ...b, ...a } : { ...a, ...b });
  return {
    mylist: [...new Set([...mine.mylist, ...theirs.mylist])],
    reactions: pick(mine.reactions, theirs.reactions),
    notes: pick(mine.notes, theirs.notes),
    ticks: { ...theirs.ticks, ...mine.ticks },
    theme: mine.theme ?? theirs.theme,
    hintDismissed: mine.hintDismissed || theirs.hintDismissed,
  };
}

/** Counts for the "Restored …" message. */
export function summarize(d: BackupData): string {
  const n = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;
  return [
    n(d.mylist.length, 'on My list', 'on My list'),
    n(Object.keys(d.reactions).length, 'like/dislike', 'likes/dislikes'),
    n(Object.keys(d.notes).length, 'note'),
  ].join(', ');
}
