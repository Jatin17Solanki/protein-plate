import type { ComponentChildren } from 'preact';
import { UiIcon } from './Icon';

/** ⓘ button (36 px) that shows/hides an explainer written for someone who doesn't own the repo (DESIGN §3). */
export function InfoButton({ open, onToggle, label }: { open: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" class="info-btn" aria-expanded={open} aria-label={open ? `Hide: ${label}` : label} onClick={onToggle}>
      <UiIcon name="info" size={20} />
    </button>
  );
}

export function InfoBox({ children }: { children: ComponentChildren }) {
  return <div class="info-explainer">{children}</div>;
}
