import { useState } from 'preact/hooks';
import type { Recipe } from '../types/recipe';
import { editUrl } from '../lib/share';
import { KEYS } from '../lib/storage';
import { copyText, showToast } from '../lib/toast';
import { UiIcon } from './Icon';
import { InfoBox, InfoButton } from './Info';
import { Sheet } from './Sheet';

function firstTime(): boolean {
  try {
    if (localStorage.getItem(KEYS.editHelpSeen) === '1') return false;
    localStorage.setItem(KEYS.editHelpSeen, '1');
  } catch {}
  return true;
}

/** F6: recipes live in the GitHub repo, not the app. The explainer is open the first time. */
export function EditSheet({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [help, setHelp] = useState(firstTime);
  const incomplete = recipe.status === 'incomplete';
  const copy = async () => {
    const ok = await copyText(`${JSON.stringify(recipe, null, 2)}\n`);
    showToast(ok ? 'Recipe data copied.' : "Couldn't copy. Try again.");
  };
  return (
    <Sheet
      title={incomplete ? 'Add details' : 'Edit this recipe'}
      onClose={onClose}
      action={<InfoButton open={help} onToggle={() => setHelp(!help)} label="How editing works" />}
    >
      {help && (
        <InfoBox>
          <p class="info-title">How this works</p>
          <p>Recipes live in a GitHub repository, not in this app.</p>
          <p><b>If it's your repository:</b> GitHub opens this recipe's file. Change it and tap Commit. A check runs and the site updates in about 2 minutes. A broken edit never goes live.</p>
          <p><b>If it's someone else's:</b> GitHub makes you a copy and sends them your change as a suggestion. They decide whether to accept it.</p>
          <p>You need a free GitHub account.</p>
        </InfoBox>
      )}
      <div class="stack-buttons">
        <a class="btn primary" href={editUrl(recipe.id)} target="_blank" rel="noopener">
          <UiIcon name="github" size={18} />Edit on GitHub
        </a>
        <button type="button" class="btn secondary" onClick={copy}>
          <UiIcon name="copy" size={18} />Copy recipe data
        </button>
      </div>
      <p class="sheet-note">Copy recipe data gives you this recipe as text, to change with an AI or add to your own copy of the catalog.</p>
    </Sheet>
  );
}
