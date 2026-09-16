/* ---------------------------------------------------------------
   Rebuild every branch of the repertoire with Stockfish and print the
   results, so they can be pasted into js/repertoire.js.

     node tools/build-branches.mjs [depth] [outfile.json]

   Each existing branch's response is used as the seed; the engine then
   plays both sides to the horizon and branchBuilder.decideCut picks the
   stop, never shorter than THRESHOLDS.minMoves of our moves.
--------------------------------------------------------------- */
import fs from 'node:fs';
import { createNodeEngine } from './nodeEngine.mjs';
import { OPENINGS } from '../js/repertoire.js';
import { buildBranch } from '../js/branchBuilder.js';
import { moveLabel } from '../js/tree.js';

const depth = Number(process.argv[2] ?? 16);
const out = process.argv[3];
const engine = await createNodeEngine({ defaultDepth: depth });
const results = [];
const t0 = Date.now();

for (const o of OPENINGS) {
  for (const b of o.branches) {
    const r = await buildBranch({
      opening: o, deviationPly: b.deviatesAt, opponentMove: b.opponentMove,
      seedResponse: b.response, evaluate: (s, opts) => engine.evaluate(s, opts),
    });
    const sign = o.side === 'w' ? 1 : -1;
    const evals = r.evals.map((e) => `${e.san}=${e.mate != null ? 'M' + e.mate * sign : (e.cp * sign / 100).toFixed(2)}`);
    results.push({ id: o.id, deviatesAt: b.deviatesAt, opponentMove: b.opponentMove, old: b.response, response: r.response, verdict: r.verdict, evals });
    const changed = JSON.stringify(b.response) !== JSON.stringify(r.response) ? 'CHANGED' : 'same';
    console.log(`${o.id} ${moveLabel(b.deviatesAt, b.opponentMove).padEnd(10)} ${r.verdict.type.padEnd(10)} ${changed.padEnd(7)} ${r.verdict.reason}`);
    console.log(`    ${r.response.join(' ')}`);
    console.log(`    ${evals.join('  ')}`);
  }
}
engine.stop();
console.log(`\n${results.length} branches in ${Math.round((Date.now() - t0) / 1000)} s`);
if (out) fs.writeFileSync(out, JSON.stringify(results, null, 2));
process.exit(0);
