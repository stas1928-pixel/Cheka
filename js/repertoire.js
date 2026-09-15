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
   3. type      – "punishment" (opponent's move is inferior, you get a
                  concrete edge) or "tactical" (a forced sequence).

   HOW THESE LINES WERE CHOSEN (2026-09-15)
   - Main lines: the most-played master move at every ply
     (Lichess masters database).
   - Branches: every opponent move that actually appeared in stas1928's
     last 6 months of Chess.com games and was not yet covered. The reply
     is the move that scores best in the Lichess amateur database
     (blitz+rapid, 1400-1800), which is the population you actually face.
   - Branches are deliberately SHORT — one to three moves, just far
     enough to reach a clear plus. They are NOT engine-verified; job 7
     (Stockfish) will apply the brief's eval-cutoff rule and extend the
     ones where a forced punishment really exists.

   The tests in tests/repertoire.test.mjs prove every move is legal and
   written in the exact SAN chess.js produces, so training comparisons
   never fail on notation details like a missing "+".
--------------------------------------------------------------- */

export const OPENINGS = [
  {
    id: 'scotch',
    name: 'Scotch Gambit',
    subtitle: 'Max Lange Attack main line',
    side: 'w', // you play White
    // A game "is" this opening once its first 5 plies match the main line
    // (1.e4 e5 2.Nf3 Nc6 3.d4). Used by the Chess.com import to pick games.
    signaturePlies: 5,

    // 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.e5 d5 6.Bb5 Ne4 7.Nxd4 Bd7
    // 8.Bxc6 bxc6 9.O-O Bc5 10.f3 Ng5
    mainLine: [
      'e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6', 'e5', 'd5',
      'Bb5', 'Ne4', 'Nxd4', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'Bc5', 'f3', 'Ng5',
    ],

    branches: [
      /* ----- Black deviates at move 3, before taking on d4 ----- */
      {
        deviatesAt: 5,
        opponentMove: 'Nxd4', // 3...Nxd4?!
        response: ['Nxd4', 'exd4', 'Qxd4'],
        type: 'punishment',
        note: 'Black trades off their developed knight. Your queen is safe on d4 because the knight that would chase it (…Nc6) is gone.',
      },
      {
        deviatesAt: 5,
        opponentMove: 'd6', // 3...d6
        response: ['dxe5', 'dxe5', 'Qxd8+', 'Kxd8', 'Bc4'],
        type: 'punishment',
        note: 'Trading queens costs Black the right to castle. Bc4 eyes f7 and you are far ahead in development. (You have been playing 4.d5 here instead — also fine, but dxe5 scores better.)',
      },
      {
        deviatesAt: 5,
        opponentMove: 'f5', // 3...f5?! a Latvian-style lunge
        response: ['Nxe5', 'Nxe5', 'dxe5'],
        type: 'punishment',
        note: 'Just take. Black has weakened the king and cannot regain the pawn; you are simply a healthy pawn up.',
      },
      {
        deviatesAt: 5,
        opponentMove: 'Bd6', // 3...Bd6?! blocks the d-pawn
        response: ['d5'],
        type: 'punishment',
        note: 'Push past. The knight on c6 has to move again and Black’s own bishop blocks the d-pawn, so the queenside stays undeveloped.',
      },
      {
        deviatesAt: 5,
        opponentMove: 'Qf6', // 3...Qf6?! early queen
        response: ['Bg5'],
        type: 'punishment',
        note: 'Develop with tempo — the queen must move again while you finish developing.',
      },
      {
        deviatesAt: 5,
        opponentMove: 'Bb4+', // 3...Bb4+
        response: ['c3'],
        type: 'punishment',
        note: 'Block and build the centre. The bishop has to decide again, and after …dxc3 Nxc3 you are far ahead in development.',
      },

      /* ----- Black deviates at move 4, after 4.Bc4 ----- */
      {
        deviatesAt: 7,
        opponentMove: 'Bc5', // 4...Bc5 — the Haxo Gambit
        response: ['c3'],
        type: 'punishment',
        note: 'Offer the pawn back to rip the centre open. This is the single most common answer you face and it scores best for White.',
      },
      {
        deviatesAt: 7,
        opponentMove: 'h6', // 4...h6 — a wasted move
        response: ['Nxd4'],
        type: 'punishment',
        note: 'Black spent a move on nothing, so simply regain the pawn with a perfect centre.',
      },
      {
        deviatesAt: 7,
        opponentMove: 'Qf6', // 4...Qf6
        response: ['O-O'],
        type: 'punishment',
        note: 'Castle and stay ahead. The queen on f6 blocks Black’s own knight and will be a target down the f-file.',
      },

      /* ----- Black deviates at move 5, after 5.e5 ----- */
      {
        deviatesAt: 9,
        opponentMove: 'Ne4', // 5...Ne4 instead of 5...d5
        response: ['O-O'],
        type: 'punishment',
        note: 'Finish development first. The knight on e4 has no support and Black still has to solve the d4 pawn and the f7 square.',
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
    mainLine: [
      'e4', 'e5', 'Nf3', 'd5', 'exd5', 'e4', 'Qe2', 'Nf6', 'd3', 'Qxd5',
      'Nbd2', 'Bf5', 'g3', 'Nc6', 'Bg2', 'O-O-O', 'O-O', 'h5',
    ],

    branches: [
      /* ----- White deviates at move 3, instead of 3.exd5 ----- */
      {
        deviatesAt: 4,
        opponentMove: 'Nxe5', // 3.Nxe5 — the greedy grab
        response: ['Bd6'],
        type: 'punishment',
        note: 'Hit the knight at once. This is both the master choice and what you already play. Watch for 4.Nxf7?! — taking the fork loses for White here, Black scores 60%.',
      },
      {
        deviatesAt: 4,
        opponentMove: 'd3', // 3.d3
        response: ['dxe4'],
        type: 'punishment',
        note: 'Take and trade. After 4.dxe4 Qxd1+ the queens come off and you have easy, equal development — exactly what the gambit wanted.',
      },
      {
        deviatesAt: 4,
        opponentMove: 'Bd3', // 3.Bd3?! blocks the d-pawn
        response: ['dxe4'],
        type: 'punishment',
        note: 'Take with tempo. The bishop on d3 blocks White’s own d-pawn, so White is fighting their own position.',
      },

      /* ----- White deviates at move 4, after 3...e4 ----- */
      {
        deviatesAt: 6,
        opponentMove: 'Ng1', // 4.Ng1?! full retreat
        response: ['Nf6'],
        type: 'punishment',
        note: 'Develop and keep the e4 wedge — d5 is not running away, you pick it up next move. White has moved the same knight out and straight home again, so you are two tempi ahead. This is your most common surprise (7 games) and it is already what you play.',
      },
      {
        deviatesAt: 6,
        opponentMove: 'Nd4', // 4.Nd4
        response: ['Qxd5'],
        type: 'punishment',
        note: 'Regain the pawn and centralise. Black scores 55% here in the amateur database.',
      },
      {
        deviatesAt: 6,
        opponentMove: 'Bb5+', // 4.Bb5+
        response: ['c6'],
        type: 'punishment',
        note: 'Block with the pawn, not a piece. Black scores 63% from here — the check achieves nothing and the bishop will have to move again.',
      },
      {
        deviatesAt: 6,
        opponentMove: 'Ne5', // 4.Ne5
        response: ['Qxd5'],
        type: 'punishment',
        note: 'Regain the pawn AND attack the knight on e5 at the same time.',
      },

      /* ----- White deviates later in the main line ----- */
      {
        deviatesAt: 8,
        opponentMove: 'Ng5', // 5.Ng5 instead of 5.d3
        response: ['Be7'],
        type: 'punishment',
        note: 'Kick the knight while developing. Black scores 59% here, the best of any reply.',
      },
      {
        deviatesAt: 10,
        opponentMove: 'dxe4', // 6.dxe4 instead of 6.Nbd2
        response: ['Qxe4'],
        type: 'punishment',
        note: 'Take back and offer the queen trade. Queens come off and your development is fine.',
      },
      {
        deviatesAt: 12,
        opponentMove: 'dxe4', // 7.dxe4 instead of 7.g3
        response: ['Nxe4', 'Nxe4', 'Bxe4'],
        type: 'punishment',
        note: 'White grabs the pawn but gets it straight back. You keep the active pieces and the open lines the gambit was played for.',
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
