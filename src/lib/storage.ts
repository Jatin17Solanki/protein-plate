// Personal data lives in this browser only, under `pp.*` keys (DESIGN §6). A4 grows this module.
export const KEYS = {
  theme: 'pp.theme',
  myList: 'pp.mylist',
  reactions: 'pp.reactions',
} as const;

export type Reaction = 'like' | 'dislike';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Recipe ids on My list. */
export function readMyList(): Set<string> {
  const ids = readJSON<unknown>(KEYS.myList, []);
  return new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : []);
}

/** Recipe ids marked Dislike (`pp.reactions` = { [id]: 'like' | 'dislike' }). */
export function readDisliked(): Set<string> {
  const map = readJSON<unknown>(KEYS.reactions, {});
  if (!map || typeof map !== 'object' || Array.isArray(map)) return new Set();
  return new Set(Object.entries(map as Record<string, unknown>).filter(([, v]) => v === 'dislike').map(([k]) => k));
}
