# Repertoire audit — 2026-09-23

Every drilled line is a library line selected by id (`tools/repertoire.seed.mjs`); the data file must carry exactly the library’s sourced moves. "Engine plies" counts moves in the shipped data that are not in the library line — the rebuild rule is that this is **0** everywhere. Weight A = book / MCO / master practice; B = course, titled player on video, cited Wikipedia, strong-online-player practice; C = community (allowed for side/trap/surprise lines only). For side/trap lines the table shows the opponent’s mistake with the share of Lichess 1400-1800 players who play it (must be ≥ 10% of ≥ 200 games), the engine swing it causes (≥ +1.0; side ≥ +0.5) and the final eval (≥ +1.5; side ≥ +1.0). Surprise lines are OUR alternatives, drilled apart from the main repertoire. Provenance quotes the library note, which says which source covers which segment.

## Scotch Gambit (White) — 39 lines

| app id | library id | kind | weight | plies | ours after deviation | engine plies | mistake: club share / swing / end | sources | plan (basis) |
|---|---|---|---|---|---|---|---|---|---|
| main | v-rca-mainline-plan | main | B known | 27 | 11 | 0 |  | fishbein, wikiTwoKnights, masters, rcaScotch, astanehAdvance, studyEXO | rcaScotch, fishbein (quoted) |
| bc5 | modern-attack-bc5 | main | A theory | 21 | 4 | 0 |  | fishbein, wikiTwoKnights, astanehAdvance, masters | fishbein, masters (interpreted) |
| bc5-oo | masters-bc5-oo | main | A theory | 21 | 4 | 0 |  | masters, fishbein | masters (interpreted) |
| bc5-bxd4 | masters-bc5-bxd4 | main | A theory | 21 | 4 | 0 |  | masters | masters, fishbein (interpreted) |
| nd7 | masters-nd7 | main | A theory | 21 | 5 | 0 |  | masters, fishbein | masters, fishbein (interpreted) |
| be7-9 | masters-be7-f5 | main | A theory | 25 | 4 | 0 |  | masters, fishbein, amateur | rcaScotch, masters (interpreted) |
| be7-9-ne4 | masters-be7-ne4 | main | A theory | 25 | 4 | 0 |  | masters, fishbein | masters, rcaScotch (interpreted) |
| be7-9-ng5 | strong-be7-ng5-ne4 | main | B known | 25 | 4 | 0 |  | masters, strong, amateur | masters, rcaScotch (interpreted) |
| be7-9-ng5-ne6 | strong-be7-ng5-ne6 | main | B known | 25 | 4 | 0 |  | strong, amateur | strong, rcaScotch (interpreted) |
| ng4 | strong-ng4-kf8-h3 | main | B known | 21 | 6 | 0 |  | strong, masters, kenilworthian, ianGambits, amateur | ianGambits, strong (interpreted) |
| ng4-be7-8 | ian-ng4-be7-8 | main | B known | 23 | 7 | 0 |  | ianGambits | ianGambits (quoted) |
| ng4-be7 | ian-ng4-be7-6 | main | B known | 19 | 5 | 0 |  | ianGambits, masters | ianGambits (interpreted) |
| ng4-bc5 | strong-ng4-bc5 | main | B known | 19 | 5 | 0 |  | strong, chessVibes, amateur | chessVibes, strong (interpreted) |
| ng4-trap | ng4-trap | trap | B known | 17 | 4 | 0 | 6...Ngxe5: 34.8% of 211,720 / +1.8 / +2.5 | rcaScotch, strong, studySoNy, studyOctopus, masters | rcaScotch, studySoNy (interpreted) |
| ne4 | ian-ne4-ne6 | main | B known | 25 | 8 | 0 |  | ianGambits, masters, fishbein | ianGambits (quoted) |
| ne4-be7 | ian-ne4-be7 | main | B known | 23 | 7 | 0 |  | ianGambits, masters | ianGambits (interpreted) |
| ne4-be7-oo | strong-ne4-oo | main | B known | 19 | 5 | 0 |  | masters, strong, ianGambits, amateur | masters, strong (interpreted) |
| qe7-trap | qe7-trap | side | B known | 17 | 4 | 0 | 5...Qe7: 11.6% of 2,197,088 / +1.5 / +2.1 | rcaScotch, studySoNy, studyOctopus, amateur | rcaScotch, studySoNy (interpreted) |
| haxo | greco-gambit-e5 | main | A theory | 21 | 7 | 0 |  | wikiGiuoco, masters, ironstone, rcaScotch | wikiGiuoco, masters, rcaScotch (interpreted) |
| haxo-bg4 | masters-haxo-bg4 | main | A theory | 21 | 7 | 0 |  | masters, wikiGiuoco | wikiGiuoco, masters, rcaScotch (interpreted) |
| haxo-f5 | masters-haxo-f5 | main | A theory | 21 | 7 | 0 |  | masters | masters (interpreted) |
| haxo-bb4 | masters-haxo-bb4 | main | A theory | 19 | 6 | 0 |  | masters, rcaScotch | masters, rcaScotch (interpreted) |
| haxo-trap | v-rca-haxo-ke8 | side | B known | 17 | 5 | 0 | 5...dxc3: 55.5% of 2,547,543 / +0.9 / +1.4 | rcaScotch, chessVibes, wikiScotch, studySoNy, amateur, sf | rcaScotch (interpreted) |
| haxo-trap-kf8 | v-cv-haxo-kf8 | side | B known | 25 | 9 | 0 | 5...dxc3: 55.5% of 2,547,543 / +0.9 / +2.8 | chessVibes, chessdoctrine, amateur, sf | chessVibes (quoted) |
| london | london | main | B known | 23 | 8 | 0 |  | wikiScotch, rcaScotch, chessdoctrine, strong, studyEXO, amateur | rcaScotch, chessdoctrine (quoted) |
| london-qf6 | strong-london-qf6 | main | B known | 17 | 5 | 0 |  | strong, amateur, rcaScotch | rcaScotch, strong (interpreted) |
| london-nge7 | strong-london-nge7 | main | B known | 21 | 7 | 0 |  | strong, amateur | strong (interpreted) |
| london-trap | london-trap | side | B known | 19 | 6 | 0 | 6...Bc5: 28.3% of 495,601 / +0.8 / +1.0 | chessdoctrine, rcaScotch, strong, amateur | chessdoctrine, rcaScotch (interpreted) |
| london-be7 | v-rca-london-be7 | trap | B known | 15 | 4 | 0 | 6...Be7: 15.8% of 495,601 / +3.4 / +3.5 | rcaScotch, chessdoctrine, amateur | rcaScotch, chessdoctrine (interpreted) |
| declined-d6 | ian-d6-nxd4 | main | B known | 21 | 7 | 0 |  | ianGambits, masters, chessdoctrine, ironstone | ianGambits (quoted) |
| declined-d6-nxd4 | paris-nxd4-oo | main | B known | 21 | 7 | 0 |  | strong, masters, chessdoctrine, amateur | strong, chessdoctrine (interpreted) |
| declined-d6-be6 | paris-nxd4-be6 | main | B known | 21 | 7 | 0 |  | strong, amateur | strong (interpreted) |
| h6 | strong-h6-nxd4 | main | B known | 15 | 4 | 0 |  | strong, ianGambits, amateur, games | strong (interpreted) |
| hungarian | hun-d6-nf6 | main | A theory | 21 | 7 | 0 |  | masters, strong, wikiScotch, ironstone, amateur | masters, strong (interpreted) |
| hungarian-nxd4 | hun-d6-nxd4 | main | B known | 21 | 7 | 0 |  | strong, masters, amateur | strong (interpreted) |
| hungarian-bxe5 | hun-nxd4-bf6-trap | side | B known | 23 | 8 | 0 | 10...Bxe5: 62.6% of 12,288 / +1.1 / +3.0 | strong, amateur | strong (interpreted) |
| hungarian-nf6 | hun-nxd4-nf6 | main | B known | 15 | 4 | 0 |  | strong, amateur | strong (interpreted) |
| scotch-d6 | v-rca-d6-fork | trap | B known | 15 | 5 | 0 | 6...Bd7: 22.9% of 420,518 / +1.3 / +1.7 | rcaScotch, studyEXO, amateur | rcaScotch (interpreted) |
| nf6-3 | v-rca-nf6-3 | trap | B known | 15 | 5 | 0 | 6...Nf6: 57.4% of 5,009 / +1.7 / +4.9 | rcaScotch | rcaScotch (interpreted) |
| sur-max-lange | max-lange | surprise | A theory | 23 | 8 | 0 |  | wikiMaxLange, fishbein, astanehMaxLange, masters | wikiMaxLange, fishbein (interpreted) |
| sur-nakhmanson | v-cv-nakhmanson | surprise | B known | 17 | 4 | 0 |  | chessVibes, wikiTwoKnights | chessVibes (interpreted) |
| sur-london-oo | v-cv-london-oo | surprise | B known | 25 | 9 | 0 |  | chessVibes, studyEXO | chessVibes (interpreted) |

### Move-by-move provenance

- **main** — Modern Attack (Advance Variation), main line
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Bc5 10.f3 10...Ng5 11.f4 11...Ne4 12.Be3 12...O-O 13.Nd2 13...Nxd2 14.Qxd2`
  - provenance: Book to 12...O-O (Fishbein ch.1: 6.Bb5 "the only move", 8.Bxc6 "no other moves are worth considering", 9.O-O Bc5; Wikipedia: "gradually become the main line of the Open Variation"; 370 master games reach 12.Be3). 13.Nd2 is the masters’ move there (164 of 164 in the database) and Smirnov’s: 13.Nd2 Nxd2 14.Qxd2, 111 master games. Extends modern-attack, which is now a prefix of this line.
  - plan (quoted — rcaScotch, fishbein): Smirnov: "you have this pawn majority on the kingside and in the centre — push f5, f6, and if you get f6 in you’ll probably checkmate; bring the rook to e1". Against ...c5/...d4 counterplay: "Nb3 provides superb control of c5 and d4, add Qc3 if needed; blockade so he has no counter ideas, then Re1, f5 and attack on the kingside."
- **bc5** — Modern Attack, 7...Bc5 8.Be3 Bd7 (Ntirlis line)
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5 8.Be3 8...Bd7 9.Bxc6 9...bxc6 10.O-O 10...O-O 11.f3`
  - provenance: Fishbein: "recommended by Ntirlis … until recently considered Black’s surest reply"; ch.3 argues Black must sacrifice a pawn to equalise. Wikipedia: "7.Nxd4 Bc5, with sharp play". To 10...O-O from Fishbein/Wikipedia; 11.f3 is the masters’ move there (59 of 82 games). Masters’ own top choice at move 10 is Nd2 — we keep Fishbein’s O-O.
  - plan (interpreted — fishbein, masters): Same structure as the main line: f3 asks the e4 knight where it is going, then f4 and Nd2, and play against the doubled c-pawns. Fishbein: Black has to give up a pawn to equalise here.
- **bc5-oo** — Modern Attack, 7...Bc5 8.Be3 O-O
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5 8.Be3 8...O-O 9.Nxc6 9...bxc6 10.Bxc5 10...Nxc5 11.Bxc6`
  - provenance: Master practice, not book text: 8...O-O is the most common master reply to 8.Be3 (116 games reach 11...Rb8), and masters answer it with 9.Nxc6 bxc6 10.Bxc5 Nxc5 11.Bxc6 winning the c6 pawn. Fishbein ch.3 covers 7...Bc5 in general (sample not read this far).
  - plan (interpreted — masters): You are a pawn up after the trades. Masters’ usual reply is 11...Rb8 against b2 (116 games): cover b2, castle, and simplify — the extra pawn is the whole point of the line.
- **bc5-bxd4** — Modern Attack, 7...Bc5 8.Be3 Bxd4
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5 8.Be3 8...Bxd4 9.Qxd4 9...O-O 10.Bxc6 10...bxc6 11.Nc3`
  - provenance: Master practice (35 games reach 11.Nc3): Black trades on d4 at once, White recaptures with the queen, doubles the c-pawns and develops the knight. Thin but consistent data.
  - plan (interpreted — masters, fishbein): Centralised queen on d4 that Black cannot easily chase, and doubled c-pawns to play against: castle, then Rad1/f3 to question the e4 knight, as in the main line.
- **nd7** — Modern Attack, 6...Nd7
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Nd7 7.O-O 7...Be7 8.Bxc6 8...bxc6 9.Nxd4 9...Nb8 10.Nc3 10...O-O 11.Qf3`
  - provenance: Fishbein ch.2 names 6...Nd7 ("not entirely in the spirit of this system"). The continuation is master practice: 7.O-O (290 of 309 games), 7...Be7 8.Bxc6 bxc6 9.Nxd4 Nb8 10.Nc3 O-O 11.Qf3 with 41 games reaching 11...a5.
  - plan (interpreted — masters, fishbein): Pawn regained and Black’s knight sent home to b8. Masters put the queen on f3 against c6 and f7 and keep the e5 pawn as a wedge; develop Be3/Rad1 and play against the c-pawns.
- **be7-9** — Modern Attack, 9...Be7 10.f3 Nc5 11.f4 O-O 12.f5
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Be7 10.f3 10...Nc5 11.f4 11...O-O 12.f5 12...Ne4 13.Nc3`
  - provenance: Fishbein ch.2 lists 9...Be7 among the deviations. Master practice: 10.f3 (211 of 219) Nc5 (65%) 11.f4 (159 of 188) O-O (48%) 12.f5 (72 of 82) Ne4 (57%) 13.Nc3 (41 of 64). The same f-pawn plan as the main line.
  - plan (interpreted — rcaScotch, masters): Smirnov’s main-line plan applies: the kingside pawn majority rolls (f5, then f6 or Qg4/Rf3), Nc3 challenges the e4 knight and Be3/Qd3 complete development. Black’s doubled c-pawns are the long-term target.
- **be7-9-ne4** — Modern Attack, 9...Be7 10.f3 Nc5 11.f4 Ne4
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Be7 10.f3 10...Nc5 11.f4 11...Ne4 12.Nc3 12...Nxc3 13.bxc3`
  - provenance: Master practice: after 11.f4 the knight comes back 11...Ne4 (19%, 59 games) 12.Nc3 (45 of 77) Nxc3 (76%) 13.bxc3 (34 of 34). Symmetrical doubled c-pawns; White has the space.
  - plan (interpreted — masters, rcaScotch): With the knights gone White’s f4-f5 push and the e5 wedge give a kingside space advantage; Be3, Qd3 and Rf1-f3 or Rae1. Black’s c-pawns are still a target for Nb3/Qa4 later.
- **be7-9-ng5** — Modern Attack, 9...Be7 10.f3 Ng5 11.f4 Ne4
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Be7 10.f3 10...Ng5 11.f4 11...Ne4 12.Nc3 12...Nxc3 13.bxc3`
  - provenance: 10...Ng5 (35% of club games, 23 master games) 11.f4 (3,247 of 3,759 strong games) Ne4 (53%) transposes to the masters’ 12.Nc3 Nxc3 13.bxc3.
  - plan (interpreted — masters, rcaScotch): Same as the 11...Ne4 line: space on the kingside, f5 coming, play against the doubled c-pawns; develop Be3/Qd3 and use the f-file.
- **be7-9-ng5-ne6** — Modern Attack, 9...Be7 10.f3 Ng5 11.f4 Ne6 12.f5
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Be7 10.f3 10...Ng5 11.f4 11...Ne6 12.f5 12...Nxd4 13.Qxd4`
  - provenance: After 10...Ng5 11.f4 the knight often goes 11...Ne6 (47% of club games); strong players push 12.f5 (862 of 1,553) and after 12...Nxd4 recapture 13.Qxd4 (847 of 847). Pawn regained, big centre, Black’s bishop pair against the f5/e5 pawn roller.
  - plan (interpreted — strong, rcaScotch): The e5/f5 pawn duo cramps Black: Nc3, Be3, Rad1 and then e6 or f6 breaks; the queen on d4 eyes g7. Black’s two bishops need open lines — keep the position closed until the attack is ready.
- **ng4** — 5...Ng4 6.O-O d6 7.exd6 Bxd6 8.Re1+ Kf8 9.h3 (Kingside Variation)
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ng4 6.O-O 6...d6 7.exd6 7...Bxd6 8.Re1+ 8...Kf8 9.h3 9...Nge5 10.Nxe5 10...Nxe5 11.Bb3`
  - provenance: The masters’ main line vs 5...Ng4 to 8...Kf8 (6.O-O 139 of 274 master games; 42 reach 8...Kf8; Kenilworthian: "it is generally thought Black must play 8...Kf8"). At move 9 masters are split (Nbd2 11, Na3 10, c3 9, h3 7) and the annotated game’s 9.Na3 fails the engine (−0.60), so the drilled move is the strong players’ 9.h3 (547 of 891 games, also the engine’s choice): 9...Nge5 (54% of club games) 10.Nxe5 Nxe5 11.Bb3 (126 of 187). Black keeps a pawn, White has development and Black’s king cannot castle.
  - plan (interpreted — ianGambits, strong): "White gets compensation due to Black’s misplaced king" (ianchessgambits): Black is a pawn up but cannot castle. Develop Nc3/Nd2, Be3 or Bf4 hitting e5, Qh5 or Qd5 ideas, and keep the pieces on — the pawn matters less than the king on f8.
- **ng4-be7-8** — 5...Ng4 6.O-O d6 … 8.Re1+ Be7
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ng4 6.O-O 6...d6 7.exd6 7...Bxd6 8.Re1+ 8...Be7 9.Bg5 9...O-O 10.Bxe7 10...Nxe7 11.Qxd4 11...Qxd4 12.Nxd4`
  - provenance: ianchessgambits: 8...Be7 9.Bg5 O-O 10.Bxe7 Nxe7 11.Qxd4 Qxd4 12.Nxd4 "leaves White with just a microscopic edge in a dull position". Black’s safer 8th move; the pawn is regained.
  - plan (quoted — ianGambits): "A microscopic edge in a dull position" (ianchessgambits): material is level, you have the better structure. Develop Nc3, Rad1, and play the endgame-ish middlegame with the freer pieces — no attack to look for here.
- **ng4-be7** — 5...Ng4 6.O-O Be7 7.Re1 d6
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ng4 6.O-O 6...Be7 7.Re1 7...d6 8.exd6 8...cxd6 9.Nxd4 9...O-O 10.Nc3`
  - provenance: ianchessgambits: 6...Be7 7.Re1 d6 8.exd6 cxd6 9.Nxd4 O-O 10.Nc3 (Bh4) was "analysed in James Schuyler’s book The Dark Knight System and leads to equal chances". 6...Be7 7.Re1 d6 is also a masters’ branch (31 games). 8...Qxd6 instead: 9.b3 O-O 10.Ba3.
  - plan (interpreted — ianGambits): Level material and equal chances (Schuyler via ianchessgambits): you have the better centre, Black the d6 isolani-style weakness. Develop Nc3, Bf4/Be3, put a rook on d1 against d6 and keep the g4 knight short of squares (h3).
- **ng4-bc5** — 5...Ng4 6.O-O Bc5 7.Bf4 O-O 8.h3 Nh6 9.Bxh6
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ng4 6.O-O 6...Bc5 7.Bf4 7...O-O 8.h3 8...Nh6 9.Bxh6 9...gxh6 10.c3`
  - provenance: After 5...Ng4 6.O-O the club players’ most common reply is 6...Bc5 (27%). Strong players answer 7.Bf4 (1,684 of 5,516), and after 7...O-O (60%) 8.h3 (679 of 711) Nh6 (49%) 9.Bxh6 gxh6 10.c3 (139 of 437) — exactly Chess Vibes’ idea ("Bf4 and h3 to force the knight to h6, then Bxh6 wrecks the king") in the 5.O-O move order. Black is a pawn up with a shattered kingside.
  - plan (interpreted — chessVibes, strong): Chess Vibes: the h6 pawns are wrecked and Black’s king is bare. After c3 dxc3 Nxc3 (or 10...d5 11.Bd3) bring the queen to d2/c1 against h6, Nbd2-e4 and Re1; the pawn does not matter, the king does.
- **ng4-trap** — 5...Ng4 6.O-O Ngxe5? — the pinned knight
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ng4 6.O-O 6...Ngxe5 7.Nxe5 7...Nxe5 8.Re1 8...d6 9.f4`
  - provenance: Strong players confirm every White move (7.Nxe5 259 of 283, 8.Re1 267 of 270, 9.f4 148 of 150). Smirnov (GM): vs 5...Ng4 castle — "6...Ngxe5? 7.Nxe5 Nxe5 8.Re1 wins the pinned knight"; 6.O-O is also the masters’ top move (139 of 274). The finish 8...d6 9.f4 is SoNy Trap 3 / CuriousOctopus 3.3. Provenance: B to 8.Re1, community for the last two plies.
  - plan (interpreted — rcaScotch, studySoNy): The pinned knight on e5 is lost after f4 and fxe5. The sequence trades your e-pawn and knight for both Black knights, leaving White roughly a pawn ahead; develop Nc3/Bf4 and use the open e-file.
- **ne4** — 5...Ne4 6.Qe2 Nc5 7.O-O Ne6
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ne4 6.Qe2 6...Nc5 7.O-O 7...Ne6 8.Bxe6 8...dxe6 9.Rd1 9...Be7 10.Nc3 10...O-O 11.Nb5 11...Bd7 12.a4 12...Qc8 13.Nbxd4`
  - provenance: Annotated master game (ianchessgambits): 6.Qe2 "kicks the e4-knight away and keeps open the options of playing a gambit or trying to regain the pawn on d4"; 7...Ne6 "reinforces d4 and encourages White to play a gambit". 6.Qe2 is also the masters’ top move vs 5...Ne4 (197 of 354) and 33 master games reach 8.Bxe6. Fishbein ch.4 covers 5...Ne4.
  - plan (quoted — ianGambits): "Black has to go quite passive, which enables White to get some attacking chances on the kingside" (ianchessgambits). The d4 pawn is regained by Nbxd4; then use the e5 wedge and the half-open d-file, and start the kingside attack.
- **ne4-be7** — 5...Ne4 6.Qe2 Nc5 7.O-O Be7 8.Rd1 d5 9.exd6
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ne4 6.Qe2 6...Nc5 7.O-O 7...Be7 8.Rd1 8...d5 9.exd6 9...Qxd6 10.b4 10...d3 11.cxd3 11...Nxb4 12.d4`
  - provenance: ianchessgambits: 8.Rd1 d5 9.exd6 Qxd6 10.b4 d3 11.cxd3 Nxb4 12.d4 "gives White promising play, J. Nogueiras Santiago–A. Mikhalchishin, Mexico 1977". 7...Be7 8.Rd1 is the masters’ line here (44 games).
  - plan (interpreted — ianGambits): White has given a pawn back for a big centre and open lines: d4 drives the c5 knight off, Nc3 and Ba3 follow, and the d-file rook hits the queen. Play for the initiative in the centre rather than the pawn count (interpretation of the annotated game).
- **ne4-be7-oo** — 5...Ne4 6.Qe2 Nc5 7.O-O Be7 8.Rd1 O-O 9.Nxd4
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ne4 6.Qe2 6...Nc5 7.O-O 7...Be7 8.Rd1 8...O-O 9.Nxd4 9...Nxd4 10.Rxd4`
  - provenance: Masters to 8.Rd1 (6.Qe2 197 of 354; 7.O-O 117 of 197; 7...Be7 47 games; 8.Rd1 44 of 48). Then the club players’ 8...O-O (64%, 7 master games) instead of the annotated game’s 8...d5: strong players regain the pawn with 9.Nxd4 (219 of 243) Nxd4 10.Rxd4 (180 of 180). Level material, White’s rook is active on d4.
  - plan (interpreted — masters, strong): Pawn regained, rook centralised on d4 and the e5 wedge: Nc3, Bf4/Be3 and Rad1 give a pleasant edge; watch the d4 rook against ...Ne6 (Rd1 or Rd2) and use e5-e6 breaks when Black’s pieces drift.
- **qe7-trap** — 5...Qe7?! 6.O-O — the pinned queen
  - moves: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Qe7 6.O-O 6...Nxe5 7.Nxe5 7...Qxe5 8.Re1 8...Ne4 9.f4`
  - provenance: Smirnov (GM): vs 5...Qe7 just castle; "6...Nxe5? 7.Nxe5 Qxe5 8.Re1 pins queen to king, then f4". SoNy Trap 4 / CuriousOctopus 3.5 give the block 8...Ne4 and 9.f4 Qf5 10.g4 Qg6 11.f5. 5...Qe7 is 12% of club games and 0% of master games. Engine (depth 18): 5...Qe7 itself is the error (about +2 for White after 6.O-O, 94% of strong players castle); 6...Nxe5 adds little — so this is a side line, not a trap. Provenance: B to 8.Re1 and the f4 idea; community for 8...Ne4.
  - plan (interpreted — rcaScotch, studySoNy): The queen is pinned to the king and the blocking knight on e4 hangs: after f4 the queen must run and Rxe4 follows. That leaves White roughly a pawn ahead, with the open e-file and faster development.
- **haxo** — Greco Gambit, 5...Nf6 6.e5 d5 (masters’ main line)
  - moves: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb6 9.Nc3 9...O-O 10.Be3 10...Bg4 11.h3`
  - provenance: Wikipedia Giuoco 6.e5: "surge in popularity in the early 21st century … Black’s best reply is 6...d5!" then 7.Bb5 Ne4 8.cxd4 Bb6 9.Nc3 O-O 10.Be3 "White has a space advantage; Black has a powerful knight". The masters’ main line of the whole Scotch Gambit: 1,138 games reach 10.Be3, 853 continue 10...Bg4, and 813 reach 11.h3 Bh5. Smirnov also recommends 6.e5 but plays 11.Bxc6 instead (see v-rca-haxo-nf6). IronStone chapter "Greco Gambit".
  - plan (interpreted — wikiGiuoco, masters, rcaScotch): White has a space advantage, Black a powerful knight on e4 (Wikipedia). Keep e5 and d4 solid, ask the bishop with h3, and look for Bxc6 to double the c-pawns before playing against them (Smirnov’s idea); castle and bring the rooks to c1/e1.
- **haxo-bg4** — Greco Gambit, 9...Bg4 first
  - moves: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb6 9.Nc3 9...Bg4 10.Be3 10...O-O 11.h3`
  - provenance: Same position as greco-gambit-e5 reached with 9...Bg4 first (813 master games). Same answers: Be3, then h3.
  - plan (interpreted — wikiGiuoco, masters, rcaScotch): Identical to the Greco Gambit main line: space advantage against the strong e4 knight; h3 asks the bishop, keep the centre solid, Bxc6 to double the c-pawns when it helps.
- **haxo-f5** — Greco Gambit, 10...f5
  - moves: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb6 9.Nc3 9...O-O 10.Be3 10...f5 11.exf6`
  - provenance: Master practice: 10...f5 is the second reply (115 games); White takes en passant, and Black recaptures 11...Nxf6 (54) or 11...Nxc3 (34).
  - plan (interpreted — masters): Take en passant: the e4 knight loses its anchor and Black’s king cover is thinned. Whichever way Black recaptures, castle and use the open e-file and the weakened kingside.
- **haxo-bb4** — Greco Gambit, 8...Bb4+
  - moves: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb4+ 9.Bd2 9...Nxd2 10.Nbxd2`
  - provenance: Smirnov mentions 8...Bb4+ 9.Bd2 as the alternative to 8...Bb6. Master practice continues 9...Nxd2 10.Nbxd2 O-O (34 games).
  - plan (interpreted — masters, rcaScotch): The pin is broken and a pair of knights is gone; castle, keep the e5 wedge and use the half-open c-file (Bxc6 ideas) — a calmer version of the Greco Gambit.
- **haxo-trap** — Haxo accepted 5...dxc3?! 6.Bxf7+ … 7...Ke8
  - moves: `3...exd4 4.Bc4 4...Bc5 5.c3 5...dxc3 6.Bxf7+ 6...Kxf7 7.Qd5+ 7...Ke8 8.Qh5+ 8...g6 9.Qxc5`
  - provenance: Smirnov: 8.Qh5+ "provokes ...g6, a vital weakness", then Qxc5; the king "moved back and forth and can’t castle". 5...dxc3 is the most common club reply (55%) and 7...Ke8 the most common king move (78%). Engine (depth 18): 5...dxc3 costs about 0.8 and the line ends at +2.0 — an inferior move with a clear answer (side), not a blunder. Smirnov continues 9...d6 10.Qxc3, but Stockfish rates 10.Qxc3 −0.51 against 10.Qe3, so the drilled line stops at 9.Qxc5; club replies there are 9...d6 33%, 9...cxb2 23%, 9...Qe7 20%.
  - plan (interpreted — rcaScotch): Material is level again and Black’s king is stuck in the centre with g6 weakened: pick up the c3 pawn (Qe3/Qxc3 or Nxc3), castle, bring a rook to e1/d1 against the d6 pawn and the pinned f6 knight, and keep the queens on (Smirnov).
- **haxo-trap-kf8** — Haxo accepted 5...dxc3?! 6.Bxf7+ … 7...Kf8
  - moves: `3...exd4 4.Bc4 4...Bc5 5.c3 5...dxc3 6.Bxf7+ 6...Kxf7 7.Qd5+ 7...Kf8 8.Qxc5+ 8...d6 9.Qxc3 9...Nf6 10.Nbd2 10...Be6 11.O-O 11...Kf7 12.Ng5+ 12...Ke7 13.Nxe6`
  - provenance: Exact PGN from the Chess Vibes description, which continues 13...Kxe6 14.f4; Stockfish (depth 18) rates 14.f4 −0.58 against 14.b4, so the drilled line stops at 13.Nxe6 (Black must recapture with the king). 7...Kf8 is 22% of club games; 8.Qxc5+ d6 9.Qxc3 regains the material with Black unable to castle.
  - plan (quoted — chessVibes): After ...Kxe6 the king stands on e6 in front of its own pieces: keep opening lines and checking — b4/f4, Qb3+, Nf3-g5 ideas — rather than counting material. Chess Vibes: Black "cannot castle and is in huge trouble".
- **london** — London Defence, 7...d6 8.Qb3 Qe7 9.e5 dxe5 10.Ba3
  - moves: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Ba5 7.O-O 7...d6 8.Qb3 8...Qe7 9.e5 9...dxe5 10.Ba3 10...Qf6 11.Nbd2 11...Nge7 12.Ne4`
  - provenance: Provenance by segment: Wikipedia gives 5.c3 dxc3 "then 6.O-O or 6.bxc3"; Smirnov (GM) gives 6.bxc3 Ba5 7.O-O and, vs ...d6, the Qb3 battery, Ba3 to stop castling and the e5 break "in the style of Morphy and Tal"; 8.Qb3 is also the strong players’ move (1,433 of 3,521), 8...Qe7 the club reply (61%), 9.e5 strong (559 of 1,272); after 9...dxe5 (45%) strong players continue exactly Smirnov’s ideas: 10.Ba3 (380 of 437) Qf6 11.Nbd2 (311 of 368) Nge7 12.Ne4 (144 of 152). Chess Doctrine: 6...Ba5 (not 6...Bc5? 7.Bxf7+).
  - plan (quoted — rcaScotch, chessdoctrine): Keep Black from castling and open lines (Smirnov): Ba3 pins the e7 knight to the king, Ne4 hits the f6 queen, Qb3 and Bc4 stare at f7. Develop with tempo (Rad1, Nxe5 ideas) and attack before Black untangles — you are a pawn down, so tempo matters.
- **london-qf6** — London Defence, 7...d6 8.Qb3 Qf6 9.Bg5
  - moves: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Ba5 7.O-O 7...d6 8.Qb3 8...Qf6 9.Bg5`
  - provenance: Black’s other queen move vs 8.Qb3: 8...Qf6 (21% of club games; 3 master games). Strong players answer 9.Bg5 (260 of 706) Qg6 and then 10.Nbd2 (100 of 280) — but Stockfish rates 10.Nbd2 −0.87 against 10.e5, so the drilled line stops at 9.Bg5 (Black’s 9...Qg6 is 99.5%).
  - plan (interpreted — rcaScotch, strong): Same theme as the main London line (Smirnov): Black cannot castle comfortably while Qb3 hits f7 and b7. Bring the knight to e4 or c4, Rae1 and the e5 break; the pawn is irrelevant, the initiative is not.
- **london-nge7** — London Defence, 7...Nge7 8.Ng5 O-O 9.Qh5
  - moves: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Ba5 7.O-O 7...Nge7 8.Ng5 8...O-O 9.Qh5 9...h6 10.Nxf7 10...Rxf7 11.Bxf7+`
  - provenance: 7...Nge7 is the club players’ most common 7th move (29%). Strong players hit f7 at once: 8.Ng5 (790 of 1,180); after 8...O-O (71%) 9.Qh5 (179 of 180) h6 10.Nxf7 Rxf7 11.Bxf7+ (169 of 173; 79 of 130) — knight and bishop for rook and pawn with Black’s king exposed. Engine-checked before shipping.
  - plan (interpreted — strong): After Bxf7+ Kh8/Kf8 the material is roughly level (N+B vs R+P) but Black’s king is bare: keep the queen on h5, bring Ba3/Nd2-e4 and Rae1, and aim at g6/e6 rather than cashing in early.
- **london-trap** — London Defence 6...Bc5?! 7.Bxf7+
  - moves: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Bc5 7.Bxf7+ 7...Kxf7 8.Qd5+ 8...Ke8 9.Qxc5 9...d6 10.Qh5+`
  - provenance: Chess Doctrine: "6...Bc5, which loses to 7.Bxf7+ Kxf7 8.Qd5+"; Smirnov: "6...Bc5? 7.Bxf7+" loses. Honest accounting: White gets bishop + pawn for the bishop, so material is LEVEL after 9.Qxc5 (the gambit pawn is back) and Black’s king has lost castling — the engine calls it about +0.8, a clear edge, not a win. 8...Ke8 is the club reply 75% of the time; then 9...d6 (49%) and strong players continue 10.Qh5+ (41 of 111) g6. 6...Bc5 is 28% of club games at that node.
  - plan (interpreted — chessdoctrine, rcaScotch): Material is level and Black cannot castle: keep the queen active (Qh5+ forces ...g6, weakening the dark squares), develop Ba3 and Nbd2-c4/e4, castle and open the centre with e5. Play against the king, do not trade queens (Chess Doctrine, Smirnov).
- **london-be7** — London Defence trap, 6...Be7?
  - moves: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Be7 7.Qd5 7...Nh6 8.Bxh6`
  - provenance: Smirnov: 6...Be7? 7.Qd5 threatens Qxf7# and b7; the only defence of f7 is 7...Nh6 and 8.Bxh6 wrecks the kingside ("at the very least Black loses a knight"). This is a bishop-for-knight trade after ...gxh6, not a free piece. Chess Doctrine gives the same 6...Be7 7.Qd5. 6...Be7 is 16% of club games here.
  - plan (interpreted — rcaScotch, chessdoctrine): After Bxh6, ...gxh6 trades your bishop for the knight and ruins Black's king shelter; White still has to justify the gambit pawn through initiative, not extra material. Castle, bring the rooks to the centre and attack before Black consolidates (Smirnov).
- **declined-d6** — Paris Defence 4...d6 5.Nxd4 Nf6 6.Nc3
  - moves: `3...exd4 4.Bc4 4...d6 5.Nxd4 5...Nf6 6.Nc3 6...Be7 7.O-O 7...O-O 8.h3 8...Ne5 9.Be2 9...Re8 10.f4 10...Ng6 11.g4`
  - provenance: ianchessgambits (Rohonyan–Zatonskih, reached by a different move order): the plan "appeals rather more to me, with the long-term idea of advancing the e and f-pawns". Masters agree on 5.Nxd4 Nf6 6.Nc3 (63 of 78). Chess Doctrine: 4...d6 "returns the pawn for a calm game".
  - plan (quoted — ianGambits): "The long-term idea of advancing the e and f-pawns" (ianchessgambits): with h3 in, play Be2, f4 and g4 to push the knights back and gain space on the kingside; Be3 and Qd2 complete the set-up.
- **declined-d6-nxd4** — Paris Defence 4...d6 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.Nc3 Be7 8.O-O
  - moves: `3...exd4 4.Bc4 4...d6 5.Nxd4 5...Nxd4 6.Qxd4 6...Nf6 7.Nc3 7...Be7 8.O-O 8...O-O 9.Bg5 9...h6 10.Bh4 10...Be6 11.Rad1`
  - provenance: After 4...d6 5.Nxd4 (177 of 192 master games) half of club players trade at once: 5...Nxd4 (52%) 6.Qxd4 (10,922 of 10,935 strong games) Nf6 (47%) 7.Nc3 (4,415 of 8,754) Be7 (60%) 8.O-O (4,662 of 9,921) O-O (83%) 9.Bg5 (3,024 of 12,616) h6 (25%) 10.Bh4 (972 of 1,030) Be6 (23%) 11.Rad1 (155 of 431). Same position as the Hungarian 6...Nxd4 line by another order.
  - plan (interpreted — strong, chessdoctrine): Development lead, queen on d4, pin on f6: Rad1 against d6, then Nd5 or e5 when it wins something; after ...Bxc4 Qxc4 keeps the pressure on e6/f7. Chess Doctrine: Black "returned the pawn for a calm game" — you have the calmer, freer side of it.
- **declined-d6-be6** — Paris Defence 4...d6 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.Nc3 Be6 8.Bg5
  - moves: `3...exd4 4.Bc4 4...d6 5.Nxd4 5...Nxd4 6.Qxd4 6...Nf6 7.Nc3 7...Be6 8.Bg5 8...Be7 9.O-O-O 9...O-O 10.Bxe6 10...fxe6 11.e5`
  - provenance: 7...Be6 (18% of club games) challenges the bishop: strong players play 8.Bg5 (417 of 1,444) Be7 (73%) 9.O-O-O (342 of 536) O-O (41%) 10.Bxe6 (329 of 970) fxe6 11.e5 (267 of 407). Opposite-side castling, Black’s e-pawns doubled.
  - plan (interpreted — strong): Opposite-side castling with the e5 wedge: after ...dxe5 Qxe5 the queen hits e6 and b7; Rhe1, Ne4 and the h-pawn march are your levers, Black’s only counterplay is on the c-file — keep it shut with Kb1.
- **h6** — 4...h6 5.Nxd4 Nxd4 6.Qxd4 d6 7.Nc3
  - moves: `3...exd4 4.Bc4 4...h6 5.Nxd4 5...Nxd4 6.Qxd4 6...d6 7.Nc3 7...Nf6 8.Bf4`
  - provenance: 4...h6 is 18% of club games and 6 of the owner’s. Strong players take the pawn back: 5.Nxd4 (7,493 of 15,923; ianchessgambits gives 5.Nxd4 Ne5 6.Bb3 in Yap–Pg 2011), 5...Nxd4 (49%) 6.Qxd4 (1,588 of 1,588), then vs 6...d6 (36%) 7.Nc3 (437 of 760) Nf6 and 8.Bf4 (131 of 483; strong players’ 8.O-O, 173 games, is rated −0.81 by Stockfish against 8.e5, so the line stops after the sound 8.Bf4). IronStone/EXOprimal/SoNy prefer 5.O-O, but no source carries that four moves. A normal position where ...h6 was simply a wasted tempo (engine about +0.7 for White here).
  - plan (interpreted — strong): Centralised queen, more space and a tempo up: Rad1 against d6, then e5 or Nd5 when it hits; Black’s h6 gives Bxh6 ideas if the king goes to g8 with the knight away. A calm edge — no gambit here.
- **hungarian** — Hungarian 4...Be7 5.Nxd4 d6 6.O-O Nf6 7.Nc3 O-O 8.Re1
  - moves: `3...exd4 4.Bc4 4...Be7 5.Nxd4 5...d6 6.O-O 6...Nf6 7.Nc3 7...O-O 8.Re1 8...Nxd4 9.Qxd4 9...Be6 10.Bxe6 10...fxe6 11.e5`
  - provenance: Wikipedia: 4...Be7 "transposes to the Hungarian Defence". Master practice to 8.Re1: 5.Nxd4 (103 of 199 master games), 5...d6 (76), 6.O-O (49 of 93), 6...Nf6 (68), 7.Nc3 (134 of 150), 7...O-O (234), 8.Re1 (106 of 298). Then the club players’ 8...Nxd4 (26%) 9.Qxd4 (2,346 of 2,348 strong games) Be6 (28%) 10.Bxe6 (562 of 1,713) fxe6 11.e5 (445 of 573). The old app line had the same structure, now with its provenance.
  - plan (interpreted — masters, strong): Centralised queen, e5 wedge against the f6 knight, Black’s e6 pawns doubled: after ...dxe5 Qxe5 the queen hits e6 and b7; otherwise Ne4 and Bg5/Bf4. A calm, better middlegame with the safer king — no gambit left here.
- **hungarian-nxd4** — Hungarian 4...Be7 5.Nxd4 d6 6.O-O Nxd4 7.Qxd4 Nf6 8.Nc3
  - moves: `3...exd4 4.Bc4 4...Be7 5.Nxd4 5...d6 6.O-O 6...Nxd4 7.Qxd4 7...Nf6 8.Nc3 8...O-O 9.Bg5 9...h6 10.Bh4 10...Be6 11.Rad1`
  - provenance: The other Hungarian move order: 6...Nxd4 (31% of club games) 7.Qxd4 (1,911 of 1,914 strong games) Nf6 (68%) 8.Nc3 (6,728 of 8,344) O-O (83%; 25 master games) 9.Bg5 (3,024 of 12,616) h6 (25%) 10.Bh4 (972 of 1,030) Be6 (23%) 11.Rad1 (155 of 431).
  - plan (interpreted — strong): Development lead with the queen on d4 and the pin on f6: Rad1 against d6, Nd5 or e5 when it wins something; if ...Bxc4 then Qxc4 keeps the pressure on e6/f7. Standard Scotch-style pressure, nothing forced.
- **hungarian-bxe5** — Hungarian 4...Be7 5.Nxd4 Nxd4 6.Qxd4 Bf6 7.e5 … 10...Bxe5?! 11.Bxf7+
  - moves: `3...exd4 4.Bc4 4...Be7 5.Nxd4 5...Nxd4 6.Qxd4 6...Bf6 7.e5 7...Qe7 8.f4 8...d6 9.O-O 9...dxe5 10.fxe5 10...Bxe5 11.Bxf7+ 11...Qxf7 12.Qxe5+`
  - provenance: After 5...Nxd4 (32% of club games) 6.Qxd4 Bf6 (31%) strong players push 7.e5 (604 of 936), then 7...Qe7 (74%) 8.f4 (345 of 464) d6 (70%) 9.O-O (284 of 299) dxe5 (97%) 10.fxe5 (262 of 280) and the natural 10...Bxe5? (63% of club players!) runs into 11.Bxf7+ (158 of 169) Qxf7 12.Qxe5+ (89 of 89): the bishop is regained with check and Black’s king has lost castling. Engine (depth 18): 10...Bxe5 costs 0.96 and the line ends +2.9 — labelled side (the swing is a hair under the +1.0 trap bar).
  - plan (interpreted — strong): A pawn up with queens on and Black’s king stuck in the centre after Qxe5+: develop Nc3/Bf4/Rae1 fast and use the e-file; if Black trades queens the ending is comfortably better, but keep them on while the king is exposed.
- **hungarian-nf6** — Hungarian 4...Be7 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.e5
  - moves: `3...exd4 4.Bc4 4...Be7 5.Nxd4 5...Nxd4 6.Qxd4 6...Nf6 7.e5 7...c5 8.Qf4`
  - provenance: After 6.Qxd4 the other developing move 6...Nf6 (39%): 7.e5 (499 of 788 strong games) hits the knight; vs 7...c5 (44%) 8.Qf4 (115 of 188) keeps the e5 pawn and the queen active.
  - plan (interpreted — strong): The e5 wedge cramps Black: after the knight retreats (…Ng8/…Nd5) play Nc3, O-O and Rd1/Re1; the queen on f4 supports e5 and eyes f7. Space and development for the pawn you already regained.
- **scotch-d6** — 3...d6 4.dxe5 — queens off, king stuck on d8
  - moves: `3...d6 4.dxe5 4...dxe5 5.Qxd8+ 5...Kxd8 6.Bb5 6...Bd7 7.Bxc6 7...Bxc6 8.Nxe5`
  - provenance: Smirnov: "easier for you to just capture"; after the queen trade Black cannot castle and the king sits on the open d-file. 6.Bb5 pressures c6; the natural 6...Bd7? loses the e5 pawn to 7.Bxc6 Bxc6 8.Nxe5, and Smirnov continues 8...Bxe4? 9.Nxf7+ ("your knight is a real forkaholic") — that last blunder is left out of the drill; the line stops once the pawn is won. EXOprimal gives the same 4.dxe5. Conflicts with Wikipedia/Bezgodov’s 4.d5 (philidor-d6), which no read source continues past 5.c4; 4.d5 stays here as the book alternative.
  - plan (interpreted — rcaScotch): A clean pawn up with queens off and Black’s king stuck on d8. Smirnov’s knight fork on f7 is the threat if Black grabs e4; otherwise develop Nc3, Bf4/Be3 and castle long or short, then push the extra pawn — simple technique.
- **nf6-3** — 3...Nf6?! 4.d5 Ne7 5.Nxe5 Nxe4?
  - moves: `3...Nf6 4.d5 4...Ne7 5.Nxe5 5...Nxe4 6.Qe2 6...Nf6 7.d6 7...cxd6 8.Nc4`
  - provenance: Smirnov: 4.d5 kicks the knight; 4...Nd4? 5.Nxe5 and the knight on d4 "has no way out"; 4...Ne7 5.Nxe5 Nxe4 6.Qe2! Nf6 7.d6! cxd6 8.Nc4 — the e7 knight is pinned to the king, d6 falls with check, then Nxf7. Engine (depth 18): 3...Nf6 already costs about a pawn (+1.1 after 5.Nxe5); 5...Nxe4 is what 69% of strong players play and costs little more; the real mistake is 6...Nf6? (57% of club players, 70% of strong players!) which lets 7.d6 in (+2.3 → +4.4 after 8.Nc4). 6...Nd6 is the sober retreat.
  - plan (interpreted — rcaScotch): Use the e-file pin: the e7 knight cannot move, and Nxd6+ or Nxf7 is next. Do not let Black consolidate — every move should add pressure on e7/f7 (Smirnov).
- **sur-max-lange** — Max Lange Attack: 4...Bc5 5.O-O!? Nf6 6.e5 d5 7.exf6
  - moves: `3...exd4 4.Bc4 4...Bc5 5.O-O 5...Nf6 6.e5 6...d5 7.exf6 7...dxc4 8.Re1+ 8...Be6 9.Ng5 9...Qd5 10.Nc3 10...Qf5 11.Nce4 11...O-O-O 12.g4`
  - provenance: Wikipedia: main line "7.exf6 dxc4 8.Re1+ Be6 9.Ng5 Qd5 10.Nc3 Qf5 11.Nce4 O-O-O with complex play"; trap 9...Qxf6?? 10.Nxe6. 12.g4 is the masters’ move there (28 of 38 games). Fishbein ch.6: 5.O-O "is much better for White than its reputation". Our repertoire plays 5.c3; this is the SURPRISE alternative, drilled apart from it.
  - plan (interpreted — wikiMaxLange, fishbein): Wikipedia: "complex play". Both kings are in the air but yours is castled: g4 drives the queen, then Nxe6/fxg7 ideas, Qf3 and the e-file. Play for the initiative, not material — this is a gambit you chose on purpose (interpretation of the Wikipedia/Fishbein assessment).
- **sur-nakhmanson** — 4...Nf6 5.O-O!? Nxe4 6.Re1 d5 7.Bxd5 (Chess Vibes)
  - moves: `3...exd4 4.Bc4 4...Nf6 5.O-O 5...Nxe4 6.Re1 6...d5 7.Bxd5 7...Qxd5 8.Nc3 8...Qf5 9.Nxe4`
  - provenance: Chess Vibes' recommendation vs 4...Nf6 is 5.O-O: "if you can castle and Black cannot, it's okay to give up the e-pawn". 7.Bxd5! Qxd5 8.Nc3 — the knight cannot be taken (pin on the queen); 8...dxc3? 9.Qxd5; 8...Qf5 9.Nxe4 and vs a careless move Nf6+ double check mates. Wikipedia: Anderssen Attack; Black is fine with 8...Qa5/Qh5. Our repertoire plays 5.e5; this is a SURPRISE alternative.
  - plan (interpreted — chessVibes): Chess Vibes: you are castled and Black is not — that is the whole point. After Nxe4 the e-file and the Nf6+/Nd6+ jumps are the threats; keep the queen trade off the table and bring the second rook to the e-file.
- **sur-london-oo** — London 6.O-O!? cxb2 7.Bxb2 (Chess Vibes)
  - moves: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.O-O 6...cxb2 7.Bxb2 7...Nf6 8.e5 8...Ne4 9.a3 9...Ba5 10.Qd5 10...Ng5 11.Nxg5 11...Qxg5 12.Qxf7+ 12...Kd8 13.e6`
  - provenance: Chess Vibes: castle instead of recapturing, two pawns down but "three pieces developed, bishops lined up on the kingside". After 7...Nf6 8.e5 Ne4? 9.a3! Ba5 10.Qd5 (mate threat on f7 plus the knight) Ng5 11.Nxg5 Qxg5 12.Qxf7+ Kd8 13.e6 — and if ...Ne5 then e7+. EXOprimal has the same 6.O-O. Our repertoire plays 6.bxc3; this is a SURPRISE alternative and needs Black’s 8...Ne4? to work.
  - plan (interpreted — chessVibes): Chess Vibes: the king on d8 cannot escape — e6-e7+ is coming and every white piece joins. Keep checking and pushing the e-pawn; material does not matter here.

## Elephant Gambit (Black) — 19 lines

| app id | library id | kind | weight | plies | ours after deviation | engine plies | mistake: club share / swing / end | sources | plan (basis) |
|---|---|---|---|---|---|---|---|---|---|
| main | paulsen-nc3-5 | main | B known | 16 | 6 | 0 |  | ostrovskiy, chessmood, wikiElephant, masters, strong | ostrovskiy, wikiElephant (interpreted) |
| nc3-5-nxf6 | strong-nc3-5-nxf6 | main | B known | 20 | 4 | 0 |  | strong, amateur, ostrovskiy | strong (interpreted) |
| nc3-6-rd1 | strong-nc3-rd1 | main | B known | 20 | 6 | 0 |  | strong, chessmood, amateur | strong, chessmood (interpreted) |
| nc3-6-qd3 | strong-nc3-qd3 | main | B known | 20 | 6 | 0 |  | strong, amateur | strong (interpreted) |
| nc3-6 | v-rca-nf6-nc3-bb4 | trap | B known | 18 | 5 | 0 | 9.Bxf6: 51.1% of 28,766 / +3.1 / +3.2 | rcaElephant, akeem, chessmood, amateur | rcaElephant, akeem (interpreted) |
| nc3-6-dxe4 | strong-nc3-dxe4-7 | main | B known | 20 | 6 | 0 |  | strong, chessmood, amateur | strong, chessmood (interpreted) |
| dxe4-6 | strong-dxe4-bc4 | main | B known | 18 | 5 | 0 |  | strong, amateur | strong (interpreted) |
| dxe4-6-nc3 | strong-dxe4-nc3 | main | B known | 20 | 6 | 0 |  | strong, amateur | strong (interpreted) |
| nd4 | strong-nd4 | main | B known | 20 | 7 | 0 |  | strong, masters, amateur, akeem | strong, akeem (interpreted) |
| d4 | declined-d4 | main | A theory | 12 | 4 | 0 |  | masters, studyBunny, games | masters (interpreted) |
| nxe5-bc4-dxe5 | strong-bc4-dxe5-ke1 | main | B known | 18 | 7 | 0 |  | strong, amateur, elephantQC | strong, elephantQC (interpreted) |
| nxe5-bc4-dxe5-be2 | strong-bc4-dxe5-be2 | main | B known | 20 | 8 | 0 |  | strong, amateur | strong (interpreted) |
| nxe5-nc3-bf4 | strong-nc3-bf4 | main | B known | 16 | 6 | 0 |  | strong, amateur, elephantQC | strong, elephantQC (interpreted) |
| nxe5-nc3-kxd1 | strong-nc3-kxd1 | main | B known | 22 | 9 | 0 |  | strong, amateur | strong (interpreted) |
| nxe5-nc4 | strong-nc4 | main | B known | 16 | 6 | 0 |  | strong, masters, elephantQC, amateur | elephantQC, strong (quoted) |
| nxe5-nc3 | qc-nxe5-nc3 | main | A theory | 20 | 8 | 0 |  | elephantQC, amateur | elephantQC (quoted) |
| nxe5-bc4 | karker-bc4-bf4 | main | B known | 22 | 9 | 0 |  | harding, wikiElephant, chessmood, elephantQC | harding, elephantQC (interpreted) |
| nxe5-bc4-nc3 | cm-bc4-nc3 | main | B known | 24 | 10 | 0 |  | chessmood, elephantQC | chessmood, elephantQC (interpreted) |
| nxf7 | qc-nxf7 | side | A theory | 14 | 5 | 0 | 4.Nxf7: 16.4% of 601,998 / +1.9 / +1.4 | elephantQC, amateur, sf | elephantQC (interpreted) |
| sur-maroczy | maroczy-bd6 | surprise | A theory | 20 | 7 | 0 |  | elephantQC, rogers, khalifman, wikiElephant, studyGriffen, studyBunny | elephantQC, studyGriffen (interpreted) |
| sur-maroczy-greek | v-rca-maroczy-greek | surprise | B known | 18 | 6 | 0 |  | rcaElephant, elephantQC | rcaElephant (quoted) |

### Move-by-move provenance

- **main** — Paulsen Countergambit, 4.Qe2 Nf6 5.Nc3
  - moves: `3.exd5 3...e4 4.Qe2 4...Nf6 5.Nc3 5...Be7 6.Nxe4 6...O-O 7.d3 7...Nxd5 8.Qd1 8...Re8`
  - provenance: IM Ostrovskiy’s model line, taken from the video description on lichess.org/video (the video itself was not watched); it continues 8...Nc6 9.Be2 Bf5 10.O-O Qd7, but Stockfish (depth 18) rates 8...Nc6 −0.50 against 8...c5 and 9...Bf5 −0.50 against 9...f5, so the drilled 8th move is the strong players’ 8...Re8 (658 of 1,244 games; masters prefer 8...f5, 4 of 8) and the line stops there. ChessMood: 5.Nc3 "avoids the pin". Wikipedia: 5.Nc3 Be7 6.Nxe4 "slight advantage" for White (Salomonsson–Sorenson 1982). Masters: 5.Nc3 is their most common 5th move (47%), then 7.d3 70%; 19 master games reach 6.Nxe4. The engine rates the end position about −1.5 for Black: the honest price of the gambit against its best-known treatment; no single Black move after 2...d5 loses 0.5 by itself.
  - plan (interpreted — ostrovskiy, wikiElephant): Material is level again after ...Nxd5 and White’s edge is small (Wikipedia). The rook on e8 takes the open e-file; Ostrovskiy’s set-up follows with ...Nc6, ...Bf5 (or ...f5) and ...Qd7, rooks to d8/e8 against the isolated d3 pawn; keep pieces active and avoid the queen trade while White is behind in development.
- **nc3-5-nxf6** — 5.Nc3 Be7 6.Nxe4 O-O 7.Nxf6+ Bxf6 8.d3
  - moves: `3.exd5 3...e4 4.Qe2 4...Nf6 5.Nc3 5...Be7 6.Nxe4 6...O-O 7.Nxf6+ 7...Bxf6 8.d3 8...Re8 9.Be3 9...Bxb2 10.Rb1 10...Bc3+`
  - provenance: In the trunk position after 6...O-O club players take 7.Nxf6+ (56%!) far more often than the theory move 7.d3. Strong players recapture 7...Bxf6 (5,283 of 5,283), meet 8.d3 with 8...Re8 (344 of 473), and after 9.Be3 grab 9...Bxb2 10.Rb1 Bc3+ (285 of 395; 272 of 273). Engine-checked before shipping.
  - plan (interpreted — strong): You have the two bishops’ activity and a pawn back after ...Bxb2; White’s king is still on e1 and the e-file is yours. Keep the initiative: ...Nc6 or ...Nd7, ...Qe7/…Qf6, and do not let White untangle with Kd1/Kf1 for free.
- **nc3-6-rd1** — 5.d3 Qxd5 6.Nc3 Bb4! 7.Bd2 Bxc3 8.Bxc3 O-O 9.dxe4 Nxe4 10.Rd1
  - moves: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.Nc3 6...Bb4 7.Bd2 7...Bxc3 8.Bxc3 8...O-O 9.dxe4 9...Nxe4 10.Rd1 10...Nxc3`
  - provenance: The sound continuation of the 6.Nc3 Bb4! line (ChessMood): after 9.dxe4 (31% of club games; the other half play 9.Bxf6? — see the trap) 9...Nxe4 (2,914 of 2,978 strong games) and vs 10.Rd1 (50%) the trade 10...Nxc3 (1,065 of 1,708). Material level.
  - plan (interpreted — strong, chessmood): After ...Nxc3 bxc3 White has a wrecked queenside and your queen is centralised: ...Nc6, ...Bf5/...Bg4, ...Rad8 and pressure on the c-pawns. Do not allow the queen trade for free; keep the pieces that hit c3 and d1.
- **nc3-6-qd3** — 5.d3 Qxd5 6.Nc3 Bb4! … 9.dxe4 Nxe4 10.Qd3
  - moves: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.Nc3 6...Bb4 7.Bd2 7...Bxc3 8.Bxc3 8...O-O 9.dxe4 9...Nxe4 10.Qd3 10...Nxc3`
  - provenance: Same line, White’s other 10th move (30%): 10.Qd3 offers the queen trade; strong players still take 10...Nxc3 (649 of 745), spoiling the pawns before the queens come off.
  - plan (interpreted — strong): Whether White trades queens or not, the doubled c-pawns are the long-term target: ...Nc6, ...Be6 and rooks to d8/e8. With queens on, ...Qe5 hits c3 and e-file; with queens off, it is a comfortable ending.
- **nc3-6** — 5.d3 Qxd5 6.Nc3 Bb4! 7.Bd2 Bxc3 8.Bxc3 O-O 9.Bxf6? exf3!
  - moves: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.Nc3 6...Bb4 7.Bd2 7...Bxc3 8.Bxc3 8...O-O 9.Bxf6 9...exf3`
  - provenance: Both videos: pin with ...Bb4, trade on c3, castle. The trap: 9.Bxf6? (planning Bxf6 gxf6 dxe4) is met by 9...exf3! hitting the queen while Qd5 attacks f6 — White loses a piece. Akeem: "if they take on f6 it's a blunder". Amateurs play 9.Bxf6 51% here, so this is worth knowing. If 9.dxe4 Nxe4 instead. ChessMood confirms 6...Bb4! as Black's key move. Labelled main because 5.d3 and 6.Nc3 are sound; only the last White move is the mistake.
  - plan (interpreted — rcaElephant, akeem): After ...exf3 White loses a piece: the queen must move and ...Qxf6 keeps everything. If White declines the bait with 9.dxe4, take ...Nxe4 — pawn regained with a lead in development, then ...Nc6, ...Bg4/...Bf5 and rooks to the centre (Smirnov, Akeem).
- **nc3-6-dxe4** — 5.d3 Qxd5 6.Nc3 Bb4! 7.dxe4 Qxe4
  - moves: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.Nc3 6...Bb4 7.dxe4 7...Qxe4 8.Bd2 8...Qxe2+ 9.Bxe2 9...O-O 10.O-O-O 10...Nc6`
  - provenance: ChessMood lists 7.dxe4 among White’s tries vs 6...Bb4. Strong players take 7...Qxe4 (512 of 1,023), then the same 8.Bd2 Qxe2+ 9.Bxe2 O-O 10.O-O-O Nc6 structure as the 6.dxe4 line. Level.
  - plan (interpreted — strong, chessmood): Identical structure to the 6.dxe4 7.Nc3 line: queens off, pawn regained, ...Re8, ...Bf5 and ...Rad8; trade the b4 bishop on c3 only when it damages the pawns.
- **dxe4-6** — 5.d3 Qxd5 6.dxe4 Qxe4 7.Qxe4+ Nxe4 8.Bd3 Nc5
  - moves: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.dxe4 6...Qxe4 7.Qxe4+ 7...Nxe4 8.Bd3 8...Nc5 9.Bc4 9...Be6`
  - provenance: 6.dxe4 is the club players’ most common 6th move (49% of 161,000 games) and no book covers it. Strong online players (2200-2500) answer 6...Qxe4 (3,983 of 4,216), recapture 7...Nxe4 (1,027 of 1,027), retreat 8...Nc5 vs 8.Bd3 (729 of 795) and meet 9.Bc4 with 9...Be6 (200 of 378). Level material, queens off.
  - plan (interpreted — strong): The gambit pawn is back and the queens are off: a level ending-type middlegame. Strong players trade the light bishops on e6 or c4, castle long or short, and use the half-open e-file; the knight on c5 is well placed. Play solidly — there is nothing to attack yet.
- **dxe4-6-nc3** — 5.d3 Qxd5 6.dxe4 Qxe4 7.Nc3 Bb4
  - moves: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.dxe4 6...Qxe4 7.Nc3 7...Bb4 8.Bd2 8...Qxe2+ 9.Bxe2 9...O-O 10.O-O-O 10...Nc6`
  - provenance: After 6.dxe4 Qxe4, 7.Nc3 (34% of club games) is met by the pin 7...Bb4 (1,911 of 2,322 strong games), then 8.Bd2 Qxe2+ 9.Bxe2 O-O and vs 10.O-O-O the development 10...Nc6 (392 of 1,000). Level.
  - plan (interpreted — strong): Queens off, pawn regained, both sides castled: play ...Re8, ...Bg4 or ...Bf5 and ...Rad8 against the d-file; keep the b4 bishop or trade it on c3 to spoil White’s queenside pawns. An equal position you know better than your opponent.
- **nd4** — 4.Nd4 Qxd5 5.Nb3 Nf6 6.Nc3 Qe5 7.Be2 Nc6 8.O-O Bd6
  - moves: `3.exd5 3...e4 4.Nd4 4...Qxd5 5.Nb3 5...Nf6 6.Nc3 6...Qe5 7.Be2 7...Nc6 8.O-O 8...Bd6 9.g3 9...Bh3 10.Re1 10...O-O-O`
  - provenance: 4.Nd4 is the club players’ second choice (29%). 4...Qxd5 (16,794 of 20,703 strong games); vs 5.Nb3 (32%, the masters’ move) 5...Nf6, then vs 6.Nc3 the Akeem/strong-player 6...Qe5 (4,415 of 6,431). After 7.Be2 strong players mostly play 7...Bd6 (72%), but Stockfish rates that −0.55 against 7...Nc6 (22%, 691 games), so the drilled move is 7...Nc6; then 8.O-O (75%) Bd6 (425 of 461), 9.g3 Bh3 (205 of 416), 10.Re1 O-O-O (161 of 202). Pawn down, every piece pointing at the white king.
  - plan (interpreted — strong, akeem): Opposite-side castling with all your pieces aimed at g2/h2: the ...Bd6/...Qe5 battery, the bishop on h3, and ...h5-h4 to open the h-file (Akeem’s plan). Meet d3/d4 with ...exd3 or ...Qh5; keep the initiative rather than counting the pawn.
- **d4** — 3.d4 (Elephant declined)
  - moves: `3.d4 3...dxe4 4.Nxe5 4...Nd7 5.Nd2 5...Nxe5 6.dxe5 6...Bf5`
  - provenance: Master practice: 3.d4 is the masters’ second choice (21%); 36 master games reach 4...Nd7, 19 continue 5.Nd2 and 13 reach 6...Bf5 — thin but the whole line is master moves, no engine. BunnyMommy covers 3.d4 exd4 instead. Old app line used 4...Nd7 5.Nxd7 Bxd7 6.Nc3 from the amateur database; not kept (2 sourced Black moves only).
  - plan (interpreted — masters): Level material: your e4 pawn is anchored by the f5 bishop and White’s e5 pawn is loose. Bring the queen out (...Qd5 or ...Qe7), develop the g8 knight and castle; the e5 pawn and the open d-file are your targets (masters, 13 games).
- **nxe5-bc4-dxe5** — 3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.dxe5 Qxd1+ … 9.Ke1 Nge7
  - moves: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Bc4 5...Bxe5 6.dxe5 6...Qxd1+ 7.Kxd1 7...Nc6 8.Bf4 8...Bg4+ 9.Ke1 9...Nge7`
  - provenance: After 5.Bc4 Bxe5 the club players’ main move is 6.dxe5 (67%), not the book’s 6.Qh5. Strong players trade queens 6...Qxd1+ (10,901 of 10,970), then 7...Nc6, 8.Bf4 Bg4+ (2,672 of 5,795), 9.Ke1 and now 9...Nge7 (114 of 885 strong games; the more popular 9...O-O-O, 723 games, is rated −0.51 by Stockfish against Nge7). Black is a pawn down but every piece is active and White cannot castle.
  - plan (interpreted — strong, elephantQC): A pawn down with queens off, but White’s king has lost castling and your pieces are all out: ...Ng6 hits e5 and f4, ...O-O-O and ...Rhe8 follow, ...Nd4 hits c2. Win the e5 pawn back with the more active pieces; the ending is level.
- **nxe5-bc4-dxe5-be2** — 3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.dxe5 Qxd1+ … 9.Be2
  - moves: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Bc4 5...Bxe5 6.dxe5 6...Qxd1+ 7.Kxd1 7...Nc6 8.Bf4 8...Bg4+ 9.Be2 9...O-O-O+ 10.Ke1 10...Bxe2`
  - provenance: White’s other block, 9.Be2 (28%): 9...O-O-O+ (327 of 366 strong games) and after 10.Ke1 the trade 10...Bxe2 (225 of 237).
  - plan (interpreted — strong): After Kxe2 White’s king is stuck in the centre with rooks unconnected: ...Nge7, ...Rhe8 and ...Nxe5 or ...f6 regain the pawn with the more active pieces. Trade into the ending only after e5 falls.
- **nxe5-nc3-bf4** — 3.Nxe5 Bd6 4.d4 dxe4 5.Nc3 Bxe5 6.dxe5 Qxd1+ 7.Nxd1 Nc6 8.Bf4 Be6
  - moves: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Nc3 5...Bxe5 6.dxe5 6...Qxd1+ 7.Nxd1 7...Nc6 8.Bf4 8...Be6`
  - provenance: The book’s 5.Nc3 Bxe5 6.dxe5 Qxd1+ 7.Nxd1 Nc6 with the club players’ most common 8th move, 8.Bf4 (54%) instead of the book game’s 8.Bb5. Strong players mostly play 8...Nge7 (1,806 of 2,466), but Stockfish rates it −0.59 against 8...Be6, which 90 strong players chose — so the drilled move is 8...Be6 and the line stops there.
  - plan (interpreted — strong, elephantQC): The e5 pawn is the target: ...Be6 develops and eyes a2/c4, then ...O-O-O, ...Nge7-g6 or ...f6; if Bg3 then ...Ngxe5. Equal, with Black the more active side (the book’s assessment of this structure).
- **nxe5-nc3-kxd1** — 3.Nxe5 Bd6 4.d4 dxe4 5.Nc3 Bxe5 6.dxe5 Qxd1+ 7.Kxd1
  - moves: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Nc3 5...Bxe5 6.dxe5 6...Qxd1+ 7.Kxd1 7...Nc6 8.Bf4 8...Bf5 9.Bb5 9...O-O-O+ 10.Ke2 10...Nd4+ 11.Kf1 11...Nxc2`
  - provenance: White recaptures with the king (41%): 7...Nc6 (3,277 of 5,493 strong games), 8.Bf4 and now 8...Bf5 (36%, 318 games) rather than the more popular 8...Bg4+ (Stockfish −0.50 for the check). Then 9.Bb5 (69% of club games) O-O-O+ (394 of 490), 10.Ke2 Nd4+ (115 of 133), 11.Kf1 Nxc2 (58 of 73) — the pawn is back with White’s king walking.
  - plan (interpreted — strong): White’s king has wandered to f1 and the rook on a1 is hanging to ...Nxa1 next: material is level, your pieces are all out and White’s are not. Keep checking and developing (...Nxa1 or ...Nb4, ...Rd2/...Re8) rather than trading; the ending is very comfortable.
- **nxe5-nc4** — 3.Nxe5 Bd6 4.d4 dxe4 5.Nc4 Nf6
  - moves: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Nc4 5...Nf6 6.Nxd6+ 6...Qxd6 7.Nc3 7...O-O 8.Be2 8...Nc6`
  - provenance: The masters’ most popular 5th move (25 games; 17% of club games). The book: "5...Nf6 sees Black develop quickly without fretting over the bishop pair" (26,824 of 43,226 strong games). Vs 6.Nxd6+ (42%) 6...Qxd6, 7.Nc3 O-O (761 of 1,191), 8.Be2 Nc6 (414 of 663).
  - plan (quoted — elephantQC, strong): "Develop quickly without fretting over the bishop pair" (the book): pawn down but fully developed; ...Re8, ...Bf5/...Bg4 and ...Rad8 against d4, with ...Nb4 or ...Nxd4 tricks once White castles. Regain the pawn or keep the initiative — do not rush.
- **nxe5-nc3** — 3.Nxe5 Bd6 4.d4 dxe4 5.Nc3 Bxe5 (the book)
  - moves: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Nc3 5...Bxe5 6.dxe5 6...Qxd1+ 7.Nxd1 7...Nc6 8.Bb5 8...Bd7 9.Bf4 9...Nge7 10.Nc3 10...O-O-O`
  - provenance: Quality Chess excerpt, game Swan–Greet 2017 (IM Andrew Greet as Black): 5.Nc3 Bxe5 6.dxe5 Qxd1+ 7.Nxd1 Nc6 8.Bb5 Bd7 9.Bf4 Nge7 10.Nc3 O-O-O; "10...Ng6 was the only move on the database, but I correctly rejected it because 11.e6!N is annoying"; "The position is equal, with just a tiny edge in piece activity for Black." 5.Nc3 is the club players’ most common 5th move (22%). Replaces the 5...Nf6 6.Bg5 O-O puzzle line (v-rca-nxe5-puzzle), which is now research only.
  - plan (quoted — elephantQC): "The position is equal, with just a tiny edge in piece activity for Black" (Aabling-Thomsen & Jensen). Queens are off: play ...Ng6 against e5 only when e6 is covered, ...Rhe8, ...f6 to undermine e5, and use the extra activity to win the e5 pawn or trade into a comfortable ending.
- **nxe5-bc4** — 3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.Qh5 Qe7 … 9.Bf4
  - moves: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Bc4 5...Bxe5 6.Qh5 6...Qe7 7.Qxe5 7...Qxe5 8.dxe5 8...Nc6 9.Bf4 9...Nge7 10.Bb5 10...Bf5 11.Nd2 11...O-O-O`
  - provenance: Harding (ChessCafe 1997) quoting Karker: 5.Bc4 Bxe5 6.Qh5 Qe7 7.Qxe5 Qxe5 8.dxe5 Nc6 9.Bf4 Nge7 10.Bb5 Bf5 11.Nd2 O-O-O 12.O-O-O "unclear". Wikipedia/MCO give 6...Qf6 7.dxe5 ±, so 6...Qe7 (ChessMood, the book) is the repertoire move. The book’s Game 5 (Fawler–Rasmussen) has the same 9.Bf4 Nge7.
  - plan (interpreted — harding, elephantQC): Queens are off and the e5 pawn is White’s only trump; Karker’s set-up ...Nge7, ...Bf5 and ...O-O-O puts every piece on the e4/e5 complex. Then ...Ng6 or ...f6 wins e5 back or trades into an equal ending (interpretation of the Harding/Karker line).
- **nxe5-bc4-nc3** — 3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.Qh5 Qe7 … 9.Nc3
  - moves: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Bc4 5...Bxe5 6.Qh5 6...Qe7 7.Qxe5 7...Qxe5 8.dxe5 8...Nc6 9.Nc3 9...Nxe5 10.Bb3 10...Bd7 11.Bf4 11...f6 12.Nxe4 12...O-O-O`
  - provenance: GM Grigoryan (ChessMood, White’s side) analysing the book’s recommendation: after 9.Nc3! Nxe5 10.Bb3 "the authors offer Bd7! – the best move!"; "Black’s idea is after 11.Ne4 to have the move 11...Bc6"; 11.Bf4 f6 12.Nxe4 O-O-O 13.Nc5. Black has regained the pawn; ChessMood still likes White a little.
  - plan (interpreted — chessmood, elephantQC): Pawn regained, queens off, king castled long: the game is level-ish with White slightly more active (ChessMood). Keep the e5 knight supported by ...f6, meet Nc5 with ...Bc6 or ...Be8, and trade down — no need for more than equality here.
- **nxf7** — 3.Nxe5 Bd6 4.Nxf7?! — the greedy fork
  - moves: `3.Nxe5 3...Bd6 4.Nxf7 4...Kxf7 5.Qh5+ 5...g6 6.Qxd5+ 6...Kg7 7.b3 7...Qf6`
  - provenance: Quality Chess excerpt: 4.Nxf7 Kxf7 5.Qh5+ g6 6.Qxd5+ Kg7! 7.b3 Qf6 (and 7.Bc4 Qe7). White has three pawns for the knight but Black’s pieces come out with tempo; Black scores 60% here in club games; the engine swings about +2.0 for Black on 4.Nxf7 and gives +1.4 at the end of the book line — a clear edge (side), not a won position (trap). Replaces nxf7-greed (which had no Black moves).
  - plan (interpreted — elephantQC): A knight for three pawns with all your pieces coming out: ...Nc6, ...Bf5/…Be6, ...Rf8 and ...Rae8 against the white king before it castles. Do not trade queens early — the initiative is worth more than the pawns (interpretation of the book line).
- **sur-maroczy** — The book’s system: 3.exd5 Bd6!? 4.d4 e4 5.Ne5 Nf6
  - moves: `3.exd5 3...Bd6 4.d4 4...e4 5.Ne5 5...Nf6 6.Bb5+ 6...Nbd7 7.Bg5 7...O-O 8.Bxd7 8...Bxd7 9.Bxf6 9...gxf6 10.Nxd7 10...Qxd7`
  - provenance: THE book repertoire: Aabling-Thomsen & Jensen 2020 build Black’s whole system on 3.exd5 Bd6; Rogers 1994 likewise. Wikipedia (de Firmian): after 4.d4 e4 5.Ne5 Nf6 6.Nc3 O-O 7.Bc4 "White enjoys a distinct superiority but no immediate attack"; Khalifman recommends 4.d4 for White. Provenance by segment: 3...Bd6 4.d4 e4 5.Ne5 Nf6 from the book/Wikipedia; 6.Bb5+ Nbd7 7.Bg5 O-O 8.Bxd7 Bxd7 9.Bxf6 gxf6 10.Nxd7 Qxd7 from PeterGriffen’s study (community). Our main repertoire plays 3...e4 (owner’s choice); this is the SURPRISE alternative.
  - plan (interpreted — elephantQC, studyGriffen): The book’s idea: "quick and active development with most pieces pointing toward the enemy kingside" and a future ...e4-e3 advance (publisher’s description). Here the queen recaptures on d7, the f-pawns are doubled but the e4 pawn is strong: ...Kh8/...Rg8 and ...f5, ...Qg4 ideas on the g-file.
- **sur-maroczy-greek** — 3.exd5 Bd6!? 4.Nc3 Nf6 5.Bc4 e4 6.Nd4 O-O 7.O-O? Bxh2+ (Smirnov)
  - moves: `3.exd5 3...Bd6 4.Nc3 4...Nf6 5.Bc4 5...e4 6.Nd4 6...O-O 7.O-O 7...Bxh2+ 8.Kxh2 8...Ng4+ 9.Kg1 9...Qh4`
  - provenance: Smirnov: "put your bishop into an ambush" — after ...e4 the knight retreats to d4 (or g5), and if White castles, the Greek gift Bxh2+ Kxh2 Ng4+ Kg1 Qh4 wins (…Qxf2 follows; if Re1 then Qxf2 too). Vs 6.Ng5 castle; 7.Ngxe4? Re8 pins and wins the knight; if White castles anyway, Bxh2+ Kxh2 Ng4+ Kg3 Qg5/… again. Belongs to the 3...Bd6 SURPRISE system, not the main 3...e4 repertoire.
  - plan (quoted — rcaElephant): Smirnov: after ...Qh4 the threats are ...Qxf2+ and ...Qh2#; White must give material. Cash in — take on f2, keep the knight on g4 protected, and trade into a won ending once you are a piece up.

## Totals

- lines: 63 (main 47, side 6, trap 5, surprise 5); weight A 16, B 47, C 0
- sourced plies: 1260; engine plies: **0**; lines whose shipped moves differ from the library: **0**

## Not drilled, and why

Library lines of weight A/B that are NOT selected, with the reason (conflicting alternative, too short to drill without engine padding, unsound, or a different repertoire choice):

- **scotch/modern-attack** (main, A) — Modern Attack (Advance Variation), main line
- **scotch/modern-attack-be7** (main, B) — Modern Attack, 9...Be7
- **scotch/modern-attack-nd7** (main, B) — Modern Attack, 6...Nd7
- **scotch/ng4** (main, A) — 5...Ng4
- **scotch/ne4** (main, A) — 5...Ne4
- **scotch/haxo-giuoco-bd2** (main, A) — Haxo Gambit → Giuoco Piano, 7.Bd2 (classical main line)
- **scotch/haxo-giuoco-na5** (main, A) — Giuoco Piano, 10...Na5
- **scotch/haxo-giuoco-nxe4** (main, B) — Greco Gambit accepted, 7...Nxe4
- **scotch/moller** (alt, A) — Møller Attack, 7.Nc3 (historical alternative for White)
- **scotch/von-der-lasa** (alt, A) — von der Lasa Variation (5.O-O d6)
- **scotch/traditional-5oo** (alt, A) — 5.O-O Nxe4 — Anderssen Attack (White alternative)
- **scotch/strong-london-ne5** (alt, B) — London Defence 7...Nge7 8.Ng5 Ne5 9.Nxf7 Nxf7 10.Bxf7+ Kxf7 11.Qh5+ Ng6 12.Qxa5 (strong players — NOT a trap)
- **scotch/hungarian** (main, B) — Hungarian / Benima Defence, 4...Be7
- **scotch/paris-d6** (main, B) — Paris Defence, 4...d6
- **scotch/anti-fried-liver-h6** (main, B) — 4...h6 (Anti-Fried-Liver)
- **scotch/philidor-d6** (main, A) — 3...d6 (Philidor structure), 4.d5
- **scotch/hun-d6-bf6** (alt, B) — Hungarian 4...Be7 5.Nxd4 d6 6.O-O Nxd4 7.Qxd4 Bf6 8.Qd3 Ne7 9.Nc3 O-O 10.Be3 (strong players — not drilled)
- **scotch/lolli** (main, A) — Lolli Variation, 3...Nxd4 4.Nxd4 exd4 5.Qxd4 (ECO line)
- **scotch/danger-zone** (side, A) — Third-move oddities: 3...f6, 3...f5, 3...Bd6, 3...Qe7, 3...Qf6, 3...d5
- **scotch/haxo-trap-ke8** (trap, B) — Haxo Gambit accepted: 6.Bxf7+! … 7...Ke8
- **scotch/haxo-trap-kf8** (trap, B) — Haxo Gambit accepted: 6.Bxf7+! … 7...Kf8
- **scotch/v-rca-london** (main, B) — London 4...Bb4+ 5.c3 dxc3 6.bxc3 Ba5 7.O-O d6 8.Qb3 Qd7 9.Rd1 (Smirnov)
- **scotch/v-rca-h6** (side, B) — 4...h6 5.c3 dxc3 6.Nxc3 (Smirnov, Danish-style)
- **scotch/v-rca-haxo-nf6** (alt, B) — Haxo 5.c3 Nf6 6.e5 d5 7.Bb5 Ne4 8.cxd4 Bb6 9.Nc3 O-O 10.Be3 Bg4 11.Bxc6 (Smirnov — alternative to the masters’ 11.h3)
- **scotch/v-rca-ng4-trap** (trap, B) — 5...Ng4 6.O-O — and the 6.Bxf7+ blitz trap (Smirnov)
- **scotch/v-rca-qe7** (side, B) — 5...Qe7 6.O-O (Smirnov)
- **scotch/v-rca-ne4-bc5** (trap, B) — 5...Ne4 6.O-O Bc5? 7.Qe2 (knight trapped) (Smirnov)
- **scotch/v-cv-bc5-e5** (alt, B) — 4...Nf6 5.O-O Bc5 6.e5 (Chess Vibes)
- **scotch/ian-ng4-kf8** (alt, B) — 5...Ng4 6.O-O d6 7.exd6 Bxd6 8.Re1+ Kf8 9.Na3 Qf6 10.Bg5 Bxh2+ 11.Nxh2 Qxg5 12.Nf3 (Amaudov–Radulski 2008)
- **scotch/ian-h6-trap** (trap, B) — 4...h6 5.O-O Bc5 6.c3 dxc3 7.Bxf7+ Kxf7 8.Qd5+ Kf8 9.Qxc5+ d6 10.Qxc3 Qf6 11.Qb3 (Barbosa–Jaudy)
- **scotch/ian-h6-nxd4** (alt, B) — 4...h6 5.Nxd4 Ne5 6.Bb3 Nf6 7.f4 Nc6 8.e5 (Yap–Pg 2011)
- **scotch/ian-be7-c3** (alt, B) — Hungarian 4...Be7 5.c3 Na5 6.Bd3 dxc3 7.Nxc3 d6 8.O-O Nf6 9.e5 dxe5 10.Nxe5 O-O 11.Qf3
- **scotch/perreux-trap** (trap, A) — Perreux 5.Ng5 vs 4...Bc5: 5...Nh6 6.Nxf7 Nxf7 7.Bxf7+ Kxf7 8.Qh5+ g6 9.Qxc5
- **elephant/paulsen** (main, A) — Paulsen Countergambit: 3.exd5 e4 4.Qe2 Nf6 5.d3 Qxd5 6.Nbd2
- **elephant/paulsen-nc3-6** (main, B) — Paulsen, 6.Nc3 Bb4!
- **elephant/paulsen-be7-5** (alt, A) — Paulsen, 5.d3 Be7 (declining to take d5)
- **elephant/tal-f5** (alt, A) — Paulsen, 4...f5 (Tal–Lutikov 1964)
- **elephant/cozio-qxd5** (alt, A) — Cozio: 3.exd5 Qxd5
- **elephant/nxe5-bd6** (main, A) — 3.Nxe5 Bd6 4.d4 dxe4 (book main)
- **elephant/nxe5-bd6-bc4** (main, A) — 3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.Qh5
- **elephant/nxe5-dxe4** (alt, A) — 3.Nxe5 dxe4 (Lob–Eliskases line)
- **elephant/bb5-check** (side, B) — 3.exd5 Bd6 4.Bb5+ c6 / 3.exd5 e4 4.Bb5+ c6
- **elephant/v-rca-be7-trap** (trap, B) — 4.Qe2 Be7?! 5.Qxe4 Nf6 — the "68% queen trap" (Smirnov)
- **elephant/v-rca-nxe5-puzzle** (trap, B) — 3.Nxe5 Bd6 4.d4 dxe4 5.Nc3 Nf6 6.Bg5 O-O 7.Nxe4? Bxe5 8.dxe5 Qxd1+ 9.Rxd1 Nxe4 (Smirnov puzzle)
- **elephant/wasp** (trap, B) — Wasp Variation: 3.Nxe5 dxe4 4.Bc4 Qg5

## Source keys

- **fishbein** (book) — Alex Fishbein, "The Scotch Gambit: An Energetic and Aggressive System for White", Russell Enterprises 2017 (sample chapters read 2026-09-22) — https://www.newinchess.com/media/wysiwyg/product_pdf/3721.pdf
- **bezgodov** (book) — Alexei Bezgodov & Vladimir Barsky, "The Scotch Game: A Repertoire for White", Russell Enterprises 2023 (table of contents + ch.2 sample read 2026-09-22) — https://www.newinchess.com/media/wysiwyg/product_pdf/3772.pdf
- **elephantQC** (book) — IM Jakob Aabling-Thomsen & Michael Agermose Jensen, "The Exhilarating Elephant Gambit", Quality Chess 2020 — repertoire based on 3.exd5 Bd6 and 3.Nxe5 Bd6 4.d4 dxe4; free excerpt (3.Nxe5 chapter, games incl. Swan–Greet 2017) read 2026-09-23 — https://www.newinchess.com/media/wysiwyg/product_pdf/ExhilaratingElephantGambit-excerpt.pdf
- **ianGambits** (article) — ianchessgambits.com, Scotch Gambit pages — annotated master games (Zelcic–Krstic 2012, Nogueiras–Mikhalchishin 1977, Amaudov–Radulski 2008, Barbosa–Jaudy, Rohonyan–Zatonskih, Yap–Pg 2011); author untitled, moves are the masters’ (read 2026-09-23) — https://www.ianchessgambits.com/scotch-gambit-4nf6-5e5.html
- **kenilworthian** (article) — Michael Goeller (Kenilworthian), "Two Knights Modern 5.e5 Ng4" 2009 and "Two Knights Modern" 2005 — annotated PGN, untitled author — http://kenilworthian.blogspot.com/2009/09/two-knights-modern-5e5-ng4.html
- **harding** (article) — Tim Harding (correspondence SIM), "The Kibitzer: We’re Going On An Elephant Hunt", ChessCafe 1997 — cites Karker’s analysis of 3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 — https://web.archive.org/web/20131005204316id_/http://www.chesscafe.com/text/kibitz15.txt
- **wikibooks** (wiki) — Wikibooks "Chess Opening Theory" — Two Knights 5.e5 tables (5...Ng4 6.Qe2 Qe7 7.Bf4 f6 =; 5...Ne4 6.O-O d5 =) — https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._d4/3...exd4/4._Bc4/4...Nf6/5._e5
- **studyBlox** (study) — Lichess study "Elephant Gambit" by BloxBlitz (4.Nd4, 4.Ng1, 4.Ne5, 6.Nbd2, 3.d3, 3.Nc3 lines) — https://lichess.org/study/HJGpsk8P
- **studyRoper** (study) — Lichess study by Roper300 (White-side Elephant: 6.Nbd2 Nc6 7.dxe4 Qe6 8.c3; 4.Ne5 Qxd5 5.d4 exd3 "the only move") — https://lichess.org/study/EtgdIpLU
- **rogers** (book) — Jonathan Rogers, "Winning with the Elephant Gambit", Tournament Chess 1994 (cited via Kenilworthian bibliography; text not read) — http://kenilworthian.blogspot.com/2012/12/elephant-gambit-c40-bibliography_12.html
- **jensenPurser** (book) — Jensen, Purser & Pape, "The Elephant Gambit 2", Blackmar Press 1997 (cited; text not read) — http://kenilworthian.blogspot.com/2012/12/elephant-gambit-c40-bibliography_12.html
- **khalifman** (book) — Khalifman, "Opening for White According to Anand, vol. 1", Chess Stars 2003, pp. 15-18 — White vs 3.exd5 Bd6 (cited; text not read) — http://kenilworthian.blogspot.com/2012/12/elephant-gambit-c40-bibliography_12.html
- **mco** (book) — de Firmian, "Modern Chess Openings" 14th ed. 1999 — Elephant assessments, quoted via Wikipedia — https://en.wikipedia.org/wiki/Elephant_Gambit
- **kaufman** (book) — Larry Kaufman on the Møller Attack (quoted via Wikipedia "Giuoco Piano") — https://en.wikipedia.org/wiki/Giuoco_Piano
- **wikiScotch** (wiki) — Wikipedia "Scotch Game" (cites Wells 1998, Lane 1993, Dembo & Palliser 2011) — https://en.wikipedia.org/wiki/Scotch_Game
- **wikiTwoKnights** (wiki) — Wikipedia "Two Knights Defense" — Open Variation 4.d4 exd4 (cites Bologan 2014) — https://en.wikipedia.org/wiki/Two_Knights_Defense
- **wikiGiuoco** (wiki) — Wikipedia "Giuoco Piano" — 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ lines — https://en.wikipedia.org/wiki/Giuoco_Piano
- **wikiMaxLange** (wiki) — Wikipedia "Max Lange Attack" (cites Hooper & Whyld) — https://en.wikipedia.org/wiki/Max_Lange_Attack
- **wikiElephant** (wiki) — Wikipedia "Elephant Gambit" (cites de Firmian MCO-14, Burgess, Hooper & Whyld) — https://en.wikipedia.org/wiki/Elephant_Gambit
- **ironstone** (course) — IronStone, "The Complete Scotch Gambit", Chessable (community author; 550k words). Chapter names read 2026-09-22 — https://www.chessable.com/the-complete-scotch-gambit/course/80250/
- **ramoutar** (course) — IM Alan-Safar Ramoutar, "The Fast and Furious Scotch Gambit", Chessable 2025 (title only) — https://www.chessable.com/the-fast-and-furious-scotch-gambit/course/315402/
- **chessmood** (article) — GM Avetik Grigoryan (ChessMood), "Refute the Elephant Gambit" article + Daily Lesson #75 video — https://chessmood.com/blog/elephant-gambit-the-refutation
- **chessdoctrine** (article) — chessdoctrine.com, "Scotch Gambit: All Variations, Traps & Winning Plans" — https://chessdoctrine.com/chess-openings/kings-pawn/scotch-gambit/
- **chessableBlog** (article) — Chessable blog, "The Ultimate Elephant Gambit Opening Guide" — https://www.chessable.com/blog/elephant-gambit/
- **astanehAdvance** (video) — IM Alex Astaneh (Chessfactor), "The Advance Variation | Dynamic Play in the Scotch Gambit" — covers 5...Ng4, 5...d5, 7...Bd7, 7...Bc5 — https://www.youtube.com/watch?v=n1389qMsE0c
- **astanehMaxLange** (video) — IM Alex Astaneh (Chessfactor), "The Max Lange Attack in the Scotch Gambit" — 8.fxg7, 8.Re1+, 9.fxg7, 9.Ng5 — https://www.youtube.com/watch?v=9wmo_IkGrZQ
- **astanehPerreux** (video) — IM Alex Astaneh (Chessfactor), "The Scotch Gambit | Introduction & Perreux Variation" — https://www.youtube.com/watch?v=b_osez_3JF4
- **astanehDouble** (video) — IM Alex Astaneh (Chessfactor), "The Double Gambit Accepted | Scotch Gambit" — https://www.youtube.com/watch?v=Sb35_qa3yAM
- **hangingPawns** (video) — Stjepan Tomic (Hanging Pawns), "The Scotch Gambit" — 4...Nf6 and 4...Bc5; mentions GM Lev Alburt recommending the gambit — https://www.youtube.com/watch?v=RIyuyX_I3z4
- **canty** (video) — James Canty III, "How To Play The Scotch Gambit - Quickstarter Jedi Guide" — https://www.youtube.com/watch?v=00hM8NR2B_g
- **ostrovskiy** (video) — IM Andrey Ostrovskiy (Chessfactor), "The Elephant Gambit | Queen’s Pawn Countergambit" — model line 3.exd5 e4 4.Qe2 Nf6 5.Nc3 Be7 6.Nxe4 O-O 7.d3 Nxd5 … — https://www.youtube.com/watch?v=VQBSotLDRnA
- **grigoryanVideo** (video) — GM Avetik Grigoryan (ChessMood), "Elephant Gambit | The Refutation" — recommends 3.Nxe5 for White — https://www.youtube.com/watch?v=kn8mcck3l8c
- **rcaScotch** (video) — GM Igor Smirnov (Remote Chess Academy), "Learn the Scotch Gambit in 20 Minutes [Complete Opening Guide]", Jan 2026, 248k views. Lines reconstructed from the transcript (no PGN published) and legality-checked. — https://www.youtube.com/watch?v=QEYybZ8FYGE
- **rcaElephant** (video) — GM Igor Smirnov (Remote Chess Academy), "Learn The Elephant Gambit | The Highest Win Rate Opening", Dec 2024, 400k views. Lines reconstructed from the transcript. — https://www.youtube.com/watch?v=l3OvypYIL1A
- **chessVibes** (video) — Chess Vibes (Nelson Lopez), "This Opening Should Be BANNED (Scotch Gambit Basics)", Oct 2025, 276k views. Exact PGN with variations published in the description; all 11 lines verified legal. — https://www.youtube.com/watch?v=LlD8peEUHCc
- **akeem** (video) — ChesswithAkeem, "Learn the Elephant Gambit in 30 mins", May 2026 — Chessreps-based drill + three games; lines reconstructed from speech (approximate). — https://www.youtube.com/watch?v=2ulb4nN6nkI
- **tushi** (video) — sadisticTushi, "My Favourite Aggressive Opening For Black Against 1.e4", Feb 2026 — three Elephant games (vs 3.exd5, 4.Qe2, 3.Nc3) narrated in slang; ideas only, no exact moves recoverable. — https://www.youtube.com/watch?v=SD59899u-_c
- **studyEXO** (study) — Lichess study "The Scotch Gambit" by EXOprimal (11 chapters) — https://lichess.org/study/UMNISCeS
- **studySoNy** (study) — Lichess study "Scotch Gambit Full Repertoire" by SoNy-ChAnNeL (traps) — https://lichess.org/study/NLxu65J8
- **studyOctopus** (study) — Lichess study "Scotch Gambit Study" by CuriousOctopus — https://lichess.org/study/DvCUoqJ2
- **studyBunny** (study) — Lichess study "CRUSH with the Elephant Gambit!" by BunnyMommyIsHappy (27 chapters, ...Bd6 repertoire) — https://lichess.org/study/Biovb2ms
- **studyGriffen** (study) — Lichess study "The Elephant Gambit" by PeterGriffen (Rogers line, Wasp) — https://lichess.org/study/xgIDpAoC
- **studyFuxia** (study) — Lichess study "Elephant Gambit" by fuxia (Paulsen 6...Nc6; Cochrane–Staunton) — https://lichess.org/study/2NEP3eiQ
- **masters** (database) — Lichess masters database (OTB games of 2200+ players), queried 2026-09-15/22; tree via tools/masters-tree.mjs (our node: most-played master move; game counts quoted per line) — https://lichess.org/analysis#explorer
- **amateur** (database) — Lichess database, blitz+rapid 1400-1800 (club players — the owner’s opponents), queried 2026-09-17/23; cached in library/explorer-cache.json — https://lichess.org/analysis#explorer
- **strong** (database) — Lichess database, blitz+rapid 2200-2500 (strong online players), queried 2026-09-23; used for OUR move where books and masters stop, counts quoted per line — https://lichess.org/analysis#explorer
- **games** (database) — stas1928's Chess.com games, last 6 months (427 games), scanned 2026-09-16 — https://www.chess.com/member/stas1928
- **sf** (engine) — Stockfish 18 (lite), depth 18-22, run locally
