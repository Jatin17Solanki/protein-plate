# Protein Plate

**A free, mobile-first catalog of high-protein vegetarian recipes**, made to help one vegetarian eat 100–120 g of protein a day without eating paneer at every meal.

**Live:** https://jatin17solanki.github.io/protein-plate/

Pick a meal, pick a protein (paneer, soya, pulses, tofu, tempeh, whey), and get recipes sorted by protein per portion. Open one to see the creator's numbers, the ingredients and steps, and the original video. Keep your own notes, a "My list" of dishes you cook, and send a recipe to anyone on WhatsApp. No account, no ads, no server.

---

## Recipes belong to their creators

**The recipes in this catalog are not mine.** Each one comes from a creator's public Instagram or YouTube post, and every recipe page:

- names the creator and links to their profile;
- links to the original video ("Watch video"), which is the real recipe;
- lists the ingredients as facts, and keeps the method in the creator's own words (formatting only);
- shows **only the creator's own numbers** (protein, kcal) per portion. When the creator gives none, it says "Macros not given" rather than guessing. A rough estimate is shown only on the recipe page, clearly marked as not the creator's numbers.

This is a personal, non-commercial index to help me cook what creators share; please watch, like and follow them. **If you're a creator and want a recipe changed, credited differently or removed,** use "Send feedback" in the app (email or GitHub issue) and it will be done.

---

## What you can do with it

| | Feature |
|---|---|
| **Find** | Meal tabs (breakfast, lunch, snack, dinner) · main-protein chips · Quick, Global, Air fryer, My list · a filter sheet with live counts per option · sort by protein or calories · search by dish or ingredient (Hindi/Hinglish names, small typos) |
| **Decide** | Tiles show protein per portion in the protein's colour · dish versions grouped ("Soya kebab · 6 versions") · recipe page with macros, Watch video, ingredient ticks, steps |
| **Remember** | My list (bookmark), Like / Dislike (disliked dishes are hidden), private notes per recipe · everything stays in your browser · Back up / Restore as a file to move to another phone |
| **Share** | One Share button: a WhatsApp-ready message (ingredients, steps, your note) plus a link that previews as a recipe card |
| **Add** | "Add recipes": copy a prompt into any AI chat with a reel's caption, paste back the JSON, the app checks it (schema, duplicates) and opens GitHub with the new recipe file pre-filled |
| **Ask** | "Export catalog": copy a prompt + the whole catalog into an AI chat ("I have bread and veggies, what can I make?"), a plain-text link for AI tools, or the full JSON |
| **Use anywhere** | Installable on the Home Screen, works offline after one visit, light / dark mode, keyboard and screen-reader friendly |
| **Feedback** | "Send feedback" (menu, and on every recipe) by email or as a GitHub issue, pre-filled with the page and device |

## User journeys it supports (v1)

1. **"What do we make for breakfast / lunch / dinner?"** Meal tab, then protein-led tiles.
2. **"Had paneer last night, want something else."** Or "paneer, but in a different form": protein chips, dish types, dish versions.
3. **"Something quick" / "I have curd and 20 minutes".** Quick and Air fryer picks, ingredient search.
4. **"Tired of the usual, something different."** Global (fusion / non-Indian).
5. **"My go-to recipes."** My list, likes and dislikes, private notes.
6. **"Send this to Mom."** Share to WhatsApp with a readable message and a link.
7. **"I just saw a great reel, add it."** Add recipes from the phone through any AI chat and GitHub.
8. **"Cook didn't come, I have leftovers."** Ask an AI about the catalog with the Export prompt.

The step-by-step version of these, used for testing, is in [`docs/MANUAL-TEST.md`](docs/MANUAL-TEST.md).

## Scope

**In v1 (today):** everything above. Around 80 recipes, from creators' posts.

**Planned for v2 and later** (see [`docs/CONTEXT.md` §11](docs/CONTEXT.md)):
- **Meal plan:** day or week, 4 slots (breakfast, lunch, snack, dinner), with protein totals per day.
- **"Last planned" markers**, to fight repetition.
- **Rotation builder:** a 1–2 week rotation that hits 100–120 g a day with variety per protein. This is the end goal.
- **Suggestions:** an experiment nudge (an untried recipe), and smarter suggestions that re-plan the rest of the day.
- **Shopping list** for the week's plan.
- **Personal digestibility notes.**
- **Sync across devices** (only if Back up / Restore proves too painful), and an in-app AI (only if a paid API becomes acceptable).

**Deliberately not planned:** accounts, a backend, ads, tracking, scaling quantities (the cook does that).

---

## How it works

```
data/recipes/*.json ──► CI: schema + rules check ──► build (Vite) ──► GitHub Pages
        ▲                (a broken recipe never deploys)    │
        │                                                     ├─ app (Preact, works offline)
   PR / GitHub editor ◄── "Add recipes" / Claude sessions     ├─ r/<id>/ page + preview image per recipe
                                                              └─ catalog.txt (plain text for AI tools)
   Your notes, list, likes ──► your browser only (localStorage, pp.* keys)
```

- **Static site, no server.** Vite + TypeScript + Preact, deployed to GitHub Pages by GitHub Actions. Free to run.
- **Git is the single source of truth.** One recipe = one JSON file in `data/recipes/`, matching [`schema/recipe.schema.json`](schema/recipe.schema.json). Adding or editing a recipe is a commit, so every change is reviewable and reversible.
- **Every change is checked before it ships.** CI validates every recipe against the schema and rules, runs unit tests, builds, and runs browser tests: overflow at 9 widths in light and dark, accessibility (axe), keyboard. Only a green `main` deploys.
- **Personal data stays on your device.** Notes, My list, likes and ticks live in your browser. Nothing is sent anywhere. Back up / Restore is a file you control.
- **Offline first.** A service worker caches the app and its fonts and icons. The recipes are bundled in, so everything works offline after one visit.
- **Link previews without a server.** At build time every recipe gets its own page (`r/<id>/`) and a 1200×630 preview image, so a shared link shows a card in WhatsApp.
- **AI only where it's free.** Normalising recipes and answering questions happen in an AI chat or a Claude Code session. The site only copies prompts and checks the results. No API keys, nothing paid.

### Key decisions (full log in [`docs/DECISIONS.md`](docs/DECISIONS.md))

- **Creator's numbers only.** No estimate is ever shown as data. Per portion only when the creator says how many portions. Whole-dish totals and rough estimates appear only on the recipe page, labelled.
- **Steps in the creator's words.** Formatting only, with credit and a link. Ingredients are copied exactly; normalisation never changes a recipe.
- **Main protein = any source giving ≥ 35 % of the protein.** That sets the colour and the filters. Not-really-protein dishes are "Others".
- **Duplicates ≠ versions.** The same reel twice is a duplicate. Intentional variations share a dish group and show as one tile with versions.
- **No paid services, no servers, no API keys.** If something needs one (sync, in-app AI), it waits.
- **Mobile first.** Built for an iPhone in Chrome; no horizontal scroll from 320 px up; light and dark.

### How it was built

The app and the data were built in parallel by Claude Code sessions in two lanes:
- **Track A, the app:** `src/`, `tests/`, `schema/`, `scripts/` except `scripts/data/`.
- **Track B, the data:** `data/`, `prompts/`, `scripts/data/`.

The repo is the memory, not the chat: [`CLAUDE.md`](CLAUDE.md) explains the protocol, and [`docs/TRACKER.md`](docs/TRACKER.md), [`docs/PLAN.md`](docs/PLAN.md) and the handoff files in `docs/handoff/` let any new session pick up where the last one stopped.

---

## Run your own copy

You can have your own catalog with your own recipes, for free, in about 15 minutes. You need a GitHub account.

1. **Fork** this repository (GitHub → Fork).
2. **Turn on Pages:** your fork → Settings → Pages → Source: **GitHub Actions**.
3. **Edit `site.config.json`** in your fork. Everything that differs between copies lives here:
   ```json
   {
     "title": "Protein Plate",
     "description": "High-protein vegetarian recipes, filtered by meal, protein and dish type.",
     "owner": "your-github-name",
     "repo": "your-repo-name",
     "branch": "main",
     "site_url": "https://your-github-name.github.io/your-repo-name/",
     "base_path": "/your-repo-name/",
     "feedback_email": "you@example.com"
   }
   ```
   - "Edit on GitHub", "Add recipes" and GitHub feedback go to `owner`/`repo`.
   - Leave `feedback_email` empty to offer GitHub issues only. **The address is public.**
   - For a custom domain, set `base_path` to `/`.
4. **Choose your recipes.** Keep ours, or delete the files in `data/recipes/` and add your own:
   - **From the phone:** the app's **Add recipes** screen (AI chat → paste → check → commit on GitHub).
   - **In bulk:** a Claude Code session following [`docs/ADD-RECIPES.md`](docs/ADD-RECIPES.md) and the prompt in [`prompts/add-recipes.md`](prompts/add-recipes.md).

   Keep the creator credit and link on every recipe.
5. **Commit.** The Action validates, builds and deploys. Your site is live at `site_url` in about 2 minutes.

Your users' notes and lists stay in their own browsers; nothing is shared between copies.

## Develop locally

Node 22+.

```sh
npm ci
npm run dev                  # local site with data/recipes
VITE_FIXTURES=1 npm run dev  # local site with the 10 test fixtures
npm run validate             # schema-check every data/recipes/*.json (CI blocks deploy on failure)
npm test                     # unit tests
npm run test:e2e             # Playwright: screens at 9 widths × light/dark, overflow, accessibility, keyboard
npm run gen:types            # after editing schema/recipe.schema.json
npm run icons                # after changing the logo or brand colour (commit public/icons/*.png)
```

| Path | What |
|---|---|
| `src/` | the app (screens, components, `lib/` pure logic) |
| `data/recipes/` | one JSON file per recipe · `data/ingredients.json` the ingredient dictionary |
| `schema/` | recipe JSON Schema (types are generated from it) |
| `prompts/` | AI prompts the app copies (add recipes, ask about the catalog) |
| `scripts/` | build helpers (static pages, preview images, icons); `scripts/data/` data checks and dedupe |
| `tests/` | unit (Vitest) and browser (Playwright) tests, fixtures |
| `docs/` | plan, tracker, decisions, design, handoffs, manual test |
| `design/` | tokens and screen mockups |

**For contributors and AI sessions:** start with [`CLAUDE.md`](CLAUDE.md).

## Feedback

Use **Send feedback** in the app (menu, or the link at the bottom of any recipe): by email, or as a GitHub issue on this repository.

## Licence

**Code:** MIT (see [`LICENSE`](LICENSE)).

**Recipes:** the recipes, their methods and videos belong to their creators and are credited and linked on every page. They are not covered by the MIT licence.
