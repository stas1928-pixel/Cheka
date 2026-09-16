import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromUserPov, movesSince, decideCut, buildBranch, toBranchJSON, THRESHOLDS } from '../js/branchBuilder.js';
import { parseInfo } from '../js/engine.js';

test('fromUserPov flips for Black only', () => {
  assert.equal(fromUserPov(120, 'w'), 120);
  assert.equal(fromUserPov(120, 'b'), -120);
});

test('movesSince counts full moves from the deviation', () => {
  // deviation at ply 5 (Black's 3rd), our reply at ply 6 is still move 1
  assert.equal(movesSince(5, 6), 1);
  assert.equal(movesSince(5, 8), 2);
  assert.equal(movesSince(5, 16), 6);
  assert.equal(movesSince(5, 18), 7);
});

test('decideCut: big edge early is a punishment cut at that ply', () => {
  const v = decideCut([{ ply: 6, cp: 40 }, { ply: 8, cp: 160 }], { deviationPly: 5, side: 'w' });
  assert.equal(v.cutAt, 8);
  assert.equal(v.type, 'punishment');
  assert.match(v.reason, /\+1\.6 after 2 moves/);
});

test('decideCut: same numbers for Black must be negated', () => {
  const v = decideCut([{ ply: 5, cp: -160 }], { deviationPly: 4, side: 'b' });
  assert.equal(v.cutAt, 5);
  const none = decideCut([{ ply: 5, cp: 160 }], { deviationPly: 4, side: 'b' });
  assert.equal(none.cutAt, null);
});

test('decideCut: a small edge cuts at once when no big edge is coming', () => {
  const v = decideCut([{ ply: 6, cp: 80 }, { ply: 8, cp: 90 }, { ply: 10, cp: 95 }], { deviationPly: 5, side: 'w' });
  assert.equal(v.cutAt, 6, 'stop as soon as we are clearly better');
  assert.match(v.reason, /small-edge/);
});

test('decideCut: a big edge within 6 moves beats an earlier small edge', () => {
  const evals = [{ ply: 6, cp: 80 }, { ply: 8, cp: 90 }, { ply: 14, cp: 220 }];
  const v = decideCut(evals, { deviationPly: 5, side: 'w' });
  assert.equal(v.cutAt, 14, 'go deeper for the clear punishment (move 5)');
  assert.equal(v.type, 'punishment');
  // …but not if the big edge only arrives after the 6-move window
  const late = decideCut([{ ply: 6, cp: 80 }, { ply: 20, cp: 220 }], { deviationPly: 5, side: 'w' });
  assert.equal(late.cutAt, 6);
});

test('decideCut: mate for us is tactical, mate against us is ignored', () => {
  const win = decideCut([{ ply: 6, cp: null, mate: 3 }], { deviationPly: 5, side: 'w' });
  assert.deepEqual(win, { cutAt: 6, type: 'tactical', reason: 'forced mate in 3' });
  const lose = decideCut([{ ply: 5, cp: null, mate: 3 }], { deviationPly: 4, side: 'b' });
  assert.equal(lose.cutAt, null);
});

test('decideCut: unfinished vs discard', () => {
  assert.equal(decideCut([{ ply: 6, cp: 10 }], { deviationPly: 5, side: 'w' }).type, 'unfinished');
  const far = [{ ply: 6, cp: 10 }, { ply: 28, cp: 20 }]; // move 12 > horizon 10
  assert.equal(decideCut(far, { deviationPly: 5, side: 'w' }).type, 'discard');
  assert.equal(decideCut([], { deviationPly: 5, side: 'w' }).type, 'unfinished');
});

/** Scripted engine: answers by position length so tests are deterministic. */
function scriptedEvaluate(script) {
  const calls = [];
  return {
    calls,
    evaluate: async (sans) => {
      calls.push(sans.join(' '));
      const r = script[sans.length];
      if (!r) throw new Error(`no scripted answer for ${sans.length} plies: ${sans.join(' ')}`);
      return { cp: r.cp ?? null, mate: r.mate ?? null, bestMove: r.best ?? null };
    },
  };
}

const white = { side: 'w', mainLine: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4'], branches: [] };
// Most tests look at the cut itself, so they switch the minimum length off.
const SHORT = { ...THRESHOLDS, minMoves: 1 };

/** Scripted answers for every length from `from` to the horizon: quiet moves at `cp`. */
function quietTail(script, from, cp) {
  for (let n = from; n <= 40; n++) script[n] ??= { cp, best: n % 2 === 0 ? 'a3' : 'a6' };
  return script;
}

test('buildBranch builds to the horizon, then cuts at the big threshold', async () => {
  // deviation 3...f5 at ply 5; engine: 4.Nxe5 (+0.9), 4...Nxe5, 5.dxe5 (+1.7), then quiet
  const s = scriptedEvaluate(quietTail({
    6: { best: 'Nxe5' },               // position after f5: White to move
    7: { cp: 90, best: 'Nxe5' },       // after 4.Nxe5: score + Black's best
    8: { best: 'dxe5' },               // after 4...Nxe5: White to move
    9: { cp: 170, best: 'Qe7' },       // after 5.dxe5
  }, 10, 170));
  const steps = [];
  const r = await buildBranch({ opening: white, deviationPly: 5, opponentMove: 'f5', evaluate: s.evaluate, onStep: (x) => steps.push(x.san), thresholds: SHORT });
  assert.deepEqual(r.response, ['Nxe5', 'Nxe5', 'dxe5'], 'cut where +1.7 first appears, not at +0.9');
  assert.equal(r.verdict.type, 'punishment');
  assert.equal(r.verdict.cutAt, 8);
  assert.ok(steps.length > 2, 'kept building past the cut to look for something bigger');
});

test('buildBranch scores a seeded response and can cut inside it', async () => {
  const s = scriptedEvaluate(quietTail({ 7: { cp: 200, best: 'a6' } }, 8, 200));
  const r = await buildBranch({ opening: white, deviationPly: 5, opponentMove: 'f5', seedResponse: ['Nxe5', 'Nxe5', 'dxe5'], evaluate: s.evaluate, thresholds: SHORT });
  assert.deepEqual(r.response, ['Nxe5'], 'cut right after the first seeded move');
  assert.equal(r.evals[0].fromSeed, true);
});

test('buildBranch stops early on a forced mate for us', async () => {
  const s = scriptedEvaluate({ 6: { best: 'Qh5' }, 7: { mate: 2, best: 'g6' } });
  const r = await buildBranch({ opening: white, deviationPly: 5, opponentMove: 'f5', evaluate: s.evaluate, thresholds: SHORT });
  assert.deepEqual(r.response, ['Qh5']);
  assert.equal(r.verdict.type, 'tactical');
  assert.equal(s.calls.length, 2, 'no need to look further once mate is found');
});

test('buildBranch: a sound deviation keeps exactly minMoves of our moves', async () => {
  const script = {};
  for (let n = 6; n <= 40; n++) script[n] = { cp: 10, best: n % 2 === 0 ? 'a3' : 'a6' };
  // legality is irrelevant here: evaluate is scripted, the builder never checks moves itself
  const r = await buildBranch({ opening: white, deviationPly: 5, opponentMove: 'f5', evaluate: scriptedEvaluate(script).evaluate });
  assert.equal(r.verdict.type, 'discard');
  assert.equal(r.verdict.cutAt, null);
  // 4 of our moves = plies 6, 8, 10, 12 -> response covers plies 6..12 = 7 SAN
  assert.equal(r.response.length, 2 * THRESHOLDS.minMoves - 1);
  assert.equal(r.evals.length, THRESHOLDS.horizonMoves + 1, 'still built to the horizon before deciding');
});

test('buildBranch: an early cut is padded out to minMoves', async () => {
  const script = { 6: { best: 'Nxe5' } };
  for (let n = 7; n <= 40; n++) script[n] = { cp: 200, best: n % 2 === 0 ? 'a3' : 'a6' };
  const r = await buildBranch({ opening: white, deviationPly: 5, opponentMove: 'f5', evaluate: scriptedEvaluate(script).evaluate });
  assert.equal(r.verdict.cutAt, 6, 'the advantage is there after one move');
  assert.equal(r.response.length, 7, 'but the drill still shows four of our moves');
  assert.equal(r.response[0], 'Nxe5');
});

test('toBranchJSON produces a paste-ready branch', () => {
  const json = JSON.parse(toBranchJSON({ deviationPly: 5, opponentMove: 'f5', response: ['Nxe5'], verdict: { type: 'punishment', reason: '+1.6 after 2 moves' } }));
  assert.deepEqual(json, { deviatesAt: 5, opponentMove: 'f5', response: ['Nxe5'], type: 'punishment', note: 'Engine-checked: +1.6 after 2 moves.' });
});

test('parseInfo reads depth, cp and mate; ignores non-primary multipv lines', () => {
  assert.deepEqual(parseInfo('info depth 12 seldepth 18 multipv 1 score cp 35 nodes 1 pv e2e4'), { depth: 12, cp: 35, mate: null });
  assert.deepEqual(parseInfo('info depth 9 score mate -2 pv a1a2'), { depth: 9, cp: null, mate: -2 });
  assert.equal(parseInfo('info depth 12 multipv 2 score cp 10'), null);
  assert.equal(parseInfo('info depth 12 currmove e2e4 currmovenumber 1'), null);
  assert.equal(parseInfo('bestmove e2e4'), null);
});
