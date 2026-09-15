/* ---------------------------------------------------------------
   THE REPERTOIRE — the two openings, stored as a small tree.

   Vocabulary used everywhere in this project:
   - SAN  = Standard Algebraic Notation for one move: "Nf3", "exd4", "O-O".
   - ply  = one half-move. mainLine[0] is White's first move (ply 0),
            mainLine[1] is Black's reply (ply 1), and so on.
            Even plies are always White, odd plies are always Black.

   Each opening has three layers (see PROJECT_BRIEF.md):
   1. mainLine  – the theory line you memorise, as a flat list of SAN.
   2. branches  – what to do when the OPPONENT leaves the main line.
                  A branch says: "at ply `deviatesAt` the opponent played
                  `opponentMove` instead of mainLine[deviatesAt]; here is
                  your `response`" (SAN list, alternating you / opponent,
                  starting with YOUR move).
   3. type      – "punishment" (opponent's move is inferior, you gain an
                  edge) or "tactical" (a forced sequence, follow it to
                  the end).

   Everything here was written by hand on 2026-09-15. The Lichess
   Explorer (job 6) and Stockfish (job 7) are the tools for checking and
   extending these lines later — the notes below flag what to verify.
   The tests in tests/repertoire.test.mjs prove every move is legal and
   written in the exact SAN chess.js produces, so training comparisons
   never fail on notation details like a missing "+".
--------------------------------------------------------------- */

export const OPENINGS = [
  {
    id: 'scotch',
    name: 'Scotch Opening',
    subtitle: 'Scotch Four Knights',
    side: 'w', // you play White
    // A game "is" this opening once its first 5 plies match the main line
    // (1.e4 e5 2.Nf3 Nc6 3.d4). Used by the Chess.com import to pick games.
    signaturePlies: 5,

    // 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Bb4 6.Nxc6 bxc6
    // 7.Bd3 d5 8.exd5 cxd5 9.O-O O-O 10.Bg5 c6
    mainLine: [
      'e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nc3', 'Bb4',
      'Nxc6', 'bxc6', 'Bd3', 'd5', 'exd5', 'cxd5', 'O-O', 'O-O', 'Bg5', 'c6',
    ],

    branches: [
      {
        // 3...Nxd4?! instead of 3...exd4
        deviatesAt: 5,
        opponentMove: 'Nxd4',
        response: ['Nxd4', 'exd4', 'Qxd4'],
        type: 'punishment',
        note: 'Black trades the developed knight. The queen is safe in the centre because there is no longer a knight to kick it with ...Nc6.',
      },
      {
        // 3...d6? instead of 3...exd4
        deviatesAt: 5,
        opponentMove: 'd6',
        response: ['dxe5', 'dxe5', 'Qxd8+', 'Kxd8', 'Bc4'],
        type: 'punishment',
        note: 'Trading queens costs Black the right to castle. Bc4 eyes f7 and White is far ahead in development.',
      },
      {
        // 4...Nxd4?! instead of 4...Nf6
        deviatesAt: 7,
        opponentMove: 'Nxd4',
        response: ['Qxd4', 'd6', 'Nc3', 'Nf6', 'Bg5'],
        type: 'punishment',
        note: 'Same idea one move later: a centralised queen that cannot be chased away, then simple development.',
      },
    ],
  },

  {
    id: 'elephant',
    name: 'Elephant Gambit',
    subtitle: 'Main line with ...Bf5 and long castling',
    side: 'b', // you play Black
    // 1.e4 e5 2.Nf3 d5 — four plies identify the gambit.
    signaturePlies: 4,

    // 1.e4 e5 2.Nf3 d5 3.exd5 e4 4.Qe2 Nf6 5.d3 Qxd5 6.Nbd2 Bf5
    // 7.g3 Nc6 8.Bg2 O-O-O 9.O-O h5
    // TODO (job 6): confirm 7.g3 vs 7.dxe4 frequencies with the explorer.
    mainLine: [
      'e4', 'e5', 'Nf3', 'd5', 'exd5', 'e4', 'Qe2', 'Nf6', 'd3', 'Qxd5',
      'Nbd2', 'Bf5', 'g3', 'Nc6', 'Bg2', 'O-O-O', 'O-O', 'h5',
    ],

    branches: [
      {
        // 3.Nxe5?! instead of 3.exd5 — the classic Elephant trap
        deviatesAt: 4,
        opponentMove: 'Nxe5',
        response: ['dxe4', 'Bc4', 'Qg5'],
        type: 'tactical',
        note: 'After 4.Bc4 the queen hits g2 and e5 at once and White loses material. If White plays 4.d4 instead, 4...Bd6 is the calm answer.',
      },
      {
        // 7.dxe4 instead of 7.g3
        deviatesAt: 12,
        opponentMove: 'dxe4',
        response: ['Nxe4', 'Nxe4', 'Bxe4'],
        type: 'punishment',
        note: 'White grabs the pawn but gets it straight back. Black keeps the active pieces and the open lines the gambit was played for.',
      },
    ],
  },
];

/** Look an opening up by its id ("scotch" / "elephant"). */
export function getOpening(id) {
  const opening = OPENINGS.find((o) => o.id === id);
  if (!opening) throw new Error(`Unknown opening: ${id}`);
  return opening;
}
