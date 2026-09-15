# Uninstall / removal

Order matters: back up first, delete last.

1. On the phone: Settings panel → **Export progress**, keep the JSON if you
   ever want the stats back.
2. Run `npm test` one last time and commit anything pending, so the archive
   is a clean state.
3. Archive the folder including `.git` (there is no `node_modules`).
4. Phone: remove the home-screen icon, then Chrome → Site settings →
   the app's origin → Clear data (this deletes localStorage: progress,
   settings, Lichess token).
5. If a Lichess API token was created for this app, revoke it at
   https://lichess.org/account/oauth/token .
6. Delete the project folder and, if used, the Claude project memory folder
   for it.

Nothing else was installed anywhere: no services, no databases, no global
packages.
