import { expect, test, type Page } from '@playwright/test';
import { heightFor, overflowOffenders, WIDTHS } from './helpers';

// A3: filter sheet (phone/tablet), sidebar (desktop), search, summary line, empty state. Fixture build.
const tiles = (page: Page) => page.locator('.grid .tile');

for (const theme of ['light', 'dark'] as const) {
  for (const width of WIDTHS) {
    test(`filters ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: heightFor(width) });
      await page.addInitScript((t) => localStorage.setItem('pp.theme', t), theme);
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      if (width < 1024) {
        await page.getByRole('button', { name: 'Open filters' }).click();
        const sheet = page.getByRole('dialog', { name: 'Filters' });
        await expect(sheet).toBeVisible();
        await sheet.getByRole('button', { name: /^Soya/ }).click();
        await expect(sheet.getByRole('button', { name: /^Show 2 dishes$/ })).toBeVisible();
      } else {
        await expect(page.getByRole('complementary', { name: 'Filters' })).toBeVisible();
        await page.getByRole('checkbox', { name: /Soya/ }).check();
        await expect(page.locator('.summary')).toContainText('Soya — 2 dishes');
      }
      expect(await overflowOffenders(page)).toEqual([]);
      await page.screenshot({ path: `test-results/screens/filters-${width}-${theme}.png` });
    });
  }
}

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('sheet: live counts, zero options disabled, apply and badge', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Snack' }).click();
    await page.getByRole('button', { name: 'Filters, 1 active' }).click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await expect(sheet.getByRole('button', { name: /^Soya\s*1$/ })).toBeEnabled();
    await expect(sheet.getByRole('button', { name: /^Tofu\s*0$/ })).toBeDisabled();
    await sheet.getByRole('button', { name: /^Air fryer/ }).click();
    await sheet.getByRole('button', { name: /^Show 1 dish$/ }).click();
    await expect(sheet).toBeHidden();
    await expect(tiles(page)).toHaveCount(1);
    await expect(page.locator('.summary')).toContainText('Snack · Air fryer — 1 dish');
    await expect(page.getByRole('button', { name: 'Filters, 2 active' })).toContainText('2');
    await page.locator('.summary').getByRole('button', { name: 'Clear' }).click();
    await expect(tiles(page)).toHaveCount(9);
    await expect(page.locator('.summary')).toHaveCount(0);
  });

  test('sheet: Close discards changes, Escape closes, Show all 13 types', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open filters' }).click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await expect(sheet.locator('.type-btn')).toHaveCount(8);
    await sheet.getByRole('button', { name: 'Show all 13 types' }).click();
    await expect(sheet.locator('.type-btn')).toHaveCount(13);
    await sheet.getByRole('button', { name: /^Tofu/ }).click();
    await sheet.getByRole('button', { name: 'Close' }).click();
    await expect(tiles(page)).toHaveCount(9);
    await page.getByRole('button', { name: 'Open filters' }).click();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });

  test('sort by calories, low to high', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open filters' }).click();
    await page.getByRole('radio', { name: 'Calories, low to high' }).check();
    await page.getByRole('button', { name: /^Show 9 dishes$/ }).click();
    await expect(tiles(page).first()).toContainText('Soya kebab');
    await expect(tiles(page).last()).toContainText('Rajma Rice Bowl');
  });

  test('search: synonyms, "uses" badge, name matches first, search mode, back', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('searchbox').fill('dahi');
    await expect(tiles(page)).toHaveCount(2);
    await expect(tiles(page).first()).toContainText('uses curd');
    await expect(page.locator('.summary')).toContainText('2 dishes match “dahi”');
    await expect(page.locator('.meal-tabs')).toBeHidden();
    await page.getByRole('searchbox').fill('paneer');
    await expect(tiles(page).first()).toContainText('Paneer Tikka Wrap');
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(tiles(page)).toHaveCount(9);
    await page.screenshot({ path: 'test-results/screens/search-390-light.png' });
  });

  test('empty state offers the removal that helps most', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Breakfast' }).click();
    await page.getByRole('button', { name: 'Tofu' }).click();
    await page.getByRole('button', { name: 'Air fryer' }).click();
    await expect(page.getByRole('heading', { name: 'Nothing matches all three' })).toBeVisible();
    await page.screenshot({ path: 'test-results/screens/empty-390-light.png' });
    await page.getByRole('button', { name: 'Remove “Air fryer” · 1 dish' }).click();
    await expect(tiles(page)).toHaveCount(1);
    await page.getByRole('button', { name: 'Tofu' }).click();
    await page.getByRole('searchbox').fill('zzzz');
    await expect(page.getByRole('heading', { name: 'Nothing matches both' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear search and filters' }).click();
    await expect(tiles(page)).toHaveCount(9);
  });

  test('disliked recipes are hidden unless shown', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pp.reactions', JSON.stringify({ 'besan-chilla': 'dislike' })));
    await page.goto('/');
    await expect(tiles(page)).toHaveCount(8);
    await page.getByRole('button', { name: 'Open filters' }).click();
    await page.getByRole('checkbox', { name: 'Show disliked recipes' }).check();
    await page.getByRole('button', { name: /^Show 9 dishes$/ }).click();
    await expect(tiles(page)).toHaveCount(9);
  });

  test('My list chip reads pp.mylist', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pp.mylist', JSON.stringify(['tofu-bhurji-toast'])));
    await page.goto('/');
    await page.getByRole('button', { name: 'My list' }).click();
    await expect(tiles(page)).toHaveCount(1);
    await expect(tiles(page)).toContainText('Tofu Bhurji Toast');
  });
});

test('desktop sidebar applies immediately and hides the protein chips', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Open filters' })).toBeHidden();
  await expect(page.locator('.protein-row')).toBeHidden();
  const sidebar = page.getByRole('complementary', { name: 'Filters' });
  await sidebar.getByRole('checkbox', { name: /Tempeh/ }).check();
  await expect(tiles(page)).toHaveCount(1);
  await expect(sidebar.getByRole('checkbox', { name: /Whey/ })).toBeEnabled();
  await sidebar.getByRole('button', { name: 'Clear all' }).click();
  await expect(tiles(page)).toHaveCount(9);
});
