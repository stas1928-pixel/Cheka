/* ---------------------------------------------------------------
   HAND-WRITTEN NOTES for lines, by opening id and line id.
   The line data itself is generated from tools/repertoire.seed.mjs by
   tools/verify-repertoire.mjs; this file survives regeneration.
   Numbers quoted are Stockfish 18 depth 18 from YOUR point of view.
--------------------------------------------------------------- */
export const NOTES = {
  scotch: {
    main: 'The Max Lange Attack — masters’ most-played move at every step (Wells; Dembo & Palliser). Level but lively. 6.Bb5 pins, 7.Nxd4 regains the pawn, then f3 asks the knight where it is going.',
    'max-lange-bc5': 'Black develops the bishop before …Bd7. Be3 offers the trade; play continues as in the main line with colours of the bishops swapped.',
    ng4: 'The knight jumps to g4 instead of d5. Castle first; the e5 pawn and the f7 square stay under pressure. (6.Qe2 tested −0.7.)',
    ne4: 'The knight sits on e4 with no support. Qe2 asks it to leave; after …Nc5 castle and the d4 pawn is coming back.',
    haxo: 'The Haxo Gambit, your most common surprise (8 games). 5.c3 offers the pawn back and 5…Nf6 is Black’s sound answer, reaching the classical Giuoco Piano. 7.Bd2 (not the old Møller 7.Nc3, tested −0.5) then Qb3 — a known, level main line.',
    'haxo-bb6': 'Black keeps the bishop with 6…Bb6. Develop with Nc3; the centre is yours and Black’s bishop bites on granite.',
    london: 'The London Defence: 4…Bb4+ and Black grabs on c3. After 6.bxc3 Ba5 you have a big lead in development for the pawn; Qb3 hits b7 and f7.',
    hungarian: '4…Be7 declines. Take on d4 and you have a normal Scotch with more space; h3 stops …Bg4/…Ng4 tricks.',
    'declined-d6': '4…d6 also returns the pawn. Same plan: Nxd4, develop, h3, and meet …Be6 with Bxe6.',
    'scotch-d6': '3…d6 (10 of your games). Push d5: the knight must retreat to e7, then c4 and Nc3 give you a big centre. Your own habit — and the engine’s choice.',
    h6: 'A wasted move, but not a losing one (tested +0.3). Just take the centre: Nxd4, trade on c6, e5.',
    'haxo-trap': 'The club trap: after 5…dxc3 comes 6.Bxf7+! Kxf7 7.Qd5+ and 8.Qxc5 — the bishop comes back with the king stuck in the middle. Objectively near equal, but far easier for White.',
    'london-trap': '6…Bc5? walks into the identical fork: Bxf7+, Qd5+, Qxc5. A clean extra piece.',
    lolli: '3…Nxd4 trades the developed knight. 5.Qxd4 — the queen cannot be chased with …Nc6 any more. ECO’s line; White keeps a small, lasting plus.',
    'qf6-4': 'Early queen. Castle, then c3 and Qb3: the queen on f6 blocks Black’s own knight and becomes a target.',
    f5: 'A Latvian-style lunge. Take on e5, take back, and after …fxe4 Black’s king is open. (6.Qh5+ tested −0.7; develop with Nc3 instead.)',
    bd6: 'The bishop blocks its own d-pawn. d5 and c4: Black’s queenside never gets out.',
    'qf6-3': 'd5! hits the knight while the queen stands in the way of Black’s development. (4.Bg5 tested −0.8.)',
    'bb4-3': 'c3 kicks the bishop, then take on e5. Black has lost time and the centre.',
  },
  elephant: {
    main: 'The Paulsen Countergambit against White’s best: 4.Qe2! 5.d3 6.Nbd2. Black is a pawn down (about −1.0 — the honest price of this gambit) but gets the pieces out fast. Know it cold; this is what strong opponents play.',
    'nc3-5': '5.Nc3 avoids the pin on the e-file (Chessmood’s recommendation). Develop with Be7, castle, take back on f6 with the bishop.',
    'nc3-6': 'Against 6.Nc3 the key move is 6…Bb4! — pin, trade on c3 and castle. White stays a pawn up but Black is fully developed.',
    'dxe4-6': 'White trades queens early. Recapture with the knight, meet Bd3 with …Nc5 and Bb5+ with …c6. A pawn down but a solid endgame.',
    ne5: '4.Ne5 (3 of your games). Take on d5 — the queen hits the knight too. After 5.d4 take en passant and develop.',
    nd4: '4.Nd4 (5 of your games). Regain the pawn with …Qxd5 and centralise; the knight will be chased with …Nc6.',
    ng5: '5.Ng5 wants e4. …Be7 kicks it while developing; castle quickly.',
    nxe5: '3.Nxe5 (8 of your games): hit the knight with 3…Bd6 — masters’ 63% choice and your own habit. Tested at depth 22 it beats 3…dxe4 (which 4.Bc4! refutes). After 4.d4 dxe4 5.Bc4 the engine finishes the line; about −0.6, the best Black has.',
    'nxe5-nf3': 'The knight simply goes home. Take on e4 and you have regained the pawn with a lead in development.',
    d4: '3.d4 strikes first. Take on e4, meet Nxe5 with …Nd7, develop and castle.',
    d3: 'Quiet 3.d3. Take, trade queens on d1, and you are level with easy play (tested 0.0).',
    'nc3-3': '3.Nc3: take on e4 and develop; Bb5 is met by …Bd7.',
    ng1: 'Full retreat (8 of your games!). Take the pawn back and develop. White has spent two moves to go nowhere, which exactly repays the gambit pawn — the engine calls it level, so play for activity.',
    bb5: '4.Bb5+ — block with the pawn, not the bishop: …c6, and after the trades …exf3 wins the knight back with interest. Black scores 63% here in practice.',
    bd3: 'The bishop on d3 blocks White’s own d-pawn. Take on e4 and hit the bishop with …f5 — White is tangled.',
    nc4: 'The knight wanders to c4 where it is a target. Develop with tempo; Black is at least equal, a pawn up in activity.',
    nxf7: '4.Nxf7 takes the fork at once. It scores 60% for Black in practice: after the trades White’s king is the one in trouble. Follow the engine line.',
  },
};
