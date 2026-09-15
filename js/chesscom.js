/* ---------------------------------------------------------------
   CHESS.COM IMPORT — find the holes in your repertoire using the
   games you actually played.

   Flow:
     1. importGames(username)  -> your recent games (public API, no auth)
     2. for each game: parseMoves(pgn), pick the opening it belongs to
        (matchesOpening), walk it against the tree (walkGame)
     3. aggregateGaps(...)     -> "after <prefix>, opponents played <move>
                                  N times and you have no answer"

   Vendor facts (docs/sources.md, 2026-09-15):
   - GET https://api.chess.com/pub/player/{user}/games/archives
       -> { archives: ["https://api.chess.com/pub/player/{user}/games/2026/09", ...] }
   - GET one archive -> { games: [{ pgn, url, rules, time_class, white: {username, result}, black: {...}, end_time }] }
   - Serial requests are unlimited, parallel ones may get 429. So: one at a time.
   - CORS is open (Access-Control-Allow-Origin: *), fine from a browser.

   Everything except importGames is pure and unit-tested.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';
import { buildLine, isUserPly } from './tree.js';

export const CHESSCOM_BASE = 'https://api.chess.com/pub';

export class ChesscomError extends Error {}

/* ---------- fetching ---------- */

export function archivesUrl(username) {
  return `${CHESSCOM_BASE}/player/${encodeURIComponent(username.toLowerCase())}/games/archives`;
}

/**
 * Download the last `months` monthly archives, oldest first, one request
 * at a time. Standard chess only (no chess960 etc).
 * `onProgress(done, total)` lets the UI show a counter.
 */
export async function importGames(username, { months = 6, fetchImpl = globalThis.fetch, onProgress = () => {} } = {}) {
  const list = await getJson(archivesUrl(username), fetchImpl, `No Chess.com player called "${username}".`);
  const urls = (list.archives ?? []).slice(-months);
  const games = [];
  for (let i = 0; i < urls.length; i++) {
    const month = await getJson(urls[i], fetchImpl, 'Chess.com archive could not be loaded.');
    for (const g of month.games ?? []) {
      if (g.rules === 'chess' && typeof g.pgn === 'string') games.push(g);
    }
    onProgress(i + 1, urls.length);
  }
  return games;
}

async function getJson(url, fetchImpl, notFoundMessage) {
  let res;
  try {
    res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  } catch {
    throw new ChesscomError('Could not reach Chess.com. Are you online?');
  }
  if (res.status === 404) throw new ChesscomError(notFoundMessage);
  if (res.status === 429) throw new ChesscomError('Chess.com rate limit hit — try again in a minute.');
  if (!res.ok) throw new ChesscomError(`Chess.com error ${res.status}.`);
  return res.json();
}

/* ---------- parsing ---------- */

/**
 * PGN text -> SAN list. Chess.com PGNs carry clock comments and repeat
 * the move number before Black's move ("1... e5"); strip both first so
 * chess.js gets plain moves. Returns [] if the PGN cannot be parsed.
 */
export function parseMoves(pgn) {
  const movetext = pgn
    .replace(/^\[[^\]]*\]\s*$/gm, '') // [Header "..."] lines — we only want the moves
    .replace(/\{[^}]*\}/g, ' ')        // { [%clk 0:09:59] } comments
    .replace(/\d+\.\.\./g, ' ')        // "1..." before Black's move
    .replace(/\s+/g, ' ')
    .trim();
  const game = new Chess();
  try {
    game.loadPgn(movetext);
    return game.history();
  } catch {
    return [];
  }
}

/** Which colour `username` had in this game, or null if they did not play. */
export function userSide(game, username) {
  const u = username.toLowerCase();
  if (game.white?.username?.toLowerCase() === u) return 'w';
  if (game.black?.username?.toLowerCase() === u) return 'b';
  return null;
}

/** Does this move list start like the opening, and did we have its side? */
export function matchesOpening(sans, side, opening) {
  if (side !== opening.side) return false;
  if (sans.length < opening.signaturePlies) return false;
  for (let i = 0; i < opening.signaturePlies; i++) {
    if (sans[i] !== opening.mainLine[i]) return false;
  }
  return true;
}

/* ---------- walking one game against the tree ---------- */

/**
 * Follow the game move by move along the repertoire.
 * Returns one of:
 *   { result: 'gap',      ply, move, prefix }   opponent played something we have no answer to
 *   { result: 'userLeft', ply, move, expected } we ourselves left the book
 *   { result: 'complete', branch }              game followed a whole line
 *   { result: 'gameEnded', ply }                game was shorter than the line
 * plus `branch` (the branch entered, or null) in every case.
 */
export function walkGame(sans, opening) {
  let line = opening.mainLine;
  let branch = null;

  for (let ply = 0; ply < line.length; ply++) {
    if (ply >= sans.length) return { result: 'gameEnded', ply, branch };
    const played = sans[ply];
    const expected = line[ply];
    if (played === expected) continue;

    if (isUserPly(opening, ply)) {
      return { result: 'userLeft', ply, move: played, expected, branch };
    }

    // Opponent deviated. Do we have a prepared branch for exactly this?
    const known = branch === null
      ? opening.branches.find((b) => b.deviatesAt === ply && b.opponentMove === played)
      : null; // branches only fork off the main line, not off other branches
    if (known) {
      branch = known;
      line = buildLine(opening, known);
      continue;
    }
    return { result: 'gap', ply, move: played, prefix: sans.slice(0, ply), branch };
  }
  return { result: 'complete', branch };
}

/* ---------- putting it together ---------- */

/**
 * Run every game through every opening. Returns, per opening id:
 *   { games, gaps: [{ key, ply, move, prefix, count, urls }], branchHits: { "<ply>:<move>": n },
 *     userLeft: n, complete: n }
 * Gaps are sorted most frequent first.
 */
export function analyseGames(games, username, openings) {
  const report = {};
  for (const o of openings) {
    report[o.id] = { games: 0, gaps: new Map(), branchHits: {}, userLeft: 0, complete: 0 };
  }

  for (const g of games) {
    const side = userSide(g, username);
    if (!side) continue;
    const sans = parseMoves(g.pgn);
    for (const o of openings) {
      if (!matchesOpening(sans, side, o)) continue;
      const r = report[o.id];
      r.games += 1;
      const w = walkGame(sans, o);
      if (w.branch) {
        const k = `${w.branch.deviatesAt}:${w.branch.opponentMove}`;
        r.branchHits[k] = (r.branchHits[k] ?? 0) + 1;
      }
      if (w.result === 'userLeft') r.userLeft += 1;
      if (w.result === 'complete') r.complete += 1;
      if (w.result === 'gap') {
        const key = `${w.prefix.join(' ')}|${w.move}`;
        const gap = r.gaps.get(key) ?? { key, ply: w.ply, move: w.move, prefix: w.prefix, count: 0, urls: [] };
        gap.count += 1;
        if (g.url) gap.urls.push(g.url);
        r.gaps.set(key, gap);
      }
    }
  }

  for (const id of Object.keys(report)) {
    report[id].gaps = [...report[id].gaps.values()].sort((a, b) => b.count - a.count || a.ply - b.ply);
  }
  return report;
}
