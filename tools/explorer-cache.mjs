/* ---------------------------------------------------------------
   Cached Lichess opening-explorer client for the Node tools.

   Three databases:
     masters  — OTB games of 2200+ players (theory in practice)
     amateur  — Lichess blitz+rapid, ratings 1400-1800 (the owner's
                opponents: "is this mistake something real people play?")
     strong   — Lichess blitz+rapid, ratings 2200-2500 (strong human
                players online: our move where masters are too thin)

   Results are stored in library/explorer-cache.json so the verifier and
   the tests run offline and deterministically. Network is used only when
   a position is not cached AND a token (lip_…) is present in .env; the
   token is read, never printed.
--------------------------------------------------------------- */
import fs from 'node:fs';
import { Chess } from '../vendor/chess.js';

export const CACHE_FILE = 'library/explorer-cache.json';
const BASE = {
  masters: 'https://explorer.lichess.ovh/masters?',
  amateur: 'https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid&ratings=1400,1600,1800&',
  strong: 'https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid&ratings=2200,2500&',
};

let cache = null;
export function loadCache() {
  if (!cache) cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};
  return cache;
}
export function saveCache() {
  if (!cache) return;
  // Merge with whatever another process wrote meanwhile, so concurrent tools never clobber each other.
  if (fs.existsSync(CACHE_FILE)) {
    try { for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')))) if (!cache[k]) cache[k] = v; } catch { /* partial write by another process: keep ours */ }
  }
  const sorted = Object.fromEntries(Object.keys(cache).sort().map((k) => [k, cache[k]]));
  fs.writeFileSync(CACHE_FILE, '{\n' + Object.entries(sorted).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n') + '\n}\n');
}
const key = (db, sans) => `${db}|${sans.join(' ')}`;

/** Offline lookup: the cached node or null. */
export function cached(db, sans) {
  return loadCache()[key(db, sans)] ?? null;
}

let token;
function getToken() {
  if (token === undefined) token = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8').match(/lip_[A-Za-z0-9]+/)?.[0] ?? null : null;
  return token;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cached node, fetching it if needed (and possible). Shape: { total, opening, moves: [{ san, games, share }] } */
export async function node(db, sans) {
  const c = cached(db, sans);
  if (c) return c;
  const t = getToken();
  if (!t) return null;
  const g = new Chess();
  const uci = sans.map((s) => { const m = g.move(s); return m.from + m.to + (m.promotion ?? ''); }).join(',');
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`${BASE[db]}play=${uci}&moves=12&topGames=0&recentGames=0`, { headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' } });
    if (res.status === 429) { await sleep(61000); continue; }
    if (!res.ok) throw new Error(`explorer ${db} HTTP ${res.status}`);
    const d = await res.json();
    const total = d.white + d.draws + d.black;
    const out = {
      total, opening: d.opening?.name ?? null,
      moves: d.moves.map((m) => { const n = m.white + m.draws + m.black; return { san: m.san, games: n, share: total ? Math.round(1000 * n / total) / 10 : 0 }; }),
    };
    loadCache()[key(db, sans)] = out;
    await sleep(300);
    return out;
  }
  throw new Error('explorer rate-limited');
}

/** Share (%) of `san` at the position after `sans` in `db`, from cache only. null if unknown. */
export function shareOf(db, sans, san) {
  const n = cached(db, sans);
  if (!n) return null;
  return n.moves.find((m) => m.san === san)?.share ?? 0;
}
