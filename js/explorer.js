/* ---------------------------------------------------------------
   LICHESS OPENING EXPLORER — master-game statistics for a position.

   Used in Review mode only, as a read-only lookup: "what do strong
   players actually play here, and how does it go for them?"

   Vendor facts (see docs/sources.md, checked 2026-09-15):
   - Endpoint wants moves in UCI ("e2e4"), not SAN ("e4"). We convert
     with chess.js.
   - Anonymous requests get HTTP 401. A personal API token from
     https://lichess.org/account/oauth/token (no scopes needed) is sent
     as `Authorization: Bearer <token>`.
   - Response: { white, draws, black, moves: [{ uci, san, white, draws,
     black, averageRating }], opening: { eco, name } }.

   `fetchImpl` is injectable so tests never touch the network.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';

export const EXPLORER_BASE = 'https://explorer.lichess.ovh/masters';

export class ExplorerError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind; // 'auth' | 'rate' | 'http' | 'network'
  }
}

/** ["e4","e5","Nf3"] -> "e2e4,e7e5,g1f3" */
export function uciPath(sans) {
  const game = new Chess();
  return sans
    .map((san) => {
      const m = game.move(san);
      return m.from + m.to + (m.promotion ?? '');
    })
    .join(',');
}

export function explorerUrl(sans, { moves = 8 } = {}) {
  const url = new URL(EXPLORER_BASE);
  url.searchParams.set('play', uciPath(sans));
  url.searchParams.set('moves', String(moves));
  url.searchParams.set('topGames', '0');
  return url.toString();
}

/** Turn the raw response into what the UI needs: shares and W/D/B percentages. */
export function summarize(json) {
  const total = (json.white ?? 0) + (json.draws ?? 0) + (json.black ?? 0);
  const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
  return {
    total,
    opening: json.opening ?? null,
    moves: (json.moves ?? []).map((m) => {
      const games = m.white + m.draws + m.black;
      return {
        san: m.san,
        uci: m.uci,
        games,
        sharePct: pct(games, total),
        whitePct: pct(m.white, games),
        drawPct: pct(m.draws, games),
        blackPct: pct(m.black, games),
        averageRating: m.averageRating ?? null,
      };
    }),
  };
}

// Positions rarely change between two taps of ◀ ▶, so remember answers
// for this page load. Nothing is written to disk.
const cache = new Map();

export async function fetchExplorer(sans, { token, moves = 8, fetchImpl = globalThis.fetch } = {}) {
  const url = explorerUrl(sans, { moves });
  if (cache.has(url)) return cache.get(url);

  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetchImpl(url, { headers });
  } catch {
    throw new ExplorerError('Could not reach Lichess. Are you online?', 'network');
  }
  if (res.status === 401) throw new ExplorerError('Lichess needs an API token — add one in Settings.', 'auth');
  if (res.status === 429) throw new ExplorerError('Lichess rate limit hit — wait a minute.', 'rate');
  if (!res.ok) throw new ExplorerError(`Lichess explorer error ${res.status}.`, 'http');

  const summary = summarize(await res.json());
  cache.set(url, summary);
  return summary;
}

/** For tests and for a manual refresh button, if we ever add one. */
export function clearExplorerCache() {
  cache.clear();
}
