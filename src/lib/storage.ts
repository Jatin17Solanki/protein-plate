// Personal data lives in this browser only, under `pp.*` keys (DESIGN §6). Nothing here leaves the device.
// Every write notifies subscribers (and other tabs via the `storage` event), so screens stay in sync.
import { useEffect, useState } from 'preact/hooks';

export const KEYS = {
  theme: 'pp.theme',
  myList: 'pp.mylist',
  reactions: 'pp.reactions',
  notes: 'pp.notes',
  ticks: 'pp.ticks',
  hintDismissed: 'pp.hintDismissed',
  editHelpSeen: 'pp.editHelpSeen',
} as const;

export type Reaction = 'like' | 'dislike';

const listeners = new Set<() => void>();
let persistAsked = false;

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): keep working in memory for this visit.
  }
  if (!persistAsked) {
    persistAsked = true;
    // Ask the browser not to evict our data under storage pressure (best effort; no prompt in Chrome/Safari).
    navigator.storage?.persist?.().catch(() => {});
  }
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== 'undefined') {
  addEventListener('storage', (e) => {
    if (e.key === null || e.key.startsWith('pp.')) listeners.forEach((fn) => fn());
  });
}

/** Re-renders the calling component whenever personal data changes. */
export function useStorage(): void {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
}

function obj<T>(key: string): Record<string, T> {
  const v = readJSON<unknown>(key, {});
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, T>) : {};
}

// ---- Theme: 'light' | 'dark' | absent (Auto, follows the OS); applied as <html data-theme> ----
export type Theme = 'light' | 'dark' | 'auto';

export function getTheme(): Theme {
  try {
    const t = localStorage.getItem(KEYS.theme);
    return t === 'light' || t === 'dark' ? t : 'auto';
  } catch {
    return 'auto';
  }
}

export function setTheme(t: Theme): void {
  try {
    if (t === 'auto') localStorage.removeItem(KEYS.theme);
    else localStorage.setItem(KEYS.theme, t);
  } catch {}
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  listeners.forEach((fn) => fn());
}

// ---- Add-to-Home-Screen hint ----
export function isHintDismissed(): boolean {
  try {
    return localStorage.getItem(KEYS.hintDismissed) === '1';
  } catch {
    return true;
  }
}

export function dismissHint(): void {
  try {
    localStorage.setItem(KEYS.hintDismissed, '1');
  } catch {}
  listeners.forEach((fn) => fn());
}

/** Replaces all personal data at once (Restore). */
export function writeAll(d: {
  mylist: string[];
  reactions: Record<string, Reaction>;
  notes: Record<string, string>;
  ticks: Record<string, number[]>;
  theme: 'light' | 'dark' | null;
  hintDismissed: boolean;
}): void {
  try {
    localStorage.setItem(KEYS.myList, JSON.stringify(d.mylist));
    localStorage.setItem(KEYS.reactions, JSON.stringify(d.reactions));
    localStorage.setItem(KEYS.notes, JSON.stringify(d.notes));
    localStorage.setItem(KEYS.ticks, JSON.stringify(d.ticks));
    if (d.hintDismissed) localStorage.setItem(KEYS.hintDismissed, '1');
  } catch {}
  setTheme(d.theme ?? 'auto');
}

// ---- My list: string[] of recipe ids, most recent first ----
export function getMyList(): string[] {
  const ids = readJSON<unknown>(KEYS.myList, []);
  return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : [];
}

export function readMyList(): Set<string> {
  return new Set(getMyList());
}

export function setOnMyList(id: string, on: boolean): void {
  const rest = getMyList().filter((x) => x !== id);
  writeJSON(KEYS.myList, on ? [id, ...rest] : rest);
}

// ---- Like / Dislike: { [id]: 'like' | 'dislike' }; absent = no reaction ----
export function getReactions(): Record<string, Reaction> {
  const all = obj<unknown>(KEYS.reactions);
  return Object.fromEntries(Object.entries(all).filter(([, v]) => v === 'like' || v === 'dislike')) as Record<string, Reaction>;
}

export function getReaction(id: string): Reaction | null {
  return getReactions()[id] ?? null;
}

export function setReaction(id: string, r: Reaction | null): void {
  const all = getReactions();
  if (r) all[id] = r;
  else delete all[id];
  writeJSON(KEYS.reactions, all);
}

export function readDisliked(): Set<string> {
  return new Set(Object.entries(getReactions()).filter(([, v]) => v === 'dislike').map(([k]) => k));
}

// ---- Notes: { [id]: text } ----
export function getNote(id: string): string {
  const v = obj<unknown>(KEYS.notes)[id];
  return typeof v === 'string' ? v : '';
}

export function setNote(id: string, text: string): void {
  const all = obj<string>(KEYS.notes);
  if (text.trim()) all[id] = text;
  else delete all[id];
  writeJSON(KEYS.notes, all);
}

// ---- Ingredient ticks: { [id]: number[] } (ingredient indexes) ----
export function getTicks(id: string): number[] {
  const v = obj<unknown>(KEYS.ticks)[id];
  return Array.isArray(v) ? v.filter((x): x is number => Number.isInteger(x)) : [];
}

export function setTick(id: string, index: number, on: boolean): void {
  const all = obj<number[]>(KEYS.ticks);
  const next = getTicks(id).filter((i) => i !== index);
  if (on) next.push(index);
  if (next.length) all[id] = next.sort((a, b) => a - b);
  else delete all[id];
  writeJSON(KEYS.ticks, all);
}

export function clearTicks(id: string): void {
  const all = obj<number[]>(KEYS.ticks);
  delete all[id];
  writeJSON(KEYS.ticks, all);
}
