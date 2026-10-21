import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect, test, type Page } from '@playwright/test';

// A8: automated accessibility check (axe-core, the engine inside Lighthouse) on every screen and sheet, in light and
// dark, phone and desktop. Lighthouse only sees the light, closed page; this covers the rest.
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
test.use({ serviceWorkers: 'block' });

const STATES: { name: string; path: string; open?: (p: Page) => Promise<unknown>; phoneOnly?: boolean }[] = [
  { name: 'home', path: '/' },
  { name: 'filters', path: '/', open: (p) => p.getByRole('button', { name: 'Open filters' }).click(), phoneOnly: true },
  { name: 'menu', path: '/', open: (p) => p.getByRole('button', { name: 'Menu' }).click() },
  { name: 'search', path: '/', open: (p) => p.getByRole('searchbox', { name: 'Search a dish or ingredient' }).fill('paneer') },
  { name: 'empty', path: '/', open: (p) => p.getByRole('searchbox', { name: 'Search a dish or ingredient' }).fill('zzzz') },
  { name: 'recipe', path: '/r/soya-pea-kebab/' },
  { name: 'share', path: '/r/soya-pea-kebab/', open: (p) => p.locator('.action-row').getByRole('button', { name: 'Share' }).click() },
  { name: 'edit', path: '/r/soya-pea-kebab/', open: (p) => p.getByRole('button', { name: 'Edit' }).click() },
  { name: 'feedback', path: '/r/soya-pea-kebab/', open: (p) => p.getByRole('button', { name: 'Send feedback' }).click() },
  { name: 'incomplete', path: '/r/lasooni-dhaniya-paneer/' },
  { name: 'my', path: '/my/' },
  { name: 'add', path: '/add/', open: (p) => p.locator('textarea').fill(`[${readFileSync('tests/fixtures/besan-chilla.json', 'utf8')}, {"title": "x"}]`) },
  { name: 'export', path: '/export/' },
  { name: 'review', path: '/review/' },
  { name: 'archive', path: '/archive/' },
  { name: 'archived recipe', path: '/r/cucumber-mint-cooler/' },
  { name: 'not found', path: '/nope/' },
];

for (const theme of ['light', 'dark'] as const) {
  for (const width of [390, 1280]) {
    test.describe(`${theme} ${width}px`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: theme });
      for (const s of STATES) {
        if (s.phoneOnly && width >= 1024) continue;
        test(s.name, async ({ page }) => {
          await page.goto(s.path);
          await page.evaluate(() => document.fonts.ready);
          if (s.open) await s.open(page);
          await page.waitForTimeout(300); // sheet transition
          await page.addScriptTag({ content: axeSource });
          const violations = await page.evaluate(async () => {
            const axe = (window as unknown as { axe: { run: (c: Document, o: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe;
            const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] });
            return r.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
          });
          expect(violations).toEqual([]);
        });
      }
    });
  }
}
