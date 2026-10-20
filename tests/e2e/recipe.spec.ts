import { expect, test, type Page } from '@playwright/test';
import { heightFor, overflowOffenders, WIDTHS } from './helpers';

// A4: recipe page, incomplete recipe, personal data, My recipes. Fixture build.
const SCREENS = [
  { name: 'recipe', path: '/r/soya-paneer-tikki/', ready: 'Soya Paneer Tikki' },
  { name: 'incomplete', path: '/r/lasooni-dhaniya-paneer/', ready: 'Lasooni Dhaniya Paneer' },
  { name: 'myrecipes', path: '/my/', ready: 'My recipes' },
];

const seed = (page: Page, theme: string) =>
  page.addInitScript((t) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('pp.theme', t);
    localStorage.setItem('pp.mylist', JSON.stringify(['soya-paneer-tikki', 'tofu-bhurji-toast', 'lasooni-dhaniya-paneer']));
    localStorage.setItem('pp.reactions', JSON.stringify({ 'soya-paneer-tikki': 'like', 'besan-chilla': 'dislike' }));
    localStorage.setItem('pp.notes', JSON.stringify({ 'soya-paneer-tikki': 'Half the chilli. Air-fry 12 min at 180°C.' }));
    localStorage.setItem('pp.ticks', JSON.stringify({ 'soya-paneer-tikki': [0, 1] }));
  }, theme);

for (const theme of ['light', 'dark'] as const) {
  for (const width of WIDTHS) {
    for (const s of SCREENS) {
      test(`${s.name} ${width}px ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: heightFor(width) });
        await seed(page, theme);
        await page.goto(s.path);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(s.ready);
        await page.evaluate(() => document.fonts.ready);
        expect(await overflowOffenders(page)).toEqual([]);
        await page.screenshot({ path: `test-results/screens/${s.name}-${width}-${theme}.png`, fullPage: true });
      });
    }
  }
}

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('recipe content: version line, chips, macros, sections, steps, credit', async ({ page }) => {
    await page.goto('/r/soya-paneer-tikki/');
    await expect(page.locator('.version-line.top')).toHaveText('Soya kebab · version 1 of 2');
    await expect(page.locator('.tag-chip')).toHaveText(['Soya', 'Paneer', 'Kebab / tikki', 'Snack · Dinner', 'Air fryer · optional']);
    await expect(page.locator('.macro-protein')).toHaveText('29 g');
    await expect(page.locator('.macro-note')).toContainText('Protein and kcal are our estimate.');
    await expect(page.locator('.ing-row').first()).toContainText('soya chunks');
    await expect(page.locator('.ing-row').first()).toContainText('60 g');
    await expect(page.locator('.steps li')).toHaveCount(4);
    await expect(page.locator('.credit')).toContainText('Recipe by Fixture Kitchen');
    await expect(page.getByRole('link', { name: 'Watch video' })).toHaveAttribute('href', 'https://www.instagram.com/reel/FIXTURE07/');
  });

  test('My list bookmark persists and shows in My recipes', async ({ page }) => {
    await page.goto('/r/besan-chilla/');
    await page.getByRole('button', { name: 'Add to My list' }).click();
    await expect(page.getByRole('button', { name: 'In My list' })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('button', { name: 'In My list' })).toBeVisible();
    await page.goto('/my/');
    await expect(page.locator('.my-row')).toHaveCount(1);
    await page.getByRole('button', { name: 'Remove Besan Chilla from My list' }).click();
    await expect(page.locator('.my-row')).toHaveCount(0);
  });

  test('Like / Dislike are exclusive, toggle off, and Dislike hides from home', async ({ page }) => {
    await page.goto('/r/besan-chilla/');
    const like = page.getByRole('button', { name: /^Like/ });
    await like.click();
    await expect(page.getByRole('button', { name: 'Liked' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Dislike' }).click();
    await expect(page.getByRole('button', { name: 'Disliked' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Like', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Back to all recipes' }).click();
    await expect(page.locator('.grid .tile')).toHaveCount(8);
    await page.goto('/my/');
    await page.getByRole('tab', { name: /Disliked/ }).click();
    await page.getByRole('button', { name: 'Undo dislike for Besan Chilla' }).click();
    await expect(page.locator('.my-row')).toHaveCount(0);
    await page.goto('/');
    await expect(page.locator('.grid .tile')).toHaveCount(9);
  });

  test('notes autosave and survive reload; empty note is removed', async ({ page }) => {
    await page.goto('/r/tofu-bhurji-toast/');
    await page.getByRole('textbox', { name: 'My notes' }).fill('Add extra pepper');
    await page.waitForTimeout(600);
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'My notes' })).toHaveValue('Add extra pepper');
    // Leaving before the 400 ms debounce still saves (back navigation is async: wait for Home).
    await page.getByRole('textbox', { name: 'My notes' }).fill('');
    await page.getByRole('button', { name: 'Back to all recipes' }).click();
    await expect(page.locator('.grid .tile').first()).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('pp.notes'))).toBe('{}');
  });

  test('a note typed just before reloading is not lost', async ({ page }) => {
    await page.goto('/r/tofu-bhurji-toast/');
    await page.getByRole('textbox', { name: 'My notes' }).fill('Typed fast');
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'My notes' })).toHaveValue('Typed fast');
  });

  test('ingredient ticks persist; Clear resets them', async ({ page }) => {
    await page.goto('/r/besan-chilla/');
    const boxes = page.locator('.ing-row input');
    await boxes.nth(0).check();
    await boxes.nth(2).check();
    await page.reload();
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(2)).toBeChecked();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.locator('.ing-row input:checked')).toHaveCount(0);
  });

  test('other versions link between versions of a dish', async ({ page }) => {
    await page.goto('/r/soya-paneer-tikki/');
    await page.locator('.version-card', { hasText: 'with peas' }).click();
    await expect(page).toHaveURL(/\/r\/soya-pea-kebab\/$/);
    await expect(page.locator('.version-line.top')).toHaveText('Soya kebab · version 2 of 2');
    await expect(page.locator('.version-card')).toHaveText([/with paneer/]);
  });

  test('incomplete recipe: missing card, no macros, Add details, notes still work', async ({ page }) => {
    await page.goto('/r/lasooni-dhaniya-paneer/');
    await expect(page.getByRole('heading', { name: 'Details missing' })).toBeVisible();
    await expect(page.locator('.missing-list li')).toHaveText(['Ingredients', 'Quantities', 'Method', 'Macros']);
    await expect(page.locator('.macro')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tried it?' })).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'My notes' })).toHaveAttribute('placeholder', /until the details are added/);
  });

  test('estimated macros: warning on the recipe page only, never on the tile (BL1)', async ({ page }) => {
    await page.goto('/r/besan-chilla/');
    const note = page.getByRole('note');
    await expect(note).toContainText("Rough estimate, not the creator's numbers");
    await expect(note).toContainText('about 42 g protein · 610 kcal, whole recipe (batter for 6).');
    await expect(page.locator('.macro-protein')).not.toContainText('42');
    await page.goto('/');
    await expect(page.getByRole('link', { name: /^Besan Chilla/ })).not.toContainText('42');
  });

  test('"Others" protein is offered last (BL1)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('group', { name: 'Main protein' }).getByRole('button').last()).toContainText('Others');
  });

  test('Back returns to Home with filters and scroll kept', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Global' }).click();
    await page.locator('.tile', { hasText: 'Tempeh Chilli Noodles' }).click();
    await page.getByRole('button', { name: 'Back to all recipes' }).click();
    await expect(page.getByRole('button', { name: 'Global' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Global' }).click();

    await page.evaluate(() => scrollTo(0, 250));
    await page.locator('.tile', { hasText: 'Besan Chilla' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Besan Chilla');
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.getByRole('button', { name: 'Back to all recipes' }).click();
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(250);
  });

  test('unknown recipe shows not found with a way home', async ({ page }) => {
    await page.goto('/r/does-not-exist/');
    await expect(page.getByRole('heading', { name: 'Recipe not found' })).toBeVisible();
    await page.getByRole('link', { name: 'All recipes' }).click();
    await expect(page.locator('.grid .tile').first()).toBeVisible();
  });
});

test('desktop: two columns, labelled Edit and My list, versions grid', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/r/soya-paneer-tikki/');
  await expect(page.getByRole('button', { name: 'Add to My list' })).toContainText('Add to My list');
  await expect(page.locator('.version-line.side')).toBeVisible();
  const a = await page.locator('.col-a').boundingBox();
  const b = await page.locator('.col-b').boundingBox();
  expect(Math.round(a!.width)).toBe(420);
  expect(b!.x).toBeGreaterThan(a!.x + 420);
  await page.goto('/');
  await page.getByRole('link', { name: 'My recipes' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('My recipes');
});
