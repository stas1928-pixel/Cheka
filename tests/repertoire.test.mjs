// Run with:  npm test   (or: node --test tests/)
//
// These tests guard the DATA. If a move is illegal, or written in a
// notation that differs from what chess.js produces (e.g. "Qxd8" vs
// "Qxd8+"), the trainer would mark a correct move as wrong. Catch it here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../vendor/chess.js';
import { OPENINGS } from '../js/repertoire.js';
import { isUserPly, deviation, mainLine, startsWith } from '../js/tree.js';

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
  test(`${opening.id}: trunk is first, kind main, legal, canonical, deep enough`, () => {
    const trunk = opening.lines[0];
    assert.equal(trunk.kind, 'main');
    assert.equal(trunk.deviatesAt ?? null, null, 'the trunk deviates from nothing');
    playAll(trunk.moves, `${opening.id} trunk`);
    assert.ok(trunk.moves.length >= 16, 'brief asks for roughly 20 plies');
  });

  test(`${opening.id}: signature ends with the user's defining move`, () => {
    assert.ok(opening.signaturePlies > 0 && opening.signaturePlies <= mainLine(opening).length);
    assert.ok(isUserPly(opening, opening.signaturePlies - 1), 'last signature ply should be ours');
  });

  test(`${opening.id}: every line is legal, canonical, named, uniquely identified`, () => {
    const ids = new Set();
    for (const l of opening.lines) {
      const label = `${opening.id}/${l.id}`;
      assert.ok(l.id && !ids.has(l.id), `${label}: duplicate or missing id`);
      ids.add(l.id);
      assert.ok(l.name, `${label}: needs a name`);
      assert.ok(['main', 'side'].includes(l.kind), `${label}: bad kind`);
      assert.ok(startsWith(l.moves, mainLine(opening).slice(0, opening.signaturePlies)), `${label}: must start with the opening signature`);
      playAll(l.moves, label);
      assert.ok(l.note, `${label}: has a note (hand-written or automatic)`);
    }
  });

  test(`${opening.id}: each non-trunk line leaves the trunk at an opponent ply, where it says it does`, () => {
    for (const l of opening.lines.slice(1)) {
      const d = deviation(opening, l);
      assert.ok(d, `${opening.id}/${l.id}: identical to the trunk`);
      assert.equal(d.ply, l.deviatesAt, `${opening.id}/${l.id}: deviatesAt`);
      assert.ok(!isUserPly(opening, d.ply), `${opening.id}/${l.id}: deviation must be the opponent's move`);
      assert.ok(l.moves.length > d.ply + 1, `${opening.id}/${l.id}: needs at least one reply after the deviation`);
    }
  });

  test(`${opening.id}: our side plays one move per position across all lines`, () => {
    const seen = new Map(); // prefix -> our move
    for (const l of opening.lines) {
      for (let ply = 0; ply < l.moves.length; ply++) {
        if (!isUserPly(opening, ply)) continue;
        const key = l.moves.slice(0, ply).join(' ');
        const prev = seen.get(key);
        assert.ok(!prev || prev === l.moves[ply], `${opening.id}: after "${key}" we play both ${prev} and ${l.moves[ply]} (${l.id})`);
        seen.set(key, l.moves[ply]);
      }
    }
  });
}
