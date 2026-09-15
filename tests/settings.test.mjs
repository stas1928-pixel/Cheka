import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSettings, saveSettings, updateSetting, DEFAULT_SETTINGS, SETTINGS_KEY } from '../js/settings.js';

/** In-memory stand-in for localStorage. */
function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

test('loadSettings returns defaults on an empty store', () => {
  assert.deepEqual(loadSettings(fakeStorage()), DEFAULT_SETTINGS);
});

test('updateSetting persists and merges with defaults', () => {
  const s = fakeStorage();
  updateSetting('sound', false, s);
  assert.equal(loadSettings(s).sound, false);
  assert.equal(loadSettings(s).deviationChance, DEFAULT_SETTINGS.deviationChance);
});

test('an unknown key from an older version is kept, a missing new key gets its default', () => {
  const s = fakeStorage();
  s.setItem(SETTINGS_KEY, JSON.stringify({ sound: false, legacy: 1 }));
  const loaded = loadSettings(s);
  assert.equal(loaded.sound, false);
  assert.equal(loaded.legacy, 1);
  assert.equal(loaded.lichessToken, '');
});

test('corrupt JSON falls back to defaults instead of throwing', () => {
  const s = fakeStorage();
  s.setItem(SETTINGS_KEY, '{not json');
  assert.deepEqual(loadSettings(s), DEFAULT_SETTINGS);
});

test('saveSettings round-trips', () => {
  const s = fakeStorage();
  saveSettings({ ...DEFAULT_SETTINGS, chesscomUser: 'someone' }, s);
  assert.equal(loadSettings(s).chesscomUser, 'someone');
});
