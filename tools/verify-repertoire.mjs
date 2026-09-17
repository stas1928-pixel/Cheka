/* ---------------------------------------------------------------
   Verify a hand-curated repertoire seed with Stockfish and emit the
   data file the app loads.

     node tools/verify-repertoire.mjs [depth] > js/repertoire.data.js

   Input: tools/repertoire.seed.mjs — openings with named lines, each
   with `moves` (SAN), `kind` ('main' | 'side'), `sources`, optional
   `claim` (what the line is supposed to achieve, for side lines).

   For every line the engine evaluates the position after each of OUR
   moves. The report (stderr) flags:
     - DROP: one of our moves loses >= 0.5 vs the engine's best
     - SIDE?: a side line whose final eval is < +0.5 for us (no punishment)
     - REPEAT: a position seen in another line where we play differently
   The output (stdout) is the data file: lines carry `cp` (final eval,
   our view) and `evals` per our move so the app can show them.
--------------------------------------------------------------- */
import { createNodeEngine } from './nodeEngine.mjs';
import { SEED } from './repertoire.seed.mjs';
import { fromUserPov } from '../js/branchBuilder.js';
import { moveLabel } from '../js/tree.js';
import { Chess } from '../vendor/chess.js';

const DEPTH = Number(process.argv[2] ?? 18);
const engine = await createNodeEngine({ defaultDepth: DEPTH });
const cache = new Map();
async function ev(sans) {
  const k = sans.join(' ');
  if (!cache.has(k)) cache.set(k, await engine.evaluate(sans, { depth: DEPTH }));
  return cache.get(k);
}
const isOurPly = (side, ply) => (ply % 2 === 0) === (side === 'w');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Pre-pass: every seed move legal and in canonical SAN, all lines at once.
let bad = 0;
for (const o of SEED) for (const l of o.lines) {
  const g = new Chess();
  for (const san of l.moves) {
    let m;
    try { m = g.move(san); } catch { console.error(`  ILLEGAL ${o.id}/${l.name}: ${san} after ${g.history().join(' ')}`); bad++; break; }
    if (m.san !== san) { console.error(`  SAN ${o.id}/${l.name}: write "${m.san}" not "${san}"`); bad++; break; }
  }
}
if (bad) { console.error(`${bad} seed problem(s) — fix the seed first`); process.exit(1); }

const out = [];
let flags = 0;
for (const o of SEED) {
  console.error(`\n== ${o.name}`);
  let trunk = o.lines[0].moves;
  const seenOurMoves = new Map();
  const lines = [];
  for (const l of o.lines) {
    // legality + canonical SAN
    const g = new Chess();
    for (const san of l.moves) {
      let m;
      try { m = g.move(san); } catch { console.error(`  ILLEGAL ${l.name}: ${san}`); process.exit(1); }
      if (m.san !== san) { console.error(`  SAN ${l.name}: write "${m.san}" not "${san}"`); process.exit(1); }
    }
    // Extend with engine best play for both sides where the theory stops short.
    const moves = l.moves.slice();
    while (l.extendTo && moves.length < l.extendTo) {
      const r = await ev(moves);
      if (!r.bestMove) break;
      moves.push(r.bestMove);
    }
    l.moves = moves;
    if (l === o.lines[0]) trunk = moves;   // the trunk may have been extended too

    // deviation from trunk
    let dev = null;
    for (let i = 0; i < l.moves.length; i++) if (trunk[i] !== l.moves[i]) { dev = i; break; }
    if (dev !== null && isOurPly(o.side, dev)) { console.error(`  BAD ${l.name}: deviates at OUR ply ${dev}`); process.exit(1); }

    const evals = [];
    const notes = [];
    for (let ply = 0; ply < l.moves.length; ply++) {
      const prefix = l.moves.slice(0, ply);
      if (!isOurPly(o.side, ply)) continue;
      const key = prefix.join(' ');
      if (seenOurMoves.has(key) && seenOurMoves.get(key) !== l.moves[ply]) {
        console.error(`  REPEAT ${l.name}: after "${key}" plays ${l.moves[ply]} but another line plays ${seenOurMoves.get(key)}`); flags++;
      }
      seenOurMoves.set(key, l.moves[ply]);
      const before = await ev(prefix);
      const after = await ev([...prefix, l.moves[ply]]);
      const cpBefore = fromUserPov(before.cp ?? 0, o.side);
      const cpAfter = fromUserPov(after.cp ?? 0, o.side);
      evals.push({ ply, san: l.moves[ply], cp: Math.round(cpAfter) });
      if (before.bestMove !== l.moves[ply] && cpBefore - cpAfter >= 50) {
        notes.push(`DROP ${moveLabel(ply, l.moves[ply])} -${((cpBefore - cpAfter) / 100).toFixed(2)} (engine ${before.bestMove})`); flags++;
      }
    }
    const final = evals.at(-1)?.cp ?? 0;
    if (l.kind === 'side' && final < (l.minCp ?? 50)) { notes.push(`SIDE? ends at ${(final / 100).toFixed(2)} — no punishment`); flags++; }
    const id = l.id ?? (dev === null ? 'main' : slug(`${moveLabel(dev, l.moves[dev])}-${l.name}`));
    lines.push({ id, name: l.name, kind: l.kind, moves: l.moves, deviatesAt: dev ?? undefined, cp: final, evals, sources: l.sources ?? [], claim: l.claim });
    console.error(`  ${l.kind.padEnd(4)} ${id.padEnd(34)} ${l.moves.length} plies  end ${(final / 100).toFixed(2)}  ${notes.join(' | ')}`);
  }
  out.push({ id: o.id, name: o.name, side: o.side, signaturePlies: o.signaturePlies, lines });
}
engine.stop();
console.error(`\n${flags} flag(s)`);
console.log(`/* GENERATED by tools/verify-repertoire.mjs on ${new Date().toISOString().slice(0, 10)} from tools/repertoire.seed.mjs, Stockfish 18 depth ${DEPTH}.\n   Do not edit by hand: edit the seed, re-run, then adjust js/notes.js. */\nexport default ${JSON.stringify(out, null, 2)};\n`);
process.exit(0);
