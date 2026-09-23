// The verifier must FAIL CLOSED: any structural or engine flag → no data.
// Driven with a fake engine so it runs in milliseconds.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkStructure, verify } from '../tools/verify-lib.mjs';

const SRC = { book: { type: 'book', ref: 'x' } };
const line = (id, moves, extra = {}) => ({
  id, libraryId: id, name: id, kind: 'main', weight: 'A', moves, sources: ['book'],
  note: 'a note that is long enough to pass', plan: 'a plan that is long enough to pass', planSources: ['book'], planBasis: 'quoted', ...extra,
});
const TRUNK = ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6', 'e5', 'd5', 'Bb5', 'Ne4', 'Nxd4', 'Bd7', 'Bxc6', 'bxc6', 'O-O'];
const good = () => [{ id: 'scotch', name: 'Scotch', side: 'w', signaturePlies: 5, lines: [
  line('main', TRUNK),
  line('bc5', [...TRUNK.slice(0, 13), 'Bc5', 'Be3', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'O-O', 'f3']),
] }];

/** Fake engine: flat evaluation, always agrees with whatever is played. */
const flat = async (sans) => ({ cp: 0, bestMove: null });

test('a clean seed has no structural flags and verifies to data with the seed moves verbatim', async () => {
  assert.deepEqual(checkStructure(good(), { sources: SRC }), []);
  const r = await verify(good(), flat, { sources: SRC });
  assert.equal(r.ok, true);
  assert.deepEqual(r.data[0].lines.map((l) => l.moves), good()[0].lines.map((l) => l.moves));
  assert.equal(r.data[0].lines[1].deviatesAt, 13);
  assert.equal(r.data[0].lines[1].plan, 'a plan that is long enough to pass');
});

test('structural flags: prefix duplicate, ends on opponent move, too shallow, our-ply deviation, REPEAT, weight C, missing plan', () => {
  const s = good();
  s[0].lines.push(line('prefix', TRUNK.slice(0, 15)));
  s[0].lines.push(line('shallow', [...TRUNK.slice(0, 13), 'Be7', 'Be3', 'O-O', 'f3']));            // 2 of our moves, ends on ours
  s[0].lines.push(line('oppend', [...TRUNK.slice(0, 13), 'Bb4+', 'c3', 'Bc5', 'Be3', 'O-O', 'f3', 'Ng5', 'f4', 'Ne4']));
  s[0].lines.push(line('ourdev', [...TRUNK.slice(0, 12), 'O-O', 'Bd7', 'Bxc6', 'bxc6', 'Nxd4', 'Bc5', 'f3', 'Ng5', 'f4']));
  s[0].lines.push(line('repeat', [...TRUNK.slice(0, 13), 'Bd7', 'Bxc6', 'bxc6', 'Be3', 'Bc5', 'f3', 'Ng5', 'f4', 'Ne4', 'Nd2']));   // Bd7 line already exists in trunk → prefix? no: differs at ply 14 (our ply) → REPEAT + our-ply deviation
  s[0].lines.push(line('weightc', [...TRUNK.slice(0, 13), 'Bc5', 'Be3', 'Bxd4', 'Qxd4', 'O-O', 'Bxc6', 'bxc6', 'Nc3'], { weight: 'C', plan: null, planBasis: 'guess' }));
  const flags = checkStructure(s, { sources: SRC });
  const has = (re) => assert.ok(flags.some((f) => re.test(f)), `expected a flag matching ${re}\n${flags.join('\n')}`);
  has(/prefix: strict prefix of main/);
  has(/shallow: only 2 of our moves/);
  has(/oppend: ends after the opponent's/);
  has(/ourdev: deviates at OUR ply/);
  has(/repeat: .*(REPEAT|deviates at OUR ply)/);
  has(/weightc: weight C — main lines ship only as A\/B/);
  has(/weightc: needs a plan/);
  has(/weightc: planBasis/);
});

test('an illegal or non-canonical move is flagged', () => {
  const s = good();
  s[0].lines.push(line('illegal', [...TRUNK.slice(0, 13), 'Bc5', 'Be3', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'O-O', 'Ke2']));
  s[0].lines.push(line('san', [...TRUNK.slice(0, 13), 'Bc5', 'Be3', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'O-O', 'Nb3', 'a5', 'Qd8+', 'Rxd8', 'Rd1']));
  const flags = checkStructure(s, { sources: SRC });
  assert.ok(flags.some((f) => /illegal: ILLEGAL Ke2/.test(f)), flags.join('\n'));
  assert.ok(flags.some((f) => /^scotch\/san: (ILLEGAL|SAN)/.test(f)), flags.join('\n'));
});

test('engine DROP → not ok, no data', async () => {
  // engine says: after 12 plies best is Nxd4 (what we play) — but at ply 14 (Bxc6) it prefers O-O and the eval falls 0.8
  const eng = async (sans) => {
    if (sans.length === 14) return { cp: 80, bestMove: 'O-O' };
    if (sans.length === 15) return { cp: 0, bestMove: 'bxc6' };
    return { cp: 0, bestMove: null };
  };
  const r = await verify(good(), eng, { sources: SRC });
  assert.equal(r.ok, false);
  assert.equal(r.data, null);
  assert.ok(r.flags.some((f) => /DROP 8\.Bxc6 -0\.80/.test(f)), r.flags.join('\n'));
});

// A trap: after 7...Bc5 8.Be3 the opponent's 8...Bd7 is declared the mistake (ply 15).
const trapSeed = () => { const s = good(); s[0].lines[1].kind = 'trap'; s[0].lines[1].mistakeAt = 15; return s; };
const club = (share, total = 5000) => () => ({ share, total });
/** Fake engine: +2.5 for White once the mistake is on the board, 0 before. */
const trapEngine = async (sans) => ({ cp: sans.length >= 16 ? 250 : 0, bestMove: null });

test('a trap that is common and really a mistake passes and carries mistakeAt + swing', async () => {
  const r = await verify(trapSeed(), trapEngine, { sources: SRC, clubShare: club(23) });
  assert.equal(r.ok, true, r.flags.join('\n'));
  assert.equal(r.data[0].lines[1].mistakeAt, 15);
  assert.equal(r.data[0].lines[1].swing, 250);
});

test('a trap whose mistake is rare among club players is flagged RARE → no data', async () => {
  const r = await verify(trapSeed(), trapEngine, { sources: SRC, clubShare: club(4) });
  assert.equal(r.ok, false);
  assert.ok(r.flags.some((f) => /RARE 8\.\.\.Bd7: 4% of 5000/.test(f)), r.flags.join('\n'));
  const thin = await verify(trapSeed(), trapEngine, { sources: SRC, clubShare: club(40, 50) });
  assert.ok(thin.flags.some((f) => /RARE .*of 50 club games/.test(f)));
  const none = await verify(trapSeed(), trapEngine, { sources: SRC, clubShare: () => null });
  assert.ok(none.flags.some((f) => /RARE\? no club data/.test(f)));
});

test('a trap whose "mistake" costs nothing, or that ends without the gain locked in, is flagged → no data', async () => {
  const r = await verify(trapSeed(), flat, { sources: SRC, clubShare: club(23) });
  assert.equal(r.ok, false);
  assert.equal(r.data, null);
  assert.ok(r.flags.some((f) => /NOT-A-MISTAKE 8\.\.\.Bd7 swings only 0\.00/.test(f)), r.flags.join('\n'));
  assert.ok(r.flags.some((f) => /SIDE\? trap line ends at 0\.00/.test(f)));
});

test('side lines use the softer thresholds (swing ≥ 0.5, end ≥ 0.75); trap/side lines need mistakeAt', async () => {
  const s = trapSeed(); s[0].lines[1].kind = 'side';
  // +0.7 swing on the mistake, line ends +1.2: enough for a side line, not for a trap
  const eng = async (sans) => ({ cp: sans.length >= 16 ? (sans.length >= 21 ? 120 : 70) : 0, bestMove: null });
  const r = await verify(s, eng, { sources: SRC, clubShare: club(23) });
  assert.equal(r.ok, true, r.flags.join('\n'));
  const r2 = await verify(trapSeed(), eng, { sources: SRC, clubShare: club(23) });
  assert.ok(r2.flags.some((f) => /NOT-A-MISTAKE .* swings only 0\.70/.test(f)), r2.flags.join('\n'));
  assert.ok(r2.flags.some((f) => /SIDE\? trap line ends at 1\.20/.test(f)));
  const u = trapSeed(); delete u[0].lines[1].mistakeAt;
  let flags = checkStructure(u, { sources: SRC, clubShare: club(23) });
  assert.ok(flags.some((f) => /mistakeAt undefined must be an opponent ply/.test(f)));
  const c = trapSeed(); c[0].lines[1].weight = 'C';           // C is fine for a trap
  assert.deepEqual(checkStructure(c, { sources: SRC, clubShare: club(23) }), []);
});

test('surprise lines: must leave the main repertoire at OUR move, are consistent among themselves, may be weight C', async () => {
  const s = good();
  // 5.O-O instead of the repertoire's 5.e5 (Anderssen/Nakhmanson-style), 4 of our moves from the surprise on
  const sur = (id, moves, extra = {}) => ({ ...line(id, moves, { kind: 'surprise', weight: 'C', ...extra }) });
  s[0].surprise = [sur('oo', [...TRUNK.slice(0, 8), 'O-O', 'Nxe4', 'Re1', 'd5', 'Bxd5', 'Qxd5', 'Nc3'])];
  assert.deepEqual(checkStructure(s, { sources: SRC }), []);
  const r = await verify(s, flat, { sources: SRC });
  assert.equal(r.ok, true);
  assert.equal(r.data[0].surprise[0].deviatesAt, 8);
  assert.equal(r.data[0].surprise[0].kind, 'surprise');
  // a "surprise" that never differs from the repertoire is flagged
  s[0].surprise.push(sur('same', [...TRUNK.slice(0, 13), 'Bc5', 'Be3', 'Bd7', 'Bxc6', 'bxc6', 'O-O', 'O-O', 'f3']));
  let flags = checkStructure(s, { sources: SRC });
  assert.ok(flags.some((f) => /same: never leaves the main repertoire/.test(f)), flags.join('\n'));
  // two surprise lines playing different moves in the same position → REPEAT
  s[0].surprise = [s[0].surprise[0], sur('oo2', [...TRUNK.slice(0, 8), 'O-O', 'Nxe4', 'Re1', 'd5', 'Nc3', 'dxc4', 'Rxe4+'])];
  flags = checkStructure(s, { sources: SRC });
  assert.ok(flags.some((f) => /oo2: REPEAT/.test(f)), flags.join('\n'));
  // a surprise line must not sit in opening.lines
  const w = good(); w[0].lines.push(sur('inlines', [...TRUNK.slice(0, 8), 'O-O', 'Nxe4', 'Re1', 'd5', 'Bxd5', 'Qxd5', 'Nc3']));
  assert.ok(checkStructure(w, { sources: SRC }).some((f) => /inlines: kind surprise not allowed in opening.lines/.test(f)));
});

test('a structural flag alone blocks the data even when the engine is happy', async () => {
  const s = good();
  s[0].lines.push(line('prefix', TRUNK.slice(0, 15)));
  const r = await verify(s, flat, { sources: SRC });
  assert.equal(r.ok, false);
  assert.equal(r.data, null);
});
