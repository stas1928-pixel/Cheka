/* ---------------------------------------------------------------
   Verify the selected repertoire with Stockfish and write the data file
   the app loads — but ONLY when nothing is flagged.

     node tools/verify-repertoire.mjs [depth=18] [out=js/repertoire.data.js]

   Input: tools/repertoire.seed.mjs (SEED = the selection resolved against
   library/lines.mjs). Checks (see tools/verify-lib.mjs): legality and
   canonical SAN, weight A/B, kinds, plans with sources, deviation at an
   opponent ply, lines end after our move with ≥ 4 of our moves after the
   deviation, no duplicate/prefix lines, one move per position (REPEAT),
   then the engine: DROP (one of our moves after the opening signature
   loses ≥ 0.5 vs best — the gambit move itself is the chosen opening and
   is only reported) and SIDE? (a side/trap line that ends below +0.5).

   Round 7 adds: side/trap lines name their `mistakeAt`; the mistake
   must be played by ≥ 10% of Lichess 1400-1800 players (from
   library/explorer-cache.json, offline) and swing the eval ≥ +1.0 (side:
   +0.5), and the line must end ≥ +1.5 (side: +1.0); surprise lines
   (our offbeat choices) are checked as their own set.

   Fail closed: any flag → report on stderr, exit 1, output file untouched.
--------------------------------------------------------------- */
import fs from 'node:fs';
import { createNodeEngine } from './nodeEngine.mjs';
import { SEED, SOURCES, clubShare } from './repertoire.seed.mjs';
import { verify, renderDataModule } from './verify-lib.mjs';

const DEPTH = Number(process.argv[2] ?? 18);
const OUT = process.argv[3] ?? 'js/repertoire.data.js';

const engine = await createNodeEngine({ defaultDepth: DEPTH });
const result = await verify(SEED, (sans, opts) => engine.evaluate(sans, opts), { depth: DEPTH, sources: SOURCES, clubShare, log: (s) => console.error(s) });
engine.stop();

if (!result.ok) {
  console.error(`\nNOT WRITTEN: ${result.flags.length} flag(s) — fix the library/selection and re-run.`);
  process.exit(1);
}
fs.writeFileSync(OUT, renderDataModule(result.data, { depth: DEPTH }));
console.error(`\nwrote ${OUT}: ${result.data.map((o) => `${o.id} ${o.lines.length} lines`).join(', ')}`);
process.exit(0);
