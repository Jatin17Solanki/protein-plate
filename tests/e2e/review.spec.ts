import { expect, test } from '@playwright/test';
import { heightFor, overflowOffenders, WIDTHS } from './helpers';

// A6b: hidden review page. Fixtures: besan-chilla (source_conflict + macros_basis_unclear),
// tempeh-chilli-noodles (no_macros), lasooni-dhaniya-paneer (incomplete, no flags → missing details).
for (const theme of ['light', 'dark'] as const) {
  for (const width of WIDTHS) {
    test(`review ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: heightFor(width) });
      await page.addInitScript((t) => localStorage.setItem('pp.theme', t), theme);
      await page.goto('/review/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review');
      await page.evaluate(() => document.fonts.ready);
      expect(await overflowOffenders(page)).toEqual([]);
      await page.screenshot({ path: `test-results/screens/review-${width}-${theme}.png`, fullPage: true });
    });
  }
}

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });

  test('lists flagged and incomplete recipes, per-recipe decisions first, with notes and links', async ({ page }) => {
    await page.goto('/review/');
    await expect(page.locator('.review-sub')).toHaveText('3 of 10 recipes need a look');
    await expect(page.locator('.review-title')).toHaveText(['Besan Chilla', 'Lasooni Dhaniya Paneer', 'Tempeh Chilli Noodles']);
    const first = page.locator('.review-card').first();
    await expect(first.locator('.flag-pill')).toHaveText(['Source conflict', 'Portions unclear']);
    await expect(first).toContainText('Soaking time: 3 hours in the ingredient list, 1 hour in the method.');
    await expect(first.getByRole('link', { name: 'Edit on GitHub' })).toHaveAttribute('href', /\/edit\/main\/data\/recipes\/besan-chilla\.json$/);
    await expect(first.getByRole('link', { name: 'Video' })).toHaveAttribute('href', 'https://www.instagram.com/reel/FIXTURE05/');
    await expect(page.locator('.review-card').nth(1)).toContainText('ingredients; quantities; method; macros');
  });

  test('filter chips narrow the list and live in the URL', async ({ page }) => {
    await page.goto('/review/');
    await page.getByRole('button', { name: /^No macros/ }).click();
    await expect(page.locator('.review-title')).toHaveText(['Tempeh Chilli Noodles']);
    await expect(page).toHaveURL(/\/review\/\?flag=no_macros$/);
    await expect(page.locator('.review-decide')).toContainText('The creator gives no numbers');
    await page.reload();
    await expect(page.locator('.review-title')).toHaveText(['Tempeh Chilli Noodles']);
    await page.getByRole('button', { name: /^All/ }).click();
    await expect(page.locator('.review-card')).toHaveCount(3);
  });

  test('copy title for chat; title opens the recipe and Back returns to the review', async ({ page }) => {
    await page.goto('/review/');
    await page.getByRole('button', { name: 'Copy the title "Besan Chilla"' }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Besan Chilla');
    await page.getByRole('link', { name: 'Besan Chilla' }).click();
    await expect(page).toHaveURL(/\/r\/besan-chilla\/$/);
    await page.getByRole('button', { name: 'Back to all recipes' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review');
  });

  test('not linked from the menu; marked noindex', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).not.toContainText('Review');
    await page.goto('/review/');
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
  });
});
