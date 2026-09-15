# Opening Trainer — Project Brief

A personal mobile chess opening trainer, inspired by the original **Chess Reps**
app (Jonas Mayer, Android) but scoped to two specific openings with smarter,
opponent-aware training logic.

This doc is the full spec from planning. Read this before writing code —
it captures *why* decisions were made, not just what to build.

---

## Who this is for

- One person, personal use only. No multi-user, no accounts, no cloud backend
  required unless stated otherwise.
- Total beginner to coding — explain reasoning in comments, prefer simple
  patterns over clever ones, build incrementally.
- Wants to understand how it works, not just get a working app. Favor small,
  reviewable steps over large code dumps.
- Android phone. Distribution as an installed app is NOT required — a PWA
  ("Add to Home Screen") is the target, since it avoids native Android build
  tooling entirely while still feeling like a real app.

---

## The two openings

1. **Scotch Opening** — played as **White**. `1.e4 e5 2.Nf3 Nc6 3.d4`
2. **Elephant Gambit** — played as **Black**. `1.e4 e5 2.Nf3 d5`

Scope is intentionally locked to these two. Do not build a general
"add any opening" system — hardcoding these two, or storing them as simple
named entries, is correct and keeps the whole project tractable.

---

## Core data model: three-layer line tree

Each opening isn't just a flat move list. It has three layers:

1. **Main line** — theory-backed, ~10 moves / 20 ply deep. This is the
   primary line the user memorizes. Sourced from Lichess Opening Explorer
   stats (master games), but ultimately hand-approved by the user.

2. **Punishment branches** — triggered when the opponent deviates from the
   main line into an inferior move. Shows how to punish the mistake.
   **Cutoff rule (decaying threshold):**
   - If a big advantage (~+1.5 eval or better) is reached within ~6 moves
     of the deviation → stop there, that's the punishment line.
   - If it takes longer, accept a smaller edge (+0.5 to +1.0 eval) → stop
     once that's crossed, even past move 10.
   - If neither threshold is ever reached → discard the branch. Not every
     opponent mistake is worth a dedicated line.
   - This requires running Stockfish evaluation after each move in a
     candidate branch and checking `(eval, moves_since_deviation)` against
     the sliding threshold above.

3. **Deep tactical lines** — if a branch contains a forced sequence (mate
   threat, forced material win), follow it to resolution regardless of
   length, ignoring the normal move-count cutoffs.

**Practical data shape** (adjust as needed once building):
```
opening
 ├─ name, side (w/b)
 ├─ mainLine: [san, san, san, ...]
 └─ branches: [
      {
        deviatesAt: <ply index into mainLine>,
        opponentMove: <san the opponent played instead>,
        response: [san, san, ...],   // the punishment/continuation
        type: "punishment" | "tactical",
        note: <optional user note>
      },
      ...
    ]
```

---

## Training logic

- **Opponent's moves during training**: for the main line, the opponent
  side just replays the fixed line (like the original Chess Reps did).
  For branch coverage, the opponent should occasionally deviate using
  moves from real data — see "Chess.com import" below — rather than only
  ever playing the "correct" theory move. This directly addresses a real
  complaint about the original Chess Reps: it never simulated an opponent
  actually deviating, only replayed the user's own saved line.
- **Two distinct modes** (also a direct response to real user feedback on
  Chess Reps, which lacked this):
  - **Review/browse mode** — step through a line freely, no quiz, no
    right/wrong judgment. Just look at it.
  - **Training/quiz mode** — the actual spaced-repetition drill, with
    correct/incorrect feedback.
- **Feedback should feel satisfying**: animation + sound on correct/incorrect,
  not just a text label. This is a deliberate product decision — it's what
  makes a daily-use trainer feel good to open instead of feeling like
  homework.
- **Progress tracking**: accuracy %, streaks, and weak-spot surfacing,
  persisted locally (this is a personal single-user app, so simple local
  storage is fine — no need for a backend sync system).

---

## Chess.com import (opponent-awareness feature)

- Pull the user's own game history via the **Chess.com Public API**
  (`api.chess.com/pub/`) — read-only, no auth needed.
- Filter for games that started with either of the two openings (match by
  move-sequence prefix).
- Diff the opponents' actual moves against the repertoire tree.
- Anything an opponent played that isn't covered becomes a flagged gap —
  this is a *personalized* version of the "Omniscient Knight" gap-finder
  feature from the original Chess Reps, but grounded in the user's real
  opponents instead of population-wide stats.

---

## External data/tools

- **chess.js** — move legality, board state, SAN parsing. Already wired up
  in the prototype.
- **Lichess Opening Explorer API** — master-game move frequency/win-rate
  stats, used when building/reviewing the main line.
- **Stockfish** (via WASM in-browser) — evaluates positions for the
  punishment-line cutoff logic described above.
- **Chess.com Public API** — game history import for opponent-gap detection.
- **Browser localStorage** — where the repertoire tree, progress stats, and
  settings live. No backend server needed for a single-user local app.

---

## Design direction

- Visual reference: the original **Chess Reps** app's training screen —
  clean, minimal chrome, the board is the clear focal point.
- **Dark mode**, board-as-hero on the training screen — everything else
  (buttons, status text) stays minimal and out of the way.
- **Home screen**: the two openings pinned at the top as the main entry
  point, stats/progress below on scroll — training should be one tap away.
- Home screen styling is otherwise open/flexible — not locked to Chess Reps'
  home screen specifically, just the training screen.

---

## Current state

A working prototype (`index.html`) already exists and demonstrates the core
training loop end-to-end:
- Renders a board from chess.js state (no external board library — custom
  CSS grid + unicode pieces, dark theme).
- Hardcoded single line: Scotch Opening main line, White side.
- Click-to-move interaction with legal-move highlighting.
- Opponent auto-plays their side of the line.
- Correct/incorrect feedback with color + text (no animation/sound yet —
  that's a planned upgrade, see below).

This file is the foundation — everything else builds ON this loop, not
around it.

---

## Suggested next steps (in order)

1. Add the Elephant Gambit as a second selectable line (Black side) —
   proves the app can handle more than one hardcoded opening before adding
   real flexibility.
2. Convert `REPERTOIRE.moves` (flat array) into the branching tree shape
   described above — even with fake/manual branch data at first, no real
   engine integration yet.
3. Add Review mode as a separate screen/toggle from Training mode.
4. Wire up satisfying feedback: a simple animation (e.g. square flash) and
   a short sound on correct/incorrect.
5. Add localStorage persistence for progress (accuracy, streaks).
6. Integrate Lichess Explorer API to pull real stats when building/reviewing
   a line (read-only lookup, not required for training itself).
7. Integrate Stockfish (WASM) for the punishment-line eval-cutoff logic.
8. Integrate Chess.com Public API import + gap-diffing against the
   repertoire tree.

Each step should be small enough to build, test on the phone, and
understand before moving to the next — this is a learning project as much
as a personal tool.
