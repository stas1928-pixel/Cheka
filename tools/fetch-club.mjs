/* ---------------------------------------------------------------
   Fetch (and cache) the club / strong-player frequencies the verifier
   needs: for every selected side/trap line, the position before the
   opponent's mistake. Prints a small report so the "is this mistake
   common, and not a stupid blunder?" question can be answered from data.

     node tools/fetch-club.mjs

   Needs the Lichess token in .env only for positions not yet cached in
   library/explorer-cache.json.
--------------------------------------------------------------- */
import { SEED } from './repertoire.seed.mjs';
import { node, saveCache } from './explorer-cache.mjs';
import { moveLabel } from '../js/tree.js';

for (const o of SEED) {
  for (const l of o.lines) {
    if (!Number.isInteger(l.mistakeAt)) continue;
    const prefix = l.moves.slice(0, l.mistakeAt);
    const san = l.moves[l.mistakeAt];
    const am = await node('amateur', prefix);
    const st = await node('strong', prefix);
    const a = am?.moves.find((m) => m.san === san);
    const s = st?.moves.find((m) => m.san === san);
    console.log(`${o.id}/${l.id.padEnd(16)} ${moveLabel(l.mistakeAt, san).padEnd(10)} club ${a ? `${a.share}% (${a.games}/${am.total})` : `— (${am?.total ?? 0} games)`}  strong ${s ? `${s.share}% (${s.games}/${st.total})` : `— (${st?.total ?? 0} games)`}  club top: ${am?.moves.slice(0, 3).map((m) => `${m.san} ${m.share}%`).join(', ') ?? ''}`);
  }
}
saveCache();
