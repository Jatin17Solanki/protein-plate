# Manual test plan — Protein Plate

The full feature test Jatin runs by hand on real devices. Automated tests (Vitest, Playwright, axe, Lighthouse) already cover layout at 9 widths, light/dark, overflow, keyboard and accessibility; this list is for what only a real phone, a real account or a real person can check.

**How to use it:** run each section on the devices marked for it, tick the box, and write anything odd in the results log at the end (section + item number + what you saw). One run of everything takes about 60–90 minutes.
**How to keep it current:** every phase that adds or changes something you can see adds or updates its section here, in the same PR (Track A: app; Track B: data checks in §14).

**Site:** https://jatin17solanki.github.io/protein-plate/

## Devices
| Code | Device / browser | Must run |
|---|---|---|
| **iC** | iPhone · Chrome | everything |
| **iS** | iPhone · Safari | everything marked ★ |
| **iH** | iPhone · added to Home Screen (from Safari) | §11 |
| **An** | Android · Chrome (if you can borrow one) | everything marked ★ |
| **D** | Laptop · Chrome, window at full width and narrowed to ~800 px | everything marked D |

Before you start: on each device, open the site once, then use Menu → **Back up my data** if you already have notes/My list you want to keep. Some tests below change them.

---

## 1. First visit ★
1. [ ] Open the site fresh (private tab). Home shows the logo, search, filter button, ⋯ menu, **+**, meal tabs (All · Breakfast · Lunch · Snack · Dinner), protein chips, quick chips (Quick · My list · Global · Air fryer) and a 2-column grid of tiles.
2. [ ] Phone only: a card at the bottom suggests adding to Home Screen (iPhone: "Tap Share, then Add to Home Screen"; Android: an **Install** option). Dismiss it with ×. Reload: it does not come back.
3. [ ] Nothing scrolls sideways anywhere on the page (try dragging left/right). Only the chip rows scroll sideways.
4. [ ] Light/dark follows the phone's setting (switch the phone to dark mode and back).

## 2. Home grid and filters ★ D
1. [ ] Each tile shows the protein number in the protein's colour, a dish icon, the name (max 2 lines) and "Protein · kcal". Tiles with no per-portion numbers say **Macros not given**, also when the creator only gives a whole-dish total (e.g. Mint Cheese Spread, Tempeh Pav Bhaji); those sort with the no-number tiles.
2. [ ] Grouped dishes show one tile with an "N versions" badge.
3. [ ] Tap **Dinner**: only dinner dishes. Tap **All**: everything back.
4. [ ] Tap **Paneer** then **Soya**: dishes with paneer **or** soya. Add **Quick**: only the quick ones among them. The summary line reads like "Paneer or Soya · Quick — N dishes" with **Clear**.
5. [ ] Open the filter sheet (sliders button). Every option shows a live count; options with 0 are dimmed and can't be tapped. "Show all 13 types" reveals the rest. **Show N dishes** applies; the filter button turns green with a count badge.
6. [ ] Sort: Protein high→low (default) vs Calories low→high changes the order.
7. [ ] Filter down to nothing (e.g. Tempeh + Dessert): the empty state offers "Remove ‹narrowest filter› · N dishes" and **Clear all filters**; both work.
8. [ ] **Others** is the last protein chip (grey). It shows only the not-really-high-protein recipes (chocolate pudding, watermelon sorbet, idli shakshuka), with grey tiles saying "Others".
9. [ ] Video-only recipes (e.g. 5 Paneer Marinations) are in the grid with a small **▶ Video only** badge and "video only" instead of a number; they sort after the recipes with numbers.
10. [ ] D: at full width the filters are a left sidebar with checkboxes and counts; at ~800 px the grid has 3 columns and the header is one row.

## 3. Search ★ D
1. [ ] Type **paneer**: matching dishes; title matches first.
2. [ ] Type **dahi**: finds curd recipes, each tile has a badge "uses curd" (Hindi/Hinglish synonyms).
3. [ ] Type a small typo (**panner**): still finds paneer dishes.
4. [ ] Meal tab and filters still apply while searching. × clears the search; phone: the back arrow leaves search mode.

## 4. Recipe page ★ D
1. [ ] Open a complete recipe: back · version line (if grouped) · Edit (pencil) · My list (bookmark). Title, chips (protein, dish, meals, air fryer, quick, global), macro card, **Watch video** + **Share**, "Recipe by ‹creator›" (link), Other versions, ingredients, steps, Tried it?, My notes.
2. [ ] Macro card: big protein number, kcal; carbs · fat · fibre show "—" when unknown; the footnote says where the numbers come from (creator per portion / whole recipe / none). Mint Cheese Spread shows its whole-dish total here ("protein, whole recipe"), and only here.
3. [ ] **Watch video** opens the Instagram/YouTube post (in the app if installed).
4. [ ] Tick 2 ingredients, leave the page, come back: still ticked. **Clear** unticks them all.
5. [ ] Other versions: tap one; it opens that version and the version line updates ("version 2 of 3").
6. [ ] Steps are the creator's words, numbered.
7. [ ] Open a recipe whose creator gave no numbers: tile and page say **Macros not given**, neutral colour if it has no main protein.
8. [ ] Incomplete recipes that are *not* video-only (none in the catalog on 2026-10-20; skip if there are none): dashed "Details missing" card listing what's missing; **Add details** instead of Share; notes still work.
9. [ ] Back arrow returns to Home with the same filters and scroll position.
10. [ ] D: at full width the page is two columns (left: title, macros, buttons, Tried it, notes; right: versions, ingredients, steps).
11. [ ] Open a video-only recipe: a "Video only" card instead of macros, **Watch video** is the big button, notes work.
12. [ ] Open Rajma Tacos or Hidden Veggie Paneer Steak: the macro card still shows "—", and below it an amber box "Rough estimate, not the creator's numbers" with the estimate and where it comes from. The tile on Home shows no estimate.
13. [ ] A recipe whose steps are only "No written method — watch the video for the steps." (e.g. Paneer Marinades) shows that line with a ▶ icon instead of a numbered step.

## 5. My list, Like / Dislike, notes ★
1. [ ] Bookmark a recipe: icon fills. Home → **My list** quick chip shows it.
2. [ ] **Like** it; tap Like again: unset. **Dislike** another: it disappears from Home, filters and search.
3. [ ] Filter sheet → "Show disliked recipes" on: it's back in the grid. Off again.
4. [ ] Write a note; leave the page within a second; come back: the note is saved. Kill the browser and reopen: still there.
5. [ ] Menu → **My recipes**: Liked · My list · Disliked tabs with counts; **Undo** on a disliked recipe brings it back everywhere.

## 6. Share ★
1. [ ] Share sheet preview: title, protein line, ingredients (on), steps (off), my note (on, only if I wrote one), then **Full recipe** link, then **Video**. Toggles change the preview.
   - [ ] Share a whole-dish recipe (e.g. Tempeh Pav Bhaji): the protein line says "Macros not given", not the whole-dish total.
2. [ ] **Share…** opens the phone's share menu; send to yourself on WhatsApp. The message looks like the preview; the link preview card shows our recipe card (big protein number, title), not the Instagram thumbnail. (WhatsApp caches previews per link: test with a recipe you haven't shared before.)
3. [ ] **Copy text** copies exactly the preview.
4. [ ] Open the shared link on another phone (or private tab): the recipe opens directly.

## 7. Edit a recipe (GitHub) ★
1. [ ] Recipe → pencil: the "How this works" box is open the first time only.
2. [ ] **Edit on GitHub** opens the recipe's file in GitHub's editor (logged in as you). Cancel without committing.
3. [ ] **Copy recipe data** copies the recipe JSON (paste into Notes to check).

## 8. Add recipes ★ (needs a GitHub login; commits for real)
1. [ ] **+** (or Menu → Add recipes) opens Add recipes. ⓘ explains the GitHub step.
2. [ ] **Copy prompt**; paste into ChatGPT or Claude; below it paste one new reel link + caption. The reply is a JSON array in a code block.
3. [ ] Paste the whole reply into step 2. Step 3 shows the recipe as ✓ Ready (protein, meals).
4. [ ] Paste a reel that's already in the catalog: ! possible duplicate with the reason; **Skip**, **Change**, **Add anyway**, **Add as version** (asks for labels) all work.
5. [ ] Break the JSON (delete a field in the paste): × error; **Copy fix-it prompt** → paste in the same chat → paste its reply: now ✓.
6. [ ] **Submit** → step 4 lists one **Open on GitHub** per recipe. Tap it: GitHub's new-file page opens with `data/recipes/<id>.json` and the recipe filled in. *(If GitHub shows an error instead, note it: the link is too long — see A7 handoff.)*
7. [ ] **Commit changes**. Within ~2–3 minutes (GitHub → Actions shows the check passing) the recipe appears on the site after a refresh / "New recipes available" prompt.
8. [ ] A recipe too long to pre-fill shows **Copy JSON** + an empty GitHub page: paste and commit works the same.

## 9. Export ★ D
1. [ ] Menu → Export catalog: the count matches the number of recipes.
2. [ ] **Copy prompt + catalog** → paste into an AI chat → ask "I have bread and veggies left, what can I make?" The answer uses catalog recipes with their links.
3. [ ] Tick **Include my notes, My list and Like / Dislike**, copy again: your liked/disliked/notes appear in the pasted text. Untick: they don't.
4. [ ] **Copy link** → paste in a browser: `catalog.txt` shows every recipe as plain text (no personal data). Give the link to an AI tool that can read links and ask a question.
5. [ ] **Download JSON** saves `protein-plate-catalog-<date>.json` (phone: Files / Downloads).

## 10. Menu, theme, back up / restore ★
1. [ ] Appearance Light / Dark / Auto switch immediately and stick after reload.
2. [ ] **Back up my data** saves `protein-plate-backup-<date>.json`.
3. [ ] On another device/browser: **Restore from backup** with that file → "Restored. You now have …". My list, likes and notes appear.
4. [ ] Change a note on device B, restore the same backup again: it asks **Keep this device's / Use the backup's**; each choice does what it says.
5. [ ] Restore a random non-backup file: clear error, nothing changes.

## 11. Installed app and offline (iH, An)
1. [ ] Add to Home Screen; open from the icon: full screen, our icon and name, status bar colour matches the theme.
2. [ ] Open a few pages, then airplane mode. Close and reopen the app: Home, filters, search, any recipe, My recipes, Add recipes (copy prompt) and Export (copy prompt) all work. Watch video / GitHub / catalog.txt need the network (fine).
3. [ ] Notes and ticks made offline are still there after going back online.
4. [ ] After the next deploy (any merge): the app shows **New recipes available — Refresh** at the top; Refresh loads the new version; it never reloads by itself.

## 12. Review page (owner only) D
1. [ ] Open `/protein-plate/review/` (bookmark it; it isn't in the menu). "N of M recipes need a look".
2. [ ] Flag chips filter the list; the URL keeps the filter (reload keeps it).
3. [ ] Copy title, Video and Edit on GitHub work on a card.
4. [ ] Video-only recipes and flags you already accepted (e.g. "no macros" on Shaam Savera) are **not** listed.

## 13. Accessibility spot checks ★ D
1. [ ] iPhone: Settings → Accessibility → Display & Text Size → Larger Text to the max: Home and a recipe still readable, nothing cut off or overlapping badly.
2. [ ] iPhone VoiceOver on a recipe: swipe through; it reads title → macros → buttons → versions → ingredients → steps → Tried it → notes, and every button has a name.
3. [ ] D: keyboard only (Tab / Shift+Tab / Enter / Esc): open filters, apply, open a recipe, share sheet, close with Esc. A green focus ring is always visible.
4. [ ] Phone landscape: sheets scroll; nothing is cut off.

## 14. Data spot checks (pick 5 recipes at random) D
1. [ ] Ingredients and amounts match the video/caption exactly.
2. [ ] Steps are the creator's wording.
3. [ ] Numbers shown are the creator's (or "Macros not given"); per portion only when the creator says how many portions.
4. [ ] Main protein colour and meal tabs make sense; flagged recipes appear on the review page.

---

## Results log
| Date | Device | Section.item | What happened | Fixed in |
|---|---|---|---|---|
| | | | | |
