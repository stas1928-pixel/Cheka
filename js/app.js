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
import { buildBranch, toBranchJSON, fromUserPov } from './branchBuilder.js';
import { humanName, familyName } from './names.js';
import { describeMove } from './describe.js';
import IDEAS from './ideas.data.js';
import { plainNotation, planMarks } from './coach.js';
import { loadSettings, updateSetting } from './settings.js';

const OPPONENT_DELAY_MS = 500;
// After this many wrong tries on one move, an arrow shows the answer.
const HINT_AFTER_MISSES = 2;
// Piece images: vendor/pieces/wN.svg etc. (cburnett set, see its LICENSE.md).
const pieceSrc = (piece) => `vendor/pieces/${piece.color}${piece.type.toUpperCase()}.svg`;

// User preferences (sound, which tab of lines, hidden lines, tokens…).
let settings = loadSettings();
feedback.setSoundEnabled(false);          // sound skipped for now (owner)
feedback.setHapticsEnabled(settings.haptics !== false);

// Accuracy / streaks / weak spots / spaced repetition, saved after every move.
let prog = progress.loadProgress();
function saveProg() { progress.saveProgress(prog); }

const $ = (sel) => document.querySelector(sel);
const els = {
  cards: $('#opening-cards'),
  pager: $('#pager'),
  tabs: $('#tabs'),
  greeting: $('#greeting'),
  todayHint: $('#today-hint'),
  linesSheet: $('#lines-drawer'),
  trainerMain: $('main[data-screen="trainer"]'),
  stage: $('#stage'),
  drawerEdge: $('#drawer-edge'),
  sessionBar: $('#session-bar'),
  combo: $('#combo'),
  after: $('#after'),
  afterKind: $('#after-kind'),
  planTitle: $('#plan-title'),
  planText: $('#plan-text'),
  planCredit: $('#plan-credit'),
  planReview: $('#plan-review'),
  sessionEnd: $('#session-end'),
  playBtn: $('#play-btn'),
  tutFill: $('#tut-fill'),
  whatif: $('#whatif'),
  celebrate: $('#celebrate'),
  planLabel: $('#plan-label'),
  closeLines: $('#close-lines'),
  editLines: $('#edit-lines'),
  hintBtn: $('#hint-btn'),
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
  streakTop: $('#streak-top'),
  xpTop: $('#xp-top'),
  goalFill: $('#goal-fill'),
  goalText: $('#goal-text'),
  homeStreak: $('#home-streak'),
  homeLevel: $('#home-level'),
  homeGoalFill: $('#home-goal-fill'),
  homeGoalText: $('#home-goal-text'),
  nextLine: $('#next-line'),
  lineSearch: $('#line-search'),
  dailyGoal: $('#daily-goal'),
  hapticsToggle: $('#haptics-toggle'),
  board: $('#board'),
  arrows: $('#arrows'),
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
  hint: null,           // { from, to? } — the glowing piece (and later its target) after a hint
  run: null,            // session: { results: [{ perfect }], combo, bestCombo, xp }
  playing: null,        // Watch-mode autoplay timer
  whatif: false,        // Watch mode: the board shows the user's own move, off the line
};
const SESSION_LEN = 5;
const FLAME = '<svg class="flame" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.4 1.2-4 2.5-5 .1 2 1 3 2 3.2C11 8.6 11.3 5 12 2z"/></svg>';

/* ---------- screens ---------- */

function showScreen(name) {
  document.querySelectorAll('main[data-screen]').forEach((el) => {
    el.hidden = el.dataset.screen !== name;
  });
}

/* ---------- home: opening cards ---------- */

/** A small static board after `sans` (from the player's side), last move highlighted. */
function miniBoard(sans, side, cls = '') {
  const g = new Chess();
  for (const m of sans) g.move(m);
  const last = g.history({ verbose: true }).at(-1);
  let cells = g.board().flatMap((row, r) => row.map((p, f) => ({ p, r, f })));
  if (side === 'b') cells = cells.reverse();
  return `<div class="mini ${cls}" aria-hidden="true">${cells.map(({ p, r, f }) => {
    const name = 'abcdefgh'[f] + (8 - r);
    const hl = last && (name === last.from || name === last.to);
    return `<i class="${(r + f) % 2 ? 'd' : ''}${hl ? ' hl' : ''}">${p ? `<img src="${pieceSrc(p)}" alt="">` : ''}</i>`;
  }).join('')}</div>`;
}

/** Medal ring: fills toward the next tier in that tier's colour; the earned medal sits inside. */
function medalRing(t, big = false) {
  const R = 16, C = 2 * Math.PI * R;
  const target = (t.next?.name ?? 'Master').toLowerCase();
  const earned = (t.tier ?? '').toLowerCase();
  return `<span class="ring ${big ? 'big' : ''} to-${target}" title="${t.tier ?? 'No medal yet'}">
    <svg viewBox="0 0 40 40"><circle class="track" cx="20" cy="20" r="${R}"/><circle class="fill" cx="20" cy="20" r="${R}" style="stroke-dasharray:${C};--off:${C * (1 - t.progress)}"/></svg>
    ${earned ? `<b class="medal-core ${earned}">${t.tier[0]}</b>` : `<b class="ring-count"><em>${t.clean}</em>/${t.next?.at ?? 15}</b>`}</span>`;
}

/** Pips for the runs still needed to the next medal. */
function pips(t) {
  if (!t.next) return '<span class="pips done">★</span>';
  const prevAt = [...progress.TIERS].reverse().find((x) => x.at <= t.clean)?.at ?? 0;
  const n = t.next.at - prevAt, got = t.clean - prevAt;
  return `<span class="pips to-${t.next.name.toLowerCase()}">${Array.from({ length: n }, (_, i) => `<i class="${i < got ? 'on' : ''}"></i>`).join('')}</span>`;
}

/** Count a number up for a little life (respects reduced motion). */
function countUp(root = document) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count); if (still || !to) { el.textContent = el.dataset.count; return; }
    const t0 = performance.now(), dur = 700;
    const tick = (now) => { const k = Math.min(1, (now - t0) / dur); el.textContent = Math.round(to * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}

function renderHome() {
  const h = new Date().getHours();
  els.greeting.textContent = h < 5 ? 'Late-night prep' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  els.cards.innerHTML = OPENINGS.map((o, i) => {
    const ids = visibleLines(o, o.lines).map((l) => l.id);
    const due = ids.filter((id) => progress.lineStatus(prog, o.id, id).state === 'due').length;
    const fresh = ids.filter((id) => progress.lineStatus(prog, o.id, id).state === 'new').length;
    const medals = o.lines.filter((l) => progress.lineTier(prog, o.id, l.id).tier).length;
    const pct = Math.round((medals / o.lines.length) * 100);
    return `
      <article class="opening ${o.side}" style="--i:${i}">
        <div class="op-head">
          <div><span class="op-side">You play ${o.side === 'w' ? 'White' : 'Black'}</span><h2>${o.name}</h2></div>
          ${due ? `<span class="due-pill"><i class="dot"></i>${due} to review</span>` : fresh ? `<span class="due-pill fresh">${fresh} new to learn</span>` : '<span class="due-pill calm">All caught up</span>'}
        </div>
        ${miniBoard(tree.mainLine(o).slice(0, o.signaturePlies), o.side, 'op-board')}
        <div class="op-meta">
          <span><b data-count="${o.lines.length}">0</b> lines</span>
          <span><b data-count="${fresh}">0</b> new</span>
          <span><b data-count="${medals}">0</b> medals</span>
        </div>
        <div class="bar thin"><i style="width:${pct}%"></i></div>
        <div class="op-actions">
          <button class="secondary" data-review="${o.id}">Watch</button>
          <button class="primary" data-train="${o.id}">Train</button>
        </div>
      </article>`;
  }).join('');
  countUp(els.cards);
}

/* ---------- home tabs: swipe between pages (Instagram-style), or tap a tab ----------
   Only the active page is laid out, so the screen is exactly as tall as its
   content (no scrolling into empty space under a short tab). A horizontal
   swipe slides to the neighbouring page. */
let tabIndex = 0;
function setTab(i) {
  const pages = [...els.pager.children];
  i = Math.max(0, Math.min(pages.length - 1, i));
  if (i === tabIndex && pages[i].classList.contains('on')) return;
  const dir = i > tabIndex ? 'from-right' : 'from-left';
  pages.forEach((p, k) => { p.classList.toggle('on', k === i); p.classList.remove('from-right', 'from-left'); });
  void pages[i].offsetWidth;
  pages[i].classList.add(dir);
  tabIndex = i;
  els.tabs.style.setProperty('--x', i);
  els.tabs.querySelectorAll('[data-page]').forEach((b) => b.classList.toggle('on', Number(b.dataset.page) === i));
  if (i === 1) renderProgress();
  window.scrollTo({ top: Math.min(window.scrollY, els.tabs.offsetTop - 8), behavior: 'smooth' });
}
els.tabs.addEventListener('click', (e) => {
  const b = e.target.closest('[data-page]');
  if (b) { setTab(Number(b.dataset.page)); feedback.haptic('good'); }
});
let swipe = null;
els.pager.addEventListener('touchstart', (e) => { const t = e.touches[0]; swipe = { x: t.clientX, y: t.clientY }; }, { passive: true });
els.pager.addEventListener('touchend', (e) => {
  if (!swipe) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - swipe.x, dy = t.clientY - swipe.y;
  swipe = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { setTab(tabIndex + (dx < 0 ? 1 : -1)); feedback.haptic('good'); }
}, { passive: true });
els.pager.children[0].classList.add('on');

els.cards.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-train], button[data-review]');
  if (!btn) return;
  if (btn.dataset.train) openTrainer(btn.dataset.train, 'train');
  else openTrainer(btn.dataset.review, 'review');
});

/* ---------- entering the trainer screen ---------- */

function openTrainer(openingId, mode) {
  state.opening = getOpening(openingId);
  state.run = null;
  state.lineObj = null;
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
  els.review.hidden = mode !== 'review';
  els.moves.hidden = true;   // minimal notation: the coach talks instead
  els.hintBtn.hidden = mode !== 'train';
  els.restart.hidden = mode !== 'train';
  els.drawerEdge.hidden = mode !== 'train';
  document.getElementById('line-info').hidden = mode !== 'train';
  els.stage.classList.remove('plan-view');

  stopPlay();
  hideAfter();
  els.whatif.hidden = true;
  if (mode === 'train') {
    if (!state.run || state.run.results.length >= SESSION_LEN) startSession();
    renderSession();
    resetLine();
  } else {
    populateLineSelect();
    reviewLine(state.lineObj && state.opening.lines.concat(state.opening.surprise ?? []).includes(state.lineObj) ? state.lineObj : state.opening.lines[0]);
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

function drawArrow(from, to, cls = '') {
  const a = squareCenter(from);
  const b = squareCenter(to);
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
  const k = (len - 0.35) / len;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
  line.setAttribute('x2', a.x + dx * k); line.setAttribute('y2', a.y + dy * k);
  line.setAttribute('pathLength', 10);
  if (cls) line.setAttribute('class', cls);
  els.arrows.appendChild(line);
}
function drawCircle(square, cls = '') {
  const c = squareCenter(square);
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  el.setAttribute('cx', c.x); el.setAttribute('cy', c.y); el.setAttribute('r', 0.42);
  if (cls) el.setAttribute('class', cls);
  els.arrows.appendChild(el);
}
/** Teaching marks from the coach data or a plan: several arrows and circles at once. */
function drawMarks(marks, cls = '') {
  if (!marks) return;
  for (const a of marks.arrows ?? []) { const [f, t] = a.split('-'); drawArrow(f, t, cls); }
  for (const sq of marks.circles ?? []) drawCircle(sq, cls);
}

function clearArrows() {
  els.arrows.querySelectorAll('line, circle').forEach((l) => l.remove());
}

/** Coach entry for the move that brought the line to `plies` moves. */
function coachAt(plies, line = state.line) {
  return plies > 0 ? IDEAS[line.slice(0, plies).join(' ')] ?? null : null;
}
const esc = (t) => String(t).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

/** Hint: level 1 lights up the piece that has to move; level 2 also marks its target. Never an arrow. */
function showHint(level = 1) {
  const move = state.game.moves({ verbose: true }).find((m) => m.san === state.line[state.ply]);
  if (!move) return;
  state.hint = { from: move.from, to: level >= 2 ? move.to : null };
  paintHint();
}
function paintHint() {
  els.board.querySelectorAll('.hint-from, .hint-to').forEach((e) => e.classList.remove('hint-from', 'hint-to'));
  if (!state.hint || state.mode !== 'train') return;
  els.board.querySelector(`[data-square="${state.hint.from}"]`)?.classList.add('hint-from');
  if (state.hint.to) els.board.querySelector(`[data-square="${state.hint.to}"]`)?.classList.add('hint-to');
}

/** Daily loop: streak, level/XP and today's goal bar, in the trainer header and on home. */
function renderStreakChip() {
  const g0 = Number(settings.dailyGoal ?? 5), t0 = progress.todayCount(prog);
  if (els.todayHint) els.todayHint.textContent = t0 >= g0 ? 'Goal met — streak safe' : `${g0 - t0} line${g0 - t0 === 1 ? '' : 's'} to go`;
  const goal = Number(settings.dailyGoal ?? 5);
  const today = progress.todayCount(prog);
  const streak = progress.streakDays(prog, goal);
  const lvl = progress.levelFor(progress.totalXp(prog));
  const pct = `${Math.min(100, Math.round((today / goal) * 100))}%`;
  for (const [chip, fill, text, lv] of [[els.streakTop, els.goalFill, els.goalText, els.xpTop], [els.homeStreak, els.homeGoalFill, els.homeGoalText, els.homeLevel]]) {
    chip.innerHTML = `${FLAME}<b>${streak}</b>`;
    chip.classList.toggle('cold', streak === 0);
    fill.style.width = pct;
    fill.parentElement.classList.toggle('done', today >= goal);
    text.textContent = `${Math.min(today, goal)} / ${goal}`;
    lv.textContent = `Lv ${lvl.level}`;
    lv.style.setProperty('--p', lvl.progress);
  }
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
  // At the end of a trained line the sourced PLAN takes over the note area;
  // resetLine() clears state.finished, so the next line starts clean.
  // The raw source note is gone (owner, 2026-09-25: "no one reading that"); the plan panel carries a short credit.
  els.note.hidden = true;
}

els.moves.addEventListener('click', (e) => {
  const span = e.target.closest('.mv[data-ply]');
  if (span && state.mode === 'review') stepTo(Number(span.dataset.ply) + 1);
});

/** "castles kingside" / "plays knight to f6" — verb-first phrase for a side's move. */
function playsPhrase(mv) {
  const d = describeMove(mv).toLowerCase();
  return d.startsWith('castles') ? d : `plays ${d}`;
}
function setStatusHTML(html, kind = 'neutral') {
  els.status.className = `status ${kind} two`;
  els.status.innerHTML = html;
}
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
  if (mode === 'side') return opening.lines.filter((l) => l.kind === 'side' || l.kind === 'trap');   // side tab = punishments and traps
  if (mode === 'surprise') return tree.surpriseLines(opening);                                        // our own offbeat weapons, kept apart
  const hits = loadGapReport()?.report?.[opening.id]?.lineHits ?? {};
  const mine = opening.lines.filter((l) => (hits[l.id] ?? 0) > 0).sort((a, b) => hits[b.id] - hits[a.id]);
  return mine;   // empty until a Chess.com scan finds lines — the drawer explains how
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
  const st = (l) => progress.lineStatus(prog, opening.id, l.id).state;
  const due = candidates.filter((l) => st(l) === 'due');
  if (!due.length) {
    const fresh = candidates.find((l) => st(l) === 'new');   // teach in order: main line first, then branches
    if (fresh) return fresh;
  }
  const pool = due.length ? due : candidates;
  const weights = pool.map((l) => {
    let w = progress.lineWeight(prog, opening.id, l.id);
    if (settings.lineMode === 'mine') w *= 1 + Math.log2(1 + (hits[l.id] ?? 0));
    return w * (1 + missCount(l.id));
  });
  return tree.pickWeighted(pool, weights) ?? pool[0];
}

const CHUNK = 6;   // your moves per learning chunk
function resetLine(lineObj = null, { test = false, chunkFrom = 0 } = {}) {
  hideAfter();
  state.hint = null;
  state.forceTest = test;
  state.session += 1;
  state.lineObj = lineObj ?? planLine();
  state.line = state.lineObj.moves;
  state.ply = 0;
  state.game.reset();
  state.selected = null;
  state.misses = 0;
  state.lineMistakes = 0;
  state.finished = false;
  els.nextLine.textContent = 'Next line';
  els.nextLine.hidden = true;

  const o = state.opening;
  state.learning = !test && progress.lineStatus(prog, o.id, state.lineObj.id).state === 'new';
  if (!test) state.keepChunk = null;
  // Moves you already know are played for you, fast: everything before this line leaves the trunk,
  // once the trunk itself has been played (and at least the opening's signature moves).
  const trunk = o.lines[0];
  const dev = tree.deviation(o, state.lineObj);
  const trunkKnown = progress.lineStatus(prog, o.id, trunk.id).state !== 'new';
  let auto = 0;
  if (trunkKnown) auto = dev ? dev.ply : o.signaturePlies;
  if (state.forceTest) auto = Math.min(auto, o.signaturePlies);
  if (state.lineObj.kind === 'surprise') auto = Math.min(auto, (state.lineObj.deviatesAt ?? auto));
  while (auto > 0 && !tree.isUserPly(o, auto)) auto--;   // stop so that it is the user's move
  if (chunkFrom) auto = Math.max(auto, chunkFrom);
  state.autoTo = Math.min(auto, state.line.length - 1);
  // cut the line into a chunk while it is still new (learning) or while a chunk is being tested
  state.chunk = null;
  const newLine = progress.lineStatus(prog, o.id, state.lineObj.id).state === 'new';
  if (test && state.keepChunk) { state.chunk = state.keepChunk; state.line = state.lineObj.moves.slice(0, state.chunk.to); state.autoTo = Math.min(state.autoTo, state.chunk.from); }
  else if (newLine && !test) {
    let mine = 0, end = state.line.length;
    for (let p = state.autoTo; p < state.line.length; p++) if (tree.isUserPly(o, p) && ++mine === CHUNK) { end = p + 1; break; }
    if (end < state.line.length - 1) { state.chunk = { from: state.autoTo, to: end }; state.line = state.lineObj.moves.slice(0, end); }
  }

  renderBoard();
  renderMoves();
  renderLineMode();
  renderLineList();
  renderStreakChip();
  setStatus(test ? `From memory: ${humanName(o.id, state.lineObj)}` : `${state.learning ? 'New line' : 'Next'}: ${humanName(o.id, state.lineObj)}`, 'intro');
  const session = state.session;
  const step = () => {
    if (session !== state.session) return;
    if (state.ply < state.autoTo) {
      const mv = state.game.move(state.line[state.ply]);
      state.ply += 1;
      renderBoard({ animate: true });
      setTimeout(step, 150);
      return;
    }
    if (tree.isUserPly(o, state.ply)) promptUser();
    else scheduleOpponent();
  };
  setTimeout(step, state.autoTo ? 350 : 500);
}

/** Your turn: on a new line the move is shown first (learn), otherwise just asked. */
function renderLineInfo() {
  const info = document.getElementById('line-info');
  if (!info || !state.lineObj) return;
  const mine = state.line.filter((_, i) => tree.isUserPly(state.opening, i)).length;
  const done = state.line.slice(0, state.ply).filter((_, i) => tree.isUserPly(state.opening, i)).length;
  const t = progress.lineTier(prog, state.opening.id, state.lineObj.id);
  info.innerHTML = `<span class="li-fam">${familyName(state.opening.id, tree.lineFamily(state.opening, state.lineObj))}</span><b>${humanName(state.opening.id, state.lineObj)}</b><span class="li-steps">${Array.from({ length: mine }, (_, i) => `<i class="${i < done ? 'on' : ''}"></i>`).join('')}</span><span class="li-medal">${t.tier ? `${t.tier} medal` : t.next ? `${t.clean}/${t.next.at} to ${t.next.name}` : ''}</span>`;
}
function promptUser() {
  if (state.learning) {
    showHint(2);
    const g = new Chess(); state.line.slice(0, state.ply).forEach((m) => g.move(m));
    const prev = state.ply > 0 && !tree.isUserPly(state.opening, state.ply - 1) ? g.history({ verbose: true }).at(-1) : null;
    const them = state.opening.side === 'w' ? 'Black' : 'White';
    const said = prev ? coachAt(state.ply)?.say : null;
    setStatusHTML(`${prev ? `<small>${esc(said ?? `${them} ${playsPhrase(prev)}`)}</small>` : ''}<span>Learn: ${describeMove(g.move(state.line[state.ply])).toLowerCase()}</span>`, 'intro');
  } else {
    setStatus(`${state.opening.side === 'w' ? 'White' : 'Black'} to play — your move`);
  }
}

function onSquareClick(square) {
  const { game, opening } = state;
  if (state.mode === 'review') { if (state.whatif) return; }
  else {
    if (state.mode !== 'train' && state.mode !== 'weak') return;
    if (state.finished) return;
    if (state.mode === 'train' && !tree.isUserPly(opening, state.ply)) return;
    if (state.mode === 'weak' && game.turn() !== opening.side) return;
  }

  const piece = game.get(square);
  const mover = state.mode === 'review' ? game.turn() : opening.side;
  const ownPiece = piece && piece.color === mover;

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
  else if (state.mode === 'review') whatIf(matched);
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
    if (!state.learning) state.lineMistakes += 1;
    renderBoard();
    feedback.flash(els.board, [move.from, move.to], 'bad');
    feedback.shake(els.board.parentElement);
    feedback.haptic('bad');
    if (state.learning) {
      const g = new Chess(); state.line.slice(0, state.ply).forEach((m) => g.move(m));
      setStatus(`Not that one — ${describeMove(g.move(expected)).toLowerCase()}`, 'bad');
      return;
    }
    if (state.misses >= HINT_AFTER_MISSES) {
      showHint(state.misses > HINT_AFTER_MISSES ? 2 : 1);
      setStatus(state.misses > HINT_AFTER_MISSES ? 'Move the glowing piece to the marked square' : 'Not quite — the glowing piece moves', 'bad');
    } else {
      setStatus('Not the line — try again', 'bad');
    }
    return;
  }

  const played = state.game.move(move.san);
  state.ply += 1;
  state.misses = 0;
  state.hint = null;
  renderBoard({ animate: true });
  renderMoves();
  feedback.flash(els.board, [move.from, move.to], 'good');
  feedback.haptic('good');
  const c = coachAt(state.ply);
  if (c) setStatusHTML(`<span>✓ ${esc(c.say)}</span><small>${esc(c.why)}</small>`, 'good');
  else setStatus(`✓ ${describeMove(played)}`, 'good');

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
  if (tree.isUserPly(opening, state.ply)) { promptUser(); return; }

  const san = state.line[state.ply];
  const dev = tree.deviation(opening, state.lineObj);
  const leftBook = dev && dev.ply === state.ply;
  const theirs = state.game.move(san);
  state.ply += 1;
  renderBoard({ animate: true });
  renderMoves();

  if (state.ply >= state.line.length) { finishLine(); return; }
  if (leftBook) {
    const kind = state.lineObj.kind === 'side' ? 'punish it' : state.lineObj.kind === 'trap' ? 'a trap is coming' : 'find the reply';
    feedback.haptic('deviation');
    feedback.shake(els.status);
    setStatus(`${opening.side === 'w' ? 'Black' : 'White'} switches to “${humanName(opening.id, state.lineObj)}” — ${kind}`, 'warn');
    if (state.learning) { showHint(2); setStatus(`New: ${humanName(opening.id, state.lineObj)} — watch the glow`, 'warn'); }
  } else {
    const them = opening.side === 'w' ? 'Black' : 'White';
    if (state.learning) promptUser();
    else { const c = coachAt(state.ply); setStatusHTML(`<small>${esc(c?.say ?? `${them} ${playsPhrase(theirs)}`)}</small><span>Your move</span>`); }
  }
}

function finishLine() {
  state.finished = true;
  state.selected = null;
  state.hint = null;
  renderBoard();
  renderMoves();
  const perfect = state.lineMistakes === 0 && !state.learning;
  if (state.chunk) { finishChunk(perfect); return; }
  progress.recordLineComplete(prog, state.opening.id);
  const entry = progress.scheduleLine(prog, state.opening.id, state.lineObj.id, { perfect });
  const tier = progress.tierFor(entry.clean);
  const justEarned = perfect && progress.TIERS.some((t) => t.at === entry.clean);
  const daily = progress.recordDaily(prog, { perfect }, Number(settings.dailyGoal ?? 5));

  // session momentum: a perfect streak inside the session earns a small bonus
  state.run ??= { results: [], combo: 0, bestCombo: 0, xp: 0 };
  const run = state.run;
  run.combo = perfect ? run.combo + 1 : 0;
  run.bestCombo = Math.max(run.bestCombo, run.combo);
  const bonus = perfect && run.combo >= 3 ? 5 : 0;
  if (bonus) prog.daily.xp += bonus;
  const gained = daily.gained + bonus;
  run.xp += gained;
  run.results.push({ perfect, learned: state.learning, id: state.lineObj.id });
  saveProg();

  flyXp(gained);
  renderSession();
  renderLineList();
  setStatus(state.learning ? 'Learned — now from memory' : perfect ? (run.combo >= 2 ? `Perfect — ${run.combo} in a row` : 'Perfect') : 'Finished — try it again for a perfect run', perfect ? 'good' : 'neutral');

  showAfter(state.learning ? 'Learned' : perfect ? (justEarned ? `${tier.tier} medal` : 'Perfect') : 'Completed', perfect);
  const milestones = [];
  if (justEarned) milestones.push({ kind: 'medal', tier });
  if (daily.goalMet) milestones.push({ kind: 'goal' });
  if (daily.levelUp) milestones.push({ kind: 'level' });
  if (milestones.length) setTimeout(() => celebrate(gained, milestones), 700);
  feedback.haptic(milestones.length ? 'milestone' : 'complete');
  els.nextLine.textContent = state.learning ? 'Now from memory' : !perfect ? 'Try again from memory' : run.results.length >= SESSION_LEN ? 'Finish session' : 'Next line';
  state.retry = !state.learning && !perfect ? state.lineObj : null;
  els.planReview.textContent = state.retry ? 'Next line' : 'Watch it';
  state.justLearned = state.learning ? state.lineObj : null;
}

/** End of a learning chunk: learn → from memory → continue with the next chunk. No progress is recorded until the whole line is done. */
function finishChunk(perfect) {
  const l = state.lineObj, c = state.chunk;
  const total = l.moves.filter((_, i) => tree.isUserPly(state.opening, i)).length;
  const done = l.moves.slice(0, c.to).filter((_, i) => tree.isUserPly(state.opening, i)).length;
  els.controls.hidden = true;
  els.after.hidden = false;
  els.after.classList.toggle('perfect', perfect);
  const parts = Math.ceil(total / CHUNK), part = Math.ceil(done / CHUNK);
  els.after.classList.add('part');
  els.afterKind.innerHTML = `Part ${part} of ${parts} <span class="part-dots">${Array.from({ length: parts }, (_, i) => `<i class="${i < part - 1 || (i === part - 1 && !state.learning && perfect) ? 'on' : i === part - 1 ? 'half' : ''}"></i>`).join('')}</span>`;
  els.planTitle.textContent = state.learning ? `Part ${part} learned!` : perfect ? 'Perfect part!' : 'Nearly there!';
  els.planText.textContent = state.learning ? `${humanName(state.opening.id, l)} — now play this part from memory.` : perfect ? `Locked in: ${done} of ${total} moves. On to the next part.` : 'Once more from memory, then the next part.';
  if (state.learning || perfect) { const r = progress.recordPart(prog); saveProg(); flyXp(r.gained); if (r.levelUp) setTimeout(() => celebrate(r.gained, [{ kind: 'level' }]), 900); }
  els.planCredit.textContent = '';
  els.planReview.hidden = true;
  els.nextLine.hidden = false;
  if (state.learning) { els.nextLine.textContent = 'Now from memory'; state.after = () => resetLine(l, { test: true }); }
  else if (!perfect) { els.nextLine.textContent = 'Try again from memory'; state.after = () => resetLine(l, { test: true }); }
  else { els.nextLine.textContent = 'Continue the line'; state.after = () => resetLine(l, { chunkFrom: c.to }); }
  // keep the chunk while testing it
  state.keepChunk = c;
  setStatus(state.learning ? 'Nice — part learned!' : perfect ? 'Perfect part!' : 'Nearly there', perfect || state.learning ? 'good' : 'neutral');
  feedback.haptic('complete');
  els.nextLine.classList.remove('nudge'); void els.nextLine.offsetWidth; els.nextLine.classList.add('nudge');
}

/* ---------- after a line: the plan under the board ---------- */
function showAfter(kind, perfect) {
  const l = state.lineObj;
  els.controls.hidden = true;
  els.after.hidden = false;
  els.after.classList.toggle('perfect', Boolean(perfect));
  els.after.classList.remove('part');
  els.afterKind.textContent = kind;
  els.planTitle.textContent = humanName(state.opening.id, l);
  els.planText.textContent = l.plan ? plainNotation(l.plan) : 'You reached the end of the line — play it again to lock it in.';
  els.planCredit.textContent = l.planCredit ? `${l.planBasis === 'quoted' ? 'Source' : 'Based on'}: ${l.planCredit.split(';').map((x) => x.replace(/\s*\(.*?\)/g, '').trim()).slice(0, 2).join(', ')}` : '';
  // the plan drawn on the board; the board shrinks for a moment so plan and board fit together
  clearArrows();
  drawMarks(planMarks(l.moves, l.plan, state.opening.side), 'plan');
  els.stage.classList.add('plan-view');
  els.planReview.hidden = state.mode === 'review';
  els.nextLine.hidden = false;
  els.nextLine.classList.remove('nudge'); void els.nextLine.offsetWidth; els.nextLine.classList.add('nudge');
}
function hideAfter() {
  els.stage.classList.remove('plan-view');
  els.after.hidden = true;
  els.sessionEnd.hidden = true;
  els.controls.hidden = false;
}

/* ---------- XP: "+10 XP" rises off the board and lands in the level chip ---------- */
function flyXp(n) {
  if (!n) return;
  const from = els.board.getBoundingClientRect();
  const to = els.xpTop.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'xp-fly';
  el.textContent = `+${n} XP`;
  document.body.appendChild(el);
  const x0 = from.left + from.width / 2, y0 = from.top + from.height * 0.45;
  const x1 = to.left + to.width / 2, y1 = to.top + to.height / 2;
  el.style.left = `${x0}px`; el.style.top = `${y0}px`;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anim = el.animate(still ? [{ opacity: 1 }, { opacity: 0 }] : [
    { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
    { transform: 'translate(-50%, -80%) scale(1.25)', opacity: 1, offset: 0.25 },
    { transform: 'translate(-50%, -80%) scale(1)', opacity: 1, offset: 0.55 },
    { transform: `translate(calc(-50% + ${(x1 - x0) * 0.85}px), calc(-50% + ${(y1 - y0) * 0.85}px)) scale(0.5)`, opacity: 0.6, offset: 0.85 },
    { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) scale(0.3)`, opacity: 0 },
  ], { duration: 1300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
  anim.onfinish = () => {
    el.remove();
    els.xpTop.classList.remove('bump'); void els.xpTop.offsetWidth; els.xpTop.classList.add('bump');
    renderStreakChip();
  };
}

/* ---------- milestone celebration: slides up, board stays visible above ---------- */
function celebrate(gained, items) {
  const goal = Number(settings.dailyGoal ?? 5);
  const lvl = progress.levelFor(progress.totalXp(prog));
  const rows = items.map((m) => {
    if (m.kind === 'medal') return `<div class="cel-row"><span class="medal-core big ${m.tier.tier.toLowerCase()}">${m.tier.tier[0]}</span><div><b>${m.tier.tier} medal</b><small>${humanName(state.opening.id, state.lineObj)}</small></div></div>`;
    if (m.kind === 'goal') return `<div class="cel-row"><span class="cel-flame">🔥</span><div><b>Daily goal met</b><small>Streak: ${progress.streakDays(prog, goal)} day${progress.streakDays(prog, goal) === 1 ? '' : 's'}</small><div class="bar done"><i class="fill-now"></i></div></div></div>`;
    return `<div class="cel-row"><span class="cel-lvl">${lvl.level}</span><div><b>Level ${lvl.level}!</b><small>${lvl.need} XP to the next one</small></div></div>`;
  }).join('');
  els.celebrate.innerHTML = `<div class="cel-card"><div class="cel-xp"><b data-count="${gained}">0</b><span>XP</span></div>${rows}<button class="primary cel-ok">Keep going</button></div>`;
  els.celebrate.hidden = false;
  els.celebrate.classList.remove('out');
  countUp(els.celebrate);
  const close = () => { els.celebrate.classList.add('out'); setTimeout(() => { els.celebrate.hidden = true; }, 260); };
  els.celebrate.querySelector('.cel-ok').onclick = close;
  els.celebrate.onclick = (e) => { if (e.target === els.celebrate) close(); };
}

/* ---------- sessions: 5 lines, one segment each ---------- */
function startSession() {
  state.run = { results: [], combo: 0, bestCombo: 0, xp: 0 };
  renderSession();
}
function renderSession() {
  const run = state.run ?? { results: [], combo: 0 };
  els.sessionBar.innerHTML = Array.from({ length: SESSION_LEN }, (_, i) => {
    const r = run.results[i];
    const cls = r ? (r.learned ? 'done learned' : r.perfect ? 'done perfect' : 'done') : i === run.results.length ? 'current' : '';
    return `<i class="${cls}"></i>`;
  }).join('');
  els.combo.hidden = run.combo < 2;
  els.combo.innerHTML = `${FLAME}×${run.combo}`;
  if (run.combo >= 2) { els.combo.classList.remove('pop'); void els.combo.offsetWidth; els.combo.classList.add('pop'); }
}
function showSessionEnd() {
  const run = state.run;
  const perfect = run.results.filter((r) => r.perfect).length;
  const goal = Number(settings.dailyGoal ?? 5);
  const today = progress.todayCount(prog);
  const o = state.opening;
  const dueTomorrow = o.lines.filter((l) => progress.lineStatus(prog, o.id, l.id, new Date(Date.now() + 86400000)).state === 'due').length;
  const learned = run.results.filter((r) => r.learned).length;
  const missed = run.results.filter((r) => !r.perfect && !r.learned).map((r) => humanName(o.id, tree.lineById(o, r.id)));
  els.controls.hidden = true;
  els.after.hidden = true;
  els.sessionEnd.hidden = false;
  els.sessionEnd.innerHTML = `
    <div class="se-top"><span class="after-kind">Session complete</span><h2>${perfect === SESSION_LEN ? 'Flawless — 5 perfect lines' : [learned ? `${learned} learned` : '', perfect ? `${perfect} perfect` : '', run.results.length - learned - perfect > 0 ? `${run.results.length - learned - perfect} to polish` : ''].filter(Boolean).join(' · ')}</h2></div>
    <div class="se-stats">
      ${learned ? `<div><b data-count="${learned}">0</b><small>learned</small></div>` : ''}<div><b data-count="${perfect}">0</b><small>perfect</small></div>
      <div><b data-count="${run.xp}">0</b><small>XP</small></div>
      ${run.bestCombo >= 2 ? `<div><b data-count="${run.bestCombo}">0</b><small>best combo</small></div>` : ''}
    </div>
    <div class="se-goal"><span>Today</span><div class="bar${today >= goal ? ' done' : ''}"><i style="width:${Math.min(100, Math.round((today / goal) * 100))}%"></i></div><b>${Math.min(today, goal)} / ${goal}</b></div>
    <p class="se-insight">${missed.length ? `Worth another look: <b>${[...new Set(missed)].slice(0, 2).join('</b>, <b>')}</b>. They'll come back first next time.` : 'Every line clean. Your medals are growing.'}</p>
    <p class="se-next">${dueTomorrow ? `Tomorrow: ${dueTomorrow} line${dueTomorrow === 1 ? '' : 's'} to review.` : 'Next time: new lines to learn.'}</p>
    <div class="after-actions"><button id="se-home" class="secondary">Home</button><button id="se-again" class="primary">Keep going</button></div>`;
  countUp(els.sessionEnd);
  els.sessionEnd.querySelector('#se-again').onclick = () => { startSession(); resetLine(); };
  els.sessionEnd.querySelector('#se-home').onclick = () => els.back.click();
  feedback.haptic('milestone');
  requestAnimationFrame(() => els.sessionEnd.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
}

/* =================================================================
   LINE LIST — the tabs and the tickable lines under them
   ================================================================= */

function renderLineMode() {
  const { opening } = state;
  const counts = { main: tree.linesOfKind(opening, 'main').length, side: tabLines(opening, 'side').length, surprise: tabLines(opening, 'surprise').length, mine: tabLines(opening, 'mine').length };
  els.lineMode.querySelectorAll('button').forEach((b) => {
    const mode = b.dataset.line;
    b.classList.toggle('active', mode === settings.lineMode);
    b.setAttribute('aria-checked', String(mode === settings.lineMode));
    b.hidden = mode === 'surprise' && counts.surprise === 0;
    const label = { main: 'Main', side: 'Traps', surprise: 'Surprises', mine: 'My games' }[mode];
    b.innerHTML = `${label}<small>${counts[mode]}</small>`;
  });
}

function renderLineList() {
  const { opening } = state;
  const lines = tabLines(opening);
  const hidden = settings.hiddenLines?.[opening.id] ?? {};
  const hits = loadGapReport()?.report?.[opening.id]?.lineHits ?? {};
  const ticked = lines.filter((l) => !hidden[l.id]);
  const due = progress.dueCount(prog, opening.id, ticked.map((l) => l.id));
  els.lineListTitle.textContent = { main: 'Main lines', side: 'Traps & punishments', surprise: 'Surprise weapons', mine: 'From your games' }[settings.lineMode] ?? opening.name;
  const dueN = ticked.filter((l) => progress.lineStatus(prog, opening.id, l.id).state === 'due').length;
  const newN = ticked.filter((l) => progress.lineStatus(prog, opening.id, l.id).state === 'new').length;
  els.lineListMeta.textContent = `${ticked.length} lines${dueN ? ` · ${dueN} to review` : ''}${newN ? ` · ${newN} new` : ''}`;
  const q = els.lineSearch?.value ?? '';
  const shown = lines.filter((l) => tree.matchesQuery(opening, l, q));
  const note = settings.lineMode === 'mine' && Object.keys(hits).length === 0
    ? '<p class="empty">Scan your Chess.com games (Games tab) and this list shows exactly what your opponents play.</p>' : '';
  if (!shown.length) { els.lineRows.innerHTML = note + `<p class="empty">Nothing matches “${q.replace(/[<>&]/g, '')}”.</p>`; return; }
  const fams = [];
  for (const l of shown) { const f = tree.lineFamily(opening, l); let g = fams.find((x) => x.name === f); if (!g) fams.push(g = { name: f, lines: [] }); g.lines.push(l); }
  let k = 0;
  els.lineRows.innerHTML = note + fams.map((g) => {
    const dueN = g.lines.filter((l) => progress.lineStatus(prog, opening.id, l.id).state === 'due').length;
    const medals = g.lines.map((l) => { const t = progress.lineTier(prog, opening.id, l.id).tier; return `<i class="${(t ?? '').toLowerCase()}"></i>`; }).join('');
    return `<section class="fam">
      <header class="fam-head"><h3>${familyName(opening.id, g.name)}</h3><span class="fam-medals">${medals}</span>${dueN ? `<span class="fam-due">${dueN}</span>` : ''}</header>
      ${g.lines.map((l) => {
        const st = progress.lineStatus(prog, opening.id, l.id);
        const t = progress.lineTier(prog, opening.id, l.id);
        const kind = l.kind === 'trap' ? '<span class="kind trap">trap</span>' : l.kind === 'side' ? '<span class="kind side">punish</span>' : l.kind === 'surprise' ? '<span class="kind sur">surprise</span>' : '';
        const freq = l.club ? `<span class="freq">${Math.round(l.club.share)}% of club players</span>` : hits[l.id] ? `<span class="freq">×${hits[l.id]} in your games</span>` : '';
        const name = humanName(opening.id, l);
        const playing = state.lineObj?.id === l.id;
        return `
        <div class="line-row${hidden[l.id] ? ' off' : ''}${playing ? ' playing' : ''}" data-play="${l.id}" role="button" style="--k:${k++}">
          ${miniBoard(l.moves.slice(0, tree.definingPly(opening, l) + 1), opening.side, 'thumb')}
          <div class="lr-body">
            <div class="lr-name">${st.state === 'due' ? '<i class="dot"></i>' : ''}${name}</div>
            <div class="lr-sub">${kind}${freq}${q ? `<span class="lr-moves">${tree.formatMoves(l.moves).slice(tree.definingPly(opening, l)).map((m) => m.text).join(' ')}</span>` : ''}</div>
            ${pips(t)}
          </div>
          ${!t.tier && st.state !== 'new' && t.clean === 0 ? '<span class="played" title="Played — not perfect yet">✓</span>' : medalRing(t)}
          <label class="keep"><input type="checkbox" ${hidden[l.id] ? '' : 'checked'} data-toggle="${l.id}"><i></i></label>
        </div>`;
      }).join('')}
    </section>`;
  }).join('');
}

els.lineSearch.addEventListener('input', () => renderLineList());
function openDrawer() {
  if (state.mode !== 'train') return;
  renderLineMode(); renderLineList();
  els.trainerMain.classList.add('drawer-open');
  els.linesSheet.setAttribute('aria-hidden', 'false');
  feedback.haptic('good');
}
function closeDrawer() {
  els.trainerMain.classList.remove('drawer-open');
  els.linesSheet.setAttribute('aria-hidden', 'true');
}
els.drawerEdge.addEventListener('click', openDrawer);
els.closeLines.addEventListener('click', closeDrawer);
els.stage.addEventListener('click', (e) => { if (els.trainerMain.classList.contains('drawer-open')) { e.stopPropagation(); e.preventDefault(); closeDrawer(); } }, true);
// Edge swipe: drag in from the right edge to open; swipe sideways inside to change category.
let edge = null;
els.trainerMain.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  edge = { x: t.clientX, y: t.clientY, fromEdge: t.clientX > innerWidth - 32, inDrawer: els.linesSheet.contains(e.target) };
}, { passive: true });
els.trainerMain.addEventListener('touchend', (e) => {
  if (!edge) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - edge.x, dy = t.clientY - edge.y;
  const horiz = Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5;
  if (horiz && edge.fromEdge && dx < 0 && !els.trainerMain.classList.contains('drawer-open')) openDrawer();
  else if (horiz && edge.inDrawer) {
    const order = ['main', 'side', 'surprise', 'mine'];
    const i = order.indexOf(settings.lineMode);
    if (dx > 0 && i === 0) closeDrawer();
    else { settings = updateSetting('lineMode', order[Math.max(0, Math.min(3, i + (dx < 0 ? 1 : -1)))]); renderLineMode(); renderLineList(); feedback.haptic('good'); }
  }
  edge = null;
}, { passive: true });
els.editLines.addEventListener('click', () => {
  const on = els.linesSheet.classList.toggle('editing');
  els.editLines.textContent = on ? 'Done' : 'Edit';
});
els.hintBtn.addEventListener('click', () => {
  if (state.finished || !tree.isUserPly(state.opening, state.ply)) return;
  state.lineMistakes += 1;           // a hint means this run is not perfect
  const level = state.hint ? 2 : 1;
  showHint(level);
  setStatus(level === 1 ? 'Hint: this piece moves' : 'Hint: to the marked square', 'warn');
  feedback.haptic('deviation');
});

// Tap a row to drill that line now; the checkbox on the right keeps or drops it from the rotation.
els.lineRows.addEventListener('click', (e) => {
  const box = e.target.closest('input[data-toggle]');
  if (box) {
    e.stopPropagation();
    const hidden = { ...(settings.hiddenLines ?? {}) };
    hidden[state.opening.id] = { ...(hidden[state.opening.id] ?? {}) };
    if (box.checked) delete hidden[state.opening.id][box.dataset.toggle];
    else hidden[state.opening.id][box.dataset.toggle] = true;
    settings = updateSetting('hiddenLines', hidden);
    renderLineList();
    return;
  }
  const row = e.target.closest('.line-row[data-play]');
  if (row) {
    if (els.linesSheet.classList.contains('editing')) { row.querySelector('input[data-toggle]')?.click(); return; }
    closeDrawer();
    setTimeout(() => resetLine(tree.lineById(state.opening, row.dataset.play)), 180);
  }
});

els.lineMode.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-line]');
  if (!btn || btn.dataset.line === settings.lineMode) return;
  settings = updateSetting('lineMode', btn.dataset.line);
  renderLineMode();
  renderLineList();
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
    return ls.length ? `<optgroup label="${label}">${ls.map((l) => `<option value="${l.id}">${humanName(opening.id, l)}</option>`).join('')}</optgroup>` : '';
  };
  const sur = tree.surpriseLines(opening);
  els.lineSelect.innerHTML = group('main', 'Main lines') + group('side', 'Side lines') + group('trap', 'Traps')
    + (sur.length ? `<optgroup label="Surprises (your alternatives)">${sur.map((l) => `<option value="${l.id}">${humanName(opening.id, l)}</option>`).join('')}</optgroup>` : '');
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
  state.whatif = false;
  if (els.whatif) els.whatif.hidden = true;
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
  clearArrows();
  if (ply === 0) {
    setStatus(`${humanName(opening.id, state.lineObj)} — tap → to start`, 'intro');
  } else {
    const mine = tree.isUserPly(opening, ply - 1);
    const c = coachAt(ply);
    if (c) {
      setStatusHTML(`<span>${esc(c.say)}</span><small>${esc(c.why)}</small>`, mine ? 'good' : 'neutral');
      drawMarks(c.marks, mine ? '' : 'them');
    } else {
      const g = new Chess(); line.slice(0, ply - 1).forEach((m) => g.move(m));
      setStatus(`${(ply - 1) % 2 === 0 ? 'White' : 'Black'} ${playsPhrase(g.move(line[ply - 1]))}`, mine ? 'good' : 'neutral');
    }
  }
  els.tutFill.style.width = `${Math.round((ply / Math.max(1, line.length)) * 100)}%`;
  els.stepFirst.disabled = els.stepPrev.disabled = ply === 0;
  els.stepNext.disabled = els.stepLast.disabled = ply >= line.length;
  els.playBtn.disabled = ply >= line.length;
  if (ply >= line.length && state.mode === 'review') {
    showAfter('Watched', false);
    els.nextLine.textContent = 'Train this line';
    const r = progress.recordWatch(prog, `${opening.id}/${state.lineObj.id}`);
    if (r.gained) { saveProg(); flyXp(r.gained); }
  } else if (state.mode === 'review') hideAfter();
}

/* ---------- Watch mode: stepped by hand (owner: no autoplay, no arrow before each move) ---------- */
function stopPlay() {
  clearTimeout(state.playing);
  state.playing = null;
}
els.playBtn.addEventListener('click', () => { feedback.haptic('good'); stepTo(state.ply + 1); });

/** "What if?" — in Watch mode the user plays a move of their own. */
async function whatIf(move) {
  stopPlay();
  const prefix = state.line.slice(0, state.ply);
  const book = state.line[state.ply];
  if (move.san === book) { stepTo(state.ply + 1); return; }
  const tried = [...prefix, move.san];
  const all = state.opening.lines.concat(state.opening.surprise ?? []);
  const known = all.find((l) => tree.startsWith(l.moves, tried));
  state.game.move(move.san);
  state.whatif = true;
  renderBoard({ animate: true });
  setStatus(`What if: ${describeMove(move).toLowerCase()}?`, 'warn');
  els.whatif.hidden = false;
  requestAnimationFrame(() => els.whatif.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  if (known) {
    els.whatif.innerHTML = `<b>That's a line you have!</b><span>${humanName(state.opening.id, known)}</span><div class="wi-actions"><button class="secondary" id="wi-back">Back</button><button class="primary" id="wi-go">Watch it</button></div>`;
    els.whatif.querySelector('#wi-go').onclick = () => { els.whatif.hidden = true; state.whatif = false; reviewLine(known); stepTo(tried.length); };
  } else {
    const mineMove = tree.isUserPly(state.opening, prefix.length);
    els.whatif.innerHTML = `<b>What if ${describeMove(move).toLowerCase()}?</b><span class="wi-verdict">Asking Stockfish…</span><div class="wi-actions"><button class="secondary" id="wi-back">Back to the line</button></div>`;
    try {
      engine ??= new Engine();
      await engine.start();
      const before = await engine.evaluate([...prefix, book], { depth: 12 });
      const after = await engine.evaluate(tried, { depth: 12 });
      const side = state.opening.side;
      const diff = (fromUserPov(after.cp ?? 0, side) - fromUserPov(before.cp ?? 0, side)) / 100;
      const g = new Chess(); prefix.forEach((m) => g.move(m));
      const bookDesc = describeMove(g.move(book)).toLowerCase();
      const v = els.whatif.querySelector('.wi-verdict');
      if (!v) return;
      if (mineMove) v.innerHTML = Math.abs(diff) < 0.3 ? 'Playable — about as good as the book move.' : diff < 0 ? `Costs you about <b>${(-diff).toFixed(1)}</b> pawns. The book: ${bookDesc}.` : `Stockfish even likes it a bit more (+${diff.toFixed(1)}).`;
      else v.innerHTML = Math.abs(diff) < 0.3 ? 'A sound try — not in your lines yet. Stockfish: about equal.' : diff > 0 ? `A mistake by them — you'd be about <b>+${diff.toFixed(1)}</b> better than in the book line.` : `A strong try — about ${(-diff).toFixed(1)} better for them than the book move.`;
    } catch { const v = els.whatif.querySelector('.wi-verdict'); if (v) v.textContent = 'Stockfish is not available offline yet.'; }
  }
  els.whatif.querySelector('#wi-back').onclick = () => { els.whatif.hidden = true; state.whatif = false; stepTo(state.ply); };
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
  const lvl = progress.levelFor(progress.totalXp(prog));
  const goal = Number(settings.dailyGoal ?? 5);
  const streak = progress.streakDays(prog, goal);
  const days = Array.from({ length: 14 }, (_, k) => { const d = new Date(); d.setDate(d.getDate() - (13 - k)); return progress.todayCount(prog, d); });
  const R = 34, C = 2 * Math.PI * R;
  els.progressCards.innerHTML = `
    <div class="panel-card hero-stats">
      <span class="ring xl"><svg viewBox="0 0 80 80"><circle class="track" cx="40" cy="40" r="${R}"/><circle class="fill lvl" cx="40" cy="40" r="${R}" style="stroke-dasharray:${C};--off:${C * (1 - lvl.progress)}"/></svg><b>${lvl.level}</b><small>level</small></span>
      <div class="hero-nums">
        <div><b data-count="${progress.totalXp(prog)}">0</b><span>XP</span></div>
        <div><b data-count="${streak}">0</b><span>day streak</span></div>
        <div><b>${lvl.into}<small>/${lvl.need}</small></b><span>to level ${lvl.level + 1}</span></div>
      </div>
    </div>
    <div class="panel-card">
      <h3>Last 14 days</h3>
      <div class="heat">${days.map((n) => `<i class="h${Math.min(4, Math.ceil((n / goal) * 4))}" title="${n}"></i>`).join('')}</div>
    </div>
    ${OPENINGS.map((o) => {
      const s = prog.openings[o.id];
      const acc = progress.accuracy(s);
      // Mastery ladder (owner, 2026-09-25: the four medal coins felt "off"): one bar, a segment per line,
      // coloured by the medal it holds, plus the line closest to its next medal.
      const tiers = o.lines.map((l) => ({ l, t: progress.lineTier(prog, o.id, l.id), st: progress.lineStatus(prog, o.id, l.id).state }));
      const rank = { Master: 4, Gold: 3, Silver: 2, Bronze: 1 };
      const segs = [...tiers].sort((a, b) => (rank[b.t.tier] ?? (b.st !== 'new' ? 0.5 : 0)) - (rank[a.t.tier] ?? (a.st !== 'new' ? 0.5 : 0)));
      const counts = Object.entries(tiers.reduce((m, x) => { if (x.t.tier) m[x.t.tier] = (m[x.t.tier] ?? 0) + 1; return m; }, {})).sort((a, b) => rank[b[0]] - rank[a[0]]);
      const started = tiers.filter((x) => x.st !== 'new' && x.t.next).sort((a, b) => (a.t.next.at - a.t.clean) - (b.t.next.at - b.t.clean))[0];
      const learnedN = tiers.filter((x) => x.st !== 'new').length;
      const spots = progress.weakSpots(prog, o.id, 3);
      return `
        <div class="panel-card op-progress ${o.side}">
          <div class="opp-head"><h3>${o.name}</h3><span class="acc">${acc === null ? '—' : `${acc}%`}<small>accuracy</small></span></div>
          <div class="ladder" aria-label="Mastery of ${o.lines.length} lines">${segs.map((x, k) => `<i class="${(x.t.tier ?? (x.st !== 'new' ? 'learned' : '')).toLowerCase()}" style="--k:${k}"></i>`).join('')}</div>
          <div class="ladder-legend"><span><b data-count="${learnedN}">0</b> of ${o.lines.length} learned</span>${counts.map(([t, n]) => `<span class="lg ${t.toLowerCase()}"><i></i>${n} ${t}</span>`).join('')}</div>
          <p class="next-medal">${started ? `Next medal: <b>${humanName(o.id, started.l)}</b> — ${started.t.next.at - started.t.clean} perfect run${started.t.next.at - started.t.clean === 1 ? '' : 's'} to ${started.t.next.name}` : learnedN ? 'Every learned line is at its top medal.' : 'Learn a line to start the ladder.'}</p>
          <p class="weak">${!s || s.attempts === 0 ? 'Not trained yet.' : spots.length === 0 ? 'No repeated mistakes. 👌' : `Trips you up: ${spots.map((w) => { const l = tree.lineById(o, w.lineKey); return `<span class="tag">${l ? tree.lineFamily(o, l).replace(/ \(.*\)$/, '') : 'a line'}</span>`; }).join(' ')}`}</p>
        </div>`;
    }).join('')}`;
  countUp(els.progressCards);
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
  if (!username) { showWeakMsg('Type your Chess.com username in the scan box above first.', 'bad'); return; }
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
  els.nextLine.textContent = 'Skip';
  els.nextLine.hidden = false;
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

// ↻ restarts the same line; Next line picks the next one from the rotation.
els.restart.addEventListener('click', () => {
  if (state.mode === 'weak') { state.weak.index += 1; loadWeakPosition(); }
  else resetLine(state.finished ? null : state.lineObj);
});
els.nextLine.addEventListener('click', () => {
  if (state.mode === 'weak') { state.weak.index += 1; loadWeakPosition(); return; }
  if (state.mode === 'review') { setMode('train'); return; }
  if (state.after) { const f = state.after; state.after = null; f(); return; }
  if (state.justLearned) { const l = state.justLearned; state.justLearned = null; resetLine(l, { test: true }); return; }
  if (state.retry) { const l = state.retry; state.retry = null; resetLine(l, { test: true }); return; }
  if ((state.run?.results.length ?? 0) >= SESSION_LEN) { showSessionEnd(); return; }
  resetLine();
});
els.planReview.addEventListener('click', () => {
  if (state.retry) { state.retry = null; if ((state.run?.results.length ?? 0) >= SESSION_LEN) showSessionEnd(); else resetLine(); return; }
  const l = state.lineObj; setMode('review'); reviewLine(l);
});
els.dailyGoal.value = String(settings.dailyGoal ?? 5);
els.dailyGoal.addEventListener('change', () => { settings = updateSetting('dailyGoal', Number(els.dailyGoal.value)); renderStreakChip(); });
els.hapticsToggle.checked = settings.haptics !== false;
els.hapticsToggle.addEventListener('change', () => {
  settings = updateSetting('haptics', els.hapticsToggle.checked);
  feedback.setHapticsEnabled(settings.haptics);
  feedback.haptic('good');
});

els.back.addEventListener('click', () => {
  state.session += 1;
  stopPlay();
  closeDrawer();
  renderProgress();
  renderHome();
  renderStreakChip();
  showScreen('home');
});

{ const base = renderBoard; renderBoard = (...a) => { base(...a); paintHint(); if (state.mode === 'train') renderLineInfo(); }; }

renderHome();
renderProgress();
renderSettingsPanel();
renderStreakChip();
renderGapReport(loadGapReport());
renderWeakReport(loadWeakReport());
showScreen('home');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => { /* fine without it */ });
}
