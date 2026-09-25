import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OPENINGS } from '../js/repertoire.js';
import { NAMES, humanName } from '../js/names.js';
import { describeMove } from '../js/describe.js';
import { Chess } from '../vendor/chess.js';

test('every shipped line has a human name without move notation, and every name points at a real line', () => {
  for (const o of OPENINGS) {
    const ids = new Set([...o.lines, ...(o.surprise ?? [])].map((l) => l.id));
    for (const l of [...o.lines, ...(o.surprise ?? [])]) {
      const n = NAMES[o.id]?.[l.id];
      assert.ok(n, `${o.id}/${l.id}: needs a human name in js/names.js`);
      assert.ok(!/\d\.{1,3}[A-Za-z]/.test(n), `${o.id}/${l.id}: "${n}" contains move notation`);
      assert.equal(humanName(o.id, l), n);
    }
    for (const id of Object.keys(NAMES[o.id] ?? {})) assert.ok(ids.has(id), `${o.id}/${id}: name for a line that does not exist`);
  }
});

test('plain-language move descriptions', () => {
  const g = new Chess();
  const d = (san) => describeMove(g.move(san));
  assert.equal(d('e4'), 'Pawn to e4');
  d('e5'); assert.equal(d('Nf3'), 'Knight to f3');
  d('Nc6'); d('d4'); assert.equal(d('exd4'), 'Pawn takes the pawn on d4');
  assert.equal(d('Bc4'), 'Bishop to c4');
  d('Nf6'); assert.equal(d('O-O'), 'Castles kingside');
  assert.equal(d('Nxe4'), 'Knight takes the pawn on e4');
  const h = new Chess(); for (const m of ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6']) h.move(m);
  assert.equal(describeMove(h.move('Qxf7#')), 'Queen takes the pawn on f7 — checkmate');
});
