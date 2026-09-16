/* ---------------------------------------------------------------
   TREE HELPERS — pure functions over the repertoire shape.

   "Pure" means: no DOM, no chess engine, no randomness unless it is
   passed in. That is what makes these easy to unit-test in node
   (tests/tree.test.mjs) without a browser.
--------------------------------------------------------------- */

/** Even plies are White's moves, odd plies are Black's. */
export function isWhitePly(ply) {
  return ply % 2 === 0;
}

/** Is it the user's turn at this ply, given which side they train? */
export function isUserPly(opening, ply) {
  return isWhitePly(ply) === (opening.side === 'w');
}

/**
 * The concrete list of moves being drilled right now.
 * With no branch it is just the main line. With a branch it is:
 *   main line up to (not including) the deviation ply,
 *   then the opponent's deviating move,
 *   then the prepared response.
 */
export function buildLine(opening, branch = null) {
  if (!branch) return opening.mainLine.slice();
  return opening.mainLine
    .slice(0, branch.deviatesAt)
    .concat([branch.opponentMove], branch.response);
}

/** All prepared deviations the opponent could play at this ply. */
export function branchesAt(opening, ply) {
  return opening.branches.filter((b) => b.deviatesAt === ply);
}

/**
 * Stable string key for a line, used to file progress under.
 * "main" for the main line, e.g. "b5:Nxd4" for a branch.
 */
export function lineKey(branch = null) {
  return branch ? `b${branch.deviatesAt}:${branch.opponentMove}` : 'main';
}

/** "3.d4" for a White ply, "3...exd4" for a Black ply. */
export function moveLabel(ply, san) {
  const moveNumber = Math.floor(ply / 2) + 1;
  return isWhitePly(ply) ? `${moveNumber}.${san}` : `${moveNumber}...${san}`;
}

/** Human title for a branch: "3...Nxd4 · punishment". */
export function describeBranch(branch) {
  return `${moveLabel(branch.deviatesAt, branch.opponentMove)} · ${branch.type}`;
}

/**
 * "1. e4 e5 2. Nf3 Nc6" — the first `upTo` plies of a line, numbered.
 * Returns an array of { ply, text } so the UI can highlight one entry.
 */
export function formatMoves(sans, upTo = sans.length) {
  const out = [];
  for (let ply = 0; ply < Math.min(upTo, sans.length); ply++) {
    const prefix = isWhitePly(ply) ? `${Math.floor(ply / 2) + 1}. ` : '';
    out.push({ ply, text: prefix + sans[ply] });
  }
  return out;
}

/**
 * Pick one item at random, proportionally to its weight.
 * weights[i] <= 0 means "never". Returns null if nothing is pickable.
 * `random` is injectable for tests.
 */
export function pickWeighted(items, weights, random = Math.random) {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) return null;
  let r = random() * total;
  for (let i = 0; i < items.length; i++) {
    const w = Math.max(0, weights[i]);
    if (w === 0) continue;
    if (r < w) return items[i];
    r -= w;
  }
  return items[items.length - 1];
}

/**
 * Decide whether the opponent leaves the book at this ply.
 * Returns a branch, or null to stay on the main line.
 * `random` is injectable so tests can force either outcome.
 */
export function pickDeviation(opening, ply, { chance, random = Math.random }) {
  const options = branchesAt(opening, ply);
  if (options.length === 0) return null;
  if (random() >= chance) return null;
  return options[Math.floor(random() * options.length)];
}
