import { useRef, useState } from 'preact/hooks';
import {
  backupFileName, conflicts, currentData, makeBackup, merge, parseBackup, summarize, type BackupData,
} from '../lib/backup';
import { href, navigate } from '../lib/router';
import { getTheme, setTheme, writeAll, type Theme } from '../lib/storage';
import { showToast } from '../lib/toast';
import { FilledIcon, UiIcon } from './Icon';
import { InfoBox, InfoButton } from './Info';
import { Sheet } from './Sheet';

const THEMES: { key: Theme; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'auto', label: 'Auto' },
];

function download(data: BackupData) {
  const blob = new Blob([`${JSON.stringify(makeBackup(data), null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** R5-Menu (+ My recipes first, Like/Dislike wording). Back up / Restore and Appearance work here. */
export function MenuSheet({ onClose }: { onClose: () => void }) {
  const [theme, setThemeState] = useState(getTheme);
  const [help, setHelp] = useState(false);
  const [pending, setPending] = useState<{ backup: BackupData; differ: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const pickTheme = (t: Theme) => {
    setTheme(t);
    setThemeState(t);
  };

  const apply = (backup: BackupData, prefer: 'mine' | 'backup') => {
    const merged = merge(currentData(), backup, prefer);
    writeAll(merged);
    setThemeState(getTheme());
    setPending(null);
    showToast(`Restored. You now have ${summarize(merged)}.`);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setError(null);
    try {
      const backup = parseBackup(await f.text());
      const differ = new Set(conflicts(currentData(), backup).map((c) => c.id)).size;
      if (differ > 0) setPending({ backup, differ });
      else apply(backup, 'mine');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (file.current) file.current.value = '';
    }
  };

  return (
    <Sheet label="Menu" onClose={onClose} class="menu-sheet">
      <ul class="menu-list">
        <li>
          <button type="button" class="menu-item" onClick={() => { onClose(); navigate(href.myRecipes()); }}>
            <span class="menu-icon"><FilledIcon name="bookmark" size={18} /></span>
            <span class="menu-text"><b>My recipes</b><span>Liked, My list, Disliked</span></span>
          </button>
        </li>
      </ul>

      <p class="eyebrow">Catalog</p>
      <ul class="menu-list">
        {/* Add recipes and Export catalog arrive in A7. */}
        <li>
          <button type="button" class="menu-item" disabled>
            <span class="menu-icon"><UiIcon name="plus" size={18} /></span>
            <span class="menu-text"><b>Add recipes</b><span>Coming soon</span></span>
          </button>
        </li>
        <li>
          <button type="button" class="menu-item" disabled>
            <span class="menu-icon"><UiIcon name="download" size={18} /></span>
            <span class="menu-text"><b>Export catalog</b><span>Coming soon</span></span>
          </button>
        </li>
      </ul>

      <div class="eyebrow-row">
        <p class="eyebrow">My data on this device</p>
        <InfoButton open={help} onToggle={() => setHelp(!help)} label="About your data" />
      </div>
      {help && (
        <InfoBox>
          <p>Your notes, My list, likes and dislikes are saved in this browser only. Nobody else can see them, and other people using this site have their own.</p>
          <p><b>Back up</b> saves them as a small file. <b>Restore</b> loads that file here or on another phone or computer and merges it with what's already there.</p>
          <p>Clearing your browser's data deletes them, so back up now and then.</p>
        </InfoBox>
      )}
      <ul class="menu-list">
        <li>
          <button type="button" class="menu-item" onClick={() => { download(currentData()); showToast('Backup saved to your downloads.'); }}>
            <span class="menu-icon"><UiIcon name="download" size={18} /></span>
            <span class="menu-text"><b>Back up my data</b><span>Notes, My list, Like / Dislike</span></span>
          </button>
        </li>
        <li>
          <button type="button" class="menu-item" onClick={() => file.current?.click()}>
            <span class="menu-icon"><UiIcon name="upload" size={18} /></span>
            <span class="menu-text"><b>Restore from backup</b><span>Load a backup file</span></span>
          </button>
          <input
            ref={file}
            type="file"
            accept=".json,application/json"
            class="visually-hidden"
            tabIndex={-1}
            aria-label="Backup file"
            onChange={(e) => onFile(e.currentTarget.files?.[0])}
          />
        </li>
      </ul>
      {error && <p class="form-error" role="alert">{error}</p>}
      {pending && (
        <div class="confirm" role="alertdialog" aria-labelledby="restore-q">
          <p id="restore-q">
            <b>{pending.differ} {pending.differ === 1 ? 'recipe has' : 'recipes have'} a different note or like/dislike in the backup.</b>{' '}
            Everything else will be added either way.
          </p>
          <div class="confirm-row">
            <button type="button" class="btn secondary" onClick={() => apply(pending.backup, 'mine')}>Keep this device's</button>
            <button type="button" class="btn primary" onClick={() => apply(pending.backup, 'backup')}>Use the backup's</button>
          </div>
          <button type="button" class="link-btn" onClick={() => setPending(null)}>Cancel</button>
        </div>
      )}

      <p class="eyebrow">Appearance</p>
      <div class="segmented" role="radiogroup" aria-label="Appearance">
        {THEMES.map((t) => (
          <button key={t.key} type="button" role="radio" aria-checked={theme === t.key} onClick={() => pickTheme(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
