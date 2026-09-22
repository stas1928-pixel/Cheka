# Opening Trainer — PLAN.md

State file for this project. Read this first each session; update it at the
end of each job. The full product spec and *why* lives in `PROJECT_BRIEF.md`;
this file only records decisions, ownership, scope, and current job status.

Started: 2026-09-15. Local-only personal project. Repo is local, never pushed.

---

## Architecture decisions (locked)

### Delivery
- **Static PWA, no build step.** Plain HTML/CSS and ES modules under `js/`,
  served by any static HTTP server. "Add to Home Screen" on Android.
  No framework, no bundler, no npm dependencies. Node is used only for tests.
- **No backend, no accounts, no sync.** Single user, one device.
- **Dependencies are vendored, not CDN-loaded.** `vendor/chess.js` is
  chess.js 1.0.0 ESM (the prototype's cdnjs URL was a 404; 1.x ships no
  browser global). Pin by copying the file; note the version in
  `docs/sources.md`.
- **No service worker yet.** Add one only when offline use becomes a real
  need. Until then the app needs network to load.

### Data ownership (which system owns what)
| Data | Owner | Notes |
|---|---|---|
| Repertoire tree (2 openings, main lines, branches) | `js/repertoire.js`, hand-edited | Two openings only. No editor UI. Tests prove legality + canonical SAN. |
| Training progress (accuracy, streaks, weak spots) | `localStorage` via `js/progress.js` | Export/import JSON from Settings is the backup. |
| Move legality, board state, SAN, PGN parsing | **chess.js** | Never reimplement rules. |
| Master-game move stats | **Lichess Opening Explorer** (read-only, in review mode) | Needs a personal API token (see gotchas). In-memory cache per page load only. |
| Position evaluation | **Stockfish WASM** — job 7, not started | Only for building punishment branches, never during drills. |
| User's game history | **Chess.com Public API** (read-only, no auth) | Fetched on demand; only the derived gap report is stored. |
| Settings (sound, deviation chance, tokens, username) | `localStorage` via `js/settings.js` | Device-local. |

### What we will NOT build
- A general opening editor or import-any-PGN system.
- Multi-user, login, cloud storage, or server code of any kind.
- A native Android app or Play Store distribution.
- A board library or drag-and-drop engine — click-to-move on a CSS grid works.
- A spaced-repetition scheduler beyond weakest-first ordering, until real
  usage shows that isn't enough. (Not even weakest-first yet: lines are
  drilled in order, deviations are random.)
- Caching layers for Lichess or Chess.com data beyond one page load.

### Vendor gotchas (verified, see docs/sources.md for dates)
- **chess.js 1.0.0** — `import { Chess } from '../vendor/chess.js'`.
  `move()` **throws** on an illegal move (does not return null). Verbose
  moves carry `san/from/to/captured/promotion`. `loadPgn()` wants headers on
  their own lines; we strip headers and comments and feed movetext only.
- **Lichess Explorer** — both `explorer.lichess.ovh` and
  `explorer.lichess.org` answer **401** without a token (confirmed from two
  networks and from a browser with a dummy token). Token: create at
  https://lichess.org/account/oauth/token/create?description=Opening%20Trainer
  with no scopes; paste into Settings. `play=` wants **UCI**, not SAN.
- **Chess.com Public API** — no auth, `Access-Control-Allow-Origin: *`.
  Serial requests unlimited, parallel may 429 → we fetch months one at a
  time. PGNs contain `{[%clk …]}` comments and `1...` numbering; parser
  handles both (checked against a live game).
- **Stockfish 18 lite single-threaded (verified)** — `vendor/stockfish/`,
  7 MB, GPL-3, no special headers. Built files are GitHub *release assets*
  (jsDelivr refuses the 250 MB npm package). Loaded lazily on first "Check
  with Stockfish", so the 7 MB is not paid on every page open. UCI handshake
  ≈0.9 s, depth 14 per position well under a second on a laptop; expect a
  few seconds per position on a phone. `parseInfo` ignores `multipv > 1`.
  Clipboard API needs HTTPS or localhost, so on a LAN `http://` address the
  Copy button falls back to select-all text.

---

## Jobs

Order follows "Suggested next steps" in the brief. Jobs 1–6 and 8 were done
in one session on 2026-09-15 at the owner's explicit request (normally one
job per session); each still got its own commit.

| # | Job | Status |
|---|---|---|
| 0 | Unzip, `git init`, write PLAN.md, first commit | done 2026-09-15 |
| 1 | Elephant Gambit as second selectable line (Black); home screen picker; board flips for Black | done 2026-09-15 |
| 2 | Repertoire as `mainLine` + `branches`; opponent deviates into a branch (chance in Settings) | done 2026-09-15 |
| 3 | Review mode: line picker (main + branches), stepping, tap-to-jump | done 2026-09-15 |
| 4 | Feedback: square flash + Web Audio sounds, mute toggle | done 2026-09-15 |
| 5 | Progress in localStorage: accuracy, streaks, weak spots, export/import/reset | done 2026-09-15 |
| 6 | Lichess Explorer panel in review mode (token in Settings) | done 2026-09-15 — needs the owner's token to see data |
| 7 | Stockfish WASM + punishment-branch eval-cutoff builder | done 2026-09-15 — Engine check panel in review mode, Build button on each gap |
| 8 | Chess.com import + gap report | done 2026-09-15 — needs the owner's username for a real scan |

Rules for every job:
- Small enough to build, test, and understand in one session.
- Explain reasoning in code comments (the owner is learning to code).
- `npm test` green and a browser check before commit.
- Update this table, commit, stop.

### How the engine is used (job 7, done)
- Review mode → **Check with Stockfish** evaluates the position after each
  of YOUR moves in the selected line. For a branch it builds the line to the
  10-move horizon with engine best moves for both sides, then `decideCut`
  picks the stop with the whole line in view: forced mate → tactical;
  ≥ +1.5 within 6 moves → punishment, run to that point; otherwise the
  first ≥ +0.5 → punishment, stop there; nothing → discard (the opponent's
  move was sound, keep only a one-move "know the reply" branch).
  **Changed 2026-09-16** from the brief's literal reading (small edge only
  after move 6), which produced 13-move engine-vs-engine lines nobody plays.
  The owner's words: "not all the way, just so I get an advantage, deeper if
  there is a clear punishment."
- **All 19 branches are engine-checked (2026-09-16).** Real punishments:
  Scotch 3...f5 (+2.0), 3...Bb4+ (+1.6), 4...Qf6 (+1.0); Elephant 3.Bd3
  (+1.7), 4.Bb5+ (+1.8). Sound opponent moves kept as one-move replies:
  Scotch 4...Bc5, 5...Ne4; Elephant 3.Nxe5, 3.d3, 4.Ng1, 4.Nd4, 4.Ne5,
  5.Ng5, 6.dxe4. The Elephant main line's 6...Bf5 was a −2 blunder and is
  now 6...Nc6 (engine both sides from there).
- **Build** on a gap in the Chess.com report opens a draft branch and runs
  the same builder; the result is paste-ready JSON for `repertoire.js`.
  The repertoire stays a hand-edited file on purpose.
- Known verdicts so far: 3.Nxe5 Bd6 in the Elephant is "discard" (−0.5 for
  Black, White's move is sound). The gambit is objectively dubious; the app
  reports that honestly instead of pretending every deviation is punishable.

### Refinement round, 2026-09-16 (owner feedback after first use on the phone)
- **Branches were one move deep — "what have you achieved?"** Fixed:
  `THRESHOLDS.minMoves = 4` — every branch shows at least four of our moves
  (engine best play both sides, depth 16), longer only when a clear edge
  comes later. All 19 rebuilt with `tools/build-branches.mjs`.
- **Three training modes** (trainer screen, persisted in settings.lineMode):
  Main line · Side lines (a random branch, chosen at line start so the
  deviation can come anywhere) · My games (branches weighted by how often
  real opponents played them, from the Chess.com scan). Lines you keep
  getting wrong are picked more often in both random modes. The old
  deviation-chance slider is gone.
- **Board redesign**: cburnett SVG pieces (GPLv2+, `vendor/pieces/`),
  coordinates, check highlight, sliding animation, hint arrow after two
  misses (instead of telling the answer at once), streak chip.
- **Work on weaknesses**: `js/weakness.js` replays your games with the
  engine, flags your moves that cost ≥ 1 pawn, merges by position; home
  panel "Analyse my games" (newest 60, depth 12, stoppable) + "Train weak
  spots" puzzle drill. First study of stas1928 (101 games, depth 12):
  118 positions, almost all one-offs — scattered tactical misses rather
  than a repeated positional error. The repeated ones (4.Bb5+ → c6 not Bd7;
  5...exd3 vs 5.Nxe5) are already branches.
- **Service worker** (`sw.js`): vendor/ cache-first, app files network-first
  with offline fallback. Bump `VERSION` in sw.js whenever vendor/ changes.
  PNG icons (192/512) added for the Android install prompt.
- **Bug found by playing all 21 lines through the UI**: for White openings
  a stale "opponent" timer overwrote "Correct ✓" after a quick first move.
  Fixed in resetLine.
- **Node tooling** (`tools/`): the vendored Stockfish also runs under Node,
  so batch jobs (rebuild branches, analyse games) run on the PC with the
  same modules the app uses.

### Second refinement round, 2026-09-16 ("Scotch has only one line? WTH")
- **Data model is now LINES, not main line + branches.** An opening is a
  bundle of named lines sharing a root; lines[0] is the trunk (hand-approved
  master theory); every other line leaves the trunk at an opponent ply.
  `kind: 'main'` = a sound variation to know, `kind: 'side'` = an opponent
  mistake with the punishment. Rule enforced by test: our side plays one
  move per position across all lines.
- **Generated from real data.** `tools/build-repertoire.mjs` grows the
  variations from stas1928's games: every opponent reply seen ≥ 2× becomes a
  line; the engine (depth 14) classifies it (swing ≥ 0.6 in our favour →
  side) and plays our moves; opponent moves inside lines are what YOUR
  opponents most often play, else engine. Trunk is never changed by data.
  Output → `js/repertoire.data.js` (generated, never hand-edited);
  explanations live in `js/notes.js` keyed by line id.
  Result: Scotch 5 main + 3 side lines, Elephant 7 main + 6 side lines.
- **Tabs open into a tickable line list** (Chess Reps-style): under
  Main lines / Side lines / My games, a list shows every line with its
  name, the moves after the deviation, badges (punish, ×games, new / due /
  days-until-due) and a ▶ to drill it now. Unticked lines leave the
  rotation (settings.hiddenLines). Tab labels carry counts.
- **Spaced repetition** (`progress.js`): a clean run multiplies a line's
  interval (1 → 2.3 → 5.3 → 12 days …), any mistake resets it to 1 day.
  The picker weights new (3) and due (2 + overdue days) lines far above
  not-yet-due ones (0.2); My games multiplies by log2 of opponent frequency.
  Home cards show "N due".
- Gap report now counts `lineHits` per line id (was branchHits per move).
- **Gotcha found while testing:** after a deploy the browser's HTTP cache
  can serve a mix of old and new ES modules (one file imports a symbol the
  other no longer exports → blank page). The service worker now fetches app
  files with `cache: 'no-cache'` so every module is revalidated together.
  When editing locally, hard-reload if the console shows "does not provide
  an export named".

### Third round, 2026-09-17 ("lines look odd / AI-like — do deep research")
- **Owner rejected the game-grown repertoire**: variations that were just
  what his opponents happened to play, continued by an engine, most of them
  unnamed. Correct call. That generator (`tools/build-repertoire.mjs`) is
  kept only as a research tool; it no longer produces the shipped data.
- **New pipeline: curated seed → engine verification.**
  `tools/repertoire.seed.mjs` is hand-written from theory (Wikipedia
  Scotch/Max Lange/Elephant articles citing Wells, Lane, Dembo & Palliser,
  de Firmian; chessdoctrine.com; chessmood.com's "refutation" article for
  what strong opponents play vs the Elephant; chessable.com guide; the
  masters figures from 2026-09-15). Each line is named, sourced, and ends
  where the theory ends; `extendTo` lets the engine finish a rare
  sub-variation. `tools/verify-repertoire.mjs` (Stockfish 18, depth 18)
  then checks every one of OUR moves against the engine's best, flags any
  ≥ 0.5 drop, flags a side line that ends below +0.5 (or its `minCp`), and
  flags two lines playing different moves in the same position. Output →
  `js/repertoire.data.js`. Notes in `js/notes.js` by explicit line id.
- **What the verifier rejected on the first pass** (all replaced): 5...Ng4
  6.Qe2 (−0.7 → 6.O-O); the old Møller 7.Nc3 (−0.5 → classical 7.Bd2);
  Haxo 6...Bb6 7.e5 Ng4 8.O-O (−0.6); London 9.Ng5/10.Ba3 (−1.5, a web
  source's suggestion); Bxf7+ trap 10.O-O; 3...f5 6.Qh5+ (−0.7); 3...Qf6
  4.Bg5 (−0.8 → 4.d5); Elephant trunk 9...Rd8 (−1.1); 5.Nc3 line 9...Nd7.
  4...h6 turned out only +0.3 → reclassified as a main variation.
- **No public frequency database was reachable** (365chess 403, Lichess
  needs login, chess.com pages carry no numbers). Which variations to
  include therefore came from theory + the owner's 427 games; the
  `[Games]` tag in the seed marks lines chosen because his opponents play
  them. With a `LICHESS_TOKEN` in `.env` the seed could be cross-checked
  against masters/amateur frequencies — recommended next step.
- **Mastery tiers**: clean runs per line (Bronze 3, Silver 6, Gold 10,
  Master 15) with a progress bar in the line list and a tier summary on
  the home card. Tapping a row starts that line; the checkbox on the right
  keeps it in / drops it from the rotation; the list is open by default.

### Fourth round, 2026-09-17 — Lichess databases via the owner's token
- Owner created a token and put it in `.env` (git-ignored; `.gitignore`
  now also ignores `*.env`, `*.env.*`, `secret*` because the file first
  arrived as `secret.env.txt`, which would have been committed).
  **Never print `.env`; never commit it.** A diagnostic echoed part of the
  token into chat once — owner asked to rotate it.
- `tools/explorer-check.mjs` queries masters + amateur (1400-1800
  blitz/rapid) at every opponent node of the seed and reports MISSING
  popular replies, RARE lines, and PREFER (amateur top move differs from
  the seed inside a line). Run it after any seed change; ~3 min.
- Applied to the seed: +23 lines (59 total: Scotch 39, Elephant 20).
  Headline findings that changed the repertoire: after the Bxf7+ trap
  club players run to e8 78% (Kf8 was the only line); knights get traded
  on d4 in 32-52% of the quiet Scotch lines; London 7...Nge7 29%; Elephant
  4.Ng1 5.Nc3 70%, 4.Nd4 5.Nb3 (masters 100%), 4.Bb5+ … 6.Qe2 (masters
  100%), 3.Nxe5 Bd6 4.d4 dxe4 has three common 5th moves. Inside lines
  the opponent now plays the amateur top move wherever the database is
  thick. Rare lines (<2%: 3...Nxd4, f5, Bd6, Qf6, Bb4+, 3.Bd3) kept only
  because the owner's opponents played them.
- Engine re-verification found and fixed: Giuoco 9.O-O (−0.5 → 9.d5),
  3...Bb4+ 5.d5 (−0.6 → 5.Bd3).

### Fifth round, 2026-09-22 — audit + line library (research only, app untouched)
- Owner: lines still "strange, bot-like"; map exactly which moves are
  engine vs theory and from which source; research masters, books,
  platforms, videos; build a library file sorted with names, sources and
  weight tags. Nothing in the app was changed this round.
- **`docs/AUDIT.md`** (from `tools/audit-repertoire.mjs`): per shipped line,
  how many moves came from the hand seed and how many Stockfish appended.
  Totals: 59 lines, 767 seed plies vs 210 engine plies (21%); but in the
  Elephant most lines are 7-9 seed plies + 7 engine plies, i.e. **half
  engine**, and 6 lines have ≤ 1 human reply after the deviation. That is
  the "bot-like" feel, confirmed.
- **`library/lines.mjs` → `docs/LIBRARY.md`** (via `tools/build-library.mjs`):
  ~50 lines across both openings, each with name, kind (main / alt / side /
  trap), weight (A theory · B known · C community · E engine), sources,
  a note quoting the source, the number of MASTER games reaching the end
  of the line, masters' top reply and two example games. Plus the masters'
  own tree (`tools/masters-tree.mjs`): every branch with ≥ 30 (Scotch) /
  ≥ 12 (Elephant) master games.
- Sources actually read: Fishbein "The Scotch Gambit" 2017 (sample: intro,
  contents, ch.1 main line to 9...Bc5); Bezgodov & Barsky "The Scotch Game"
  2023 (contents + ch.2); Wikipedia Scotch / Two Knights / Giuoco / Max
  Lange / Elephant (raw wikitext); Chess Doctrine; ChessMood article +
  GM Grigoryan video; Chessable IronStone course chapter list; Chessfactor
  videos (IM Astaneh ×4, IM Ostrovskiy); Hanging Pawns; seven public
  Lichess studies exported as PGN; Kenilworthian Elephant bibliography;
  Quality Chess book description (Aabling-Thomsen & Jensen 2020).
  Not readable: TheChessWorld (403), YouTube pages (JS), Chessable course
  bodies (login), the Elephant books' text.
- **Key findings for the next rebuild:**
  1. Masters meet 4...Bc5 5.c3 Nf6 with **6.e5! d5 7.Bb5 Ne4 8.cxd4 Bb6
     9.Nc3 O-O 10.Be3** (Greco Gambit Modern Line, 1,138 master games,
     Nepomniachtchi–Carlsen 2021), not our 6.cxd4 (272). Both are theory.
  2. 5...Ng4 masters' line is **6.O-O d6 7.exd6 Bxd6 8.Re1+ Kf8**
     ("Kingside Variation", 42 games) — my first draft had this and I
     replaced it wrongly; the check that failed was on 6.Qe2, not 6.O-O.
  3. The Elephant barely exists at master level (≤ 19 games per branch).
     The 2020 book builds Black's repertoire on **3.exd5 Bd6** (Maróczy /
     Rogers line), not our 3...e4. Deciding between them is the owner's
     call and the biggest open question.
  4. Community studies (SoNy, EXOprimal, BunnyMommy) are rich in traps and
     club-level replies but carry weight C until a book or the masters DB
     agrees.

### Next candidates (owner picks, one per session)
- **Decide the Elephant system**: keep 3...e4 (Paulsen, our trunk, MCO
  line) or switch to the book's 3...Bd6 (Maróczy). See LIBRARY.md.
- **Rebuild the seed from the library**: only weight A/B lines as main,
  masters' moves for the opponent where ≥ 30 games exist, engine only to
  verify and to finish rare sidelines — and say so per line in the note.
- Rotate the Lichess token (owner); re-run `explorer-check` monthly.
- Analyse more than 60 games on the phone in the background, or run
  `tools/analyse-games.mjs` on the PC and import the JSON.
- A "Lines" screen on the home page (all openings at once) once there are
  more than two openings.

---

## Testing
- `npm test` runs `node --test` over `tests/*.test.mjs`: 41 tests covering
  repertoire legality/canonical SAN, tree helpers, settings, progress,
  explorer client, Chess.com parsing/walk/aggregation. DOM code (`app.js`,
  `feedback.js`) is checked by hand in the browser preview.
- Coverage target ≥ 90 % on the pure modules; not measured yet (node's
  `--experimental-test-coverage` can report it when wanted).

## Docs
- `docs/sources.md` — every external URL consulted, with date.
- `docs/LAYOUT.md` — file map, run/test, how to get it on the phone, moving.
- `docs/UNINSTALL.md` — removal order.

## Decided 2026-09-15 (after the first real data scan)
- **Scotch = Scotch Gambit (4.Bc4), not the Four Knights.** 421 games scanned;
  4.Nxd4 appeared zero times, 4.Bc4 twenty-four times. Main line is now the
  Max Lange Attack, top master move at every ply.
- **Branches cover what real opponents play, not what theory prefers.** Every
  uncovered move from the scan with 2+ occurrences now has a reply, chosen by
  best score in the Lichess 1400–1800 database. Branches are 1–3 moves, "far
  enough to be clearly better", per the owner's instruction. They are NOT
  engine-verified — that is job 7.
- **Re-scanning is the regression test for repertoire changes.** Complete
  lines went 0→14 (Scotch) and 0→18 (Elephant) on the same 421 games.

## Open questions (owner's call)
- **Hosting for the phone — decided 2026-09-16: GitHub Pages.** Public repo
  https://github.com/stas1928-pixel/Cheka, site
  https://stas1928-pixel.github.io/Cheka/ . Owner chose this over a
  same-Wi-Fi PC server. Nothing personal is in the repo. This overrides the
  "local-only repo" default for this project; `.env`, data and backups stay
  git-ignored regardless.
- **Chess.com username** — `stas1928`, confirmed 2026-09-15.
- **Lichess token** — the first token was shared in a chat transcript and
  should be revoked and replaced. The replacement must be pasted into the
  Settings field on the device itself; it is never stored in this repo.
- **Elephant Gambit main line** — checked against masters and kept
  (4.Qe2 is 75% there). The 3.Nxe5 reply was corrected to 3...Bd6.
- **A few of your own habits differ from the tree**: you play 4.d5 against
  3...d6 (tree says 4.dxe5, better score) and 4...Bd7 against 4.Bb5+ (tree
  says 4...c6, 63% vs 48%). The tree teaches the better move on purpose;
  say the word if you would rather it match your habit.
- **Sound design** — WebAudio oscillator tones chosen (no asset files). Tune
  or replace if they get annoying.
