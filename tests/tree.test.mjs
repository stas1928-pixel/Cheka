import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isWhitePly, isUserPly, mainLine, lineById, linesOfKind, startsWith, repertoireMove,
  continuations, definingPly, deviation, lineKey, moveLabel, describeLine, formatMoves, pickWeighted,
} from '../js/tree.js';

// A tiny fake opening so these tests do not depend on the real data.
const white = {
  side: 'w',
  signaturePlies: 3,
  lines: [
    { id: 'main', name: 'Trunk', kind: 'main', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4'] },
    { id: 'nf6', name: 'Petrov-ish', kind: 'main', moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5'], deviatesAt: 3 },
    { id: 'f5', name: 'Latvian lunge', kind: 'side', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'f5', 'Nxe5', 'Nxe5', 'dxe5'], deviatesAt: 5 },
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

test('mainLine, lineById, linesOfKind', () => {
  assert.deepEqual(mainLine(white), white.lines[0].moves);
  assert.equal(lineById(white, 'f5').name, 'Latvian lunge');
  assert.equal(lineById(white, 'nope'), null);
  assert.deepEqual(linesOfKind(white, 'side').map((l) => l.id), ['f5']);
  assert.equal(linesOfKind(white, 'main').length, 2);
});

test('startsWith / repertoireMove / continuations', () => {
  assert.equal(startsWith(['e4', 'e5', 'Nf3'], ['e4', 'e5']), true);
  assert.equal(startsWith(['e4'], ['e4', 'e5']), false);
  assert.equal(repertoireMove(white, ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'f5']), 'Nxe5');
  assert.equal(repertoireMove(white, ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4']), 'Bc4');
  assert.equal(repertoireMove(white, ['d4']), null, 'not our opening');
  assert.deepEqual(continuations(white, ['e4', 'e5', 'Nf3']).sort(), ['Nc6', 'Nf6']);
  assert.deepEqual(continuations(white, ['e4', 'e5', 'Nf3', 'Nc6', 'd4']).sort(), ['exd4', 'f5']);
  assert.deepEqual(continuations(white, ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4']), [], 'trunk ends here');
});

test('deviation and definingPly', () => {
  assert.equal(deviation(white, white.lines[0]), null);
  assert.deepEqual(deviation(white, white.lines[1]), { ply: 3, move: 'Nf6' });
  assert.deepEqual(deviation(white, white.lines[2]), { ply: 5, move: 'f5' });
  assert.equal(definingPly(white, white.lines[2]), 5);
  assert.equal(definingPly(white, white.lines[0]), 3, 'trunk: first opponent ply after the signature');
  assert.equal(lineKey(white.lines[2]), 'f5');
});

test('labels', () => {
  assert.equal(moveLabel(0, 'e4'), '1.e4');
  assert.equal(moveLabel(1, 'e5'), '1...e5');
  assert.equal(moveLabel(4, 'd4'), '3.d4');
  assert.equal(describeLine(white, white.lines[2]), '3...f5 · Latvian lunge');
  assert.equal(describeLine(white, white.lines[0]), 'Trunk');
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

test('pickWeighted respects weights, skips zeros, handles nothing pickable', () => {
  const items = ['a', 'b', 'c'];
  assert.equal(pickWeighted(items, [1, 0, 1], () => 0.0), 'a');
  assert.equal(pickWeighted(items, [1, 0, 1], () => 0.99), 'c');
  assert.equal(pickWeighted(items, [1, 0, 1], () => 0.5), 'c', 'b has weight 0 and is skipped');
  assert.equal(pickWeighted(items, [1, 3, 0], () => 0.3), 'b', '0.3*4=1.2 lands in b');
  assert.equal(pickWeighted(items, [0, 0, 0]), null);
  assert.equal(pickWeighted([], []), null);
});
