import type { Page } from '@playwright/test';

export const WIDTHS = [320, 360, 390, 430, 768, 834, 1024, 1280, 1440];

export const heightFor = (width: number) => (width >= 1024 ? 900 : width >= 600 ? 1112 : 844);

/** DESIGN §8: no page overflow; nothing sticks out except inside sideways-scrolling rows. */
export async function overflowOffenders(page: Page) {
  return page.evaluate(() => {
    const w = window.innerWidth;
    const bad: string[] = [];
    if (document.documentElement.scrollWidth > w) bad.push(`scrollWidth ${document.documentElement.scrollWidth} > ${w}`);
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.chip-row, .meal-tabs')) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > w + 0.5) bad.push(`${el.tagName.toLowerCase()}.${el.className} right=${Math.round(r.right)}`);
    }
    return bad;
  });
}
