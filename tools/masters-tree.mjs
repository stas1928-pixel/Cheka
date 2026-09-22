/* ---------------------------------------------------------------
   Masters tree: what strong players actually play, with the games.

     node tools/masters-tree.mjs <uci-root> <ourSide w|b> [minGames] [maxPlies] > out.json

   Walks the Lichess MASTERS explorer from a root position:
   - at OUR nodes: follow the most-played master move (one move per
     position = a repertoire);
   - at OPPONENT nodes: branch into every reply with >= minGames games
     (and >= 5% share), so real variations appear;
   - stop a branch when the node has < minGames games or maxPlies reached.
   For every leaf it records the whole line, game counts per node, the
   ECO/opening name Lichess gives the deepest named node, and up to three
   top master games (players, ratings, year, Lichess game id).
   Read-only research. Nothing in the app changes.
--------------------------------------------------------------- */
import fs from 'node:fs';
import { Chess } from '../vendor/chess.js';

const [,, rootUci, side, minGamesArg = '30', maxPliesArg = '22'] = process.argv;
if (!rootUci || !side) { console.error('usage: node tools/masters-tree.mjs <uci,uci,…> <w|b> [minGames] [maxPlies]'); process.exit(1); }
const MIN = Number(minGamesArg), MAX = Number(maxPliesArg);
const TOKEN = fs.readFileSync('.env', 'utf8').match(/lip_[A-Za-z0-9]+/)?.[0];
if (!TOKEN) { console.error('no token in .env'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();
async function node(uciList) {
  const key = uciList.join(',');
  if (cache.has(key)) return cache.get(key);
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://explorer.lichess.ovh/masters?play=${key}&moves=8&topGames=3`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (res.status === 429) { await sleep(60000); continue; }
    if (!res.ok) throw new Error(`${res.status} at ${key}`);
    const d = await res.json();
    const total = d.white + d.draws + d.black;
    const out = {
      total, opening: d.opening?.name ?? null,
      moves: d.moves.map((m) => ({ uci: m.uci, san: m.san, games: m.white + m.draws + m.black, white: m.white, draws: m.draws, black: m.black })),
      topGames: (d.topGames ?? []).map((g) => ({ id: g.id, white: g.white?.name, black: g.black?.name, wr: g.white?.rating, br: g.black?.rating, year: g.year, winner: g.winner ?? 'draw' })),
    };
    cache.set(key, out);
    await sleep(400);
    return out;
  }
  throw new Error('rate limited');
}

const isOur = (ply) => (ply % 2 === 0) === (side === 'w');
const leaves = [];
let requests = 0;

async function walk(uci, sans, path) {
  const n = await node(uci); requests++;
  const ply = uci.length;
  const here = { ply, san: sans.at(-1) ?? null, games: n.total, opening: n.opening, topGames: n.topGames };
  const trail = [...path, here];
  if (n.total < MIN || ply >= MAX || n.moves.length === 0) { leaves.push({ sans, trail }); return; }
  const g = new Chess(); for (const s of sans) g.move(s);
  if (isOur(ply)) {
    const top = n.moves[0];
    if (top.games < MIN) { leaves.push({ sans, trail }); return; }
    await walk([...uci, top.uci], [...sans, top.san], trail);
  } else {
    const picks = n.moves.filter((m) => m.games >= MIN && m.games / n.total >= 0.05);
    if (picks.length === 0) { leaves.push({ sans, trail }); return; }
    for (const m of picks) await walk([...uci, m.uci], [...sans, m.san], trail);
  }
}

// root SANs from UCI
const g0 = new Chess(); const rootSans = [];
for (const u of rootUci.split(',')) { const m = g0.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }); rootSans.push(m.san); }
console.error(`root: ${rootSans.join(' ')} | our side ${side} | minGames ${MIN} | maxPlies ${MAX}`);
await walk(rootUci.split(','), rootSans, []);
console.error(`${leaves.length} leaves from ${requests} requests`);
console.log(JSON.stringify({ root: rootSans, side, minGames: MIN, maxPlies: MAX, generated: new Date().toISOString().slice(0, 10), leaves }, null, 1));
