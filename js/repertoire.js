/* ---------------------------------------------------------------
   THE REPERTOIRE — two openings, each a bundle of named LINES.

   Vocabulary used everywhere in this project:
   - SAN  = Standard Algebraic Notation for one move: "Nf3", "exd4", "O-O".
   - ply  = one half-move. moves[0] is White's first move (ply 0),
            moves[1] is Black's reply (ply 1), and so on.
            Even plies are always White, odd plies are always Black.

   Shape (see js/tree.js):
     { id, name, side, signaturePlies, lines: [
         { id, libraryId, name, kind: 'main' | 'side' | 'trap', weight,
           moves, deviatesAt, cp, evals, sources, note, plan, planSources } ] }
   - lines[0] is the TRUNK.
   - 'main'  = a sound opponent choice you must know.
   - 'side'  = a genuinely inferior opponent move with the answer.
   - 'trap'  = a forcing trick that needs the opponent to cooperate.
   - `plan` is what to do when the line ends, in the words of its sources;
     the app shows it as "Plan: …" on completion.

   WHERE THE DATA COMES FROM
   - library/lines.mjs holds every line we know with sources, weight,
     note and plan (research + repertoire, single source of truth).
   - tools/repertoire.seed.mjs SELECTS library lines by id (weight A/B
     only, no conflicting alternatives).
   - tools/verify-repertoire.mjs checks structure + Stockfish and writes
     js/repertoire.data.js with exactly the library's moves — the engine
     never adds a move. Never hand-edit the data file.

   tests/repertoire.test.mjs prove every move is legal, canonical SAN,
   identical to the library, one move per position, no prefix lines,
   and that every line carries a sourced plan.
--------------------------------------------------------------- */
import DATA from './repertoire.data.js';
import { moveLabel } from './tree.js';

export const OPENINGS = DATA;

/** Look an opening up by its id ("scotch" / "elephant"). */
export function getOpening(id) {
  const opening = OPENINGS.find((o) => o.id === id);
  if (!opening) throw new Error(`Unknown opening: ${id}`);
  return opening;
}

/** Short label for a line in lists: "3...d6 · 3...d6 line" -> "3...d6 line". */
export function lineTitle(line) {
  if (line.deviatesAt === undefined || line.deviatesAt === null) return line.name;
  const label = moveLabel(line.deviatesAt, line.moves[line.deviatesAt]);
  return line.name.startsWith(label) ? line.name : `${label} · ${line.name}`;
}
