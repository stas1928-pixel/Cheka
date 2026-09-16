/* ---------------------------------------------------------------
   WEAKNESSES — find where YOU go wrong in your own games, then drill
   exactly those positions.

   findBlunders() walks one game: at every move of yours (up to `maxPly`)
   it asks the engine for the position before and after the move. If the
   evaluation, seen from your side, drops by `dropCp` or more, that move
   is a blunder: we remember the position (FEN), what you played, what
   the engine wanted, and how much it cost.

   aggregate() merges blunders from many games by position, so a mistake
   you keep repeating rises to the top. Those become "weakness drills":
   the board is set to the position and you must find the engine's move.

   Pure where possible; the engine comes in as `evaluate(sans, {depth})`
   (same contract as js/engine.js), so tests use a scripted one.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';
import { fromUserPov } from './branchBuilder.js';

export const WEAKNESS_DEFAULTS = Object.freeze({
  maxPly: 24,     // only the opening phase (first 12 moves)
  dropCp: 100,    // a full pawn lost = a blunder worth drilling
  depth: 12,
});

/**
 * sans: the game's moves; side: 'w' | 'b' (which colour you had).
 * Returns [{ ply, fen, played, best, cpBefore, cpAfter, drop }] in YOUR view.
 */
export async function findBlunders(sans, side, evaluate, opts = {}) {
  const { maxPly, dropCp, depth } = { ...WEAKNESS_DEFAULTS, ...opts };
  const out = [];
  const game = new Chess();
  const limit = Math.min(sans.length, maxPly);

  for (let ply = 0; ply < limit; ply++) {
    const userMove = (ply % 2 === 0) === (side === 'w');
    if (userMove) {
      const fen = game.fen();
      const before = await evaluate(sans.slice(0, ply), { depth });
      const after = await evaluate(sans.slice(0, ply + 1), { depth });
      const cpBefore = scoreFor(before, side);
      const cpAfter = scoreFor(after, side);
      const drop = cpBefore - cpAfter;
      if (drop >= dropCp && before.bestMove && before.bestMove !== sans[ply]) {
        out.push({ ply, fen, played: sans[ply], best: before.bestMove, cpBefore, cpAfter, drop });
      }
    }
    game.move(sans[ply]);
  }
  return out;
}

/** Centipawns from the user's view; a mate is treated as ±30 pawns. */
export function scoreFor(evaluation, side) {
  if (evaluation.mate !== null && evaluation.mate !== undefined) {
    return fromUserPov(evaluation.mate > 0 ? 3000 : -3000, side);
  }
  return evaluation.cp === null || evaluation.cp === undefined ? 0 : fromUserPov(evaluation.cp, side);
}

/**
 * blunders: [{ ...blunder, url, openingId }] from many games.
 * Returns positions sorted by how much they matter (count × average drop):
 *   [{ fen, side, openingId, best, count, avgDrop, played: { san: n }, urls, ply }]
 */
export function aggregate(blunders) {
  const byFen = new Map();
  for (const b of blunders) {
    const key = b.fen;
    const item = byFen.get(key) ?? {
      fen: b.fen, side: b.side, openingId: b.openingId ?? null, best: b.best, ply: b.ply,
      count: 0, totalDrop: 0, played: {}, urls: [],
    };
    item.count += 1;
    item.totalDrop += b.drop;
    item.played[b.played] = (item.played[b.played] ?? 0) + 1;
    if (b.url && !item.urls.includes(b.url)) item.urls.push(b.url);
    byFen.set(key, item);
  }
  return [...byFen.values()]
    .map(({ totalDrop, ...it }) => ({ ...it, avgDrop: Math.round(totalDrop / it.count) }))
    .sort((a, b) => b.count * b.avgDrop - a.count * a.avgDrop || a.ply - b.ply);
}

/**
 * Analyse many games. `games` are Chess.com game objects already reduced to
 * { sans, side, url, openingId }. Calls onProgress(done, total) per game.
 * Returns the aggregated weakness list.
 */
export async function analyseGames(games, evaluate, { onProgress = () => {}, shouldStop = () => false, ...opts } = {}) {
  const all = [];
  for (let i = 0; i < games.length; i++) {
    if (shouldStop()) break;
    const g = games[i];
    const found = await findBlunders(g.sans, g.side, evaluate, opts);
    for (const b of found) all.push({ ...b, side: g.side, url: g.url, openingId: g.openingId });
    onProgress(i + 1, games.length);
  }
  return aggregate(all);
}
