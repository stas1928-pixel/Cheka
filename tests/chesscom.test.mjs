import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OPENINGS, getOpening } from '../js/repertoire.js';
import {
  archivesUrl, importGames, parseMoves, userSide, matchesOpening, walkGame, analyseGames, ChesscomError,
} from '../js/chesscom.js';

const scotch = getOpening('scotch');
const elephant = getOpening('elephant');

/** Build a Chess.com-looking PGN with clock comments and "1..." numbering. */
function pgn(moves, { white = 'me', black = 'them' } = {}) {
  const body = moves.map((san, i) => {
    const n = Math.floor(i / 2) + 1;
    const num = i % 2 === 0 ? `${n}. ` : `${n}... `;
    return `${num}${san} {[%clk 0:09:5${9 - (i % 10)}]}`;
  }).join(' ');
  return `[Event "Live Chess"]\n[Site "Chess.com"]\n[White "${white}"]\n[Black "${black}"]\n[Result "*"]\n\n${body} *`;
}

test('archivesUrl lower-cases and encodes the username', () => {
  assert.equal(archivesUrl('Some One'), 'https://api.chess.com/pub/player/some%20one/games/archives');
});

test('parseMoves strips clock comments and Black move numbers', () => {
  const sans = ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6'];
  assert.deepEqual(parseMoves(pgn(sans)), sans);
  assert.deepEqual(parseMoves('garbage 1. Zz9'), []);
});

test('userSide is case-insensitive and null for strangers', () => {
  const g = { white: { username: 'Stas' }, black: { username: 'other' } };
  assert.equal(userSide(g, 'stas'), 'w');
  assert.equal(userSide(g, 'OTHER'), 'b');
  assert.equal(userSide(g, 'nobody'), null);
});

test('matchesOpening needs our side and the signature prefix', () => {
  const s = ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4'];
  assert.equal(matchesOpening(s, 'w', scotch), true);
  assert.equal(matchesOpening(s, 'b', scotch), false, 'we were Black, so not our Scotch');
  assert.equal(matchesOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], 'w', scotch), false, 'Ruy Lopez');
  assert.equal(matchesOpening(['e4', 'e5', 'Nf3'], 'w', scotch), false, 'too short');
  assert.equal(matchesOpening(['e4', 'e5', 'Nf3', 'd5'], 'b', elephant), true);
});

test('walkGame: complete main line, known branch, gap, user left book, game ended early', () => {
  assert.deepEqual(walkGame(scotch.mainLine, scotch), { result: 'complete', branch: null });

  // 3...d6 is a prepared branch; the game follows the whole response
  const viaBranch = ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'd6', 'dxe5', 'dxe5', 'Qxd8+', 'Kxd8', 'Bc4', 'Nf6'];
  const w1 = walkGame(viaBranch, scotch);
  assert.equal(w1.result, 'complete');
  assert.equal(w1.branch.opponentMove, 'd6');

  // 3...Bc5?! is not covered -> gap after the 5-ply prefix
  const w2 = walkGame(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'Bc5', 'c3'], scotch);
  assert.equal(w2.result, 'gap');
  assert.equal(w2.ply, 5);
  assert.equal(w2.move, 'Bc5');
  assert.deepEqual(w2.prefix, ['e4', 'e5', 'Nf3', 'Nc6', 'd4']);

  // we played 3.Bc4 instead of 3.d4 -> userLeft
  const w3 = walkGame(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], scotch);
  assert.deepEqual(w3, { result: 'userLeft', ply: 4, move: 'Bc4', expected: 'd4', branch: null });

  // deviation inside a branch is a gap too (branches do not nest)
  const w4 = walkGame(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'd6', 'dxe5', 'Nxe5'], scotch);
  assert.equal(w4.result, 'gap');
  assert.equal(w4.move, 'Nxe5');
  assert.equal(w4.branch.opponentMove, 'd6');

  assert.deepEqual(walkGame(['e4', 'e5', 'Nf3'], scotch), { result: 'gameEnded', ply: 3, branch: null });
});

// Fixture openings, so editing the real repertoire never breaks these
// logic tests. The real data is validated in repertoire.test.mjs instead.
const FIXTURES = [
  {
    id: 'asWhite',
    side: 'w',
    signaturePlies: 5,
    mainLine: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6'],
    branches: [{ deviatesAt: 5, opponentMove: 'd6', response: ['dxe5'], type: 'punishment' }],
  },
  {
    id: 'asBlack',
    side: 'b',
    signaturePlies: 4,
    mainLine: ['e4', 'e5', 'Nf3', 'd5', 'exd5', 'e4', 'Qe2'],
    branches: [],
  },
];

test('analyseGames aggregates gaps per opening, most frequent first', () => {
  const games = [
    { url: 'g1', rules: 'chess', white: { username: 'me' }, black: { username: 'a' }, pgn: pgn(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'Bc5', 'c3']) },
    { url: 'g2', rules: 'chess', white: { username: 'me' }, black: { username: 'b' }, pgn: pgn(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'Bc5', 'Nxe5']) },
    { url: 'g3', rules: 'chess', white: { username: 'me' }, black: { username: 'c' }, pgn: pgn(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Bc5']) },
    { url: 'g4', rules: 'chess', white: { username: 'me' }, black: { username: 'd' }, pgn: pgn(['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'd6', 'dxe5']) },
    { url: 'g5', rules: 'chess', white: { username: 'x' }, black: { username: 'me' }, pgn: pgn(['e4', 'e5', 'Nf3', 'd5', 'exd5', 'e4', 'Ne5'], { white: 'x', black: 'me' }) },
    { url: 'g6', rules: 'chess', white: { username: 'x' }, black: { username: 'me' }, pgn: pgn(['d4', 'd5'], { white: 'x', black: 'me' }) },
  ];
  const r = analyseGames(games, 'ME', FIXTURES);

  assert.equal(r.asWhite.games, 4);
  assert.equal(r.asWhite.gaps.length, 2);
  assert.equal(r.asWhite.gaps[0].move, 'Bc5', 'ply-5 Bc5 happened twice, so it ranks first');
  assert.equal(r.asWhite.gaps[0].count, 2);
  assert.deepEqual(r.asWhite.gaps[0].urls, ['g1', 'g2']);
  assert.equal(r.asWhite.gaps[1].ply, 7, 'the later Bc5 is a separate gap');
  assert.deepEqual(r.asWhite.branchHits, { '5:d6': 1 });

  assert.equal(r.asBlack.games, 1, 'the d4 game is not this opening');
  assert.equal(r.asBlack.gaps[0].move, 'Ne5');
  assert.equal(r.asBlack.gaps[0].ply, 6);
});

function fakeFetch(routes) {
  const calls = [];
  const impl = async (url) => {
    calls.push(url);
    const hit = routes[url];
    if (!hit) return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => hit };
  };
  return { impl, calls };
}

test('importGames fetches the last N archives serially and keeps standard chess only', async () => {
  const base = 'https://api.chess.com/pub/player/me/games';
  const f = fakeFetch({
    [`${base}/archives`]: { archives: [`${base}/2026/06`, `${base}/2026/07`, `${base}/2026/08`, `${base}/2026/09`] },
    [`${base}/2026/08`]: { games: [{ rules: 'chess', pgn: 'a' }, { rules: 'chess960', pgn: 'b' }] },
    [`${base}/2026/09`]: { games: [{ rules: 'chess', pgn: 'c' }] },
  });
  const progress = [];
  const games = await importGames('Me', { months: 2, fetchImpl: f.impl, onProgress: (d, t) => progress.push([d, t]) });
  assert.deepEqual(games.map((g) => g.pgn), ['a', 'c']);
  assert.deepEqual(progress, [[1, 2], [2, 2]]);
  assert.deepEqual(f.calls, [`${base}/archives`, `${base}/2026/08`, `${base}/2026/09`]);
});

test('importGames turns a 404 into a readable error', async () => {
  const f = fakeFetch({});
  await assert.rejects(importGames('ghost', { fetchImpl: f.impl }), (e) => e instanceof ChesscomError && /ghost/.test(e.message));
});
