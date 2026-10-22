import { expect, test, type Page } from '@playwright/test';
import { heightFor, overflowOffenders, WIDTHS } from './helpers';

// A5: Share, Edit and Menu sheets, theme, backup/restore, Add-to-Home-Screen hint. Fixture build.
const SHEETS = [
  { name: 'share', path: '/r/soya-tikka-salad/', open: (p: Page) => p.locator('.action-row').getByRole('button', { name: 'Share' }).click(), title: 'Share recipe' },
  { name: 'edit', path: '/r/soya-tikka-salad/', open: (p: Page) => p.getByRole('button', { name: 'Edit' }).click(), title: 'Edit this recipe' },
  { name: 'menu', path: '/', open: (p: Page) => p.getByRole('button', { name: 'Menu' }).click(), title: null },
  { name: 'feedback', path: '/r/soya-tikka-salad/', open: (p: Page) => p.getByRole('button', { name: 'Send feedback' }).click(), title: 'Send feedback' },
];

for (const theme of ['light', 'dark'] as const) {
  for (const width of WIDTHS) {
    for (const s of SHEETS) {
      test(`${s.name} sheet ${width}px ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: heightFor(width) });
        await page.addInitScript((t) => {
          localStorage.setItem('pp.theme', t);
          localStorage.setItem('pp.notes', JSON.stringify({ 'soya-tikka-salad': 'Half the chilli. Skip cheese for one portion.' }));
        }, theme);
        await page.goto(s.path);
        await s.open(page);
        const dialog = s.title ? page.getByRole('dialog', { name: s.title }) : page.getByRole('dialog', { name: 'Menu' });
        await expect(dialog).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        expect(await overflowOffenders(page)).toEqual([]);
        await page.screenshot({ path: `test-results/screens/${s.name}-${width}-${theme}.png` });
      });
    }
  }
}

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });

  test('feedback from the menu: email + GitHub issue, pre-filled with page and device (BL4)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: /^Send feedback/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Send feedback' });
    await expect(dialog).toBeVisible();
    const mail = await dialog.getByRole('link', { name: 'Email' }).getAttribute('href');
    expect(mail).toMatch(/^mailto:jatin\.dev\.17@gmail\.com\?subject=Protein%20Plate%20feedback&body=/);
    expect(decodeURIComponent(mail!.split('body=')[1])).toMatch(/Page: http:\/\/localhost:\d+\/\nDevice: \w+ · \w+/);
    const issue = new URL((await dialog.getByRole('link', { name: 'GitHub issue' }).getAttribute('href'))!);
    expect(issue.pathname).toBe('/Jatin17Solanki/protein-plate/issues/new');
    expect(issue.searchParams.get('labels')).toBe('feedback');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('menu: About opens the GitHub README in a new tab (BL7)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    const about = page.getByRole('dialog').getByRole('link', { name: /^About Protein Plate/ });
    await expect(about).toHaveAttribute('href', 'https://github.com/Jatin17Solanki/protein-plate#readme');
    await expect(about).toHaveAttribute('target', '_blank');
    await about.scrollIntoViewIfNeeded();
    await expect(about).toBeInViewport();
  });

  test('feedback from a recipe names the recipe (BL4)', async ({ page }) => {
    await page.goto('/r/soya-tikka-salad/');
    await page.getByRole('button', { name: 'Send feedback' }).click();
    const dialog = page.getByRole('dialog', { name: 'Send feedback' });
    await expect(dialog).toContainText('Something wrong or missing in Soya Tikka Salad?');
    const issue = new URL((await dialog.getByRole('link', { name: 'GitHub issue' }).getAttribute('href'))!);
    expect(issue.searchParams.get('title')).toBe('Protein Plate feedback: Soya Tikka Salad');
    expect(issue.searchParams.get('body')).toContain('Recipe: Soya Tikka Salad');
  });

  test('share: preview follows the toggles; Copy text copies exactly the preview', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pp.notes', JSON.stringify({ 'besan-chilla': 'Less salt' })));
    await page.goto('/r/besan-chilla/');
    await page.locator('.action-row').getByRole('button', { name: 'Share' }).click();
    const sheet = page.getByRole('dialog', { name: 'Share recipe' });
    const preview = sheet.locator('.share-preview');
    await expect(preview).toContainText('*Besan Chilla*\n20 g protein · 330 kcal per portion');
    await expect(preview).toContainText('*Ingredients*\nbesan 80 g · curd 50 g');
    await expect(preview).toContainText('*Note:* Less salt');
    await expect(preview).not.toContainText('*Steps*');
    await sheet.getByRole('checkbox', { name: 'Include steps' }).check();
    await sheet.getByRole('checkbox', { name: 'Include my note' }).uncheck();
    await expect(preview).toContainText('*Steps*\n1. Whisk the besan');
    await expect(preview).not.toContainText('*Note:*');
    await expect(preview).toContainText('Full recipe: https://jatin17solanki.github.io/protein-plate/r/besan-chilla/');
    await sheet.getByRole('button', { name: 'Copy text' }).click();
    await expect(page.getByRole('status')).toContainText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await preview.textContent());
  });

  test('share: "Share…" hands the message to the phone share menu', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { shared: unknown[] }).shared = [];
      navigator.share = async (d?: ShareData) => { (window as unknown as { shared: unknown[] }).shared.push(d); };
    });
    await page.goto('/r/besan-chilla/');
    await page.locator('.action-row').getByRole('button', { name: 'Share' }).click();
    await page.getByRole('button', { name: 'Share…' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    const shared = await page.evaluate(() => (window as unknown as { shared: { text: string }[] }).shared);
    expect(shared[0].text).toMatch(/^\*Besan Chilla\*/);
  });

  test('edit: explainer open the first time only; GitHub link; copy recipe data', async ({ page }) => {
    await page.goto('/r/besan-chilla/');
    await page.getByRole('button', { name: 'Edit' }).click();
    const sheet = page.getByRole('dialog', { name: 'Edit this recipe' });
    await expect(sheet.getByText('How this works')).toBeVisible();
    await expect(sheet.getByRole('link', { name: 'Edit on GitHub' })).toHaveAttribute(
      'href', 'https://github.com/Jatin17Solanki/protein-plate/edit/main/data/recipes/besan-chilla.json');
    await sheet.getByRole('button', { name: 'Copy recipe data' }).click();
    const json = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
    expect(json.id).toBe('besan-chilla');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(sheet.getByText('How this works')).toBeHidden();
    await sheet.getByRole('button', { name: 'How editing works' }).click();
    await expect(sheet.getByText('How this works')).toBeVisible();
  });

  test('incomplete recipe: Add details opens the edit sheet', async ({ page }) => {
    await page.goto('/r/lasooni-dhaniya-paneer/');
    await page.getByRole('button', { name: 'Add details' }).click();
    await expect(page.getByRole('dialog', { name: 'Add details' })).toBeVisible();
  });

  test('menu: My recipes and the theme switch', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await menu.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('pp.theme'))).toBe('dark');
    await menu.getByRole('radio', { name: 'Auto' }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/);
    expect(await page.evaluate(() => localStorage.getItem('pp.theme'))).toBeNull();
    await menu.getByRole('button', { name: /My recipes/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('My recipes');
  });

  test('back up downloads every pp.* value; restore merges and asks on conflicts', async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('pp.mylist', JSON.stringify(['besan-chilla']));
      localStorage.setItem('pp.reactions', JSON.stringify({ 'besan-chilla': 'like' }));
      localStorage.setItem('pp.notes', JSON.stringify({ 'besan-chilla': 'mine' }));
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Back up my data/ }).click()]);
    expect(dl.suggestedFilename()).toMatch(/^protein-plate-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const file = JSON.parse(await (await dl.createReadStream()).toArray().then((c) => Buffer.concat(c).toString()));
    expect(file).toMatchObject({ kind: 'protein-plate-backup', version: 1, data: { mylist: ['besan-chilla'], notes: { 'besan-chilla': 'mine' } } });

    const backup = { ...file, data: { ...file.data, mylist: ['tofu-bhurji-toast'], reactions: { 'besan-chilla': 'dislike' }, notes: { 'besan-chilla': 'theirs', 'protein-oats': 'new' } } };
    await page.locator('input[type=file]').setInputFiles({ name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await expect(page.getByRole('alertdialog')).toContainText('1 recipe has a different note or like/dislike');
    await page.getByRole('button', { name: "Keep this device's" }).click();
    await expect(page.getByRole('status')).toContainText('Restored');
    const after = await page.evaluate(() => ({
      mylist: JSON.parse(localStorage.getItem('pp.mylist')!),
      reactions: JSON.parse(localStorage.getItem('pp.reactions')!),
      notes: JSON.parse(localStorage.getItem('pp.notes')!),
    }));
    expect(after).toEqual({
      mylist: ['besan-chilla', 'tofu-bhurji-toast'],
      reactions: { 'besan-chilla': 'like' },
      notes: { 'besan-chilla': 'mine', 'protein-oats': 'new' },
    });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'My list' }).click();
    await expect(page.locator('.grid .tile')).toHaveCount(2);
  });

  test('restore rejects a file that is not a backup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
    await expect(page.getByRole('alert')).toHaveText("This file isn't a Protein Plate backup.");
  });

  test('Add recipes and Export catalog open their pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: /^Add recipes/ }).click();
    await expect(page).toHaveURL(/\/add\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Add recipes');
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: /^Export catalog/ }).click();
    await expect(page).toHaveURL(/\/export\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Export catalog');
  });
});

test.describe('Add to Home Screen hint', () => {
  const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

  test.describe('on an iPhone', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: IPHONE });

    test('shows once with iOS steps; dismissal sticks', async ({ page }) => {
      await page.goto('/');
      const hint = page.getByRole('complementary', { name: 'Add to Home Screen' });
      await expect(hint).toContainText('Tap Share, then Add to Home Screen.');
      expect(await overflowOffenders(page)).toEqual([]);
      await page.screenshot({ path: 'test-results/screens/hint-390-light.png' });
      await hint.getByRole('button', { name: 'Dismiss' }).click();
      await expect(hint).toBeHidden();
      await page.reload();
      await expect(page.locator('.grid .tile').first()).toBeVisible();
      await expect(hint).toBeHidden();
    });
  });

  test('not shown on a desktop pointer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.grid .tile').first()).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Add to Home Screen' })).toHaveCount(0);
  });
});
