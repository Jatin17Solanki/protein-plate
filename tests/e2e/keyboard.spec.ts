import { expect, test, type Page } from '@playwright/test';

// A8 keyboard pass: everything works without a pointer, focus is always visible, sheets trap and return focus,
// and the tab order follows the order things appear on screen.
test.use({ serviceWorkers: 'block' });

const focused = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    return (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
  });

async function tabTo(page: Page, name: RegExp, max = 60) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (name.test(await focused(page))) return;
  }
  throw new Error(`never reached ${name}`);
}

/** Focus ring: the element's own outline, or its wrapper's (the search field draws it on .search). */
const hasRing = (page: Page) =>
  page.evaluate(() => {
    let el: Element | null = document.activeElement;
    for (let i = 0; el && i < 2; i++, el = el.parentElement) {
      const cs = getComputedStyle(el);
      if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) return true;
    }
    return false;
  });

for (const width of [390, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('home: search, filters/menu, chips and tiles by keyboard, ring always visible', async ({ page }) => {
      await page.goto('/');
      const names: string[] = [];
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press('Tab');
        names.push(await focused(page));
        expect(await hasRing(page), `focus ring on "${names.at(-1)}"`).toBe(true);
      }
      expect(names[0]).toBe('Search a dish or ingredient');
      await tabTo(page, /^Besan Chilla/);
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/r\/besan-chilla\/$/);
    });

    test('menu sheet: focus moves in, Tab stays inside, Escape closes and returns focus', async ({ page }) => {
      await page.goto('/');
      await tabTo(page, /^Menu$/);
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'Menu' });
      await expect(dialog).toBeVisible();
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      expect(await focused(page)).toBe('Menu');
    });
  });
}

test.describe('phone recipe page', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('tab order follows the screen: actions → versions → ingredients → Tried it → notes', async ({ page }) => {
    await page.goto('/r/soya-pea-kebab/');
    const order: string[] = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const el = await page.evaluate(() => {
        const a = document.activeElement!;
        return a.closest('.action-row, .versions, .ingredients, .tried, .notes')?.className.split(' ').find((c) => ['action-row', 'versions', 'ingredients', 'tried', 'notes'].includes(c)) ?? null;
      });
      if (el && order.at(-1) !== el) order.push(el);
    }
    expect(order.slice(0, 5)).toEqual(['action-row', 'versions', 'ingredients', 'tried', 'notes']);
    const tops = await page.evaluate(() =>
      ['.action-row', '.versions', '.ingredients', '.tried', '.notes'].map((s) => document.querySelector(s)!.getBoundingClientRect().top),
    );
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  });

  test('share sheet by keyboard; the message preview can be scrolled by keyboard', async ({ page }) => {
    await page.goto('/r/soya-pea-kebab/');
    await tabTo(page, /^Share$/);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Share recipe' })).toBeVisible();
    await expect(page.getByLabel('Message preview')).toHaveAttribute('tabindex', '0');
    await page.keyboard.press('Escape');
    expect(await focused(page)).toBe('Share');
  });
});

test('desktop recipe page keeps two columns: notes under Tried it on the left', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/r/soya-pea-kebab/');
  const box = async (s: string) => (await page.locator(s).first().boundingBox())!;
  const [actions, tried, notes, ingredients, colA] = [await box('.action-row'), await box('.tried'), await box('.notes'), await box('.ingredients'), await box('.col-a')];
  expect(Math.abs(tried.x - actions.x)).toBeLessThan(1);
  expect(tried.y).toBeGreaterThan(actions.y);
  expect(notes.y).toBeGreaterThan(tried.y);
  expect(ingredients.x).toBeGreaterThan(actions.x + actions.width);
  // Tried it sits right under the left column's top part (one 16 px gap), not pushed below the right column.
  expect(tried.y - (colA.y + colA.height)).toBeCloseTo(16, 0);
});
