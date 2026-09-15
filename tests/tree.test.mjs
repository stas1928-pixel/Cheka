import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isWhitePly, isUserPly, buildLine, branchesAt, lineKey,
  moveLabel, describeBranch, formatMoves, pickDeviation,
} from '../js/tree.js';

// A tiny fake opening so these tests do not depend on the real data.
const white = {
  side: 'w',
  mainLine: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'],
  branches: [
    { deviatesAt: 1, opponentMove: 'c5', response: ['Nf3'], type: 'punishment' },
    { deviatesAt: 1, opponentMove: 'e6', response: ['d4'], type: 'punishment' },
    { deviatesAt: 3, opponentMove: 'Nf6', response: ['Nxe5'], type: 'tactical' },
  ],
};
const black = { ...white, side: 'b' };

test('ply parity', () => {
  assert.equal(isWhitePly(0), true);
  assert.equal(isWhitePly(1), false);
  assert.equal(isUserPly(white, 0), true);
  assert.equal(isUserPly(white, 1), false);
  assert.equal(isUserPly(black, 0), false);
  assert.equal(isUserPly(black, 1), true);
});

test('buildLine: main line is a copy, branch splices at the deviation', () => {
  const main = buildLine(white);
  assert.deepEqual(main, white.mainLine);
  assert.notEqual(main, white.mainLine, 'must not hand out the original array');
  assert.deepEqual(buildLine(white, white.branches[2]), ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5']);
});

test('branchesAt and lineKey', () => {
  assert.equal(branchesAt(white, 1).length, 2);
  assert.equal(branchesAt(white, 3).length, 1);
  assert.equal(branchesAt(white, 0).length, 0);
  assert.equal(lineKey(), 'main');
  assert.equal(lineKey(white.branches[0]), 'b1:c5');
});

test('labels', () => {
  assert.equal(moveLabel(0, 'e4'), '1.e4');
  assert.equal(moveLabel(1, 'e5'), '1...e5');
  assert.equal(moveLabel(4, 'd4'), '3.d4');
  assert.equal(describeBranch(white.branches[2]), '2...Nf6 · tactical');
});

test('formatMoves numbers White moves only and respects upTo', () => {
  assert.deepEqual(formatMoves(['e4', 'e5', 'Nf3']), [
    { ply: 0, text: '1. e4' },
    { ply: 1, text: 'e5' },
    { ply: 2, text: '2. Nf3' },
  ]);
  assert.equal(formatMoves(['e4', 'e5', 'Nf3'], 2).length, 2);
  assert.deepEqual(formatMoves([], 0), []);
});

test('pickDeviation: chance 0 never, chance 1 always, none where no branch', () => {
  const always = () => 0;   // random() returning 0 is below any chance > 0
  assert.equal(pickDeviation(white, 1, { chance: 0, random: always }), null);
  assert.equal(pickDeviation(white, 0, { chance: 1, random: always }), null);
  assert.equal(pickDeviation(white, 1, { chance: 1, random: always }), white.branches[0]);
});

test('pickDeviation: second random() call selects among options', () => {
  const rolls = [0, 0.99];  // first: pass the chance check; second: pick last option
  const random = () => rolls.shift();
  assert.equal(pickDeviation(white, 1, { chance: 0.5, random }), white.branches[1]);
});
