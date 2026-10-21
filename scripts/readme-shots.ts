// Screenshots for README.md (docs/readme/*.webp), taken from the real catalog at phone size (390 × 844, 2x).
// Usage: BASE_PATH=/ npm run build && BASE_PATH=/ npx vite preview --port 4300 & npx tsx scripts/readme-shots.ts
// Then commit docs/readme/. Pick recipes whose numbers and footnote read cleanly.
import { chromium, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SHOTS_URL ?? 'http://localhost:4300/';
const OUT = 'docs/readme';
const RECIPE = 'high-protein-pasta';

const SHOTS: { name: string; path: string; dark?: boolean; act?: (p: Page) => Promise<unknown> }[] = [
  { name: 'home', path: '' },
  { name: 'home-dark', path: '', dark: true },
  { name: 'filters', path: '', act: (p) => p.getByRole('button', { name: 'Open filters' }).click() },
  { name: 'search', path: '', act: (p) => p.getByRole('searchbox', { name: 'Search a dish or ingredient' }).fill('soya') },
  { name: 'recipe', path: `r/${RECIPE}/` },
  { name: 'share', path: `r/${RECIPE}/`, act: (p) => p.locator('.action-row').getByRole('button', { name: 'Share' }).click() },
  { name: 'add', path: 'add/' },
  { name: 'export', path: 'export/' },
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const s of SHOTS) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: s.dark ? 'dark' : 'light', serviceWorkers: 'block' });
  await ctx.addInitScript((id) => {
    localStorage.setItem('pp.hintDismissed', '1');
    localStorage.setItem('pp.mylist', JSON.stringify([id]));
    localStorage.setItem('pp.notes', JSON.stringify({ [id]: 'Less chilli, extra paneer for two.' }));
  }, RECIPE);
  const page = await ctx.newPage();
  await page.goto(BASE + s.path);
  await page.evaluate(() => document.fonts.ready);
  if (s.act) await s.act(page);
  await page.waitForTimeout(500);
  const png = `${OUT}/${s.name}.png`;
  await page.screenshot({ path: png });
  await ctx.close();
  // 75 % size, WebP q80 (~20–50 KB each). Needs Python 3 with Pillow.
  execFileSync('python3', ['-c', `from PIL import Image; im=Image.open('${png}').convert('RGB'); im=im.resize((im.width*3//4, im.height*3//4), Image.LANCZOS); im.save('${OUT}/${s.name}.webp','WEBP',quality=80,method=6)`]);
  execFileSync('rm', [png]);
  console.log(`${OUT}/${s.name}.webp`);
}
await browser.close();
