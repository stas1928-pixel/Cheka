import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress, recordDaily, todayCount, streakDays, levelFor, totalXp, XP } from '../js/progress.js';

const day = (s) => new Date(`${s}T12:00:00Z`);

test('clean lines count toward the goal and earn XP; the goal bonus fires once', () => {
  const p = emptyProgress();
  for (let i = 0; i < 4; i++) assert.equal(recordDaily(p, { perfect: true }, 5, day('2026-09-24')).goalMet, false);
  const r = recordDaily(p, { perfect: true }, 5, day('2026-09-24'));
  assert.equal(r.goalMet, true);
  assert.equal(r.gained, XP.clean + XP.goalBonus);
  assert.equal(recordDaily(p, { perfect: true }, 5, day('2026-09-24')).goalMet, false);
  assert.equal(todayCount(p, day('2026-09-24')), 6);
  assert.equal(totalXp(p), 6 * XP.clean + XP.goalBonus);
});

test('a line with mistakes earns a little XP but no goal progress', () => {
  const p = emptyProgress();
  const r = recordDaily(p, { perfect: false }, 5, day('2026-09-24'));
  assert.equal(r.gained, XP.done);
  assert.equal(todayCount(p, day('2026-09-24')), 0);
});

test('streak counts consecutive goal days; an unfinished today does not break it', () => {
  const p = emptyProgress();
  for (const d of ['2026-09-21', '2026-09-22', '2026-09-23']) for (let i = 0; i < 3; i++) recordDaily(p, { perfect: true }, 3, day(d));
  assert.equal(streakDays(p, 3, day('2026-09-24')), 3);
  for (let i = 0; i < 3; i++) recordDaily(p, { perfect: true }, 3, day('2026-09-24'));
  assert.equal(streakDays(p, 3, day('2026-09-24')), 4);
  assert.equal(streakDays(p, 3, day('2026-09-26')), 0);
});

test('levels: 100 XP to level 2, 200 more to level 3', () => {
  assert.equal(levelFor(0).level, 1);
  assert.equal(levelFor(99).level, 1);
  assert.equal(levelFor(100).level, 2);
  assert.equal(levelFor(299).level, 2);
  assert.equal(levelFor(300).level, 3);
  assert.equal(levelFor(150).into, 50);
});
