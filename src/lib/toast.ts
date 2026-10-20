// One-line confirmations ("Copied", "Backup saved"). The <Toast> in app.tsx shows the latest one.
const listeners = new Set<(text: string) => void>();

export function showToast(text: string): void {
  listeners.forEach((fn) => fn(text));
}

export function onToast(fn: (text: string) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Copies text; falls back to a hidden textarea where the async Clipboard API is missing or blocked. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {}
    ta.remove();
    return ok;
  }
}
