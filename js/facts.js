/* ---------------------------------------------------------------
   BOARD FACTS — what a move does, computed from the position only.
   Owner rule (2026-09-25): the coach never invents ideas. When no source
   explains a move, the coach may only say what is true on the board:
   captures, checks, attacks on loose or bigger pieces, pins, discovered
   attacks, development, castling, central pawns, escapes.
   Pure: (sans before, san) → facts. Tested in tests/facts.test.mjs.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';

export const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
export const NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const other = (c) => (c === 'w' ? 'b' : 'w');

function pieces(game, color) {
  const out = [];
  for (const row of game.board()) for (const sq of row) if (sq && sq.color === color) out.push(sq);
  return out;
}
/** Attackers of `square` by `color`, as squares (chess.js 1.0 attackers). */
const att = (game, square, color) => game.attackers(square, color);

/** First two pieces along a ray from `from` in direction (df, dr). */
function ray(game, from, df, dr) {
  const hits = [];
  let f = from.charCodeAt(0) - 97 + df, r = Number(from[1]) - 1 + dr;
  while (f >= 0 && f < 8 && r >= 0 && r < 8 && hits.length < 2) {
    const sq = String.fromCharCode(97 + f) + (r + 1);
    const p = game.get(sq);
    if (p) hits.push({ ...p, square: sq });
    f += df; r += dr;
  }
  return hits;
}
const DIRS = { b: [[1, 1], [1, -1], [-1, 1], [-1, -1]], r: [[1, 0], [-1, 0], [0, 1], [0, -1]] };
DIRS.q = [...DIRS.b, ...DIRS.r];

/**
 * @param {string[]} before SAN from move 1 up to (not including) the move
 * @param {string} san the move
 */
export function moveFacts(before, san) {
  const game = new Chess();
  for (const s of before) game.move(s);
  const pre = new Chess(game.fen());
  const hist = game.history({ verbose: true });
  const last = hist[hist.length - 1] ?? null;
  const m = game.move(san);
  const me = m.color, them = other(me);
  const f = {
    side: me, piece: m.piece, from: m.from, to: m.to, san: m.san,
    captured: m.captured ?? null,
    check: m.san.includes('+') || m.san.includes('#'),
    mate: m.san.includes('#'),
    castle: m.flags.includes('k') ? 'king' : m.flags.includes('q') ? 'queen' : null,
    promotion: m.promotion ?? null,
    recapture: !!(m.captured && last?.captured && last.to === m.to),
    develops: false, centre: false,
    hits: [], discovered: [], pins: [], escapes: false, gambit: false,
  };

  // development: a knight or bishop leaves its home rank for the first time
  const home = me === 'w' ? '1' : '8';
  if ((m.piece === 'n' || m.piece === 'b') && m.from[1] === home) f.develops = true;
  // central pawn move
  if (m.piece === 'p' && ['d', 'e'].includes(m.to[0]) && !m.captured) f.centre = true;
  // escape: the piece stood attacked and under-defended (or attacked by something cheaper)
  if (m.piece !== 'p' && m.piece !== 'k') {
    const a = att(pre, m.from, them);
    const cheaper = a.some((s) => VALUE[pre.get(s).type] < VALUE[m.piece]);
    if (a.length && (cheaper || att(pre, m.from, me).length === 0)) f.escapes = true;
  }

  // what the moved piece now attacks: loose pieces or bigger ones (not the king — that's check)
  for (const p of pieces(game, them)) {
    if (p.type === 'k') continue;
    const by = att(game, p.square, me);
    if (!by.includes(m.to)) continue;
    const defended = att(game, p.square, them).length > 0;
    if (!defended && p.type !== 'p') f.hits.push({ square: p.square, piece: p.type, reason: 'loose' });
    else if (!defended && p.type === 'p') f.hits.push({ square: p.square, piece: p.type, reason: 'loose' });
    else if (VALUE[p.type] > VALUE[m.piece]) f.hits.push({ square: p.square, piece: p.type, reason: 'bigger' });
  }
  // discovered: another of our pieces newly attacks a knight or bigger
  for (const p of pieces(game, them)) {
    if (p.type === 'p') continue;
    const now = att(game, p.square, me).filter((s) => s !== m.to);
    const was = att(pre, p.square, me);
    for (const s of now) if (!was.includes(s) && s !== m.from) f.discovered.push({ square: p.square, piece: p.type, by: s, byPiece: game.get(s).type });
  }
  // pins made by the moved slider: enemy piece, then enemy king or queen behind it
  for (const [df, dr] of DIRS[m.piece] ?? []) {
    const [a, b] = ray(game, m.to, df, dr);
    if (a && b && a.color === them && b.color === them && VALUE[b.type] > VALUE[a.type] && (b.type === 'k' || b.type === 'q' || b.type === 'r')) {
      f.pins.push({ square: a.square, piece: a.type, to: b.square, toPiece: b.type });
    }
  }
  // gambit: our pawn left en prise with no recapture material swing (simple: a pawn move to an attacked, undefended square)
  if (m.piece === 'p' && att(game, m.to, them).length && !att(game, m.to, me).length) f.gambit = true;
  return f;
}

/** One plain sentence from the facts — the default `why` when no source covers the move. */
export function factSentence(f, { you = true } = {}) {
  const P = (t) => NAME[t];
  const parts = [];
  if (f.castle) parts.push(`castles ${f.castle}side — the king is safe and the rook joins in`);
  else if (f.captured) parts.push(`${P(f.piece)} takes the ${P(f.captured)} on ${f.to}${f.recapture ? ' back' : ''}`);
  else if (f.piece === 'p') parts.push(`pawn to ${f.to}${f.centre ? ' — more space in the centre' : ''}`);
  else parts.push(`${P(f.piece)} to ${f.to}${f.develops ? ' — another piece out' : ''}${f.escapes ? ', out of danger' : ''}`);
  if (f.mate) parts.push('checkmate');
  else if (f.check) parts.push('check');
  const pin = f.pins[0];
  if (pin) parts.push(`pins the ${P(pin.piece)} on ${pin.square} to the ${P(pin.toPiece)}`);
  const hit = f.hits.find((h) => h.reason === 'bigger') ?? f.hits.find((h) => h.piece !== 'p') ?? f.hits[0];
  if (hit && !pin) parts.push(`attacks the ${hit.reason === 'loose' ? 'undefended ' : ''}${P(hit.piece)} on ${hit.square}`);
  const d = f.discovered[0];
  if (d && !hit) parts.push(`and opens the ${P(d.byPiece)} onto the ${P(d.piece)} on ${d.square}`);
  if (f.gambit && !f.captured) parts.push(`the pawn is offered`);
  const s = parts.join(', ');
  return s[0].toUpperCase() + s.slice(1) + '.';
}
