/* ---------------------------------------------------------------
   CURATED REPERTOIRE SEED — hand-written from theory, cross-checked
   against the Lichess databases, then verified with Stockfish by
   tools/verify-repertoire.mjs (which writes js/repertoire.data.js).

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
   - Opponent moves inside a line follow the Lichess 1400-1800 blitz/rapid
     database where it is thick (tools/explorer-check.mjs, 2026-09-17);
     percentages in comments are that database's share at the node.
   - Comments "tested" record moves the engine rejected and what replaced
     them.

   Sources (see docs/sources.md):
   [W-Scotch]  Wikipedia "Scotch Game" — Scotch Gambit section, citing
               Wells (1998), Lane (1993), Dembo & Palliser (2011)
   [W-MaxL]    Wikipedia "Max Lange Attack"
   [W-Eleph]   Wikipedia "Elephant Gambit" (de Firmian; Tal–Lutikov 1964)
   [CD]        chessdoctrine.com Scotch Gambit variations & traps
   [CM]        chessmood.com "Refute the Elephant Gambit" (White's best tries)
   [CB]        chessable.com Elephant Gambit guide
   [Lichess]   Lichess masters + amateur (1400-1800) explorer, 2026-09-17
   [Games]     stas1928's Chess.com games (last 6 months, 427 games)
   [SF]        Stockfish 18 depth 18 — our move where theory is silent
--------------------------------------------------------------- */

const S = ['e4', 'e5', 'Nf3', 'Nc6', 'd4'];                 // Scotch root
const SG = [...S, 'exd4', 'Bc4'];                          // Scotch Gambit
const ML = [...SG, 'Nf6', 'e5', 'd5', 'Bb5', 'Ne4', 'Nxd4'];   // Max Lange stem
const HX = [...SG, 'Bc5', 'c3'];                           // Haxo Gambit stem
const E = ['e4', 'e5', 'Nf3', 'd5'];                        // Elephant root
const PC = [...E, 'exd5', 'e4'];                            // Paulsen Countergambit stem

export const SEED = [
  {
    id: 'scotch', name: 'Scotch Gambit', side: 'w', signaturePlies: 5,
    lines: [
      /* ----- TRUNK ----- */
      { id: 'main', name: 'Max Lange Attack', kind: 'main',
        moves: [...ML, 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'Bc5', 'f3', 'Ng5', 'Be3'],
        sources: ['W-Scotch', 'CD', 'Lichess'] },

      /* ----- Max Lange family (4...Nf6 5.e5) ----- */
      { id: 'max-lange-be7', name: 'Max Lange, 9...Be7', kind: 'main',        // 17% here
        moves: [...ML, 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'Be7'], extendTo: 20,
        sources: ['Lichess', 'SF'] },
      { id: 'max-lange-bxc6', name: 'Max Lange, 8...Bxc6', kind: 'main',      // 19% here
        moves: [...ML, 'Bd7', 'Bxc6', 'Bxc6'], extendTo: 18,
        sources: ['Lichess', 'SF'] },
      { id: 'max-lange-bc5', name: 'Max Lange, 7...Bc5', kind: 'main',        // 23%; then 8...O-O 51%
        moves: [...ML, 'Bc5', 'Be3', 'O-O', 'Bxc6', 'bxc6', 'O-O'], extendTo: 20,
        sources: ['Lichess', 'SF'] },
      { id: 'max-lange-nd7', name: 'Max Lange, 6...Nd7', kind: 'main',        // 12% here
        moves: [...SG, 'Nf6', 'e5', 'd5', 'Bb5', 'Nd7'], extendTo: 16,
        sources: ['Lichess', 'SF'] },
      { id: 'ng4', name: '5...Ng4', kind: 'main',                              // 23%
        moves: [...SG, 'Nf6', 'e5', 'Ng4', 'O-O'], extendTo: 16,             // tested: 6.Qe2 −0.7
        sources: ['W-Scotch', 'Lichess', 'SF'] },
      { id: 'ne4', name: '5...Ne4 6.Qe2 d5', kind: 'main',                     // 12%; then 6...d5 34%
        moves: [...SG, 'Nf6', 'e5', 'Ne4', 'Qe2', 'd5'], extendTo: 16,
        sources: ['Lichess', 'Games', 'SF'] },
      { id: 'ne4-nc5', name: '5...Ne4 6.Qe2 Nc5', kind: 'main',
        moves: [...SG, 'Nf6', 'e5', 'Ne4', 'Qe2', 'Nc5', 'O-O'], extendTo: 16,
        sources: ['Lichess', 'SF'] },
      { id: 'qe7', name: '5...Qe7 (pin on the e-file)', kind: 'side', minCp: 30,   // 12% amateur, 0% masters
        claim: 'the queen blocks its own bishop; castle and the pin goes nowhere',
        moves: [...SG, 'Nf6', 'e5', 'Qe7', 'O-O'], extendTo: 15,
        sources: ['Lichess', 'SF'] },

      /* ----- Haxo Gambit family (4...Bc5 5.c3) ----- */
      { id: 'haxo', name: 'Haxo Gambit → Giuoco Piano, 7.Bd2', kind: 'main',  // 5...Nf6 27%; 8...d5 22%
        // tested: 7.Nc3 (Møller Attack) −0.5 vs 7.Bd2 — the classical main line
        moves: [...HX, 'Nf6', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'd5', 'exd5', 'Nxd5', 'Qb3', 'Nce7', 'O-O', 'O-O', 'Rfe1', 'c6'],
        sources: ['W-Scotch', 'CD', 'Lichess'] },
      { id: 'haxo-oo', name: 'Giuoco Piano, 8...O-O', kind: 'main',             // 42% here
        moves: [...HX, 'Nf6', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'O-O', 'd5'], extendTo: 18,   // tested: 9.O-O −0.5 vs 9.d5
        sources: ['Lichess', 'SF'] },
      { id: 'haxo-na5', name: 'Giuoco Piano, 10...Na5', kind: 'main',           // 30% here
        moves: [...HX, 'Nf6', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'd5', 'exd5', 'Nxd5', 'Qb3', 'Na5', 'Qa4+', 'Nc6'], extendTo: 20,
        sources: ['W-Scotch', 'Lichess', 'SF'] },
      { id: 'haxo-nxe4', name: 'Greco Gambit accepted, 7...Nxe4', kind: 'main', // 28% here
        moves: [...HX, 'Nf6', 'cxd4', 'Bb4+', 'Bd2', 'Nxe4', 'Bxb4', 'Nxb4', 'Bxf7+', 'Kxf7', 'Qb3+', 'd5', 'Qxb4'], extendTo: 20,
        sources: ['W-Scotch', 'Lichess', 'SF'] },
      { id: 'haxo-bb6', name: 'Haxo Gambit, 6...Bb6', kind: 'main',
        moves: [...HX, 'Nf6', 'cxd4', 'Bb6', 'e5'], extendTo: 16,             // tested: 7.Nc3 −0.7
        sources: ['W-Scotch', 'SF'] },
      { id: 'haxo-trap', name: 'Haxo accepted, 6.Bxf7+! Ke8', kind: 'side', minCp: 30,   // 5...dxc3 55%!, 7...Ke8 78%
        claim: 'the bishop comes back with the king stuck in the centre',
        moves: [...HX, 'dxc3', 'Bxf7+', 'Kxf7', 'Qd5+', 'Ke8', 'Qh5+'], extendTo: 17,
        sources: ['W-Scotch', 'CD', 'Lichess', 'SF'] },
      { id: 'haxo-trap-kf8', name: 'Haxo accepted, 6.Bxf7+! Kf8', kind: 'side', minCp: 30,   // 7...Kf8 22%
        claim: 'the bishop comes back with the king stuck in the centre',
        moves: [...HX, 'dxc3', 'Bxf7+', 'Kxf7', 'Qd5+', 'Kf8', 'Qxc5+', 'd6', 'Qxc3'], extendTo: 17,   // tested: 10.O-O −0.5
        sources: ['W-Scotch', 'CD', 'SF'] },

      /* ----- other 4th moves ----- */
      { id: 'london', name: 'London Defence (4...Bb4+)', kind: 'main',       // 7.7%; then 7...Nge7 29%
        moves: [...SG, 'Bb4+', 'c3', 'dxc3', 'bxc3', 'Ba5', 'O-O', 'Nge7'], extendTo: 16,   // tested: 9.Ng5?/10.Ba3? −1.5
        sources: ['W-Scotch', 'CD', 'Lichess', 'SF'] },
      { id: 'london-nf6', name: 'London Defence, 7...Nf6', kind: 'main',      // 20% here
        moves: [...SG, 'Bb4+', 'c3', 'dxc3', 'bxc3', 'Ba5', 'O-O', 'Nf6'], extendTo: 16,
        sources: ['Lichess', 'SF'] },
      { id: 'london-be7', name: 'London Defence, 6...Be7?', kind: 'side', minCp: 30,   // 16% here
        claim: 'Qd5 hits f7 and b7 at once',
        moves: [...SG, 'Bb4+', 'c3', 'dxc3', 'bxc3', 'Be7', 'Qd5'], extendTo: 15,
        sources: ['CD', 'Lichess', 'SF'] },
      { id: 'london-trap', name: 'London Defence trap, 6...Bc5? (Ke8)', kind: 'side',   // 8...Ke8 75%
        claim: 'Bxf7+ and Qd5+ win the bishop on c5',
        moves: [...SG, 'Bb4+', 'c3', 'dxc3', 'bxc3', 'Bc5', 'Bxf7+', 'Kxf7', 'Qd5+', 'Ke8', 'Qxc5'], extendTo: 17,
        sources: ['CD', 'Lichess', 'SF'] },
      { id: 'london-trap-kf8', name: 'London Defence trap, 6...Bc5? (Kf8)', kind: 'side',
        claim: 'Bxf7+ and Qd5+ win the bishop on c5',
        moves: [...SG, 'Bb4+', 'c3', 'dxc3', 'bxc3', 'Bc5', 'Bxf7+', 'Kxf7', 'Qd5+', 'Kf8', 'Qxc5+', 'd6', 'Qc4'],
        sources: ['CD'] },
      { id: 'hungarian', name: 'Hungarian Defence (4...Be7)', kind: 'main',   // 8%
        moves: [...SG, 'Be7', 'Nxd4', 'd6', 'O-O', 'Nf6', 'Nc3', 'O-O', 'h3', 'Nxd4', 'Qxd4', 'Be6', 'Bxe6', 'fxe6'],
        sources: ['W-Scotch', 'CD'] },
      { id: 'hungarian-nxd4', name: 'Hungarian Defence, 5...Nxd4', kind: 'main',   // 32% here
        moves: [...SG, 'Be7', 'Nxd4', 'Nxd4', 'Qxd4'], extendTo: 16,
        sources: ['Lichess', 'SF'] },
      { id: 'declined-d6', name: '4...d6 (gambit declined)', kind: 'main',     // 13%
        moves: [...SG, 'd6', 'Nxd4', 'Nf6', 'Nc3', 'Be7', 'O-O', 'O-O', 'h3', 'Nxd4', 'Qxd4', 'Be6', 'Bxe6', 'fxe6'],
        sources: ['CD'] },
      { id: 'declined-d6-nxd4', name: '4...d6 5.Nxd4 Nxd4', kind: 'main',       // 52% here
        moves: [...SG, 'd6', 'Nxd4', 'Nxd4', 'Qxd4'], extendTo: 16,
        sources: ['Lichess', 'SF'] },
      { id: 'declined-d6-ne5', name: '4...d6, 8...Ne5', kind: 'main',           // 28% here
        moves: [...SG, 'd6', 'Nxd4', 'Nf6', 'Nc3', 'Be7', 'O-O', 'O-O', 'h3', 'Ne5'], extendTo: 18,
        sources: ['Lichess', 'SF'] },
      { id: 'h6', name: '4...h6 (passive)', kind: 'main',                      // 18% amateur
        moves: [...SG, 'h6', 'Nxd4', 'Nf6', 'Nxc6', 'bxc6', 'e5'], extendTo: 15,
        sources: ['Games', 'Lichess', 'SF'] },
      { id: 'h6-nxd4', name: '4...h6 5.Nxd4 Nxd4', kind: 'main',               // 49% here
        moves: [...SG, 'h6', 'Nxd4', 'Nxd4', 'Qxd4'], extendTo: 15,
        sources: ['Lichess', 'SF'] },
      { id: 'qf6-4', name: '4...Qf6?!', kind: 'side', claim: 'early queen: develop with tempo',   // 5...Bc5 47%
        moves: [...SG, 'Qf6', 'O-O', 'Bc5'], extendTo: 15,
        sources: ['Games', 'Lichess', 'SF'] },

      /* ----- 3rd-move alternatives ----- */
      { id: 'scotch-d6', name: '3...d6 (Scotch declined)', kind: 'main',      // 7%; 4...Nce7 then 5...Nf6 21%
        moves: [...S, 'd6', 'd5', 'Nce7', 'c4', 'Nf6'], extendTo: 16,
        sources: ['W-Scotch', 'Games', 'Lichess', 'SF'] },
      { id: 'scotch-d6-nb8', name: '3...d6 4.d5 Nb8', kind: 'main',             // 13% here
        moves: [...S, 'd6', 'd5', 'Nb8', 'c4'], extendTo: 14,
        sources: ['Lichess', 'SF'] },
      { id: 'scotch-d6-nd4', name: '3...d6 4.d5 Nd4?!', kind: 'side', minCp: 30,   // 12% here
        claim: 'the knight is traded and the queen lands on d4 for free',
        moves: [...S, 'd6', 'd5', 'Nd4', 'Nxd4', 'exd4', 'Qxd4'], extendTo: 14,
        sources: ['Lichess', 'SF'] },
      { id: 'lolli', name: 'Lolli Variation, 3...Nxd4', kind: 'side',          // 1.7%; 5...d6 35%
        claim: 'centralised queen Black cannot chase; small but lasting plus',
        moves: [...S, 'Nxd4', 'Nxd4', 'exd4', 'Qxd4', 'd6'], extendTo: 15,
        sources: ['W-Scotch', 'Lichess', 'SF'] },
      { id: 'f5', name: '3...f5?!', kind: 'side', claim: 'wins a pawn and exposes the king',   // rare (0.5%), 2 of your games
        moves: [...S, 'f5', 'Nxe5', 'Nxe5', 'dxe5', 'fxe4'], extendTo: 15,   // tested: 6.Qh5+ −0.7
        sources: ['Games', 'SF'] },
      { id: 'bd6', name: '3...Bd6?!', kind: 'side', minCp: 30, claim: 'the bishop blocks its own d-pawn; d5 cramps Black',   // rare, 2 of your games; tested +0.47
        moves: [...S, 'Bd6', 'd5', 'Nce7', 'c4'], extendTo: 15,
        sources: ['W-Scotch', 'Games', 'SF'] },
      { id: 'qf6-3', name: '3...Qf6?!', kind: 'side', minCp: 30, claim: 'd5 hits the knight and the queen is misplaced',   // rare
        moves: [...S, 'Qf6', 'd5'], extendTo: 15,                           // tested: 4.Bg5 −0.8
        sources: ['Games', 'SF'] },
      { id: 'bb4-3', name: '3...Bb4+?!', kind: 'side', claim: 'the bishop is kicked around while White develops',   // rare; 4...Bd6 27%
        moves: [...S, 'Bb4+', 'c3', 'Bd6', 'Bd3'], extendTo: 15,                 // tested: 5.d5 −0.6 vs 5.Bd3
        sources: ['Games', 'Lichess', 'SF'] },
    ],
  },

  {
    id: 'elephant', name: 'Elephant Gambit', side: 'b', signaturePlies: 4,
    lines: [
      /* ----- TRUNK: Paulsen Countergambit vs White's best ----- */
      { id: 'main', name: 'Paulsen Countergambit', kind: 'main',
        moves: [...PC, 'Qe2', 'Nf6', 'd3', 'Qxd5', 'Nbd2', 'Be7', 'dxe4', 'Qe6', 'Nb3'], extendTo: 18,   // tested: 8...O-O −0.5, 9...Rd8 −1.1
        sources: ['W-Eleph', 'CM', 'Lichess', 'SF'] },

      /* ----- 4.Qe2 family ----- */
      { id: 'nc3-5', name: '5.Nc3 Be7 6.Nxe4 O-O 7.d3', kind: 'main',          // 5.Nc3 34% (masters 47%); 7.d3 masters 70%
        moves: [...PC, 'Qe2', 'Nf6', 'Nc3', 'Be7', 'Nxe4', 'O-O', 'd3'], extendTo: 18,
        sources: ['W-Eleph', 'CM', 'Lichess', 'SF'] },
      { id: 'nc3-5-nxf6', name: '5.Nc3 … 7.Nxf6+', kind: 'main',
        moves: [...PC, 'Qe2', 'Nf6', 'Nc3', 'Be7', 'Nxe4', 'O-O', 'Nxf6+', 'Bxf6'], extendTo: 18,
        sources: ['CM', 'Lichess', 'SF'] },
      { id: 'nc3-6', name: '6.Nc3 Bb4!', kind: 'main',                          // 39%; 9.Bxf6 51%
        moves: [...PC, 'Qe2', 'Nf6', 'd3', 'Qxd5', 'Nc3', 'Bb4', 'Bd2', 'Bxc3', 'Bxc3', 'O-O', 'Bxf6'], extendTo: 16,
        sources: ['CM', 'Games', 'Lichess', 'SF'] },
      { id: 'dxe4-6', name: '6.dxe4 queen trade', kind: 'main',                 // 49%; 9.Bc4 40%
        moves: [...PC, 'Qe2', 'Nf6', 'd3', 'Qxd5', 'dxe4', 'Qxe4', 'Qxe4+', 'Nxe4', 'Bd3', 'Nc5', 'Bc4'], extendTo: 18,
        sources: ['Games', 'Lichess', 'SF'] },
      { id: 'ng5', name: '5.Ng5', kind: 'main',                                  // 10%
        moves: [...PC, 'Qe2', 'Nf6', 'Ng5', 'Be7', 'Nxe4', 'O-O'], extendTo: 16,
        sources: ['Games', 'Lichess', 'SF'] },

      /* ----- 4th-move knight moves ----- */
      { id: 'nd4', name: '4.Nd4 Qxd5 5.Nb3', kind: 'main',                       // 4.Nd4 29%; 5.Nb3 32% (masters 100%)
        moves: [...PC, 'Nd4', 'Qxd5', 'Nb3'], extendTo: 16,
        sources: ['Games', 'Lichess', 'SF'] },
      { id: 'nd4-c3', name: '4.Nd4 Qxd5 5.c3 Nc6 6.Nxc6', kind: 'main',          // 6.Nxc6 60%
        moves: [...PC, 'Nd4', 'Qxd5', 'c3', 'Nc6', 'Nxc6', 'Qxc6'], extendTo: 16,
        sources: ['Lichess', 'SF'] },
      { id: 'ne5', name: '4.Ne5', kind: 'main',                                  // 7%
        moves: [...PC, 'Ne5', 'Qxd5', 'd4', 'exd3', 'Nxd3', 'Nc6', 'Nc3', 'Qa5'], extendTo: 16,
        sources: ['W-Eleph', 'Games', 'SF'] },
      { id: 'ng1', name: '4.Ng1 full retreat', kind: 'main',                     // 19% amateur!; 5.Nc3 70%
        moves: [...PC, 'Ng1', 'Qxd5', 'Nc3'], extendTo: 14,
        sources: ['Games', 'Lichess', 'SF'] },
      { id: 'bb5', name: '4.Bb5+ c6', kind: 'side', minCp: 30,                    // 6.Qe2 49% (masters 100%)
        claim: 'the check achieves nothing; Black is fully developed a pawn up in activity',
        moves: [...PC, 'Bb5+', 'c6', 'dxc6', 'bxc6', 'Qe2'], extendTo: 14,
        sources: ['Games', 'Lichess', 'SF'] },

      /* ----- 3rd-move alternatives ----- */
      { id: 'nxe5', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Bc4', kind: 'main',            // 3.Nxe5 19% (masters 30%)
        // tested at depth 22: 3...dxe4 −0.87 (4.Bc4! best; the "Wasp" 4...Qg5 −1.16) vs 3...Bd6 −0.65
        moves: [...E, 'Nxe5', 'Bd6', 'd4', 'dxe4', 'Bc4'], extendTo: 16,
        sources: ['W-Eleph', 'CM', 'Lichess', 'Games', 'SF'] },
      { id: 'nxe5-nc4', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Nc4', kind: 'main',        // 17% (masters 39%)
        moves: [...E, 'Nxe5', 'Bd6', 'd4', 'dxe4', 'Nc4'], extendTo: 16,
        sources: ['Lichess', 'SF'] },
      { id: 'nxe5-nc3', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Nc3', kind: 'main',        // 22%
        moves: [...E, 'Nxe5', 'Bd6', 'd4', 'dxe4', 'Nc3'], extendTo: 16,
        sources: ['Lichess', 'SF'] },
      { id: 'nxe5-nf3', name: '3.Nxe5 Bd6 4.Nf3 (retreat)', kind: 'main',
        moves: [...E, 'Nxe5', 'Bd6', 'Nf3', 'dxe4'], extendTo: 14,
        sources: ['Games', 'SF'] },
      { id: 'nc4', name: '3.Nxe5 Bd6 4.Nc4?!', kind: 'side', minCp: 30,
        claim: 'the knight wanders to c4 and gets hit; Black develops with tempo',
        moves: [...E, 'Nxe5', 'Bd6', 'Nc4'], extendTo: 14,
        sources: ['CB', 'SF'] },
      { id: 'nxf7', name: '3.Nxe5 Bd6 4.Nxf7?! (greedy)', kind: 'side',
        claim: 'the fork gets nothing; Black scores 60% here in practice',
        moves: [...E, 'Nxe5', 'Bd6', 'Nxf7'], extendTo: 14,
        sources: ['Games', 'Lichess', 'SF'] },
      { id: 'd4', name: '3.d4 (Elephant declined)', kind: 'main',               // 5% (masters 21%); 6.Nc3 35%
        moves: [...E, 'd4', 'dxe4', 'Nxe5', 'Nd7', 'Nxd7', 'Bxd7', 'Nc3'], extendTo: 16,
        sources: ['Games', 'Lichess', 'SF'] },
      { id: 'd3', name: '3.d3 dxe4 4.dxe4 (quiet)', kind: 'main',                // 6.Bd3 41%
        moves: [...E, 'd3', 'dxe4', 'dxe4', 'Qxd1+', 'Kxd1', 'Nf6', 'Bd3'], extendTo: 16,
        sources: ['Games', 'Lichess', 'SF'] },
      { id: 'd3-nxe5', name: '3.d3 dxe4 4.Nxe5', kind: 'main',                   // 30% here
        moves: [...E, 'd3', 'dxe4', 'Nxe5'], extendTo: 14,
        sources: ['Lichess', 'SF'] },
      { id: 'nc3-3', name: '3.Nc3', kind: 'main',                                // 5%; 5.Bc4 23%
        moves: [...E, 'Nc3', 'dxe4', 'Nxe4', 'Nc6', 'Bc4'], extendTo: 16,
        sources: ['W-Eleph', 'Lichess', 'SF'] },
      { id: 'bd3', name: '3.Bd3?! blocks the d-pawn', kind: 'side',              // rare (0.7%), 2 of your games; 6.Qe2 66%
        claim: 'take with tempo; White’s development is knotted',
        moves: [...E, 'Bd3', 'dxe4', 'Bxe4', 'f5', 'Bd3', 'e4', 'Qe2'], extendTo: 14,
        sources: ['Games', 'Lichess', 'SF'] },
    ],
  },
];
