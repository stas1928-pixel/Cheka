import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../vendor/chess.js';
import { LIBRARY, SOURCES } from '../library/lines.mjs';

test('library: every line is legal, canonical SAN, has weight/kind/sources that exist', () => {
  for (const o of LIBRARY) {
    const ids = new Set();
    for (const l of o.lines) {
      const label = `${o.id}/${l.id}`;
      assert.ok(!ids.has(l.id), `${label}: duplicate id`); ids.add(l.id);
      assert.ok(['A', 'B', 'C', 'E'].includes(l.weight), `${label}: weight`);
      assert.ok(['main', 'side', 'trap', 'alt'].includes(l.kind), `${label}: kind`);
      assert.ok(l.sources.length > 0, `${label}: needs sources`);
      for (const s of l.sources) assert.ok(SOURCES[s], `${label}: unknown source key ${s}`);
      assert.ok(l.note && l.note.length > 20, `${label}: note`);
      assert.ok(l.moves.slice(0, o.root.length).every((m, i) => m === o.root[i]), `${label}: must start with the root`);
      const g = new Chess();
      l.moves.forEach((san, ply) => {
        let m;
        try { m = g.move(san); } catch { assert.fail(`${label}: illegal "${san}" at ply ${ply}`); }
        assert.equal(m.san, san, `${label}: ply ${ply} write "${m.san}"`);
      });
      assert.ok(l.theoryTo <= l.moves.length + 0, `${label}: theoryTo beyond the moves given`);
      if (l.plan) {
        assert.ok(l.planSources?.length && l.planSources.every((k) => SOURCES[k]), `${label}: plan needs known sources`);
        assert.ok(['quoted', 'interpreted'].includes(l.planBasis), `${label}: planBasis`);
      }
      if (l.mistakeAt !== undefined) {
        assert.ok(Number.isInteger(l.mistakeAt) && l.mistakeAt < l.moves.length, `${label}: mistakeAt in range`);
        assert.ok((l.mistakeAt % 2 === 0) !== (o.side === 'w'), `${label}: mistakeAt must be an opponent ply`);
      }
    }
  }
});
