/* ---------------------------------------------------------------
   COACH VOICE — turns a move's facts (js/facts.js), an optional engine
   threat, and an optional sourced idea into what the coach says.
   Owner rules (2026-09-25): text only, no sound; never invent ideas —
   `say` only rephrases what the facts or the sourced `why` state, so every
   square it names comes from them (tests/coach.test.mjs checks this).
   Wording is picked deterministically per position so it never flickers.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';
import { NAME, factSentence } from './facts.js';

const cap = (s) => s[0].toUpperCase() + s.slice(1);
function pick(key, arr) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

/**
 * Keep an engine threat only if THIS move created it (the moved piece or a
 * piece it uncovered makes it) and it is not just the plain attack the facts
 * already name. Otherwise the coach would repeat or misattribute it.
 */
export function ownThreat(f, t) {
  if (!t) return null;
  if (t.mate) return t.from === f.to || f.discovered.some((d) => d.by === t.from) ? t : null;
  const made = t.from === f.to || f.discovered.some((d) => d.by === t.from);
  if (!made) return null;
  if (f.hits.some((h) => h.square === t.to) || f.pins.some((p) => p.square === t.to)) return null;
  return t;
}

/** Engine threat sentence: "threatens to take the knight on f6". */
export function threatText(t) {
  if (!t) return '';
  if (t.mate) return 'threatens checkmate';
  return `threatens to take the ${NAME[t.captured]} on ${t.to}`;
}

/**
 * @param {object} f facts from moveFacts
 * @param {{ mine: boolean, key: string, threat?: object }} o
 */
export function coachSay(f, { mine, key, threat = null }) {
  threat = ownThreat(f, threat);
  const P = NAME[f.piece];
  const pin = f.pins[0];
  const hit = f.hits.find((h) => h.reason === 'bigger') ?? f.hits.find((h) => h.piece !== 'p');
  let s;
  if (mine) {
    if (f.mate) s = pick(key, ['Checkmate! Beautiful.', 'That’s mate — take a bow!']);
    else if (f.castle) s = pick(key, ['King tucked away — castle!', 'Castle! King safe, rook in the game.', 'Time to castle.']);
    else if (f.captured && f.recapture) s = pick(key, ['Take back!', `Recapture with the ${P}.`, 'Win it back!']);
    else if (f.captured) s = pick(key, [`Grab the ${NAME[f.captured]}!`, `Snap — the ${NAME[f.captured]} on ${f.to} is ours!`, `${cap(P)} takes on ${f.to}!`]);
    else if (pin) s = pick(key, [`Pin it! The ${NAME[pin.piece]} is stuck to the ${NAME[pin.toPiece]}.`, `${cap(P)} pins the ${NAME[pin.piece]}!`]);
    else if (threat) s = pick(key, [`${cap(P)} to ${f.to} — and now it ${threatText(threat)}!`, `Sneaky! This ${threatText(threat)}.`]);
    else if (hit) s = pick(key, [`Hit the ${NAME[hit.piece]}!`, `${cap(P)} to ${f.to} — the ${NAME[hit.piece]} must run!`, `Kick the ${NAME[hit.piece]} on ${hit.square}!`]);
    else if (f.gambit) s = pick(key, ['Here, take it — we’re gambiting!', `Pawn to ${f.to} — go on, take it.`]);
    else if (f.piece === 'p' && f.centre) s = pick(key, ['Now we puuush the pawn!', `Pawn to ${f.to} — grab the centre!`, `Claim the centre with ${f.to}!`]);
    else if (f.piece === 'p') s = pick(key, [`Push the pawn to ${f.to}.`, `Pawn to ${f.to}.`]);
    else if (f.escapes) s = pick(key, [`${cap(P)} steps out of danger.`, `Save the ${P} — to ${f.to}.`]);
    else if (f.develops) s = pick(key, [`Out comes the ${P}!`, `${cap(P)} jumps into the game.`, `Develop — ${P} to ${f.to}.`]);
    else s = pick(key, [`${cap(P)} to ${f.to}.`, `Calmly, ${P} to ${f.to}.`]);
    if (f.check && !f.mate) s = s.replace(/[.!]$/, '') + ' — check!';
  } else {
    if (f.mate) s = 'Checkmate — they got us this time.';
    else if (f.check) s = pick(key, ['Check! Deal with it.', 'They give check — stay calm.']);
    else if (threat) s = pick(key, [`Careful — this ${threatText(threat)}.`, `Watch out: their ${P} ${threatText(threat)}.`]);
    else if (f.castle) s = pick(key, ['They castle.', 'Their king runs to safety.']);
    else if (f.captured && f.recapture) s = pick(key, ['They take back.', `They recapture on ${f.to}.`]);
    else if (f.captured) s = pick(key, [`They take our ${NAME[f.captured]} on ${f.to}.`, `They grab the ${NAME[f.captured]}.`]);
    else if (pin) s = `Their ${P} pins our ${NAME[pin.piece]}.`;
    else if (hit) s = pick(key, [`They hit our ${NAME[hit.piece]} — careful!`, `Our ${NAME[hit.piece]} on ${hit.square} is attacked.`]);
    else if (f.gambit) s = `They offer a pawn on ${f.to}.`;
    else if (f.piece === 'p') s = pick(key, [`They push to ${f.to}.`, `Pawn to ${f.to} from them.`]);
    else if (f.escapes) s = pick(key, [`Their ${P} escapes to ${f.to}.`, `The ${P} runs to ${f.to}.`]);
    else if (f.develops) s = pick(key, [`Their ${P} comes out.`, `They develop the ${P}.`]);
    else s = `Their ${P} goes to ${f.to}.`;
  }
  return s;
}

/** Default `why` when no source covers the move: board facts, plus the engine threat if unmistakable. */
export function defaultWhy(f, threat) {
  threat = ownThreat(f, threat);
  const base = factSentence(f);
  return threat ? base.replace(/\.$/, '') + `, and ${threatText(threat)}.` : base;
}

/** Teaching marks from facts: arrows as 'from-to', circles as squares. */
export function factMarks(f, threat) {
  threat = ownThreat(f, threat);
  const arrows = [], circles = [];
  const pin = f.pins[0];
  if (pin) { arrows.push(`${f.to}-${pin.to}`); circles.push(pin.square); }
  for (const h of f.hits.filter((h) => h.reason === 'bigger' || h.piece !== 'p').slice(0, 2)) { arrows.push(`${f.to}-${h.square}`); circles.push(h.square); }
  for (const d of f.discovered.slice(0, 1)) arrows.push(`${d.by}-${d.square}`);
  if (threat && !threat.mate) { arrows.push(`${threat.from}-${threat.to}`); circles.push(threat.to); }
  return { arrows: [...new Set(arrows)], circles: [...new Set(circles)] };
}

/* ---------- plans in plain words + plan marks for the end of Watch ---------- */
const PIECE_WORD = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' };
/** A move token without its dots/number → words: "Qxc3" → "queen takes on c3", "O-O-O" → "castle long". */
function sanWords(tok) {
  const t = tok.replace(/[+#!?]+$/, '');
  const chk = /\+$/.test(tok.replace(/[!?]+$/, '')) ? ' with check' : /#/.test(tok) ? ' with mate' : '';
  if (/^O-O-O$/.test(t)) return 'castle long' + chk;
  if (/^O-O$/.test(t)) return 'castle' + chk;
  let m = t.match(/^([KQRBN])[a-h]?[1-8]?(x?)([a-h][1-8])$/);
  if (m) return `${PIECE_WORD[m[1]]} ${m[2] ? 'takes on' : 'to'} ${m[3]}${chk}`;
  m = t.match(/^([a-h])x([a-h][1-8])$/);
  if (m) return `pawn takes on ${m[2]}${chk}`;
  return null;
}
/**
 * Plan text with move notation turned into words. Squares ("f5", "c5") stay —
 * they are readable; piece moves, captures, castling and move numbers go.
 */
export function plainNotation(text) {
  return text
    // "Rf1-f3", "Nbd2-e4": a piece route
    .replace(/(?:\d+\.{1,3}\s?|\.\.\.|…)?\b([KQRBN])[a-h]?([a-h][1-8])-([a-h][1-8])\b/g, (_, p, a, b) => `${PIECE_WORD[p]} to ${a} and on to ${b}`)
    // single tokens, optionally preceded by a move number or dots
    .replace(/(?:\b\d+\.{1,3}\s?|\.\.\.|…)?(\bO-O-O\b|\bO-O\b|\b[KQRBN][a-h]?[1-8]?x?[a-h][1-8][+#]?|\b[a-h]x[a-h][1-8][+#]?)/g, (all, tok) => sanWords(tok) ?? all)
    // leftover dots and move numbers in front of pawn moves: "...c5" → "c5", "11...Rb8" handled above
    .replace(/(?:\b\d+\.{1,3}\s?|\.\.\.|…)(?=[a-h][1-8])/g, '')
    // "bishop to e3/queen to d3", "e5/f5" → "… or …"
    .replace(/([a-h][1-8]|castle(?: long)?)\/(?=(king|queen|rook|bishop|knight|pawn|castle|[a-h][1-8])\b)/g, '$1 or ');
}

/**
 * Board marks for a sourced plan: our moves named in the plan that are legal
 * from the final position become arrows; squares they name get circles.
 * Nothing is added that the plan text does not name.
 */
export function planMarks(sans, plan, side) {
  if (!plan) return { arrows: [], circles: [] };
  const g = new Chess();
  for (const s of sans) g.move(s);
  const parts = g.fen().split(' ');
  if (parts[1] !== side) { parts[1] = side; parts[3] = '-'; }
  let base;
  try { base = new Chess(parts.join(' ')); } catch { return { arrows: [], circles: [] }; }
  const arrows = [], circles = [];
  const toks = plan.match(/(?<![-\w])(?:\.\.\.|…)?(?:\bO-O(?:-O)?\b|\b[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|\b[a-h]x[a-h][1-8]|\b[a-h][1-8]\b)/g) ?? [];
  for (const raw of toks) {
    const dotted = /^(\.\.\.|…)/.test(raw);
    if ((side === 'b') !== dotted && /[A-Z]|x/.test(raw)) continue;   // the other side's move
    const tok = raw.replace(/^(\.\.\.|…)/, '');
    let mv = null;
    try { mv = new Chess(base.fen()).move(tok); } catch { mv = null; }
    if (mv && !(mv.piece === 'p' && !mv.captured && /^[a-h][1-8]$/.test(tok) && (side === 'b') !== dotted && dotted)) {
      if (arrows.length < 3 && !arrows.includes(`${mv.from}-${mv.to}`)) arrows.push(`${mv.from}-${mv.to}`);
    } else if (/^[a-h][1-8]$/.test(tok) && circles.length < 3 && !circles.includes(tok)) circles.push(tok);
  }
  return { arrows, circles: circles.filter((c) => !arrows.some((a) => a.endsWith(c))) };
}
