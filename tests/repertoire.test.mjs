// Run with:  npm test   (or: node --test tests/)
//
// These tests guard the DATA the app drills. If a move is illegal, or
// written in a notation that differs from what chess.js produces (e.g.
// "Qxd8" vs "Qxd8+"), the trainer would mark a correct move as wrong.
// They also prove the provenance rules: every shipped line is exactly a
// weight A/B library line (no engine plies), no line is a prefix of
// another, every branch is deep enough, and every line carries a plan.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../vendor/chess.js';
import { OPENINGS } from '../js/repertoire.js';
import { LIBRARY, SOURCES } from '../library/lines.mjs';
import { SEED, SELECTION, clubShare } from '../tools/repertoire.seed.mjs';
import { checkStructure } from '../tools/verify-lib.mjs';
import { isUserPly, deviation, mainLine, startsWith, lineById } from '../js/tree.js';

const MIN_OUR_MOVES = 4;

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

test('the selection resolves to exact library lines: main A/B, side/trap/surprise A/B/C', () => {
  for (const sel of SELECTION) {
    const lib = LIBRARY.find((o) => o.id === sel.id);
    const seed = SEED.find((o) => o.id === sel.id);
    assert.ok(lib && seed, sel.id);
    for (const s of sel.lines) {
      const l = lib.lines.find((x) => x.id === s.use);
      assert.ok(l, `${sel.id}/${s.id}: library line ${s.use} exists`);
      const r = seed.lines.find((x) => x.id === s.id);
      assert.deepEqual(r.moves, l.moves, `${sel.id}/${s.id}: seed moves are the library's moves`);
      assert.ok(['main', 'side', 'trap'].includes(l.kind), `${sel.id}/${s.id}: kind`);
      assert.ok((l.kind === 'main' ? ['A', 'B'] : ['A', 'B', 'C']).includes(l.weight), `${sel.id}/${s.id}: weight ${l.weight}`);
      assert.ok(l.sources.length && l.sources.every((k) => SOURCES[k]), `${sel.id}/${s.id}: sources`);
      if (l.kind !== 'main') assert.ok(Number.isInteger(l.mistakeAt), `${sel.id}/${s.id}: ${l.kind} line names its mistakeAt`);
    }
    for (const s of sel.surprise ?? []) {
      const l = lib.lines.find((x) => x.id === s.use);
      assert.ok(l && l.kind === 'alt', `${sel.id}/${s.id}: a surprise must be a library 'alt' line (our alternative)`);
      const r = seed.surprise.find((x) => x.id === s.id);
      assert.deepEqual(r.moves, l.moves);
      assert.equal(r.kind, 'surprise');
    }
  }
});

test('the shipped data is the seed verbatim: zero engine plies, same ids, kinds, plans', () => {
  for (const seed of SEED) {
    const shipped = OPENINGS.find((o) => o.id === seed.id);
    assert.ok(shipped, seed.id);
    for (const set of ['lines', 'surprise']) {
      assert.equal(shipped[set].length, seed[set].length, `${seed.id}: same number of ${set}`);
      for (const [i, s] of seed[set].entries()) {
        const d = shipped[set][i];
        assert.equal(d.id, s.id, `${seed.id}: ${set} ${i} id`);
        assert.deepEqual(d.moves, s.moves, `${seed.id}/${s.id}: shipped moves equal the sourced moves (no engine additions)`);
        assert.equal(d.kind, s.kind);
        assert.equal(d.libraryId, s.libraryId);
        assert.equal(d.plan, s.plan);
        assert.equal(d.planBasis, s.planBasis);
        assert.equal(d.mistakeAt, s.mistakeAt);
      }
    }
  }
});

test('structural rules hold on the shipped data (verify-lib), including club frequency of every trap', () => {
  const flags = checkStructure(OPENINGS, { minOurMoves: MIN_OUR_MOVES, sources: SOURCES, clubShare });
  assert.deepEqual(flags, []);
});

test('every side/trap line carries its club frequency and engine swing; the mistake is common and real', () => {
  for (const o of OPENINGS) for (const l of o.lines) {
    if (l.kind === 'main') continue;
    assert.ok(l.club && l.club.share >= 10 && l.club.games >= 200, `${o.id}/${l.id}: club ${JSON.stringify(l.club)}`);
    assert.ok(l.swing >= (l.kind === 'side' ? 50 : 100), `${o.id}/${l.id}: swing ${l.swing}`);
    assert.ok(l.cp >= (l.kind === 'side' ? 75 : 150), `${o.id}/${l.id}: ends at ${l.cp}`);
  }
});

test('surprise lines are our own alternatives: they differ from the main repertoire at one of our moves and are found by lineById', () => {
  for (const o of OPENINGS) for (const l of o.surprise ?? []) {
    assert.equal(l.kind, 'surprise');
    assert.ok(isUserPly(o, l.deviatesAt), `${o.id}/${l.id}: surprise must start with OUR move`);
    const prefix = l.moves.slice(0, l.deviatesAt);
    const rep = o.lines.find((m) => startsWith(m.moves, prefix) && m.moves.length > prefix.length);
    assert.ok(rep && rep.moves[l.deviatesAt] !== l.moves[l.deviatesAt], `${o.id}/${l.id}: repertoire plays something else there`);
    assert.equal(lineById(o, l.id), l);
    assert.ok(isUserPly(o, l.moves.length - 1), 'ends after our move');
  }
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

  test(`${opening.id}: every line is legal, canonical, named, sourced, uniquely identified, with a sourced plan`, () => {
    const ids = new Set();
    for (const l of opening.lines) {
      const label = `${opening.id}/${l.id}`;
      assert.ok(l.id && !ids.has(l.id), `${label}: duplicate or missing id`);
      ids.add(l.id);
      assert.ok(l.name, `${label}: needs a name`);
      assert.ok(['main', 'side', 'trap'].includes(l.kind), `${label}: bad kind`);
      assert.ok((l.kind === 'main' ? ['A', 'B'] : ['A', 'B', 'C']).includes(l.weight), `${label}: weight`);
      assert.ok(startsWith(l.moves, mainLine(opening).slice(0, opening.signaturePlies)), `${label}: must start with the opening signature`);
      playAll(l.moves, label);
      assert.ok(l.note && l.note.length > 20, `${label}: has a note`);
      assert.ok(l.plan && l.plan.length > 20, `${label}: has a plan`);
      assert.ok(l.planSources?.length && l.planSources.every((k) => SOURCES[k]), `${label}: plan is sourced`);
      assert.ok(['quoted', 'interpreted'].includes(l.planBasis), `${label}: planBasis`);
      assert.ok(l.planCredit, `${label}: planCredit for the popup`);
      assert.ok(l.sources?.length && l.sources.every((k) => SOURCES[k]), `${label}: line is sourced`);
      assert.ok(l.libraryId && LIBRARY.find((o) => o.id === opening.id).lines.some((x) => x.id === l.libraryId), `${label}: points at a library line`);
    }
  });

  test(`${opening.id}: no exact or strict-prefix duplicate lines`, () => {
    for (const a of opening.lines) for (const b of opening.lines) {
      if (a === b) continue;
      const prefix = a.moves.length <= b.moves.length && a.moves.every((m, i) => b.moves[i] === m);
      assert.ok(!prefix, `${opening.id}/${a.id} is a prefix of (or equal to) ${b.id}`);
    }
  });

  test(`${opening.id}: each non-trunk line leaves the trunk at an opponent ply, ends after our move, ≥ ${MIN_OUR_MOVES} of our moves after`, () => {
    for (const l of opening.lines.slice(1)) {
      const d = deviation(opening, l);
      assert.ok(d, `${opening.id}/${l.id}: identical to the trunk`);
      assert.equal(d.ply, l.deviatesAt, `${opening.id}/${l.id}: deviatesAt`);
      assert.ok(!isUserPly(opening, d.ply), `${opening.id}/${l.id}: deviation must be the opponent's move`);
      assert.ok(isUserPly(opening, l.moves.length - 1), `${opening.id}/${l.id}: must end after our move`);
      let ours = 0;
      for (let p = d.ply + 1; p < l.moves.length; p++) if (isUserPly(opening, p)) ours++;
      assert.ok(ours >= MIN_OUR_MOVES, `${opening.id}/${l.id}: only ${ours} of our moves after ${d.move}`);
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
