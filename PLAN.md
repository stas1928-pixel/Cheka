# Opening Trainer — PLAN.md

State file for this project. Read this first each session; update it at the
end of each job. The full product spec and *why* lives in `PROJECT_BRIEF.md`;
this file only records decisions, ownership, scope, and current job status.

Started: 2026-09-15. Local-only personal project. Repo is local, never pushed.

---

## Architecture decisions (locked)

### Delivery
- **PWA, single-page, no build step.** Plain HTML/CSS/JS in `index.html`
  (split into a few files only when it exceeds ~800 lines). Served via
  "Add to Home Screen" on Android. No framework, no bundler, no npm until a
  dependency genuinely requires it.
- **No backend, no accounts, no sync.** Single user, one device.
- Runtime dependencies load from CDN with pinned versions (chess.js 1.0.0
  already). If offline use becomes a need, vendor them into `vendor/` and
  add a service worker — not before.

### Data ownership (which system owns what)
| Data | Owner | Notes |
|---|---|---|
| Repertoire tree (2 openings, main lines, branches) | `localStorage`, seeded from hardcoded JS constants | Two openings only. No "add any opening" editor. |
| Training progress (accuracy, streaks, weak spots) | `localStorage` | Plain JSON. Export/import as a file for backup. |
| Move legality, board state, SAN | **chess.js** | Never reimplement rules. |
| Master-game move stats | **Lichess Opening Explorer API** (read-only lookup) | Not cached beyond session; not required for training. |
| Position evaluation | **Stockfish WASM** in a Web Worker | Only for building punishment branches, never during drills. |
| User's game history | **Chess.com Public API** (read-only, no auth) | Fetched on demand; only derived gap list is stored. |
| Settings | `localStorage` | |

### What we will NOT build
- A general opening editor or import-any-PGN system.
- Multi-user, login, cloud storage, or server code of any kind.
- A native Android app or Play Store distribution.
- A board library or drag-and-drop engine — click-to-move on a CSS grid is
  sufficient and already works.
- A spaced-repetition scheduler beyond a simple weakest-first ordering,
  until real usage shows that isn't enough.
- Caching layers for Lichess or Chess.com data.

### Vendor gotchas (fill in from docs before integrating each)
- **chess.js 1.0.0** — `new Chess()` global from the cdnjs build; `moves({verbose:true})`
  returns objects with `san/from/to`. Promotion must be given explicitly.
- **Lichess Explorer** — `https://explorer.lichess.ovh/masters?play=<uci,uci>`;
  rate-limited, expects UCI not SAN. Verify on first use; record in `docs/sources.md`.
- **Stockfish WASM** — needs a Worker and, for the multi-threaded build,
  COOP/COEP headers, which a static PWA host may not send. Plan on the
  single-threaded build. Verify before job 7.
- **Chess.com Public API** — `https://api.chess.com/pub/player/<user>/games/<yyyy>/<mm>`;
  games come as PGN strings; needs a User-Agent header per their docs. Verify before job 8.

---

## Jobs (one per session, commit after each)

Order follows "Suggested next steps" in the brief.

| # | Job | Status |
|---|---|---|
| 0 | Unzip, `git init`, write PLAN.md, first commit | done 2026-09-15 |
| 1 | Add Elephant Gambit as second selectable line (Black side); opening picker on home screen | todo |
| 2 | Convert flat `moves` array to branching tree shape (`mainLine` + `branches`), with a couple of hand-written branches | todo |
| 3 | Review/browse mode as a toggle separate from Training mode | todo |
| 4 | Feedback: square flash animation + short sound on correct/incorrect | todo |
| 5 | `localStorage` persistence for progress (accuracy, streaks) + JSON export/import | todo |
| 6 | Lichess Explorer lookup when reviewing a line | todo |
| 7 | Stockfish WASM + punishment-branch eval-cutoff logic | todo |
| 8 | Chess.com import + gap diff against repertoire tree | todo |

Rules for every job:
- Small enough to build, test on the phone, and understand in one session.
- Explain reasoning in code comments (the owner is learning to code).
- Test in the browser before commit; take one screenshot per visual check.
- Don't start the next job in the same session. Update this table, commit, stop.

---

## Testing
- No test runner yet. Add a tiny in-page test harness (or a `tests.html`)
  once job 2 introduces non-trivial logic (tree traversal, branch matching).
  Core logic target ≥ 90 % coverage once a runner exists.

## Docs to create as they become relevant
- `docs/sources.md` — every external URL consulted, with date.
- `docs/LAYOUT.md` — file layout, once there is more than one code file.
- Backup: progress is exported as JSON from within the app; nothing else to back up beyond `.git`.

## Open questions
- Chess.com username (needed for job 8; ask, do not guess).
- Sound assets: generate with WebAudio oscillator vs. ship tiny `.mp3` files. Decide in job 4.
