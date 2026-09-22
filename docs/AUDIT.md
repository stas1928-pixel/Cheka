# Repertoire audit — 2026-09-22

For each shipped line: how many of its moves come from the hand-written seed (theory, with sources) and how many were appended by Stockfish. "Theory" here means the seed author typed the move citing a source — it says nothing about the source's quality; see the source list at the end.

## Scotch Gambit (White)

| line | tag | theory moves (seed) | engine moves | theory ends at | sources | verdict |
|---|---|---|---|---|---|---|
| main | main | 21 | 0 | 11.Be3 | W-Scotch, CD, Lichess | theory throughout |
| max-lange-be7 | main | 18 | 2 | 9...Be7 | Lichess, SF | **engine line** — only the deviation 9...Be7 and 0 reply are human |
| max-lange-bxc6 | main | 16 | 2 | 8...Bxc6 | Lichess, SF | **engine line** — only the deviation 8...Bxc6 and 0 reply are human |
| max-lange-bc5 | main | 19 | 1 | 10.O-O | Lichess, SF | theory to 10.O-O, engine after |
| max-lange-nd7 | main | 12 | 4 | 6...Nd7 | Lichess, SF | **engine line** — only the deviation 6...Nd7 and 0 reply are human |
| ng4 | main | 11 | 5 | 6.O-O | W-Scotch, Lichess, SF | **engine line** — only the deviation 5...Ng4 and 1 reply are human |
| ne4 | main | 12 | 4 | 6...d5 | Lichess, Games, SF | theory to 6...d5, engine after |
| ne4-nc5 | main | 13 | 3 | 7.O-O | Lichess, SF | theory to 7.O-O, engine after |
| qe7 | side (trap/punish) | 11 | 4 | 6.O-O | Lichess, SF | **engine line** — only the deviation 5...Qe7 and 1 reply are human |
| haxo | main | 24 | 0 | 12...c6 | W-Scotch, CD, Lichess | theory throughout |
| haxo-oo | main | 17 | 1 | 9.d5 | Lichess, SF | theory to 9.d5, engine after |
| haxo-na5 | main | 22 | 0 | 11...Nc6 | W-Scotch, Lichess, SF | theory throughout |
| haxo-nxe4 | main | 21 | 0 | 11.Qxb4 | W-Scotch, Lichess, SF | theory throughout |
| haxo-bb6 | main | 13 | 3 | 7.e5 | W-Scotch, SF | theory to 7.e5, engine after |
| haxo-trap | side (trap/punish) | 15 | 2 | 8.Qh5+ | W-Scotch, CD, Lichess, SF | theory to 8.Qh5+, engine after |
| haxo-trap-kf8 | side (trap/punish) | 17 | 0 | 9.Qxc3 | W-Scotch, CD, SF | theory throughout |
| london | main | 14 | 2 | 7...Nge7 | W-Scotch, CD, Lichess, SF | theory to 7...Nge7, engine after |
| london-nf6 | main | 14 | 2 | 7...Nf6 | Lichess, SF | theory to 7...Nf6, engine after |
| london-be7 | side (trap/punish) | 13 | 2 | 7.Qd5 | CD, Lichess, SF | theory to 7.Qd5, engine after |
| london-trap | side (trap/punish) | 17 | 0 | 9.Qxc5 | CD, Lichess, SF | theory throughout |
| london-trap-kf8 | side (trap/punish) | 19 | 0 | 10.Qc4 | CD | theory throughout |
| hungarian | main | 20 | 0 | 10...fxe6 | W-Scotch, CD | theory throughout |
| hungarian-nxd4 | main | 11 | 5 | 6.Qxd4 | Lichess, SF | theory to 6.Qxd4, engine after |
| declined-d6 | main | 20 | 0 | 10...fxe6 | CD | theory throughout |
| declined-d6-nxd4 | main | 11 | 5 | 6.Qxd4 | Lichess, SF | theory to 6.Qxd4, engine after |
| declined-d6-ne5 | main | 16 | 2 | 8...Ne5 | Lichess, SF | theory to 8...Ne5, engine after |
| h6 | main | 13 | 2 | 7.e5 | Games, Lichess, SF | theory to 7.e5, engine after |
| h6-nxd4 | main | 11 | 4 | 6.Qxd4 | Lichess, SF | theory to 6.Qxd4, engine after |
| qf6-4 | side (trap/punish) | 10 | 5 | 5...Bc5 | Games, Lichess, SF | theory to 5...Bc5, engine after |
| scotch-d6 | main | 10 | 6 | 5...Nf6 | W-Scotch, Games, Lichess, SF | theory to 5...Nf6, engine after |
| scotch-d6-nb8 | main | 9 | 5 | 5.c4 | Lichess, SF | theory to 5.c4, engine after |
| scotch-d6-nd4 | side (trap/punish) | 11 | 3 | 6.Qxd4 | Lichess, SF | theory to 6.Qxd4, engine after |
| lolli | side (trap/punish) | 10 | 5 | 5...d6 | W-Scotch, Lichess, SF | theory to 5...d6, engine after |
| f5 | side (trap/punish) | 10 | 5 | 5...fxe4 | Games, SF | theory to 5...fxe4, engine after |
| bd6 | side (trap/punish) | 9 | 6 | 5.c4 | W-Scotch, Games, SF | theory to 5.c4, engine after |
| qf6-3 | side (trap/punish) | 7 | 8 | 4.d5 | Games, SF | **engine line** — only the deviation 3...Qf6 and 1 reply are human |
| bb4-3 | side (trap/punish) | 9 | 6 | 5.Bd3 | Games, Lichess, SF | theory to 5.Bd3, engine after |

### Move-by-move

- **main** — Max Lange Attack
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Bc5 10.f3 10...Ng5 11.Be3`
- **max-lange-be7** — Max Lange, 9...Be7
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Be7`
  - engine: `10.f3 10...Nc5`
- **max-lange-bxc6** — Max Lange, 8...Bxc6
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...Bxc6`
  - engine: `9.O-O 9...Bc5`
- **max-lange-bc5** — Max Lange, 7...Bc5
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5 8.Be3 8...O-O 9.Bxc6 9...bxc6 10.O-O`
  - engine: `10...Qe8`
- **max-lange-nd7** — Max Lange, 6...Nd7
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Nd7`
  - engine: `7.O-O 7...Be7 8.Bxc6 8...bxc6`
- **ng4** — 5...Ng4
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ng4 6.O-O`
  - engine: `6...d6 7.exd6 7...Bxd6 8.Re1+ 8...Be7`
- **ne4** — 5...Ne4 6.Qe2 d5
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ne4 6.Qe2 6...d5`
  - engine: `7.exd6 7...f5 8.dxc7 8...Qxc7`
- **ne4-nc5** — 5...Ne4 6.Qe2 Nc5
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Ne4 6.Qe2 6...Nc5 7.O-O`
  - engine: `7...Ne6 8.Bxe6 8...dxe6`
- **qe7** — 5...Qe7 (pin on the e-file)
  - theory: `3...exd4 4.Bc4 4...Nf6 5.e5 5...Qe7 6.O-O`
  - engine: `6...Ng4 7.Bf4 7...d6 8.exd6`
- **haxo** — Haxo Gambit → Giuoco Piano, 7.Bd2
  - theory: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb4+ 7.Bd2 7...Bxd2+ 8.Nbxd2 8...d5 9.exd5 9...Nxd5 10.Qb3 10...Nce7 11.O-O 11...O-O 12.Rfe1 12...c6`
- **haxo-oo** — Giuoco Piano, 8...O-O
  - theory: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb4+ 7.Bd2 7...Bxd2+ 8.Nbxd2 8...O-O 9.d5`
  - engine: `9...Ne7`
- **haxo-na5** — Giuoco Piano, 10...Na5
  - theory: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb4+ 7.Bd2 7...Bxd2+ 8.Nbxd2 8...d5 9.exd5 9...Nxd5 10.Qb3 10...Na5 11.Qa4+ 11...Nc6`
- **haxo-nxe4** — Greco Gambit accepted, 7...Nxe4
  - theory: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb4+ 7.Bd2 7...Nxe4 8.Bxb4 8...Nxb4 9.Bxf7+ 9...Kxf7 10.Qb3+ 10...d5 11.Qxb4`
- **haxo-bb6** — Haxo Gambit, 6...Bb6
  - theory: `3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb6 7.e5`
  - engine: `7...Ne4 8.Qe2 8...d5`
- **haxo-trap** — Haxo accepted, 6.Bxf7+! Ke8
  - theory: `3...exd4 4.Bc4 4...Bc5 5.c3 5...dxc3 6.Bxf7+ 6...Kxf7 7.Qd5+ 7...Ke8 8.Qh5+`
  - engine: `8...Kf8 9.Qxc5+`
- **haxo-trap-kf8** — Haxo accepted, 6.Bxf7+! Kf8
  - theory: `3...exd4 4.Bc4 4...Bc5 5.c3 5...dxc3 6.Bxf7+ 6...Kxf7 7.Qd5+ 7...Kf8 8.Qxc5+ 8...d6 9.Qxc3`
- **london** — London Defence (4...Bb4+)
  - theory: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Ba5 7.O-O 7...Nge7`
  - engine: `8.Ng5 8...Ne5`
- **london-nf6** — London Defence, 7...Nf6
  - theory: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Ba5 7.O-O 7...Nf6`
  - engine: `8.e5 8...d5`
- **london-be7** — London Defence, 6...Be7?
  - theory: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Be7 7.Qd5`
  - engine: `7...Nh6 8.Bxh6`
- **london-trap** — London Defence trap, 6...Bc5? (Ke8)
  - theory: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Bc5 7.Bxf7+ 7...Kxf7 8.Qd5+ 8...Ke8 9.Qxc5`
- **london-trap-kf8** — London Defence trap, 6...Bc5? (Kf8)
  - theory: `3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Bc5 7.Bxf7+ 7...Kxf7 8.Qd5+ 8...Kf8 9.Qxc5+ 9...d6 10.Qc4`
- **hungarian** — Hungarian Defence (4...Be7)
  - theory: `3...exd4 4.Bc4 4...Be7 5.Nxd4 5...d6 6.O-O 6...Nf6 7.Nc3 7...O-O 8.h3 8...Nxd4 9.Qxd4 9...Be6 10.Bxe6 10...fxe6`
- **hungarian-nxd4** — Hungarian Defence, 5...Nxd4
  - theory: `3...exd4 4.Bc4 4...Be7 5.Nxd4 5...Nxd4 6.Qxd4`
  - engine: `6...Nf6 7.Nc3 7...c6 8.Bf4 8...b5`
- **declined-d6** — 4...d6 (gambit declined)
  - theory: `3...exd4 4.Bc4 4...d6 5.Nxd4 5...Nf6 6.Nc3 6...Be7 7.O-O 7...O-O 8.h3 8...Nxd4 9.Qxd4 9...Be6 10.Bxe6 10...fxe6`
- **declined-d6-nxd4** — 4...d6 5.Nxd4 Nxd4
  - theory: `3...exd4 4.Bc4 4...d6 5.Nxd4 5...Nxd4 6.Qxd4`
  - engine: `6...Nf6 7.Bf4 7...Be7 8.Nc3 8...O-O`
- **declined-d6-ne5** — 4...d6, 8...Ne5
  - theory: `3...exd4 4.Bc4 4...d6 5.Nxd4 5...Nf6 6.Nc3 6...Be7 7.O-O 7...O-O 8.h3 8...Ne5`
  - engine: `9.Bb3 9...c5`
- **h6** — 4...h6 (passive)
  - theory: `3...exd4 4.Bc4 4...h6 5.Nxd4 5...Nf6 6.Nxc6 6...bxc6 7.e5`
  - engine: `7...d5 8.exf6`
- **h6-nxd4** — 4...h6 5.Nxd4 Nxd4
  - theory: `3...exd4 4.Bc4 4...h6 5.Nxd4 5...Nxd4 6.Qxd4`
  - engine: `6...Ne7 7.Nc3 7...Nc6 8.Qd5`
- **qf6-4** — 4...Qf6?!
  - theory: `3...exd4 4.Bc4 4...Qf6 5.O-O 5...Bc5`
  - engine: `6.e5 6...Qg6 7.Re1 7...Nh6 8.Bd3`
- **scotch-d6** — 3...d6 (Scotch declined)
  - theory: `3...d6 4.d5 4...Nce7 5.c4 5...Nf6`
  - engine: `6.Nc3 6...g6 7.c5 7...Bg7 8.cxd6 8...cxd6`
- **scotch-d6-nb8** — 3...d6 4.d5 Nb8
  - theory: `3...d6 4.d5 4...Nb8 5.c4`
  - engine: `5...Nd7 6.Nc3 6...g6 7.g4 7...a5`
- **scotch-d6-nd4** — 3...d6 4.d5 Nd4?!
  - theory: `3...d6 4.d5 4...Nd4 5.Nxd4 5...exd4 6.Qxd4`
  - engine: `6...Nf6 7.Bb5+ 7...Bd7`
- **lolli** — Lolli Variation, 3...Nxd4
  - theory: `3...Nxd4 4.Nxd4 4...exd4 5.Qxd4 5...d6`
  - engine: `6.Nc3 6...Nf6 7.Bf4 7...Be7 8.O-O-O`
- **f5** — 3...f5?!
  - theory: `3...f5 4.Nxe5 4...Nxe5 5.dxe5 5...fxe4`
  - engine: `6.Nc3 6...Bb4 7.Qd4 7...Bxc3+ 8.bxc3`
- **bd6** — 3...Bd6?!
  - theory: `3...Bd6 4.d5 4...Nce7 5.c4`
  - engine: `5...Bb4+ 6.Nbd2 6...Nf6 7.Qc2 7...Bxd2+ 8.Bxd2`
- **qf6-3** — 3...Qf6?!
  - theory: `3...Qf6 4.d5`
  - engine: `4...Nb8 5.Be3 5...d6 6.h3 6...a6 7.a4 7...g6 8.g4`
- **bb4-3** — 3...Bb4+?!
  - theory: `3...Bb4+ 4.c3 4...Bd6 5.Bd3`
  - engine: `5...Nf6 6.O-O 6...O-O 7.Re1 7...Ne8 8.Qc2`

## Elephant Gambit (Black)

| line | tag | theory moves (seed) | engine moves | theory ends at | sources | verdict |
|---|---|---|---|---|---|---|
| main | main | 15 | 3 | 8.Nb3 | W-Eleph, CM, Lichess, SF | theory to 8.Nb3, engine after |
| nc3-5 | main | 13 | 5 | 7.d3 | W-Eleph, CM, Lichess, SF | theory to 7.d3, engine after |
| nc3-5-nxf6 | main | 14 | 4 | 7...Bxf6 | CM, Lichess, SF | theory to 7...Bxf6, engine after |
| nc3-6 | main | 17 | 0 | 9.Bxf6 | CM, Games, Lichess, SF | theory throughout |
| dxe4-6 | main | 17 | 1 | 9.Bc4 | Games, Lichess, SF | theory to 9.Bc4, engine after |
| ng5 | main | 12 | 4 | 6...O-O | Games, Lichess, SF | theory to 6...O-O, engine after |
| nd4 | main | 9 | 7 | 5.Nb3 | Games, Lichess, SF | theory to 5.Nb3, engine after |
| nd4-c3 | main | 12 | 4 | 6...Qxc6 | Lichess, SF | theory to 6...Qxc6, engine after |
| ne5 | main | 14 | 2 | 7...Qa5 | W-Eleph, Games, SF | theory to 7...Qa5, engine after |
| ng1 | main | 9 | 5 | 5.Nc3 | Games, Lichess, SF | theory to 5.Nc3, engine after |
| bb5 | side (trap/punish) | 11 | 3 | 6.Qe2 | Games, Lichess, SF | theory to 6.Qe2, engine after |
| nxe5 | main | 9 | 7 | 5.Bc4 | W-Eleph, CM, Lichess, Games, SF | theory to 5.Bc4, engine after |
| nxe5-nc4 | main | 9 | 7 | 5.Nc4 | Lichess, SF | theory to 5.Nc4, engine after |
| nxe5-nc3 | main | 9 | 7 | 5.Nc3 | Lichess, SF | theory to 5.Nc3, engine after |
| nxe5-nf3 | main | 8 | 6 | 4...dxe4 | Games, SF | theory to 4...dxe4, engine after |
| nc4 | side (trap/punish) | 7 | 7 | 4.Nc4 | CB, SF | theory to 4.Nc4, engine after |
| nxf7 | side (trap/punish) | 7 | 7 | 4.Nxf7 | Games, Lichess, SF | theory to 4.Nxf7, engine after |
| d4 | main | 11 | 5 | 6.Nc3 | Games, Lichess, SF | theory to 6.Nc3, engine after |
| d3 | main | 11 | 5 | 6.Bd3 | Games, Lichess, SF | theory to 6.Bd3, engine after |
| d3-nxe5 | main | 7 | 7 | 4.Nxe5 | Lichess, SF | theory to 4.Nxe5, engine after |
| nc3-3 | main | 9 | 7 | 5.Bc4 | W-Eleph, Lichess, SF | theory to 5.Bc4, engine after |
| bd3 | side (trap/punish) | 11 | 3 | 6.Qe2 | Games, Lichess, SF | theory to 6.Qe2, engine after |

### Move-by-move

- **main** — Paulsen Countergambit
  - theory: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.Nbd2 6...Be7 7.dxe4 7...Qe6 8.Nb3`
  - engine: `8...Qxe4 9.Qxe4 9...Nxe4`
- **nc3-5** — 5.Nc3 Be7 6.Nxe4 O-O 7.d3
  - theory: `3.exd5 3...e4 4.Qe2 4...Nf6 5.Nc3 5...Be7 6.Nxe4 6...O-O 7.d3`
  - engine: `7...Re8 8.c3 8...Nxd5 9.Qc2 9...c5`
- **nc3-5-nxf6** — 5.Nc3 … 7.Nxf6+
  - theory: `3.exd5 3...e4 4.Qe2 4...Nf6 5.Nc3 5...Be7 6.Nxe4 6...O-O 7.Nxf6+ 7...Bxf6`
  - engine: `8.d4 8...Qxd5 9.Be3 9...Nc6`
- **nc3-6** — 6.Nc3 Bb4!
  - theory: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.Nc3 6...Bb4 7.Bd2 7...Bxc3 8.Bxc3 8...O-O 9.Bxf6`
- **dxe4-6** — 6.dxe4 queen trade
  - theory: `3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.dxe4 6...Qxe4 7.Qxe4+ 7...Nxe4 8.Bd3 8...Nc5 9.Bc4`
  - engine: `9...Be6`
- **ng5** — 5.Ng5
  - theory: `3.exd5 3...e4 4.Qe2 4...Nf6 5.Ng5 5...Be7 6.Nxe4 6...O-O`
  - engine: `7.Nxf6+ 7...Bxf6 8.Qf3 8...Re8+`
- **nd4** — 4.Nd4 Qxd5 5.Nb3
  - theory: `3.exd5 3...e4 4.Nd4 4...Qxd5 5.Nb3`
  - engine: `5...Qe5 6.Nc3 6...Nf6 7.Bb5+ 7...Bd7 8.Be2 8...Nc6`
- **nd4-c3** — 4.Nd4 Qxd5 5.c3 Nc6 6.Nxc6
  - theory: `3.exd5 3...e4 4.Nd4 4...Qxd5 5.c3 5...Nc6 6.Nxc6 6...Qxc6`
  - engine: `7.d3 7...exd3 8.Qxd3 8...Bd7`
- **ne5** — 4.Ne5
  - theory: `3.exd5 3...e4 4.Ne5 4...Qxd5 5.d4 5...exd3 6.Nxd3 6...Nc6 7.Nc3 7...Qa5`
  - engine: `8.Be2 8...Bf5`
- **ng1** — 4.Ng1 full retreat
  - theory: `3.exd5 3...e4 4.Ng1 4...Qxd5 5.Nc3`
  - engine: `5...Qe6 6.Qe2 6...Nf6 7.b3 7...Nc6`
- **bb5** — 4.Bb5+ c6
  - theory: `3.exd5 3...e4 4.Bb5+ 4...c6 5.dxc6 5...bxc6 6.Qe2`
  - engine: `6...cxb5 7.d3 7...Nf6`
- **nxe5** — 3.Nxe5 Bd6 4.d4 dxe4 5.Bc4
  - theory: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Bc4`
  - engine: `5...Bxe5 6.Qh5 6...Qe7 7.Qxe5 7...Qxe5 8.dxe5 8...Nc6`
- **nxe5-nc4** — 3.Nxe5 Bd6 4.d4 dxe4 5.Nc4
  - theory: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Nc4`
  - engine: `5...Be7 6.Bf4 6...Nf6 7.Ne3 7...O-O 8.Be2 8...Bd6`
- **nxe5-nc3** — 3.Nxe5 Bd6 4.d4 dxe4 5.Nc3
  - theory: `3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Nc3`
  - engine: `5...Bxe5 6.dxe5 6...Qxd1+ 7.Nxd1 7...Nc6 8.Nc3 8...Bf5`
- **nxe5-nf3** — 3.Nxe5 Bd6 4.Nf3 (retreat)
  - theory: `3.Nxe5 3...Bd6 4.Nf3 4...dxe4`
  - engine: `5.Nd4 5...Be5 6.c3 6...Bxd4 7.cxd4 7...Nc6`
- **nc4** — 3.Nxe5 Bd6 4.Nc4?!
  - theory: `3.Nxe5 3...Bd6 4.Nc4`
  - engine: `4...dxc4 5.Bxc4 5...Nf6 6.Nc3 6...O-O 7.O-O 7...Bc5`
- **nxf7** — 3.Nxe5 Bd6 4.Nxf7?! (greedy)
  - theory: `3.Nxe5 3...Bd6 4.Nxf7`
  - engine: `4...Kxf7 5.d4 5...dxe4 6.Bc4+ 6...Be6 7.Qh5+ 7...g6`
- **d4** — 3.d4 (Elephant declined)
  - theory: `3.d4 3...dxe4 4.Nxe5 4...Nd7 5.Nxd7 5...Bxd7 6.Nc3`
  - engine: `6...Bb4 7.Bc4 7...Qh4 8.Qd2 8...f5`
- **d3** — 3.d3 dxe4 4.dxe4 (quiet)
  - theory: `3.d3 3...dxe4 4.dxe4 4...Qxd1+ 5.Kxd1 5...Nf6 6.Bd3`
  - engine: `6...Nc6 7.Nbd2 7...Nd7 8.c3 8...a5`
- **d3-nxe5** — 3.d3 dxe4 4.Nxe5
  - theory: `3.d3 3...dxe4 4.Nxe5`
  - engine: `4...Nf6 5.Be3 5...Qe7 6.Nc4 6...Nc6 7.Nc3 7...Bg4`
- **nc3-3** — 3.Nc3
  - theory: `3.Nc3 3...dxe4 4.Nxe4 4...Nc6 5.Bc4`
  - engine: `5...Bf5 6.Ng3 6...Bg6 7.O-O 7...Qd7 8.Re1 8...O-O-O`
- **bd3** — 3.Bd3?! blocks the d-pawn
  - theory: `3.Bd3 3...dxe4 4.Bxe4 4...f5 5.Bd3 5...e4 6.Qe2`
  - engine: `6...Be7 7.Bb5+ 7...c6`

## Totals

- lines: 59
- seed (human) plies: 767; engine plies: 210 (21% of shipped moves)
- lines where the human part after the deviation is one reply or less: **6 of 59** — these are the ones that feel "bot-like"

## Source keys

- **W-Scotch** — Wikipedia: Scotch Game (cites Wells 1998, Lane 1993, Dembo & Palliser 2011)
- **W-MaxL** — Wikipedia: Max Lange Attack
- **W-Eleph** — Wikipedia: Elephant Gambit (de Firmian; Tal–Lutikov 1964)
- **CD** — chessdoctrine.com — Scotch Gambit variations & traps
- **CM** — chessmood.com — "Refute the Elephant Gambit"
- **CB** — chessable.com blog — Elephant Gambit guide
- **Lichess** — Lichess explorer (masters + amateur 1400-1800), frequencies only
- **Games** — stas1928's own Chess.com games (which opponent moves occur)
- **SF** — Stockfish 18 — engine-chosen move(s)
