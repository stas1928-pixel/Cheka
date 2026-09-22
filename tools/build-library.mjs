/* ---------------------------------------------------------------
   Render library/lines.mjs to docs/LIBRARY.md, annotating each line with
   the Lichess MASTERS database: how many master games reach the end of
   the line, the top move there, and up to two example games. Also
   appends the masters' own tree (tools/masters-tree.mjs output) so the
   reader can compare "what books say" with "what masters play".

     node tools/build-library.mjs [scotch-tree.json] [elephant-tree.json] > docs/LIBRARY.md

   Needs the Lichess token in .env for the annotations; without it the
   document is still produced, minus the masters columns.
--------------------------------------------------------------- */
import fs from 'node:fs';
import { Chess } from '../vendor/chess.js';
import { LIBRARY, SOURCES } from '../library/lines.mjs';
import { moveLabel } from '../js/tree.js';

const TOKEN = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8').match(/lip_[A-Za-z0-9]+/)?.[0] : null;
const CACHE_FILE = 'library/masters-cache.json';
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function masters(sans) {
  const key = sans.join(' ');
  if (cache[key]) return cache[key];
  if (!TOKEN) return null;
  const g = new Chess();
  const uci = sans.map((s) => { const m = g.move(s); return m.from + m.to + (m.promotion ?? ''); }).join(',');
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://explorer.lichess.ovh/masters?play=${uci}&moves=3&topGames=2`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (res.status === 429) { await sleep(60000); continue; }
    if (!res.ok) return null;
    const d = await res.json();
    cache[key] = {
      total: d.white + d.draws + d.black, opening: d.opening?.name ?? null,
      top: d.moves.slice(0, 3).map((m) => `${m.san} ${m.white + m.draws + m.black}`),
      games: (d.topGames ?? []).map((t) => `${t.white?.name} – ${t.black?.name} (${t.year}${t.winner ? ', ' + (t.winner === 'white' ? '1-0' : t.winner === 'black' ? '0-1' : '½') : ''})`),
    };
    await sleep(400);
    return cache[key];
  }
  return null;
}

const fmt = (sans, from = 0) => sans.slice(from).map((s, i) => moveLabel(from + i, s)).join(' ');
const W = { A: 'A — theory (book / MCO / masters practice)', B: 'B — known (course, titled-player video, cited Wikipedia)', C: 'C — community (Lichess study, forum)', E: 'E — engine only' };
const K = { main: 'Main lines (sound opponent choices you must know)', alt: 'Alternatives to recognise (theory, but not our move or not recommended)', side: 'Side lines (inferior opponent moves with a known answer)', trap: 'Traps (forcing tricks that need the opponent to cooperate)' };

const out = [];
out.push(`# Line library — Scotch Gambit (White) and Elephant Gambit (Black)\n`);
out.push(`Generated ${new Date().toISOString().slice(0, 10)} from \`library/lines.mjs\` by \`tools/build-library.mjs\`. Research only: nothing here is drilled until it is copied into \`tools/repertoire.seed.mjs\`.\n`);
out.push(`**Weight** says how much a line can be trusted:\n\n${Object.values(W).map((w) => `- ${w}`).join('\n')}\n`);
out.push(`**Masters** = number of OTB master games (Lichess masters DB) that reach the END of the quoted moves; "top" = what masters play next. A line with 0 master games at its end is club practice or a trap, whatever its source says.\n`);

for (const o of LIBRARY) {
  out.push(`\n## ${o.name} (you play ${o.side === 'w' ? 'White' : 'Black'})\n`);
  out.push(`Root: \`${fmt(o.root)}\`\n`);
  for (const kind of ['main', 'alt', 'side', 'trap']) {
    const lines = o.lines.filter((l) => l.kind === kind).sort((a, b) => a.weight.localeCompare(b.weight));
    if (!lines.length) continue;
    out.push(`\n### ${K[kind]}\n`);
    out.push('| # | line | weight | moves (theory part in bold) | masters at end | top reply | example games | sources |');
    out.push('|---|---|---|---|---|---|---|---|');
    let n = 0;
    for (const l of lines) {
      n++;
      const m = await masters(l.moves);
      const theory = l.moves.slice(o.root.length, l.theoryTo);
      const tail = l.moves.slice(l.theoryTo);
      const movesTxt = `**${fmt(l.moves, o.root.length).split(' ').slice(0, theory.length).join(' ')}**${tail.length ? ' ' + fmt(l.moves, l.theoryTo) : ''}`;
      const src = l.sources.map((s) => `[${s}](#src-${s})`).join(', ');
      out.push(`| ${n} | **${l.name}** | ${l.weight} | ${movesTxt} | ${m ? m.total.toLocaleString() : '?'} | ${m?.top?.[0] ?? ''} | ${m?.games?.join('; ') ?? ''} | ${src} |`);
    }
    out.push('');
    for (const l of lines) out.push(`- **${l.name}** — ${l.note}`);
  }
}

// Masters' own tree
for (const [i, f] of [process.argv[2], process.argv[3]].entries()) {
  if (!f || !fs.existsSync(f)) continue;
  const t = JSON.parse(fs.readFileSync(f, 'utf8'));
  out.push(`\n## What masters actually play: ${fmt(t.root)} (${t.side === 'w' ? 'White' : 'Black'} repertoire, most-played master move at our nodes, every reply with ≥ ${t.minGames} games at theirs)\n`);
  out.push(`Source: Lichess masters database, ${t.generated}. Each row is one branch to the point where fewer than ${t.minGames} master games remain.\n`);
  out.push('| branch (moves after the root) | games at end | opening name | example games |');
  out.push('|---|---|---|---|');
  for (const leaf of t.leaves.sort((a, b) => b.trail.at(-1).games - a.trail.at(-1).games)) {
    const last = leaf.trail.at(-1);
    const named = [...leaf.trail].reverse().find((x) => x.opening)?.opening ?? '';
    const games = (last.topGames ?? []).slice(0, 2).map((g) => `${g.white} – ${g.black} (${g.year}, ${g.winner === 'white' ? '1-0' : g.winner === 'black' ? '0-1' : '½'})`).join('; ');
    out.push(`| ${fmt(leaf.sans, t.root.length)} | ${last.games} | ${named} | ${games} |`);
  }
}

out.push(`\n## Sources\n`);
for (const [k, s] of Object.entries(SOURCES)) out.push(`- <a id="src-${k}"></a>**${k}** (${s.type}) — ${s.ref}${s.url ? ` — ${s.url}` : ''}`);

fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1));
console.log(out.join('\n'));
