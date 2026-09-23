/* Print what the three explorer databases say after a position (cache only unless --fetch).
     node tools/peek.mjs "e4 e5 Nf3 d5 exd5 e4 Qe2" [--fetch]                          */
import { node, cached, saveCache } from './explorer-cache.mjs';

const fetchOk = process.argv.includes('--fetch');
const sans = process.argv[2].trim().split(/\s+/);
for (const db of ['masters', 'strong', 'amateur']) {
  const n = fetchOk ? await node(db, sans) : cached(db, sans);
  console.log(`${db.padEnd(8)} ${n ? `${n.total.toLocaleString().padStart(9)} games  ${n.moves.slice(0, 6).map((m) => `${m.san} ${m.share}% (${m.games})`).join(', ')}  ${n.opening ?? ''}` : 'not cached'}`);
}
if (fetchOk) saveCache();
