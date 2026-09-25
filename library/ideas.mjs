/* ---------------------------------------------------------------
   SOURCED COACH IDEAS — hand-written, one per position, keyed by the SAN
   path from move 1 (space-separated) of the position AFTER the move.
     why  — the idea in plain words, paraphrased from `src` (never copied)
     src  — ids from SOURCES in library/lines.mjs
     say  — optional personality line; must only rephrase `why`
     marks — optional { arrows: ['c4-f7'], circles: ['f7'] }
   Moves not listed here get board facts from js/facts.js (owner rule
   2026-09-25: never invent ideas). Build: node tools/build-ideas.mjs
   Harvest used: node tools/fetch-ideas.mjs (2026-09-25).
--------------------------------------------------------------- */
const SG = 'e4 e5 Nf3 Nc6 d4 exd4 Bc4';
const EL = 'e4 e5 Nf3 d5';

export const IDEAS = {
  // ---------- shared start ----------
  'e4': { why: 'Takes a share of the centre and opens lines for the queen and the light-squared bishop.', src: ['wikibooks'], say: 'Now we puuush the pawn — centre and open lines!', marks: { arrows: [], circles: ['d5', 'f5'] } },
  'e4 e5': { why: 'Black mirrors, takes an equal share of the centre and gets in the way of an easy d4.', src: ['wikibooks'], say: 'They mirror us and grab their share of the centre.' },
  'e4 e5 Nf3': { why: 'Develops toward the centre, controls d4 and attacks the pawn on e5.', src: ['wikibooks'], say: 'Knight out — and it hits the pawn on e5!', marks: { arrows: ['f3-e5'], circles: ['e5'] } },

  // ---------- Scotch Gambit ----------
  'e4 e5 Nf3 Nc6': { why: 'The natural reply: develops, defends e5 and controls d4.', src: ['wikibooks'], say: 'They defend e5 and develop.' },
  'e4 e5 Nf3 Nc6 d4': { why: 'Opens the centre at once; Black almost always takes on d4.', src: ['wikibooks'], say: 'Strike in the centre — pawn to d4!', marks: { arrows: ['d4-e5'], circles: ['e5'] } },
  'e4 e5 Nf3 Nc6 d4 exd4': { why: 'Black takes on d4. Most people recapture with the knight here — we won’t.', src: ['wikibooks', 'studyOctopus'], say: 'They take on d4. Everyone recaptures here… not us.' },
  [SG]: { why: 'Leaves the pawn for now and puts the bishop on its most active square, aimed at f7. Black cannot easily keep the extra pawn.', src: ['wikibooks'], say: 'Bishop to c4 — eyes on f7! The pawn can wait.', marks: { arrows: ['c4-f7'], circles: ['f7'] } },
  [`${SG} Nf6`]: { why: 'Black’s most common reply — it attacks our pawn on e4 and leads to the main line.', src: ['studyOctopus'], say: 'The main line: their knight hits e4.' },
  [`${SG} Nf6 e5`]: { why: 'The key pawn move when the knight lands on f6: it kicks the knight and forces Black to react.', src: ['studyOctopus'], say: 'Now we puuush the pawn — kick that knight!', marks: { arrows: ['e5-f6'], circles: ['f6'] } },
  [`${SG} Nf6 e5 d5`]: { why: 'The main line: Black hits our bishop instead of moving the knight. Many club players miss this and drift into a sideline.', src: ['studyOctopus'], say: 'They counter-attack our bishop on c4.', marks: { arrows: ['d5-c4'], circles: ['c4'] } },
  [`${SG} Nf6 e5 d5 Bb5`]: { why: 'Fishbein calls this the only move: the bishop escapes with a pin on the c6 knight.', src: ['fishbein'], say: 'The only move — bishop to b5, pinning the knight!', marks: { arrows: ['b5-e8'], circles: ['c6'] } },
  [`${SG} Nf6 e5 d5 Bb5 Ne4 Nxd4`]: { why: 'We win our pawn back — material is level again.', src: ['studyEXO'], say: 'Grab the pawn — we’re level again!' },
  [`${SG} Nf6 e5 d5 Bb5 Ne4 Nxd4 Bd7`]: { why: 'Starts a long fight over the c5 square, with theory running very deep.', src: ['studyEXO'], say: 'The fight for c5 begins.', marks: { arrows: [], circles: ['c5'] } },
  [`${SG} Nf6 e5 d5 Bb5 Ne4 Nxd4 Bd7 Bxc6`]: { why: 'Fishbein: no other move is worth considering — we give the bishop to ruin Black’s pawns.', src: ['fishbein'], say: 'Take on c6 — no other move is worth it!' },
  [`${SG} Nf6 e5 Ne4`]: { why: 'Here the knight on e4 has no d5 pawn to lean on — it is looser than in the main line and gives us more options.', src: ['studyEXO'], say: 'Their knight on e4 has no pawn support.', marks: { arrows: [], circles: ['e4'] } },
  [`${SG} Nf6 e5 Ne4 Qe2`]: { why: 'The engine’s recommendation: the queen hits the loose knight on e4 straight away.', src: ['studyEXO'], say: 'Queen to e2 — go after the knight on e4!', marks: { arrows: ['e2-e4'], circles: ['e4'] } },
  [`${SG} Nf6 e5 Ng4 O-O Be7 Re1`]: { why: 'Black’s knight on g4 is out of play; the rook joins the pressure on e5.', src: ['studyEXO'], say: 'Rook to e1 — their knight on g4 is lost out there.', marks: { arrows: ['e1-e5'], circles: ['g4'] } },
  [`${SG} Nf6 e5 Ng4 O-O Ngxe5 Nxe5 Nxe5 Re1`]: { why: 'The knight on e5 is pinned to the king on e8 — we win a piece.', src: ['studyEXO'], say: 'Pin it on e5 — and the knight is lost!', marks: { arrows: ['e1-e8'], circles: ['e5'] } },
  [`${SG} Bc5`]: { why: 'Develops and defends the pawn on d4 — the only way to add a defender.', src: ['wikibooks', 'studyEXO'], say: 'They hang on to d4 with the bishop.', marks: { arrows: ['c5-d4'], circles: ['d4'] } },
  [`${SG} Bc5 c3`]: { why: 'The main move: offers another pawn and forces Black to decide. Taking it is a mistake because of the check on f7.', src: ['wikibooks', 'studyEXO'], say: 'Offer another pawn — make them decide!', marks: { arrows: ['c4-f7'], circles: ['f7'] } },
  [`${SG} Bc5 c3 Nf6`]: { why: 'Probably Black’s best: develops instead of grabbing the second pawn.', src: ['studyEXO'], say: 'They develop instead of grabbing.' },
  [`${SG} h6`]: { why: 'Loses a move — it stops a knight jump to g5 that is almost never our idea anyway.', src: ['studyEXO'], say: 'A slow move — they stop a jump we weren’t making.' },
  [`${SG} h6 Nxd4`]: { why: 'Simply take the pawn back — nothing wrong with that.', src: ['studyEXO'], say: 'Just take the pawn back.' },
  [`${SG} Bb4+ c3 dxc3 bxc3`]: { why: 'The main line: our pieces come out easily and Black has many chances to go wrong.', src: ['studyEXO'], say: 'Take back — our pieces will fly out.' },
  [`${SG} Bb4+ c3 dxc3 bxc3 Ba5 O-O d6 Qb3`]: { why: 'A main idea of the line: the queen joins the bishop on the diagonal toward f7.', src: ['studyEXO'], say: 'Queen to b3 — double up on f7!', marks: { arrows: ['b3-f7', 'c4-f7'], circles: ['f7'] } },
  'e4 e5 Nf3 Nc6 d4 d6 dxe5 dxe5 Qxd8+ Kxd8': { why: 'Black can no longer castle — we keep a small edge.', src: ['studyEXO'], say: 'Their king is stuck in the middle!', marks: { arrows: [], circles: ['d8'] } },

  // ---------- Elephant Gambit ----------
  [EL]: { why: 'The Elephant Gambit: we ignore the attack on e5 to open the centre and play fast. Engines frown, but it scores well at club level.', src: ['wikibooks', 'studyRoper', 'studyBunny'], say: 'Surprise — pawn to d5! Open it up.', marks: { arrows: ['d5-e4'], circles: ['e4'] } },
  [`${EL} exd5`]: { why: 'White accepts — the most common way to meet the gambit.', src: ['wikibooks', 'studyGriffen'], say: 'They take the pawn.' },
  [`${EL} exd5 e4`]: { why: 'The Paulsen Countergambit: kick the knight and grab the initiative.', src: ['wikibooks'], say: 'Now we puuush — kick the knight!', marks: { arrows: ['e4-f3'], circles: ['f3'] } },
  [`${EL} exd5 e4 Qe2`]: { why: 'White’s main answer: the queen pins our e-pawn to the king. Better for White, but not easy to play.', src: ['wikibooks', 'studyRoper'], say: 'Their queen pins our pawn on e4.', marks: { arrows: ['e2-e8'], circles: ['e4'] } },
  [`${EL} exd5 Bd6`]: { why: 'Almost every line of this system puts the bishop on d6 — fewer people know it than the pawn push to e4, and it gives real attacking chances.', src: ['studyGriffen', 'elephantQC'], say: 'Bishop to d6 — our favourite square!' },
  [`${EL} exd5 Bd6 d4`]: { why: 'White opens the position and tries to trade pawns.', src: ['studyGriffen'], say: 'They strike in the centre.' },
  [`${EL} exd5 Bd6 d4 e4`]: { why: 'Forced: taking on d4 leads to a bad position.', src: ['studyGriffen'], say: 'Push past — pawn to e4!', marks: { arrows: ['e4-f3'], circles: ['f3'] } },
  [`${EL} exd5 Bd6 d4 e4 Ne5 Nf6`]: { why: 'Defends the pawn on e4 and keeps Greek-gift ideas — a later bishop sacrifice on h2.', src: ['studyGriffen'], say: 'Knight out — guard e4!', marks: { arrows: ['f6-e4'], circles: ['e4'] } },
  [`${EL} exd5 Bd6 d4 e4 Ne5 Nf6 Bb5+ Nbd7`]: { why: 'Basically the only good move — block the check with the other knight.', src: ['studyGriffen'], say: 'Block with the knight — the only good move.' },
  [`${EL} Nxe5`]: { why: 'White takes the other pawn, on e5. Our main answer is the bishop to d6.', src: ['wikibooks', 'studyGriffen'], say: 'They grab e5 instead.' },
};
