/* ---------------------------------------------------------------
   APP — the glue between the screen (DOM), the rules engine
   (chess.js) and our repertoire data.

   Reading order if you are new here:
     1. `state` — everything the trainer needs to remember.
     2. openTrainer / setMode — how a screen is entered.
     3. TRAINING: planLine, resetLine, onSquareClick, attemptUserMove,
        playOpponentMove — the quiz loop.
     4. LINE LIST — the tabs and the tickable list of lines under them.
     5. REVIEW: reviewLine, stepTo — stepping through a line freely.
     6. ENGINE / WEAKNESSES / HOME PANELS.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';
import { OPENINGS, getOpening, lineTitle } from './repertoire.js';
import * as tree from './tree.js';
import * as feedback from './feedback.js';
import * as progress from './progress.js';
import { fetchExplorer } from './explorer.js';
import { importGames, analyseGames, parseMoves, userSide, matchesOpening } from './chesscom.js';
import * as weakness from './weakness.js';
import { Engine } from './engine.js';
import { buildBranch, toBranchJSON } from './branchBuilder.js';
import { loadSettings, updateSetting } from './settings.js';

const OPPONENT_DELAY_MS = 500;
// After this many wrong tries on one move, an arrow shows the answer.
const HINT_AFTER_MISSES = 2;
// Piece images: vendor/pieces/wN.svg etc. (cburnett set, see its LICENSE.md).
const pieceSrc = (piece) => `vendor/pieces/${piece.color}${piece.type.toUpperCase()}.svg`;

// User preferences (sound, which tab of lines, hidden lines, tokens…).
let settings = loadSettings();
feedback.setSoundEnabled(settings.sound);

// Accuracy / streaks / weak spots / spaced repetition, saved after every move.
let prog = progress.loadProgress();
function saveProg() { progress.saveProgress(prog); }

const $ = (sel) => document.querySelector(sel);
const els = {
  cards: $('#opening-cards'),
  progressCards: $('#progress-cards'),
  lineMode: $('#line-mode'),
  lineList: $('#line-list'),
  lineListTitle: $('#line-list-title'),
  lineListMeta: $('#line-list-meta'),
  lineRows: $('#line-rows'),
  exportBtn: $('#export-progress'),
  importBtn: $('#import-progress'),
  importFile: $('#import-file'),
  resetBtn: $('#reset-progress'),
  settingsMsg: $('#settings-msg'),
  tokenInput: $('#lichess-token'),
  analyseBtn: $('#analyse-games'),
  analyseStop: $('#analyse-stop'),
  trainWeak: $('#train-weak'),
  weakMsg: $('#weak-msg'),
  weakReport: $('#weak-report'),
  chesscomUser: $('#chesscom-user'),
  scanBtn: $('#scan-games'),
  scanMsg: $('#scan-msg'),
  gapReport: $('#gap-report'),
  explorerMeta: $('#explorer-meta'),
  explorerBody: $('#explorer-body'),
  engineMeta: $('#engine-meta'),
  engineBody: $('#engine-body'),
  engineCheck: $('#engine-check'),
  engineCopy: $('#engine-copy'),
  engineJson: $('#engine-json'),
  back: $('#back'),
  name: $('#trainer-name'),
  side: $('#trainer-side'),
  modeToggle: $('#mode-toggle'),
  soundToggle: $('#sound-toggle'),
  board: $('#board'),
  arrows: $('#arrows'),
  streakChip: $('#streak-chip'),
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
  mode: 'train',        // 'train' (quiz) | 'review' (browse) | 'weak' (puzzle drill)
  lineObj: null,        // the line object on screen (trunk, variation, side line, or a draft)
  line: [],             // its moves
  ply: 0,               // how many plies of `line` are on the board
  game: new Chess(),    // the rules engine holding the real position
  selected: null,       // square the user tapped first, e.g. "e2"
  misses: 0,            // wrong tries on the current move (drives the hint arrow)
  lineMistakes: 0,      // wrong tries in this whole drill (drives spaced repetition)
  finished: false,
  session: 0,           // bumped on every reset so stale timers do nothing
  weak: null,           // weak-spot drill state
  draft: null,          // a line built from a gap, not yet in the repertoire
};

/* ---------- screens ---------- */

function showScreen(name) {
  document.querySelectorAll('main[data-screen]').forEach((el) => {
    el.hidden = el.dataset.screen !== name;
  });
}

/* ---------- home: opening cards ---------- */

function renderHome() {
  els.cards.innerHTML = OPENINGS.map((o) => {
    const preview = tree.formatMoves(tree.mainLine(o), 6).map((m) => m.text).join(' ');
    const sideText = o.side === 'w' ? 'You play White' : 'You play Black';
    const main = tree.linesOfKind(o, 'main').length;
    const side = tree.linesOfKind(o, 'side').length;
    const due = progress.dueCount(prog, o.id, visibleLines(o, o.lines).map((l) => l.id));
    return `
      <article class="card ${o.side}">
        <div class="card-top">
          <h2>${o.name}</h2>
          <span class="pill ${o.side}">${sideText}</span>
        </div>
        <p class="card-sub">${main} main line${main === 1 ? '' : 's'} · ${side} side line${side === 1 ? '' : 's'} · <b>${due} due</b></p>
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
  state.weak = null;
  state.draft = null;
  els.name.textContent = state.opening.name;
  els.side.textContent = state.opening.side === 'w' ? 'White' : 'Black';
  els.side.className = `pill ${state.opening.side}`;
  els.modeToggle.hidden = false;
  showScreen('trainer');
  setMode(mode);
}

function setMode(mode) {
  state.mode = mode;
  els.modeToggle.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  els.controls.hidden = mode !== 'train';
  els.lineMode.hidden = mode !== 'train';
  els.lineList.hidden = mode !== 'train';
  els.review.hidden = mode !== 'review';

  if (mode === 'train') {
    resetLine();
  } else {
    populateLineSelect();
    reviewLine(state.opening.lines[0]);
  }
}

els.modeToggle.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-mode]');
  if (btn && btn.dataset.mode !== state.mode) setMode(btn.dataset.mode);
});

/* ---------- shared rendering ---------- */

function renderBoard({ animate = false } = {}) {
  const { game, opening, selected } = state;
  const flipped = opening.side === 'b';          // Black at the bottom when training Black
  const rows = game.board();                     // rows[0] is rank 8, rows[7] is rank 1
  const last = game.history({ verbose: true }).at(-1);
  const legal = selected ? game.moves({ square: selected, verbose: true }) : [];
  const inCheck = game.isCheck();
  const turn = game.turn();

  els.board.innerHTML = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const r = flipped ? 7 - row : row;
      const f = flipped ? 7 - col : col;
      const square = 'abcdefgh'[f] + (8 - r);

      const sq = document.createElement('div');
      sq.className = `sq ${(r + f) % 2 === 0 ? 'light' : 'dark'}`;
      sq.dataset.square = square;
      if (col === 0) sq.dataset.rankLabel = String(8 - r);
      if (row === 7) sq.dataset.fileLabel = 'abcdefgh'[f];

      const piece = rows[r][f];
      if (piece) {
        const img = document.createElement('img');
        img.className = 'piece';
        img.src = pieceSrc(piece);
        img.alt = '';
        img.draggable = false;
        sq.appendChild(img);
        if (inCheck && piece.type === 'k' && piece.color === turn) sq.classList.add('check');
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

  clearArrows();
  if (animate && last) slidePiece(last.from, last.to);
}

/** Slide the piece now standing on `to` in from `from` (FLIP animation). */
function slidePiece(from, to) {
  const fromEl = els.board.querySelector(`[data-square="${from}"]`);
  const toEl = els.board.querySelector(`[data-square="${to}"] .piece`);
  if (!fromEl || !toEl) return;
  const a = fromEl.getBoundingClientRect();
  const b = toEl.parentElement.getBoundingClientRect();
  toEl.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px)`;
  requestAnimationFrame(() => {
    toEl.classList.add('slide');
    toEl.style.transform = '';
    toEl.addEventListener('transitionend', () => { toEl.classList.remove('slide'); toEl.classList.add('land'); }, { once: true });
  });
}

/* ---------- arrows (hint) ---------- */

function squareCenter(square) {
  const flipped = state.opening.side === 'b';
  let x = 'abcdefgh'.indexOf(square[0]);
  let y = 8 - Number(square[1]);
  if (flipped) { x = 7 - x; y = 7 - y; }
  return { x: x + 0.5, y: y + 0.5 };
}

function drawArrow(from, to) {
  const a = squareCenter(from);
  const b = squareCenter(to);
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
  const k = (len - 0.35) / len;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
  line.setAttribute('x2', a.x + dx * k); line.setAttribute('y2', a.y + dy * k);
  els.arrows.appendChild(line);
}

function clearArrows() {
  els.arrows.querySelectorAll('line').forEach((l) => l.remove());
}

/** Show the expected move as an arrow (after repeated misses). */
function showHint() {
  const expected = state.line[state.ply];
  const move = state.game.moves({ verbose: true }).find((m) => m.san === expected);
  if (move) drawArrow(move.from, move.to);
}

function renderStreakChip() {
  const streak = prog.openings[state.opening?.id]?.streak ?? 0;
  els.streakChip.hidden = !(state.mode === 'train' && streak >= 3);
  els.streakChip.textContent = `🔥 ${streak}`;
}

/**
 * Move list under the board.
 * Training: only the moves played so far. Review: the whole line, future
 * moves dimmed, every move tappable. The line's note shows once the line
 * has left the trunk (or always in review).
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
      }).join(' ');

  const l = state.lineObj;
  const dev = l ? tree.deviation(state.opening, l) : null;
  const showNote = l && (review || (dev && state.ply > dev.ply) || l.draft);
  els.note.hidden = !showNote;
  els.note.textContent = showNote ? `${lineTitle(l)} — ${l.note ?? ''}` : '';
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

/** Lines not unticked in the list. */
function visibleLines(opening, lines) {
  const hidden = settings.hiddenLines?.[opening.id] ?? {};
  return lines.filter((l) => !hidden[l.id]);
}

/** The lines behind the current tab, before ticking. */
function tabLines(opening, mode = settings.lineMode) {
  if (mode === 'main') return tree.linesOfKind(opening, 'main');
  if (mode === 'side') return tree.linesOfKind(opening, 'side');
  const hits = loadGapReport()?.report?.[opening.id]?.lineHits ?? {};
  const mine = opening.lines.filter((l) => (hits[l.id] ?? 0) > 0).sort((a, b) => hits[b.id] - hits[a.id]);
  return mine.length ? mine : opening.lines;
}

/**
 * Choose the line for the next drill: among ticked lines of the current
 * tab, weighted by spaced repetition (new / due first), by how often your
 * opponents play it (My games tab), and by how often you got it wrong.
 */
function planLine() {
  const { opening } = state;
  const candidates = visibleLines(opening, tabLines(opening));
  if (candidates.length === 0) return opening.lines[0];
  const hits = loadGapReport()?.report?.[opening.id]?.lineHits ?? {};
  const mistakes = prog.openings[opening.id]?.mistakes ?? {};
  const missCount = (id) => Object.keys(mistakes).filter((k) => k.startsWith(id + '#')).reduce((n, k) => n + mistakes[k].count, 0);
  const weights = candidates.map((l) => {
    let w = progress.lineWeight(prog, opening.id, l.id);
    if (settings.lineMode === 'mine') w *= 1 + Math.log2(1 + (hits[l.id] ?? 0));
    return w * (1 + missCount(l.id));
  });
  return tree.pickWeighted(candidates, weights) ?? candidates[0];
}

function resetLine(lineObj = null) {
  state.session += 1;
  state.lineObj = lineObj ?? planLine();
  state.line = state.lineObj.moves;
  state.ply = 0;
  state.game.reset();
  state.selected = null;
  state.misses = 0;
  state.lineMistakes = 0;
  state.finished = false;
  els.restart.textContent = 'Restart line';

  renderBoard();
  renderMoves();
  renderLineMode();
  renderLineList();
  renderStreakChip();
  if (tree.isUserPly(state.opening, 0)) {
    setStatus('Your move');
  } else {
    setStatus('Opponent to move…');
    scheduleOpponent();
  }
}

function onSquareClick(square) {
  const { game, opening } = state;
  if (state.mode !== 'train' && state.mode !== 'weak') return;
  if (state.finished) return;
  if (state.mode === 'train' && !tree.isUserPly(opening, state.ply)) return;
  if (state.mode === 'weak' && game.turn() !== opening.side) return;

  const piece = game.get(square);
  const ownPiece = piece && piece.color === opening.side;

  if (!state.selected) {
    if (ownPiece) { state.selected = square; renderBoard(); }
    return;
  }
  if (square === state.selected) {
    state.selected = null; renderBoard(); return;
  }

  const legal = game.moves({ square: state.selected, verbose: true });
  const matched = legal.find((m) => m.to === square && (!m.promotion || m.promotion === 'q'));
  if (!matched) {
    state.selected = ownPiece ? square : null;
    renderBoard();
    return;
  }

  state.selected = null;
  if (state.mode === 'weak') attemptWeakMove(matched);
  else attemptUserMove(matched);
}

function attemptUserMove(move) {
  const expected = state.line[state.ply];
  const correct = move.san === expected;

  progress.recordAttempt(prog, state.opening.id, {
    correct, lineKey: state.lineObj.id, ply: state.ply, expected, played: move.san,
  });
  saveProg();

  if (!correct) {
    state.misses += 1;
    state.lineMistakes += 1;
    renderBoard();
    feedback.flash(els.board, [move.from, move.to], 'bad');
    feedback.play('bad');
    renderStreakChip();
    if (state.misses >= HINT_AFTER_MISSES) {
      showHint();
      setStatus(`Not the line — follow the arrow: ${expected}`, 'bad');
    } else {
      setStatus('Not the line — try again', 'bad');
    }
    return;
  }

  state.game.move(move.san);
  state.ply += 1;
  state.misses = 0;
  renderBoard({ animate: true });
  renderMoves();
  feedback.flash(els.board, [move.from, move.to], 'good');
  feedback.play('good');
  renderStreakChip();
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

  const san = state.line[state.ply];
  const dev = tree.deviation(opening, state.lineObj);
  const leftBook = dev && dev.ply === state.ply;
  state.game.move(san);
  state.ply += 1;
  renderBoard({ animate: true });
  renderMoves();

  if (state.ply >= state.line.length) { finishLine(); return; }
  if (leftBook) {
    const kind = state.lineObj.kind === 'side' ? 'punish it!' : 'a real variation — know your reply.';
    setStatus(`Opponent left the main line with ${san} — ${kind}`, 'warn');
  } else {
    setStatus('Your move');
  }
}

function finishLine() {
  state.finished = true;
  state.selected = null;
  renderBoard();
  feedback.play('complete');
  progress.recordLineComplete(prog, state.opening.id);
  const entry = progress.scheduleLine(prog, state.opening.id, state.lineObj.id, { perfect: state.lineMistakes === 0 });
  saveProg();
  const streak = prog.openings[state.opening.id].streak;
  renderStreakChip();
  renderLineList();
  const when = entry.interval >= 1 ? `again in ${Math.round(entry.interval)} day${Math.round(entry.interval) === 1 ? '' : 's'}` : 'again tomorrow';
  setStatus(`${state.lineMistakes === 0 ? 'Clean run! 🎉' : 'Line complete.'}  ·  streak ${streak}  ·  ${when}`, 'good');
  els.restart.textContent = 'Next line';
}

/* =================================================================
   LINE LIST — the tabs and the tickable lines under them
   ================================================================= */

function renderLineMode() {
  const { opening } = state;
  const counts = { main: tree.linesOfKind(opening, 'main').length, side: tree.linesOfKind(opening, 'side').length, mine: tabLines(opening, 'mine').length };
  els.lineMode.querySelectorAll('button').forEach((b) => {
    const mode = b.dataset.line;
    b.classList.toggle('active', mode === settings.lineMode);
    b.setAttribute('aria-checked', String(mode === settings.lineMode));
    const label = { main: 'Main lines', side: 'Side lines', mine: 'My games' }[mode];
    b.textContent = `${label} (${counts[mode]})`;
  });
}

function renderLineList() {
  const { opening } = state;
  const lines = tabLines(opening);
  const hidden = settings.hiddenLines?.[opening.id] ?? {};
  const hits = loadGapReport()?.report?.[opening.id]?.lineHits ?? {};
  const ticked = lines.filter((l) => !hidden[l.id]);
  const due = progress.dueCount(prog, opening.id, ticked.map((l) => l.id));

  els.lineListTitle.textContent = `${ticked.length} of ${lines.length} lines in rotation`;
  els.lineListMeta.textContent = due ? `${due} due` : 'all fresh';
  if (settings.lineMode === 'mine' && Object.keys(hits).length === 0) {
    els.lineRows.innerHTML = '<p class="hint" style="padding:6px">No scan yet — run the Chess.com scan on the home screen and this tab will hold exactly the lines your opponents play, most frequent first. Showing every line meanwhile.</p>';
  } else {
    els.lineRows.innerHTML = '';
  }

  els.lineRows.insertAdjacentHTML('beforeend', lines.map((l) => {
    const dev = tree.deviation(opening, l);
    const from = dev ? dev.ply : opening.signaturePlies;
    const tail = tree.formatMoves(l.moves).slice(from).map((m) => m.text).join(' ');
    const st = progress.lineStatus(prog, opening.id, l.id);
    const badges = [];
    if (l.kind === 'side') badges.push('<span class="badge side">punish</span>');
    if (hits[l.id]) badges.push(`<span class="badge">×${hits[l.id]}</span>`);
    if (st.state === 'new') badges.push('<span class="badge new">new</span>');
    else if (st.state === 'due') badges.push('<span class="badge due">due</span>');
    else badges.push(`<span class="badge ok">${-st.overdueDays}d</span>`);
    const playing = state.lineObj?.id === l.id;
    return `
      <label class="line-row${hidden[l.id] ? ' hidden-line' : ''}${playing ? ' playing' : ''}" data-line-id="${l.id}">
        <input type="checkbox" ${hidden[l.id] ? '' : 'checked'} data-toggle="${l.id}">
        <div>
          <div class="lr-name">${lineTitle(l)}</div>
          <div class="lr-moves">${tail}</div>
        </div>
        <div class="lr-badges">${badges.join('')}<button class="lr-play" data-play="${l.id}">▶</button></div>
      </label>`;
  }).join(''));
}

els.lineRows.addEventListener('click', (e) => {
  const play = e.target.closest('button[data-play]');
  if (play) {
    e.preventDefault();
    resetLine(tree.lineById(state.opening, play.dataset.play));
    return;
  }
  const box = e.target.closest('input[data-toggle]');
  if (box) {
    const hidden = { ...(settings.hiddenLines ?? {}) };
    hidden[state.opening.id] = { ...(hidden[state.opening.id] ?? {}) };
    if (box.checked) delete hidden[state.opening.id][box.dataset.toggle];
    else hidden[state.opening.id][box.dataset.toggle] = true;
    settings = updateSetting('hiddenLines', hidden);
    renderLineList();
  }
});

els.lineMode.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-line]');
  if (!btn || btn.dataset.line === settings.lineMode) return;
  settings = updateSetting('lineMode', btn.dataset.line);
  els.lineList.open = true;
  resetLine();
});

/* =================================================================
   REVIEW MODE — no quiz, no judgement, just look at the line.
   ================================================================= */

function populateLineSelect() {
  const { opening } = state;
  state.draft = null;
  engineRun += 1;
  els.engineBody.textContent = 'Pick a line above, then run the check. Stockfish looks at each of your moves and says where the line should stop.';
  els.engineMeta.textContent = '';
  els.engineJson.hidden = true;
  els.engineCopy.hidden = true;

  const group = (kind, label) => {
    const ls = tree.linesOfKind(opening, kind);
    return ls.length ? `<optgroup label="${label}">${ls.map((l) => `<option value="${l.id}">${lineTitle(l)}</option>`).join('')}</optgroup>` : '';
  };
  els.lineSelect.innerHTML = group('main', 'Main lines') + group('side', 'Side lines');
}

function reviewLine(lineObj) {
  state.session += 1;
  state.lineObj = lineObj;
  state.line = lineObj.moves;
  state.selected = null;
  state.finished = false;
  els.lineSelect.value = lineObj.id;
  stepTo(0);
}

function stepTo(ply) {
  const target = Math.max(0, Math.min(ply, state.line.length));
  state.game.reset();
  for (let i = 0; i < target; i++) state.game.move(state.line[i]);
  state.ply = target;

  renderBoard({ animate: target > 0 });
  renderMoves();
  renderReviewStatus();
  renderStreakChip();
  scheduleExplorer();
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
  reviewLine(v === 'draft' ? state.draft : tree.lineById(state.opening, v));
});
els.stepFirst.addEventListener('click', () => stepTo(0));
els.stepPrev.addEventListener('click', () => stepTo(state.ply - 1));
els.stepNext.addEventListener('click', () => stepTo(state.ply + 1));
els.stepLast.addEventListener('click', () => stepTo(state.line.length));

document.addEventListener('keydown', (e) => {
  if (state.mode !== 'review' || els.review.hidden) return;
  if (e.key === 'ArrowRight') stepTo(state.ply + 1);
  if (e.key === 'ArrowLeft') stepTo(state.ply - 1);
});

/* ---------- masters database (Lichess explorer) ---------- */

let explorerTimer = null;
let explorerRequest = 0;

function scheduleExplorer() {
  clearTimeout(explorerTimer);
  explorerTimer = setTimeout(loadExplorer, 250);
}

async function loadExplorer() {
  const requestId = ++explorerRequest;
  els.explorerMeta.textContent = '';
  if (!settings.lichessToken) {
    els.explorerBody.innerHTML = 'Add a Lichess API token in Settings (home screen) to see what masters play here.';
    return;
  }
  els.explorerBody.textContent = 'Loading…';
  const played = state.line.slice(0, state.ply);
  const bookMove = state.line[state.ply];
  try {
    const data = await fetchExplorer(played, { token: settings.lichessToken, moves: 6 });
    if (requestId !== explorerRequest) return;
    renderExplorer(data, bookMove);
  } catch (err) {
    if (requestId !== explorerRequest) return;
    els.explorerBody.innerHTML = `<span class="bad">${err.message}</span>`;
  }
}

function renderExplorer(data, bookMove) {
  const meta = [data.opening?.name, data.total ? `${data.total.toLocaleString()} games` : null].filter(Boolean);
  els.explorerMeta.textContent = meta.join(' · ');
  if (data.moves.length === 0) { els.explorerBody.textContent = 'No master games from this position.'; return; }
  els.explorerBody.innerHTML = data.moves.map((m) => `
    <div class="ex-row">
      <span class="ex-san">${m.san}${m.san === bookMove ? '<span class="ex-book">★ book</span>' : ''}</span>
      <span class="ex-games">${m.games.toLocaleString()} games · ${m.sharePct}% · W ${m.whitePct} / D ${m.drawPct} / B ${m.blackPct}</span>
      <div class="ex-bar" title="White ${m.whitePct}% · Draw ${m.drawPct}% · Black ${m.blackPct}%">
        <i class="w" style="width:${m.whitePct}%"></i><i class="d" style="width:${m.drawPct}%"></i><i class="b" style="width:${m.blackPct}%"></i>
      </div>
    </div>`).join('');
}

/* ---------- engine check (Stockfish) ---------- */

let engine = null;
let engineRun = 0;

function fmtCp(cp, mate, side) {
  const sign = side === 'w' ? 1 : -1;
  if (mate !== null && mate !== undefined) return `M${mate * sign}`;
  if (cp === null || cp === undefined) return '?';
  const v = (cp * sign) / 100;
  return (v > 0 ? '+' : '') + v.toFixed(2);
}

async function runEngineCheck() {
  const run = ++engineRun;
  const { opening, lineObj } = state;
  els.engineCopy.hidden = true;
  els.engineJson.hidden = true;
  els.engineCheck.disabled = true;
  els.engineMeta.textContent = 'starting…';
  els.engineBody.innerHTML = '';

  try {
    engine ??= new Engine();
    await engine.start();
    if (run !== engineRun) return;

    const dev = tree.deviation(opening, lineObj);
    if (!dev) {
      els.engineMeta.textContent = 'main line';
      for (let ply = 0; ply < state.line.length; ply++) {
        if (!tree.isUserPly(opening, ply)) continue;
        const r = await engine.evaluate(state.line.slice(0, ply + 1));
        if (run !== engineRun) return;
        appendEvalRow({ ply, san: state.line[ply], cp: r.cp, mate: r.mate, bestMove: r.bestMove });
      }
      els.engineBody.insertAdjacentHTML('beforeend', '<div class="ev-verdict">Main line evaluated. Anything below −0.5 is worth a second look.</div>');
      return;
    }

    els.engineMeta.textContent = lineObj.draft ? 'building draft…' : 'checking line…';
    // branchBuilder thinks in "main line + deviation"; give it the trunk.
    const shim = { side: opening.side, mainLine: tree.mainLine(opening) };
    const result = await buildBranch({
      opening: shim,
      deviationPly: dev.ply,
      opponentMove: dev.move,
      seedResponse: lineObj.moves.slice(dev.ply + 1),
      evaluate: (sans, opts) => engine.evaluate(sans, opts),
      onStep: (step) => { if (run === engineRun) appendEvalRow(step); },
    });
    if (run !== engineRun) return;

    const v = result.verdict;
    els.engineMeta.textContent = v.type;
    els.engineBody.insertAdjacentHTML('beforeend',
      `<div class="ev-verdict ${v.type === 'discard' ? 'discard' : ''}">${verdictText(v, result, dev)}</div>`);

    const changed = JSON.stringify(result.response) !== JSON.stringify(lineObj.moves.slice(dev.ply + 1));
    if (changed || lineObj.draft) {
      els.engineJson.textContent = toBranchJSON({ deviationPly: dev.ply, opponentMove: dev.move, response: result.response, verdict: v });
      els.engineJson.hidden = false;
      els.engineCopy.hidden = false;
      state.line = [...lineObj.moves.slice(0, dev.ply + 1), ...result.response];
      renderMoves();
      renderReviewStatus();
    }
  } catch (err) {
    if (run === engineRun) els.engineBody.innerHTML = `<span class="bad">${err.message}</span>`;
  } finally {
    if (run === engineRun) els.engineCheck.disabled = false;
  }
}

function appendEvalRow(step) {
  const side = state.opening.side;
  const userCp = (step.cp ?? 0) * (side === 'w' ? 1 : -1);
  const cls = step.mate ? 'ev-good' : userCp >= 50 ? 'ev-good' : userCp <= -50 ? 'ev-bad' : '';
  els.engineBody.insertAdjacentHTML('beforeend', `
    <div class="ev-row">
      <span class="ev-san">${tree.moveLabel(step.ply, step.san)}${step.fromSeed === false ? ' <span class="dim">(engine)</span>' : ''}</span>
      <span class="ev-cp ${cls}">${fmtCp(step.cp, step.mate, side)}</span>
      <span class="ev-best">${step.bestMove ? `then ${step.bestMove}` : ''}</span>
    </div>`);
}

function verdictText(v, result, dev) {
  const stop = v.cutAt === null ? '' : ` Stop after ${tree.moveLabel(v.cutAt, result.response[v.cutAt - dev.ply - 1])}.`;
  switch (v.type) {
    case 'tactical': return `Forced win — ${v.reason}.${stop}`;
    case 'punishment': return `Clear edge — ${v.reason}.${stop}`;
    case 'discard': return `No punishment here — the opponent's move is sound (${v.reason}). A "know the reply" line, nothing to extend.`;
    default: return `Undecided: ${v.reason}.`;
  }
}

els.engineCheck.addEventListener('click', runEngineCheck);
els.engineCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(els.engineJson.textContent);
    els.engineCopy.textContent = 'Copied ✓';
    setTimeout(() => { els.engineCopy.textContent = 'Copy branch JSON'; }, 1500);
  } catch {
    els.engineJson.focus();
  }
});

/* =================================================================
   HOME PANELS — progress, Chess.com gaps, weaknesses, settings
   ================================================================= */

function renderProgress() {
  els.progressCards.innerHTML = OPENINGS.map((o) => {
    const s = prog.openings[o.id];
    const acc = progress.accuracy(s);
    const spots = progress.weakSpots(prog, o.id, 3);
    let weak;
    if (!s || s.attempts === 0) weak = 'Not trained yet.';
    else if (spots.length === 0) weak = 'No mistakes so far. 👌';
    else {
      weak = '<b>Weak spots:</b> ' + spots.map((w) => {
        const l = tree.lineById(o, w.lineKey);
        return `${tree.moveLabel(w.ply, w.expected)} <span class="dim">(${l ? lineTitle(l) : w.lineKey}, missed ${w.count}×)</span>`;
      }).join(' · ');
    }
    return `
      <div class="stat-card">
        <h3>${o.name}</h3>
        <div class="stat-row">
          <div class="stat"><b>${acc === null ? '–' : acc + '%'}</b><span>accuracy</span></div>
          <div class="stat"><b>${s?.streak ?? 0}</b><span>streak</span></div>
          <div class="stat"><b>${s?.bestStreak ?? 0}</b><span>best</span></div>
          <div class="stat"><b>${s?.linesCompleted ?? 0}</b><span>lines</span></div>
        </div>
        <p class="weak">${weak}</p>
      </div>`;
  }).join('');
}

/* ---------- Chess.com gap report ---------- */

const GAPS_KEY = 'openingTrainer.gaps.v1';
const SCAN_MONTHS = 6;

function loadGapReport() {
  try { return JSON.parse(localStorage.getItem(GAPS_KEY)); } catch { return null; }
}

function showScanMsg(text, kind = 'neutral') {
  els.scanMsg.textContent = text;
  els.scanMsg.style.color = kind === 'bad' ? 'var(--bad)' : kind === 'good' ? 'var(--good)' : '';
}

els.scanBtn.addEventListener('click', async () => {
  const username = els.chesscomUser.value.trim();
  if (!username) { showScanMsg('Enter your Chess.com username first.', 'bad'); return; }
  settings = updateSetting('chesscomUser', username);
  els.scanBtn.disabled = true;
  try {
    const games = await importGames(username, {
      months: SCAN_MONTHS,
      onProgress: (done, total) => showScanMsg(`Loading month ${done} of ${total}…`),
    });
    const report = analyseGames(games, username, OPENINGS);
    const saved = { scannedAt: new Date().toISOString(), username, months: SCAN_MONTHS, gamesScanned: games.length, report };
    localStorage.setItem(GAPS_KEY, JSON.stringify(saved));
    renderGapReport(saved);
    renderHome();
    showScanMsg(`Scanned ${games.length} games from the last ${SCAN_MONTHS} months.`, 'good');
  } catch (err) {
    showScanMsg(err.message, 'bad');
  } finally {
    els.scanBtn.disabled = false;
  }
});

function renderGapReport(saved) {
  if (!saved) { els.gapReport.innerHTML = ''; return; }
  const when = saved.scannedAt.slice(0, 10);
  els.gapReport.innerHTML = OPENINGS.map((o) => {
    const r = saved.report[o.id];
    if (!r) return '';
    let body;
    if (r.games === 0) {
      body = `<p class="hint">No games with this opening as ${o.side === 'w' ? 'White' : 'Black'}.</p>`;
    } else {
      const hitList = Object.entries(r.lineHits ?? {})
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([id, n]) => { const l = tree.lineById(o, id); return `${l ? lineTitle(l) : id} ×${n}`; }).join(', ');
      const summary = [`complete lines: ${r.complete}`, `you left the book: ${r.userLeft}`, hitList ? `lines met: ${hitList}` : null].filter(Boolean).join(' · ');
      const gaps = r.gaps.length === 0
        ? '<p class="hint">No gaps — every opponent move was covered. 👌</p>'
        : `<ul class="gaps">${r.gaps.map((g) => `
            <li><b>${tree.moveLabel(g.ply, g.move)}</b> after ${tree.formatMoves(g.prefix).map((m) => m.text).join(' ')}
              <span class="dim">· ${g.count} game${g.count === 1 ? '' : 's'}</span>${g.urls[0] ? `<a href="${g.urls[0]}" target="_blank" rel="noopener">view ↗</a>` : ''}
              <button data-build="${o.id}|${g.ply}|${g.move}">Build</button></li>`).join('')}
          </ul>`;
      body = `<p class="hint">${summary}</p>${gaps}`;
    }
    return `<div class="gap-opening"><h3>${o.name} <span class="dim">· ${r.games} game${r.games === 1 ? '' : 's'}</span></h3>${body}</div>`;
  }).join('') + `<p class="hint">Last scan: ${when} for ${saved.username}.</p>`;
}

// "Build" on a gap: open review mode with a draft line and let the engine fill it.
els.gapReport.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-build]');
  if (!btn) return;
  const [id, ply, move] = btn.dataset.build.split('|');
  openTrainer(id, 'review');
  const opening = state.opening;
  const trunk = tree.mainLine(opening);
  const gap = loadGapReport()?.report?.[id]?.gaps.find((g) => g.ply === Number(ply) && g.move === move);
  const prefix = gap ? gap.prefix : trunk.slice(0, Number(ply));
  const draft = { id: 'draft', name: 'Draft', kind: 'side', moves: [...prefix, move], deviatesAt: Number(ply), draft: true,
    note: 'Not in the repertoire yet. The engine check below fills in the line.' };
  els.lineSelect.insertAdjacentHTML('beforeend', `<option value="draft" selected>Draft: ${lineTitle(draft)}</option>`);
  state.draft = draft;
  reviewLine(draft);
  runEngineCheck();
});

/* ---------- weaknesses (engine analysis of your games) ---------- */

const WEAK_KEY = 'openingTrainer.weaknesses.v1';
const WEAK_MAX_GAMES = 60;
let analyseStopFlag = false;

function loadWeakReport() {
  try { return JSON.parse(localStorage.getItem(WEAK_KEY)); } catch { return null; }
}

function showWeakMsg(text, kind = 'neutral') {
  els.weakMsg.textContent = text;
  els.weakMsg.style.color = kind === 'bad' ? 'var(--bad)' : kind === 'good' ? 'var(--good)' : '';
}

els.analyseBtn.addEventListener('click', async () => {
  const username = (els.chesscomUser.value || settings.chesscomUser).trim();
  if (!username) { showWeakMsg('Enter your Chess.com username in the Gaps panel first.', 'bad'); return; }
  analyseStopFlag = false;
  els.analyseBtn.disabled = true;
  els.analyseStop.hidden = false;
  try {
    showWeakMsg('Downloading games…');
    const raw = await importGames(username, { months: 6, onProgress: (d, t) => showWeakMsg(`Downloading month ${d} of ${t}…`) });
    const games = [];
    for (const g of raw.slice().reverse()) {
      const side = userSide(g, username);
      if (!side) continue;
      const sans = parseMoves(g.pgn);
      const opening = OPENINGS.find((o) => matchesOpening(sans, side, o));
      if (opening) games.push({ sans, side, url: g.url, openingId: opening.id });
      if (games.length >= WEAK_MAX_GAMES) break;
    }
    if (games.length === 0) { showWeakMsg('No games in these openings found.', 'bad'); return; }
    engine ??= new Engine();
    await engine.start();
    const t0 = Date.now();
    const list = await weakness.analyseGames(games, (s, o) => engine.evaluate(s, o), {
      depth: 12,
      shouldStop: () => analyseStopFlag,
      onProgress: (d, t) => showWeakMsg(`Analysing game ${d} of ${t}… (${Math.round((Date.now() - t0) / 1000)} s)`),
    });
    const saved = { analysedAt: new Date().toISOString(), username, games: games.length, weaknesses: list, stopped: analyseStopFlag };
    localStorage.setItem(WEAK_KEY, JSON.stringify(saved));
    renderWeakReport(saved);
    showWeakMsg(`${list.length} weak positions found in ${games.length} games${analyseStopFlag ? ' (stopped early)' : ''}.`, 'good');
  } catch (err) {
    showWeakMsg(err.message, 'bad');
  } finally {
    els.analyseBtn.disabled = false;
    els.analyseStop.hidden = true;
  }
});
els.analyseStop.addEventListener('click', () => { analyseStopFlag = true; showWeakMsg('Stopping after this game…'); });

function renderWeakReport(saved) {
  els.trainWeak.hidden = !(saved?.weaknesses?.length);
  if (!saved) { els.weakReport.innerHTML = ''; return; }
  const top = saved.weaknesses.slice(0, 8);
  els.weakReport.innerHTML = top.length === 0
    ? '<p class="hint">No pawn-sized mistakes in the opening phase. Nice.</p>'
    : `<ul class="weak-list">${top.map((w) => {
        const o = OPENINGS.find((x) => x.id === w.openingId);
        const played = Object.entries(w.played).sort((a, b) => b[1] - a[1]).map(([san, n]) => `${san}${n > 1 ? `×${n}` : ''}`).join(', ');
        return `<li><b>${tree.moveLabel(w.ply, w.best)}</b> not ${played} <span class="dim">· ${o?.name ?? ''}</span>
          <span class="drop">−${(w.avgDrop / 100).toFixed(1)}</span> <span class="dim">× ${w.count}</span>${w.urls[0] ? `<a href="${w.urls[0]}" target="_blank" rel="noopener">view ↗</a>` : ''}</li>`;
      }).join('')}</ul><p class="hint">Analysed ${saved.games} games on ${saved.analysedAt.slice(0, 10)}. Ranked by how often × how much it cost.</p>`;
}

/* ---------- weak-spot drill ---------- */

function openWeakDrill() {
  const saved = loadWeakReport();
  if (!saved?.weaknesses?.length) return;
  state.weak = { list: saved.weaknesses, index: 0 };
  state.opening = { id: 'weaknesses', name: 'Weak spots', side: 'w', signaturePlies: 0, lines: [] };
  state.mode = 'weak';
  els.name.textContent = 'Weak spots';
  els.modeToggle.hidden = true;
  els.lineMode.hidden = true;
  els.lineList.hidden = true;
  els.review.hidden = true;
  els.controls.hidden = false;
  els.restart.textContent = 'Skip';
  showScreen('trainer');
  loadWeakPosition();
}

function loadWeakPosition() {
  const { list, index } = state.weak;
  const item = list[index % list.length];
  state.weak.item = item;
  state.opening.side = item.side;
  els.side.textContent = item.side === 'w' ? 'White' : 'Black';
  els.side.className = `pill ${item.side}`;
  state.session += 1;
  state.lineObj = null;
  state.line = [item.best];
  state.ply = 0;
  state.game.load(item.fen);
  state.selected = null;
  state.misses = 0;
  state.finished = false;

  renderBoard();
  const o = OPENINGS.find((x) => x.id === item.openingId);
  const played = Object.entries(item.played).sort((a, b) => b[1] - a[1])[0][0];
  els.moves.innerHTML = `<span class="mv">${index % list.length + 1} / ${list.length} · ${o?.name ?? ''} · move ${Math.floor(item.ply / 2) + 1}</span>`;
  els.note.hidden = false;
  els.note.textContent = `You played ${played} here ${item.count > 1 ? `${item.count} times` : 'once'} and lost about ${(item.avgDrop / 100).toFixed(1)} pawns. Find the better move.`;
  setStatus('Your move — what is best here?');
  renderStreakChip();
}

function attemptWeakMove(move) {
  const item = state.weak.item;
  const correct = move.san === item.best;
  progress.recordAttempt(prog, 'weaknesses', { correct, lineKey: item.fen, ply: item.ply, expected: item.best, played: move.san });
  saveProg();
  if (!correct) {
    state.misses += 1;
    renderBoard();
    feedback.flash(els.board, [move.from, move.to], 'bad');
    feedback.play('bad');
    if (state.misses >= HINT_AFTER_MISSES) { showHint(); setStatus(`Not it — follow the arrow: ${item.best}`, 'bad'); }
    else setStatus(move.san === Object.keys(item.played)[0] ? 'That is the move you played in the game — there is better.' : 'Not it — try again', 'bad');
    return;
  }
  state.game.move(move.san);
  state.finished = true;
  renderBoard({ animate: true });
  feedback.flash(els.board, [move.from, move.to], 'good');
  feedback.play('good');
  setStatus(`Correct ✓  ${item.best} — worth about ${(item.avgDrop / 100).toFixed(1)} pawns`, 'good');
  const session = state.session;
  setTimeout(() => { if (session === state.session) { state.weak.index += 1; loadWeakPosition(); } }, 1400);
}

els.trainWeak.addEventListener('click', openWeakDrill);

/* ---------- settings panel ---------- */

function renderSettingsPanel() {
  els.tokenInput.value = settings.lichessToken;
  els.chesscomUser.value = settings.chesscomUser;
}

els.tokenInput.addEventListener('change', () => {
  settings = updateSetting('lichessToken', els.tokenInput.value.trim());
  showSettingsMsg(settings.lichessToken ? 'Lichess token saved.' : 'Lichess token removed.');
});

function showSettingsMsg(text, kind = 'neutral') {
  els.settingsMsg.textContent = text;
  els.settingsMsg.style.color = kind === 'bad' ? 'var(--bad)' : kind === 'good' ? 'var(--good)' : '';
}

els.exportBtn.addEventListener('click', () => {
  const blob = new Blob([progress.exportJSON(prog)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `opening-trainer-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showSettingsMsg('Progress exported.', 'good');
});

els.importBtn.addEventListener('click', () => els.importFile.click());
els.importFile.addEventListener('change', async () => {
  const file = els.importFile.files[0];
  if (!file) return;
  try {
    prog = progress.importJSON(await file.text());
    saveProg();
    renderProgress();
    renderHome();
    showSettingsMsg(`Imported ${file.name}.`, 'good');
  } catch (err) {
    showSettingsMsg(err.message, 'bad');
  }
  els.importFile.value = '';
});

els.resetBtn.addEventListener('click', () => {
  if (!confirm('Delete all progress (accuracy, streaks, weak spots, schedule)? Export first if you want a backup.')) return;
  prog = progress.resetProgress();
  renderProgress();
  renderHome();
  showSettingsMsg('Progress reset.');
});

/* ---------- wiring ---------- */

function renderSoundToggle() {
  els.soundToggle.textContent = settings.sound ? '🔊' : '🔇';
  els.soundToggle.classList.toggle('off', !settings.sound);
}
els.soundToggle.addEventListener('click', () => {
  settings = updateSetting('sound', !settings.sound);
  feedback.setSoundEnabled(settings.sound);
  renderSoundToggle();
  if (settings.sound) feedback.play('good');
});
renderSoundToggle();

els.restart.addEventListener('click', () => {
  if (state.mode === 'weak') { state.weak.index += 1; loadWeakPosition(); }
  else resetLine();
});
els.back.addEventListener('click', () => {
  state.session += 1;
  renderProgress();
  renderHome();
  showScreen('home');
});

renderHome();
renderProgress();
renderSettingsPanel();
renderGapReport(loadGapReport());
renderWeakReport(loadWeakReport());
showScreen('home');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => { /* fine without it */ });
}
