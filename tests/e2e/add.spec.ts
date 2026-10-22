import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { heightFor, overflowOffenders, WIDTHS } from './helpers';

// A7: Add recipes (R5-Add). The catalog is the 10 fixtures; the paste holds one new recipe, one re-post of a
// fixture under a new id (same link → possible duplicate) and one broken record.
// No service worker here: its "Ready to work offline" toast would cover the screenshots.
test.use({ serviceWorkers: 'block' });

const fixture = (id: string) => JSON.parse(readFileSync(`tests/fixtures/${id}.json`, 'utf8'));
const wrap = fixture('paneer-tikka-wrap');
const fresh = {
  ...wrap,
  id: 'paneer-bhurji-wrap',
  title: 'Paneer Bhurji Wrap',
  source: { ...wrap.source, url: 'https://www.instagram.com/reel/NEWREEL1/', creator: 'Someone Else', creator_url: null, ref: null },
  ingredients: wrap.ingredients.filter((i: { type: string }) => i.type === 'protein' || i.type === 'spice'),
};
const repost = { ...fixture('soya-tikka-salad'), id: 'soya-chunk-salad', title: 'Soya Chunk Salad' };
const broken = { id: 'tofu-scramble', title: 'Tofu Scramble' };
const PASTE = `Here are your recipes:\n\`\`\`json\n${JSON.stringify([fresh, repost, broken], null, 2)}\n\`\`\``;

async function paste(page: Page, text = PASTE) {
  await page.getByRole('textbox', { name: 'Paste what it returned' }).fill(text);
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of WIDTHS) {
    test(`add ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: heightFor(width) });
      await page.addInitScript((t) => localStorage.setItem('pp.theme', t), theme);
      await page.goto('/add/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Add recipes');
      await paste(page);
      await expect(page.locator('.verdict')).toHaveCount(3);
      await page.evaluate(() => document.fonts.ready);
      expect(await overflowOffenders(page)).toEqual([]);
      await page.screenshot({ path: `test-results/screens/add-${width}-${theme}.png`, fullPage: true });
    });

    test(`export ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: heightFor(width) });
      await page.addInitScript((t) => localStorage.setItem('pp.theme', t), theme);
      await page.goto('/export/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Export catalog');
      await page.evaluate(() => document.fonts.ready);
      expect(await overflowOffenders(page)).toEqual([]);
      await page.screenshot({ path: `test-results/screens/export-${width}-${theme}.png`, fullPage: true });
    });
  }
}

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const clipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

  test('the + button opens Add recipes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Add recipes' }).click();
    await expect(page).toHaveURL(/\/add\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Add recipes');
  });

  test('Copy prompt = Track B prompt + schema + dictionary + catalog index', async ({ page }) => {
    await page.goto('/add/');
    await page.getByRole('button', { name: 'Copy prompt' }).click();
    await expect(page.locator('.toast')).toContainText('Prompt copied');
    const text = await clipboard(page);
    expect(text.startsWith('You are adding recipes to **Protein Plate**')).toBe(true);
    expect(text).toContain('## Schema (schema/recipe.schema.json)');
    expect(text).toContain('soya_chunks: soya chunks');
    expect(text).toContain('## Catalog index (11 recipes'); // archived ones included, so a re-added post is caught
    expect(text).toContain('soya-pea-kebab | Soya Pea Kebab | @Fixture Kitchen | https://www.instagram.com/reel/FIXTURE08/ | soya | soya-kebab');
  });

  test('verdicts: ready, possible duplicate with choices, error with fix-it prompt', async ({ page }) => {
    await page.goto('/add/');
    await paste(page);
    await expect(page.locator('#step3')).toHaveText('3Check · 3 recipes found');
    const [ready, dup, err] = [0, 1, 2].map((i) => page.locator('.verdict').nth(i));
    await expect(ready).toHaveClass(/ready/);
    await expect(ready).toContainText('Ready · Paneer');
    await expect(dup).toHaveClass(/duplicate/);
    await expect(dup).toContainText('Looks like "Soya Tikka Salad" already in the catalog (same video link).');
    await expect(err).toHaveClass(/error/);
    await expect(err).toContainText("must have required property 'source'");
    await expect(page.getByRole('button', { name: 'Submit 1 recipe' })).toBeEnabled();
    await expect(page.locator('.submit-block')).toContainText('Choose what to do with 1 possible duplicate first. 1 with errors is left out.');

    await err.getByRole('button', { name: 'Copy fix-it prompt' }).click();
    const fix = await clipboard(page);
    expect(fix).toContain('fails the checks');
    expect(fix).toContain('"title": "Tofu Scramble"');

    await dup.getByRole('button', { name: 'Skip' }).click();
    await expect(dup).toContainText('Skipped.');
    await dup.getByRole('button', { name: 'Change' }).click();
    await dup.getByRole('button', { name: 'Add anyway' }).click();
    await expect(page.getByRole('button', { name: 'Submit 2 recipes' })).toBeEnabled();
  });

  test('add as version groups both, then Submit lists GitHub pages to open', async ({ page }) => {
    await page.goto('/add/');
    await paste(page);
    const dup = page.locator('.verdict').nth(1);
    await dup.getByRole('button', { name: 'Add as version' }).click();
    await dup.getByRole('button', { name: 'Save' }).click();
    await expect(dup.getByRole('alert')).toHaveText('Say in a few words what makes this version different.');
    await dup.getByRole('textbox', { name: /What's different in "Soya Chunk Salad"/ }).fill('with chunks');
    await dup.getByRole('textbox', { name: /And in "Soya Tikka Salad"/ }).fill('classic');
    await dup.getByRole('button', { name: 'Save' }).click();
    await expect(dup).toContainText('Will be added as a version of "Soya Tikka Salad" (with chunks).');

    await page.getByRole('button', { name: 'Submit 2 recipes' }).click();
    const rows = page.locator('.send-row');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText('Paneer Bhurji Wrap');
    const href = await rows.nth(0).getByRole('link', { name: 'Open on GitHub' }).getAttribute('href');
    expect(href).toMatch(/^https:\/\/github\.com\/Jatin17Solanki\/protein-plate\/new\/main\?filename=data%2Frecipes%2Fpaneer-bhurji-wrap\.json&value=/);
    expect(JSON.parse(new URL(href!).searchParams.get('value')!)).toMatchObject({ id: 'paneer-bhurji-wrap' });
    const v = new URL((await rows.nth(1).getByRole('link', { name: 'Open on GitHub' }).getAttribute('href'))!).searchParams.get('value');
    expect(JSON.parse(v!)).toMatchObject({ id: 'soya-chunk-salad', dish_group: 'soya-tikka-salad', variant_label: 'with chunks' });
    await expect(rows.nth(2)).toContainText('Update "Soya Tikka Salad"');
    await expect(rows.nth(2).getByRole('link', { name: 'Open on GitHub' })).toHaveAttribute('href', 'https://github.com/Jatin17Solanki/protein-plate/edit/main/data/recipes/soya-tikka-salad.json');
    await rows.nth(2).getByRole('button', { name: 'Copy JSON' }).click();
    expect(JSON.parse(await clipboard(page))).toMatchObject({ id: 'soya-tikka-salad', dish_group: 'soya-tikka-salad', variant_label: 'classic' });
  });

  test('explains broken JSON and the GitHub step', async ({ page }) => {
    await page.goto('/add/');
    await paste(page, '[{"title": "x",}]');
    await expect(page.getByRole('alert')).toContainText("This isn't valid JSON");
    await page.getByRole('button', { name: 'How adding works' }).click();
    await expect(page.locator('.info-explainer')).toContainText("If it's someone else's");
  });
});

test.describe('export (phone)', () => {
  test.use({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const clipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

  test('copy prompt + catalog; personal data only when ticked', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pp.notes', JSON.stringify({ 'besan-chilla': 'Add more chilli' })));
    await page.goto('/export/');
    await expect(page.locator('.page-intro')).toContainText('10 recipes.');
    await page.getByRole('button', { name: 'Copy prompt + catalog' }).click();
    let text = await clipboard(page);
    expect(text.startsWith('You are helping me choose what to cook from **Protein Plate**')).toBe(true);
    expect(text).not.toContain('**My data**');
    expect(text).toContain('- Besan Chilla · ');
    expect(text).not.toContain('Add more chilli');
    await page.getByRole('checkbox', { name: /Include my notes/ }).check();
    await page.getByRole('button', { name: 'Copy prompt + catalog' }).click();
    text = await clipboard(page);
    expect(text).toContain('my note: "Add more chilli"');
    expect(text).toContain('- **My data** (only when included)');
  });

  test('copy link points at the live catalog.txt; the built page is plain text', async ({ page, request }) => {
    await page.goto('/export/');
    await page.getByRole('button', { name: 'Copy link' }).click();
    expect(await clipboard(page)).toBe('https://jatin17solanki.github.io/protein-plate/catalog.txt');
    const res = await request.get('/catalog.txt');
    expect(res.headers()['content-type']).toContain('text/plain');
    const body = await res.text();
    expect(body).toContain('10 high-protein vegetarian recipes');
    expect(body.match(/^## /gm)).toHaveLength(10);
  });

  test('catalog.json: the main catalog as structured JSON, no personal data', async ({ request }) => {
    const res = await request.get('/catalog.json');
    expect(res.headers()['content-type']).toContain('application/json');
    const file = await res.json();
    expect(file).toMatchObject({ kind: 'protein-plate-catalog', version: 1, count: 10, site: 'https://jatin17solanki.github.io/protein-plate/' });
    expect(file.recipes).toHaveLength(10);
    expect(file.recipes.every((r: { archived?: unknown }) => !r.archived)).toBe(true);
    expect('personal' in file).toBe(false);
  });

  test('download JSON saves every recipe', async ({ page }) => {
    await page.goto('/export/');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download JSON' }).click()]);
    expect(download.suggestedFilename()).toMatch(/^protein-plate-catalog-\d{4}-\d{2}-\d{2}\.json$/);
    const file = JSON.parse(readFileSync((await download.path())!, 'utf8'));
    expect(file).toMatchObject({ kind: 'protein-plate-catalog', count: 10 });
    expect(file.recipes).toHaveLength(10);
    expect(file.personal).toBeUndefined();
  });
});
