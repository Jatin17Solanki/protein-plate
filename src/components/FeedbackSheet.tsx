import { describeDevice, issueUrl, mailtoUrl, type FeedbackContext } from '../lib/feedback';
import { UiIcon } from './Icon';
import { Sheet } from './Sheet';

function context(recipe: string | null): FeedbackContext {
  const installed = typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches;
  return { page: location.href, recipe, device: describeDevice(navigator.userAgent, installed, innerWidth) };
}

/** BL4: feedback by email (works without any account) or as a GitHub issue. Both are pre-filled with the page and device. */
export function FeedbackSheet({ recipe = null, onClose }: { recipe?: string | null; onClose: () => void }) {
  const c = context(recipe);
  const mail = mailtoUrl(c);
  return (
    <Sheet title="Send feedback" onClose={onClose}>
      <p class="sheet-lead">
        {recipe ? <>Something wrong or missing in <b>{recipe}</b>? </> : <>Something broken, confusing or missing? An idea? </>}
        Pick how to send it. The page and your device type are filled in for you.
      </p>
      <div class="stack-buttons">
        {mail && (
          <a class="btn primary" href={mail}>
            <UiIcon name="message" size={18} />Email
          </a>
        )}
        <a class={`btn ${mail ? 'secondary' : 'primary'}`} href={issueUrl(c)} target="_blank" rel="noopener">
          <UiIcon name="github" size={18} />GitHub issue
        </a>
      </div>
      <p class="sheet-note">
        {mail ? 'Email opens your mail app; only the site owner sees it. ' : ''}A GitHub issue needs a free account and is public.
      </p>
    </Sheet>
  );
}
