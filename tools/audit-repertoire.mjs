/* ---------------------------------------------------------------
   Audit: for every shipped line, where each move comes from.

     node tools/audit-repertoire.mjs > docs/AUDIT.md

   Reads tools/repertoire.seed.mjs (the selection resolved against
   library/lines.mjs) and js/repertoire.data.js (what ships). Since the
   rebuild the two must be identical move for move: the audit proves it
   and reports the engine-ply count (expected 0). Nothing is changed.
--------------------------------------------------------------- */
import { SEED, SOURCES } from './repertoire.seed.mjs';
import { LIBRARY } from '../library/lines.mjs';
import DATA from '../js/repertoire.data.js';
import { moveLabel } from '../js/tree.js';

const fmt = (sans, from = 0) => sans.slice(from).map((s, i) => moveLabel(from + i, s)).join(' ');
const W = { A: 'A theory', B: 'B known', C: 'C community', E: 'E engine' };

console.log(`# Repertoire audit — ${new Date().toISOString().slice(0, 10)}\n`);
console.log('Every drilled line is a library line selected by id (`tools/repertoire.seed.mjs`); the data file must carry exactly the library’s sourced moves. "Engine plies" counts moves in the shipped data that are not in the library line — the rebuild rule is that this is **0** everywhere. Weight A = book / MCO / master practice; B = course, titled player on video, cited Wikipedia, strong-online-player practice; C = community (allowed for side/trap/surprise lines only). For side/trap lines the table shows the opponent’s mistake with the share of Lichess 1400-1800 players who play it (must be ≥ 10% of ≥ 200 games), the engine swing it causes (≥ +1.0; side ≥ +0.5) and the final eval (≥ +1.5; side ≥ +1.0). Surprise lines are OUR alternatives, drilled apart from the main repertoire. Provenance quotes the library note, which says which source covers which segment.\n');

const totals = { lines: 0, plies: 0, enginePlies: 0, mismatched: 0, byWeight: { A: 0, B: 0, C: 0 }, byKind: { main: 0, side: 0, trap: 0, surprise: 0 } };
for (const o of SEED) {
  const shipped = DATA.find((d) => d.id === o.id);
  const lib = LIBRARY.find((l) => l.id === o.id);
  console.log(`## ${o.name} (${o.side === 'w' ? 'White' : 'Black'}) — ${o.lines.length} lines\n`);
  console.log('| app id | library id | kind | weight | plies | ours after deviation | engine plies | mistake: club share / swing / end | sources | plan (basis) |');
  console.log('|---|---|---|---|---|---|---|---|---|---|');
  for (const l of [...o.lines, ...(o.surprise ?? [])]) {
    const s = shipped?.lines.find((x) => x.id === l.id) ?? shipped?.surprise?.find((x) => x.id === l.id);
    const same = s && s.moves.length === l.moves.length && s.moves.every((m, i) => m === l.moves[i]);
    const eng = s ? Math.max(0, s.moves.length - l.moves.length) : 0;
    let dev = null;
    for (let i = 0; i < l.moves.length; i++) if (o.lines[0].moves[i] !== l.moves[i]) { dev = i; break; }
    let ours = 0;
    for (let p = (dev ?? o.signaturePlies - 1) + 1; p < l.moves.length; p++) if ((p % 2 === 0) === (o.side === 'w')) ours++;
    totals.lines++; totals.plies += l.moves.length; totals.enginePlies += eng; if (!same) totals.mismatched++;
    totals.byWeight[l.weight] = (totals.byWeight[l.weight] ?? 0) + 1; totals.byKind[l.kind] = (totals.byKind[l.kind] ?? 0) + 1;
    const mist = l.kind === 'main' || l.kind === 'surprise' ? '' : `${moveLabel(l.mistakeAt, l.moves[l.mistakeAt])}: ${s?.club ? `${s.club.share}% of ${s.club.games.toLocaleString()}` : '?'} / ${s?.swing != null ? '+' + (s.swing / 100).toFixed(1) : '?'} / ${s ? '+' + (s.cp / 100).toFixed(1) : '?'}`;
    console.log(`| ${l.id} | ${l.libraryId} | ${l.kind} | ${W[l.weight]} | ${l.moves.length} | ${ours} | ${same ? '0' : `**${eng} / MISMATCH**`} | ${mist} | ${l.sources.join(', ')} | ${l.planSources.join(', ')} (${l.planBasis}) |`);
  }
  console.log('\n### Move-by-move provenance\n');
  for (const l of [...o.lines, ...(o.surprise ?? [])]) {
    const libLine = lib.lines.find((x) => x.id === l.libraryId);
    console.log(`- **${l.id}** — ${l.name}`);
    console.log(`  - moves: \`${fmt(l.moves, o.signaturePlies)}\``);
    console.log(`  - provenance: ${libLine.note}`);
    console.log(`  - plan (${l.planBasis} — ${l.planSources.join(', ')}): ${l.plan}`);
  }
  console.log('');
}
console.log('## Totals\n');
console.log(`- lines: ${totals.lines} (main ${totals.byKind.main}, side ${totals.byKind.side}, trap ${totals.byKind.trap}, surprise ${totals.byKind.surprise}); weight A ${totals.byWeight.A}, B ${totals.byWeight.B}, C ${totals.byWeight.C}`);
console.log(`- sourced plies: ${totals.plies}; engine plies: **${totals.enginePlies}**; lines whose shipped moves differ from the library: **${totals.mismatched}**\n`);
console.log('## Not drilled, and why\n');
console.log('Library lines of weight A/B that are NOT selected, with the reason (conflicting alternative, too short to drill without engine padding, unsound, or a different repertoire choice):\n');
const selected = new Set(SEED.flatMap((o) => [...o.lines, ...(o.surprise ?? [])].map((l) => l.libraryId)));
for (const o of LIBRARY) for (const l of o.lines) {
  if (selected.has(l.id) || !['A', 'B'].includes(l.weight)) continue;
  console.log(`- **${o.id}/${l.id}** (${l.kind}, ${l.weight}) — ${l.name}`);
}
console.log('\n## Source keys\n');
for (const [k, v] of Object.entries(SOURCES)) console.log(`- **${k}** (${v.type}) — ${v.ref}${v.url ? ` — ${v.url}` : ''}`);
