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
 * Returns { cutAt: ply | null, type, reason }.
 */
export function decideCut(evals, { deviationPly, side, thresholds = THRESHOLDS }) {
  for (const e of evals) {
    const moves = movesSince(deviationPly, e.ply);
    const mate = e.mate === null || e.mate === undefined ? null : fromUserPov(e.mate, side);
    if (mate !== null && mate > 0) {
      return { cutAt: e.ply, type: 'tactical', reason: `forced mate in ${mate}` };
    }
    if (e.cp === null || e.cp === undefined) continue;
    const cp = fromUserPov(e.cp, side);
    if (moves <= thresholds.bigWithinMoves && cp >= thresholds.bigCp) {
      return { cutAt: e.ply, type: 'punishment', reason: `+${(cp / 100).toFixed(1)} after ${moves} move${moves === 1 ? '' : 's'}` };
    }
    if (moves > thresholds.bigWithinMoves && cp >= thresholds.smallCp) {
      return { cutAt: e.ply, type: 'punishment', reason: `+${(cp / 100).toFixed(1)} after ${moves} moves (small-edge rule)` };
    }
    if (moves > thresholds.horizonMoves) break;
  }
  const last = evals.at(-1);
  const reached = last ? movesSince(deviationPly, last.ply) : 0;
  return {
    cutAt: null,
    type: reached > thresholds.horizonMoves ? 'discard' : 'unfinished',
    reason: reached > thresholds.horizonMoves
      ? 'no real advantage within the horizon — not worth a line'
      : `nothing yet after ${reached} move${reached === 1 ? '' : 's'}`,
  };
}

/**
 * Grow a candidate line move by move using the engine's best move for
 * BOTH sides, evaluating after each of our moves, until decideCut says stop.
 *
 * evaluate(sans) -> Promise<{ cp, mate, bestMove }>  (White view, SAN)
 * onStep(step)   -> called after every evaluated ply (for the UI)
 *
 * Returns { response, evals, verdict } where response is the SAN list
 * starting with OUR reply to the deviation, cut at the verdict point.
 */
export async function buildBranch({
  opening, deviationPly, opponentMove, evaluate, onStep = () => {},
  seedResponse = [], depth, thresholds = THRESHOLDS,
}) {
  const sans = opening.mainLine.slice(0, deviationPly).concat([opponentMove], seedResponse);
  const evals = [];
  const maxPly = deviationPly + 2 * (thresholds.horizonMoves + 1);

  // Evaluate whatever we were seeded with first, so an existing branch
  // gets a verdict before the engine adds anything.
  for (let ply = deviationPly + 1; ply < sans.length; ply++) {
    if (!isUserPly(opening, ply)) continue;
    const r = await evaluate(sans.slice(0, ply + 1), { depth });
    evals.push({ ply, san: sans[ply], cp: r.cp, mate: r.mate, bestMove: r.bestMove, fromSeed: true });
    onStep(evals.at(-1));
    const v = decideCut(evals, { deviationPly, side: opening.side, thresholds });
    if (v.cutAt !== null) return finish(v);
  }

  // Then extend with engine best moves.
  while (sans.length < maxPly) {
    const ply = sans.length;
    const r = await evaluate(sans, { depth });          // whose move is it, what does the engine want
    if (!r.bestMove) break;                             // game over
    sans.push(r.bestMove);
    if (isUserPly(opening, ply)) {
      const after = await evaluate(sans, { depth });    // score once our move is on the board
      evals.push({ ply, san: r.bestMove, cp: after.cp, mate: after.mate, bestMove: after.bestMove, fromSeed: false });
      onStep(evals.at(-1));
      const v = decideCut(evals, { deviationPly, side: opening.side, thresholds });
      if (v.cutAt !== null) return finish(v);
    }
  }
  return finish(decideCut(evals, { deviationPly, side: opening.side, thresholds }));

  function finish(verdict) {
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
