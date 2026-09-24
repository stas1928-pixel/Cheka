/* ---------------------------------------------------------------
   PROGRESS — accuracy, streaks and weak spots, per opening.

   Shape stored in localStorage:
   {
     version: 1,
     openings: {
       scotch: {
         attempts, correct,          // every user move in training mode
         streak, bestStreak,         // consecutive correct moves
         linesCompleted,
         lastTrained,                // ISO date-time string
         mistakes: {                 // keyed by "<lineKey>#<ply>"
           "main#4": { count, expected, lastPlayed, lastAt }
         }
       }
     }
   }

   All functions take the progress object in and hand it back, so the
   app owns one object and saves it when it likes. `storage` is
   injectable for tests (see tests/progress.test.mjs).
--------------------------------------------------------------- */

export const PROGRESS_KEY = 'openingTrainer.progress.v1';

export function emptyProgress() {
  return { version: 1, openings: {} };
}

function emptyOpening() {
  return {
    attempts: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    linesCompleted: 0,
    lastTrained: null,
    mistakes: {},
  };
}

/** Get (creating if needed) the record for one opening. */
export function openingStats(progress, openingId) {
  progress.openings[openingId] ??= emptyOpening();
  return progress.openings[openingId];
}

/* ---------- persistence ---------- */

export function loadProgress(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    return raw ? validate(JSON.parse(raw)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress, storage = globalThis.localStorage) {
  storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
}

export function resetProgress(storage = globalThis.localStorage) {
  storage.removeItem(PROGRESS_KEY);
  return emptyProgress();
}

/* ---------- recording ---------- */

/**
 * One user move in training mode.
 * `lineKey` comes from tree.lineKey(), `ply` is where in the line the
 * move belongs, `expected` is the SAN we wanted, `played` what came in.
 */
export function recordAttempt(progress, openingId, { correct, lineKey, ply, expected, played }, now = new Date()) {
  const s = openingStats(progress, openingId);
  s.attempts += 1;
  s.lastTrained = now.toISOString();

  if (correct) {
    s.correct += 1;
    s.streak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
  } else {
    s.streak = 0;
    const key = `${lineKey}#${ply}`;
    const m = s.mistakes[key] ??= { count: 0, expected, lastPlayed: null, lastAt: null };
    m.count += 1;
    m.expected = expected;
    m.lastPlayed = played ?? null;
    m.lastAt = now.toISOString();
  }
  return progress;
}

export function recordLineComplete(progress, openingId, now = new Date()) {
  const s = openingStats(progress, openingId);
  s.linesCompleted += 1;
  s.lastTrained = now.toISOString();
  return progress;
}

/* ---------- reading ---------- */

/** Percentage 0..100 (rounded), or null before any attempt. */
export function accuracy(stats) {
  if (!stats || stats.attempts === 0) return null;
  return Math.round((100 * stats.correct) / stats.attempts);
}

/** The positions you get wrong most, worst first. */
export function weakSpots(progress, openingId, limit = 3) {
  const s = progress.openings[openingId];
  if (!s) return [];
  return Object.entries(s.mistakes)
    .map(([key, m]) => {
      const [lineKey, ply] = key.split('#');
      return { key, lineKey, ply: Number(ply), expected: m.expected, count: m.count, lastPlayed: m.lastPlayed };
    })
    .sort((a, b) => b.count - a.count || a.ply - b.ply)
    .slice(0, limit);
}

/* ---------- spaced repetition per line ----------
   Each drilled line gets { interval (days), due (ISO), reps, lapses }.
   A clean run multiplies the interval (1 → 2 → 5 → 11 → 25 days …);
   any mistake resets it to 1 day. Lines never drilled are always due.
   The picker turns this into weights: due lines first, the more overdue
   the heavier; not-yet-due lines still get a small chance. */

const DAY = 24 * 60 * 60 * 1000;

/* Mastery tiers: how many CLEAN runs (no mistake) a line has, lifetime. */
export const TIERS = Object.freeze([
  { name: 'Bronze', at: 3 },
  { name: 'Silver', at: 6 },
  { name: 'Gold', at: 10 },
  { name: 'Master', at: 15 },
]);

/** { tier: 'Bronze' | null, next: { name, at } | null, clean, progress 0..1 toward next } */
export function tierFor(clean) {
  let tier = null;
  let prevAt = 0;
  for (const t of TIERS) {
    if (clean >= t.at) { tier = t.name; prevAt = t.at; } else {
      return { tier, next: t, clean, progress: (clean - prevAt) / (t.at - prevAt) };
    }
  }
  return { tier, next: null, clean, progress: 1 };
}

export function lineTier(progress, openingId, lineId) {
  return tierFor(progress.openings[openingId]?.lines?.[lineId]?.clean ?? 0);
}

export function scheduleLine(progress, openingId, lineId, { perfect }, now = new Date()) {
  const s = openingStats(progress, openingId);
  s.lines ??= {};
  const entry = s.lines[lineId] ?? { interval: 0, due: null, reps: 0, lapses: 0, clean: 0 };
  entry.reps += 1;
  entry.clean = (entry.clean ?? 0) + (perfect ? 1 : 0);
  if (perfect) {
    entry.interval = entry.interval === 0 ? 1 : Math.round(entry.interval * 2.3 * 10) / 10;
  } else {
    entry.interval = 1;
    entry.lapses += 1;
  }
  entry.due = new Date(now.getTime() + entry.interval * DAY).toISOString();
  entry.lastAt = now.toISOString();
  s.lines[lineId] = entry;
  return entry;
}

/** { state: 'new' | 'due' | 'later', overdueDays } for a line. */
export function lineStatus(progress, openingId, lineId, now = new Date()) {
  const entry = progress.openings[openingId]?.lines?.[lineId];
  if (!entry || !entry.due) return { state: 'new', overdueDays: 0, entry: null };
  const overdue = (now.getTime() - new Date(entry.due).getTime()) / DAY;
  return overdue >= 0
    ? { state: 'due', overdueDays: Math.floor(overdue), entry }
    : { state: 'later', overdueDays: Math.ceil(overdue), entry }; // negative = days until due
}

/** Weight for the random picker: new 3, due 2 + overdue days (max 10), later 0.2. */
export function lineWeight(progress, openingId, lineId, now = new Date()) {
  const { state, overdueDays } = lineStatus(progress, openingId, lineId, now);
  if (state === 'new') return 3;
  if (state === 'due') return 2 + Math.min(overdueDays, 8);
  return 0.2;
}

export function dueCount(progress, openingId, lineIds, now = new Date()) {
  return lineIds.filter((id) => lineStatus(progress, openingId, id, now).state !== 'later').length;
}

/* ---------- backup ---------- */

export function exportJSON(progress) {
  return JSON.stringify(progress, null, 2);
}

/** Parse a backup. Throws with a readable message if it is not ours. */
export function importJSON(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  return validate(parsed);
}

function validate(obj) {
  if (!obj || typeof obj !== 'object' || obj.version !== 1 || typeof obj.openings !== 'object' || obj.openings === null) {
    throw new Error('That file is not an Opening Trainer progress backup.');
  }
  // Fill any missing fields so old backups keep working.
  for (const id of Object.keys(obj.openings)) {
    obj.openings[id] = { ...emptyOpening(), ...obj.openings[id] };
  }
  return obj;
}

/* ---------------------------------------------------------------
   DAILY LOOP (design phase, 2026-09-24): daily goal, streak, XP, level.
   Stored under progress.daily = { days: { 'YYYY-MM-DD': cleanLines }, xp }.
   - A day counts toward the streak when its clean lines ≥ the goal.
   - XP: 10 per clean line, 3 per line completed with mistakes; +25 bonus
     the moment the day's goal is met. Level n needs 100·n XP more.
--------------------------------------------------------------- */
export const XP = Object.freeze({ clean: 10, done: 3, goalBonus: 25 });

const dayKey = (d) => d.toISOString().slice(0, 10);

function daily(progress) {
  progress.daily ??= { days: {}, xp: 0 };
  progress.daily.days ??= {};
  progress.daily.xp ??= 0;
  return progress.daily;
}

/** Record one finished line for the daily loop. Returns what happened, for the UI. */
export function recordDaily(progress, { perfect }, goal = 5, now = new Date()) {
  const d = daily(progress);
  const k = dayKey(now);
  const before = d.days[k] ?? 0;
  const levelBefore = levelFor(d.xp).level;
  let gained = perfect ? XP.clean : XP.done;
  if (perfect) d.days[k] = before + 1;
  const goalMet = perfect && before < goal && before + 1 >= goal;
  if (goalMet) gained += XP.goalBonus;
  d.xp += gained;
  return { gained, goalMet, today: d.days[k] ?? 0, levelUp: levelFor(d.xp).level > levelBefore };
}

/** Clean lines today. */
export function todayCount(progress, now = new Date()) {
  return daily(progress).days[dayKey(now)] ?? 0;
}

/** Consecutive days (ending today, or yesterday if today is not done yet) with the goal met. */
export function streakDays(progress, goal = 5, now = new Date()) {
  const days = daily(progress).days;
  const d = new Date(now);
  if ((days[dayKey(d)] ?? 0) < goal) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while ((days[dayKey(d)] ?? 0) >= goal) { n++; d.setUTCDate(d.getUTCDate() - 1); }
  return n;
}

/** Level from total XP: level 1 at 0, level n+1 after 100·n more. */
export function levelFor(xp) {
  let level = 1, need = 100, rest = xp;
  while (rest >= need) { rest -= need; level++; need = 100 * level; }
  return { level, into: rest, need, progress: rest / need };
}

export function totalXp(progress) {
  return daily(progress).xp;
}
