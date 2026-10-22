# Manual test — walk through Protein Plate one user journey at a time

**Who:** Jatin, once, on real devices, when both tracks are done (DECISIONS 2026-10-20).
**How:** each journey starts with a real-life situation. Follow the steps as if it were really happening; each step says what you should see. Every journey ends with a few feedback questions. **Don't fix anything along the way**: collect all the feedback first, then decide together what to act on (see "After the test").
**Time:** about 10 minutes per journey, 2–2½ hours for all of them. They're independent: do them in any order, over several sittings.
**Site:** https://jatin17solanki.github.io/protein-plate/

---

## How to give feedback

For anything that surprises you, write one line, in the journey's **Feedback** box below (edit this file on GitHub), or just send it to a Claude session in chat. Either way it ends up in the **Feedback log** at the bottom.

> **J3.4** · iPhone Safari · *confusing* · "Typing 'panner' found nothing" (expected paneer dishes)

- **Where:** journey + step number (J3.4), or the journey alone for general remarks.
- **Device:** iPhone Chrome / iPhone Safari / installed app / Android / laptop.
- **Kind:** **bug** (doesn't work or shows something wrong) · **confusing** (works, but you hesitated or misread it) · **idea** (missing or would be nicer) · **good** (keep this; worth knowing too).
- A screenshot helps for anything visual.

## Devices

| Code | Device / browser | Use for |
|---|---|---|
| **iC** | iPhone · Chrome | every journey (your main phone setup) |
| **iS** | iPhone · Safari | J1, J2, J6, J10 at least |
| **iH** | iPhone · added to Home Screen (from Safari) | J10 |
| **An** | Android · Chrome, if you can borrow one | J1, J6, J10 |
| **D** | Laptop · Chrome: full width, then the window narrowed to ~800 px | J2, J7, J8, J9 |

**Before you start:** Menu (⋯) → **Back up my data** if you already have notes or a My list you want to keep. J5 changes them.

---

## What's in the app (quick map)

| Feature | Where | Journey |
|---|---|---|
| Home grid: protein number, dish icon, colour by main protein | Home | J1 |
| Meal tabs, protein chips, quick chips (Quick · My list · Global · Air fryer), filter sheet with live counts, sort | Home | J1, J2, J3 |
| Search by dish or ingredient, Hindi/Hinglish names, small typos | Home | J3 |
| Dish versions ("6 versions", Other versions) | Home, recipe | J2 |
| Recipe page: macros, Watch video, ingredients with ticks, steps, Tried it (Like / Dislike), My notes | Recipe | J1, J5 |
| My list (bookmark), My recipes page | Recipe, menu | J5 |
| Share (WhatsApp text + link preview) | Recipe | J6 |
| Add recipes (AI chat → JSON → check → GitHub) | + button / menu | J7 |
| Export catalog (AI prompt, link for AI tools, JSON file) | Menu | J8 |
| Edit on GitHub, review page for flagged recipes | Recipe, `/review/` | J9 |
| Back up / restore, light / dark, install, offline, update prompt | Menu, phone | J10 |
| Special recipes: Others, video only, whole-dish numbers, rough estimates | Home, recipe | J11 |
| Accessibility: big text, VoiceOver, keyboard | everywhere | J12 |
| Send feedback (email or GitHub issue) | Menu, bottom of every recipe | J13 |
| README: what the app is, credits, run your own copy | GitHub repo page | J13 |

---

## J1 · "What do we make for breakfast?"
*It's 8 am. You want something high-protein for breakfast and need to see what's possible.*  ·  iC (also iS, An)

1. Open the site in a fresh tab. **See:** logo, ⋯ menu, green **+**, search bar, filter button, meal tabs (All · Breakfast · Lunch · Snack · Dinner), protein chips, quick chips, a 2-column grid of coloured tiles. Nothing scrolls sideways when you drag left/right (only the chip rows do).
2. First visit only: a dark card at the bottom suggests adding the site to your Home Screen. Close it with ×. **See:** it doesn't come back after a reload.
3. Tap **Breakfast**. **See:** only breakfast dishes, highest protein first (e.g. Balanced Breakfast Bowl 48 g, Tiramisu Overnight Oats 42 g, Breakfast Pizza Toast 40 g).
4. Read a tile. **See:** the big protein number in the tile's colour (colour = main protein), a dish icon, the name, "Paneer · 450 kcal" style line. Tiles with no per-portion numbers show "—" and **Macros not given**; they come last.
5. Open **Balanced Breakfast Bowl**. **See:** title, chips (protein, dish, meals…), the macro card (protein per portion, kcal; carbs/fat/fibre or "—"), a footnote saying the numbers are the creator's, **Watch video** + **Share**, "Recipe by …" with a link, ingredients, numbered steps, Tried it?, My notes.
6. Tap **Watch video**. **See:** the Instagram post opens. Come back.
7. Tick two ingredients as if you were gathering them. Leave the recipe and open it again. **See:** still ticked. **Clear** unticks them.
8. Tap Back. **See:** Home exactly as you left it (Breakfast tab, scroll position).

**Feedback J1**
- Could you pick a breakfast within a minute? What slowed you down?
- Were the numbers on the tiles clear (per portion, creator's own)?
- Anything on the recipe page you didn't need, or missed?
>

---

## J2 · "Had paneer last night, want something else"
*Yesterday was paneer. Today you want another protein, or paneer in a completely different form.*  ·  iC, D

1. Tap **Soya** then **Pulses**. **See:** dishes with soya **or** pulses; a line like "Soya or Pulses — N dishes" with **Clear**.
2. Tap the filter button (sliders). **See:** a sheet with Main protein, Dish type (8 + "Show all 13 types"), quick picks, "Show disliked recipes", Sort. Every option shows how many dishes you'd get; options that would give 0 are dimmed.
3. Pick a dish type, e.g. **Kebab / tikki**. Tap **Show N dishes**. **See:** the filter button turns green with a count badge.
4. Find the **Soya kebab** tile with "6 versions". Open it. **See:** "Soya kebab · version 1 of 6" at the top, and **Other versions** cards (with peas, with corn & cheese, galouti bowl…). Tap one: that version opens.
5. Back on Home, try **Paneer** only, then sort **Calories low → high** in the sheet. **See:** the order changes.
6. Filter down to nothing (e.g. **Tempeh** + **Dessert**). **See:** an empty state that offers to remove the narrowest filter ("Remove … · N dishes") or **Clear all filters**; both work.
7. Laptop, full width: **See:** filters as a left sidebar with checkboxes and counts, no filter button. At ~800 px: 3 columns, header in one row.

**Feedback J2**
- Did "different protein" or "different form" feel easy to find?
- Did versions make sense (one tile, several versions inside)?
- Were the counts in the filter sheet useful or noise?
>

---

## J3 · "I have curd and 20 minutes"
*You're short on time and know what's in the fridge.*  ·  iC

1. Tap **Quick**, then **Dinner**. **See:** only quick dinners (e.g. Korean Tofu Wrap, Paneer Butter Garlic).
2. Clear filters. Tap **Air fryer**. **See:** air-fryer dishes (Soya Tikka Salad, Breakfast Pizza Toast…).
3. Clear. Type **curd** in search. **See:** dishes that use curd (about 14); tiles matched by an ingredient carry a "uses …" badge naming it (e.g. "uses yogurt (curd)"); dishes with the word in their name come first.
4. Type **dahi** instead. **See:** the same curd dishes as step 3 (Hindi/Hinglish names should work). *Known: today it finds only 5. Feedback log #1.*
5. Type **panner** (typo). **See:** paneer dishes still appear.
6. While searching, tap a meal tab. **See:** search and meal tab work together. × clears the search; on the phone the ← arrow leaves search mode.

**Feedback J3**
- Did searching by ingredient find what you expected?
- Were Quick / Air fryer labels accurate for the dishes you know?
>

---

## J4 · "Tired of the usual, something different"
*You want something non-Indian or fusion tonight.*  ·  iC

1. Tap **Global**. **See:** fusion / non-Indian dishes (Moong Dal Veg Pizza, High Protein Pasta, Nachos with Cheesy Paneer Dip, Tempeh Avocado Toast…).
2. Combine with a protein chip (e.g. **Tempeh**). **See:** the list narrows; the summary line shows both.

**Feedback J4**
- Do these feel "different" to you? Anything tagged Global that isn't, or the other way round?
>

---

## J5 · "My go-to recipes"
*You want a short list of the dishes you actually cook, and to hide the ones you won't.*  ·  iC, then a second device for step 7

1. Open three recipes you'd cook and tap the **bookmark** on each. **See:** it fills green.
2. Home → **My list** chip. **See:** exactly those three.
3. On one recipe tap **Like**; tap it again. **See:** it unsets. Like it again.
4. On a recipe you'd never make, tap **Dislike**. **See:** it disappears from Home, filters and search. Filter sheet → "Show disliked recipes" on: it's back. Turn it off.
5. Write a note on a recipe ("half the chilli"). Leave immediately, come back. **See:** the note is there. Close the browser fully and reopen: still there.
6. Menu (⋯) → **My recipes**. **See:** tabs Liked · My list · Disliked with counts. **Undo** on the disliked recipe brings it back everywhere.
7. Menu → **Back up my data** (a file downloads). On a second device or browser: Menu → **Restore from backup**. **See:** "Restored. You now have …" and the same list, likes and notes. Change a note there and restore again: it asks **Keep this device's / Use the backup's**.

**Feedback J5**
- Bookmark vs Like: is the difference clear?
- Did you trust that notes were saved? Was "saved on this device only" clear?
>

---

## J6 · "Send this recipe to Mom"
*You found a dish you want your mom to try. She uses WhatsApp, not this site.*  ·  iC (also An)

1. Open a recipe → **Share**. **See:** a preview of the exact message: title, protein line, ingredients (on), steps (off), your note (only if you wrote one), then **Full recipe** link, then **Video** link. Toggles change the preview.
2. Tap **Share…** → WhatsApp → send it to yourself (or Mom). **See:** the message looks like the preview, and the link preview card shows our recipe card (big protein number, title), not the Instagram thumbnail. (WhatsApp remembers previews per link: use a recipe you haven't shared before.)
3. Tap **Copy text** instead and paste somewhere. **See:** exactly the preview text.
4. Open the shared link on another phone. **See:** the recipe opens directly; it works without the app.
5. Share **Tempeh Pav Bhaji**. **See:** the protein line says "Macros not given" (the creator only gives a whole-dish total, which stays on the recipe page).

**Feedback J6**
- Would Mom understand the message without the site?
- Too much or too little in the default message?
>

---

## J7 · "I just saw a great reel, add it"
*An Instagram reel with a high-protein recipe. You want it in the catalog in a few minutes, from your phone.*  ·  iC (GitHub login needed; this **commits for real**)

1. Tap the green **+** (or Menu → Add recipes). Tap ⓘ. **See:** an explanation of the GitHub step, written for someone who doesn't own the repo.
2. **Copy prompt**. Open ChatGPT or Claude, paste, and below it paste the reel link + the caption. **See:** the AI replies with a JSON array in a code block.
3. Paste the whole reply into step 2. **See:** step 3 lists the recipe as ✓ **Ready** with its protein and meals.
4. Try a reel already in the catalog. **See:** ! **possible duplicate** with the reason, and Add as version / Add anyway / Skip (and Change after choosing).
5. Break the JSON on purpose (delete a line). **See:** × **error** with the problems; **Copy fix-it prompt** → paste in the same chat → paste its answer → now ✓.
6. **Submit** → step 4 lists one **Open on GitHub** per recipe. Tap it. **See:** GitHub's new-file page with `data/recipes/<id>.json` already filled. *(If GitHub shows an error instead, the link is too long: note it; that's the 8,000-character cap.)* A recipe too long to pre-fill shows **Copy JSON** + an empty page instead.
7. **Commit changes**. Within 2–3 minutes (GitHub → Actions shows the check passing) the recipe appears on the site after a refresh, or the site offers "New recipes available — Refresh".

**Feedback J7**
- How long did it take, from reel to live?
- Which step was the slowest or most confusing?
- Did the AI's output pass first time?
>

---

## J8 · "Cook didn't come, I have bread and veggies left"
*You want an AI to suggest dishes from your catalog, based on what's at home.*  ·  iC, D

1. Menu → **Export catalog**. **See:** the recipe count and three options.
2. **Copy prompt + catalog** → paste into ChatGPT or Claude → ask "I have bread and veggies left, what can I make?". **See:** it may first ask up to two short questions (meal, time, what's at home); then it suggests up to 3 recipes from your catalog with protein per portion, why it fits and the link, and once you pick one it ends with **Open the recipe: <link>**. Tap a link: it opens that recipe on the site.
   - Also try "plan my day to reach 110 g": for recipes without creator numbers it asks once whether to leave them out ("not counted") or use its "≈ estimate", shown apart from the real numbers.
3. Tick **Include my notes, My list and Like / Dislike**, copy again. **See:** the pasted text now explains "My data" and each recipe line carries your list / likes / notes. Untick: neither is there.
4. **Copy link** → open it in a browser. **See:** `catalog.txt`, every recipe as plain text, no personal data. Give the link to an AI tool that can read links and ask a question.
   - Also open `…/protein-plate/catalog.json`. **See:** the same recipes as structured JSON (no personal data). The README's `curl … | jq` example prints quick breakfasts with ≥ 25 g protein.
5. **Download JSON**. **See:** `protein-plate-catalog-<date>.json` in Files / Downloads.

**Feedback J8**
- Were the AI's answers useful? Which questions did you actually want to ask?
>

---

## J9 · "This recipe has a mistake"
*You spot a wrong amount, or want to see which recipes still need your decision.*  ·  D (or iC)

1. Open a recipe → pencil (Edit). **See:** a "How this works" explainer, open the first time only.
2. **Edit on GitHub** opens the recipe's file in GitHub's editor. Cancel without committing.
3. **Copy recipe data** copies the recipe as text.
4. Open `/protein-plate/review/` (bookmark it; it's not in the menu). **See:** "N of 79 recipes need a look" (possibly 0 now that Track B resolved them). Flag chips filter the list and stay in the address. Video-only recipes and flags you already accepted are **not** listed.

**Feedback J9**
- Is editing on GitHub from the phone workable, or should edits be something else?
>

---

## J10 · "Use it like an app, also offline"
*In the kitchen, phone on the counter, maybe without signal.*  ·  iH, An

1. Menu → Appearance **Light / Dark / Auto**. **See:** switches at once and sticks after reload.
2. Safari → Share → **Add to Home Screen** (Android: Chrome's **Install**). Open it from the icon. **See:** full screen, our icon and name, status bar colour matches the theme.
3. Open a few pages, then turn on airplane mode, close and reopen the app. **See:** Home, filters, search, any recipe, My recipes, Add recipes (Copy prompt) and Export (Copy prompt) all work. Watch video / GitHub / catalog.txt need the network (fine).
4. Write a note offline, go back online. **See:** the note is still there.
5. After the next deploy (any merge): **See:** "New recipes available — Refresh" at the top; Refresh loads the new version; the app never reloads by itself.
6. Turn the phone sideways and open a sheet. **See:** it scrolls; nothing is cut off.

**Feedback J10**
- Would you use it from the Home Screen or from Chrome?
>

---

## J11 · "Recipes that aren't quite recipes"
*Some posts don't give everything. The app should be honest about it.*  ·  iC

1. Tap **Others** (last protein chip, grey). **See:** 3 not-really-high-protein dishes (Chocolate Pudding, Idli Shakshuka, Watermelon Coconut Sorbet), grey tiles saying "Others".
2. Find **5 Paneer Marinations** on Home. **See:** a ▶ **Video only** badge, "video only" instead of a number, sorted after numbered dishes. Open it. **See:** a "Video only" card instead of macros, a wide **Watch video**, notes still work.
3. Open **Rajma Tacos** (inside the Rajma taco versions) or **Hidden Veggie Paneer Steak**. **See:** the macro card still says "—", and under it an amber box "Rough estimate, not the creator's numbers" with the estimate and where it comes from. Home shows no estimate.
4. Open **Mint Cheese Spread**. **See:** the macro card shows the creator's whole-dish total ("protein, whole recipe"); on Home its tile shows "—" / Macros not given.
5. Open **Hara Bhara Kebab** or **Tofu Cabbage Paratha**. **See:** steps show one line with ▶ "No written method — watch the video for the steps." instead of a numbered list.
6. Pick 5 recipes at random and compare with their videos. **See:** ingredients and amounts match exactly; steps are the creator's wording; numbers are the creator's (or "Macros not given").
7. Open `/r/masala-makhana/` (archived). **See:** the full recipe from the post's pinned comment, an assumption saying so, and the "Archived" note. Open **Korean Tofu Wrap**. **See:** "Other versions" shows the rice paper rolls.
8. Open any recipe credited to **@fit.khurana** (e.g. Soya Pea Stuffed Paratha). **See:** "by @fit.khurana" with a link to her profile; older catalog recipes from her posts (e.g. Shahi Paneer, Watermelon Sorbet) now show the credit too.
9. Open `/archive/` (not in the menu). **See:** 93 archived recipes in groups (Drinks & coolers, Sweets & snacks, Breakfast bowls & oats, Sauces & dips, Condiments, Low-protein dishes, Staples), with chips to filter. Open **Til Gud Makhana**. **See:** an "Archived · Sweets & snacks" note on the recipe page; search Home for "til gud". **See:** it doesn't show. It's not in Export or `catalog.txt` either.

**Feedback J11**
- Are these labels clear and honest, or confusing?
- Should video-only and Others be hidden by default, or stay in the grid?
- Anything in the archive you want back in the catalog?
>

---

## J12 · Accessibility spot check (optional, 10 min)
*Someone with big text, VoiceOver, or only a keyboard.*  ·  iC, D

1. iPhone Settings → Accessibility → Display & Text Size → Larger Text to the max. **See:** Home and a recipe still readable; nothing badly cut off.
2. iPhone VoiceOver on a recipe: swipe through. **See:** title → macros → buttons → versions → ingredients → steps → Tried it → notes; every button has a name.
3. Laptop, keyboard only (Tab, Shift+Tab, Enter, Esc): open filters, apply, open a recipe, open Share, close with Esc. **See:** a green focus ring always visible; focus returns where it was.

**Feedback J12**
>

---

## J13 · "Tell Jatin something's off" + "What is this site?"
*Your mom finds a mistake in a recipe; a friend wants to know what the site is and make their own.*  ·  iC, D

1. Home → Menu (⋯) → **Send feedback**. **See:** a sheet with **Email** (green) and **GitHub issue**, and a note that GitHub needs an account and is public.
2. Tap **Email**. **See:** your mail app opens to jatin.dev.17@gmail.com, subject "Protein Plate feedback", and a short form with the page address and your device ("iPhone · Chrome"). Send it to yourself and check it arrives.
3. Open any recipe, scroll to the bottom: "Something wrong or missing here? **Send feedback**". **See:** the sheet names the recipe; the email subject and the GitHub issue title include the recipe name.
4. Tap **GitHub issue** (logged in). **See:** a new-issue page on the repo with the title and body filled in. Close it without submitting (or submit one test issue and close it).
5. Open the repo on GitHub (https://github.com/Jatin17Solanki/protein-plate). **See:** the README explains what the app does, says clearly that recipes belong to their creators, lists the user journeys and what's planned for v2, and has a "Run your own copy" section a friend could follow.

**Feedback J13**
- Would your mom manage the email route? Is anything in the README wrong or missing?
>

---

## After the test

1. When every journey you planned is done, tell a Claude session: **"manual test done"**.
2. That session reads the Feedback log, groups duplicates, and proposes for each item **fix now / later (backlog) / won't fix**, with the reason. Nothing is changed before that.
3. You decide; the decisions go into `docs/DECISIONS.md`, fixes become TRACKER rows (e.g. `A9 Fixes from manual test`, data fixes as Track B rows).

## Feedback log

| # | Where | Device | Kind | What happened / what you expected | Decision (after the test) |
|---|---|---|---|---|---|
| 1 | J3.4 | all | bug | Found while writing this plan (2026-10-21): "curd" finds 14 dishes, "dahi" only 5 (only those with the word "dahi"). Search still uses the A3 built-in synonym list instead of the aliases in `data/ingredients.json`. | |
| 2 | J1.5 | all | confusing | Found while taking README screenshots (2026-10-21): about 25 recipes' macro footnote reads e.g. "As stated by the creator (whole recipe — one portion (Jatin))": the portion decision and Jatin's name leak into visible text (`stated_macros.basis`, Track B data). | Fixed by Track B in PR 25 (basis now "whole recipe — one portion"). |
| 3 | | | | | |

---

**For Claude sessions:** when a phase adds or changes something visible, add or update the steps in the journey it belongs to (or add a new journey) in the same PR, and update the quick map. Keep "See:" lines concrete: name a real recipe where it helps.
