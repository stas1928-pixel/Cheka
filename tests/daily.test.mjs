import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress, recordDaily, recordPart, recordWatch, todayCount, streakDays, levelFor, totalXp, XP } from '../js/progress.js';

const day = (s) => new Date(`${s}T12:00:00Z`);

test('every finished line counts toward today; perfect earns more; the goal bonus fires once', () => {
  const p = emptyProgress();
  for (let i = 0; i < 4; i++) assert.equal(recordDaily(p, { perfect: i % 2 === 0 }, 5, day('2026-09-24')).goalMet, false);
  const r = recordDaily(p, { perfect: true }, 5, day('2026-09-24'));
  assert.equal(r.goalMet, true);
  assert.equal(r.gained, XP.clean + XP.goalBonus);
  assert.equal(recordDaily(p, { perfect: true }, 5, day('2026-09-24')).goalMet, false);
  assert.equal(todayCount(p, day('2026-09-24')), 6);
  assert.equal(totalXp(p), 4 * XP.clean + 2 * XP.done + XP.goalBonus);
});

test('a line with mistakes still counts and earns XP', () => {
  const p = emptyProgress();
  const r = recordDaily(p, { perfect: false }, 5, day('2026-09-24'));
  assert.equal(r.gained, XP.done);
  assert.equal(todayCount(p, day('2026-09-24')), 1);
});

test('parts and watching earn XP; watching pays once per line per day', () => {
  const p = emptyProgress();
  assert.equal(recordPart(p).gained, XP.part);
  assert.equal(recordWatch(p, 'scotch/main', day('2026-09-24')).gained, XP.watch);
  assert.equal(recordWatch(p, 'scotch/main', day('2026-09-24')).gained, 0);
  assert.equal(recordWatch(p, 'scotch/main', day('2026-09-25')).gained, XP.watch);
  assert.equal(totalXp(p), XP.part + 2 * XP.watch);
  assert.equal(todayCount(p, day('2026-09-24')), 0, 'parts and watching do not count as finished lines');
});

test('streak: any day with a finished line; an empty today does not break it', () => {
  const p = emptyProgress();
  for (const d of ['2026-09-21', '2026-09-22', '2026-09-23']) recordDaily(p, { perfect: false }, 5, day(d));
  assert.equal(streakDays(p, 5, day('2026-09-24')), 3);
  recordDaily(p, { perfect: true }, 5, day('2026-09-24'));
  assert.equal(streakDays(p, 5, day('2026-09-24')), 4);
  assert.equal(streakDays(p, 5, day('2026-09-26')), 0);
});

test('levels come quickly: 30 XP to level 2, then 50 more to level 3', () => {
  assert.equal(levelFor(0).level, 1);
  assert.equal(levelFor(29).level, 1);
  assert.equal(levelFor(30).level, 2);
  assert.equal(levelFor(79).level, 2);
  assert.equal(levelFor(80).level, 3);
  assert.equal(levelFor(40).into, 10);
});
