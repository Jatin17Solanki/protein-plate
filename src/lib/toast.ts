// One-line confirmations ("Copied", "Backup saved"). The <Toast> in app.tsx shows them.
// A toast from something the user just did replaces whatever is showing; a `quiet` one (e.g. "Ready to work offline.")
// only appears when nothing else is on screen, so it never hides the result of a tap.
export interface ToastEvent {
  text: string;
  quiet: boolean;
}

const listeners = new Set<(t: ToastEvent) => void>();

export function showToast(text: string, opts: { quiet?: boolean } = {}): void {
  listeners.forEach((fn) => fn({ text, quiet: opts.quiet ?? false }));
}

export function onToast(fn: (t: ToastEvent) => void): () => void {
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
