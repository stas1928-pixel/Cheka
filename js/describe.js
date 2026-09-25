/* ---------------------------------------------------------------
   PLAIN-LANGUAGE MOVE DESCRIPTIONS — factual, never invented strategy.
   "Knight takes the pawn on d4", "Castles kingside", "Bishop to c4, check".
   Used in the Review tutorial and after correct moves until the sourced
   one-line ideas (PLAN item 11, a content job) exist for every position.
--------------------------------------------------------------- */
const PIECE = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
const LOWER = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

/** @param {object} m verbose chess.js move { piece, from, to, captured, flags, san } */
export function describeMove(m) {
  if (m.flags.includes('k')) return 'Castles kingside';
  if (m.flags.includes('q')) return 'Castles queenside';
  const who = PIECE[m.piece];
  let s;
  if (m.flags.includes('e')) s = `${who} takes en passant on ${m.to}`;
  else if (m.captured) s = `${who} takes the ${LOWER[m.captured]} on ${m.to}`;
  else if (m.piece === 'p') s = `Pawn to ${m.to}`;
  else s = `${who} to ${m.to}`;
  if (m.promotion) s += `, becomes a ${LOWER[m.promotion]}`;
  if (m.san.endsWith('#')) s += ' — checkmate';
  else if (m.san.endsWith('+')) s += ', check';
  return s;
}
