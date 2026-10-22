# Branch protection for `main`

Two GitHub rulesets, ready to import. GitHub doesn't read these files on its own; importing them takes about a minute.

| File | What it does | Who can bypass |
|---|---|---|
| `main-no-force-push.json` | `main` can't be deleted or force-pushed (history can't be rewritten). | Nobody |
| `main-pr-and-ci.json` | Changes reach `main` through a pull request, and only when the CI job `check` is green. No approval is required, so you can merge your own PRs. | Repository admins (you), so committing a recipe from GitHub's editor ("Add recipes", "Edit on GitHub") still works: GitHub shows a "Bypass rules" checkbox. |

## Import
1. Repo → **Settings → Rules → Rulesets → New ruleset → Import a ruleset**.
2. Choose `main-no-force-push.json` → **Create**.
3. Repeat with `main-pr-and-ci.json`.

Stricter option: in the second ruleset, remove yourself from **Bypass list**. Then every change, including recipes added from the app, goes through a pull request, which you merge after CI is green.
