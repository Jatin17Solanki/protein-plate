import { expect, test } from '@playwright/test';

// DESIGN §8: no horizontal overflow at any width, light + dark. Screenshots go to test-results/screens/.
const WIDTHS = [320, 360, 390, 430, 768, 834, 1024, 1280, 1440];

for (const theme of ['light', 'dark'] as const) {
  for (const width of WIDTHS) {
    test(`placeholder ${width}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.addInitScript((t) => localStorage.setItem('pp.theme', t), theme);
      await page.goto('/');
      await expect(page.locator('.count')).toContainText('10 recipes in the catalog');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `test-results/screens/placeholder-${width}-${theme}.png`, fullPage: true });
    });
  }
}
