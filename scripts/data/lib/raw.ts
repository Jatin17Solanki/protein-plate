// Parses a raw batch file (private repo protein-plate-raw/batches/*.txt) into numbered entries.
// Entry N = the Nth line in the file that holds a recipe link; it runs until the next link line
// or a ---- separator. Pure (no fs), so the Add recipes screen (A7) can reuse it.

export interface RawEntry {
  /** 1-based; `source.ref` is `<batch path>#<n>`. */
  n: number;
  url: string;
  /** Text on the link line itself, e.g. "Chana Soya Galouti Kebab" in "Chana Soya Galouti Kebab: https://…". */
  label: string | null;
  /** Section heading above the entry, e.g. "AIR FRYER" (Jatin's categorisation hint). */
  section: string | null;
  /** "Recipe by @handle" credit, without the @. */
  credit: string | null;
  /** Every line of the entry after the link line, as written. */
  lines: string[];
  /** Lines that are Jatin's notes ("Notes: …"): categorisation hints, never recipe content. */
  notes: string[];
  /** Lines that carry recipe content: no notes, hashtag/keyword lists or blank lines. */
  content: string[];
}

const LINK = /https?:\/\/(?:www\.)?(?:instagram\.com|youtube\.com|youtu\.be)\/\S+/i;
const SEPARATOR = /^-{20,}\s*$/;
const HEADING = /^([A-Z][A-Za-z /&]+?):?\s*$/;

/** Keyword/hashtag lists creators paste under a caption: many short comma-separated phrases, no
 * quantities, no sentence (method lines also list many things, but end with a full stop or use "…, and x"). */
export function isKeywordLine(line: string): boolean {
  const t = line.trim().replace(/^\(|\)$/g, '');
  if (/^\d+\s?[wdhm]$/.test(t)) return true; // Instagram post age ("7w") pasted with the caption
  if (/^(#\w+\s*)+$/.test(t)) return true; // hashtag-only line
  const parts = t.split(',').map((p) => p.trim()).filter(Boolean);
  return (
    parts.length >= 5 &&
    !/\d/.test(t) &&
    !/[.!?:]/.test(t) &&
    !/,\s*(and|&)\s/i.test(t) &&
    parts.every((p) => p.split(/\s+/).length <= 5)
  );
}

export function isNoteLine(line: string): boolean {
  return /^\s*notes?\s*[:-]/i.test(line);
}

export function parseBatch(text: string): RawEntry[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const entries: RawEntry[] = [];
  let current: RawEntry | null = null;
  let section: string | null = null;
  let lastWasSeparator = false;

  for (const line of lines) {
    const separator = SEPARATOR.test(line);
    // Sections ("AIR FRYER:") start after a double separator and last until the next double one.
    if (separator && lastWasSeparator) section = null;
    lastWasSeparator = separator;
    const link = line.match(LINK);
    if (link) {
      const label = line.replace(link[0], '').replace(/^[\s:–-]+|[\s:–-]+$/g, '').trim() || null;
      current = { n: entries.length + 1, url: link[0], label, section, credit: null, lines: [], notes: [], content: [] };
      entries.push(current);
      continue;
    }
    if (separator) {
      current = null;
      continue;
    }
    if (!current) {
      const h = line.trim().match(HEADING);
      if (h && line.trim()) section = h[1].trim();
      continue;
    }
    current.lines.push(line);
    const t = line.trim();
    if (!t) continue;
    if (isNoteLine(t)) current.notes.push(t);
    else if (isKeywordLine(t)) continue;
    else {
      const credit = t.match(/^recipe by\s+@([\w.]+)/i);
      if (credit) current.credit = credit[1];
      current.content.push(t);
    }
  }
  return entries;
}

/** Reel/post id for Instagram, video id for YouTube, else the URL without query or trailing slash. */
export function linkKey(url: string): string {
  const ig = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/i);
  if (ig) return `ig:${ig[1]}`;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return `yt:${yt[1]}`;
  return url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/+$/, '');
}

/** Canonical link stored in `source.url`: https, no tracking query (`?hl=en`, `?igsh=`). */
export function canonicalUrl(url: string): string {
  const ig = url.match(/instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/i);
  if (ig) return `https://www.instagram.com/${ig[1] === 'reels' ? 'reel' : ig[1]}/${ig[2]}/`;
  return url.replace(/^http:/, 'https:').replace(/[?#].*$/, '');
}
