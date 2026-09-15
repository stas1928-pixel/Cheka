import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyProgress, loadProgress, saveProgress, resetProgress, recordAttempt,
  recordLineComplete, accuracy, weakSpots, exportJSON, importJSON, PROGRESS_KEY,
} from '../js/progress.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

const T0 = new Date('2026-09-15T10:00:00Z');
const ok = (ply) => ({ correct: true, lineKey: 'main', ply, expected: 'x' });
const bad = (ply, expected = 'Nf3', played = 'Nc3', lineKey = 'main') =>
  ({ correct: false, lineKey, ply, expected, played });

test('accuracy is null before any attempt, then a rounded percentage', () => {
  const p = emptyProgress();
  assert.equal(accuracy(p.openings.scotch), null);
  recordAttempt(p, 'scotch', ok(0), T0);
  recordAttempt(p, 'scotch', ok(2), T0);
  recordAttempt(p, 'scotch', bad(4), T0);
  assert.equal(accuracy(p.openings.scotch), 67);
  assert.equal(p.openings.scotch.lastTrained, '2026-09-15T10:00:00.000Z');
});

test('streak grows on correct, resets on a mistake, best streak is kept', () => {
  const p = emptyProgress();
  for (let i = 0; i < 4; i++) recordAttempt(p, 'elephant', ok(i), T0);
  assert.equal(p.openings.elephant.streak, 4);
  recordAttempt(p, 'elephant', bad(4), T0);
  assert.equal(p.openings.elephant.streak, 0);
  assert.equal(p.openings.elephant.bestStreak, 4);
  recordAttempt(p, 'elephant', ok(5), T0);
  assert.equal(p.openings.elephant.streak, 1);
  assert.equal(p.openings.elephant.bestStreak, 4);
});

test('weak spots: most-missed first, limited, with ply and expected move', () => {
  const p = emptyProgress();
  recordAttempt(p, 'scotch', bad(4, 'd4', 'Bc4'), T0);
  recordAttempt(p, 'scotch', bad(4, 'd4', 'Nc3'), T0);
  recordAttempt(p, 'scotch', bad(8, 'Nc3'), T0);
  recordAttempt(p, 'scotch', bad(1, 'Nxd4', 'Qxd4', 'b5:Nxd4'), T0);
  recordAttempt(p, 'scotch', bad(1, 'Nxd4', 'Qxd4', 'b5:Nxd4'), T0);
  recordAttempt(p, 'scotch', bad(1, 'Nxd4', 'Qxd4', 'b5:Nxd4'), T0);

  const spots = weakSpots(p, 'scotch', 2);
  assert.equal(spots.length, 2);
  assert.deepEqual(spots[0], { key: 'b5:Nxd4#1', lineKey: 'b5:Nxd4', ply: 1, expected: 'Nxd4', count: 3, lastPlayed: 'Qxd4' });
  assert.equal(spots[1].key, 'main#4');
  assert.equal(spots[1].lastPlayed, 'Nc3', 'remembers the most recent wrong move');
  assert.deepEqual(weakSpots(p, 'elephant'), []);
});

test('recordLineComplete counts lines', () => {
  const p = emptyProgress();
  recordLineComplete(p, 'scotch', T0);
  recordLineComplete(p, 'scotch', T0);
  assert.equal(p.openings.scotch.linesCompleted, 2);
});

test('save / load / reset round-trip through storage', () => {
  const s = fakeStorage();
  assert.deepEqual(loadProgress(s), emptyProgress());
  const p = recordAttempt(emptyProgress(), 'scotch', ok(0), T0);
  saveProgress(p, s);
  assert.deepEqual(loadProgress(s), p);
  resetProgress(s);
  assert.deepEqual(loadProgress(s), emptyProgress());
});

test('corrupt or foreign storage content loads as empty', () => {
  const s = fakeStorage();
  s.setItem(PROGRESS_KEY, 'nope');
  assert.deepEqual(loadProgress(s), emptyProgress());
  s.setItem(PROGRESS_KEY, JSON.stringify({ something: 'else' }));
  assert.deepEqual(loadProgress(s), emptyProgress());
});

test('export / import round-trip; import fills missing fields; rejects garbage', () => {
  const p = recordAttempt(emptyProgress(), 'scotch', bad(4), T0);
  const back = importJSON(exportJSON(p));
  assert.deepEqual(back, p);

  const partial = importJSON(JSON.stringify({ version: 1, openings: { scotch: { attempts: 3, correct: 3 } } }));
  assert.equal(partial.openings.scotch.bestStreak, 0);
  assert.deepEqual(partial.openings.scotch.mistakes, {});

  assert.throws(() => importJSON('{oops'), /valid JSON/);
  assert.throws(() => importJSON(JSON.stringify({ version: 2, openings: {} })), /not an Opening Trainer/);
  assert.throws(() => importJSON(JSON.stringify([1, 2])), /not an Opening Trainer/);
});
