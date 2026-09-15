/* ---------------------------------------------------------------
   APP — the glue between the screen (DOM), the rules engine
   (chess.js) and our repertoire data.

   Reading order if you are new here:
     1. `state` — everything the trainer needs to remember.
     2. startTraining / resetLine — how a drill begins.
     3. onSquareClick / attemptUserMove — what happens when you tap.
     4. playOpponentMove — how the "opponent" replies (and sometimes
        leaves the book to test a prepared branch).
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
  board: $('#board'),
  status: $('#status'),
  moves: $('#moves'),
  note: $('#branch-note'),
  restart: $('#restart'),
};

const state = {
  opening: null,        // the opening object from repertoire.js
  line: [],             // the SAN list being drilled (main line or a branch)
  branch: null,         // the branch the opponent chose, if any
  ply: 0,               // how many plies of `line` have been played
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
        </div>
      </article>`;
  }).join('');
}

els.cards.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-train]');
  if (btn) startTraining(btn.dataset.train);
});

/* ---------- starting a drill ---------- */

function startTraining(openingId) {
  state.opening = getOpening(openingId);
  els.name.textContent = state.opening.name;
  els.side.textContent = state.opening.side === 'w' ? 'White' : 'Black';
  els.side.className = `pill ${state.opening.side}`;
  showScreen('trainer');
  resetLine();
}

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

/* ---------- rendering ---------- */

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

function renderMoves() {
  const played = tree.formatMoves(state.line, state.ply);
  els.moves.innerHTML = played.length === 0
    ? '<span class="mv">No moves yet.</span>'
    : played.map((m) => `<span class="mv${m.ply === state.ply - 1 ? ' cur' : ''}">${m.text}</span>`).join('');

  els.note.hidden = !state.branch;
  els.note.textContent = state.branch ? state.branch.note : '';
}

function setStatus(text, kind = 'neutral') {
  els.status.className = `status ${kind}`;
  els.status.textContent = text;
}

/* ---------- user input ---------- */

function onSquareClick(square) {
  const { game, opening } = state;
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

/* ---------- opponent ---------- */

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

/* ---------- wiring ---------- */

els.restart.addEventListener('click', resetLine);
els.back.addEventListener('click', () => {
  state.session += 1; // cancel any pending opponent move
  showScreen('home');
});

renderHome();
showScreen('home');
