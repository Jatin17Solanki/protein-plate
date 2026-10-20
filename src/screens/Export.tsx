import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import site from '../../site.config.json';
import { currentData } from '../lib/backup';
import { recipes } from '../lib/catalog';
import { downloadJson } from '../lib/download';
import { askPrompt, catalogFile, catalogFileName } from '../lib/export';
import { goBack } from '../lib/router';
import { copyText, showToast } from '../lib/toast';
import { UiIcon } from '../components/Icon';
import { InfoBox, InfoButton } from '../components/Info';

// The live site's address (not location.origin), so a copied prompt or link works anywhere it's pasted.
const SITE = site.site_url.replace(/\/?$/, '/');
export const CATALOG_TXT = `${SITE}catalog.txt`;

/** R5-Export: the catalog for an AI chat (compact), as a link (plain text) and as a file (JSON). */
export function Export() {
  const [help, setHelp] = useState(false);
  const [mine, setMine] = useState(false);
  useLayoutEffect(() => scrollTo(0, 0), []);
  useEffect(() => {
    document.title = 'Export catalog · Protein Plate';
  }, []);

  const copy = async (text: string, done: string) => showToast((await copyText(text)) ? done : "Couldn't copy. Try again.");
  const personal = () => (mine ? currentData() : null);

  return (
    <div class="step-page">
      <main class="my-page export-page">
        <header class="my-head">
          <button type="button" class="icon-btn round" aria-label="Back" onClick={() => goBack()}>
            <UiIcon name="back" />
          </button>
          <h1>Export catalog</h1>
          <span class="header-spacer-flex" />
          <InfoButton open={help} onToggle={() => setHelp(!help)} label="About exporting" />
        </header>
        <p class="page-intro">
          {recipes.length} recipes. Use these to ask an AI things like "I have bread and veggies left, what can I make?"
        </p>
        {help && (
          <InfoBox>
            <p><b>Copy prompt + catalog</b> puts a ready-made question starter and every recipe (one line each) on your clipboard. Paste it into any AI chat and ask away.</p>
            <p><b>Link for AI tools</b> is a public page with every recipe in full, for tools that can open a link.</p>
            <p><b>Download JSON</b> saves every recipe as one file: a backup, or a way for someone to start their own copy of the catalog.</p>
            <p>Your notes, My list and likes stay on this device unless you tick the box below. The public link never includes them.</p>
          </InfoBox>
        )}

        <section class="card export-card" aria-labelledby="ex-ask">
          <div class="export-head">
            <h2 id="ex-ask">Ask an AI about my catalog</h2>
            <span class="export-kind">compact</span>
          </div>
          <p class="step-text">Copies a starter prompt plus a compact catalog (names, proteins, macros, ingredients). Paste into ChatGPT or Claude, then ask.</p>
          <button type="button" class="btn primary" onClick={() => copy(askPrompt(recipes, SITE, personal()), 'Prompt and catalog copied. Paste into an AI chat, then ask.')}>
            Copy prompt + catalog
          </button>
        </section>

        <section class="card export-card" aria-labelledby="ex-link">
          <div class="export-head">
            <h2 id="ex-link">Link for AI tools</h2>
            <span class="export-kind">plain text</span>
          </div>
          <p class="step-text">A public page with every recipe as plain text, for tools that can read a link.</p>
          <button type="button" class="btn secondary" onClick={() => copy(CATALOG_TXT, 'Link copied.')}>Copy link</button>
          <a class="link-btn export-open" href={`${import.meta.env.BASE_URL}catalog.txt`} target="_blank" rel="noopener">Open the page</a>
        </section>

        <section class="card export-card" aria-labelledby="ex-file">
          <div class="export-head">
            <h2 id="ex-file">Full catalog file</h2>
            <span class="export-kind">JSON</span>
          </div>
          <p class="step-text">Everything, for backups or for someone to import into their own copy.</p>
          <button
            type="button"
            class="btn secondary"
            onClick={() => {
              downloadJson(catalogFile(recipes, SITE, personal()), catalogFileName());
              showToast('Catalog saved to your downloads.');
            }}
          >
            Download JSON
          </button>
        </section>

        <label class="export-mine">
          <span>
            Include my notes, My list and Like / Dislike
            <small>In the copied prompt and the JSON file only.</small>
          </span>
          <input type="checkbox" checked={mine} onChange={(e) => setMine(e.currentTarget.checked)} />
        </label>
      </main>
    </div>
  );
}
