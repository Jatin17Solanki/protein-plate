import { useState } from 'preact/hooks';
import type { Recipe } from '../types/recipe';
import { shareMessage } from '../lib/share';
import { getNote } from '../lib/storage';
import { copyText, showToast } from '../lib/toast';
import { UiIcon } from './Icon';
import { Sheet } from './Sheet';

/** F3: one Share button; preview of the exact message; toggles for ingredients, steps and my note. */
export function ShareSheet({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const note = getNote(recipe.id);
  const [ingredients, setIngredients] = useState(recipe.ingredients.length > 0);
  const [steps, setSteps] = useState(false);
  const [withNote, setWithNote] = useState(note.trim() !== '');
  const text = shareMessage(recipe, { ingredients, steps, note: withNote ? note : null });
  const canShare = typeof navigator.share === 'function';

  const copy = async () => {
    showToast((await copyText(text)) ? 'Copied. Paste it in any chat.' : "Couldn't copy. Select the text and copy it.");
  };
  const share = async () => {
    try {
      await navigator.share({ text });
      onClose();
    } catch (e) {
      if ((e as Error).name !== 'AbortError') await copy();
    }
  };

  return (
    <Sheet title="Share recipe" onClose={onClose} class="share-sheet">
      <p class="eyebrow">Message preview</p>
      <pre class="share-preview" tabIndex={0} aria-label="Message preview">{text}</pre>
      <div class="toggle-list">
        {recipe.ingredients.length > 0 && (
          <label class="toggle-row">
            <span>Include ingredients</span>
            <input type="checkbox" checked={ingredients} onChange={(e) => setIngredients(e.currentTarget.checked)} />
          </label>
        )}
        {recipe.steps.length > 0 && (
          <label class="toggle-row">
            <span>Include steps</span>
            <input type="checkbox" checked={steps} onChange={(e) => setSteps(e.currentTarget.checked)} />
          </label>
        )}
        {note.trim() !== '' && (
          <label class="toggle-row">
            <span>Include my note</span>
            <input type="checkbox" checked={withNote} onChange={(e) => setWithNote(e.currentTarget.checked)} />
          </label>
        )}
      </div>
      <div class="stack-buttons">
        {canShare && (
          <button type="button" class="btn primary" onClick={share}>
            <UiIcon name="share" size={18} />Share…
          </button>
        )}
        <button type="button" class={`btn ${canShare ? 'secondary' : 'primary'}`} onClick={copy}>
          <UiIcon name="copy" size={18} />Copy text
        </button>
      </div>
      <p class="sheet-note">
        {canShare ? '"Share…" opens your phone\'s share menu: WhatsApp, Telegram, SMS and more.' : 'Paste the copied text into WhatsApp or any chat.'}
      </p>
    </Sheet>
  );
}
