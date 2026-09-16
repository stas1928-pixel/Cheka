/* ---------------------------------------------------------------
   SETTINGS — small user preferences, kept in localStorage.

   The `storage` argument is injectable so tests can pass a plain
   object instead of the browser's localStorage.
--------------------------------------------------------------- */

export const SETTINGS_KEY = 'openingTrainer.settings.v1';

export const DEFAULT_SETTINGS = Object.freeze({
  sound: true,            // chime / buzz on correct / incorrect
  lineMode: 'all',        // what the opponent does in training:
                          //   'main' – always the main line
                          //   'all'  – a random prepared side line (or the main line)
                          //   'mine' – side lines weighted by how often YOUR opponents played them
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
