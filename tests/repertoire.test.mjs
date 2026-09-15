// Run with:  npm test   (or: node --test tests/)
//
// These tests guard the DATA. If a move is illegal, or written in a
// notation that differs from what chess.js produces (e.g. "Qxd8" vs
// "Qxd8+"), the trainer would mark a correct move as wrong. Catch it here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../vendor/chess.js';
import { OPENINGS } from '../js/repertoire.js';
import { buildLine, isUserPly } from '../js/tree.js';

/** Play a SAN list from the start; throws if any move is illegal.
 *  Also asserts each SAN is exactly the canonical form chess.js emits. */
function playAll(sans, label) {
  const game = new Chess();
  sans.forEach((san, ply) => {
    let move;
    try {
      move = game.move(san);
    } catch (err) {
      assert.fail(`${label}: illegal move "${san}" at ply ${ply} (${err.message})`);
    }
    assert.equal(move.san, san, `${label}: ply ${ply} should be written "${move.san}" not "${san}"`);
  });
  return game;
}

test('opening ids are unique and sides are valid', () => {
  const ids = OPENINGS.map((o) => o.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const o of OPENINGS) assert.ok(o.side === 'w' || o.side === 'b', o.id);
});

for (const opening of OPENINGS) {
  test(`${opening.id}: main line is legal, canonical, and deep enough`, () => {
    playAll(opening.mainLine, `${opening.id} main`);
    assert.ok(opening.mainLine.length >= 16, 'brief asks for roughly 20 plies');
  });

  test(`${opening.id}: signature ends with the user's defining move`, () => {
    assert.ok(opening.signaturePlies > 0 && opening.signaturePlies <= opening.mainLine.length);
    assert.ok(isUserPly(opening, opening.signaturePlies - 1), 'last signature ply should be ours');
  });

  test(`${opening.id}: every branch is a legal opponent deviation with a response`, () => {
    for (const b of opening.branches) {
      const label = `${opening.id} branch ${b.deviatesAt}:${b.opponentMove}`;
      assert.ok(!isUserPly(opening, b.deviatesAt), `${label}: deviation must be on an opponent ply`);
      assert.notEqual(b.opponentMove, opening.mainLine[b.deviatesAt], `${label}: not a deviation`);
      assert.ok(b.response.length >= 1, `${label}: needs a response`);
      assert.ok(['punishment', 'tactical'].includes(b.type), `${label}: bad type`);
      playAll(buildLine(opening, b), label);
    }
  });
}
