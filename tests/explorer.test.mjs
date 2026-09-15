import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  uciPath, explorerUrl, summarize, fetchExplorer, clearExplorerCache, ExplorerError,
} from '../js/explorer.js';

test('uciPath converts SAN to UCI, including castling', () => {
  assert.equal(uciPath(['e4', 'e5', 'Nf3', 'd5']), 'e2e4,e7e5,g1f3,d7d5');
  assert.equal(uciPath(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'O-O']).split(',').at(-1), 'e1g1');
  assert.equal(uciPath([]), '');
});

test('explorerUrl carries play, moves and topGames=0', () => {
  const u = new URL(explorerUrl(['e4', 'e5'], { moves: 5 }));
  assert.equal(u.origin + u.pathname, 'https://explorer.lichess.ovh/masters');
  assert.equal(u.searchParams.get('play'), 'e2e4,e7e5');
  assert.equal(u.searchParams.get('moves'), '5');
  assert.equal(u.searchParams.get('topGames'), '0');
});

const sample = {
  white: 60, draws: 30, black: 10,
  opening: { eco: 'C44', name: 'Scotch Game' },
  moves: [
    { uci: 'e5d4', san: 'exd4', white: 50, draws: 25, black: 5, averageRating: 2450 },
    { uci: 'b8c6', san: 'Nxd4', white: 10, draws: 5, black: 5 },
  ],
};

test('summarize computes totals, shares and W/D/B percentages', () => {
  const s = summarize(sample);
  assert.equal(s.total, 100);
  assert.equal(s.opening.name, 'Scotch Game');
  assert.deepEqual(s.moves[0], {
    san: 'exd4', uci: 'e5d4', games: 80, sharePct: 80,
    whitePct: 63, drawPct: 31, blackPct: 6, averageRating: 2450,
  });
  assert.equal(s.moves[1].averageRating, null);
  assert.deepEqual(summarize({}), { total: 0, opening: null, moves: [] });
});

function fakeFetch(status, body) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  return { impl, calls };
}

test('fetchExplorer sends the bearer token and returns a summary', async () => {
  clearExplorerCache();
  const f = fakeFetch(200, sample);
  const s = await fetchExplorer(['e4'], { token: 'abc', fetchImpl: f.impl });
  assert.equal(s.total, 100);
  assert.equal(f.calls[0].init.headers.Authorization, 'Bearer abc');
  assert.match(f.calls[0].url, /play=e2e4/);
});

test('fetchExplorer omits the header without a token and maps 401 to an auth error', async () => {
  clearExplorerCache();
  const f = fakeFetch(401, {});
  await assert.rejects(
    fetchExplorer(['e4'], { fetchImpl: f.impl }),
    (err) => err instanceof ExplorerError && err.kind === 'auth',
  );
  assert.equal(f.calls[0].init.headers.Authorization, undefined);
});

test('fetchExplorer maps 429, other HTTP errors, and network failures', async () => {
  clearExplorerCache();
  await assert.rejects(fetchExplorer(['e4'], { fetchImpl: fakeFetch(429, {}).impl }), (e) => e.kind === 'rate');
  await assert.rejects(fetchExplorer(['e4'], { fetchImpl: fakeFetch(500, {}).impl }), (e) => e.kind === 'http');
  await assert.rejects(
    fetchExplorer(['e4'], { fetchImpl: async () => { throw new TypeError('offline'); } }),
    (e) => e.kind === 'network',
  );
});

test('fetchExplorer caches per URL within a session', async () => {
  clearExplorerCache();
  const f = fakeFetch(200, sample);
  await fetchExplorer(['e4', 'e5'], { fetchImpl: f.impl });
  await fetchExplorer(['e4', 'e5'], { fetchImpl: f.impl });
  assert.equal(f.calls.length, 1);
});
