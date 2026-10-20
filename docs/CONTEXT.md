# Protein Plate — Context & Decision Record

**Owner:** Jatin · **Last updated:** 2026-10-20 · **Status:** design locked, build starting (see `docs/TRACKER.md`)
**Repo:** `protein-plate` (site: `<github-username>.github.io/protein-plate`). Design spec: `docs/DESIGN.md`. Plan: `docs/PLAN.md`.

> Read this whole file before doing anything. It records every decision made so far and *why*, so nothing has to be re-explained. If something here conflicts with your own instinct, this file wins; raise the conflict as a question instead of acting on it.

---

## 0. How to work with Jatin (read first)

- **Ask, don't assume.** Never fill a gap (platform, form factor, field meaning, scope) with your own assumption. Ask a short question. An earlier session assumed "web app" and was rightly rejected for it.
- **Problem before solution.** For anything new, validate the problem first; play devil's advocate on whether it is needed. Only ask questions whose answers would change what gets built. Do not pad with superficial questions.
- **Fail fast.** Mockups/previews before full builds. Show 10 normalised recipes before doing 80. Small PRs.
- **Don't conclude without data.** Don't make claims about the catalog without looking at it.
- **Mobile-first is non-negotiable.** Primary use: phone, Chrome browser. Must also work well on desktop. Verify at real viewport sizes (screenshots) before showing anything.
- **Free to run.** No paid APIs, no paid hosting, no servers.
- **His notes in raw data are instructions to you, not content.** Do not store them on the recipe.

---

## 1. The problem

- Jatin is vegetarian (Indian diet), target **100–120 g protein/day**.
- The real gap: **not knowing enough protein-rich veg options beyond dal and paneer**. Eating paneer every meal is not sustainable; repetition of the same *form* of a protein causes fatigue quickly.
- He saves recipes on Instagram/YouTube/X but never uses them because of friction: rewatching, convincing flatmates, buying ingredients, explaining to the cook.
- He lives with flatmates and has a cook (off on Sundays). **Anyone can cook anything**, there is no restriction on who makes what. The cook can follow a recipe; scaling quantities is the cook's job.
- He is also exploring cooking as a hobby ("self cook" = recipes *he* wants to try making).

**Goal:** a catalog that makes it easy to pick a high-protein meal with enough variety, and eventually a 1–2 week rotation that hits the daily target.
**Success:** he settles a rotation and only returns to the catalog to experiment.

---

## 2. Decisions history (so you don't re-propose rejected ideas)

| Idea | Outcome |
|---|---|
| Detailed PRD v0.1 (`recipe-data-model-prd.md`, in the claude.ai project) with per-ingredient protein accounting, 15% tagging rule, total + per-serving nutrition | **Superseded.** Too heavy. Only the general idea survives. |
| Full meal-planner app with plan history, day macro overview | **Parked.** Rotation building (J4) comes last. |
| Recommendations / smart planner / meal tracking / inventory | **Out of scope** for v1. |
| Haiku capture prompt that classifies | **Rejected.** Capture is raw text; classification happens once, with all recipes in view. |
| Keeping catalog only inside a chat | **Replaced** by GitHub Pages site (section 7). |
| Storing his notes as recipe descriptions; "Try soon" / "Rotation candidate" lists | **Rejected.** |
| "Experimental" tag | **Dropped** (every recipe is untried until cooked). |
| Digestibility tags (e.g. "no dal at dinner") | **Out for now.** May record his own experience after trying recipes. |
| Cook-scaling quantities (J3) | **Dropped.** Cook handles it. |

---

## 3. User journeys

**In scope (v1):**
- **J1** "What do we make for breakfast / lunch / snack / dinner?" → meal filter, protein-led cards.
- **J2** "Had paneer last night, want something else" or "paneer, but in a different form" → main-protein + format filters; dish groups with versions.
- **J5** "Something to cook myself when I have time" → Self cook tag.
- **J-new** "Tired of the usual, want something different / fusion today" → Global tag.
- **J8** Add new recipes with minimal effort. **Crucial.**
- **J9** Share a recipe (with family/friends, e.g. his mom). **Crucial.** Readable text + video link.
- **Agent questions** answered from an export of the catalog: leftovers ("have bread + veggies, not the same as yesterday"), "cook didn't come, have X/Y/Z", "what should I add for better coverage", "which spices must I always stock". The set of agent questions will be defined later.

**Later:** J4 build the 1–2 week rotation hitting 100–120 g/day.
**Tagged but silent:** J7 add-ons (sauces, dips, marinades, desserts) exist in data but are not surfaced in meal views.

---

## 4. Data rules (agreed)

### Portion basis
All protein/calorie figures are **per one person's portion**. Keep the creator's stated macros alongside your estimate; flag big disagreements.

### Main proteins (filterable)
Values: **paneer, soya, tofu, tempeh, pulses, whey**.
- `pulses` includes chana, rajma, moong, masoor, kala chana, chickpeas, **besan**, sattu.
- `soya` includes chunks, granules, soybeans.
- Yogurt/skyr/Greek yogurt, cheese, milk, peanuts, protein bread → **supporting proteins only**.
- A source is a **main protein if it supplies ≥ 35% of the recipe's protein**. A recipe can have more than one (e.g. soya tikki: soya + paneer). Larger contributor listed first.
- If any recipe ends up with no main protein, flag it for Jatin; do not invent a value.

### Meal types
breakfast, lunch, snack, dinner. **Multi-select.** Mark which were stated by Jatin vs inferred by you.

### Tags (one flat set; display-time hierarchy handles overload)
Formats from the data: Sandwich/toast · Salad/bowl · Wrap/roll/taco · Kebab/tikki/cutlet · Chilla/pancake/omelette · Curry/sabzi · Rice/pulao/biryani · Pasta/noodles · Chaat · Paratha · Pizza · Dessert · Sauce/dip/spread/marinade
Plus: **Global** (fusion / non-Indian) · **Quick** · **Air fryer** · **Self cook**
- **Quick** rule (your estimate, marked as such): ≲ 20 min hands-on, no overnight soak, no pressure cooker.
- **Air fryer**: tag both recipes that *need* one and ones that *offer* it as an option (record which). He plans to buy one.
- **Self cook**: recipes Jatin marked to try making himself. Not a restriction. **Superseded 2026-10-20:** not a tag — it became the personal **My list** (browser storage); Jatin's marks are delivered as a personal backup file (PLAN B4).
- Sauces/marinades/dips get **no meal type**, so they drop out of meal filters automatically but stay findable by tag.

### Dish groups (variants)
Intentional variants are **separate recipes** linked by a `dish_group`. In filtered results a group shows as **one card with an "N versions" badge**; opening it shows versions side by side with a short distinguishing label + protein per portion.
Confirmed groups:
- **Soya kebab / tikki** (one group): pea kebab (C3Kle_zymu4), corn-cheese kebab (DbqLxfZs5HG), galouti bowl (DVQoRPMjJM8), soya tikki (DI61-s4TC2H), chana soya galouti (Dc3jv-9CuSA, link-only), soya chana dal tikki (C9jM7TaSnrq, link-only). Label by distinguishing secondary ingredient.
- **Rajma taco**: DZXXa_0o0EX, DaAkBa1MZ5j.
- **Protein pasta**: DJwO3O9y43k (whole-wheat pasta, veggies, mozzarella), DbdLdvKTBOI (lentil spaghetti, caramelised onion, mushroom).
- Paneer + chole bowls (DCEcGydS4FX, DRencTQgUxz, DbS3qAeveTb) → **separate, not grouped**.

### Duplicates ≠ variants
- **Duplicate** = same recipe re-posted (same/normalised URL or reel id; or same creator + same ingredients/quantities). Not allowed in the catalog.
- **Variant** = different formulation of a dish → dish group.
- Detection layers: (1) normalised URL / reel id, (2) same creator + similar title, (3) high overlap of canonical ingredient set + main protein + rough quantities. **Never auto-drop.** Every batch outputs a "possible duplicates / possible variants" list for Jatin to confirm.
- Requires a **canonical ingredient dictionary** (jeera = cumin seeds ≠ cumin powder; haldi = turmeric; dahi = curd).

### Quantities & estimates
- Convert to grams where possible; keep original wording (`as_written`).
- Dal / soya / pulses recorded as **dry weight**; note assumption when the source says soaked/boiled.
- Every estimate shows its working (grams × protein per 100 g).
- Each ingredient typed: `protein | dairy | grain | produce | spice | pantry | sauce` (powers the spice-stock and leftovers questions).

### Incomplete entries — never dropped
Kept under their title with `status: "incomplete"` and a `missing[]` list; Jatin will supply details at the end.

---

## 5. Draft record shape (fields agreed; exact names to be confirmed in session 1)

```json
{
  "id": "soya-tikka-salad",
  "title": "Soya Tikka Salad",
  "source": { "url": "https://www.instagram.com/reel/DXbwwiyjOsF/", "platform": "instagram", "creator": null },
  "status": "complete",
  "meal_types": { "values": ["dinner"], "stated_by_user": ["dinner"] },
  "main_proteins": ["soya"],
  "supporting_proteins": ["greek_yogurt", "besan"],
  "tags": ["salad_bowl", "air_fryer_required"],
  "dish_group": null,
  "variant_label": null,
  "per_portion": { "protein_g": 45, "kcal": 420, "carbs_g": null, "fat_g": null, "fibre_g": null, "is_estimate": true },
  "stated_macros": { "basis": "per serving", "protein_g": 45, "kcal": 420 },
  "protein_working": ["40 g dry soya × 52 = 20.8 g", "200 g Greek yogurt × 9 = 18 g", "2 tbsp besan ≈ 15 g × 22 = 3.3 g"],
  "servings": 1,
  "ingredients": [
    { "item": "soya chunks", "qty": 40, "unit": "g", "type": "protein", "as_written": "40g soya chunks (dry)" }
  ],
  "steps": ["Boil soya chunks 5–6 min, squeeze dry."],
  "assumptions": [],
  "missing": [],
  "added_at": "2026-10-19"
}
```

Protein reference (g per 100 g, approx.): dry soya 52 · paneer full-fat 18 · low-fat/high-protein paneer 25 · firm tofu 10 · silken tofu ~5 · tempeh 19 · dry moong/masoor/toor/chana dal 23 · besan 22 · dry chole 19 · dry rajma 22 · dry kala chana 19 · curd 3.5 · Greek yogurt/skyr ~9–10 (high-protein brands higher — use pack value if named) · milk 3.3 · cheese 22 · peanuts 25 · oats 13 · sattu 20 · whey ~75–80 · protein bread: pack value, else 15 and flag.

---

## 6. Data inventory

- **Raw dump:** `Recipe.txt` (~80 entries, ~90k chars) — location per TRACKER decision D1 (not committed to the public repo by default). Jatin has scraped **more** recipes since — expect a second batch with likely duplicates.
- ~70 entries have usable text. Main proteins roughly: paneer ~30, soya ~15, pulses ~10, tofu ~8, tempeh 2. Yogurt/skyr supports ~30.
- File sections: main list, "Recipes with no caption", "Paneer marinades", "High protein dessert", "Air fryer", "Fun recipes", "Sauces/dips", and his own "Categories" note (superseded by section 4).
- **Incomplete (13):** Lasooni dhaniya paneer (DDw3BeKv9-K), Chana soya galouti kebab (Dc3jv-9CuSA), Chickpea salad (DdTy28sBGYj), Protein kebab air fryer (DcObwvYvcXh), Soya chana dal tikki (C9jM7TaSnrq), Paneer marinades (Dadwbwhy_L4), 5 paneer marinations (DKCVLxxoZDS), Sauce (DIk-CWWtQI1), Chipotle sauce (C8bV56bo7yT), Avocado & burrata toast (C79vsSgPAgW); partial: Chipotle paneer sandwich (DKZzE7Bxzze, no quantities), Soya tikki (DI61-s4TC2H, no method/spices), Hara bhara kebab (DbLb7d1JnbF, no method).
- **Jatin's daily breakfast:** protein oats with milk + whey. Model as placeholder: main protein **whey**, ~25–30 g protein/portion, details to come. (Not the overnight version from an older chat.)
- Same reel appears in both PRD and dump: breakfast sandwich (Dd1HwW3owPM).

---

## 7. Delivery & pipeline (agreed)

- **Static site on GitHub Pages**, free. Data = JSON in the repo. **Git is the single source of truth.**
- **Add recipes from phone:** Jatin opens a Claude Code session (web/mobile) on the repo → pastes raw recipes → session normalises, categorises, runs duplicate check, shows the "possible duplicates/variants" list → opens a PR → Jatin merges → GitHub Action validates + builds + deploys to Pages.
- **Add from the website:** "Add recipes" screen validates pasted JSON against the schema and runs the duplicate check, then opens GitHub's pre-filled "new file" page per recipe (owner commits; non-owners are offered fork + suggestion by GitHub). CI validates before deploy. The site never stores recipes of its own (avoids site/Git drift). _(Supersedes the earlier issue → Action → PR idea.)_
- **Actions run deterministic checks only** (schema, duplicates, build). LLM normalisation happens in Claude sessions, never in Actions (would need a paid API key).
- **Export (for agent questions):** (1) JSON download, (2) "starter prompt + catalog" copy, (3) plain-text/JSON page an LLM can read via link. Also a **compact export** (title, tags, proteins, protein/portion, ingredients) because 80+ full recipes is large.
- **Share (J9):** single Share button; message format fixed in DESIGN §6.
- **Video access:** every card must reach its video in one tap. Baseline: link opens the Instagram app. To verify: whether Instagram's public-post embed can play inline. Thumbnails: Instagram ones are uncertain (Meta restricts; no scraping). **Fallback:** one illustration per format tag.

---

## 8. UI principles (from Swiggy/Zomato screenshots — inspiration only, not to copy)

- Search box (matches titles **and ingredients**).
- **Meal row always visible** (All · Breakfast · Lunch · Snack · Dinner) — our equivalent of their Veg toggle.
- **Category carousel showing 3–5 + "See all"** grid for the rest of the tags.
- **Quick chips:** Quick, Self cook, Global, Air fryer. **Filters sheet** for main protein, format, sort by protein per portion; Clear all / Show results.
- Filter logic: **OR within a group, AND across groups** (paneer OR soya; breakfast AND soya).
- **Card leads with protein per portion**, then kcal; main-protein badge; "N versions" badge where the dish has variants; video affordance.
- No ads, offers, recommendations, spotlight banners, rating pop-ups.
- Don't overwhelm: few levers, few visible tags.

**Mockup canvas (claude.ai Design artifact):** https://claude.ai/artifact/Y1TPAPAPyZuEw9xUwi7Q74 — three directions, each with a phone home screen, one secondary phone screen and a desktop screen, all with dummy data:
- **A · Fresh** — white ground, green `#17734A`, Plus Jakarta Sans; 2-column picture-tile grid; secondary screen = dish-versions sheet; desktop = left filter sidebar + 4-column grid.
- **B · Night** — dark `#121315`, turmeric `#F4B740`, Space Grotesk + IBM Plex Sans; single-column cards led by a big protein number; secondary screen = recipe detail with version switcher, Watch-on-Instagram and WhatsApp share; desktop = chips + 3-column cards.
- **C · Ledger** — light `#F6F7FB`, blue `#2448C7`, Sora + Source Sans 3; dense list rows with protein right-aligned; secondary screen = filter sheet (OR within group, AND across groups); desktop = filter panel + sortable table.
Screens are interchangeable across directions (e.g. B's detail screen in A's look). Images are placeholder format icons (the thumbnail fallback). These are fixed-size comps for choosing the look; real responsive behaviour is verified in the build PR with screenshots at ~390 / 768 / 1280 px.

**Round 1 feedback (2026-10-19):** C rejected. Likes both A and B; liked A's colours and the different colours per card. Wants a mix of A + B, light and dark mode in the final design, and a single-recipe screen added.
**Round 2 (canvas page "Round 2 · A + B mixes"):** three mixes, each with phone home + full-length recipe screen (same recipe in all three, for fair comparison). Colour now means something: **one tint per main protein** (soya green, paneer amber, pulses terracotta, tofu blue, tempeh purple, whey teal).
- Mix 1 · Tiles — A's two-column tile grid; B's big protein number inside each tile.
- Mix 2 · Cards — A's colours; B's single-column cards; protein chips for quick switching; recipe screen with a protein band, video block and version cards.
- Mix 3 · Night top — B's dark header band and recipe hero; A's light tiles and body below.
**Light/dark plan:** pick the mix in light mode; then the chosen mix gets a dark-mode version of the same screens for one review. Only the chosen mix is done in both modes.

**Round 2 feedback (2026-10-19):**
- Recipe screen: **Mix 2 base** (separate ingredient and step cards, ingredient checkboxes, bookmark). Move Watch video + Share to **Mix 1's position** (side-by-side buttons just under the macros); no big video block and no share button at the bottom. Macros must be visible: protein + kcal always; carbs, fat, fibre shown when known, "—" when not stated (most sources give only kcal + protein).
- Add a **"Tried it?" Keep / Not for me** signal ("Not for me" hides from home, still searchable) and a **My notes** text box at the bottom, included in the shared message.
- Home: likes Mix 1's colours; dislikes big tiles with empty space and single-colour repetition. Round 3 shows three home layouts (colour list, filled tiles, shelves by protein) plus the final recipe screen.

**Video:** Meta removed `thumbnail_url` from Instagram oEmbed (auto-migration 3 Nov 2025) and recommends scraping page metadata instead, which a static site can't do and which breaks Instagram's terms. So **no video thumbnails; a "Watch video" button only.** (YouTube thumbnails are possible but skipped for consistency.)

**Personal state (notes, Keep / Not for me, bookmark):** proposed to live in browser storage on the device, not in Git. Reasons: GitHub Pages on a free account needs a public repo, so anything committed is public; browser storage is instant. Limits: per device and per browser (no sync), lost if site data is cleared; on iPhone, Safari can clear a site's data after a period of not visiting it (adding the site to the Home Screen avoids this). Mitigation: an "Export / import my data" file. _Awaiting Jatin's confirmation._

**Round 3 decisions (2026-10-19):**
- **Recipe screen: final** = canvas board `R3-Recipe` (page "Round 3").
- **Home: filled tiles** (Round 3 · Home 2) **plus outline dish-type icons** from Round 1 A. Round 4 page shows: home (`R4-Home`), filter sheet (`R4-Filters`), home with filters applied (`R4-HomeFiltered`).
- **How filters are reached from home:** meal tabs (always visible) · protein chips with their colour dot (one tap) · quick chips (Quick, Self cook, Global, Air fryer) · a filter button beside search opening a bottom sheet (main protein, dish type with icons, quick picks, Show: hide "Not for me" / only bookmarked, sort). Active filters: filter button turns green with a count badge, and a summary line with dish count + Clear sits above the tiles.

- **Locked (2026-10-19):** home = `R4-Home` (outline icon in the tile's top-right corner; the centred faint-icon variant 1b was rejected), filter sheet = `R4-Filters`, filtered home = `R4-HomeFiltered`, recipe = `R3-Recipe`.

**Round 5 (canvas page "Round 5 · Remaining journeys", pending review):** share sheet (message preview, toggles for ingredients / steps / my note, Send on WhatsApp, Copy text, Copy recipe link) · menu sheet from a new ⋯ button beside + (Add recipes, Export catalog, Back up / Restore my data, Light / Dark / Auto) · Add recipes (copy prompt → paste JSON → per-recipe check: ready / possible duplicate with Add as version · Add anyway · Skip / error with Copy fix-it prompt → Submit opens a pre-filled GitHub request) · Export (prompt + compact catalog, plain-text link, full JSON; personal data excluded unless ticked) · incomplete recipe (details-missing card, Watch video, Add details, notes still available) · search results (matches ingredients, "uses …" label) · no-results state (explains why, offers removing the narrowest filter or clearing all).
**Decision proposed:** tapping a dish with versions opens the highest-protein version directly; versions switch from "Other versions" on the recipe page (no intermediate sheet).

**Decisions 2026-10-20:**
- "Self cook" tag and bookmark merge into one personal **My list** (bookmark icon); Jatin's existing self-cook marks seed it. The "Self cook" quick chip becomes "My list".
- Keep-screen-awake toggle: **dropped**.
- Ingredient checkboxes: no label explaining them; ticks saved per recipe on the device until the user taps a **Clear** icon on the ingredients card.
- Share: one link per recipe (`/r/<id>`); share sheet splits into "Send to cook" (full text) and "Share link"; use the phone's native share sheet; per-recipe page + preview image generated at build for WhatsApp link previews.
- Proposed, awaiting confirmation: Edit = "Edit on GitHub" deep link to that recipe's file (owner commits, the Action validates and deploys); catalog sharing limited to (A) view by link, (B) copy the repo for your own catalog, (C) copy a single recipe's JSON into your own Add; no whole-catalog import or merge; personal data never travels with recipes. "Last made" dropped for v1 (plan ≠ eaten; revisit with the meal plan, labelled "planned"). Add-to-Home-Screen hint shown once; offline mode via service worker with a "new version, refresh" notice.

**Decisions 2026-10-20 (part 2):**
- **Confirmed:** "last made" moved to backlog (v2, with meal plan); Add-to-Home-Screen hint + offline mode in v1; editing by Claude Code (Jatin) or GitHub web editor (anyone without Claude); in-app **info (ⓘ) icons** on complex features (Add, Edit, Export, Backup, My data), written for someone who does **not** own the repo.
- **Share:** single **Share** button (replaces the send-to-cook / share-link split): one message with name, macros, ingredients, optional steps, optional note, **link to the recipe page at the end**; opens the phone's share sheet.
- **Reactions (proposed):** Like / Dislike (mutually exclusive, after trying) + My list (bookmark, independent). Dislike hides from home, filters and search; a "My recipes" view (tabs Liked · My list · Disliked) lets you change status. Replaces "Keep / Not for me".
- **Personal data stays on each device for every visitor** (each person using the site gets their own notes/likes/My list in their own browser; nobody sees anyone else's). Jatin's self-cook marks are **not** put in the repo (that would show for everyone); they're delivered as a one-time personal backup file he restores on his phone. A one-time "saved on this device only — use Backup to move" note appears the first time anyone saves something.
- **Filters:** OR within a group (paneer OR soya), AND across groups (dinner AND paneer). Filter sheet shows a live count next to each option ("Tempeh · 0") so dead-end combinations are visible before tapping; the no-results screen remains the safety net. Onus otherwise on the user.
- **Search (proposed):** client-side, offline: match title, ingredients, tags; synonyms from the canonical ingredient dictionary (dahi = curd, besan = gram flour); prefix + small-typo tolerance; title matches rank above ingredient matches; filters and meal tab still apply. Library candidates: MiniSearch or Fuse.js.
- **Add prompt (proposed):** one prompt file in the repo (`prompts/add-recipes.md`) used by the app, the README and Claude Code. Always returns a JSON **array** (1 or many recipes). Contains normalisation + categorisation + duplicate rules and a **compact index of the current catalog pasted inline** by the app's "Copy prompt" (don't rely on the AI fetching a URL). The app then re-runs deterministic duplicate checks after paste — AI suggests, app verifies.
- **Edit (proposed):** owner commits directly with the GitHub web editor; the deploy Action validates first, so an invalid edit never goes live and Git history allows undo. A non-owner pressing Edit on someone else's site is sent by GitHub to "fork and propose a change", which arrives as a suggestion to the owner.

**Post-v1 feature spec — meal plan (from Jatin, 2026-10-19):** pick a day on a calendar (or plan a week); choose one recipe each for breakfast, lunch, snack and dinner; show the day's total macros; nothing more. Stored in the browser, keeping at most the last 7 days. Calendar uses the browser's date functions, so weekdays are correct for any year. Needs a "pick a recipe for this slot" screen (likely the home grid filtered to that meal).

**Chosen visual direction:** Mix 1 colours on light — white ground, green `#17734A`, Plus Jakarta Sans for text, Space Grotesk for numbers; one tint per main protein (soya `#E3F1E9/#17734A`, paneer `#FDF1DC/#8A5208`, pulses `#FDE7DF/#A63D1A`, tofu `#E6EEF8/#24508F`, tempeh `#EFE8F8/#5E3592`, whey `#DFF3F1/#0D6B64`). _Pending: Jatin's sign-off on Round 4, dark mode of the final screens, desktop layout._

**Where design review happens:** look and layout are decided on the claude.ai canvas above (opens on the phone, no files to download). Once code exists, review happens on the deployed site / preview link, never on HTML files sent in chat.

---

## 9. Open questions

Tracked in `docs/TRACKER.md` → "Decisions needed".

---

## 10. Next steps

See `docs/PLAN.md` (phases) and `docs/TRACKER.md` (status).

---

## 11. Backlog (v2 and later) — keep, don't build yet

| Item | Notes |
|---|---|
| **Meal plan** | Spec in section 8. Day or week; calendar; 4 slots (breakfast, lunch, snack, dinner); day macro totals; browser storage, last 7 days; slot recipe picker. |
| **Last made / last planned** | Show "planned Tue", never "cooked", unless a confirm step is added. Depends on meal plan. Purpose: fight repetition. |
| **Rotation builder (J4)** | 1–2 week rotation hitting 100–120 g/day with variety per protein. End goal. |
| **Smart meal suggester** | From original notes: set protein/kcal targets, re-plan the rest of the day if a meal was skipped. Needs an LLM. |
| **Smart planner** | Taste profile, digestibility, saturation, prep time. Needs an LLM + stored preferences. |
| **Experiment nudge** | Suggest an untried recipe to break repetition. |
| **Inventory / shopping** | Quantities to buy for the week's plan. Tracking consumption judged too hard. |
| **Digestibility notes** | Personal "felt heavy" notes after trying; not folklore tags. |
| **Cross-device sync** | Only if the backup file proves too painful; must stay infra-free. |
| **In-app AI** | Replace copy-paste prompts; needs a paid API, so not until cost is acceptable. |
| **Catalog merge between copies (D)** | Rare; ad-hoc via Claude Code if ever needed. |
| **Desktop-specific layout polish** | Beyond the responsive v1. |
