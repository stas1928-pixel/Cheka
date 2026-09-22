# Line library — Scotch Gambit (White) and Elephant Gambit (Black)

Generated 2026-09-22 from `library/lines.mjs` by `tools/build-library.mjs`. Research only: nothing here is drilled until it is copied into `tools/repertoire.seed.mjs`.

**Weight** says how much a line can be trusted:

- A — theory (book / MCO / masters practice)
- B — known (course, titled-player video, cited Wikipedia)
- C — community (Lichess study, forum)
- E — engine only

**Masters** = number of OTB master games (Lichess masters DB) that reach the END of the quoted moves; "top" = what masters play next. A line with 0 master games at its end is club practice or a trap, whatever its source says.


## Scotch Gambit (you play White)

Root: `1.e4 1...e5 2.Nf3 2...Nc6 3.d4`


### Main lines (sound opponent choices you must know)

| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |
|---|---|---|---|---|---|---|---|
| 1 | **Modern Attack (Advance Variation), main line** | A | **3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Bc5** 10.f3 10...Ng5 11.f4 11...Ne4 12.Be3 12...O-O | 164 | Nd2 164 | Sanal, V. – Kazhgaleyev, M. (2019); Turov, Maxim – Marin, Mihail (2004, 1-0) | [fishbein](#src-fishbein), [wikiTwoKnights](#src-wikiTwoKnights), [wikiScotch](#src-wikiScotch), [astanehAdvance](#src-astanehAdvance), [studyEXO](#src-studyEXO), [masters](#src-masters) |
| 2 | **Modern Attack, 7...Bc5 (Ntirlis line)** | A | **3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5** 8.Be3 8...Bd7 9.Bxc6 9...bxc6 10.O-O 10...O-O | 82 | f3 59 | Karpatchev, Aleksandr – Vajda, Levente (2008, 0-1); Karim, Ismael – Gupta, Abhijeet (2012, 0-1) | [fishbein](#src-fishbein), [wikiTwoKnights](#src-wikiTwoKnights), [astanehAdvance](#src-astanehAdvance), [masters](#src-masters) |
| 3 | **5...Ng4** | A | **3...exd4 4.Bc4 4...Nf6 5.e5** 5...Ng4 | 274 | O-O 139 | Petrosian, TL. – Carlsen, M. (2016, 0-1); Mamedov, Rau – Inarkiev, E. (2018) | [fishbein](#src-fishbein), [wikiTwoKnights](#src-wikiTwoKnights), [astanehAdvance](#src-astanehAdvance), [studyOctopus](#src-studyOctopus) |
| 4 | **5...Ne4** | A | **3...exd4 4.Bc4 4...Nf6 5.e5** 5...Ne4 | 354 | Qe2 197 | Shevchenko, Kirill – Carlsen, M. (2023, 0-1); Shevchenko, Kirill – Giri, A. (2023) | [fishbein](#src-fishbein), [wikiTwoKnights](#src-wikiTwoKnights), [studyEXO](#src-studyEXO) |
| 5 | **Haxo Gambit → Giuoco Piano, 7.Bd2 (classical main line)** | A | **3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb4+ 7.Bd2 7...Bxd2+ 8.Nbxd2 8...d5** 9.exd5 9...Nxd5 10.Qb3 10...Nce7 | 272 | O-O 272 | Aronian, L. – Mamedyarov, S. (2021); Jones, G. – Karjakin, Sergey (2018) | [wikiGiuoco](#src-wikiGiuoco), [fishbein](#src-fishbein), [wikiScotch](#src-wikiScotch), [ironstone](#src-ironstone), [masters](#src-masters) |
| 6 | **Giuoco Piano, 10...Na5** | A | **3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb4+ 7.Bd2 7...Bxd2+ 8.Nbxd2 8...d5 9.exd5 9...Nxd5** 10.Qb3 10...Na5 11.Qa4+ 11...Nc6 | 134 | Qb3 79 | Vachier Lagrave, M. – Le Quang Liem (2013, 1-0); Jones, G. – Karjakin, Sergey (2018) | [wikiGiuoco](#src-wikiGiuoco), [masters](#src-masters), [amateur](#src-amateur) |
| 7 | **3...d6 (Philidor structure), 4.d5** | A | **3...d6 4.d5 4...Nce7 5.c4** | 47 | f5 14 | Baburin, Alexander – Miles, Anthony J (1999, 0-1); Postny, E. – Sanal, V. (2019, 0-1) | [wikiScotch](#src-wikiScotch), [bezgodov](#src-bezgodov), [ironstone](#src-ironstone), [games](#src-games) |
| 8 | **Modern Attack, 9...Be7** | B | **3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O** 9...Be7 | 219 | f3 211 | Carlsen, M. – Le, Quang Liem (2022); Nepomniachtchi, I. – Vachier Lagrave, M. (2024) | [fishbein](#src-fishbein), [masters](#src-masters), [amateur](#src-amateur) |
| 9 | **Modern Attack, 6...Nd7** | B | **3...exd4 4.Bc4 4...Nf6 5.e5 5...d5 6.Bb5** 6...Nd7 | 309 | O-O 290 | Duda, J. – Aronian, L. (2022); Mamedov, Rau – Keymer, Vincent (2025, 0-1) | [fishbein](#src-fishbein), [masters](#src-masters) |
| 10 | **Greco Gambit accepted, 7...Nxe4** | B | **3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb4+ 7.Bd2 7...Nxe4 8.Bxb4 8...Nxb4 9.Bxf7+ 9...Kxf7 10.Qb3+** 10...d5 11.Qxb4 | 23 | Rf8 19 | Petrov, Marij – Goganov, A. (2017, 0-1); Ahmadzada, Ahmad – Safarli, E. (2017, 0-1) | [masters](#src-masters), [amateur](#src-amateur) |
| 11 | **London Defence, 4...Bb4+** | B | **3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Ba5 7.O-O 7...d6 8.Qb3 8...Qe7 9.e5** | 0 |  |  | [wikiScotch](#src-wikiScotch), [chessdoctrine](#src-chessdoctrine), [ironstone](#src-ironstone), [studyEXO](#src-studyEXO), [amateur](#src-amateur) |
| 12 | **Hungarian / Benima Defence, 4...Be7** | B | **3...exd4 4.Bc4 4...Be7 5.Nxd4 5...d6** | 93 | O-O 49 | Van Foreest, Jorden – Ernst, S. (2023); Jones, Gawain C – Turner, Matthew (2011) | [wikiScotch](#src-wikiScotch), [chessdoctrine](#src-chessdoctrine), [ironstone](#src-ironstone), [amateur](#src-amateur) |
| 13 | **Paris Defence, 4...d6** | B | **3...exd4 4.Bc4 4...d6 5.Nxd4 5...Nf6** | 78 | Nc3 63 | Abdusattorov, Nodirbek – Sadhwani, Raunak (2022, 1-0); Volokitin, And – Sadhwani, Raunak (2022, 0-1) | [ironstone](#src-ironstone), [chessdoctrine](#src-chessdoctrine), [amateur](#src-amateur) |

- **Modern Attack (Advance Variation), main line** — Fishbein ch.1: "The Main Line of the Modern Attack" — 6.Bb5 "the only move", 7...Bd7, 8.Bxc6 "no other moves are worth considering", 9.O-O Bc5. Wikipedia: "has gradually become the main line of the Open Variation". EXOprimal continues 10.f3 Ng5 11.f4 Ne4 12.Be3 O-O.
- **Modern Attack, 7...Bc5 (Ntirlis line)** — Fishbein: "recommended by Ntirlis … until recently considered Black’s surest reply"; ch.3 argues Black must sacrifice a pawn to equalise. Wikipedia: "7.Nxd4 Bc5, with sharp play". Masters: 30% of games here.
- **5...Ng4** — Fishbein ch.4 "The 5...Ng4 and 5...Ne4 Variations". Wikipedia: "playable". White’s usual answers: 6.O-O (Astaneh; CuriousOctopus 6.O-O Ngxe5?! 7.Nxe5 Nxe5 8.Re1 d6 9.f4) or 6.Qe2. Which is best is not settled in the sources read.
- **5...Ne4** — Fishbein ch.4. Wikipedia: "playable". EXOprimal gives 6.Bd5; the engine prefers 6.Qe2. Not settled.
- **Haxo Gambit → Giuoco Piano, 7.Bd2 (classical main line)** — Wikipedia Giuoco: "7.Bd2 is White’s most popular move … 10.Qb3 Nce7 (or 10...Na5)". Fishbein: 5.c3 is the "modern and positional approach" (chapters 6-9 cover 4...Bc5). Wikipedia Scotch: 5...Nf6 "Black is known to have a satisfactory game".
- **Giuoco Piano, 10...Na5** — Wikipedia names 10...Na5 as the alternative to 10...Nce7. Masters 22%, amateurs 30% here.
- **3...d6 (Philidor structure), 4.d5** — Wikipedia: "playable but inferior … White typically responds with 4.d5, kicking the knight … 4...Nce7 5.c4". Bezgodov & Barsky ch.1 §(8). IronStone "3...d6 Philidor (Open)/(Closed)". EXOprimal prefers 4.dxe5 dxe5 5.Qxd8+ Kxd8. 10 of your games.
- **Modern Attack, 9...Be7** — Fishbein ch.2 "Deviations from the Main Line". Amateur 17%, masters 19% at this node.
- **Modern Attack, 6...Nd7** — Fishbein: "not entirely in the spirit of this system, 6...Nd7 is also possible" (ch.2). Masters 15%.
- **Greco Gambit accepted, 7...Nxe4** — Masters 26% at 7...Nxe4; the forcing 8.Bxb4 Nxb4 9.Bxf7+ Kxf7 10.Qb3+ d5 11.Qxb4 is the standard regain. Not found in the books read — verify before trusting.
- **London Defence, 4...Bb4+** — Wikipedia: "usually continues 5.c3 dxc3, then 6.O-O or 6.bxc3". EXOprimal: 6.bxc3 Ba5 7.O-O d6 8.Qb3 Qe7 9.e5 and the alternative 6.O-O cxb2 7.Bxb2 Nf6 8.e5 Ng4 9.h3. Chess Doctrine: 6...Ba5 (not 6...Bc5? 7.Bxf7+). Amateur: 7...Nge7 29%, 7...Nf6 20%, 8...Qe7 61%.
- **Hungarian / Benima Defence, 4...Be7** — Wikipedia: "transposes to the Hungarian Defence". IronStone chapter "4...Be7 Benima / Hungarian Defense". Amateurs then trade 5...Nxd4 32%.
- **Paris Defence, 4...d6** — IronStone chapter "4…d6 Scotch Gambit, Paris Defense". Chess Doctrine: "return the pawn for a calm game". Amateurs 5...Nxd4 52%.

### Alternatives to recognise (theory, but not our move or not recommended)

| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |
|---|---|---|---|---|---|---|---|
| 1 | **Møller Attack, 7.Nc3 (historical alternative for White)** | A | **3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.cxd4 6...Bb4+ 7.Nc3 7...Nxe4 8.O-O 8...Bxc3 9.d5 9...Bf6 10.Re1 10...Ne7 11.Rxe4 11...d6 12.Bg5 12...Bxg5 13.Nxg5 13...h6 14.Qe2** 14...hxg5 15.Re1 15...Be6 | 64 | dxe6 56 | Felgaer, Ruben – Lafuente, Pablo (2009, 0-1); Kurenkov, Nikolai – Turov, Maxim (2007, 1-0) | [wikiGiuoco](#src-wikiGiuoco), [kaufman](#src-kaufman), [sf](#src-sf) |
| 2 | **Haxo Gambit, 6.e5 d5 (Greco Gambit / Sveshnikov line)** | A | **3...exd4 4.Bc4 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb6 9.Nc3 9...O-O** 10.Be3 | 1,138 | Bg4 853 | Nepomniachtchi, I. – Carlsen, M. (2021); So, W.. – Carlsen, M.. (2021, 1-0) | [wikiGiuoco](#src-wikiGiuoco), [ironstone](#src-ironstone) |
| 3 | **Max Lange Attack proper (5.O-O Nf6 6.e5 d5 7.exf6)** | A | **3...exd4 4.Bc4 4...Bc5 5.O-O 5...Nf6 6.e5 6...d5 7.exf6 7...dxc4 8.Re1+ 8...Be6 9.Ng5 9...Qd5 10.Nc3 10...Qf5 11.Nce4** 11...O-O-O | 38 | g4 28 | Bergez, Luc – Flear, Glenn C (2000, 1-0); Cueto Chajtur, Johny – Soppe, Guillermo (2000, 0-1) | [wikiMaxLange](#src-wikiMaxLange), [fishbein](#src-fishbein), [astanehMaxLange](#src-astanehMaxLange) |
| 4 | **von der Lasa Variation (5.O-O d6)** | A | **3...exd4 4.Bc4 4...Bc5 5.O-O 5...d6** | 96 | c3 73 | Vachier Lagrave, M. – Kramnik, V. (2017, 0-1); Ponkratov, P. – Goryachkina, A. (2021) | [fishbein](#src-fishbein) |
| 5 | **5.O-O Nxe4 — Anderssen Attack (White alternative)** | A | **3...exd4 4.Bc4 4...Nf6 5.O-O 5...Nxe4 6.Re1 6...d5 7.Bxd5 7...Qxd5 8.Nc3** 8...Qa5 | 391 | Nxe4 380 | Jones, G.. – So, W.. (2021, 1-0); Savchenko, Boris – Karjakin, Sergey (2010, 1-0) | [wikiTwoKnights](#src-wikiTwoKnights), [fishbein](#src-fishbein), [studyEXO](#src-studyEXO) |

- **Møller Attack, 7.Nc3 (historical alternative for White)** — Full Wikipedia line. Kaufman: "doubtful that White has sufficient compensation". Stockfish (depth 18) agrees: −0.5 vs 7.Bd2. Recognise it, don’t play it.
- **Haxo Gambit, 6.e5 d5 (Greco Gambit / Sveshnikov line)** — Wikipedia Giuoco 6.e5: "surge in popularity in the early 21st century … Black’s best reply is 6...d5!" then 7.Bb5 Ne4 8.cxd4 Bb6 9.Nc3 O-O 10.Be3 "White has a space advantage; Black has a powerful knight". IronStone chapter "4...Bc5 5.c3 Nf6 6.e5 d5 Greco Gambit". Same structure as the Modern Attack.
- **Max Lange Attack proper (5.O-O Nf6 6.e5 d5 7.exf6)** — Wikipedia: main line "7.exf6 dxc4 8.Re1+ Be6 9.Ng5 Qd5 10.Nc3 Qf5 11.Nce4 O-O-O with complex play"; trap 9...Qxf6?? 10.Nxe6. Fishbein ch.6. This is White’s gambit alternative to 5.c3; Fishbein says 5.O-O "is much better for White than its reputation".
- **von der Lasa Variation (5.O-O d6)** — Fishbein ch.7-8 (name only from the table of contents; the lines themselves were not in the sample).
- **5.O-O Nxe4 — Anderssen Attack (White alternative)** — Wikipedia: Black equalises "by eliminating White’s last center pawn with 5...Nxe4"; after 8.Nc3 "Black is judged as having a comfortable position after 8...Qa5 or 8...Qh5". Fishbein ch.5: 5.O-O "allows Black to equalize without much trouble". Nakhmanson Gambit 6.Nc3 (Bologan 2014) is the wild alternative.

### Side lines (inferior opponent moves with a known answer)

| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |
|---|---|---|---|---|---|---|---|
| 1 | **Lolli Variation, 3...Nxd4** | A | **3...Nxd4 4.Nxd4 4...exd4 5.Qxd4 5...Ne7 6.Bc4 6...Nc6 7.Qd5 7...Qf6 8.O-O 8...Ne5 9.Be2 9...c6 10.Qb3** | 8 | h5 4 | Van der Wiel, John – Sokolov, Ivan (1994, 0-1); Palac, Mladen – Degraeve, Jean Marc (1997) | [wikiScotch](#src-wikiScotch), [bezgodov](#src-bezgodov) |
| 2 | **Third-move oddities: 3...f6, 3...f5, 3...Bd6, 3...Qe7, 3...Qf6, 3...d5** | A | **3...f5** | 0 |  |  | [bezgodov](#src-bezgodov), [games](#src-games) |
| 3 | **4...h6 (Anti-Fried-Liver)** | B | **3...exd4 4.Bc4 4...h6 5.O-O** | 9 | d6 3 | Fossan, Erik – Blatny, Pavel (1993, 0-1); Guizar, Dr. Clemente – Segalla, José Getulio Martin (2007, 1-0) | [ironstone](#src-ironstone), [studyEXO](#src-studyEXO), [studySoNy](#src-studySoNy), [amateur](#src-amateur), [games](#src-games) |
| 4 | **3...Nf6?! (Scotch declined with the knight)** | C | **3...Nf6 4.dxe5 4...Nxe4** 5.Bc4 | 10 | Nc5 7 | Regan, Kenneth – Lein, Anatoly (1977, 1-0); Gaponenko, Inna – Misanovic, Vesna (2002, 1-0) | [studySoNy](#src-studySoNy), [games](#src-games) |

- **Lolli Variation, 3...Nxd4** — Wikipedia: "often described today as a strategic error" but ECO says Black equalises with the quoted line. Bezgodov & Barsky ch.1 §(7). Rare (1.7% of club games).
- **Third-move oddities: 3...f6, 3...f5, 3...Bd6, 3...Qe7, 3...Qf6, 3...d5** — Bezgodov & Barsky ch.1 "Black in the Danger Zone" lists all six with refutations (pp. 13-14; not in the sample). Your opponents played f5 ×2, Bd6 ×2, Qf6 ×1. Answers currently engine-chosen: vs f5 4.Nxe5; vs Bd6 4.d5; vs Qf6 4.d5.
- **4...h6 (Anti-Fried-Liver)** — IronStone chapter "4...h6 5.O-O Anti-Fried Liver Defense"; EXOprimal and SoNy also 5.O-O. 18% of club games; 6 of your games. Engine: only +0.3, so "side" by manners, not by evaluation.
- **3...Nf6?! (Scotch declined with the knight)** — SoNy study "13th Century Game": 4.dxe5 Nxe4 5.Bc4 Bc5?? 6.Qd5 wins. 1 of your games. Community source only.

### Traps (forcing tricks that need the opponent to cooperate)

| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |
|---|---|---|---|---|---|---|---|
| 1 | **Perreux 5.Ng5 vs 4...Bc5: 5...Nh6 6.Nxf7 Nxf7 7.Bxf7+ Kxf7 8.Qh5+ g6 9.Qxc5** | A | **3...exd4 4.Bc4 4...Bc5 5.Ng5 5...Nh6 6.Nxf7 6...Nxf7 7.Bxf7+ 7...Kxf7 8.Qh5+ 8...g6 9.Qxc5** | 93 | d5 68 | Grischuk, A. – Karjakin, Sergey (2018); Grischuk, A. – Dominguez Perez, L. (2018, 1-0) | [wikiScotch](#src-wikiScotch), [studySoNy](#src-studySoNy), [astanehPerreux](#src-astanehPerreux) |
| 2 | **Haxo Gambit accepted: 6.Bxf7+! … 7...Ke8** | B | **3...exd4 4.Bc4 4...Bc5 5.c3 5...dxc3 6.Bxf7+ 6...Kxf7 7.Qd5+ 7...Ke8 8.Qh5+ 8...g6 9.Qxc5 9...cxb2 10.Bxb2** | 0 |  |  | [wikiScotch](#src-wikiScotch), [chessdoctrine](#src-chessdoctrine), [studySoNy](#src-studySoNy), [studyEXO](#src-studyEXO), [amateur](#src-amateur), [sf](#src-sf) |
| 3 | **Haxo Gambit accepted: 6.Bxf7+! … 7...Kf8** | B | **3...exd4 4.Bc4 4...Bc5 5.c3 5...dxc3 6.Bxf7+ 6...Kxf7 7.Qd5+ 7...Kf8 8.Qxc5+ 8...d6 9.Qxc3** | 2 | Nf6 2 | Hadzimanolis, Antonios – Stefanova, Antoaneta (2005, 1-0); Bargan, Sergei – Nedev, Tanio (2011, 1-0) | [chessdoctrine](#src-chessdoctrine), [amateur](#src-amateur), [sf](#src-sf) |
| 4 | **London Defence trap: 6...Bc5? 7.Bxf7+** | B | **3...exd4 4.Bc4 4...Bb4+ 5.c3 5...dxc3 6.bxc3 6...Bc5 7.Bxf7+ 7...Kxf7 8.Qd5+ 8...Ke8 9.Qxc5** | 0 |  |  | [chessdoctrine](#src-chessdoctrine), [amateur](#src-amateur) |
| 5 | **4...h6 5.O-O Bc5 6.c3 dxc3 7.Bxf7+** | C | **3...exd4 4.Bc4 4...h6 5.O-O 5...Bc5 6.c3 6...dxc3 7.Bxf7+ 7...Kxf7 8.Qd5+ 8...Ke8 9.Qh5+ 9...Kf8 10.Qxc5+ 10...Ke8 11.Qxc3** | 0 |  |  | [studySoNy](#src-studySoNy) |
| 6 | **5...Ng4 6.O-O Ngxe5? 7.Nxe5 Nxe5 8.Re1** | C | **3...exd4 4.Bc4 4...Nf6 5.e5 5...Ng4 6.O-O 6...Ngxe5 7.Nxe5 7...Nxe5 8.Re1 8...d6 9.f4** | 0 |  |  | [studySoNy](#src-studySoNy), [studyOctopus](#src-studyOctopus) |
| 7 | **5...Qe7 6.O-O Nxe5? 7.Nxe5 Qxe5 8.Re1** | C | **3...exd4 4.Bc4 4...Nf6 5.e5 5...Qe7 6.O-O 6...Nxe5 7.Nxe5 7...Qxe5 8.Re1 8...Ne4 9.f4 9...Qf5 10.g4 10...Qg6 11.f5** | 0 |  |  | [studySoNy](#src-studySoNy), [studyOctopus](#src-studyOctopus), [amateur](#src-amateur) |

- **Perreux 5.Ng5 vs 4...Bc5: 5...Nh6 6.Nxf7 Nxf7 7.Bxf7+ Kxf7 8.Qh5+ g6 9.Qxc5** — Wikipedia: 5.Ng5 "generally considered premature … Black’s best defense is 5...Nh6" and this line "seems to offer both sides approximately equal chances" — so a trap that recovers material, not a win. SoNy Traps 1-2 (5...Ne5 / 5...Nh6). Astaneh has a Perreux video.
- **Haxo Gambit accepted: 6.Bxf7+! … 7...Ke8** — Wikipedia: "Black risks accepting with 5...dxc3 due to White’s development advantage". Chess Doctrine "The Greedy Pawn Trap". 5...dxc3 is the MOST common club reply (55%); 7...Ke8 78%. SoNy’s favourite line. Engine: near equal material, but easy for White.
- **Haxo Gambit accepted: 6.Bxf7+! … 7...Kf8** — 7...Kf8 22% of club games. 8.Qxc5+ d6 9.Qxc3: material back, Black cannot castle.
- **London Defence trap: 6...Bc5? 7.Bxf7+** — Chess Doctrine: "6...Bc5, which loses to 7.Bxf7+ Kxf7 8.Qd5+"; also "6...Be7 (instead of Ba5), then 7.Qd5 threatens f7". 8...Ke8 75%.
- **4...h6 5.O-O Bc5 6.c3 dxc3 7.Bxf7+** — SoNy "Punish 4...h6". Same Bxf7+ mechanism one move later. Community source.
- **5...Ng4 6.O-O Ngxe5? 7.Nxe5 Nxe5 8.Re1** — SoNy Trap 3 / CuriousOctopus 3.3: the pinned knight on e5 falls. Community source.
- **5...Qe7 6.O-O Nxe5? 7.Nxe5 Qxe5 8.Re1** — SoNy Trap 4; CuriousOctopus 3.5. 5...Qe7 is 12% of club games and 0% of master games.

## Elephant Gambit (you play Black)

Root: `1.e4 1...e5 2.Nf3 2...d5`


### Main lines (sound opponent choices you must know)

| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |
|---|---|---|---|---|---|---|---|
| 1 | **Maróczy Gambit / Rogers line: 3.exd5 Bd6** | A | **3.exd5 3...Bd6 4.d4 4...e4 5.Ne5 5...Nf6 6.Bb5+ 6...Nbd7 7.Bg5 7...O-O 8.Bxd7 8...Bxd7 9.Bxf6 9...gxf6 10.Nxd7 10...Qxd7 11.O-O** | 2 | Kh8 1 | Hoffmann, Michael – Smit, Erik (2007); Balabaev, Farit – Blauert, Joerg (2006, 0-1) | [elephantQC](#src-elephantQC), [rogers](#src-rogers), [khalifman](#src-khalifman), [wikiElephant](#src-wikiElephant), [studyGriffen](#src-studyGriffen), [studyBunny](#src-studyBunny) |
| 2 | **Paulsen Countergambit: 3.exd5 e4 4.Qe2 Nf6 5.d3 Qxd5 6.Nbd2** | A | **3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.Nbd2 6...Be7 7.dxe4 7...Qe6** | 1 | Qc4 1 | Rusche, Johannes – Schramm, Christian (2013, 0-1) | [wikiElephant](#src-wikiElephant), [mco](#src-mco), [chessmood](#src-chessmood), [studyFuxia](#src-studyFuxia), [masters](#src-masters) |
| 3 | **3.Nxe5 Bd6 4.d4 dxe4 (book main)** | A | **3.Nxe5 3...Bd6 4.d4 4...dxe4** | 64 | Nc4 25 | Jenni, Florian – Skatchkov, Pavel (2007, 0-1); Demchenko, A. – Chizhikov, V. (2018, 1-0) | [elephantQC](#src-elephantQC), [chessmood](#src-chessmood), [wikiElephant](#src-wikiElephant), [studyBunny](#src-studyBunny), [masters](#src-masters), [games](#src-games) |
| 4 | **3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.Qh5** | A | **3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Bc4 5...Bxe5 6.Qh5 6...Qe7 7.Qxe5 7...Qxe5 8.dxe5** | 1 | Nc6 1 | Zambrana, Oswaldo – Nogueira, Ivan Kuhlmann (2009, 0-1) | [wikiElephant](#src-wikiElephant), [chessmood](#src-chessmood) |
| 5 | **Paulsen, 5.Nc3 Be7 6.Nxe4 O-O 7.d3** | B | **3.exd5 3...e4 4.Qe2 4...Nf6 5.Nc3 5...Be7 6.Nxe4 6...O-O 7.d3 7...Nxd5 8.Qd1 8...Nc6 9.Be2 9...Bf5 10.O-O 10...Qd7** | 1 | Bd2 1 | Movsesian, Sergei – Vachier Lagrave, Maxime (2010, 1-0) | [ostrovskiy](#src-ostrovskiy), [chessmood](#src-chessmood), [wikiElephant](#src-wikiElephant), [masters](#src-masters) |
| 6 | **Paulsen, 6.Nc3 Bb4!** | B | **3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 6.Nc3 6...Bb4** | 1 | Nd2 1 | Rodi, Luis Ernesto – Porto, Cristiano Nogueira (2012, 1-0) | [chessmood](#src-chessmood), [amateur](#src-amateur) |
| 7 | **3.d4 (Elephant declined)** | B | **3.d4 3...dxe4 4.Nxe5 4...Nd7** | 36 | Nd2 19 | Matyukhin, Sergey Konstantinov – Schweer, Carsten (2021, 1-0); Matyukhin, Sergey Konstantinov – Pecka, Josef (2021, 1-0) | [studyBunny](#src-studyBunny), [masters](#src-masters), [games](#src-games) |
| 8 | **Paulsen, 5.d3 Bb4+!? (pin instead of taking d5)** | C | **3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Bb4+ 6.c3 6...O-O 7.cxb4 7...exf3 8.Qxf3 8...Nxd5** | 0 |  |  | [studyBunny](#src-studyBunny) |
| 9 | **3.Nxe5 Bd6 4.d4 dxe4 5.Nc4 Be7** | C | **3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Nc4 5...Be7 6.Nc3 6...Nf6 7.Bg5 7...O-O 8.Be2 8...Nc6** | 0 |  |  | [studyBunny](#src-studyBunny), [masters](#src-masters) |
| 10 | **3.Nc3** | C | **3.Nc3 3...d4 4.Ne2 4...Bd6 5.Ng3 5...Nf6 6.Bc4 6...O-O 7.O-O 7...c5** | 5 | d3 5 | Mestrovic, Zvonimir – Romanishin, Oleg M (1988, 0-1); Schmaltz, Roland – Schneider, Bernd2 (1992, 1-0) | [studyGriffen](#src-studyGriffen) |

- **Maróczy Gambit / Rogers line: 3.exd5 Bd6** — THE book repertoire: Aabling-Thomsen & Jensen 2020 build Black’s whole system on 3.exd5 Bd6; Rogers 1994 likewise. Wikipedia (de Firmian): after 4.d4 e4 5.Ne5 Nf6 6.Nc3 O-O 7.Bc4 "White enjoys a distinct superiority but no immediate attack"; Khalifman recommends 4.d4 for White. PeterGriffen’s study gives the 6.Bb5+ Nbd7 7.Bg5 line above. NOT in our current repertoire, which plays 3...e4.
- **Paulsen Countergambit: 3.exd5 e4 4.Qe2 Nf6 5.d3 Qxd5 6.Nbd2** — Wikipedia/MCO: "5.d3 Qxd5 6.Nbd2 Be7 7.dxe4 Qe6 and White remains a pawn ahead, although Black’s development is somewhat smoother". ChessMood: 4.Qe2! is White’s best. Masters: 4.Qe2 75%. fuxia’s study prefers 6...Nc6. Our current trunk.
- **3.Nxe5 Bd6 4.d4 dxe4 (book main)** — Second pillar of the 2020 book. Wikipedia: 5.Bc4 Bxe5 6.Qh5 Qf6 7.dxe5 "slightly better for White"; ChessMood: 5.Bc4 Be5 6.Qh5! Qe7 7.Qxe5. BunnyMommy: answers to 5.Nc4 (Be7 6.Nc3 Nf6 7.Bg5 O-O), 5.Nc3 (Nf6 6.Bg5 O-O), 5.Bc4, 5.Bf4 (Nf6). Masters 5th moves: Nc4 39%, Nc3 14%, Bf4 8%. 8 of your games reach 3.Nxe5.
- **3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.Qh5** — Wikipedia (MCO): 6...Qf6 7.dxe5 ±. ChessMood: 6...Qe7 7.Qxe5 Qxe5 8.dxe5 then "9.Nc3!". Black is fine materially but a shade worse.
- **Paulsen, 5.Nc3 Be7 6.Nxe4 O-O 7.d3** — Ostrovskiy (IM) model line to move 13. ChessMood: 5.Nc3 "avoids the pin". Wikipedia: 5.Nc3 Be7 6.Nxe4 "slight advantage" (Salomonsson–Sorenson 1982). Masters: 5.Nc3 47%, then 7.d3 70%.
- **Paulsen, 6.Nc3 Bb4!** — ChessMood: "Black has a very important move 6...Bb4!" (then 7.Nd2!/7.Ng5/7.dxe4 all still ±). 39% of club games at move 6.
- **3.d4 (Elephant declined)** — Masters 21%. BunnyMommy covers 3.d4 exd4 4.Qxd4 / 4.Nxd4 / 4.exd5 instead. Our repertoire takes 3...dxe4.
- **Paulsen, 5.d3 Bb4+!? (pin instead of taking d5)** — BunnyMommy study: 5...Bb4+ with answers to the blocks 6.c3 / 6.Nc3 / 6.Bd2 / 6.Nbd2 (all "…O-O then …Re8 / …exf3"). Community only; unverified by the books read.
- **3.Nxe5 Bd6 4.d4 dxe4 5.Nc4 Be7** — Masters’ most popular 5th move (39%). BunnyMommy’s line. Community for the continuation.
- **3.Nc3** — PeterGriffen study: 3...d4!? 4.Ne2 Bd6 5.Ng3 Nf6. Our repertoire plays 3...dxe4 instead. Community.

### Alternatives to recognise (theory, but not our move or not recommended)

| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |
|---|---|---|---|---|---|---|---|
| 1 | **Paulsen, 5.d3 Be7 (declining to take d5)** | A | **3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Be7 6.dxe4 6...O-O 7.Nc3 7...Re8 8.Bd2 8...Bb4 9.O-O-O** | 1 | Bxc3 1 | Muhutdinov, Marat – Belov, Igor (1992) | [wikiElephant](#src-wikiElephant), [mco](#src-mco) |
| 2 | **Paulsen, 4...f5 (Tal–Lutikov 1964)** | A | **3.exd5 3...e4 4.Qe2 4...f5 5.d3 5...Nf6 6.dxe4 6...fxe4 7.Nc3 7...Bb4 8.Qb5+** | 0 |  |  | [wikiElephant](#src-wikiElephant) |
| 3 | **Cozio: 3.exd5 Qxd5** | A | **3.exd5 3...Qxd5 4.Nc3** | 4 | Qe6 2 | Turov, Maxim – Gashimov, Vugar (2006); Predojevic, Borki – Runic, Zoran (2007) | [wikiElephant](#src-wikiElephant), [jensenPurser](#src-jensenPurser) |
| 4 | **3.Nxe5 dxe4 (Lob–Eliskases line)** | A | **3.Nxe5 3...dxe4 4.d4** | 8 | Nd7 3 | Abramovic, Bosko – Skembris, Spyridon (1983, 1-0); Jukic, Branimir – Zelcic, Robert (1994) | [wikiElephant](#src-wikiElephant), [chessableBlog](#src-chessableBlog), [sf](#src-sf) |
| 5 | **Cochrane – Staunton (historic 3.Nxe5 game)** | C | **3.Nxe5** | 79 | Bd6 50 | Jenni, Florian – Skatchkov, Pavel (2007, 0-1); Demchenko, A. – Chizhikov, V. (2018, 1-0) | [studyFuxia](#src-studyFuxia) |

- **Paulsen, 5.d3 Be7 (declining to take d5)** — Wikipedia/MCO: "5.d3 Be7 6.dxe4 0-0 7.Nc3 Re8 8.Bd2 Bb4 9.0-0-0, with advantage for White". A Black alternative to know, not to play.
- **Paulsen, 4...f5 (Tal–Lutikov 1964)** — Historic: Tal–Lutikov, Tallinn 1964, "with White advantage". Recognise; don’t play.
- **Cozio: 3.exd5 Qxd5** — Wikipedia: "loses time; White gains a big lead in development after 4.Nc3". Bücker analysed it in Kaissiber (per bibliography). Not recommended.
- **3.Nxe5 dxe4 (Lob–Eliskases line)** — Wikipedia: Lob–Eliskases 1929, White "achieved winning advantage". Stockfish depth 22: 4.Bc4! is best (−0.87 for Black). Inferior to 3...Bd6.
- **Cochrane – Staunton (historic 3.Nxe5 game)** — fuxia’s study includes the 19th-century game as illustration (moves not extracted).

### Side lines (inferior opponent moves with a known answer)

| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |
|---|---|---|---|---|---|---|---|
| 1 | **3.exd5 Bd6 4.Bb5+ c6 / 3.exd5 e4 4.Bb5+ c6** | B | **3.exd5 3...e4 4.Bb5+ 4...c6** | 3 | dxc6 3 | Kurilin, Alexander – Kalinichev, Andrey (2006, 0-1); Eliseev, Nikolay Yakovlevich – Matyukhin, Sergey Konstantinov (2022, 0-1) | [amateur](#src-amateur), [games](#src-games) |

- **3.exd5 Bd6 4.Bb5+ c6 / 3.exd5 e4 4.Bb5+ c6** — Splane (bibliography) annotated 3.exd5 Bd6 4.Bb5+ c6. In our 3...e4 move order the same idea: ...c6 scores 63% for Black.

### Traps (forcing tricks that need the opponent to cooperate)

| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |
|---|---|---|---|---|---|---|---|
| 1 | **Wasp Variation: 3.Nxe5 dxe4 4.Bc4 Qg5** | B | **3.Nxe5 3...dxe4 4.Bc4 4...Qg5 5.Bxf7+ 5...Ke7 6.d4 6...Qxg2 7.Rf1 7...Bh3 8.Qe2 8...Qxf1+ 9.Qxf1 9...Bxf1 10.Kxf1 10...Nf6** | 0 |  |  | [chessableBlog](#src-chessableBlog), [studyGriffen](#src-studyGriffen), [sf](#src-sf) |
| 2 | **3.Nxe5 Bd6 4.Nxf7?! Kxf7** | C | **3.Nxe5 3...Bd6 4.Nxf7 4...Kxf7** | 1 | Qh5+ 1 | Varga, Zsolt – Ivan, Zoltan (1999, 0-1) | [amateur](#src-amateur), [sf](#src-sf) |

- **Wasp Variation: 3.Nxe5 dxe4 4.Bc4 Qg5** — Famous, and folklore: Stockfish depth 22 gives −1.16 for Black after 4...Qg5 (5.Bxf7+ Ke7 6.d4). It only "works" if White plays 5.Nxf7?? Qxg2 6.Rf1 Qe4+. Keep as a trap to know from BOTH sides.
- **3.Nxe5 Bd6 4.Nxf7?! Kxf7** — Black scores 60% here in club games; engine +1.6 for Black after best play. A trap for White to fall into.

## What masters actually play: 1.e4 1...e5 2.Nf3 2...Nc6 3.d4 3...exd4 4.Bc4 (White repertoire, most-played master move at our nodes, every reply with ≥ 30 games at theirs)

Source: Lichess masters database, 2026-09-22. Each row is one branch to the point where fewer than 30 master games remain.

| branch (moves after the root) | games at end | opening name | example games |
|---|---|---|---|
| 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb6 9.Nc3 9...O-O 10.Be3 10...Bg4 11.h3 11...Bh5 | 813 | Italian Game: Classical Variation, Greco Gambit, Modern Line | Nepomniachtchi, I. – Carlsen, M. (2021, ½); So, W.. – Carlsen, M.. (2021, 1-0) |
| 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb6 9.Nc3 9...Bg4 10.Be3 10...O-O 11.h3 11...Bh5 | 813 | Italian Game: Classical Variation, Greco Gambit, Modern Line | Nepomniachtchi, I. – Carlsen, M. (2021, ½); So, W.. – Carlsen, M.. (2021, 1-0) |
| 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Bc5 10.f3 10...Ng5 11.f4 11...Ne4 | 370 | Italian Game: Scotch Gambit, Max Lange Attack | Chigaev, M. – Van Foreest, Jorden (2024, ½); Adhiban, Baskaran – Ganguly, S.. (2021, 1-0) |
| 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5 8.Be3 8...O-O 9.Nxc6 9...bxc6 10.Bxc5 10...Nxc5 11.Bxc6 11...Rb8 | 116 | Italian Game: Scotch Gambit, Max Lange Attack | Nakamura, Hi – Onischuk, Al (2015, 1-0); Ye, Jiangchuan – Svidler, Peter (2001, 1-0) |
| 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Be7 10.f3 10...Nc5 11.f4 11...O-O | 82 | Italian Game: Scotch Gambit, Max Lange Attack | Carlsen, M. – Le, Quang Liem (2022, ½); Nepomniachtchi, I. – Vachier Lagrave, M. (2024, ½) |
| 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bd7 8.Bxc6 8...bxc6 9.O-O 9...Be7 10.f3 10...Nc5 11.f4 11...Ne4 | 77 | Italian Game: Scotch Gambit, Max Lange Attack | Jones, G. – Naiditsch, A. (2016, 1-0); Huschenbeth, N. – Dubov, Daniil (2019, 0-1) |
| 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5 8.Be3 8...Bd7 9.Bxc6 9...bxc6 10.Nd2 10...Nxd2 11.Qxd2 | 68 | Italian Game: Scotch Gambit, Max Lange Attack | Lu, Miaoyi – Suleymanli, Aydin (2025, ½); Sveshnikov, Evgeny – Potapov, Alexander (1998, ½) |
| 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb6 9.Nc3 9...O-O 10.Be3 10...f5 11.exf6 11...Nxf6 | 54 | Italian Game: Classical Variation, Greco Gambit, Modern Line | Leko, Peter – Eljanov, Pavel (2008, 0-1); Jones, G.. – Dominguez Perez, L.. (2021, 0-1) |
| 4...Nf6 5.e5 5...Ne4 6.Qe2 6...Nc5 7.O-O 7...Be7 8.Rd1 | 44 | Scotch Game: Scotch Gambit, Advance Variation | Jones, G. – Wang Hao (2019, 0-1); Matlakov, M. – Tari, A. (2022, 1-0) |
| 4...Nf6 5.e5 5...Ng4 6.O-O 6...d6 7.exd6 7...Bxd6 8.Re1+ 8...Kf8 | 42 | Scotch Game: Scotch Gambit, Kingside Variation | Nogerbek, Kazybek – Karthikeyan, M2. (2025, ½); Ljubojevic, Ljubomir – Sanguineti, Raul (1974, 1-0) |
| 4...Nf6 5.e5 5...d5 6.Bb5 6...Nd7 7.O-O 7...Be7 8.Bxc6 8...bxc6 9.Nxd4 9...Nb8 10.Nc3 10...O-O 11.Qf3 11...a5 | 41 | Scotch Game: Scotch Gambit, Advance Variation | Robson, R. – Demchenko, A. (2022, 0-1); Maurizzi, Marc'Andria – Cheparinov, I. (2023, 0-1) |
| 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5 8.Be3 8...Bxd4 9.Qxd4 9...O-O 10.Bxc6 10...bxc6 11.Nc3 | 35 | Italian Game: Scotch Gambit, Max Lange Attack | Timmerman, Gert Jan – Umansky, Mikhail Markovich (2005, ½); Nevednichy, Vladislav – Banusz, Tamas (2013, 1-0) |
| 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb6 9.Nc3 9...O-O 10.Be3 10...f5 11.exf6 11...Nxc3 | 34 | Italian Game: Classical Variation, Greco Gambit, Modern Line | Ma Qun – Wang Yue (2024, 1-0); Erigaisi, Arjun – Ganguly, S. (2022, 1-0) |
| 4...Bc5 5.c3 5...Nf6 6.e5 6...d5 7.Bb5 7...Ne4 8.cxd4 8...Bb4+ 9.Bd2 9...Nxd2 10.Nbxd2 10...O-O | 34 | Italian Game: Classical Variation, Greco Gambit, Anderssen Variation | Can, Emre – Wei, Yi (2020, 0-1); Kryvoruchko, Yuriy – Negi, Parimarjan (2013, 0-1) |
| 4...Nf6 5.e5 5...Ne4 6.Qe2 6...Nc5 7.O-O 7...Ne6 8.Bxe6 | 33 | Scotch Game: Scotch Gambit, Advance Variation | Jones, G. – Yu Yangyi (2019, 1-0); Asadli, Vugar – Esipenko, Andrey (2023, ½) |
| 4...Nf6 5.e5 5...Ng4 6.O-O 6...Be7 7.Re1 7...d6 | 31 | Scotch Game: Scotch Gambit, Kingside Variation | Mamedov, Rau – Inarkiev, E. (2018, ½); Khismatullin, D. – Inarkiev, E. (2018, 0-1) |
| 4...Nf6 5.e5 5...d5 6.Bb5 6...Ne4 7.Nxd4 7...Bc5 8.Be3 8...Bd7 9.Bxc6 9...bxc6 10.Nd2 10...Qh4 | 30 | Italian Game: Scotch Gambit, Max Lange Attack | Nakamura, Hikaru – Hebden, Mark (2008, 1-0); Kurajica, Bojan – Smejkal, Jan (1982, ½) |

## What masters actually play: 1.e4 1...e5 2.Nf3 2...d5 (Black repertoire, most-played master move at our nodes, every reply with ≥ 12 games at theirs)

Source: Lichess masters database, 2026-09-22. Each row is one branch to the point where fewer than 12 master games remain.

| branch (moves after the root) | games at end | opening name | example games |
|---|---|---|---|
| 3.exd5 3...e4 4.Qe2 4...Nf6 5.Nc3 5...Be7 6.Nxe4 | 19 | Elephant Gambit: Paulsen Countergambit | Movsesian, Sergei – Vachier Lagrave, Maxime (2010, 1-0); Abasov, Nijat Azad – Gadimbayli, Abdulla Azar (2020, 0-1) |
| 3.Nxe5 3...Bd6 4.d4 4...dxe4 5.Nc4 5...Nf6 | 18 | Elephant Gambit | Kabanov, Nikolai – Skatchkov, Pavel (2013, 0-1); Potapov, Pavel – Skatchkov, Pavel (2013, 0-1) |
| 3.exd5 3...e4 4.Qe2 4...Nf6 5.d3 5...Qxd5 | 17 | Elephant Gambit: Paulsen Countergambit | Kovchan, Alexander – Skatchkov, Pavel (2003, 1-0); Vasquez Schroder, Rodrigo Rafael – Skatchkov, Pavel (2013, 1-0) |
| 3.d4 3...dxe4 4.Nxe5 4...Nd7 5.Nd2 5...Nxe5 6.dxe5 6...Bf5 | 13 | Elephant Gambit | Matyukhin, Sergey Konstantinov – Schweer, Carsten (2021, 1-0); Matyukhin, Sergey Konstantinov – Pecka, Josef (2021, 1-0) |

## Sources

- <a id="src-fishbein"></a>**fishbein** (book) — Alex Fishbein, "The Scotch Gambit: An Energetic and Aggressive System for White", Russell Enterprises 2017 (sample chapters read 2026-09-22) — https://www.newinchess.com/media/wysiwyg/product_pdf/3721.pdf
- <a id="src-bezgodov"></a>**bezgodov** (book) — Alexei Bezgodov & Vladimir Barsky, "The Scotch Game: A Repertoire for White", Russell Enterprises 2023 (table of contents + ch.2 sample read 2026-09-22) — https://www.newinchess.com/media/wysiwyg/product_pdf/3772.pdf
- <a id="src-elephantQC"></a>**elephantQC** (book) — Jakob Aabling-Thomsen & Michael Agermose Jensen, "The Exhilarating Elephant Gambit", Quality Chess 2020, 416 pp. — repertoire based on 3.exd5 Bd6 and 3.Nxe5 Bd6 4.d4 dxe4 (description; text not read) — https://forwardchess.com/product/the-exhilarating-elephant-gambit
- <a id="src-rogers"></a>**rogers** (book) — Jonathan Rogers, "Winning with the Elephant Gambit", Tournament Chess 1994 (cited via Kenilworthian bibliography; text not read) — http://kenilworthian.blogspot.com/2012/12/elephant-gambit-c40-bibliography_12.html
- <a id="src-jensenPurser"></a>**jensenPurser** (book) — Jensen, Purser & Pape, "The Elephant Gambit 2", Blackmar Press 1997 (cited; text not read) — http://kenilworthian.blogspot.com/2012/12/elephant-gambit-c40-bibliography_12.html
- <a id="src-khalifman"></a>**khalifman** (book) — Khalifman, "Opening for White According to Anand, vol. 1", Chess Stars 2003, pp. 15-18 — White vs 3.exd5 Bd6 (cited; text not read) — http://kenilworthian.blogspot.com/2012/12/elephant-gambit-c40-bibliography_12.html
- <a id="src-mco"></a>**mco** (book) — de Firmian, "Modern Chess Openings" 14th ed. 1999 — Elephant assessments, quoted via Wikipedia — https://en.wikipedia.org/wiki/Elephant_Gambit
- <a id="src-kaufman"></a>**kaufman** (book) — Larry Kaufman on the Møller Attack (quoted via Wikipedia "Giuoco Piano") — https://en.wikipedia.org/wiki/Giuoco_Piano
- <a id="src-wikiScotch"></a>**wikiScotch** (wiki) — Wikipedia "Scotch Game" (cites Wells 1998, Lane 1993, Dembo & Palliser 2011) — https://en.wikipedia.org/wiki/Scotch_Game
- <a id="src-wikiTwoKnights"></a>**wikiTwoKnights** (wiki) — Wikipedia "Two Knights Defense" — Open Variation 4.d4 exd4 (cites Bologan 2014) — https://en.wikipedia.org/wiki/Two_Knights_Defense
- <a id="src-wikiGiuoco"></a>**wikiGiuoco** (wiki) — Wikipedia "Giuoco Piano" — 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ lines — https://en.wikipedia.org/wiki/Giuoco_Piano
- <a id="src-wikiMaxLange"></a>**wikiMaxLange** (wiki) — Wikipedia "Max Lange Attack" (cites Hooper & Whyld) — https://en.wikipedia.org/wiki/Max_Lange_Attack
- <a id="src-wikiElephant"></a>**wikiElephant** (wiki) — Wikipedia "Elephant Gambit" (cites de Firmian MCO-14, Burgess, Hooper & Whyld) — https://en.wikipedia.org/wiki/Elephant_Gambit
- <a id="src-ironstone"></a>**ironstone** (course) — IronStone, "The Complete Scotch Gambit", Chessable (community author; 550k words). Chapter names read 2026-09-22 — https://www.chessable.com/the-complete-scotch-gambit/course/80250/
- <a id="src-ramoutar"></a>**ramoutar** (course) — IM Alan-Safar Ramoutar, "The Fast and Furious Scotch Gambit", Chessable 2025 (title only) — https://www.chessable.com/the-fast-and-furious-scotch-gambit/course/315402/
- <a id="src-chessmood"></a>**chessmood** (article) — GM Avetik Grigoryan (ChessMood), "Refute the Elephant Gambit" article + Daily Lesson #75 video — https://chessmood.com/blog/elephant-gambit-the-refutation
- <a id="src-chessdoctrine"></a>**chessdoctrine** (article) — chessdoctrine.com, "Scotch Gambit: All Variations, Traps & Winning Plans" — https://chessdoctrine.com/chess-openings/kings-pawn/scotch-gambit/
- <a id="src-chessableBlog"></a>**chessableBlog** (article) — Chessable blog, "The Ultimate Elephant Gambit Opening Guide" — https://www.chessable.com/blog/elephant-gambit/
- <a id="src-astanehAdvance"></a>**astanehAdvance** (video) — IM Alex Astaneh (Chessfactor), "The Advance Variation | Dynamic Play in the Scotch Gambit" — covers 5...Ng4, 5...d5, 7...Bd7, 7...Bc5 — https://www.youtube.com/watch?v=n1389qMsE0c
- <a id="src-astanehMaxLange"></a>**astanehMaxLange** (video) — IM Alex Astaneh (Chessfactor), "The Max Lange Attack in the Scotch Gambit" — 8.fxg7, 8.Re1+, 9.fxg7, 9.Ng5 — https://www.youtube.com/watch?v=9wmo_IkGrZQ
- <a id="src-astanehPerreux"></a>**astanehPerreux** (video) — IM Alex Astaneh (Chessfactor), "The Scotch Gambit | Introduction & Perreux Variation" — https://www.youtube.com/watch?v=b_osez_3JF4
- <a id="src-astanehDouble"></a>**astanehDouble** (video) — IM Alex Astaneh (Chessfactor), "The Double Gambit Accepted | Scotch Gambit" — https://www.youtube.com/watch?v=Sb35_qa3yAM
- <a id="src-hangingPawns"></a>**hangingPawns** (video) — Stjepan Tomic (Hanging Pawns), "The Scotch Gambit" — 4...Nf6 and 4...Bc5; mentions GM Lev Alburt recommending the gambit — https://www.youtube.com/watch?v=RIyuyX_I3z4
- <a id="src-canty"></a>**canty** (video) — James Canty III, "How To Play The Scotch Gambit - Quickstarter Jedi Guide" — https://www.youtube.com/watch?v=00hM8NR2B_g
- <a id="src-ostrovskiy"></a>**ostrovskiy** (video) — IM Andrey Ostrovskiy (Chessfactor), "The Elephant Gambit | Queen’s Pawn Countergambit" — model line 3.exd5 e4 4.Qe2 Nf6 5.Nc3 Be7 6.Nxe4 O-O 7.d3 Nxd5 … — https://www.youtube.com/watch?v=VQBSotLDRnA
- <a id="src-grigoryanVideo"></a>**grigoryanVideo** (video) — GM Avetik Grigoryan (ChessMood), "Elephant Gambit | The Refutation" — recommends 3.Nxe5 for White — https://www.youtube.com/watch?v=kn8mcck3l8c
- <a id="src-studyEXO"></a>**studyEXO** (study) — Lichess study "The Scotch Gambit" by EXOprimal (11 chapters) — https://lichess.org/study/UMNISCeS
- <a id="src-studySoNy"></a>**studySoNy** (study) — Lichess study "Scotch Gambit Full Repertoire" by SoNy-ChAnNeL (traps) — https://lichess.org/study/NLxu65J8
- <a id="src-studyOctopus"></a>**studyOctopus** (study) — Lichess study "Scotch Gambit Study" by CuriousOctopus — https://lichess.org/study/DvCUoqJ2
- <a id="src-studyBunny"></a>**studyBunny** (study) — Lichess study "CRUSH with the Elephant Gambit!" by BunnyMommyIsHappy (27 chapters, ...Bd6 repertoire) — https://lichess.org/study/Biovb2ms
- <a id="src-studyGriffen"></a>**studyGriffen** (study) — Lichess study "The Elephant Gambit" by PeterGriffen (Rogers line, Wasp) — https://lichess.org/study/xgIDpAoC
- <a id="src-studyFuxia"></a>**studyFuxia** (study) — Lichess study "Elephant Gambit" by fuxia (Paulsen 6...Nc6; Cochrane–Staunton) — https://lichess.org/study/2NEP3eiQ
- <a id="src-masters"></a>**masters** (database) — Lichess masters database (OTB games of 2200+ players), queried 2026-09-15/22 — https://lichess.org/analysis#explorer
- <a id="src-amateur"></a>**amateur** (database) — Lichess database, blitz+rapid 1400-1800, queried 2026-09-17 — https://lichess.org/analysis#explorer
- <a id="src-games"></a>**games** (database) — stas1928's Chess.com games, last 6 months (427 games), scanned 2026-09-16 — https://www.chess.com/member/stas1928
- <a id="src-sf"></a>**sf** (engine) — Stockfish 18 (lite), depth 18-22, run locally
