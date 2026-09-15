# External sources consulted

Record every external URL used for a decision, with the date checked.

| Date | Source | What we learned |
|---|---|---|
| 2026-09-15 | https://cdnjs.cloudflare.com/ajax/libs/chess.js/1.0.0/chess.min.js | **404.** The prototype's script tag pointed at a file that does not exist. chess.js 1.x is shipped only as ESM/CJS (`dist/esm/chess.js`), no browser global. |
| 2026-09-15 | https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js | Vendored as `vendor/chess.js` (72 KB, BSD-2-Clause, licence alongside). `move()` **throws** on an illegal move in 1.x, it does not return null. |
| 2026-09-15 | https://explorer.lichess.ovh/masters and https://explorer.lichess.org/masters | Both answer **HTTP 401 Authorization Required** to anonymous requests, from two unrelated networks. CORS headers allow `Authorization`. Conclusion: the masters explorer now needs a Lichess personal API token sent as `Authorization: Bearer <token>`. Create one at https://lichess.org/account/oauth/token (no scopes needed). |
| 2026-09-15 | https://raw.githubusercontent.com/lichess-org/api/master/doc/specs/lichess-api.yaml | Explorer params: `fen`, `play` (comma-separated **UCI** moves, not SAN), `since`, `until`, `moves` (how many to return), `topGames`. Response: `white`, `draws`, `black`, `moves[] {uci, san, white, draws, black, averageRating}`, `opening {eco, name}`. |
| 2026-09-15 | https://www.chess.com/news/view/published-data-api | `GET https://api.chess.com/pub/player/{username}/games/archives` lists month URLs; `.../games/{YYYY}/{MM}` returns `games[]` with `pgn`, `white.username`, `black.username`, `white.result`, `time_class`, `rules`, `end_time`. No auth. Serial requests unlimited, parallel may 429. Responses carry `ETag`. `Access-Control-Allow-Origin: *` confirmed by hand, so browser fetch works. |
