import { useEffect, useState } from 'preact/hooks';
import { registerSW } from 'virtual:pwa-register';
import { showToast } from '../lib/toast';

/**
 * Registers the service worker (PLAN A6). A new deploy waits until the user taps Refresh, so the page never reloads
 * under them. Recipes ship inside the app bundle, so every recipe change arrives this way.
 */
export function UpdatePrompt() {
  const [update, setUpdate] = useState<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const updateSW = registerSW({
      onNeedRefresh: () => setUpdate(() => updateSW),
      onOfflineReady: () => showToast('Ready to work offline.', { quiet: true }),
    });
  }, []);

  if (!update) return null;
  return (
    <div class="update-bar" role="status">
      <span>New recipes available</span>
      <button type="button" class="update-btn" onClick={() => update(true)}>Refresh</button>
      <button type="button" class="update-close" aria-label="Later" onClick={() => setUpdate(null)}>✕</button>
    </div>
  );
}
