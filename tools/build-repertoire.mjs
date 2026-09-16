/* ---------------------------------------------------------------
   Build the repertoire tree from YOUR games + Stockfish.

     node tools/build-repertoire.mjs <chesscom-user> [months] [depth] > out.json

   For each opening seed (see SEEDS):
   - Walk the tree of positions reached in your games. At every OPPONENT
     node, each reply that appeared at least MIN_GAMES times becomes a
     line of its own; the most common reply continues the trunk.
   - OUR move at every node is the engine's best (depth D), except where a
     hand-approved trunk move exists (TRUNK), so master theory is kept on
     the main path.
   - Each opponent alternative is classified by the engine:
       eval swing in our favour >= SIDE_SWING  -> kind 'side' (a mistake to punish)
       otherwise                                -> kind 'main' (a real variation)
     Side lines run at least MIN_OUR_MOVES of our moves and stop at the
     brief's cutoff (js/branchBuilder.js). Main lines run to MAIN_PLIES.
   - Opponent moves inside a line: the most common move from your games at
     that node when seen >= 2 times, else the engine's best (what a strong
     opponent would do).
   - Names: NAMES map for known variations, otherwise "3...f5 line".

   Output: JSON [{ id, name, side, signaturePlies, lines: [...] }] to
   paste into js/repertoire.data.js.
--------------------------------------------------------------- */
import { createNodeEngine } from './nodeEngine.mjs';
import { importGames, parseMoves, userSide } from '../js/chesscom.js';
import { decideCut, THRESHOLDS, fromUserPov } from '../js/branchBuilder.js';
import { moveLabel } from '../js/tree.js';

const [,, username, monthsArg = '6', depthArg = '14'] = process.argv;
if (!username) { console.error('usage: node tools/build-repertoire.mjs <user> [months] [depth]'); process.exit(1); }
const DEPTH = Number(depthArg);
const MIN_GAMES = 2;        // opponent reply must appear this often to get its own line
const SIDE_SWING = 60;      // centipawns in our favour => opponent's move is a mistake
const MAIN_PLIES = 20;
const BRANCH_UNTIL_PLY = 13; // stop creating new lines after move 7
const MAX_LINES = 14;

const SEEDS = [
  { id: 'scotch', name: 'Scotch Gambit', side: 'w', root: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'], signaturePlies: 5,
    // hand-approved trunk (masters' top choice at each node), used when the position matches
    trunk: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6', 'e5', 'd5', 'Bb5', 'Ne4', 'Nxd4', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'Bc5', 'f3', 'Ng5'] },
  { id: 'elephant', name: 'Elephant Gambit', side: 'b', root: ['e4', 'e5', 'Nf3', 'd5'], signaturePlies: 4,
    trunk: ['e4', 'e5', 'Nf3', 'd5', 'exd5', 'e4', 'Qe2', 'Nf6', 'd3', 'Qxd5', 'Nbd2', 'Nc6', 'dxe4', 'Qh5', 'Qb5', 'Bc5', 'Nb3', 'Nxe4', 'Be3', 'Bb4+'] },
];

// Known variation names by move prefix (joined with spaces).
const NAMES = {
  'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Nf6 e5 d5 Bb5 Ne4': 'Max Lange Attack',
  'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Nf6 e5': 'Advance Variation',
  'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Nf6': 'Dubois-Réti Defence',
  'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Bc5': 'Haxo Gambit',
  'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Bb4+': 'London Defence',
  'e4 e5 Nf3 Nc6 d4 exd4 Bc4': 'Scotch Gambit',
  'e4 e5 Nf3 Nc6 d4 exd4': 'Scotch Game',
  'e4 e5 Nf3 d5 exd5 e4': 'Paulsen Countergambit',
  'e4 e5 Nf3 d5 exd5 Bd6': 'Maróczy Gambit',
  'e4 e5 Nf3 d5 Nxe5': 'Elephant Gambit, 3.Nxe5',
  'e4 e5 Nf3 d5 exd5': 'Elephant Gambit Accepted',
};

/* ---------- your games -> a tree of opponent replies ---------- */

const raw = await importGames(username, { months: Number(monthsArg), onProgress: (d, t) => console.error(`month ${d}/${t}`) });
const games = raw.map((g) => ({ side: userSide(g, username), sans: parseMoves(g.pgn), url: g.url })).filter((g) => g.side);
console.error(`${games.length} games`);

/** How often each next move was played after `prefix`, in games where we had `side`. */
function repliesAfter(prefix, side) {
  const counts = new Map();
  for (const g of games) {
    if (g.side !== side || g.sans.length <= prefix.length) continue;
    if (prefix.some((m, i) => g.sans[i] !== m)) continue;
    const next = g.sans[prefix.length];
    counts.set(next, (counts.get(next) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/* ---------- engine ---------- */

const engine = await createNodeEngine({ defaultDepth: DEPTH });
const cache = new Map();
async function ev(sans) {
  const k = sans.join(' ');
  if (!cache.has(k)) cache.set(k, await engine.evaluate(sans, { depth: DEPTH }));
  return cache.get(k);
}

// Hand-approved replies for known positions (masters' / amateur-DB top move
// checked on 2026-09-15), used instead of the engine's pick where set.
const KNOWN_REPLIES = {
  'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Bc5': 'c3',   // Haxo Gambit: offer the pawn back
  'e4 e5 Nf3 Nc6 d4 d6': 'd5',             // gain space (engine agrees, owner's habit)
  'e4 e5 Nf3 d5 Nxe5': 'Bd6',              // masters 63%, owner's habit
  'e4 e5 Nf3 d5 exd5 e4 Bb5+': 'c6',       // 63% for Black
};
function ourMoveAt(seed, prefix) {
  if (seed.trunk.slice(0, prefix.length).every((m, i) => m === prefix[i]) && seed.trunk[prefix.length]) return seed.trunk[prefix.length];
  return KNOWN_REPLIES[prefix.join(' ')] ?? null;
}

/* ---------- line building ---------- */

const isOurPly = (side, ply) => (ply % 2 === 0) === (side === 'w');

/** Extend `moves` until `plies` long: our move = trunk/engine, opponent = your games' favourite or engine. */
async function extendMain(seed, moves, plies) {
  const out = moves.slice();
  while (out.length < plies) {
    const ply = out.length;
    if (isOurPly(seed.side, ply)) {
      const m = ourMoveAt(seed, out) ?? (await ev(out)).bestMove;
      if (!m) break;
      out.push(m);
    } else {
      const [top] = repliesAfter(out, seed.side);
      const m = top && top[1] >= 2 ? top[0] : (await ev(out)).bestMove;
      if (!m) break;
      out.push(m);
    }
  }
  return out;
}

/** Side line: engine for us, favourite-or-engine for them, cut by the brief's rule. */
async function buildSide(seed, prefixWithDeviation) {
  const deviationPly = prefixWithDeviation.length - 1;
  const out = prefixWithDeviation.slice();
  const evals = [];
  const maxPly = deviationPly + 2 * (THRESHOLDS.horizonMoves + 1);
  while (out.length < maxPly) {
    const ply = out.length;
    // Stop on a repetition (e.g. a perpetual-check shuffle): nothing left to learn.
    if (out.length >= 8 && out.slice(-4).every((m, i) => m === out[out.length - 8 + i])) { out.length -= 4; break; }
    if (isOurPly(seed.side, ply)) {
      const r = await ev(out);
      if (!r.bestMove) break;
      out.push(r.bestMove);
      const after = await ev(out);
      evals.push({ ply, san: r.bestMove, cp: after.cp, mate: after.mate });
      if (after.mate !== null && fromUserPov(after.mate, seed.side) > 0) break;
    } else {
      const [top] = repliesAfter(out, seed.side);
      const m = top && top[1] >= 2 ? top[0] : (await ev(out)).bestMove;
      if (!m) break;
      out.push(m);
    }
  }
  const verdict = decideCut(evals, { deviationPly, side: seed.side });
  const minIdx = Math.min(THRESHOLDS.minMoves, evals.length) - 1;
  const minPly = minIdx >= 0 ? evals[minIdx].ply : deviationPly;
  const cutPly = verdict.cutAt === null ? minPly : Math.max(verdict.cutAt, minPly);
  return { moves: out.slice(0, cutPly + 1), verdict, evals };
}

/** A known name only counts if it is specific to this line (the named prefix
 *  reaches past the deviation); otherwise "3...f5 line". */
function nameFor(moves, deviationPly) {
  for (let n = moves.length; n > deviationPly; n--) {
    const key = moves.slice(0, n).join(' ');
    if (NAMES[key]) return NAMES[key];
  }
  return `${moveLabel(deviationPly, moves[deviationPly])} line`;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const idFor = (ply, move, name) => {
  const lab = moveLabel(ply, move);
  return name === `${lab} line` ? slug(lab) : slug(`${lab}-${name}`);
};

/* ---------- main ---------- */

const out = [];
for (const seed of SEEDS) {
  console.error(`\n== ${seed.name}`);
  const lines = [];
  // The trunk is the hand-approved theory line, verbatim. Your opponents'
  // favourite replies become variations of it, never the trunk itself.
  const trunk = seed.trunk.slice(0, MAIN_PLIES);
  const trunkEval = await ev(trunk);
  let trunkName = seed.name;
  for (let n = trunk.length; n > 0; n--) { const k = trunk.slice(0, n).join(' '); if (NAMES[k]) { trunkName = NAMES[k]; break; } }
  lines.push({ id: 'main', name: trunkName, kind: 'main', moves: trunk,
    games: repliesAfter(seed.root.slice(0, -1), seed.side).find(([m]) => m === seed.root.at(-1))?.[1] ?? 0,
    cp: fromUserPov(trunkEval.cp ?? 0, seed.side), note: 'Trunk: master theory where it exists, then engine. Opponent moves are what your opponents actually play.' });
  console.error(`trunk: ${trunk.join(' ')}`);

  // Branch at each opponent node of the trunk.
  const queue = [];
  for (let ply = seed.root.length; ply < Math.min(trunk.length, BRANCH_UNTIL_PLY); ply++) {
    if (isOurPly(seed.side, ply)) continue;
    const prefix = trunk.slice(0, ply);
    for (const [move, count] of repliesAfter(prefix, seed.side)) {
      if (move === trunk[ply] || count < MIN_GAMES) continue;
      queue.push({ prefix, move, count, ply });
    }
  }
  queue.sort((a, b) => b.count - a.count);

  for (const q of queue) {
    if (lines.length >= MAX_LINES) break;
    const before = fromUserPov((await ev(q.prefix)).cp ?? 0, seed.side);
    const afterOpp = fromUserPov((await ev([...q.prefix, q.move])).cp ?? 0, seed.side);
    const swing = afterOpp - before;
    const isSide = swing >= SIDE_SWING;
    let moves, verdict = null, cp;
    if (isSide) {
      const r = await buildSide(seed, [...q.prefix, q.move]);
      moves = r.moves; verdict = r.verdict; cp = fromUserPov(r.evals.at(-1)?.cp ?? afterOpp, seed.side);
    } else {
      moves = await extendMain(seed, [...q.prefix, q.move], MAIN_PLIES);
      cp = fromUserPov((await ev(moves)).cp ?? 0, seed.side);
    }
    const name = nameFor(moves, q.ply);
    const id = idFor(q.ply, q.move, name);
    lines.push({ id, name, kind: isSide ? 'side' : 'main', moves, deviatesAt: q.ply, games: q.count, cp: Math.round(cp), swing: Math.round(swing),
      verdict: verdict ? verdict.type : null, reason: verdict ? verdict.reason : null });
    console.error(`${isSide ? 'SIDE' : 'MAIN'} ${moveLabel(q.ply, q.move).padEnd(9)} ×${q.count}  swing ${swing >= 0 ? '+' : ''}${(swing / 100).toFixed(2)}  -> ${moves.slice(q.ply).join(' ')}`);
  }
  out.push({ id: seed.id, name: seed.name, side: seed.side, signaturePlies: seed.signaturePlies, lines });
}
engine.stop();
console.log(JSON.stringify(out, null, 2));
process.exit(0);
