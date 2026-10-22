// Send feedback (BL4, DECISIONS 2026-10-20): a pre-filled email and a pre-filled GitHub issue. No form service, no
// server. Address and repo come from site.config.json, so a fork's feedback goes to its own owner.
import site from '../../site.config.json';

export interface FeedbackContext {
  /** Full address of the page the feedback is about. */
  page: string;
  /** Recipe title when sent from a recipe page. */
  recipe?: string | null;
  /** Short device description, see describeDevice(). */
  device: string;
}

/** "iPhone · Chrome", "Android · Chrome · installed", "Mac · Safari". Enough to reproduce, nothing personal. */
export function describeDevice(ua: string, installed = false, width?: number): string {
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android'
    : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Other';
  const browser = /CriOS|Chrome\//.test(ua) && !/Edg\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox'
    : /Edg\//.test(ua) ? 'Edge' : /Safari\//.test(ua) ? 'Safari' : 'other browser';
  return [os, browser, installed ? 'installed' : '', width ? `${width} px wide` : ''].filter(Boolean).join(' · ');
}

const subject = (c: FeedbackContext) => (c.recipe ? `${site.title} feedback: ${c.recipe}` : `${site.title} feedback`);

/** The same short form in both channels: free text first, then where and on what. */
export function feedbackBody(c: FeedbackContext): string {
  return [
    'What happened, or what would you like?',
    '',
    '',
    'What did you expect instead? (optional)',
    '',
    '',
    '---',
    `Page: ${c.page}`,
    ...(c.recipe ? [`Recipe: ${c.recipe}`] : []),
    `Device: ${c.device}`,
  ].join('\n');
}

/** null when the site has no feedback address (a fork that hasn't set one): then only GitHub is offered. */
export function mailtoUrl(c: FeedbackContext, email: string | undefined = site.feedback_email): string | null {
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(subject(c))}&body=${encodeURIComponent(feedbackBody(c))}`;
}

/** New-issue page with title, body and the `feedback` label (GitHub applies the label only for people who can triage). */
export function issueUrl(c: FeedbackContext): string {
  const q = new URLSearchParams({ title: subject(c), body: feedbackBody(c), labels: 'feedback' });
  return `https://github.com/${site.owner}/${site.repo}/issues/new?${q.toString()}`;
}
