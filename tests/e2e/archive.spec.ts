import { expect, test } from '@playwright/test';
import { heightFor, overflowOffenders, WIDTHS } from './helpers';

// Archive: recipes kept out of the main catalog. Fixture: tests/fixtures/archived/cucumber-mint-cooler.json (drink).
for (const theme of ['light', 'dark'] as const) {
  for (const width of WIDTHS) {
    test(`archive ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: heightFor(width) });
      await page.addInitScript((t) => localStorage.setItem('pp.theme', t), theme);
      await page.goto('/archive/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Archive');
      await page.evaluate(() => document.fonts.ready);
      expect(await overflowOffenders(page)).toEqual([]);
      await page.screenshot({ path: `test-results/screens/archive-${width}-${theme}.png`, fullPage: true });
    });
    test(`archived recipe ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: heightFor(width) });
      await page.addInitScript((t) => localStorage.setItem('pp.theme', t), theme);
      await page.goto('/r/cucumber-mint-cooler/');
      await expect(page.locator('.archived-note')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await overflowOffenders(page)).toEqual([]);
      await page.screenshot({ path: `test-results/screens/archived-recipe-${width}-${theme}.png`, fullPage: true });
    });
  }
}

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('lists archived recipes by group; the title opens the recipe, which says it is archived', async ({ page }) => {
    await page.goto('/archive/');
    await expect(page.locator('.review-sub')).toHaveText('1 recipe kept out of the catalog of 10');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Drinks & coolers']);
    await expect(page.locator('.review-title')).toHaveText(['Cucumber Mint Cooler']);
    await expect(page.getByRole('link', { name: 'Video' })).toHaveAttribute('href', 'https://www.instagram.com/reel/FIXTURE11/');
    await page.getByRole('link', { name: 'Cucumber Mint Cooler' }).click();
    await expect(page).toHaveURL(/\/r\/cucumber-mint-cooler\/$/);
    await expect(page.locator('.archived-note')).toContainText('Archived · Drinks & coolers');
    await page.locator('.archived-note').getByRole('link', { name: 'archive' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Archive');
  });

  test('group chips filter and live in the URL', async ({ page }) => {
    await page.goto('/archive/');
    await page.getByRole('button', { name: /^Drinks & coolers/ }).click();
    await expect(page).toHaveURL(/\/archive\/\?group=drink$/);
    await page.reload();
    await expect(page.locator('.review-title')).toHaveText(['Cucumber Mint Cooler']);
  });

  test('archived recipes stay out of Home, search, Review and the export', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.tile', { hasText: 'Cucumber Mint Cooler' })).toHaveCount(0);
    await page.getByRole('searchbox', { name: 'Search a dish or ingredient' }).fill('cucumber mint cooler');
    await expect(page.locator('.tile', { hasText: 'Cucumber Mint Cooler' })).toHaveCount(0);
    await page.goto('/review/');
    await expect(page.locator('.review-sub')).toHaveText('3 of 10 recipes need a look');
    await page.goto('/export/');
    await expect(page.getByText('10 recipes.', { exact: false })).toBeVisible();
    const txt = await (await page.request.get('/catalog.txt')).text();
    expect(txt).not.toContain('Cucumber Mint Cooler');
  });

  test('not linked from the menu; marked noindex', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).not.toContainText('Archive');
    await page.goto('/archive/');
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
  });
});
