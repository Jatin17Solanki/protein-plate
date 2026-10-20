import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

let open = 0;

/**
 * Bottom sheet on phone, centred modal from 600 px (DESIGN §3). Traps focus, closes on Escape or a scrim tap,
 * locks page scroll and returns focus to whatever opened it.
 */
export function Sheet({ title, label, action, footer, onClose, children, class: cls = '' }: {
  /** Visible heading; omit for sheets without one (then pass `label`). */
  title?: ComponentChildren;
  label?: string;
  action?: ComponentChildren;
  footer?: ComponentChildren;
  onClose: () => void;
  children: ComponentChildren;
  class?: string;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const titleId = useRef(`sheet-title-${++open}`).current;
  const close = useRef(onClose);
  close.current = onClose;

  // Layout effect: listeners must be live before the next key press, not after paint.
  useLayoutEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    sheet.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
      if (e.key === 'Tab' && sheet.current) {
        const els = sheet.current.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), textarea, [tabindex="0"]',
        );
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  return (
    <div class="scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        class={`sheet ${cls}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        ref={sheet}
        tabIndex={-1}
      >
        <div class="grabber" aria-hidden="true" />
        {title && (
          <div class="sheet-head">
            <h2 id={titleId}>{title}</h2>
            {action}
          </div>
        )}
        <div class="sheet-body">{children}</div>
        {footer && <div class="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}
