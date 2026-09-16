/* ---------------------------------------------------------------
   THE REPERTOIRE — the two openings, stored as a small tree.

   Vocabulary used everywhere in this project:
   - SAN  = Standard Algebraic Notation for one move: "Nf3", "exd4", "O-O".
   - ply  = one half-move. mainLine[0] is White's first move (ply 0),
            mainLine[1] is Black's reply (ply 1), and so on.
            Even plies are always White, odd plies are always Black.

   Each opening has three layers (see PROJECT_BRIEF.md):
   1. mainLine  – the line you memorise, as a flat list of SAN.
   2. branches  – what to do when the OPPONENT leaves the main line.
                  A branch says: "at ply `deviatesAt` the opponent played
                  `opponentMove` instead of mainLine[deviatesAt]; here is
                  your `response`" (SAN list, alternating you / opponent,
                  starting with YOUR move).
   3. type      – "punishment" (opponent's move is inferior, you get a
                  concrete edge) or "tactical" (a forced sequence).

   HOW THESE LINES WERE CHOSEN (2026-09-15/16)
   - Which opponent moves get a branch: every move that appeared in
     stas1928's last 6 months of Chess.com games (421 games) and was not
     already covered.
   - Replies: chosen by best score in the Lichess amateur database
     (blitz+rapid, 1400-1800) — the population actually faced — then
     verified with Stockfish 18 at depth 16 via the Engine check panel.
   - Length: the brief's cutoff rule. Big edge (≥ +1.5) within 6 moves →
     the line runs to that point. Otherwise it stops at the first ≥ +0.5.
     Where the opponent's move is simply sound ("Engine: … sound"), the
     branch is kept as a one-move "know the reply", nothing to extend.
   - Numbers in the notes are from YOUR point of view: + is good for you.

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
    // Most-played master move at every ply (Lichess masters, 2026-09-15).
    // Engine: about +0.0 to +0.2 throughout — a level, lively position.
    mainLine: [
      'e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6', 'e5', 'd5',
      'Bb5', 'Ne4', 'Nxd4', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'Bc5', 'f3', 'Ng5',
    ],

    branches: [
      /* ----- Black deviates at move 3, before taking on d4 ----- */
      {
        deviatesAt: 5,
        opponentMove: 'Nxd4', // 3...Nxd4?!
        response: ['Nxd4'],
        type: 'punishment',
        note: 'Just recapture. Black has traded the developed knight for nothing and you are ahead in development. Engine: +0.5 at once; nothing bigger follows, so the line stops here.',
      },
      {
        deviatesAt: 5,
        opponentMove: 'd6', // 3...d6
        response: ['d5'],
        type: 'punishment',
        note: 'Push past: the knight must retreat to b8 or e7 and Black is cramped. This is what you already play. Engine: +0.8, better than the queen trade (+0.4).',
      },
      {
        deviatesAt: 5,
        opponentMove: 'f5', // 3...f5?! a Latvian-style lunge
        response: ['Nxe5', 'Nxe5', 'dxe5'],
        type: 'punishment',
        note: 'Just take. Black has weakened the king and cannot regain the pawn. Engine: +2.0 after two moves — a real punishment.',
      },
      {
        deviatesAt: 5,
        opponentMove: 'Bd6', // 3...Bd6?! blocks the d-pawn
        response: ['d5'],
        type: 'punishment',
        note: 'Push past. The knight on c6 has to move again and Black’s own bishop blocks the d-pawn, so the queenside stays undeveloped. Engine: +0.8.',
      },
      {
        deviatesAt: 5,
        opponentMove: 'Qf6', // 3...Qf6?! early queen
        response: ['Bg5', 'Qg6', 'dxe5'],
        type: 'punishment',
        note: 'Develop with tempo, then take the pawn once the queen has left f6. Engine: +0.6 after two moves.',
      },
      {
        deviatesAt: 5,
        opponentMove: 'Bb4+', // 3...Bb4+
        response: ['c3', 'Bd6', 'Bd3'],
        type: 'punishment',
        note: 'Block, then develop while the bishop keeps wandering. Engine: +1.6 after two moves — Black has lost time and the centre.',
      },

      /* ----- Black deviates at move 4, after 4.Bc4 ----- */
      {
        deviatesAt: 7,
        opponentMove: 'Bc5', // 4...Bc5 — the Haxo Gambit
        response: ['c3'],
        type: 'punishment',
        note: 'Your most common surprise (8 games). Engine: 4...Bc5 is sound — c3 keeps it level (+0.1) and scores best for White in practice. Know the reply; there is nothing to punish.',
      },
      {
        deviatesAt: 7,
        opponentMove: 'h6', // 4...h6 — a wasted move
        response: ['Nxd4'],
        type: 'punishment',
        note: 'Black spent a move on nothing, so simply regain the pawn with a perfect centre. Engine: +0.6.',
      },
      {
        deviatesAt: 7,
        opponentMove: 'Qf6', // 4...Qf6
        response: ['O-O'],
        type: 'punishment',
        note: 'Castle and stay ahead. The queen on f6 blocks Black’s own knight and will be a target down the f-file. Engine: +1.0.',
      },

      /* ----- Black deviates at move 5, after 5.e5 ----- */
      {
        deviatesAt: 9,
        opponentMove: 'Ne4', // 5...Ne4 instead of 5...d5
        response: ['O-O'],
        type: 'punishment',
        note: 'Finish development first. Engine: 5...Ne4 is sound (+0.2); O-O is the best reply and there is nothing to extend.',
      },
    ],
  },

  {
    id: 'elephant',
    name: 'Elephant Gambit',
    subtitle: 'Main line with 6...Nc6',
    side: 'b', // you play Black
    // 1.e4 e5 2.Nf3 d5 — four plies identify the gambit.
    signaturePlies: 4,

    // 1.e4 e5 2.Nf3 d5 3.exd5 e4 4.Qe2 Nf6 5.d3 Qxd5 6.Nbd2 Nc6
    // 7.dxe4 Qh5 8.Qb5 Bc5 9.Nb3 Nxe4 10.Be3 Bb4+
    // Moves 1-6 are the master main line. From 6...Nc6 on, masters have too
    // few games, so both sides are Stockfish 18 at depth 16 (2026-09-16).
    // The engine replaced the earlier 6...Bf5, which loses a pawn to 7.dxe4.
    // Black stands about -1.0 here: that is the gambit's price, not a bug.
    mainLine: [
      'e4', 'e5', 'Nf3', 'd5', 'exd5', 'e4', 'Qe2', 'Nf6', 'd3', 'Qxd5',
      'Nbd2', 'Nc6', 'dxe4', 'Qh5', 'Qb5', 'Bc5', 'Nb3', 'Nxe4', 'Be3', 'Bb4+',
    ],

    branches: [
      /* ----- White deviates at move 3, instead of 3.exd5 ----- */
      {
        deviatesAt: 4,
        opponentMove: 'Nxe5', // 3.Nxe5 — the greedy grab (8 of your games)
        response: ['Bd6'],
        type: 'punishment',
        note: 'Hit the knight at once — the master choice and what you already play. Engine: 3.Nxe5 is sound (you are -0.8, the usual gambit price); 3...dxe4 is a hair better but riskier. Watch for 4.Nxf7?! which loses for White.',
      },
      {
        deviatesAt: 4,
        opponentMove: 'd3', // 3.d3
        response: ['dxe4'],
        type: 'punishment',
        note: 'Take and trade. After 4.dxe4 Qxd1+ the queens come off with easy development. Engine: dead level (0.0), better than any alternative for Black.',
      },
      {
        deviatesAt: 4,
        opponentMove: 'Bd3', // 3.Bd3?! blocks the d-pawn
        response: ['dxe4'],
        type: 'punishment',
        note: 'Take with tempo. The bishop on d3 blocks White’s own d-pawn. Engine: +1.7 at once — a real punishment.',
      },

      /* ----- White deviates at move 4, after 3...e4 ----- */
      {
        deviatesAt: 6,
        opponentMove: 'Ng1', // 4.Ng1?! full retreat (7 of your games)
        response: ['Nf6'],
        type: 'punishment',
        note: 'Develop and keep the e4 wedge; d5 is not running away. Engine: level (0.0) — White’s two wasted tempi exactly repay the gambit pawn. Already what you play.',
      },
      {
        deviatesAt: 6,
        opponentMove: 'Nd4', // 4.Nd4
        response: ['Qxd5'],
        type: 'punishment',
        note: 'Regain the pawn and centralise. Engine: +0.2 — you are fine, nothing more to extend.',
      },
      {
        deviatesAt: 6,
        opponentMove: 'Bb5+', // 4.Bb5+
        response: ['c6'],
        type: 'punishment',
        note: 'Block with the pawn, not a piece. Engine: +1.8 at once — the check achieves nothing and the bishop must move again. Black scores 63% here in practice.',
      },
      {
        deviatesAt: 6,
        opponentMove: 'Ne5', // 4.Ne5
        response: ['Qxd5'],
        type: 'punishment',
        note: 'Regain the pawn and attack the knight on e5 at the same time. Engine: level (+0.1).',
      },

      /* ----- White deviates later in the main line ----- */
      {
        deviatesAt: 8,
        opponentMove: 'Ng5', // 5.Ng5 instead of 5.d3
        response: ['Be7'],
        type: 'punishment',
        note: 'Kick the knight while developing. Engine: +0.2, the best reply; Black scores 59% here in practice.',
      },
      {
        deviatesAt: 10,
        opponentMove: 'dxe4', // 6.dxe4 instead of 6.Nbd2
        response: ['Qxe4'],
        type: 'punishment',
        note: 'Take back and offer the queen trade. Engine: -0.5 — White’s move is sound and this is the best you have. Know the reply.',
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
