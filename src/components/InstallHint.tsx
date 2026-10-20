import { useEffect, useState } from 'preact/hooks';
import { canInstall, isIOS, isPhoneOrTablet, isStandalone, onInstallChange, promptInstall } from '../lib/install';
import { dismissHint, isHintDismissed } from '../lib/storage';
import { UiIcon } from './Icon';

/** F1 floating card. iOS: "Tap Share, then Add to Home Screen". Android: Chrome's own install prompt when offered. */
export function InstallHint() {
  const [show, setShow] = useState(() => !isHintDismissed() && isPhoneOrTablet() && !isStandalone());
  const [installable, setInstallable] = useState(canInstall);
  useEffect(() => onInstallChange(() => setInstallable(canInstall())), []);

  useEffect(() => {
    document.body.classList.toggle('has-hint', show);
    return () => document.body.classList.remove('has-hint');
  }, [show]);

  if (!show) return null;
  const close = () => {
    dismissHint();
    setShow(false);
  };
  const ios = isIOS();

  return (
    <aside class="install-hint" aria-label="Add to Home Screen">
      <div class="install-text">
        <p class="install-title">Add to Home Screen</p>
        <p>
          Opens like an app and keeps your notes safe.{' '}
          {ios ? (
            <>Tap <b>Share</b>, then <b>Add to Home Screen</b>.</>
          ) : installable ? (
            'Install it with one tap.'
          ) : (
            <>Open your browser menu <b>⋮</b>, then <b>Add to Home screen</b>.</>
          )}
        </p>
        {!ios && installable && (
          <button type="button" class="install-btn" onClick={async () => { await promptInstall(); close(); }}>
            Install
          </button>
        )}
      </div>
      <button type="button" class="install-close" aria-label="Dismiss" onClick={close}>
        <UiIcon name="x" size={14} strokeWidth={2.4} />
      </button>
    </aside>
  );
}
