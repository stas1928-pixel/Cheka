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
  explanations lived in `js/notes.js` keyed by line id (removed in round 6).
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
  (Superseded in round 6: the seed is now a selection over the library,
  `extendTo` and `js/notes.js` are gone, the verifier fails closed.)
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

### Round 5b — owner's videos folded into the library (2026-09-22)
- 20 new library lines (`v-*`), weight B for the titled coaches (Smirnov,
  Chess Vibes), C for streamers (Akeem, Tushi). Library then held 67
  curated lines (Scotch 42, Elephant 25); the "88" quoted at the time
  wrongly added the 21 masters'-tree rows, which are a database dump.
- Smirnov's Scotch video agrees with the masters on the big fork: vs
  4...Bc5 5.c3 Nf6 play **6.e5** (not 6.cxd4). His end-of-line PLAN text
  for the Modern Attack (kingside pawn majority f5/f6, Re1; Nb3+Qc3
  blockade vs ...c5/...d4) is the first sourced "what now" message.
- Smirnov's Elephant "68% queen trap" (3.exd5 e4 4.Qe2 Be7?!) is **unsound**
  by engine (+1.4 to +2.0 for White). Kept as a trap to recognise only.
- Confirmed by two videos and the amateur DB: Paulsen 4.Qe2 Nf6 5.d3 Qxd5
  6.Nc3 Bb4 7.Bd2 Bxc3 8.Bxc3 O-O and the 9.Bxf6? exf3! punishment
  (amateurs play 9.Bxf6 about half the time).
- Not done, awaiting owner: seed rebuild from the library, `plan` field
  per line, prefix-duplicate test, Elephant system decision.

### Round 6 — repertoire rebuilt from the library (2026-09-22)
- **Ownership fixed.** `library/lines.mjs` is the single source of truth
  for SAN, sources, notes and end-of-line plans. `tools/repertoire.seed.mjs`
  no longer holds moves: it SELECTS library lines by id and gives them
  stable app ids. `js/notes.js` is gone (notes and plans ride inside the
  generated data). `extendTo` is gone: **0 engine plies ship**.
- **Verifier fails closed** (`tools/verify-lib.mjs` + CLI): structural
  rules (legal/canonical SAN, weight A/B, kind main/side/trap, plan with
  sources, deviation at an opponent ply, line ends after our move with
  ≥ 4 of our moves after the deviation, no exact/prefix duplicates, one
  move per position) plus Stockfish DROP ≥ 0.5 and SIDE?/trap < +0.5.
  Any flag → exit 1 and the data file is not written. Tested with a fake
  engine (`tests/verify.test.mjs`).
- **Locked choices (owner):** Scotch 4...Nf6 5.e5; 4...Bc5 5.c3 and after
  5...Nf6 **6.e5** (masters, Smirnov) not 6.cxd4; 5...Ng4 6.O-O; Møller,
  Nakhmanson/5.O-O, Perreux, Max Lange library-only. Elephant 3.exd5 e4
  (Paulsen); 3.Nxe5 Bd6; Smirnov's 4...Be7 queen trap excluded (unsound);
  Maróczy 3...Bd6 library-only.
- **Shipped: Scotch 18 lines (10 main, 2 side, 6 trap), Elephant 4 lines
  (3 main, 1 trap)** — 22 in all, down from 59; 9 weight A, 13 weight B;
  418 sourced plies, **0 engine plies** (docs/AUDIT.md). Stockfish depth 18
  passed all 22 with no DROP after the signature and every side/trap line
  ending ≥ +0.5. Rejected by the engine on the way: Smirnov's London
  8...Qd7 9.Rd1 (−1.66 vs Re1 — transcript reconstruction doubtful), the
  ECO Lolli line 6.Bc4 (−0.53), Chess Vibes' final 14.f4 (−0.58, line cut
  at 13.Nxe6), Ostrovskiy's 9...Bf5 (−0.50, trunk cut at 8...Nc6). The
  verifier ignores the cost of the signature itself (2...d5 is −0.54 by
  engine; it is the chosen opening). Removed: everything that was engine
  after the deviation (all 4...h6, 4...Qf6, 3rd-move oddities, Elephant
  4.Nd4/4.Ng1/4.Ne5/4.Bb5+/6.dxe4/5.Ng5/3.d3/3.Nc3/3.Bd3 lines, 4...Be7
  Hungarian and 4...d6 Paris whose 20-ply "theory" had no source beyond
  the first two moves), the 6.cxd4 Giuoco family (replaced by the Greco
  Gambit 6.e5 family), duplicates/prefixes (Ke8 trap with and without
  10...cxb2, 6.Bxf7+ Kf8 short form).
- **Master practice as a source.** Where a book stops short, the Lichess
  masters tree (already dumped in round 5) supplies the exact moves, with
  the game count quoted in the note (e.g. 7...Bc5 8.Be3 O-O 9.Nxc6 … 116
  games; 6...Nd7 line 41; Greco Gambit 11.h3 813; Elephant 3.d4 line 13).
  Smirnov's 11.Bxc6 in the Greco Gambit lost to the masters' 11.h3 and is
  kept as an alternative. Master-tree data ends at 22 plies / < 30 games,
  which is exactly why several common replies could not be drilled yet.
- **Plans**: every drilled line has a `plan` in the words of its sources
  (Smirnov's f5/f6 majority plan, Ostrovskiy's set-up, Wikipedia's
  assessments, masters' next moves). Line completion opens a focused plan
  dialog with **Review board** and **Next line**; the same plan remains in
  the note area after closing the dialog and clears on the next line.
- **Honest gaps — common replies with no drillable A/B line yet** (each
  needs one or two more sourced moves, not an engine): Scotch 5...Ne4
  (masters 6.Qe2 Nc5 7.O-O Be7 8.Rd1 — 3 of our moves), 5...Ng4 sound
  6...d6 line (8.Re1+ Kf8 — 3 moves), 9...Be7 (masters 10.f3 Nc5 11.f4 —
  2 moves), 4...h6 (18% of club games), 4...Be7, 4...d6, 3...d6 4.d5 (book
  move, kept library-only; Smirnov's 4.dxe5 is drilled instead). Elephant
  6.Nbd2 (MCO main, 3 moves), 6.dxe4 (49% of club games, no source),
  3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 (ChessMood line ends on White's move) and
  5.Nc4 (masters' top, 3 moves), 4.Nd4 / 4.Ng1 (29% / 19% of club games).
  Fix path: re-run `tools/masters-tree.mjs` deeper (maxPlies 26, min 15)
  or read the ChessMood/Fishbein pages for those exact moves, add them to
  the library with the count, then select.

### Round 7 — traps, surprises, and the gaps filled from human practice (2026-09-23)
- **Owner's rules for "crazier" lines** (agreed 2026-09-23): our moves must
  be engine-sound (no drop ≥ 0.5); the opponent's mistake must be COMMON
  (≥ 10% of Lichess 1400-1800 players at that node, ≥ 200 games) and REAL
  (engine swing ≥ +1.0 for a trap, ≥ +0.5 for a side line); the line ends
  with the gain locked in (trap ≥ +1.5, side ≥ +0.75); no stupid blunders.
  Trap/side/surprise lines may come from any source (YouTube, studies —
  weight C allowed); main lines stay A/B. Our own offbeat choices live in
  a separate **surprise** set (Surprises tab), never mixed with the main
  repertoire. Depth rule: main lines stop where theory stops and the plan
  popup carries the middlegame; side/trap lines run until the tactic is
  finished; stop once material is won.
- **Verifier** (`tools/verify-lib.mjs`): side/trap lines carry `mistakeAt`;
  checks RARE (club share from `library/explorer-cache.json`, offline),
  NOT-A-MISTAKE (swing), SIDE? (end eval), plus the existing DROP /
  structure rules; surprise lines are checked as their own consistent set.
  Labels are defined by severity, not by where the mistake sits.
- **Three databases** via `tools/explorer-cache.mjs` (token read from
  `.env`, never printed): masters; club 1400-1800; strong 2200-2500.
  `tools/human-tree.mjs` walks a tree of HUMAN moves (masters/strong at our
  nodes, club replies ≥ 15% at theirs) — this filled the gaps books left:
  Elephant 6.dxe4 Qxe4 7.Qxe4+ Nxe4 8.Bd3 Nc5 (strong 729/795), 6.Nc3 Bb4
  … 9.dxe4 Nxe4 10.Rd1/Qd3 Nxc3, 4.Nd4 Qxd5 5.Nb3 Nf6 6.Nc3 Qe5 7.Be2
  Nc6, 5.Bc4 Bxe5 6.dxe5 Qxd1+ (67% of club players), 5.Nc4 Nf6; Scotch
  4...h6 5.Nxd4, London 7...Nge7 8.Ng5 and 8.Qb3 Qf6 9.Bg5, 9...Be7 10.f3
  (masters to 13.Nc3), 5...Ng4 6.O-O Bc5 7.Bf4 and 8...Kf8 9.h3, the
  Hungarian 4...Be7 5.Nxd4 family.
- **Web research (subagent)** added annotated master games
  (ianchessgambits: 5...Ne4 6.Qe2 lines, 4...d6 5.Nxd4 Nf6 6.Nc3), the
  Quality Chess excerpt (3.Nxe5 Bd6 4.d4 dxe4 5.Nc3 Bxe5 … Swan–Greet;
  4.Nxf7 Kxf7 5.Qh5+ g6 6.Qxd5+ Kg7!), Harding/Karker and ChessMood for
  5.Bc4 Bxe5 6.Qh5 Qe7, Kenilworthian for 5...Ng4.
- **Engine rejections this round** (all replaced or dropped, see library
  notes): 9.Na3 vs 5...Ng4 (−0.60 → strong players' 9.h3); 7...Bd6 in the
  4.Nd4 line (−0.55 → 7...Nc6); 8...Bg4+ after 7.Kxd1 (−0.50 → 8...Bf5);
  Smirnov's 10.Qxc3 in the Haxo Ke8 line (−0.51 → line stops at 9.Qxc5);
  10.Nbd2 in London 8...Qf6 (−0.87 → stops at 9.Bg5); 8.O-O in the 4...h6
  line (−0.81 → stops at 8.Bf4); the 4...h6 Bxf7+ "trap" (swing 0.00 —
  not a trap, dropped); strong players' 8...Ne5 9.Nxf7 sacrifice in the
  London (swing −0.05 — fun, not a punishment, dropped).
- **Labels corrected by severity**: Haxo accepted 5...dxc3 (swing +0.8)
  and 5...Qe7 (the deviation itself costs ~2) are SIDE lines; 3...d6 and
  3...Nf6 lines are TRAPS (the big gain comes from a later mistake: 6...Bd7
  and 6...Nf6); 6.Nc3 Bb4 … 9.Bxf6? exf3 is a TRAP with the sound 9.dxe4
  as separate main lines; 4.Nxf7 is SIDE (+1.1 at the end).
- **Shipped (final verification 2026-09-23, Stockfish depth 18, 0 flags,
  86 tests green)**: **63 lines** — Scotch 39 (30 main, 9 side/trap) + 3
  surprises, Elephant 19 (17 main, 2 side/trap) + 2 surprises; weight
  A 16, B 47, C 0; 1,260 sourced plies, **0 engine plies**. Every drilled
  line has a plan popup with a `planBasis` (quoted / interpreted) and a
  credit line ("Source: …" or "Based on: …"). Library: 119 curated lines.
  Three engine passes were needed; each borderline drop (0.50-0.59) was
  replaced by the strong players' or the book's alternative, never by an
  engine move.
- **Remaining gaps** (no four sound sourced moves anywhere): Elephant
  4.Nd4 Qxd5 5.c3 (62% of club players at that node), 5.Bc4 Bxe5 6.Qh5
  Qe7 7.dxe5 (52%), 3.d3 / 3.Nc3 / 4.Ng1 / 4.Ne5 (each < 15% of club
  games); Scotch London 7...Bb6 (9%).

### Revisit list (owner, 2026-09-24: "keep flagging items worth revisiting")
Content
- Elephant, no drillable line yet: 4.Nd4 Qxd5 **5.c3** (62% of club players
  at that node; **met in the owner's own game 2026-09-24**, he played
  5...Bc5 — club 27%, strong 17%; strong players' top is 5...Nf6 39%, then
  5...c5 18%. Build this line first, choosing Black's 5th from the strong
  data + engine veto), 5.Bc4 Bxe5 6.Qh5 Qe7 **7.dxe5** (52%), and the rare 3.d3,
  3.Nc3, 4.Ng1, 4.Ne5. The app only says "opponent left the book" there.
- Scotch, thin spots: London 7...Bb6 (9%); 5...Ne4 6.Qe2 **d5** (33% of club
  players; strong 7.exd6 Bf5 8.Nbd2 is only three of our moves); 5...Ng4
  6.O-O Bc5 7.Bf4 **d6** (16%).
- The Elephant trunk ends about −1.0 by engine (the gambit's price). If
  that proves costly in practice, the book's 3...Bd6 system (now a
  surprise) is the alternative.
- 40 of 63 plans are `interpreted` (my reading of the sources' moves), not
  quoted. Owner to read them over time and flag any that sound made up.
- After a few weeks of play: re-run `tools/fetch-club.mjs` and
  `tools/explorer-check.mjs` and the Chess.com scan to see which drilled
  lines occur and which never do; prune or add from data, not research.
- `docs/LIBRARY.md` shows "?" in the masters column for the 2026-09-23
  lines (regenerated offline); run `build-library` online once to fill.
- Progress ids changed for several lines in the rebuild (e.g. `haxo`, `ng4`,
  `ne4`), so their mastery tiers restarted from zero.
UI (for the design phase)
- 30 main Scotch lines in one flat list: group by family (Modern Attack,
  Greco Gambit, London, Hungarian, Paris, 3rd-move sidelines).
- The plan shows twice on completion: inline green note AND the dialog.
- Main lines show no frequency badge; trap/side rows do. The data exists.
- Nothing shows WHY a line stops (theory ends / material won / mistake
  punished). A one-word end marker would make the depth rule visible.
- Surprise lines in Review mode: the note area logic assumes the
  deviation is the opponent's; check wording.
Process / hygiene
- Lichess token: owner still to rotate the partially exposed one.
- Test coverage ≥ 90 % on core logic is a stated target, not yet measured.
- Service-worker VERSION must be bumped whenever app-shell files change
  (done for v5; keep doing it).

### Design phase — decisions (owner, 2026-09-24; brief in `AGENTS.md`)
Owner's answers, locked unless changed:
- **References**: Chess Reps for repertoire structure, Duolingo for the
  feedback/addiction loop. Phone only (Android). Name/wordmark later.
- **Duolingo mechanics wanted, all four**: daily goal + streak (goal
  adjustable 3/5/10/20, default 5 clean lines; streak = days the goal was
  met); XP and levels tied to the Bronze 3 / Silver 6 / Gold 10 / Master 15
  tiers; big celebrations only for line completion and tier unlocks
  (routine moves quiet); the spaced-repetition due queue front and centre.
- **Mistakes**: no hearts or health. Red error, slight screen shake, short
  vibration, then play continues; the run just isn't clean. Keep it slight.
- **Haptics**: events only (correct, wrong, opponent deviation, line
  complete, tier unlock). **Sound: skipped for now.** Animations required.
- **Board**: owner likes the chess.com look. Use its green/cream board
  colours; the chess.com "Neo" pieces are proprietary, so the gallery shows
  the closest freely licensed set beside our current cburnett set.
- **Line browser**: group by named family (Modern Attack, Greco Gambit,
  London, Hungarian, Paris, 3rd-move sidelines; Paulsen 5.Nc3 / 5.d3, 4.Nd4,
  3.Nxe5 …), expandable, Chess Reps style; categories Main / Side+Trap /
  Surprises / My games stay.
- **Home**: the two opening cards first (mastery, due, streak state), scroll
  down for weaknesses/games, sideways where it helps; settings close at
  hand but quiet. Not a bottom tab bar.
- **Style**: "almost all of it" changes — style, feel, structure, colours,
  naming. Palette is the first checkpoint (three swatches on the same real
  trainer screenshot), then the golden screens.
Tools: Claude Code only. A `design.html` gallery renders every golden state
with the real components; tokens live in one CSS file; references arrive as
the owner's phone screenshots; optional screenshot script at the four
AGENTS.md viewports for golden comparison.

Checkpoint results (2026-09-24, `design.html`, commit 65bcc0e):
- Round 1: Graphite & Amber preferred; the chess.com green board rejected
  ("doesn't fit").
- Round 2: **layouts 1 (stack) and 3 (rail) both clean, "kinda the same",
  better than 2 (board-first + sheet)**; **Onyx palette preferred** — colder
  colour wanted, "not the best" yet → tune within the frozen layout (cooler
  teal/ice accent candidates, steel board kept, possibly less saturation).
- Owner: "don't be afraid to add things I didn't say or completely change
  the script if it fits better." Go-ahead for the implementation plan, but
  **wait for the explicit "start"**.

### Design implementation plan (agreed structure; start on owner's word)
Frozen: stack/rail hybrid — compact header (back, opening, Train/Review
segment, today ring or bar), board as hero, one status line, current-line
card with progress ring, family strip, icon actions + one primary button;
home = two opening cards; families grouped; completion dialog; Duolingo
loop (goal, streak, XP/levels, celebrations, due queue); haptics on events;
no sound; no hearts.
Jobs (one commit each, review after each):
1. **Tokens + palette tune**: `css/tokens.css` becomes the app's single
   palette (Onyx family, 2–3 cooler accent candidates shown in the gallery
   for a one-tap pick), remove dead directions.
2. **Trainer screen** rebuilt on the frozen layout (header, board, status,
   line card, family strip, actions); motion: square wash, shake on error,
   pulse, button press; haptics via `navigator.vibrate` on events.
3. **Line browser + search** (owner request 2026-09-24): a search box that
   matches line names, family names and move sequences ("Nd4 c3", "5.c3",
   "Bxf7"), plus "find my game": paste or play the moves and the app shows
   the deepest drilled line that matches and where your game left the
   book. Then families (Modern Attack, Greco Gambit, London,
   Hungarian, Paris, 3rd-move; Paulsen 5.Nc3/5.d3, 4.Nd4, 3.Nxe5, 3.d4)
   with tier dots, due badges, frequency tags; categories Main / Side+Trap /
   Surprises / My games; tap = drill; checkbox = rotation.
4. **Progress loop**: daily goal (3/5/10/20, default 5) + streak calendar,
   XP per clean line + levels tied to tiers, due queue on home and header;
   `progress.js` extended with tests; localStorage migration kept.
5. **Completion + celebrations**: dialog polish (plan, credit, Next line /
   Review), tier-unlock and goal-met moments with animation + haptic; remove
   the duplicate inline plan.
6. **Home**: two opening cards (due, tier summary, streak), weaknesses/
   games below, settings quiet; SW bump; phone QA at 360×800 and 390×844.
Each job ends with the AGENTS.md QA list for the screens it touched.

Design job 1 done (2026-09-24): `css/tokens.css` is now the app's single
palette (Onyx, cooled: bg #0a0e12, steel board #d6dde3/#56707f), loaded
before `css/style.css`, which no longer defines colours; key hard-coded
colours (primary button, last move, selection, legal dots) route through
tokens; SW v6. Three accent candidates: **ice** (default #7cc8ff),
**glacier** (#5ee0e6), **frost** (#a9b8ff) — pick in `design.html` with
the pills. The live app already runs in Onyx + ice. Graphite/Ember/layout 2
removed from the gallery.

Design job 2 (owner: "free rein", 2026-09-24): accent **ice** and layout 1
frozen. Shipped in one pass: new `css/app-v2.css` layer on the tokens;
trainer = header (back, name, streak chip, level chip) → today's goal bar
with shimmer → board → status → ↻ + NEXT LINE → Train/Review → categories
→ line browser (open by default) with **search** (names, families, moves)
and **family groups** (`tree.lineFamily`) showing due dots and tier bars.
**Daily loop** in `progress.js` (`recordDaily`, `streakDays`, `levelFor`;
XP 10 clean / 3 with mistakes / +25 goal; goal 3/5/10/20 in Settings,
default 5), shown on home and trainer. **Haptics** (`feedback.haptic`,
events only, toggle in Settings), **slight board shake** on a wrong move,
green/red square wash, pop-in completion dialog with a reward block (XP,
tier unlocked, goal met, level up) and shining medals; the duplicate inline
plan is gone. Sound removed from the UI. Home header "Cheka" with streak,
level and goal. SW v7. 91 tests.
Revisit (UI): home still shows the old "Progress" stat cards (replace with
per-opening tier summary); Review mode panels (masters/engine) not yet
restyled; the trainer's line note below the moves is long — shorten or
collapse; weakness drill and gap report untouched visually.

Design pass 3 (owner feedback 2026-09-24): home = header (streak, level,
gear) + goal bar + **swipeable opening cards** (due / new / lines, medal
counts, Review in violet + Train in ice) + **swipeable practice tiles**
(Due now, Traps & punishments, Surprise weapons, Your weak spots, Your
games — each its own colour with a red attention dot). Stats, weak spots,
Chess.com gaps, weakness analysis, tokens and backup moved to a separate
**"Your games & settings"** screen (gear). Weak spots show families, not
move strings. Trainer: board near edge-to-edge (--board-max 640px), move
list and notes only in Review, categories and **families as sideways chip
rows** (filter), line rows without move strings unless searching.
**Gloss at all times** on buttons, tiles, medals and bars; sheen sweeps
once every ~5.5 s, slower. `css/app-v3.css`, SW v8.
Revisit (UI): Review-mode panels and the tools screen are still prototype
styling; the tile targets (traps/surprises) always open the Scotch —
make them ask or remember the opening; Weak-spot drill screen unstyled.

### Owner review notes on 15c84c7 (2026-09-24) — collect first, build later
Owner rejected pass 3 (079b685): wrong reading of "left/right scroll"
(he means Instagram-style swiping between tabs/screens, not carousels
inside a screen), forced new colours, redesigned opening cards. Rule:
talk here before big changes. Baseline for the next pass is 15c84c7.
Notes, in the order he marks them:
1. **Home header** (Cheka title, streak + level chips, "Today" goal bar):
   "here I think you can do more." Keep the elements; the area needs more
   design craft (currently a plain title, two flat chips and a bare bar).
2. **Opening card**: replace the move text ("1. e4 e5 2. Nf3 Nc6 3. d4
   exd4 …") with a **small board showing the opening position** (pieces
   after the opening's signature moves, from the side you play). The
   header + the opening card(s) together **fill the whole first screen**
   (one viewport, no scrolling needed for the main part).
   Clarified: cards stay **stacked vertically**; scrolling down to see the
   second card fully is fine as long as proportions make sense (e.g. the
   first card fully visible, the second starting below it). **No sideways
   carousel for the cards** ("no awkward slides").
3. **Progress section** (per-opening stat cards: accuracy, streak, best,
   lines + "Not trained yet"): redesign. Currently four identical grey
   boxes with the same blue number per opening — flat and repetitive.
4. **Colour, global**: use **more colours, but ones that match** — expand
   the ice accent into a tasteful palette (a family of related cold hues
   plus complementary tones), not the unrelated role colours of pass 3.
   To be shown to the owner as a swatch before it is used everywhere.
5. **Off the home screen, into other tab(s)** (Instagram-style swipe
   between tabs): the Progress section AND everything marked below it —
   "Gaps from your Chess.com games" (username + Scan), "Work on
   weaknesses" (Analyse my games), and Settings (daily goal, vibration,
   Lichess token, export/import/reset). All of it also gets redesigned
   (item 7); long explanatory hint texts should be shortened.
6. **Wording**: drop the phrase **"clean line / clean run"** everywhere
   (goal text, settings "Daily goal (clean lines)", status, dialog, tier
   progress "N clean runs to Bronze"); replace with a better-fitting word,
   to be agreed.
8. **Trainer control bar** (↻ + NEXT LINE, Train/Review toggle, Main /
   Side / Surprises / My games tabs, and the line list under it):
   - **Hide it while a line is being trained** — only the board and a
     minimal status; this is what "bigger board, fewer distractions" means.
   - The buttons all look the same (same ice fill); give them a
     **universal button system** (distinct but related styles) that then
     applies across the whole app.
   - Owner invites a **different structure** for it, using tools already
     discussed. Proposal to discuss (see chat 2026-09-24): focus mode +
     a slim icon toolbar + a Chess Reps-style "mode" bottom sheet.
9. **Line rows in the browser** are "too much, hard to read at a glance":
   the move strings ("Bc5 8. Be3 Bd7 9. Bxc6 …"), the "7...Bc5 ·" prefix
   repeated in every name, a NEW badge + checkbox on every row, and the
   "0 / 3 clean runs to Bronze" line. Keep chess notation to a minimum and
   find a better way. (Also a bug: the trunk row's badge and checkbox
   overflow outside the card.) Proposal to discuss in chat 2026-09-24.
10. **Per-line mastery progress** (the thin grey bar + "0 / 3 clean runs
    to Bronze" text): "can be done better, more striking". Proposal in
    chat 2026-09-24: a glossy medal ring / segmented pips per tier,
    animated fill, tier colour; no sentence.
11. **A one-line idea per move** in the trainer: "a crisp, easy-to-read
    one-liner stating the idea behind the move", placed somewhere good
    (proposal: in the status line under the board, right after you play
    the move — "Bc4 · aims at f7" — and reused as the hint text).
    Content job: one idea per unique OUR-move position (~200 across both
    openings, since lines share moves), stored in the library keyed by
    position, sourced where a source explains it, otherwise marked
    interpreted — same provenance rules as the plans.
7. **Global rule from the owner**: everything in the app gets redesigned
   for consistency — big change or a light touch — no screen or element
   left in prototype style.

Design pass 4 (2026-09-24, built from 15c84c7; pass 3 dropped): items
1-10 applied app-wide. Home = header (logo, greeting, streak, level) +
"Today" goal card with hint + **Instagram-style swipe tabs** (Openings ·
Progress · Games · Settings, sliding underline). Opening cards stacked
with a **mini board of the opening position**, due pill, counts, Review
(secondary) + Train (primary). Progress tab: level ring, XP, streak, 14-day
heat strip, medal counts per opening, "trips you up" families. Games and
Settings tabs hold scan / weak spots / goal / vibration switch / token /
backup with short texts. **Trainer focus mode**: board + status + icon
toolbar (restart, hint, lines, Train/Review); Next line appears only when
a line is done; notation only in Review. **Lines sheet** slides up: four
category cards (colour-coded top edge), search, families with medal dots
and due counts, rows = thumbnail board + name + kind/frequency + pips +
**medal ring**; checkboxes behind Edit. **Universal buttons**: primary
(ice, gloss, sheen), secondary (ice-800, outline, gloss, offset sheen),
danger, tertiary icons. **Ice palette family** + mint/lilac/coral/amber
complements in tokens.css. Wording "perfect" replaces "clean". Motion:
staggered rise-in, count-up numbers, ring fill, pip pop, medal pop,
sheet slide, pinging due dots, flame flicker, 6 s sheen cycle. SW v9.
Still open: human line names (item 9 names still carry notation — content
job), item 11 per-move ideas (content job), Review panels restyle depth.

### Next candidates (owner picks, one per session)
- Owner reviews pass 4 on the phone.
- Content: human line names (~60) and per-move one-liners (item 11).
- Owner reviews design pass 3 on the phone; next: home progress cards →
  tier summary, Review mode restyle, content gap 4.Nd4 Qxd5 5.c3.
- Use the app for a few weeks; then the data-driven content pass above.
- Rotate the Lichess token (owner); re-run `explorer-check` monthly.
- Analyse more than 60 games on the phone in the background, or run
  `tools/analyse-games.mjs` on the PC and import the JSON.
- A "Lines" screen on the home page (all openings at once) once there are
  more than two openings.

---

## Testing
- `npm test` runs `node --test` over `tests/*.test.mjs`: repertoire
  legality/canonical SAN and provenance (seed = library SAN, 0 engine
  plies, no prefix lines, depth rule, sourced plans), the fail-closed
  verifier with a fake engine, library legality, tree helpers, settings,
  progress, explorer client, Chess.com parsing/walk/aggregation. DOM code (`app.js`,
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
