/* ---------------------------------------------------------------
   REPERTOIRE SELECTION — which library lines the app drills.

   library/lines.mjs is the single source of truth for moves (SAN),
   sources, notes and end-of-line plans. This file only SELECTS library
   lines by id and gives each a stable app id (progress records hang off
   it). Nothing is copied or extended here:
   - no `extendTo`, no engine-created plies: what ships is exactly the
     sourced moves of the library line;
   - main lines are weight A (book / MCO / master practice) or B (course,
     titled player on video, cited Wikipedia, strong-online-player
     practice); side/trap/surprise lines may also be C (YouTube, studies)
     because the verifier checks them harder (below); E (engine) never;
   - one repertoire move per position for our side; conflicting
     alternatives (Møller, Smirnov's 11.Bxc6, 6.cxd4 Giuoco …) stay
     library-only. OUR own offbeat choices (Max Lange, Nakhmanson, the
     book's 3...Bd6 Elephant …) go in `surprise`, a separate set the app
     drills apart from the main repertoire (Surprises tab);
   - kind comes from the library: main = sound opponent choice you must
     know; side = the deviation itself is a mistake; trap = a later
     opponent move is the mistake. side/trap lines name `mistakeAt`; the
     mistake must be played by ≥ 10% of club players (Lichess 1400-1800)
     and swing the engine ≥ +1.0 (side +0.5), and the line ends with the
     gain locked in (≥ +1.5; side +1.0) — no stupid blunders drilled;
   - every non-trunk line ends after OUR move and has at least four of
     our moves after the defining point; lines the sources do not carry
     that far are omitted, not padded.
   tools/verify-repertoire.mjs checks all of this plus Stockfish and
   writes js/repertoire.data.js only when nothing is flagged.

   Locked choices (owner, 2026-09-22/23): Scotch 4...Nf6 5.e5; 4...Bc5 5.c3
   and after 5...Nf6 6.e5 (not 6.cxd4); 5...Ng4 6.O-O (not 6.Bxf7+);
   Elephant 3.exd5 e4 (Paulsen), 3.Nxe5 Bd6; Smirnov's 4...Be7 queen trap
   excluded as unsound; crazier human lines welcome as traps/surprises
   under the rules above.
--------------------------------------------------------------- */
import { LIBRARY, SOURCES } from '../library/lines.mjs';
import { cached } from './explorer-cache.mjs';

export const SELECTION = [
  {
    id: 'scotch', signaturePlies: 5,
    lines: [
      /* trunk */
      { use: 'v-rca-mainline-plan', id: 'main', name: 'Modern Attack (Advance Variation), main line' },
      /* 4...Nf6 5.e5 family */
      { use: 'modern-attack-bc5', id: 'bc5', name: 'Modern Attack, 7...Bc5 8.Be3 Bd7 (Ntirlis line)' },
      { use: 'masters-bc5-oo', id: 'bc5-oo', name: 'Modern Attack, 7...Bc5 8.Be3 O-O' },
      { use: 'masters-bc5-bxd4', id: 'bc5-bxd4', name: 'Modern Attack, 7...Bc5 8.Be3 Bxd4' },
      { use: 'masters-nd7', id: 'nd7', name: 'Modern Attack, 6...Nd7' },
      { use: 'masters-be7-f5', id: 'be7-9', name: 'Modern Attack, 9...Be7 10.f3 Nc5 11.f4 O-O 12.f5' },
      { use: 'masters-be7-ne4', id: 'be7-9-ne4', name: 'Modern Attack, 9...Be7 10.f3 Nc5 11.f4 Ne4' },
      { use: 'strong-be7-ng5-ne4', id: 'be7-9-ng5', name: 'Modern Attack, 9...Be7 10.f3 Ng5 11.f4 Ne4' },
      { use: 'strong-be7-ng5-ne6', id: 'be7-9-ng5-ne6', name: 'Modern Attack, 9...Be7 10.f3 Ng5 11.f4 Ne6 12.f5' },
      { use: 'strong-ng4-kf8-h3', id: 'ng4', name: '5...Ng4 6.O-O d6 7.exd6 Bxd6 8.Re1+ Kf8 9.h3 (Kingside Variation)' },
      { use: 'ian-ng4-be7-8', id: 'ng4-be7-8', name: '5...Ng4 6.O-O d6 … 8.Re1+ Be7' },
      { use: 'ian-ng4-be7-6', id: 'ng4-be7', name: '5...Ng4 6.O-O Be7 7.Re1 d6' },
      { use: 'strong-ng4-bc5', id: 'ng4-bc5', name: '5...Ng4 6.O-O Bc5 7.Bf4 O-O 8.h3 Nh6 9.Bxh6' },
      { use: 'ng4-trap', id: 'ng4-trap', name: '5...Ng4 6.O-O Ngxe5? — the pinned knight' },
      { use: 'ian-ne4-ne6', id: 'ne4', name: '5...Ne4 6.Qe2 Nc5 7.O-O Ne6' },
      { use: 'ian-ne4-be7', id: 'ne4-be7', name: '5...Ne4 6.Qe2 Nc5 7.O-O Be7 8.Rd1 d5 9.exd6' },
      { use: 'strong-ne4-oo', id: 'ne4-be7-oo', name: '5...Ne4 6.Qe2 Nc5 7.O-O Be7 8.Rd1 O-O 9.Nxd4' },
      { use: 'qe7-trap', id: 'qe7-trap', name: '5...Qe7?! 6.O-O — the pinned queen' },
      /* 4...Bc5 5.c3 family (Haxo / Greco Gambit) */
      { use: 'greco-gambit-e5', id: 'haxo', name: 'Greco Gambit, 5...Nf6 6.e5 d5 (masters’ main line)' },
      { use: 'masters-haxo-bg4', id: 'haxo-bg4', name: 'Greco Gambit, 9...Bg4 first' },
      { use: 'masters-haxo-f5', id: 'haxo-f5', name: 'Greco Gambit, 10...f5' },
      { use: 'masters-haxo-bb4', id: 'haxo-bb4', name: 'Greco Gambit, 8...Bb4+' },
      { use: 'v-rca-haxo-ke8', id: 'haxo-trap', name: 'Haxo accepted 5...dxc3?! 6.Bxf7+ … 7...Ke8' },
      { use: 'v-cv-haxo-kf8', id: 'haxo-trap-kf8', name: 'Haxo accepted 5...dxc3?! 6.Bxf7+ … 7...Kf8' },
      /* 4...Bb4+ London Defence */
      { use: 'london', id: 'london', name: 'London Defence, 7...d6 8.Qb3 Qe7 9.e5 dxe5 10.Ba3' },
      { use: 'strong-london-qf6', id: 'london-qf6', name: 'London Defence, 7...d6 8.Qb3 Qf6 9.Bg5' },
      { use: 'strong-london-nge7', id: 'london-nge7', name: 'London Defence, 7...Nge7 8.Ng5 O-O 9.Qh5' },
      // strong-london-ne5 (8...Ne5 9.Nxf7 …) not selected: engine says 8...Ne5 costs nothing and the line ends +0.69
      // v-rca-london (8...Qd7 9.Rd1) not selected: Stockfish −1.66 for 9.Rd1 vs 9.Re1 — transcript reconstruction doubtful
      { use: 'london-trap', id: 'london-trap', name: 'London Defence 6...Bc5?! 7.Bxf7+' },
      { use: 'v-rca-london-be7', id: 'london-be7', name: 'London Defence trap, 6...Be7?' },
      /* other 4th moves */
      { use: 'ian-d6-nxd4', id: 'declined-d6', name: 'Paris Defence 4...d6 5.Nxd4 Nf6 6.Nc3' },
      { use: 'paris-nxd4-oo', id: 'declined-d6-nxd4', name: 'Paris Defence 4...d6 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.Nc3 Be7 8.O-O' },
      { use: 'paris-nxd4-be6', id: 'declined-d6-be6', name: 'Paris Defence 4...d6 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.Nc3 Be6 8.Bg5' },
      { use: 'strong-h6-nxd4', id: 'h6', name: '4...h6 5.Nxd4 Nxd4 6.Qxd4 d6 7.Nc3' },
      { use: 'hun-d6-nf6', id: 'hungarian', name: 'Hungarian 4...Be7 5.Nxd4 d6 6.O-O Nf6 7.Nc3 O-O 8.Re1' },
      { use: 'hun-d6-nxd4', id: 'hungarian-nxd4', name: 'Hungarian 4...Be7 5.Nxd4 d6 6.O-O Nxd4 7.Qxd4 Nf6 8.Nc3' },
      // hun-d6-bf6 (7...Bf6 8.Qd3) not selected: Stockfish −0.57 for 8.Qd3 vs 8.Qd5
      { use: 'hun-nxd4-bf6-trap', id: 'hungarian-bxe5', name: 'Hungarian 4...Be7 5.Nxd4 Nxd4 6.Qxd4 Bf6 7.e5 … 10...Bxe5?! 11.Bxf7+' },
      { use: 'hun-nxd4-nf6', id: 'hungarian-nf6', name: 'Hungarian 4...Be7 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.e5' },
      // ian-h6-trap (4...h6 5.O-O Bc5 6.c3 dxc3 7.Bxf7+) not selected: engine says 6...dxc3 costs nothing (+0.75 at the end) — not a trap
      /* 3rd-move alternatives */
      { use: 'v-rca-d6-fork', id: 'scotch-d6', name: '3...d6 4.dxe5 — queens off, king stuck on d8' },
      { use: 'v-rca-nf6-3', id: 'nf6-3', name: '3...Nf6?! 4.d5 Ne7 5.Nxe5 Nxe4?' },
      // lolli (ECO line) not selected: Stockfish −0.53 for 6.Bc4 vs 6.Nc3, and the sourced line is too short without it
    ],
    /* OUR offbeat alternatives — drilled apart from the main repertoire (Surprises tab) */
    surprise: [
      { use: 'max-lange', id: 'sur-max-lange', name: 'Max Lange Attack: 4...Bc5 5.O-O!? Nf6 6.e5 d5 7.exf6' },
      { use: 'v-cv-nakhmanson', id: 'sur-nakhmanson', name: '4...Nf6 5.O-O!? Nxe4 6.Re1 d5 7.Bxd5 (Chess Vibes)' },
      { use: 'v-cv-london-oo', id: 'sur-london-oo', name: 'London 6.O-O!? cxb2 7.Bxb2 (Chess Vibes)' },
      // v-rca-ng4-trap (5.e5 Ng4 6.Bxf7+!?) cannot join: the surprise set already plays 5.O-O after 4...Nf6 (one move per position)
    ],
  },
  {
    id: 'elephant', signaturePlies: 4,
    lines: [
      /* trunk: Paulsen vs the masters' 5.Nc3 */
      { use: 'paulsen-nc3-5', id: 'main', name: 'Paulsen Countergambit, 4.Qe2 Nf6 5.Nc3' },
      { use: 'strong-nc3-5-nxf6', id: 'nc3-5-nxf6', name: '5.Nc3 Be7 6.Nxe4 O-O 7.Nxf6+ Bxf6 8.d3' },
      /* 5.d3 Qxd5 family */
      { use: 'strong-nc3-rd1', id: 'nc3-6-rd1', name: '5.d3 Qxd5 6.Nc3 Bb4! 7.Bd2 Bxc3 8.Bxc3 O-O 9.dxe4 Nxe4 10.Rd1' },
      { use: 'strong-nc3-qd3', id: 'nc3-6-qd3', name: '5.d3 Qxd5 6.Nc3 Bb4! … 9.dxe4 Nxe4 10.Qd3' },
      { use: 'v-rca-nf6-nc3-bb4', id: 'nc3-6', name: '5.d3 Qxd5 6.Nc3 Bb4! 7.Bd2 Bxc3 8.Bxc3 O-O 9.Bxf6? exf3!' },
      { use: 'strong-nc3-dxe4-7', id: 'nc3-6-dxe4', name: '5.d3 Qxd5 6.Nc3 Bb4! 7.dxe4 Qxe4' },
      { use: 'strong-dxe4-bc4', id: 'dxe4-6', name: '5.d3 Qxd5 6.dxe4 Qxe4 7.Qxe4+ Nxe4 8.Bd3 Nc5' },
      { use: 'strong-dxe4-nc3', id: 'dxe4-6-nc3', name: '5.d3 Qxd5 6.dxe4 Qxe4 7.Nc3 Bb4' },
      /* 4th-move knight moves */
      { use: 'strong-nd4', id: 'nd4', name: '4.Nd4 Qxd5 5.Nb3 Nf6 6.Nc3 Qe5 7.Be2 Nc6 8.O-O Bd6' },
      /* 3rd-move alternatives */
      { use: 'declined-d4', id: 'd4', name: '3.d4 (Elephant declined)' },
      { use: 'strong-bc4-dxe5-ke1', id: 'nxe5-bc4-dxe5', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.dxe5 Qxd1+ … 9.Ke1 Nge7' },
      { use: 'strong-bc4-dxe5-be2', id: 'nxe5-bc4-dxe5-be2', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.dxe5 Qxd1+ … 9.Be2' },
      { use: 'strong-nc3-bf4', id: 'nxe5-nc3-bf4', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Nc3 Bxe5 6.dxe5 Qxd1+ 7.Nxd1 Nc6 8.Bf4 Be6' },
      { use: 'strong-nc3-kxd1', id: 'nxe5-nc3-kxd1', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Nc3 Bxe5 6.dxe5 Qxd1+ 7.Kxd1' },
      { use: 'strong-nc4', id: 'nxe5-nc4', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Nc4 Nf6' },
      { use: 'qc-nxe5-nc3', id: 'nxe5-nc3', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Nc3 Bxe5 (the book)' },
      { use: 'karker-bc4-bf4', id: 'nxe5-bc4', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.Qh5 Qe7 … 9.Bf4' },
      { use: 'cm-bc4-nc3', id: 'nxe5-bc4-nc3', name: '3.Nxe5 Bd6 4.d4 dxe4 5.Bc4 Bxe5 6.Qh5 Qe7 … 9.Nc3' },
      { use: 'qc-nxf7', id: 'nxf7', name: '3.Nxe5 Bd6 4.Nxf7?! — the greedy fork' },
      // v-rca-nxe5-puzzle (5...Nf6 6.Bg5 O-O) not selected: the book plays 5...Bxe5 — one move per position
    ],
    surprise: [
      { use: 'maroczy-bd6', id: 'sur-maroczy', name: 'The book’s system: 3.exd5 Bd6!? 4.d4 e4 5.Ne5 Nf6' },
      { use: 'v-rca-maroczy-greek', id: 'sur-maroczy-greek', name: '3.exd5 Bd6!? 4.Nc3 Nf6 5.Bc4 e4 6.Nd4 O-O 7.O-O? Bxh2+ (Smirnov)' },
    ],
  },
];

/** Short credit for the plan popup: the part of each source's ref before the first comma/quote. */
export function credit(keys, sources = SOURCES) {
  return [...new Set(keys.map((k) => (sources[k]?.short ?? sources[k]?.ref ?? k).split(/[,"“]/)[0].trim()))].join('; ');
}

/** Resolve the selection against the library: exact SAN, sources, note, plan, mistake ply, club frequency. */
export function resolveSelection(selection = SELECTION, library = LIBRARY, clubShare = null) {
  return selection.map((sel) => {
    const opening = library.find((o) => o.id === sel.id);
    if (!opening) throw new Error(`selection: unknown opening ${sel.id}`);
    const pick = (s, kindOverride) => {
      const lib = opening.lines.find((l) => l.id === s.use);
      if (!lib) throw new Error(`selection ${sel.id}/${s.id}: library line "${s.use}" not found`);
      const club = clubShare && Number.isInteger(lib.mistakeAt) ? clubShare(lib.moves.slice(0, lib.mistakeAt), lib.moves[lib.mistakeAt]) : null;
      return {
        id: s.id, libraryId: lib.id, name: s.name ?? lib.name, kind: kindOverride ?? lib.kind, weight: lib.weight,
        moves: [...lib.moves], sources: [...lib.sources], note: lib.note, mistakeAt: lib.mistakeAt,
        plan: lib.plan ?? null, planSources: lib.planSources ? [...lib.planSources] : [], planBasis: lib.planBasis ?? null,
        planCredit: lib.planSources ? credit(lib.planSources) : '',
        club: club ? { share: club.share, games: club.total } : undefined,
      };
    };
    const lines = sel.lines.map((s) => pick(s));
    const surprise = (sel.surprise ?? []).map((s) => pick(s, 'surprise'));
    return { id: opening.id, name: opening.name, side: opening.side, signaturePlies: sel.signaturePlies, lines, surprise };
  });
}

/** Club frequency (Lichess 1400-1800 blitz/rapid) of `san` after `prefix`, from library/explorer-cache.json only. */
export function clubShare(prefix, san) {
  const n = cached('amateur', prefix);
  if (!n) return null;
  return { share: n.moves.find((m) => m.san === san)?.share ?? 0, total: n.total };
}

export const SEED = resolveSelection(SELECTION, LIBRARY, clubShare);
export { SOURCES };
