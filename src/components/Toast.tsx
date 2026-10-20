import { useEffect, useState } from 'preact/hooks';
import { onToast } from '../lib/toast';

export function Toast() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let timer: number | undefined;
    const off = onToast((t) => {
      setText(t);
      clearTimeout(timer);
      timer = window.setTimeout(() => setText(null), 2600);
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
