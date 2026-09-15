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
