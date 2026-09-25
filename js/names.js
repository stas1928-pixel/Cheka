/* ---------------------------------------------------------------
   HUMAN LINE NAMES — what the app shows instead of notation
   (owner, 2026-09-25: "move strings read as gibberish").
   The library keeps the exact notation name for reference; these are
   short, memorable, and describe the idea of the line. Keyed by opening
   id → app line id. tests/names.test.mjs proves every shipped line has one.
--------------------------------------------------------------- */
export const NAMES = {
  scotch: {
    main: 'The Modern Attack',
    bc5: 'Bishop out first, then trade',
    'bc5-oo': 'They castle early — win c6',
    'bc5-bxd4': 'Bishop swap on d4',
    nd7: 'Knight retreats to d7',
    'be7-9': 'Quiet bishop — the f-pawn storm',
    'be7-9-ne4': 'Quiet bishop — knight back to e4',
    'be7-9-ng5': 'Knight hops to g5 and back',
    'be7-9-ng5-ne6': 'Knight to e6 — push f5',
    ng4: 'Knight jump — king stuck on f8',
    'ng4-be7-8': 'Knight jump — bishop blocks the check',
    'ng4-be7': 'Knight jump — slow bishop',
    'ng4-bc5': 'Knight jump — wreck the kingside',
    'ng4-trap': 'The pinned knight',
    ne4: 'Knight to e4 — kick it back',
    'ne4-be7': 'Knight to e4 — open the d-file',
    'ne4-be7-oo': 'Knight to e4 — win the pawn back',
    'qe7-trap': 'The pinned queen',
    haxo: 'Greco Gambit — the masters\' line',
    'haxo-bg4': 'Greco Gambit — bishop pin first',
    'haxo-f5': 'Greco Gambit — f5 break, take en passant',
    'haxo-bb4': 'Greco Gambit — bishop check',
    'haxo-trap': 'Greedy pawn grab — king to e8',
    'haxo-trap-kf8': 'Greedy pawn grab — king to f8',
    london: 'London — pin and break with e5',
    'london-qf6': 'London — queen to f6',
    'london-nge7': 'London — hit f7 at once',
    'london-trap': 'London — bishop falls on c5',
    'london-be7': 'London — queen fork on f7',
    'declined-d6': 'Pawn back — calm centre',
    'declined-d6-nxd4': 'Pawn back — queen in the centre',
    'declined-d6-be6': 'Pawn back — castle long and push',
    h6: 'Slow h6 — take the centre',
    hungarian: 'Hungarian — solid and cramped',
    'hungarian-nxd4': 'Hungarian — early knight trade',
    'hungarian-bxe5': 'Hungarian — the f7 check trick',
    'hungarian-nf6': 'Hungarian — push e5',
    'scotch-d6': 'Queens off, king in the middle',
    'nf6-3': 'Knight grabs e4 — the pin wins',
    'sur-max-lange': 'Max Lange Attack',
    'sur-nakhmanson': 'Castle and sacrifice e4',
    'sur-london-oo': 'London — two pawns for the attack',
  },
  elephant: {
    main: 'Paulsen — knight takes e4',
    'nc3-5-nxf6': 'Paulsen — trade on f6, grab b2',
    'nc3-6-rd1': 'Pin on c3 — rook to d1',
    'nc3-6-qd3': 'Pin on c3 — queen to d3',
    'nc3-6': 'The f6 trap — the knight hangs',
    'nc3-6-dxe4': 'Pin on c3 — early queen trade',
    'dxe4-6': 'Queens off — knight to c5',
    'dxe4-6-nc3': 'Queens off after the pin',
    nd4: 'Knight to d4 — attack the king',
    d4: 'Declined — hold e4',
    'nxe5-bc4-dxe5': 'Bishop takes e5 — king walk',
    'nxe5-bc4-dxe5-be2': 'Bishop takes e5 — trade and pressure',
    'nxe5-nc3-bf4': 'The book line — queens off',
    'nxe5-nc3-kxd1': 'The book line — king recaptures',
    'nxe5-nc4': 'Knight to c4 — develop fast',
    'nxe5-nc3': 'The book line',
    'nxe5-bc4': 'Queen trade — Karker\'s line',
    'nxe5-bc4-nc3': 'Queen trade — castle long',
    nxf7: 'The greedy fork on f7',
    'sur-maroczy': 'Bishop to d6 — the book system',
    'sur-maroczy-greek': 'The Greek gift on h2',
  },
};

/** Human name for a line; falls back to the stored name without leading notation. */
export function humanName(openingId, line) {
  return NAMES[openingId]?.[line.id] ?? line.name;
}

/** Family headers in plain words (the family key itself carries notation). */
const FAMILIES = {
  'Modern Attack (4...Nf6 5.e5 d5)': 'Modern Attack',
  '5...Ng4': 'Knight jump to g4',
  '5...Ne4': 'Knight jump to e4',
  '5...Qe7': 'Queen pin on e7',
  'Greco Gambit (4...Bc5 5.c3)': 'Greco Gambit',
  'London Defence (4...Bb4+)': 'London Defence',
  'Hungarian (4...Be7)': 'Hungarian Defence',
  'Paris (4...d6)': 'Pawn given back',
  '4...h6': 'Slow h6',
  '3rd-move sidelines': 'Early sidelines',
  'Surprise weapons': 'Surprise weapons',
  'Paulsen 5.Nc3': 'Paulsen — knight to c3',
  'Paulsen 5.d3 Qxd5 6.Nc3': 'Paulsen — the c3 pin',
  'Paulsen 5.d3 Qxd5 6.dxe4': 'Paulsen — early queen trade',
  '4.Nd4': 'Knight to d4',
  '3.Nxe5 Bd6': 'Knight takes e5',
  '3.d4 (declined)': 'Gambit declined',
};
export function familyName(openingId, key) {
  return FAMILIES[key] ?? key.replace(/\s*\(.*\)$/, '');
}
