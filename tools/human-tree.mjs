/* ---------------------------------------------------------------
   Human-move tree: candidate lines made only of moves strong humans
   actually play, with the counts that prove it. Research tool — output
   is read by a person, who decides what goes into library/lines.mjs.

     node tools/human-tree.mjs <root SAN, space-separated> <w|b> [maxPlies=22] > tree.json

   - OUR node: the masters' most-played move if masters have ≥ 30 games
     there, else the strong-online (Lichess 2200-2500 blitz/rapid) top move
     if it has ≥ 150 games; otherwise the branch stops.
   - OPPONENT node: branch into every club reply (Lichess 1400-1800) with
     ≥ minShare% share (max 2, default 15), plus the masters' top reply;
     stop when the club position has < minClub games (default 3000).
   Each ply records which database chose it and the counts.
--------------------------------------------------------------- */
import { node, saveCache } from './explorer-cache.mjs';

const [, , rootArg, side, maxArg = '22', shareArg = '15', clubArg = '3000'] = process.argv;
const ROOT = rootArg.trim().split(/\s+/);
const MAX = Number(maxArg), MIN_SHARE = Number(shareArg), MIN_CLUB = Number(clubArg), MIN_STRONG = Number(process.env.MIN_STRONG ?? 150);
let visited = 0;
const isOur = (ply) => (ply % 2 === 0) === (side === 'w');
const leaves = [];

async function walk(sans, trail) {
  const ply = sans.length;
  if (ply >= MAX) { leaves.push({ sans, trail, stop: 'maxPlies' }); return; }
  if (isOur(ply)) {
    const ma = await node('masters', sans);
    let pick = null, st = null;
    if (ma && ma.total >= 30 && ma.moves[0]) pick = { san: ma.moves[0].san, by: 'masters', games: ma.moves[0].games, of: ma.total, share: ma.moves[0].share };
    else { st = await node('strong', sans); if (st && st.total >= MIN_STRONG && st.moves[0]) pick = { san: st.moves[0].san, by: 'strong', games: st.moves[0].games, of: st.total, share: st.moves[0].share }; }
    if (!pick) { leaves.push({ sans, trail, stop: 'thin' }); return; }
    await walk([...sans, pick.san], [...trail, { ply, ...pick, opening: ma?.opening ?? st?.opening }]);
  } else {
    const am = await node('amateur', sans);
    if (!am || am.total < MIN_CLUB) { leaves.push({ sans, trail, stop: 'thin' }); return; }
    const ma = await node('masters', sans);
    const st = null;
    const picks = new Map();
    for (const m of (am?.moves ?? []).filter((m) => m.share >= MIN_SHARE).slice(0, 2)) picks.set(m.san, m);
    if (ma?.total >= 30 && ma.moves[0] && !picks.has(ma.moves[0].san)) picks.set(ma.moves[0].san, am?.moves.find((x) => x.san === ma.moves[0].san) ?? { san: ma.moves[0].san, share: 0, games: 0 });
    if (!picks.size) { leaves.push({ sans, trail, stop: 'noReply' }); return; }
    for (const [san, m] of picks) {
      const mm = ma?.moves.find((x) => x.san === san);
      const sm = st?.moves.find((x) => x.san === san);
      await walk([...sans, san], [...trail, { ply, san, by: 'club', amateurShare: m.share, amateurGames: m.games, mastersGames: mm?.games ?? 0, strongShare: sm?.share ?? 0 }]);
    }
  }
  if (++visited % 10 === 0) { saveCache(); console.error(`${new Date().toISOString().slice(11, 19)} ${visited} nodes, ${leaves.length} leaves, at ${sans.slice(ROOT.length).join(' ')}`); }
}

await walk(ROOT, []);
saveCache();
console.log(JSON.stringify({ root: ROOT, side, max: MAX, generated: new Date().toISOString().slice(0, 10), leaves }, null, 1));
console.error(`${leaves.length} leaves`);
