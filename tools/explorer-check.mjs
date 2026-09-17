/* ---------------------------------------------------------------
   Cross-check the curated seed against the Lichess opening explorer.

     node tools/explorer-check.mjs [minSharePct] > report.md

   Reads LICHESS_TOKEN from .env (git-ignored). For every OPPONENT node in
   every seed line it asks two databases:
     masters  — what strong players do (theory check)
     lichess  — blitz+rapid 1400-1800, the population the owner faces
   and reports, per opening:
     MISSING  an opponent reply with >= minSharePct% share (amateur) that no
              seed line covers — a candidate new line
     RARE     a seed line whose defining opponent move has < 2% share in
              both databases — a candidate to drop or demote
     PREFER   inside a line, an opponent move where the amateur top move
              (>= 40% share) differs from the seed — the seed's move is what
              the engine wants, the amateur move is what people play
   Nothing is changed automatically; the seed stays a human decision.
--------------------------------------------------------------- */
import fs from 'node:fs';
import { Chess } from '../vendor/chess.js';
import { SEED } from './repertoire.seed.mjs';
import { moveLabel } from '../js/tree.js';

const MIN_SHARE = Number(process.argv[2] ?? 8);
// Accept "LICHESS_TOKEN=lip_…", "lichess: lip_…", or a bare token anywhere in .env.
const TOKEN = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8').match(/lip_[A-Za-z0-9]+/)?.[0] : null;
if (!TOKEN) { console.error('No Lichess token (lip_…) found in .env'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();
async function explorer(db, sans) {
  const key = `${db}|${sans.join(' ')}`;
  if (cache.has(key)) return cache.get(key);
  const g = new Chess();
  const uci = sans.map((s) => { const m = g.move(s); return m.from + m.to + (m.promotion ?? ''); }).join(',');
  const base = db === 'masters'
    ? 'https://explorer.lichess.ovh/masters?'
    : 'https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid&ratings=1400,1600,1800&';
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${base}play=${uci}&moves=12&topGames=0`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } });
    if (res.status === 429) { await sleep(60000); continue; }
    if (!res.ok) throw new Error(`${res.status} from ${db} for ${sans.join(' ')}`);
    const d = await res.json();
    const total = d.white + d.draws + d.black;
    const out = { total, opening: d.opening?.name, moves: d.moves.map((m) => ({ san: m.san, games: m.white + m.draws + m.black, share: total ? Math.round(1000 * (m.white + m.draws + m.black) / total) / 10 : 0 })) };
    cache.set(key, out);
    await sleep(350);
    return out;
  }
  throw new Error('rate limited');
}

const isOurPly = (side, ply) => (ply % 2 === 0) === (side === 'w');

console.log(`# Explorer cross-check (${new Date().toISOString().slice(0, 10)}), threshold ${MIN_SHARE}% amateur share\n`);
for (const o of SEED) {
  console.log(`## ${o.name}\n`);
  const covered = new Map(); // prefix -> Set(next opponent moves covered)
  for (const l of o.lines) for (let i = 0; i < l.moves.length; i++) {
    if (isOurPly(o.side, i)) continue;
    const k = l.moves.slice(0, i).join(' ');
    if (!covered.has(k)) covered.set(k, new Set());
    covered.get(k).add(l.moves[i]);
  }
  // Only nodes reached by at least the signature: root prefixes shared by lines.
  const nodes = [...covered.keys()].filter((k) => k.split(' ').length >= o.signaturePlies).sort((a, b) => a.length - b.length);

  console.log('### Missing popular replies\n');
  for (const k of nodes) {
    const prefix = k ? k.split(' ') : [];
    let am, ma;
    try { am = await explorer('lichess', prefix); ma = await explorer('masters', prefix); } catch (e) { console.log(`- (${e.message})`); continue; }
    if (am.total < 500) continue;                               // too thin to matter
    for (const m of am.moves) {
      if (m.share >= MIN_SHARE && !covered.get(k).has(m.san)) {
        const mm = ma.moves.find((x) => x.san === m.san);
        console.log(`- MISSING after \`${prefix.join(' ')}\`: **${moveLabel(prefix.length, m.san)}** — amateur ${m.share}% (${m.games.toLocaleString()} games), masters ${mm ? mm.share + '%' : '—'}${am.opening ? ` · ${am.opening}` : ''}`);
      }
    }
  }

  console.log('\n### Seed lines by real-world frequency\n');
  console.log('| line | defining move | amateur share | masters share | verdict |\n|---|---|---|---|---|');
  for (const l of o.lines) {
    let dev = null;
    for (let i = 0; i < l.moves.length; i++) if (o.lines[0].moves[i] !== l.moves[i]) { dev = i; break; }
    const ply = dev ?? (() => { let p = o.signaturePlies; while (isOurPly(o.side, p)) p++; return p; })();
    const prefix = l.moves.slice(0, ply);
    const move = l.moves[ply];
    let am, ma;
    try { am = await explorer('lichess', prefix); ma = await explorer('masters', prefix); } catch (e) { console.log(`| ${l.id} | ${moveLabel(ply, move)} | ? | ? | ${e.message} |`); continue; }
    const a = am.moves.find((x) => x.san === move)?.share ?? 0;
    const m = ma.moves.find((x) => x.san === move)?.share ?? 0;
    const verdict = a < 2 && m < 2 ? 'RARE — consider dropping' : a >= 25 ? 'core' : 'fine';
    console.log(`| ${l.id} | ${moveLabel(ply, move)} | ${a}% | ${m}% | ${verdict} |`);
  }

  console.log('\n### Opponent moves inside lines vs what amateurs actually play\n');
  for (const l of o.lines) {
    let dev = null;
    for (let i = 0; i < l.moves.length; i++) if (o.lines[0].moves[i] !== l.moves[i]) { dev = i; break; }
    for (let i = o.signaturePlies; i < l.moves.length; i++) {
      if (isOurPly(o.side, i) || i === dev) continue;   // the deviation itself is the point of the line
      const prefix = l.moves.slice(0, i);
      let am;
      try { am = await explorer('lichess', prefix); } catch { continue; }
      if (am.total < 300) break;                                 // beyond the data, stop this line
      const top = am.moves[0];
      if (top && top.san !== l.moves[i] && top.share >= 40) {
        console.log(`- PREFER in \`${l.id}\` at ${moveLabel(i, l.moves[i])}: amateurs play **${top.san}** ${top.share}% (${top.games.toLocaleString()} games)`);
      }
    }
  }
  console.log('');
}
