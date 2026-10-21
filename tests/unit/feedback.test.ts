import { describe, expect, it } from 'vitest';
import { describeDevice, feedbackBody, issueUrl, mailtoUrl } from '../../src/lib/feedback';

const IPHONE_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0 Mobile/15E148 Safari/604.1';
const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';
const recipeCtx = { page: 'https://x.io/pp/r/soya-poha/', recipe: 'Soya Poha', device: 'iPhone · Safari' };

describe('describeDevice', () => {
  it('phone + browser, installed and width when known', () => {
    expect(describeDevice(IPHONE_CHROME)).toBe('iPhone · Chrome');
    expect(describeDevice(IPHONE_SAFARI, true, 390)).toBe('iPhone · Safari · installed · 390 px wide');
    expect(describeDevice(ANDROID)).toBe('Android · Chrome');
  });
});

describe('feedback links (site.config.json: owner, repo, feedback_email)', () => {
  it('body: free text first, then page, recipe and device', () => {
    const body = feedbackBody(recipeCtx);
    expect(body.startsWith('What happened, or what would you like?')).toBe(true);
    expect(body).toContain('Page: https://x.io/pp/r/soya-poha/\nRecipe: Soya Poha\nDevice: iPhone · Safari');
    expect(feedbackBody({ page: 'p', device: 'd' })).not.toContain('Recipe:');
  });

  it('email: pre-filled subject and body; none when the site has no address', () => {
    const url = mailtoUrl(recipeCtx)!;
    expect(url.startsWith('mailto:jatin.dev.17@gmail.com?subject=')).toBe(true);
    const q = new URLSearchParams(url.split('?')[1]);
    expect(q.get('subject')).toBe('Protein Plate feedback: Soya Poha');
    expect(q.get('body')).toBe(feedbackBody(recipeCtx));
    expect(mailtoUrl(recipeCtx, '')).toBeNull();
  });

  it('GitHub: new issue in the configured repo with title, body and the feedback label', () => {
    const url = new URL(issueUrl({ page: 'p', device: 'd' }));
    expect(url.origin + url.pathname).toBe('https://github.com/Jatin17Solanki/protein-plate/issues/new');
    expect(url.searchParams.get('title')).toBe('Protein Plate feedback');
    expect(url.searchParams.get('labels')).toBe('feedback');
    expect(url.searchParams.get('body')).toContain('Page: p');
  });
});
