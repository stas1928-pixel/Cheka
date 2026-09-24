# In hindsight — Cheka, 15–24 September 2026

The result: two openings, 63 drilled lines that the owner now calls "actual
lines, logical and worth studying", a working phone PWA with review mode,
spaced repetition, mastery tiers, Chess.com import, weakness drills and a
plan popup. About 25,000 lines added over five working days and roughly 25
hours of paired sessions. The prototype UI plus all eight brief jobs took
one afternoon. **Everything after that was the repertoire being built three
times.** That is where the time went, and that is what this note is about.

## Timeline in one table

| Day | What happened | Kept? |
|---|---|---|
| 09-15 | Jobs 0–8 from the brief in ~3 h (two openings, branches, review, feedback, progress, explorer, Stockfish, Chess.com import). Repertoire "rebuilt from real game data" (game-grown + engine). | UI and tooling yes; repertoire no |
| 09-16 | GitHub Pages, tabs, board redesign, weakness drill, branch depth ≥ 4, offline. Lines as named lines with spaced repetition. | UI yes; lines no |
| 09-17 | Owner: lines are "odd, AI-like". Rebuild #2: hand seed + engine `extendTo`, verifier, mastery tiers. Lichess token saga (pasted in chat, revoked; new one exposed by a diagnostic). Database cross-check, +23 lines. | Verifier idea yes; lines no (21 % engine plies) |
| 09-22 | Owner: still "bot-like". Audit (which plies were engine), sourced library, five YouTube videos extracted. | Library yes — became the source of truth |
| 09-23 | Rebuild #3: library-as-truth, fail-closed verifier, 22 lines. Then the same day: trap/side rules with club frequency, strong-player database, human-move trees, subagent web research, surprises, popup credit → 63 lines, 0 engine plies, 86 tests. Three full engine passes. | Yes |

## What went wrong, and the root cause of each

1. **The repertoire was built three times.** Each time a generator decided
   the content: first the owner's own games + engine, then a hand seed with
   engine padding, finally human sources with the engine as a veto. The
   owner's requirement ("recognisable human theory, engine only checks")
   was stated on day 3, but the *ownership decision* — who is allowed to
   author a move, who may only verify — was never written down until day 9.
   Our own rule 1 ("architecture decisions first, in writing") was applied
   to systems, not to data. Cost: ~2 days.
2. **Engine padding was an unsurfaced compromise.** `extendTo` existed
   because sources were short and four of our moves were required. It was
   a policy decision disguised as a parameter; it silently produced 210
   engine plies. Should have been a question to the owner: "pad, cut, or
   find a source?"
3. **Data access came last instead of first.** For three days line choices
   were made without frequency data (365chess 403, Lichess needs a token).
   The token, once present, made every later decision objective in
   minutes (club share, strong-player consensus, masters). Rule 4 ("fix the
   environment once") should have included data sources.
4. **Titles and descriptions were treated as proof of whole lines.** A
   20-ply "Hungarian" line was tagged "theory throughout" because Wikipedia
   says 4...Be7 transposes to the Hungarian. Only per-segment provenance
   notes fixed this.
5. **Secrets handled by hand twice** (token pasted into chat; a diagnostic
   echoed a token prefix). Both times a rotation was needed.
6. **Tooling accidents in the long final session**: a cache serializer that
   silently stripped every field (a JSON replacer array used as a
   whitelist), two processes overwriting the same cache file, a walker that
   followed the masters' 4.Nxd4 instead of our 4.Bc4, Lichess rate limits,
   heredocs mangled by CRLF. About 1.5 hours.
7. **Labels changed definition three times** (side vs trap, by position of
   the mistake, then by engine severity). Each change touched tests, notes
   and docs. Thresholds should have been numbers from the start.
8. **Verification jitter.** Stockfish at a fixed depth returns ±0.05 around
   the 0.5 threshold from run to run; three full 15-minute passes were
   needed where a deeper re-check of only the flagged moves would have
   done.
9. **Reporting slips**: "88 library lines" mixed curated lines with a
   database dump; the owner's explicit "popup" became an inline note in one
   job spec; the first bounded job spent too long analysing before editing.
10. **Design work leaked into content rounds** (board "oomph", tabs,
    badges) and vice versa. `AGENTS.md` now separates the streams; it
    should have existed on day 2.

## What went right

- A static, no-build PWA: every change testable in seconds, deployable
  with `git push`.
- Tests as gates from day 1 (legality, canonical SAN, one move per
  position); later the fail-closed verifier. Nothing broken ever shipped.
- `PLAN.md` as the decision log carried state across nine sessions and one
  context compaction.
- The library-as-single-source-of-truth pattern: generated data equals
  library SAN, proven by test; provenance and plans travel with the moves.
- The three-database explorer client with an on-disk cache and the
  human-move tree walker: two hours of tooling replaced what would have
  been days of reading, and produced numbers instead of opinions.
- A research subagent working in parallel with tooling.
- The owner's insistence, twice, that the lines felt wrong. That was the
  correct call both times.

## How we would do it in two days instead of nine

- **Day 1 morning**: architecture *and data ownership* in `PLAN.md`:
  "moves come from books, titled teachers, master games, strong-player
  practice; the engine vetoes; criteria: drop ≥ 0.5, club share ≥ 10 %,
  swing ≥ 1.0/0.5, end ≥ 1.5/0.75". Secure the Lichess token via file.
  Prove the explorer with one fetch. Write the verifier rules as tests
  before any content exists.
- **Day 1 afternoon**: build the explorer cache + human-tree tool, run
  both openings, run the web-research subagent. Write the library.
- **Day 2**: select, verify once (re-check flagged moves deeper), ship,
  docs. Design as a separate stream afterwards, per `AGENTS.md`.

## Lessons, written as rules

1. **Content is architecture.** Before generating any data-like content
   (lines, rules, datasets), write down who may author it and who may only
   verify, with numeric criteria. A generator parameter that changes
   authorship (like engine padding) is a decision, not a knob.
2. **Get the data access first.** Tokens, APIs and databases before the
   first content choice; test with one fetch; never choose by guess when
   a number is one request away.
3. **Provenance per segment.** A title, description or unread citation
   proves nothing about an exact move. Every note says which source covers
   which moves.
4. **Generators fail closed and write their own output.** Any flag → exit
   non-zero, nothing written. A test proves generated output equals the
   source of truth.
5. **Cache every external lookup on disk, merge on save, one writer at a
   time.** Verify the serializer round-trips before relying on it.
6. **Secrets: file only, tool reads, never echo any part.** Rotate on any
   exposure, including a prefix.
7. **Labels are numbers.** Define categories by measurable thresholds
   before building; rename freely, but never re-derive the definition.
8. **Report counts with their definition.** Never mix categories in one
   number.
9. **Re-check borderline verdicts deeper instead of re-running everything.**
   A flag within a few centipawns of a threshold gets one deeper look;
   the full pass runs once.
10. **Separate content and design streams** and give each its own brief
    (`AGENTS.md` for design, `library/lines.mjs` + `PLAN.md` for content).
11. **Parallelise research with tooling** (a subagent for reading, the main
    session for building) — but never let two processes write one file.
12. **Bounded jobs with the expected output stated first**, owner review
    between jobs. When the owner says the result feels wrong, stop and
    find the ownership error before improving the generator.
