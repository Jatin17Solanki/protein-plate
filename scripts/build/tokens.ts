// Reads colour values from design/tokens.css, so build-time output (images, manifest, theme-color) uses the app's tokens.
import { readFileSync } from 'node:fs';

/** `selector` is the start of the block to read: ':root {' (light) or ':root[data-theme="dark"] {'. */
export function readTokens(selector = ':root {', path = 'design/tokens.css'): Record<string, string> {
  const css = readFileSync(path, 'utf8');
  // A selector can appear more than once (e.g. a one-line `color-scheme` rule); use the first block that sets variables.
  for (let start = css.indexOf(selector); start !== -1; start = css.indexOf(selector, start + 1)) {
    const block = css.slice(start, css.indexOf('}', start));
    const vars = [...block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)];
    if (vars.length) return Object.fromEntries(vars.map((m) => [m[1], m[2].trim()]));
  }
  throw new Error(`No variables found for ${selector} in ${path}`);
}
