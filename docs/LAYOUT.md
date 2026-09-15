# Layout, running, and moving to another machine

Static site. No build step, no npm dependencies, no backend. Node is only
needed to run the tests; Python only to serve the folder locally.

## Files

```
index.html              the whole UI (home screen + trainer screen)
manifest.webmanifest    PWA manifest ("Add to Home Screen")
icon.svg                app icon
css/style.css           dark theme, board, panels
js/app.js               DOM glue: screens, training loop, review, panels
js/repertoire.js        THE DATA: two openings as mainLine + branches
js/tree.js              pure helpers over that shape (buildLine, labels, deviation pick)
js/progress.js          accuracy / streaks / weak spots, localStorage
js/settings.js          user settings, localStorage
js/feedback.js          square flash + Web Audio sounds
js/explorer.js          Lichess masters explorer client (needs a token)
js/chesscom.js          Chess.com game import + gap analysis
js/engine.js            Stockfish in a Web Worker, UCI wrapper, evaluate(sans)
js/branchBuilder.js     the eval-cutoff rule + line extender (pure, tested)
vendor/chess.js         chess.js 1.0.0 ESM, BSD-2-Clause (licence beside it)
vendor/stockfish/       Stockfish 18 lite single-threaded WASM, 7 MB, GPL-3
tests/*.test.mjs        node:test suites for everything that is not DOM
docs/sources.md         every external URL consulted, dated
PLAN.md                 decisions, scope, job list — read first each session
PROJECT_BRIEF.md        the original spec and the "why"
```

## localStorage keys (all on the device that runs the app)

| Key | Content |
|---|---|
| `openingTrainer.progress.v1` | attempts, streaks, mistakes per opening |
| `openingTrainer.settings.v1` | sound, deviation chance, Lichess token, Chess.com username |
| `openingTrainer.gaps.v1` | last Chess.com scan report |

Progress can be exported/imported as JSON from the Settings panel. That is
the backup. Everything else is regenerable.

## Run locally

```bash
npm run serve
```

then open http://127.0.0.1:8765/ . (Or use the Claude Code preview named
`static` in `.claude/launch.json`.) The app must be served over HTTP —
opening `index.html` directly from disk does not work because ES modules
are blocked on `file://`.

## Test

```bash
npm test
```

## Put it on the phone

The phone needs to load the folder over HTTP once, then "Add to Home Screen"
in Chrome. Options, in order of least effort:

1. **Same Wi-Fi:** run `python -m http.server 8765` (without `--bind`) on the
   PC and open `http://<pc-ip>:8765/` on the phone. Exposes the folder on
   the LAN while running — fine for a static site with no personal data.
2. **Static host:** push the folder to any static host (GitHub Pages,
   Netlify, Cloudflare Pages). The repo contains no personal data; progress
   and tokens live only in the phone's localStorage.

Without a service worker the app still needs the network to load each
time; add one only if offline use becomes a real need (see PLAN.md).
The Stockfish engine (7 MB) downloads only when you first press
"Check with Stockfish", and the browser caches it afterwards.

### Same-Wi-Fi, step by step
1. On the PC, in the project folder, run `python -m http.server 8765`
   (no `--bind`, so the phone can reach it). Leave that window open.
2. Find the PC's address: `ipconfig` → "IPv4 Address", e.g. `192.168.1.23`.
3. On the phone (same Wi-Fi), open Chrome and go to
   `http://192.168.1.23:8765/` — your address instead of the example.
4. Chrome menu (⋮) → **Add to Home screen** → Add. The icon opens the app
   full-screen like a normal app.
5. Paste your Lichess token and Chess.com username into Settings on the
   phone — they are stored on the phone only.
6. Every time you want to use it, the PC server must be running. Stop it
   with Ctrl+C. If the PC's address changes, remove and re-add the icon.
Note: on a plain `http://` LAN address the Copy button in the engine
panel cannot use the clipboard; the JSON text is select-all on tap instead.

## Move to another machine

Copy the folder (keep `.git`, skip nothing else — there is no
`node_modules`). Run `npm test`. Export progress from the old device and
import on the new one if the phone changes.
