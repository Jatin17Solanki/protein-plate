import { expect, test, type Page } from '@playwright/test';

// DESIGN §8: every width, light + dark; no horizontal overflow; nothing sticks out except inside chip rows.
// Screenshots: test-results/screens/home-<width>-<theme>.png. Runs on the fixtures build (VITE_FIXTURES=1).
const WIDTHS = [320, 360, 390, 430, 768, 834, 1024, 1280, 1440];

async function overflowOffenders(page: Page) {
  return page.evaluate(() => {
    const w = window.innerWidth;
    const bad: string[] = [];
    if (document.documentElement.scrollWidth > w) bad.push(`scrollWidth ${document.documentElement.scrollWidth} > ${w}`);
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.chip-row, .meal-tabs')) continue; // allowed to scroll sideways in their own box
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > w + 0.5) bad.push(`${el.tagName.toLowerCase()}.${el.className} right=${Math.round(r.right)}`);
    }
    return bad;
  });
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of WIDTHS) {
    test(`home ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 1024 ? 900 : width >= 600 ? 1112 : 844 });
      await page.addInitScript((t) => localStorage.setItem('pp.theme', t), theme);
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('.tile')).toHaveCount(9);
      await page.evaluate(() => document.fonts.ready);
      expect(await overflowOffenders(page)).toEqual([]);
      const cols = await page.evaluate(() => getComputedStyle(document.querySelector('.grid')!).gridTemplateColumns.split(' ').length);
      expect(cols).toBe(width >= 1200 ? 4 : width >= 600 ? 3 : 2);
      await page.screenshot({ path: `test-results/screens/home-${width}-${theme}.png` });
    });
  }
}

test('chips filter the grid; versions collapse; tile opens the recipe and Back returns', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const kebab = page.locator('.tile', { hasText: 'Soya kebab' });
  await expect(kebab).toContainText('2 versions');
  await expect(kebab).toContainText('22+');

  await page.getByRole('button', { name: 'Breakfast' }).click();
  await expect(page.locator('.tile')).toHaveCount(3);
  await page.getByRole('button', { name: 'Tofu' }).click();
  await expect(page.locator('.tile')).toHaveCount(1);
  await page.getByRole('button', { name: 'Tofu' }).click();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Air fryer' }).click();
  await expect(page.locator('.tile')).toHaveCount(3);

  await page.locator('.tile', { hasText: 'Soya Tikka Salad' }).click();
  await expect(page).toHaveURL(/\/r\/soya-tikka-salad\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Soya Tikka Salad');
  await page.getByRole('link', { name: 'Back to all recipes' }).click();
  await expect(page.locator('.tile').first()).toBeVisible();
});

test('deep link to a recipe works', async ({ page }) => {
  await page.goto('/r/besan-chilla/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Besan Chilla');
});

test('Auto theme follows the OS with no flash', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await page.locator('html').getAttribute('data-theme')).toBeNull();
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(17, 22, 20)'); // --bg dark
});
