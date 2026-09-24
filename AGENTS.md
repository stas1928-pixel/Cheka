# Cheka agent guide

This file is the canonical product and design brief for every AI working in
this repository. Chat history is supporting evidence, not durable project
state. Read this file before proposing, designing, or implementing UI work.

## Startup order

1. Read this file.
2. Read `PROJECT_BRIEF.md` for the original product rationale.
3. Read `PLAN.md` for decisions and current implementation history.
4. Read `docs/LAYOUT.md` before changing code or generated data.
5. Inspect the running app on both phone-sized and desktop viewports before
   judging the UI from source alone.
6. Check `git status` and preserve work already in progress.

For conflicts, use this order: the user's latest explicit instruction, the
locked requirements in this file, `PLAN.md`, `PROJECT_BRIEF.md`, then the
current implementation. The current UI is a functional prototype, not an
automatically approved visual reference.

## Product truth

Cheka is a personal, mobile-first chess opening trainer. It trains exactly:

- the Scotch Gambit as White;
- the Elephant Gambit as Black.

It is for a practical club/low-Elo player who often meets imperfect, uncommon,
or early-deviating moves. It should build recognition, confidence, and plans,
not demand memorization of computer-perfect chess without human context.

The app is a static, offline-capable PWA with no accounts or backend. The main
experience is training on an actual chessboard. Research, settings, engine
tools, and imports support that experience; they are not the visual center.

## Confirmed owner requirements

These came directly from repeated owner feedback and are locked unless the
owner changes them:

- Dark mode. The board is the hero on the training screen.
- The board and overall interaction need more "oomph": sharper, more polished,
  and more satisfying than the first prototype.
- Training must be one tap away from the home screen. Scotch and Elephant are
  the first things seen, not a marketing page or analytics dashboard.
- Train and Review are distinct modes. Training judges moves; Review permits
  free stepping and inspection.
- Line selection must be fast and explicit. Do not hide everything behind a
  random drill. Show categories, all contained lines, recognizable names, and
  their sub-line or deviation context.
- The meaningful line families are main theory, practical side/trap lines,
  deliberate surprise weapons, and lines common in the owner's own games.
- A line row shows its individual progress. Clean completions visibly advance
  it toward mastery.
- Mastery tiers are earned through clean runs: Bronze at 3, Silver at 6, Gold
  at 10, and Master at 15. Show progress toward the next tier.
- Keep the "opponent left the main line" moment. The owner specifically liked
  that feedback because it explains why the current branch matters.
- The owner's Chess.com games should drive both "My games" coverage and a
  separate weaknesses-training workflow.
- Correct and incorrect moves need immediate, satisfying feedback through
  motion, color, and optional sound, not only a sentence below the board.
- Every completed trained line opens a prominent completion dialog. It states
  the practical plan from that position, credits its theoretical basis, and
  offers `Review board` and `Next line`.
- The app must work comfortably on an Android phone, including long line names,
  short viewports, and Black-oriented boards.

## Intended feeling

The target is a focused chess product with the feedback discipline of a good
learning game. It should feel:

- sharp, deliberate, and quick;
- tactile and rewarding without becoming noisy;
- premium through consistency and detail, not decoration;
- playful enough to invite daily use, but not childish or casino-like;
- chess-literate and trustworthy rather than generic or AI-generated.

Use Chess Reps as inspiration for repertoire organization and line selection.
Use Duolingo as inspiration for immediacy, progression, and earned feedback,
not as a visual skin to copy. Preserve the restraint of a serious chess tool.

This is an inferred taste direction, not a license to invent a mascot, cartoon
world, rebrand, or elaborate reward economy. Exact branding, palette, logo, and
illustration style are not yet owner-approved.

## Experience hierarchy

### Home

The home screen should answer one question immediately: what should I train?

1. Put Scotch and Elephant first, with a clear primary training action.
2. Show useful at-a-glance state on each opening: due lines, current mastery,
   and recent progress. Do not make the user scroll through duplicate summary
   cards to understand the same opening twice.
3. Put `Work on weaknesses` and gaps from real games after the openings. They
   are valuable personalized tools, not the default entry point.
4. Keep settings, tokens, import/export, and destructive reset actions quiet
   and lower in the hierarchy.

The home screen is an operational launch surface, not a landing page. Avoid a
large hero, promotional prose, and a stack of unrelated floating cards.

### Trainer

- Keep back, opening identity, side, and sound controls compact.
- Keep the board as large as the viewport safely permits, square and stable.
  Labels, selection controls, status changes, and loading text must not resize
  or shift it.
- Train/Review and line-family selection must be easy to reach, but must not
  push the board below the fold on a normal phone. A compact selector, drawer,
  or bottom sheet is preferable to permanent dense chrome if space is tight.
- During Training, show only information needed for the current drill. Keep
  masters data and Stockfish tooling in Review.
- Make `Your move`, opponent activity, mistakes, deviations, completion, and
  recovery states visually unambiguous.
- Use one dominant action at a time. Restart is secondary; it must not compete
  with the board or the next-line flow.

### Line browser

The line browser is core navigation, not an optional debug panel.

- Preserve the four useful categories: Main, Side, Surprises, and My games.
- Expose every line in the selected category, grouped by recognizable branch
  or opponent deviation when that improves scanning.
- Each row should show the line name, compact move preview or defining move,
  due/new state, clean-run count, mastery tier, and progress bar.
- Tapping a row starts that exact line quickly. Inclusion checkboxes remain a
  separate, obvious affordance and must not make row taps ambiguous.
- Make parent/child or transposition relationships understandable. Do not dump
  many nearly identical flat rows on the user.
- Long names and badges must wrap or truncate deliberately without overlapping
  controls. Stable line ids and progress ownership must survive a redesign.

### Training feedback

- Piece motion should be crisp and short. Correct feedback may use a controlled
  glow/flash and sound; incorrect feedback must be clear without shaking the
  whole layout or obscuring the position.
- Reward line completion and real mastery milestones more strongly than every
  routine move. Constant celebration makes progress feel meaningless.
- Streaks are supporting motivation, not the main goal. Never shame a reset or
  make a mistake costly.
- Respect `prefers-reduced-motion`; sound remains optional. Haptics may be
  explored only as progressive enhancement and must never be required.
- Do not use surprise animation that delays the next move or prevents immediate
  board interaction.

### Completion

The completion dialog is part of the teaching model, not decorative polish.
For every trained line it must:

- appear reliably when the line ends;
- identify the completed line;
- explain what the player is trying to do next in plain chess language;
- show whether the plan is directly quoted or responsibly inferred and credit
  the source;
- retain the completed board behind it;
- make `Next line` primary and `Review board` available;
- fit without clipped text or hidden actions on a short phone viewport.

## Visual constitution

Do not ask an AI to decide repeatedly whether a screen "feels premium." Build
an explicit system, approve a few golden screens, then reproduce that system.

- Use a neutral near-black foundation with clear surface separation. The
  existing blue/slate prototype is not a locked brand palette. Avoid a one-note
  dark-blue interface.
- The board colors, pieces, coordinates, legal targets, last move, check, and
  feedback states must remain distinguishable at a glance. Gameplay contrast
  takes priority over decorative color.
- Reserve the accent for selection, progress, and the primary action. Keep
  success, warning, and error colors semantically distinct.
- Use a consistent spacing scale such as 4, 8, 12, 16, 24, and 32 px. Avoid
  one-off gaps used to repair a local layout symptom.
- Minimum touch target is 44 by 44 px. Controls near the board must remain easy
  to hit one-handed.
- Favor sharper geometry: cards at 8 px radius or less, restrained elevation,
  and clear alignment. Do not turn every section, label, or action into a pill.
- Cards are for repeated openings or line items. Do not nest cards inside cards
  or make every page section a floating card.
- Use one coherent icon family for familiar actions. Prefer recognizable icons
  with accessible labels over rounded text buttons for back, sound, close,
  stepping, and similar tools.
- Typography should be compact and highly legible. Do not use viewport-scaled
  font sizes, negative letter spacing, oversized headings inside compact UI, or
  tiny all-caps text as a substitute for hierarchy.
- Motion communicates state. It must be quick, consistent, and free of layout
  shifts. Decorative motion without teaching or feedback value should be cut.
- Visible copy should discuss chess, progress, or the current action. Do not
  fill the product with instructions explaining its own interface.

## What to avoid

- A generic SaaS dashboard with many equal-weight panels.
- A marketing-style landing page before the actual trainer.
- Endless rounded dark cards on slightly different blue-gray backgrounds.
- Gradients, glow, badges, confetti, or animation applied everywhere to create
  artificial excitement.
- Making the board smaller to accommodate tools used only occasionally.
- A flat, unnamed list of lines or random training with no way to choose.
- Progress that exists only as aggregate percentages; line-level mastery is the
  motivating unit.
- Vague AI critique such as "make it cleaner" or "make it more premium."
- A broad visual rewrite while repertoire work is in progress. Design and chess
  content are separate workstreams unless the owner explicitly combines them.
- Replacing the static PWA architecture or adding accounts/backend/analytics
  just to redesign the interface.

## Design workflow

The owner wants far less babysitting and fewer token-heavy polishing loops.
Use this process for a substantial redesign:

1. Inspect the real app and capture the current key states on phone and desktop.
2. Build a small reference matrix. Record what is useful in each reference
   (hierarchy, board treatment, progression, motion), not merely the app name.
3. Produce two or three genuinely different directions for only the golden
   screens: Home, Trainer/your move, Line browser, Incorrect move, and Line
   complete. Do not code ten full variants.
4. Use one owner checkpoint to choose and correct the direction. This is the
   appropriate human taste gate.
5. Freeze the chosen direction into tokens, components, state rules, and golden
   screenshots. After that, implement ordinary screens autonomously.
6. Compare implementation to the accepted references and measurable rules.
   Deterministic checks and golden screenshots outrank an AI's self-praise.
7. Run the full app, repair objective failures, and present a finished candidate
   instead of asking for approval on every spacing or component choice.

Escalate only when a choice materially changes visual identity, navigation,
product scope, progression mechanics, privacy, or data ownership. Do not ask
about routine spacing, responsive behavior, component reuse, or bug fixes.

## Required design QA

At minimum, verify these viewports or close device equivalents:

- 360 x 800 phone;
- 390 x 844 phone;
- 768 x 1024 tablet;
- 1440 x 900 desktop.

Exercise these states in the running app:

- home with new, in-progress, and mastered lines;
- Scotch training as White and Elephant training as Black;
- all line categories and a long line name;
- correct move, incorrect move, repeated miss/hint, and opponent deviation;
- line completion dialog with long plan and source credit;
- Review stepping, masters data loading/error, and engine loading/error;
- empty My games/weaknesses, populated reports, settings, and import/export;
- short viewport, reduced motion, keyboard focus, and screen-reader labels.

Acceptance requires: no overlaps, clipped actions, accidental horizontal
scroll, illegible board states, shifting board dimensions, obscured focus, or
text escaping controls. The primary action and current state must be obvious in
every screenshot. Do not accept a page because it merely renders.

## Engineering and content boundaries

- Reuse the existing static HTML/CSS/ES-module architecture and vendored chess
  assets. A design task is not permission for a framework migration.
- `library/lines.mjs` owns repertoire content and plans.
  `tools/repertoire.seed.mjs` selects drill lines.
  `js/repertoire.data.js` is generated and must not be hand-edited.
- Preserve localStorage keys and progress compatibility unless a migration is
  included and tested.
- Never print, inspect, commit, or expose `.env` or tokens.
- Bump the service-worker version when changed app-shell assets would otherwise
  remain stale on the phone.
- Run `npm test` after implementation. Verify the actual PWA over HTTP, not by
  opening `index.html` directly.
- Do not commit or push unless the owner explicitly asks.

## Cross-agent handoff

Agents collaborate through the repository, not by assuming another chat is
available. After a meaningful product or design decision:

- Cursor is reserved exclusively for nvRAVE and SSH-to-station work. Do not
  involve Cursor in Cheka research, design, implementation, review, or QA
  unless the owner explicitly requests it.

- update this file only when the durable design constitution changes;
- record implementation decisions and current state in `PLAN.md`;
- keep source-specific chess facts in the library/docs rather than here;
- leave a concise evidence-based status with what changed, what was verified,
  and what remains;
- never create a second competing design brief without explicitly superseding
  this one.

## Open design decisions

The following are deliberately not locked: final product name/wordmark, exact
palette, custom illustration or mascot, light mode, haptic strategy, and final
golden screens. Treat these as owner taste decisions at the first meaningful
design checkpoint, not invitations to improvise repeatedly during build-out.
