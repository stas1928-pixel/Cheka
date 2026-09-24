/* ---------------------------------------------------------------
   SETTINGS — small user preferences, kept in localStorage.

   The `storage` argument is injectable so tests can pass a plain
   object instead of the browser's localStorage.
--------------------------------------------------------------- */

export const SETTINGS_KEY = 'openingTrainer.settings.v1';

export const DEFAULT_SETTINGS = Object.freeze({
  sound: false,           // owner: sound skipped for now (haptics instead)
  haptics: true,          // vibration on events (Android)
  dailyGoal: 5,           // clean lines per day for the streak (3 / 5 / 10 / 20)
  lineMode: 'main',       // which tab of lines to train:
                          //   'main' – the main variations
                          //   'side' – opponent mistakes and their punishments
                          //   'surprise' – our own offbeat weapons
                          //   'mine' – whatever showed up in YOUR games, weighted by frequency
  hiddenLines: {},        // { [openingId]: { [lineId]: true } } — lines unticked in the list
  deviationChance: 0.35,  // kept for old saved settings; no longer used
  lichessToken: '',       // personal API token for the Opening Explorer (job 6)
  chesscomUser: '',       // Chess.com username for the game import (job 8)
});

export function loadSettings(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    // Defaults first, then whatever was saved on top — so adding a new
    // setting later never breaks an existing install.
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings, storage = globalThis.localStorage) {
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}

/** Change one setting and persist. Returns the new settings object. */
export function updateSetting(key, value, storage = globalThis.localStorage) {
  const next = { ...loadSettings(storage), [key]: value };
  return saveSettings(next, storage);
}
