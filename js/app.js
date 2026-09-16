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
import * as feedback from './feedback.js';
import * as progress from './progress.js';
import { fetchExplorer } from './explorer.js';
import { importGames, analyseGames } from './chesscom.js';
import { Engine } from './engine.js';
import { buildBranch, toBranchJSON } from './branchBuilder.js';
import { loadSettings, updateSetting } from './settings.js';

const OPPONENT_DELAY_MS = 500;

// User preferences (sound on/off, how often the opponent leaves the book…).
let settings = loadSettings();
feedback.setSoundEnabled(settings.sound);

// Accuracy / streaks / weak spots, saved after every training move.
let prog = progress.loadProgress();
function saveProg() { progress.saveProgress(prog); }

// Piece images: vendor/pieces/wN.svg etc. (cburnett set, see its LICENSE.md).
const pieceSrc = (piece) => `vendor/pieces/${piece.color}${piece.type.toUpperCase()}.svg`;
// After this many wrong tries on one move, an arrow shows the answer.
const HINT_AFTER_MISSES = 2;

const $ = (sel) => document.querySelector(sel);
const els = {
  cards: $('#opening-cards'),
  progressCards: $('#progress-cards'),
  lineMode: $('#line-mode'),
  exportBtn: $('#export-progress'),
  importBtn: $('#import-progress'),
  importFile: $('#import-file'),
  resetBtn: $('#reset-progress'),
  settingsMsg: $('#settings-msg'),
  tokenInput: $('#lichess-token'),
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
  mode: 'train',        // 'train' (quiz) or 'review' (browse)
  line: [],             // the SAN list on screen (main line or a branch)
  branch: null,         // the branch in play, if any
  planned: null,        // training: the branch the opponent WILL steer into (chosen at line start)
  ply: 0,               // how many plies of `line` are on the board
  game: new Chess(),    // the rules engine holding the real position
  selected: null,       // square the user tapped first, e.g. "e2"
  misses: 0,            // wrong tries on the current move (drives the hint arrow)
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
      <article class="card ${o.side}">
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

/* ---------- home: progress panel ---------- */

/** "main line" or "after 3...Nxd4" from a progress line key like "b5:Nxd4". */
function describeLineKey(key) {
  if (key === 'main') return 'main line';
  const [, ply, san] = key.match(/^b(\d+):(.+)$/) ?? [];
  return ply ? `after ${tree.moveLabel(Number(ply), san)}` : key;
}

function renderProgress() {
  els.progressCards.innerHTML = OPENINGS.map((o) => {
    const s = prog.openings[o.id];
    const acc = progress.accuracy(s);
    const spots = progress.weakSpots(prog, o.id, 3);

    let weak;
    if (!s || s.attempts === 0) weak = 'Not trained yet.';
    else if (spots.length === 0) weak = 'No mistakes so far. 👌';
    else {
      weak = '<b>Weak spots:</b> ' + spots.map((w) =>
        `${tree.moveLabel(w.ply, w.expected)} <span class="dim">(${describeLineKey(w.lineKey)}, missed ${w.count}×)</span>`,
      ).join(' · ');
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

/* ---------- home: Chess.com gap report ---------- */

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
      const hits = Object.entries(r.branchHits)
        .map(([k, n]) => { const [ply, san] = k.split(':'); return `${tree.moveLabel(Number(ply), san)} ×${n}`; })
        .join(', ');
      const summary = [
        `complete lines: ${r.complete}`,
        `you left the book: ${r.userLeft}`,
        hits ? `branches met: ${hits}` : null,
      ].filter(Boolean).join(' · ');

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

// "Build" on a gap: open review mode with a draft branch and let the engine fill it.
els.gapReport.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-build]');
  if (!btn) return;
  const [id, ply, move] = btn.dataset.build.split('|');
  openTrainer(id, 'review');
  const draft = { deviatesAt: Number(ply), opponentMove: move, response: [], type: 'punishment', note: 'Draft — not in the repertoire yet. Run the engine check to fill it in.', draft: true };
  els.lineSelect.insertAdjacentHTML('beforeend', `<option value="draft" selected>Draft: ${tree.describeBranch(draft)}</option>`);
  state.draft = draft;
  reviewLine(draft);
  runEngineCheck();
});

/* ---------- home: settings panel ---------- */

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
    showSettingsMsg(`Imported ${file.name}.`, 'good');
  } catch (err) {
    showSettingsMsg(err.message, 'bad');
  }
  els.importFile.value = '';
});

els.resetBtn.addEventListener('click', () => {
  if (!confirm('Delete all progress (accuracy, streaks, weak spots)? Export first if you want a backup.')) return;
  prog = progress.resetProgress();
  renderProgress();
  showSettingsMsg('Progress reset.');
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
  els.lineMode.hidden = mode !== 'train';
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

/**
 * Redraw the whole board from the engine state. `animateFrom` (a square)
 * makes the piece that just arrived on `last.to` slide in from there.
 */
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
      // When flipped, walk the board from the other corner.
      const r = flipped ? 7 - row : row;
      const f = flipped ? 7 - col : col;
      const square = 'abcdefgh'[f] + (8 - r);

      const sq = document.createElement('div');
      sq.className = `sq ${(r + f) % 2 === 0 ? 'light' : 'dark'}`;
      sq.dataset.square = square;
      if (col === 0) sq.dataset.rankLabel = String(8 - r);       // left edge
      if (row === 7) sq.dataset.fileLabel = 'abcdefgh'[f];       // bottom edge

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
  // Shorten so the head sits inside the target square.
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
  state.planned = planBranch();
  state.ply = 0;
  state.game.reset();
  state.selected = null;
  state.misses = 0;
  state.finished = false;
  els.restart.textContent = 'Restart line';

  renderBoard();
  renderMoves();
  renderLineMode();
  renderStreakChip();
  setStatus(tree.isUserPly(state.opening, 0) ? 'Your move' : 'Opponent to move…');
  scheduleOpponent();
}

/* ---------- which line the opponent steers into ---------- */

/**
 * Chosen once per drill so the deviation can happen anywhere in the line.
 *   main – never leave the book.
 *   all  – every side line and the main line are equally likely…
 *   mine – …weighted by how often YOUR opponents actually played each one
 *          (from the last Chess.com scan), so frequent surprises come up more.
 * In both random modes a line you keep getting wrong is picked more often.
 */
function planBranch() {
  const { opening } = state;
  if (settings.lineMode === 'main' || opening.branches.length === 0) return null;

  const hits = loadGapReport()?.report?.[opening.id]?.branchHits ?? {};
  const mistakes = prog.openings[opening.id]?.mistakes ?? {};
  const missCount = (key) => Object.keys(mistakes).filter((k) => k.startsWith(key + '#')).reduce((n, k) => n + mistakes[k].count, 0);

  const items = [null, ...opening.branches];
  const weights = items.map((b) => {
    let w = 1;
    if (settings.lineMode === 'mine') {
      w = b ? (hits[`${b.deviatesAt}:${b.opponentMove}`] ?? 0) : 1;
    }
    return w > 0 ? w * (1 + missCount(tree.lineKey(b))) : 0;
  });
  if (settings.lineMode === 'mine' && weights.slice(1).every((w) => w === 0)) {
    setTimeout(() => setStatus('No scan data yet — run the Chess.com scan on the home screen. Using all side lines.', 'warn'), 0);
    return tree.pickWeighted(items, items.map(() => 1));
  }
  return tree.pickWeighted(items, weights);
}

function renderLineMode() {
  els.lineMode.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.line === settings.lineMode);
    b.setAttribute('aria-checked', String(b.dataset.line === settings.lineMode));
  });
}

els.lineMode.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-line]');
  if (!btn || btn.dataset.line === settings.lineMode) return;
  settings = updateSetting('lineMode', btn.dataset.line);
  resetLine();
});

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
  const correct = move.san === expected;

  progress.recordAttempt(prog, state.opening.id, {
    correct,
    lineKey: tree.lineKey(state.branch),
    ply: state.ply,
    expected,
    played: move.san,
  });
  saveProg();

  if (!correct) {
    state.misses += 1;
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

  // Leave the book at the planned ply (see planBranch).
  let leftBook = false;
  if (!state.branch && state.planned && state.planned.deviatesAt === state.ply) {
    state.branch = state.planned;
    state.line = tree.buildLine(opening, state.planned);
    leftBook = true;
  }

  const san = state.line[state.ply];
  state.game.move(san);
  state.ply += 1;
  renderBoard({ animate: true });
  renderMoves();

  if (state.ply >= state.line.length) { finishLine(); return; }
  if (leftBook) setStatus(`Opponent left the book with ${san} — punish it!`, 'warn');
  else setStatus('Your move');
}

function finishLine() {
  state.finished = true;
  state.selected = null;
  renderBoard();
  feedback.play('complete');
  progress.recordLineComplete(prog, state.opening.id);
  saveProg();
  const streak = prog.openings[state.opening.id].streak;
  renderStreakChip();
  setStatus(`${state.branch ? 'Branch' : 'Line'} complete! 🎉  ·  streak ${streak}`, 'good');
  els.restart.textContent = 'Next line';
}

/* =================================================================
   REVIEW MODE — no quiz, no judgement, just look at the line.
   ================================================================= */

function populateLineSelect() {
  const { opening } = state;
  state.draft = null;
  engineRun += 1; // abandon any engine run from the previous opening
  els.engineBody.textContent = 'Pick a branch above, then run the check. Stockfish looks at each of your moves and says where the line should stop.';
  els.engineMeta.textContent = '';
  els.engineJson.hidden = true;
  els.engineCopy.hidden = true;
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

  renderBoard({ animate: target > 0 });
  renderMoves();
  renderReviewStatus();
  renderStreakChip();
  scheduleExplorer();
}

/* ---------- masters database (Lichess explorer) ---------- */

let explorerTimer = null;
let explorerRequest = 0;

/** Wait a beat after the last step so tapping ▶ quickly does not fire a
 *  request per tap. */
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
  const bookMove = state.line[state.ply]; // the move our repertoire wants next, if any

  try {
    const data = await fetchExplorer(played, { token: settings.lichessToken, moves: 6 });
    if (requestId !== explorerRequest) return; // user has stepped on since
    renderExplorer(data, bookMove);
  } catch (err) {
    if (requestId !== explorerRequest) return;
    els.explorerBody.innerHTML = `<span class="bad">${err.message}</span>`;
  }
}

function renderExplorer(data, bookMove) {
  const meta = [data.opening?.name, data.total ? `${data.total.toLocaleString()} games` : null].filter(Boolean);
  els.explorerMeta.textContent = meta.join(' · ');

  if (data.moves.length === 0) {
    els.explorerBody.textContent = 'No master games from this position.';
    return;
  }
  els.explorerBody.innerHTML = data.moves.map((m) => `
    <div class="ex-row">
      <span class="ex-san">${m.san}${m.san === bookMove ? '<span class="ex-book">★ book</span>' : ''}</span>
      <span class="ex-games">${m.games.toLocaleString()} games · ${m.sharePct}% · W ${m.whitePct} / D ${m.drawPct} / B ${m.blackPct}</span>
      <div class="ex-bar" title="White ${m.whitePct}% · Draw ${m.drawPct}% · Black ${m.blackPct}%">
        <i class="w" style="width:${m.whitePct}%"></i><i class="d" style="width:${m.drawPct}%"></i><i class="b" style="width:${m.blackPct}%"></i>
      </div>
    </div>`).join('');
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
  reviewLine(v === '' ? null : v === 'draft' ? state.draft : state.opening.branches[Number(v)]);
});

/* ---------- engine check (Stockfish) ---------- */

let engine = null;              // created on first use — 7 MB download, so not at page load
let engineRun = 0;              // bumps on every run so a stale run stops painting

function fmtCp(cp, mate, side) {
  // Shown from the user's point of view: + is good for you.
  const sign = side === 'w' ? 1 : -1;
  if (mate !== null && mate !== undefined) return `M${mate * sign}`;
  if (cp === null || cp === undefined) return '?';
  const v = (cp * sign) / 100;
  return (v > 0 ? '+' : '') + v.toFixed(2);
}

async function runEngineCheck() {
  const run = ++engineRun;
  const { opening, branch } = state;
  els.engineCopy.hidden = true;
  els.engineJson.hidden = true;
  els.engineCheck.disabled = true;
  els.engineMeta.textContent = 'starting…';
  els.engineBody.innerHTML = '';

  try {
    engine ??= new Engine();
    await engine.start();
    if (run !== engineRun) return;

    if (!branch) {
      // Main line: no cutoff rule, just show the eval after each of your moves.
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

    els.engineMeta.textContent = branch.draft ? 'building draft…' : 'checking branch…';
    const result = await buildBranch({
      opening,
      deviationPly: branch.deviatesAt,
      opponentMove: branch.opponentMove,
      seedResponse: branch.response,
      evaluate: (sans, opts) => engine.evaluate(sans, opts),
      onStep: (step) => { if (run === engineRun) appendEvalRow(step); },
    });
    if (run !== engineRun) return;

    const v = result.verdict;
    els.engineMeta.textContent = v.type;
    els.engineBody.insertAdjacentHTML('beforeend',
      `<div class="ev-verdict ${v.type === 'discard' ? 'discard' : ''}">${verdictText(v, result, branch)}</div>`);

    // Offer the paste-ready branch when the engine has something to say.
    const changed = JSON.stringify(result.response) !== JSON.stringify(branch.response);
    if (v.cutAt !== null && (changed || branch.draft)) {
      els.engineJson.textContent = toBranchJSON({ deviationPly: branch.deviatesAt, opponentMove: branch.opponentMove, response: result.response, verdict: v });
      els.engineJson.hidden = false;
      els.engineCopy.hidden = false;
      // Show the engine's line on the board so it can be stepped through.
      state.line = tree.buildLine(opening, { ...branch, response: result.response });
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

function verdictText(v, result, branch) {
  const stop = v.cutAt === null ? '' : ` Stop after ${tree.moveLabel(v.cutAt, result.response[v.cutAt - branch.deviatesAt - 1])}.`;
  switch (v.type) {
    case 'tactical': return `Forced win — ${v.reason}.${stop}`;
    case 'punishment': return `Clear edge — ${v.reason}.${stop}`;
    case 'discard': return `No punishment here — the opponent's move is sound (${v.reason}). Keep a short "know the reply" branch if it comes up often; there is nothing to extend.`;
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
    els.engineJson.focus(); // clipboard blocked: the text is select-all on tap
  }
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

function renderSoundToggle() {
  els.soundToggle.textContent = settings.sound ? '🔊' : '🔇';
  els.soundToggle.classList.toggle('off', !settings.sound);
}
els.soundToggle.addEventListener('click', () => {
  settings = updateSetting('sound', !settings.sound);
  feedback.setSoundEnabled(settings.sound);
  renderSoundToggle();
  if (settings.sound) feedback.play('good'); // a little preview
});
renderSoundToggle();

els.restart.addEventListener('click', resetLine);
els.back.addEventListener('click', () => {
  state.session += 1; // cancel any pending opponent move
  renderProgress();   // stats changed while training
  showScreen('home');
});

renderHome();
renderProgress();
renderSettingsPanel();
renderGapReport(loadGapReport());
showScreen('home');
