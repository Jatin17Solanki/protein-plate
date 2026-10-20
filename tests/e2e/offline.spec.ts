import { expect, test } from '@playwright/test';

// A6: offline (service worker), static recipe pages with link previews, manifest, self-hosted fonts. Fixture build.
test.use({ viewport: { width: 390, height: 844 } });

test('works offline after the first visit: home, recipe deep link, in-app navigation', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.locator('.grid .tile').first()).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect(page.getByRole('status').filter({ hasText: 'Ready to work offline.' })).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.grid .tile')).toHaveCount(9);
  await page.goto('/r/besan-chilla/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Besan Chilla');
  await page.getByRole('button', { name: 'Back to all recipes' }).click();
  await page.locator('.tile', { hasText: 'Soya Tikka Salad' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Soya Tikka Salad');
  expect(await page.evaluate(() => document.fonts.check('800 16px "Plus Jakarta Sans"'))).toBe(true);
  await context.setOffline(false);
});

test('each recipe has a static page with its own link-preview tags and image', async ({ request }) => {
  const html = await (await request.get('/r/soya-tikka-salad/')).text();
  expect(html).toContain('<title>Soya Tikka Salad · Protein Plate</title>');
  expect(html.match(/og:title/g)).toHaveLength(1);
  expect(html).toContain('<meta property="og:description" content="45 g protein per portion · 420 kcal · Soya · Salad / bowl." />');
  expect(html).toContain('<meta property="og:image" content="https://jatin17solanki.github.io/protein-plate/og/soya-tikka-salad.png" />');
  const img = await request.get('/og/soya-tikka-salad.png');
  expect(img.status()).toBe(200);
  expect(img.headers()['content-type']).toBe('image/png');
  expect((await img.body()).subarray(16, 24).readUInt32BE(0)).toBe(1200); // PNG IHDR width
  const review = await (await request.get('/review/')).text();
  expect(review).toContain('<meta name="robots" content="noindex" />');
});

test('manifest, icons and fonts are served from the site itself', async ({ page, request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest).toMatchObject({ name: 'Protein Plate', display: 'standalone', start_url: '/' });
  for (const icon of manifest.icons) expect((await request.get(`/${icon.src}`)).status()).toBe(200);
  const external: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost')) external.push(r.url()); });
  await page.goto('/');
  await expect(page.locator('.grid .tile').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
});

test('unknown path shows the app’s Page not found', async ({ page }) => {
  await page.goto('/nope/');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
