// Add-to-Home-Screen hint (DESIGN §3): once, on phones, when the site isn't already installed.
// Chrome's install prompt fires early, so main.tsx calls captureInstallPrompt() before rendering.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

export function captureInstallPrompt(): void {
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    listeners.forEach((fn) => fn());
  });
  addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((fn) => fn());
  });
}

export const canInstall = () => deferred !== null;

export function onInstallChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function promptInstall(): Promise<void> {
  const e = deferred;
  deferred = null;
  await e?.prompt();
}

export function isStandalone(): boolean {
  return matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

export function isPhoneOrTablet(): boolean {
  return matchMedia('(pointer: coarse)').matches && innerWidth < 1024;
}

export function isIOS(ua = navigator.userAgent, touch = navigator.maxTouchPoints): boolean {
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touch > 1);
}
