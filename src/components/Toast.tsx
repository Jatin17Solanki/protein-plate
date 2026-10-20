import { useEffect, useState } from 'preact/hooks';
import { onToast } from '../lib/toast';

const SHOW_MS = 2600;

export function Toast() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let timer: number | undefined;
    let showing = false;
    const off = onToast(({ text: t, quiet }) => {
      if (quiet && showing) return;
      setText(t);
      showing = true;
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        setText(null);
        showing = false;
      }, SHOW_MS);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);
  return (
    <div class="toast-region" role="status" aria-live="polite">
      {text && <div class="toast">{text}</div>}
    </div>
  );
}
