/* ---------------------------------------------------------------
   Audit: for every shipped line, which moves are human theory (from the
   seed, with sources) and which were added by the engine (extendTo).

     node tools/audit-repertoire.mjs > docs/AUDIT.md

   Reads tools/repertoire.seed.mjs (theory part, sources) and
   js/repertoire.data.js (what actually ships, after extension).
   Nothing is changed.
--------------------------------------------------------------- */
import { SEED } from './repertoire.seed.mjs';
import DATA from '../js/repertoire.data.js';
import { moveLabel } from '../js/tree.js';

const SOURCE_NAMES = {
  'W-Scotch': 'Wikipedia: Scotch Game (cites Wells 1998, Lane 1993, Dembo & Palliser 2011)',
  'W-MaxL': 'Wikipedia: Max Lange Attack',
  'W-Eleph': 'Wikipedia: Elephant Gambit (de Firmian; Tal–Lutikov 1964)',
  CD: 'chessdoctrine.com — Scotch Gambit variations & traps',
  CM: 'chessmood.com — "Refute the Elephant Gambit"',
  CB: 'chessable.com blog — Elephant Gambit guide',
  Lichess: 'Lichess explorer (masters + amateur 1400-1800), frequencies only',
  Games: "stas1928's own Chess.com games (which opponent moves occur)",
  SF: 'Stockfish 18 — engine-chosen move(s)',
};

const fmt = (sans, from = 0) => sans.slice(from).map((s, i) => moveLabel(from + i, s)).join(' ');

console.log(`# Repertoire audit — ${new Date().toISOString().slice(0, 10)}\n`);
console.log('For each shipped line: how many of its moves come from the hand-written seed (theory, with sources) and how many were appended by Stockfish. "Theory" here means the seed author typed the move citing a source — it says nothing about the source\'s quality; see the source list at the end.\n');

let totals = { lines: 0, seedPlies: 0, enginePlies: 0, engineOnlyAfterDev: 0 };
for (const o of SEED) {
  const shipped = DATA.find((d) => d.id === o.id);
  console.log(`## ${o.name} (${o.side === 'w' ? 'White' : 'Black'})\n`);
  console.log('| line | tag | theory moves (seed) | engine moves | theory ends at | sources | verdict |');
  console.log('|---|---|---|---|---|---|---|');
  for (const l of o.lines) {
    const s = shipped.lines.find((x) => x.id === l.id);
    const seedLen = l.moves.length;
    const shipLen = s.moves.length;
    const eng = shipLen - seedLen;
    let dev = null;
    for (let i = 0; i < l.moves.length; i++) if (o.lines[0].moves[i] !== l.moves[i]) { dev = i; break; }
    const theoryAfterDev = dev === null ? seedLen - o.signaturePlies : seedLen - dev - 1;   // our replies typed by hand after the deviation
    const humanSources = (l.sources ?? []).filter((x) => x !== 'SF' && x !== 'Games' && x !== 'Lichess');
    let verdict;
    if (eng === 0 && humanSources.length) verdict = 'theory throughout';
    else if (theoryAfterDev <= 1) verdict = `**engine line** — only the deviation ${dev !== null ? moveLabel(dev, l.moves[dev]) : ''} and ${theoryAfterDev} reply are human`;
    else if (eng > 0) verdict = `theory to ${moveLabel(seedLen - 1, l.moves[seedLen - 1])}, engine after`;
    else verdict = 'hand-written, database-sourced';
    totals.lines++; totals.seedPlies += seedLen; totals.enginePlies += eng; if (theoryAfterDev <= 1) totals.engineOnlyAfterDev++;
    console.log(`| ${l.id} | ${l.kind}${l.claim ? ' (trap/punish)' : ''} | ${seedLen} | ${eng} | ${moveLabel(seedLen - 1, l.moves[seedLen - 1])} | ${(l.sources ?? []).join(', ')} | ${verdict} |`);
  }
  console.log('');
  console.log('### Move-by-move\n');
  for (const l of o.lines) {
    const s = shipped.lines.find((x) => x.id === l.id);
    const seedLen = l.moves.length;
    console.log(`- **${l.id}** — ${l.name}`);
    console.log(`  - theory: \`${fmt(l.moves, o.signaturePlies)}\``);
    if (s.moves.length > seedLen) console.log(`  - engine: \`${fmt(s.moves, seedLen)}\``);
  }
  console.log('');
}
console.log('## Totals\n');
console.log(`- lines: ${totals.lines}`);
console.log(`- seed (human) plies: ${totals.seedPlies}; engine plies: ${totals.enginePlies} (${Math.round(100 * totals.enginePlies / (totals.seedPlies + totals.enginePlies))}% of shipped moves)`);
console.log(`- lines where the human part after the deviation is one reply or less: **${totals.engineOnlyAfterDev} of ${totals.lines}** — these are the ones that feel "bot-like"\n`);
console.log('## Source keys\n');
for (const [k, v] of Object.entries(SOURCE_NAMES)) console.log(`- **${k}** — ${v}`);
