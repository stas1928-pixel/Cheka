import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBlunders, aggregate, analyseGames, scoreFor } from '../js/weakness.js';

/** Scripted engine keyed by the moves played so far. */
function scripted(table) {
  return async (sans) => {
    const r = table[sans.join(' ')];
    if (!r) throw new Error(`no scripted eval for "${sans.join(' ')}"`);
    return { cp: r.cp ?? null, mate: r.mate ?? null, bestMove: r.best ?? null };
  };
}

test('scoreFor flips for Black and treats mate as ±30 pawns', () => {
  assert.equal(scoreFor({ cp: 50, mate: null }, 'w'), 50);
  assert.equal(scoreFor({ cp: 50, mate: null }, 'b'), -50);
  assert.equal(scoreFor({ cp: null, mate: 3 }, 'w'), 3000);
  assert.equal(scoreFor({ cp: null, mate: -3 }, 'b'), 3000);
  assert.equal(scoreFor({ cp: null, mate: null }, 'w'), 0);
});

test('findBlunders flags only our moves that lose a pawn or more', async () => {
  // White: 1.e4 e5 2.Ke2?? (drop) 2...Nc6 3.Nf3 (fine)
  const sans = ['e4', 'e5', 'Ke2', 'Nc6', 'Nf3'];
  const evaluate = scripted({
    '': { cp: 30, best: 'e4' },
    'e4': { cp: 30, best: 'e5' },
    'e4 e5': { cp: 30, best: 'Nf3' },
    'e4 e5 Ke2': { cp: -120, best: 'Nc6' },      // our move cost 1.5 pawns
    'e4 e5 Ke2 Nc6': { cp: -110, best: 'Nf3' },
    'e4 e5 Ke2 Nc6 Nf3': { cp: -100, best: 'd5' },
  });
  const found = await findBlunders(sans, 'w', evaluate, { depth: 1 });
  assert.equal(found.length, 1);
  assert.equal(found[0].ply, 2);
  assert.equal(found[0].played, 'Ke2');
  assert.equal(found[0].best, 'Nf3');
  assert.equal(found[0].drop, 150);
  assert.match(found[0].fen, /^rnbqkbnr\/pppp1ppp\/8\/4p3\/4P3\/8\/PPPP1PPP\/RNBQKBNR w/);
});

test('findBlunders respects maxPly and the Black point of view', async () => {
  const sans = ['e4', 'e5', 'Nf3', 'f6', 'Nxe5'];
  const evaluate = scripted({
    'e4': { cp: 30, best: 'e5' },
    'e4 e5': { cp: 30, best: 'Nf3' },
    'e4 e5 Nf3': { cp: 30, best: 'Nc6' },
    'e4 e5 Nf3 f6': { cp: 180, best: 'Nxe5' },   // Black (us) dropped 1.5
  });
  const found = await findBlunders(sans, 'b', evaluate, { maxPly: 4 });
  assert.equal(found.length, 1);
  assert.equal(found[0].played, 'f6');
  assert.equal(found[0].best, 'Nc6');
  assert.equal(found[0].drop, 150);
});

test('aggregate merges by position and ranks by count × drop', () => {
  const list = [
    { fen: 'A', ply: 2, played: 'Ke2', best: 'Nf3', drop: 150, url: 'g1', side: 'w', openingId: 'scotch' },
    { fen: 'A', ply: 2, played: 'Ke2', best: 'Nf3', drop: 130, url: 'g2', side: 'w', openingId: 'scotch' },
    { fen: 'A', ply: 2, played: 'Qh5', best: 'Nf3', drop: 110, url: 'g2', side: 'w', openingId: 'scotch' },
    { fen: 'B', ply: 6, played: 'a3', best: 'O-O', drop: 500, url: 'g3', side: 'w', openingId: 'scotch' },
  ];
  const agg = aggregate(list);
  assert.equal(agg.length, 2);
  assert.equal(agg[0].fen, 'B', '1×500 outranks 3×130');
  assert.equal(agg[1].count, 3);
  assert.equal(agg[1].avgDrop, 130);
  assert.deepEqual(agg[1].played, { Ke2: 2, Qh5: 1 });
  assert.deepEqual(agg[1].urls, ['g1', 'g2'], 'no duplicate urls');
});

test('analyseGames reports progress and can be stopped', async () => {
  const evaluate = async () => ({ cp: 0, mate: null, bestMove: 'e4' });
  const games = [{ sans: ['e4'], side: 'w', url: 'g1' }, { sans: ['e4'], side: 'w', url: 'g2' }, { sans: ['e4'], side: 'w', url: 'g3' }];
  const progress = [];
  let stops = 0;
  const agg = await analyseGames(games, evaluate, { onProgress: (d, t) => progress.push(`${d}/${t}`), shouldStop: () => ++stops > 2 });
  assert.deepEqual(progress, ['1/3', '2/3']);
  assert.deepEqual(agg, []);
});
