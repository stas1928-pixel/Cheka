/* ---------------------------------------------------------------
   APP — the glue between the screen (DOM), the rules engine
   (chess.js) and our repertoire data.

   Reading order if you are new here:
     1. `state` — everything the trainer needs to remember.
     2. openTrainer / setMode — how a screen is entered.
     3. TRAINING: resetLine, onSquareClick, attemptUserMove,
        playOpponentMove — the quiz loop.
     4. REVIEW: reviewLine, stepTo — stepping through a line freely.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';
import { OPENINGS, getOpening } from './repertoire.js';
import * as tree from './tree.js';

// How often the opponent plays a prepared deviation instead of the
// main-line move, when one exists at that ply. 0 = never, 1 = always.
const DEVIATION_CHANCE = 0.35;
const OPPONENT_DELAY_MS = 500;

// One glyph per piece type; colour comes from CSS (.piece.w / .piece.b).
const GLYPH = { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' };

const $ = (sel) => document.querySelector(sel);
const els = {
  cards: $('#opening-cards'),
  back: $('#back'),
  name: $('#trainer-name'),
  side: $('#trainer-side'),
  modeToggle: $('#mode-toggle'),
  board: $('#board'),
  status: $('#status'),
  moves: $('#moves'),
  note: $('#branch-note'),
  controls: $('.controls'),
  restart: $('#restart'),
  review: $('#review-controls'),
  lineSelect: $('#line-select'),
  stepFirst: $('#step-first'),
  stepPrev: $('#step-prev'),
  stepNext: $('#step-next'),
  stepLast: $('#step-last'),
};

const state = {
  opening: null,        // the opening object from repertoire.js
  mode: 'train',        // 'train' (quiz) or 'review' (browse)
  line: [],             // the SAN list on screen (main line or a branch)
  branch: null,         // the branch in play, if any
  ply: 0,               // how many plies of `line` are on the board
  game: new Chess(),    // the rules engine holding the real position
  selected: null,       // square the user tapped first, e.g. "e2"
  finished: false,
  session: 0,           // bumped on every reset so stale timers do nothing
};

/* ---------- screens ---------- */

function showScreen(name) {
  document.querySelectorAll('main[data-screen]').forEach((el) => {
    el.hidden = el.dataset.screen !== name;
  });
}

/* ---------- home ---------- */

function renderHome() {
  els.cards.innerHTML = OPENINGS.map((o) => {
    const preview = tree.formatMoves(o.mainLine, 6).map((m) => m.text).join(' ');
    const sideText = o.side === 'w' ? 'You play White' : 'You play Black';
    return `
      <article class="card">
        <div class="card-top">
          <h2>${o.name}</h2>
          <span class="pill ${o.side}">${sideText}</span>
        </div>
        <p class="card-sub">${o.subtitle}</p>
        <p class="card-line">${preview} …</p>
        <div class="card-actions">
          <button class="primary" data-train="${o.id}">Train</button>
          <button data-review="${o.id}">Review</button>
        </div>
      </article>`;
  }).join('');
}

els.cards.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-train], button[data-review]');
  if (!btn) return;
  if (btn.dataset.train) openTrainer(btn.dataset.train, 'train');
  else openTrainer(btn.dataset.review, 'review');
});

/* ---------- entering the trainer screen ---------- */

function openTrainer(openingId, mode) {
  state.opening = getOpening(openingId);
  els.name.textContent = state.opening.name;
  els.side.textContent = state.opening.side === 'w' ? 'White' : 'Black';
  els.side.className = `pill ${state.opening.side}`;
  showScreen('trainer');
  setMode(mode);
}

function setMode(mode) {
  state.mode = mode;
  els.modeToggle.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  els.controls.hidden = mode !== 'train';
  els.review.hidden = mode !== 'review';

  if (mode === 'train') {
    resetLine();
  } else {
    populateLineSelect();
    reviewLine(null);
  }
}

els.modeToggle.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-mode]');
  if (btn && btn.dataset.mode !== state.mode) setMode(btn.dataset.mode);
});

/* ---------- shared rendering ---------- */

function renderBoard() {
  const { game, opening, selected } = state;
  const flipped = opening.side === 'b';          // Black at the bottom when training Black
  const rows = game.board();                     // rows[0] is rank 8, rows[7] is rank 1
  const last = game.history({ verbose: true }).at(-1);
  const legal = selected ? game.moves({ square: selected, verbose: true }) : [];

  els.board.innerHTML = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // When flipped, walk the board from the other corner.
      const r = flipped ? 7 - row : row;
      const f = flipped ? 7 - col : col;
      const square = 'abcdefgh'[f] + (8 - r);

      const sq = document.createElement('div');
      sq.className = `sq ${(r + f) % 2 === 0 ? 'light' : 'dark'}`;
      sq.dataset.square = square;

      const piece = rows[r][f];
      if (piece) {
        const span = document.createElement('span');
        span.className = `piece ${piece.color}`;
        span.textContent = GLYPH[piece.type];
        sq.appendChild(span);
      }

      if (last && (square === last.from || square === last.to)) sq.classList.add('last');
      if (square === selected) sq.classList.add('selected');
      const target = legal.find((m) => m.to === square);
      if (target) {
        sq.classList.add('legal');
        if (target.captured) sq.classList.add('capture');
      }

      sq.addEventListener('click', () => onSquareClick(square));
      els.board.appendChild(sq);
    }
  }
}

/**
 * Move list under the board.
 * Training: only the moves played so far.
 * Review: the whole line, future moves dimmed, every move tappable.
 */
function renderMoves() {
  const review = state.mode === 'review';
  const entries = tree.formatMoves(state.line, review ? state.line.length : state.ply);

  els.moves.innerHTML = entries.length === 0
    ? '<span class="mv">No moves yet.</span>'
    : entries.map((m) => {
        const cls = ['mv'];
        if (m.ply === state.ply - 1) cls.push('cur');
        if (review) {
          cls.push('clickable');
          if (m.ply >= state.ply) cls.push('future');
        }
        return `<span class="${cls.join(' ')}" data-ply="${m.ply}">${m.text}</span>`;
      }).join(' '); // the space lets the list wrap between moves

  els.note.hidden = !state.branch;
  els.note.textContent = state.branch ? state.branch.note : '';
}

els.moves.addEventListener('click', (e) => {
  const span = e.target.closest('.mv[data-ply]');
  if (span && state.mode === 'review') stepTo(Number(span.dataset.ply) + 1);
});

function setStatus(text, kind = 'neutral') {
  els.status.className = `status ${kind}`;
  els.status.textContent = text;
}

/* =================================================================
   TRAINING MODE
   ================================================================= */

function resetLine() {
  state.session += 1;
  state.branch = null;
  state.line = tree.buildLine(state.opening);
  state.ply = 0;
  state.game.reset();
  state.selected = null;
  state.finished = false;
  els.restart.textContent = 'Restart line';

  renderBoard();
  renderMoves();
  setStatus(tree.isUserPly(state.opening, 0) ? 'Your move' : 'Opponent to move…');
  scheduleOpponent();
}

function onSquareClick(square) {
  const { game, opening } = state;
  if (state.mode !== 'train') return;
  if (state.finished || !tree.isUserPly(opening, state.ply)) return;

  const piece = game.get(square);
  const ownPiece = piece && piece.color === opening.side;

  // First tap: pick up one of your pieces.
  if (!state.selected) {
    if (ownPiece) { state.selected = square; renderBoard(); }
    return;
  }

  // Second tap on the same square: put it down again.
  if (square === state.selected) {
    state.selected = null; renderBoard(); return;
  }

  // Second tap: try to move there. Promotion always to queen (fine for an
  // opening trainer — nobody promotes in the first ten moves).
  const legal = game.moves({ square: state.selected, verbose: true });
  const matched = legal.find((m) => m.to === square && (!m.promotion || m.promotion === 'q'));

  if (!matched) {
    // Not a legal destination. Tapping another own piece re-selects it.
    state.selected = ownPiece ? square : null;
    renderBoard();
    return;
  }

  state.selected = null;
  attemptUserMove(matched);
}

function attemptUserMove(move) {
  const expected = state.line[state.ply];

  if (move.san !== expected) {
    renderBoard();
    setStatus(`Not the line — expected ${expected}`, 'bad');
    return;
  }

  state.game.move(move.san);
  state.ply += 1;
  renderBoard();
  renderMoves();
  setStatus('Correct ✓', 'good');

  if (state.ply >= state.line.length) finishLine();
  else scheduleOpponent();
}

function scheduleOpponent() {
  const session = state.session;
  setTimeout(() => {
    if (session === state.session) playOpponentMove();
  }, OPPONENT_DELAY_MS);
}

function playOpponentMove() {
  const { opening } = state;
  if (state.ply >= state.line.length) { finishLine(); return; }
  if (tree.isUserPly(opening, state.ply)) { setStatus('Your move'); return; }

  // Maybe leave the book. Only once per line, and only where we have a
  // prepared answer — otherwise there would be nothing to train.
  let leftBook = false;
  if (!state.branch) {
    const branch = tree.pickDeviation(opening, state.ply, { chance: DEVIATION_CHANCE });
    if (branch) {
      state.branch = branch;
      state.line = tree.buildLine(opening, branch);
      leftBook = true;
    }
  }

  const san = state.line[state.ply];
  state.game.move(san);
  state.ply += 1;
  renderBoard();
  renderMoves();

  if (state.ply >= state.line.length) { finishLine(); return; }
  if (leftBook) setStatus(`Opponent left the book with ${san} — punish it!`, 'warn');
  else setStatus('Your move');
}

function finishLine() {
  state.finished = true;
  state.selected = null;
  renderBoard();
  setStatus(state.branch ? 'Branch complete! 🎉' : 'Line complete! 🎉', 'good');
  els.restart.textContent = 'Next line';
}

/* =================================================================
   REVIEW MODE — no quiz, no judgement, just look at the line.
   ================================================================= */

function populateLineSelect() {
  const { opening } = state;
  const options = ['<option value="">Main line</option>'].concat(
    opening.branches.map((b, i) => `<option value="${i}">${tree.describeBranch(b)}</option>`),
  );
  els.lineSelect.innerHTML = options.join('');
}

function reviewLine(branch) {
  state.session += 1;   // cancels any opponent move still pending from training
  state.branch = branch;
  state.line = tree.buildLine(state.opening, branch);
  state.selected = null;
  state.finished = false;
  stepTo(0);
}

/** Show the position after `ply` half-moves. Replays from the start —
 *  simple and always consistent with the line. */
function stepTo(ply) {
  const target = Math.max(0, Math.min(ply, state.line.length));
  state.game.reset();
  for (let i = 0; i < target; i++) state.game.move(state.line[i]);
  state.ply = target;

  renderBoard();
  renderMoves();
  renderReviewStatus();
}

function renderReviewStatus() {
  const { ply, line, opening } = state;
  if (ply === 0) {
    setStatus('Start position — step forward or tap a move');
  } else {
    const who = tree.isUserPly(opening, ply - 1) ? 'you' : 'opponent';
    setStatus(`${tree.moveLabel(ply - 1, line[ply - 1])}  ·  ${who}`);
  }
  els.stepFirst.disabled = els.stepPrev.disabled = ply === 0;
  els.stepNext.disabled = els.stepLast.disabled = ply >= line.length;
}

els.lineSelect.addEventListener('change', () => {
  const v = els.lineSelect.value;
  reviewLine(v === '' ? null : state.opening.branches[Number(v)]);
});
els.stepFirst.addEventListener('click', () => stepTo(0));
els.stepPrev.addEventListener('click', () => stepTo(state.ply - 1));
els.stepNext.addEventListener('click', () => stepTo(state.ply + 1));
els.stepLast.addEventListener('click', () => stepTo(state.line.length));

// Arrow keys are handy when reviewing on a laptop.
document.addEventListener('keydown', (e) => {
  if (state.mode !== 'review' || els.review.hidden) return;
  if (e.key === 'ArrowRight') stepTo(state.ply + 1);
  if (e.key === 'ArrowLeft') stepTo(state.ply - 1);
});

/* ---------- wiring ---------- */

els.restart.addEventListener('click', resetLine);
els.back.addEventListener('click', () => {
  state.session += 1; // cancel any pending opponent move
  showScreen('home');
});

renderHome();
showScreen('home');
