/* ---------------------------------------------------------------
   BRANCH BUILDER — the brief's "decaying threshold" rule, as code.

   Given an opponent deviation and engine evaluations after each of OUR
   replies, decide where a punishment line should stop:

     - a big advantage (>= 1.5 pawns) within 6 moves of the deviation
       -> cut there, type "punishment"
     - after that, accept a smaller edge (>= 0.5 pawns)
       -> cut there, type "punishment" (an edge is still worth knowing)
     - forced mate for us at any point -> cut, type "tactical"
     - neither reached by the horizon -> "discard": not every opponent
       mistake deserves a line
     - line ran out before the horizon with nothing found -> "unfinished"

   Everything is measured from the USER's point of view in centipawns.
   Pure functions: no engine here. `buildBranch` takes an `evaluate`
   function so the tests can script the engine's answers.
--------------------------------------------------------------- */
import { isUserPly } from './tree.js';

export const THRESHOLDS = Object.freeze({
  bigCp: 150,          // +1.5 pawns …
  bigWithinMoves: 6,   // … within this many full moves of the deviation
  smallCp: 50,         // afterwards, +0.5 is enough
  horizonMoves: 10,    // give up past this
});

/** White-view centipawns -> the user's view. */
export function fromUserPov(cpWhite, side) {
  return side === 'w' ? cpWhite : -cpWhite;
}

/** Full moves elapsed since the deviation ply (counting the opponent's move as move 1). */
export function movesSince(deviationPly, ply) {
  return Math.floor((ply - deviationPly) / 2) + 1;
}

/**
 * evals: [{ ply, cp, mate }] in WHITE view, one entry per position reached
 * after one of OUR moves (ply is the index of our move in the line).
 * Looks at the WHOLE list before deciding (so the line must be built to
 * the horizon first):
 *   1. a forced mate for us            -> cut at the first one, "tactical"
 *   2. a big edge within 6 moves       -> cut at the first one, "punishment"
 *      (worth going deeper for — the owner's "clear punishment")
 *   3. otherwise the first small edge  -> cut there, "punishment"
 *      (the owner's "just far enough to be better")
 *   4. nothing by the horizon          -> "discard"; before it -> "unfinished"
 * Returns { cutAt: ply | null, type, reason }.
 */
export function decideCut(evals, { deviationPly, side, thresholds = THRESHOLDS }) {
  const view = evals.map((e) => ({
    ply: e.ply,
    moves: movesSince(deviationPly, e.ply),
    cp: e.cp === null || e.cp === undefined ? null : fromUserPov(e.cp, side),
    mate: e.mate === null || e.mate === undefined ? null : fromUserPov(e.mate, side),
  }));
  const label = (v) => `after ${v.moves} move${v.moves === 1 ? '' : 's'}`;

  const mate = view.find((v) => v.mate !== null && v.mate > 0);
  if (mate) return { cutAt: mate.ply, type: 'tactical', reason: `forced mate in ${mate.mate}` };

  const big = view.find((v) => v.moves <= thresholds.bigWithinMoves && v.cp !== null && v.cp >= thresholds.bigCp);
  if (big) return { cutAt: big.ply, type: 'punishment', reason: `+${(big.cp / 100).toFixed(1)} ${label(big)}` };

  const small = view.find((v) => v.cp !== null && v.cp >= thresholds.smallCp);
  if (small) return { cutAt: small.ply, type: 'punishment', reason: `+${(small.cp / 100).toFixed(1)} ${label(small)} (small-edge rule)` };

  const reached = view.at(-1)?.moves ?? 0;
  return {
    cutAt: null,
    type: reached > thresholds.horizonMoves ? 'discard' : 'unfinished',
    reason: reached > thresholds.horizonMoves
      ? 'no real advantage within the horizon — not worth a line'
      : `nothing yet after ${reached} move${reached === 1 ? '' : 's'}`,
  };
}

/**
 * Grow a candidate line to the horizon using the engine's best move for
 * BOTH sides, evaluating after each of our moves, then let decideCut pick
 * where the line should stop. Building the whole line first is what lets
 * the rule prefer a deep clear punishment over an early small edge.
 *
 * evaluate(sans) -> Promise<{ cp, mate, bestMove }>  (White view, SAN)
 * onStep(step)   -> called after every evaluated ply (for the UI)
 *
 * Returns { response, evals, verdict } where response is the SAN list
 * starting with OUR reply to the deviation, cut at the verdict point.
 * A forced mate stops the build early — nothing after it matters.
 */
export async function buildBranch({
  opening, deviationPly, opponentMove, evaluate, onStep = () => {},
  seedResponse = [], depth, thresholds = THRESHOLDS,
}) {
  const sans = opening.mainLine.slice(0, deviationPly).concat([opponentMove], seedResponse);
  const evals = [];
  const maxPly = deviationPly + 2 * (thresholds.horizonMoves + 1);
  const mateForUs = (r) => r.mate !== null && r.mate !== undefined && fromUserPov(r.mate, opening.side) > 0;

  // Score whatever we were seeded with first (an existing branch).
  for (let ply = deviationPly + 1; ply < sans.length; ply++) {
    if (!isUserPly(opening, ply)) continue;
    const r = await evaluate(sans.slice(0, ply + 1), { depth });
    evals.push({ ply, san: sans[ply], cp: r.cp, mate: r.mate, bestMove: r.bestMove, fromSeed: true });
    onStep(evals.at(-1));
    if (mateForUs(r)) return finish();
  }

  // Then extend with engine best moves up to the horizon.
  while (sans.length < maxPly) {
    const ply = sans.length;
    const r = await evaluate(sans, { depth });          // whose move is it, what does the engine want
    if (!r.bestMove) break;                             // game over
    sans.push(r.bestMove);
    if (isUserPly(opening, ply)) {
      const after = await evaluate(sans, { depth });    // score once our move is on the board
      evals.push({ ply, san: r.bestMove, cp: after.cp, mate: after.mate, bestMove: after.bestMove, fromSeed: false });
      onStep(evals.at(-1));
      if (mateForUs(after)) return finish();
    }
  }
  return finish();

  function finish() {
    const verdict = decideCut(evals, { deviationPly, side: opening.side, thresholds });
    const end = verdict.cutAt === null ? sans.length : verdict.cutAt + 1;
    return { response: sans.slice(deviationPly + 1, end), evals, verdict };
  }
}

/** The JSON snippet to paste into repertoire.js. */
export function toBranchJSON({ deviationPly, opponentMove, response, verdict }) {
  return JSON.stringify({
    deviatesAt: deviationPly,
    opponentMove,
    response,
    type: verdict.type === 'tactical' ? 'tactical' : 'punishment',
    note: `Engine-checked: ${verdict.reason}.`,
  }, null, 2);
}
