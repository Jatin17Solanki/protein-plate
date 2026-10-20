// Personal data lives in this browser only, under `pp.*` keys (CLAUDE.md). A4 grows this module.
export const KEYS = {
  theme: 'pp.theme',
  myList: 'pp.myList',
} as const;

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
