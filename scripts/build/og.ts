// Link-preview images (Open Graph, 1200×630) and app icons, rendered at build time with Satori → resvg.
// Fonts come from @fontsource (same files the app self-hosts); colours from design/tokens.css.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readTokens } from './tokens';

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}`));

let cache: Parameters<typeof satori>[1]['fonts'] | null = null;
function fonts() {
  return (cache ??= [
    { name: 'Jakarta', data: font('plus-jakarta-sans', 'plus-jakarta-sans-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Jakarta', data: font('plus-jakarta-sans', 'plus-jakarta-sans-latin-800-normal.woff'), weight: 800, style: 'normal' },
    { name: 'Grotesk', data: font('space-grotesk', 'space-grotesk-latin-700-normal.woff'), weight: 700, style: 'normal' },
  ]);
}

export const tokens = readTokens();

/** Minimal hyperscript for Satori (it takes React-like element objects; no React needed). */
type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});

async function png(node: Node, width: number, height: number): Promise<Buffer> {
  const svg = await satori(node as never, { width, height, fonts: fonts() });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng());
}

const logo = (size: number, color: string) =>
  h('div', { fontFamily: 'Grotesk', fontSize: size, fontWeight: 700, color, letterSpacing: -1 },
    'protein', h('span', { color: tokens.brand }, '/'), 'plate');

export interface OgCard {
  title: string;
  /** "31 g" or "Macros not given" */
  big: string;
  caption: string;
  meta: string;
  /** protein key for the tint, or null for neutral */
  tint: string | null;
}

/** 1200×630 card: big protein number on the protein tint, title, meta, logo. */
export function ogImage(c: OgCard): Promise<Buffer> {
  const bg = c.tint ? tokens[`${c.tint}-bg`] : tokens.muted;
  const fg = c.tint ? tokens[c.tint] : tokens.text2;
  const numeric = /\d/.test(c.big);
  return png(
    // Satori adds padding outside width/height (content-box), so the box is 1200×630 minus padding.
    h('div', { width: 1200 - 128, height: 630 - 112, background: bg, padding: '56px 64px', flexDirection: 'column', fontFamily: 'Jakarta' },
      h('div', { flexDirection: 'column', color: fg },
        h('div', { fontFamily: numeric ? 'Grotesk' : 'Jakarta', fontWeight: numeric ? 700 : 800, fontSize: numeric ? 160 : 80, lineHeight: 1, letterSpacing: numeric ? -5 : -1 }, c.big),
        h('div', { fontSize: 32, fontWeight: 600, marginTop: 10 }, c.caption)),
      h('div', { flexDirection: 'column', marginTop: 'auto' },
        h('div', { width: 1072, fontSize: c.title.length > 30 ? 52 : 64, fontWeight: 800, color: tokens.text, lineHeight: 1.12, letterSpacing: -1.5 }, c.title),
        h('div', { width: 1072, marginTop: 18, justifyContent: 'space-between', alignItems: 'center' },
          h('div', { fontSize: 28, fontWeight: 600, color: fg }, c.meta),
          logo(36, tokens.text)))),
    1200, 630,
  );
}

/** Square app icon: "p/" on brand green. `pad` shrinks the mark for maskable icons (safe zone). */
export function iconImage(size: number, pad = 0): Promise<Buffer> {
  const s = size * (1 - pad * 2);
  return png(
    h('div', { width: '100%', height: '100%', background: tokens.brand, alignItems: 'center', justifyContent: 'center' },
      h('div', { fontFamily: 'Grotesk', fontWeight: 700, fontSize: s * 0.62, color: tokens['on-brand'], letterSpacing: -s * 0.02, marginTop: -s * 0.08 },
        'p', h('span', { color: tokens['soya-bg'] }, '/'))),
    size, size,
  );
}
