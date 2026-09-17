/* ---------------------------------------------------------------
   CURATED REPERTOIRE SEED — hand-written from theory, then verified
   with Stockfish by tools/verify-repertoire.mjs (which writes
   js/repertoire.data.js).

   Rules:
   - `moves` is the theory part: sourced, named, human. A line ends where
     the theory (and the idea) ends — no engine tails for their own sake.
   - `extendTo` (optional) lets the engine add best play for BOTH sides up
     to that many plies where a line would otherwise stop too early to be
     drilled (min 4 of our moves).
   - kind 'main' = a sound choice by the opponent that you must know.
     kind 'side' = an inferior move with the punishment; `claim` says what
     the line wins, and the verifier flags it if the engine disagrees
     (final eval below `minCp`, default +0.5).
   - Our side plays ONE move per position across all lines (verifier
     flags a REPEAT otherwise).
   - Comments "tested" record moves the engine rejected on 2026-09-17 and
     what replaced them.

   Sources (see docs/sources.md, 2026-09-17):
   [W-Scotch]  Wikipedia "Scotch Game" — Scotch Gambit section, citing
               Wells (1998), Lane (1993), Dembo & Palliser (2011)
   [W-MaxL]    Wikipedia "Max Lange Attack"
   [W-Eleph]   Wikipedia "Elephant Gambit" (de Firmian; Tal–Lutikov 1964;
               Lob–Eliskases 1929)
   [CD]        chessdoctrine.com Scotch Gambit variations & traps
   [CM]        chessmood.com "Refute the Elephant Gambit" (White's best tries)
   [CB]        chessable.com Elephant Gambit guide
   [Lichess]   masters database figures gathered 2026-09-15 (see sources.md)
   [Games]     stas1928's Chess.com games: how often opponents actually
               played the move (last 6 months, 427 games)
   [SF]        Stockfish 18 depth 18 — our move where theory is silent
--------------------------------------------------------------- */

const S = ['e4', 'e5', 'Nf3', 'Nc6', 'd4'];                 // Scotch root
const SG = [...S, 'exd4', 'Bc4'];                          // Scotch Gambit
const E = ['e4', 'e5', 'Nf3', 'd5'];                        // Elephant root

export const SEED = [
  {
    id: 'scotch', name: 'Scotch Gambit', side: 'w', signaturePlies: 5,
    lines: [
      /* ----- TRUNK ----- */
      { id: 'main', name: 'Max Lange Attack', kind: 'main',
        moves: [...SG, 'Nf6', 'e5', 'd5', 'Bb5', 'Ne4', 'Nxd4', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'Bc5', 'f3', 'Ng5', 'Be3'],
        sources: ['W-Scotch', 'CD', 'Lichess'] },

      /* ----- MAIN VARIATIONS: sound Black choices ----- */
      { id: 'max-lange-bc5', name: 'Max Lange, 7...Bc5', kind: 'main',
        moves: [...SG, 'Nf6', 'e5', 'd5', 'Bb5', 'Ne4', 'Nxd4', 'Bc5', 'Be3', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'O-O', 'f3', 'Ng5'],
        sources: ['Lichess'] },
      { id: 'ng4', name: '5...Ng4', kind: 'main',
        moves: [...SG, 'Nf6', 'e5', 'Ng4', 'O-O'], extendTo: 16,          // tested: 6.Qe2 −0.7 vs 6.O-O
        sources: ['W-Scotch', 'Lichess', 'SF'] },
      { id: 'ne4', name: '5...Ne4', kind: 'main',
        moves: [...SG, 'Nf6', 'e5', 'Ne4', 'Qe2', 'Nc5', 'O-O'], extendTo: 16,
        sources: ['Lichess', 'Games', 'SF'] },
      { id: 'haxo', name: 'Haxo Gambit → Giuoco Piano, 7.Bd2', kind: 'main',
        // tested: 7.Nc3 (Møller Attack) −0.5 vs 7.Bd2 — this is the classical main line
        moves: [...SG, 'Bc5', 'c3', 'Nf6', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'd5', 'exd5', 'Nxd5', 'Qb3', 'Nce7', 'O-O', 'O-O', 'Rfe1', 'c6'],
        sources: ['W-Scotch', 'CD'] },
      { id: 'haxo-bb6', name: 'Haxo Gambit, 6...Bb6', kind: 'main',
        moves: [...SG, 'Bc5', 'c3', 'Nf6', 'cxd4', 'Bb6', 'e5'], extendTo: 16,   // tested: 7.Nc3 −0.7; 7.e5 Ng4 then NOT 8.O-O (−0.6), engine picks
        sources: ['W-Scotch', 'SF'] },
      { id: 'london', name: 'London Defence (4...Bb4+)', kind: 'main',
        moves: [...SG, 'Bb4+', 'c3', 'dxc3', 'bxc3', 'Ba5', 'O-O', 'd6', 'Qb3', 'Qd7'], extendTo: 16,   // tested: 9.Ng5?/10.Ba3? −1.5
        sources: ['W-Scotch', 'CD', 'SF'] },
      { id: 'hungarian', name: 'Hungarian Defence (4...Be7)', kind: 'main',
        moves: [...SG, 'Be7', 'Nxd4', 'd6', 'O-O', 'Nf6', 'Nc3', 'O-O', 'h3', 'Nxd4', 'Qxd4', 'Be6', 'Bxe6', 'fxe6'],
        sources: ['W-Scotch', 'CD'] },
      { id: 'declined-d6', name: '4...d6 (gambit declined)', kind: 'main',
        moves: [...SG, 'd6', 'Nxd4', 'Nf6', 'Nc3', 'Be7', 'O-O', 'O-O', 'h3', 'Nxd4', 'Qxd4', 'Be6', 'Bxe6', 'fxe6'],
        sources: ['CD'] },
      { id: 'scotch-d6', name: '3...d6 (Scotch declined)', kind: 'main',
        moves: [...S, 'd6', 'd5', 'Nce7', 'c4', 'Ng6', 'Nc3', 'Nf6', 'Bd3', 'Be7', 'O-O', 'O-O', 'h3'],
        sources: ['W-Scotch', 'Games'] },
      { id: 'h6', name: '4...h6 (passive)', kind: 'main',        // tested: only +0.3, so a variation to know, not a punishment
        moves: [...SG, 'h6', 'Nxd4', 'Nf6', 'Nxc6', 'bxc6', 'e5'], extendTo: 15,
        sources: ['Games', 'SF'] },

      /* ----- SIDE LINES: mistakes and their punishment ----- */
      { id: 'haxo-trap', name: 'Haxo accepted, 6.Bxf7+!', kind: 'side', minCp: 30,
        claim: 'the bishop comes back with the king dragged out; White ahead in development',
        moves: [...SG, 'Bc5', 'c3', 'dxc3', 'Bxf7+', 'Kxf7', 'Qd5+', 'Kf8', 'Qxc5+', 'd6', 'Qxc3'], extendTo: 17,   // tested: 10.O-O −0.5 vs Nbd2
        sources: ['W-Scotch', 'CD', 'SF'] },
      { id: 'london-trap', name: 'London Defence trap, 6...Bc5?', kind: 'side',
        claim: 'the same Bxf7+ fork wins a piece',
        moves: [...SG, 'Bb4+', 'c3', 'dxc3', 'bxc3', 'Bc5', 'Bxf7+', 'Kxf7', 'Qd5+', 'Kf8', 'Qxc5+', 'd6', 'Qc4'],
        sources: ['CD'] },
      { id: 'lolli', name: 'Lolli Variation, 3...Nxd4', kind: 'side',
        claim: 'centralised queen Black cannot chase; small but lasting plus',
        moves: [...S, 'Nxd4', 'Nxd4', 'exd4', 'Qxd4', 'Ne7', 'Bc4', 'Nc6', 'Qd5', 'Qf6', 'O-O', 'Ne5', 'Be2'],
        sources: ['W-Scotch'] },
      { id: 'qf6-4', name: '4...Qf6?!', kind: 'side', claim: 'early queen: develop with tempo',
        moves: [...SG, 'Qf6', 'O-O', 'd6', 'c3'], extendTo: 15,
        sources: ['Games', 'SF'] },
      { id: 'f5', name: '3...f5?!', kind: 'side', claim: 'wins a pawn and exposes the king',
        moves: [...S, 'f5', 'Nxe5', 'Nxe5', 'dxe5', 'fxe4'], extendTo: 15,   // tested: 6.Qh5+ −0.7 vs Nc3
        sources: ['Games', 'SF'] },
      { id: 'bd6', name: '3...Bd6?!', kind: 'side', claim: 'the bishop blocks its own d-pawn; d5 cramps Black',
        moves: [...S, 'Bd6', 'd5', 'Nce7', 'c4'], extendTo: 15,
        sources: ['W-Scotch', 'Games', 'SF'] },
      { id: 'qf6-3', name: '3...Qf6?!', kind: 'side', minCp: 30, claim: 'd5 hits the knight and the queen is misplaced',
        moves: [...S, 'Qf6', 'd5'], extendTo: 15,                           // tested: 4.Bg5 −0.8 vs 4.d5
        sources: ['Games', 'SF'] },
      { id: 'bb4-3', name: '3...Bb4+?!', kind: 'side', claim: 'the bishop is kicked around while White develops',
        moves: [...S, 'Bb4+', 'c3', 'Ba5', 'd5'], extendTo: 15,                 // tested: 5.dxe5 −0.5 vs 5.d5
        sources: ['Games', 'SF'] },
    ],
  },

  {
    id: 'elephant', name: 'Elephant Gambit', side: 'b', signaturePlies: 4,
    lines: [
      /* ----- TRUNK: Paulsen Countergambit vs White's best ----- */
      { id: 'main', name: 'Paulsen Countergambit', kind: 'main',
        moves: [...E, 'exd5', 'e4', 'Qe2', 'Nf6', 'd3', 'Qxd5', 'Nbd2', 'Be7', 'dxe4', 'Qe6', 'Nb3'], extendTo: 18,   // tested: 8...O-O −0.5, 9...Rd8 −1.1; engine regains the pawn with 8...Qxe4
        sources: ['W-Eleph', 'CM', 'Lichess', 'SF'] },

      /* ----- MAIN VARIATIONS: sound White choices ----- */
      { id: 'nc3-5', name: '5.Nc3 (avoids the pin)', kind: 'main',
        moves: [...E, 'exd5', 'e4', 'Qe2', 'Nf6', 'Nc3', 'Be7', 'Nxe4', 'O-O', 'Nxf6+', 'Bxf6', 'Qc4', 'Re8+', 'Be2'], extendTo: 18,   // tested: 9...Nd7 −0.6
        sources: ['W-Eleph', 'CM', 'SF'] },
      { id: 'nc3-6', name: '6.Nc3 Bb4!', kind: 'main',
        moves: [...E, 'exd5', 'e4', 'Qe2', 'Nf6', 'd3', 'Qxd5', 'Nc3', 'Bb4', 'Bd2', 'Bxc3', 'Bxc3', 'O-O', 'dxe4'], extendTo: 16,   // tested: 9...Qe6 −2.0 (9...Nxe4)
        sources: ['CM', 'Games', 'SF'] },
      { id: 'dxe4-6', name: '6.dxe4 queen trade', kind: 'main',
        moves: [...E, 'exd5', 'e4', 'Qe2', 'Nf6', 'd3', 'Qxd5', 'dxe4', 'Qxe4', 'Qxe4+', 'Nxe4', 'Bd3', 'Nc5', 'Bb5+', 'c6', 'Be2', 'Nba6'],
        sources: ['Games'] },
      { id: 'ne5', name: '4.Ne5', kind: 'main',
        moves: [...E, 'exd5', 'e4', 'Ne5', 'Qxd5', 'd4', 'exd3', 'Nxd3', 'Nc6', 'Nc3', 'Qa5'], extendTo: 16,
        sources: ['W-Eleph', 'Games', 'SF'] },
      { id: 'nd4', name: '4.Nd4', kind: 'main',
        moves: [...E, 'exd5', 'e4', 'Nd4', 'Qxd5', 'c3', 'Nc6', 'Nb5', 'Qe5'], extendTo: 16,
        sources: ['Games', 'SF'] },
      { id: 'ng5', name: '5.Ng5', kind: 'main',
        moves: [...E, 'exd5', 'e4', 'Qe2', 'Nf6', 'Ng5', 'Be7', 'Nxe4', 'O-O'], extendTo: 16,
        sources: ['Games', 'SF'] },
      // tested at depth 22: 3...dxe4 −0.87 (4.Bc4! is best; the "Wasp" 4...Qg5 is the worst reply at −1.16)
      // vs 3...Bd6 −0.65 — so Bd6, which is also masters' 63% choice and the owner's habit.
      { id: 'nxe5', name: '3.Nxe5 Bd6', kind: 'main',
        moves: [...E, 'Nxe5', 'Bd6', 'd4', 'dxe4', 'Bc4'], extendTo: 16,
        sources: ['W-Eleph', 'CM', 'Lichess', 'Games', 'SF'] },
      { id: 'nxe5-nf3', name: '3.Nxe5 Bd6 4.Nf3 (retreat)', kind: 'main',
        moves: [...E, 'Nxe5', 'Bd6', 'Nf3', 'dxe4'], extendTo: 14,
        sources: ['Games', 'SF'] },
      { id: 'd4', name: '3.d4 (Elephant declined)', kind: 'main',
        moves: [...E, 'd4', 'dxe4', 'Nxe5', 'Nd7', 'Nxd7', 'Bxd7', 'Bc4', 'Nf6'], extendTo: 16,
        sources: ['Games', 'SF'] },
      { id: 'd3', name: '3.d3 (quiet)', kind: 'main',
        moves: [...E, 'd3', 'dxe4', 'dxe4', 'Qxd1+', 'Kxd1', 'Nf6', 'Nc3', 'Bc5'], extendTo: 16,
        sources: ['Games', 'SF'] },
      { id: 'nc3-3', name: '3.Nc3', kind: 'main',
        moves: [...E, 'Nc3', 'dxe4', 'Nxe4', 'Nc6', 'Bb5', 'Bd7'], extendTo: 16,
        sources: ['W-Eleph', 'SF'] },

      /* ----- SIDE LINES ----- */
      { id: 'ng1', name: '4.Ng1 full retreat', kind: 'main',   // tested: level (0.0) after best play — two tempi exactly repay the pawn
        moves: [...E, 'exd5', 'e4', 'Ng1', 'Qxd5', 'd4', 'Nc6'], extendTo: 14,
        sources: ['Games', 'SF'] },
      { id: 'bb5', name: '4.Bb5+ c6!', kind: 'side',
        claim: 'the check achieves nothing; ...exf3 follows and Black is better',
        moves: [...E, 'exd5', 'e4', 'Bb5+', 'c6', 'dxc6', 'bxc6', 'Bc4', 'exf3', 'Qxf3', 'Nf6'], extendTo: 14,
        sources: ['Games', 'Lichess'] },
      { id: 'bd3', name: '3.Bd3?! blocks the d-pawn', kind: 'side',
        claim: 'take with tempo; White’s development is knotted',
        moves: [...E, 'Bd3', 'dxe4', 'Bxe4', 'f5', 'Bd3', 'e4', 'Bb5+', 'c6'], extendTo: 14,
        sources: ['Games', 'SF'] },
      { id: 'nc4', name: '3.Nxe5 Bd6 4.Nc4?!', kind: 'side', minCp: 30,
        claim: 'the knight wanders to c4 and gets hit; Black develops with tempo',
        moves: [...E, 'Nxe5', 'Bd6', 'Nc4'], extendTo: 14,
        sources: ['CB', 'SF'] },
      { id: 'nxf7', name: '3.Nxe5 Bd6 4.Nxf7?! (greedy)', kind: 'side',
        claim: 'the knight fork gets a rook for two pieces? no — Black scores 60% here in practice',
        moves: [...E, 'Nxe5', 'Bd6', 'Nxf7'], extendTo: 14,
        sources: ['Games', 'Lichess', 'SF'] },
    ],
  },
];
