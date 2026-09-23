/* Render tools/human-tree.mjs output as one line per leaf, with provenance per ply.
     node tools/tree-leaves.mjs tree.json [filter-prefix-regex]                          */
import fs from 'node:fs';
const t = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const re = process.argv[3] ? new RegExp(process.argv[3]) : null;
for (const leaf of t.leaves) {
  const tail = leaf.sans.slice(t.root.length).join(' ');
  if (re && !re.test(tail)) continue;
  const prov = leaf.trail.map((x) => x.by === 'club'
    ? `${x.san}(${x.amateurShare}%${x.mastersGames ? `,m${x.mastersGames}` : ''})`
    : `${x.san}[${x.by === 'masters' ? 'M' : 'S'}${x.games}/${x.of}]`).join(' ');
  console.log(`${String(leaf.sans.length).padStart(2)} ${leaf.stop.padEnd(8)} ${prov}`);
}
