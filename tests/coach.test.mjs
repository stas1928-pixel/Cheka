import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { OPENINGS } from '../js/repertoire.js';
import IDEAS_DATA from '../js/ideas.data.js';
import { IDEAS } from '../library/ideas.mjs';
import { SOURCES } from '../library/lines.mjs';
import { moveFacts, factSentence } from '../js/facts.js';
import { coachSay, defaultWhy, factMarks, ownThreat } from '../js/coach.js';

const threats = JSON.parse(readFileSync(new URL('../library/ideas-threats.json', import.meta.url), 'utf8'));
const SAN = /\b[KQRBN][a-h]?[1-8]?x?[a-h][1-8]\b|\bO-O\b|\b[a-h]x[a-h][1-8]\b|(?<![a-h])\d+\.{1,3}\s?[a-hKQRBNO]|…[a-hKQRBN]/;
const squares = (s) => new Set(s.match(/\b[a-h][1-8]\b/g) ?? []);

function plies() {
  const out = [];
  for (const o of OPENINGS) for (const l of [...o.lines, ...(o.surprise ?? [])]) {
    l.moves.forEach((san, i) => out.push({ o, before: l.moves.slice(0, i), san, key: l.moves.slice(0, i + 1).join(' '), mine: (o.side === 'w') === (i % 2 === 0) }));
  }
  return out;
}

test('every shipped ply has coach text with a source, and no move notation', () => {
  for (const p of plies()) {
    const e = IDEAS_DATA[p.key];
    assert.ok(e, `${p.key}: no coach entry — run node tools/build-ideas.mjs`);
    assert.ok(e.say && e.why, `${p.key}: say and why are required`);
    assert.ok(e.src?.length, `${p.key}: needs a source`);
    for (const s of e.src) assert.ok(s in SOURCES || s === 'position' || s === 'sf', `${p.key}: unknown source "${s}"`);
    assert.ok(!SAN.test(e.say), `${p.key}: say has notation: "${e.say}"`);
    assert.ok(!SAN.test(e.why), `${p.key}: why has notation: "${e.why}"`);
  }
});

test('the coach names no square that its own why or marks do not name (no invented claims)', () => {
  for (const p of plies()) {
    const e = IDEAS_DATA[p.key];
    const allowed = new Set([...squares(e.why), ...(e.marks?.circles ?? []), ...(e.marks?.arrows ?? []).flatMap((a) => a.split('-'))]);
    for (const sq of squares(e.say)) assert.ok(allowed.has(sq), `${p.key}: say names ${sq}, which its why does not: "${e.say}" / "${e.why}"`);
  }
});

test('generated coach data equals the library + facts + cached threats (generator is the only writer)', () => {
  for (const p of plies()) {
    const f = moveFacts(p.before, p.san);
    const t = threats[p.key] ?? null;
    const src = IDEAS[p.key];
    const marks = src?.marks ?? factMarks(f, t);
    const want = {
      say: src?.say ?? coachSay(f, { mine: p.mine, key: p.key, threat: t }),
      why: src?.why ?? defaultWhy(f, t),
      src: src ? src.src : ownThreat(f, t) ? ['position', 'sf'] : ['position'],
      ...(marks.arrows.length || marks.circles.length ? { marks } : {}),
    };
    assert.deepEqual(IDEAS_DATA[p.key], want, `${p.key}: stale — run node tools/build-ideas.mjs`);
  }
  for (const k of Object.keys(IDEAS)) assert.ok(k in IDEAS_DATA, `library/ideas.mjs key is on no shipped line: ${k}`);
});

test('board facts are true on known positions', () => {
  const f = moveFacts(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6', 'e5', 'd5'], 'Bb5');
  assert.equal(f.pins[0].square, 'c6');
  assert.equal(f.pins[0].toPiece, 'k');
  assert.ok(f.escapes, 'the bishop on c4 was attacked by the d5 pawn');
  const g = moveFacts(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6'], 'e5');
  assert.ok(g.hits.some((h) => h.square === 'f6' && h.piece === 'n'));
  const c = moveFacts(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6', 'e5', 'd5', 'Bb5', 'Ne4', 'Nxd4', 'Bd7', 'Bxc6'], 'bxc6');
  assert.ok(c.recapture);
  assert.match(factSentence(moveFacts([], 'e4')), /^Pawn to e4/);
  const castle = moveFacts(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], 'O-O');
  assert.equal(castle.castle, 'king');
});
