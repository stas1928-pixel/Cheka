/* ---------------------------------------------------------------
   Study a Chess.com player's games in our two openings and list the
   positions where they lose the most. Same logic the app runs on the
   phone (js/weakness.js), driven from the command line with Node's
   Stockfish so a big batch can run on the PC.

     node tools/analyse-games.mjs <username> [months] [depth] [maxGames] [out.json]
--------------------------------------------------------------- */
import fs from 'node:fs';
import { createNodeEngine } from './nodeEngine.mjs';
import { OPENINGS } from '../js/repertoire.js';
import { importGames, parseMoves, userSide, matchesOpening } from '../js/chesscom.js';
import { analyseGames } from '../js/weakness.js';
import { moveLabel, formatMoves } from '../js/tree.js';

const [,, username, monthsArg = '6', depthArg = '12', maxArg = '200', out] = process.argv;
if (!username) { console.error('usage: node tools/analyse-games.mjs <username> [months] [depth] [maxGames] [out.json]'); process.exit(1); }
const months = Number(monthsArg), depth = Number(depthArg), maxGames = Number(maxArg);

const raw = await importGames(username, { months, onProgress: (d, t) => console.error(`month ${d}/${t}`) });
const games = [];
for (const g of raw) {
  const side = userSide(g, username);
  if (!side) continue;
  const sans = parseMoves(g.pgn);
  const opening = OPENINGS.find((o) => matchesOpening(sans, side, o));
  if (!opening) continue;
  games.push({ sans, side, url: g.url, openingId: opening.id, result: g[side === 'w' ? 'white' : 'black'].result });
}
console.error(`${games.length} games in our openings (of ${raw.length}); analysing up to ${maxGames} at depth ${depth}`);

const engine = await createNodeEngine({ defaultDepth: depth });
const t0 = Date.now();
const weaknesses = await analyseGames(games.slice(0, maxGames), (s, o) => engine.evaluate(s, o), {
  depth,
  onProgress: (d, t) => { if (d % 10 === 0 || d === t) console.error(`  ${d}/${t} games, ${Math.round((Date.now() - t0) / 1000)} s`); },
});
engine.stop();

console.log(`\n${weaknesses.length} distinct blunder positions in ${games.length} games\n`);
for (const w of weaknesses.slice(0, 25)) {
  const played = Object.entries(w.played).map(([san, n]) => `${san}×${n}`).join(', ');
  console.log(`${w.openingId.padEnd(9)} ${String(w.count).padStart(2)}× avg -${(w.avgDrop / 100).toFixed(1)}  ${moveLabel(w.ply, w.best).padEnd(9)} instead of ${played}`);
  console.log(`          ${w.fen}`);
  console.log(`          ${w.urls[0] ?? ''}`);
}
if (out) fs.writeFileSync(out, JSON.stringify({ username, months, depth, games: games.length, weaknesses }, null, 2));
process.exit(0);
