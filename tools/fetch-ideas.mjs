/* ---------------------------------------------------------------
   R1 — harvest per-move ideas from public sources into a local cache.

   - Lichess studies named in library/lines.mjs SOURCES (public PGN
     export, no token): every comment is keyed by the SAN path it follows.
   - Wikibooks "Chess Opening Theory": one page per position, raw wikitext,
     fetched along the shipped lines until a page does not exist.

   Output: library/ideas-cache/ (git-ignored — third-party text), plus
   library/ideas-cache/index.json { path → [{ src, text }] } and a coverage
   report on stdout. Re-running uses the cache; --refresh re-downloads.
   Usage: node tools/fetch-ideas.mjs [--refresh]
--------------------------------------------------------------- */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Chess } from '../vendor/chess.js';
import { SOURCES } from '../library/lines.mjs';
import REPERTOIRE from '../js/repertoire.data.js';

const DIR = new URL('../library/ideas-cache/', import.meta.url);
mkdirSync(DIR, { recursive: true });
const refresh = process.argv.includes('--refresh');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cached(name, url) {
  const f = new URL(name, DIR);
  if (!refresh && existsSync(f)) { const t = readFileSync(f, 'utf8'); return t === '\u0000404' ? null : t; }
  await sleep(400);
  const res = await fetch(url, { headers: { 'User-Agent': 'Cheka opening trainer (personal research)' } });
  const text = res.ok ? await res.text() : '\u0000404';
  writeFileSync(f, text);
  return res.ok ? text : null;
}

/* ---------- PGN with comments and variations → { path: [comment] } ---------- */
export function pgnComments(pgn) {
  const out = {};
  const games = pgn.split(/\n(?=\[Event )/);
  for (const g of games) {
    if (/\[FEN "/.test(g) && !/\[FEN "rnbqkbnr\/pppppppp\/8\/8\/8\/8\/PPPPPPPP\/RNBQKBNR w KQkq - 0 1"\]/.test(g)) continue;
    const body = g.replace(/^\[.*\]\s*$/gm, '');
    const tokens = body.match(/\{[^}]*\}|\(|\)|\$\d+|\d+\.(?:\.\.)?|[^\s(){}]+/g) ?? [];
    let cur = { chess: new Chess(), path: [] };
    let prev = null;               // state before the last move on this level
    const stack = [];
    const add = (path, text) => {
      const t = text.replace(/\[%[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      (out[path.join(' ')] ??= []).push(t);
    };
    for (const tk of tokens) {
      if (tk.startsWith('{')) add(cur.path, tk.slice(1, -1));
      else if (tk === '(') { stack.push({ cur, prev }); cur = prev ? { chess: new Chess(prev.chess.fen()), path: [...prev.path] } : cur; prev = null; }
      else if (tk === ')') ({ cur, prev } = stack.pop() ?? { cur, prev });
      else if (/^\$\d+$|^\d+\.|^(1-0|0-1|1\/2-1\/2|\*)$/.test(tk)) continue;
      else {
        const before = { chess: new Chess(cur.chess.fen()), path: [...cur.path] };
        let mv = null;
        try { mv = cur.chess.move(tk.replace(/[!?]+$/, '')); } catch { mv = null; }
        if (!mv) break;            // unparseable — stop this game rather than mis-key comments
        prev = before;
        cur.path.push(mv.san);
      }
    }
  }
  return out;
}

/* ---------- Wikibooks URL for a SAN path ---------- */
export function wikibooksUrl(path) {
  const parts = path.map((san, i) => `${Math.floor(i / 2) + 1}${i % 2 ? '...' : '._'}${san}`);
  return `https://en.wikibooks.org/w/index.php?title=${encodeURIComponent('Chess_Opening_Theory/' + parts.join('/'))}&action=raw`;
}
/** Strip wiki markup to readable prose (tables and templates dropped). */
function wikiProse(raw) {
  return raw
    .replace(/\{\|[\s\S]*?\|\}/g, ' ')
    .replace(/\{\{[^{}]*\}\}/g, ' ')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/<ref[\s\S]*?<\/ref>|<[^>]+>/g, ' ')
    .replace(/^=+.*=+\s*$/gm, ' ')
    .replace(/'''?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const index = {};
const push = (path, src, text) => (index[path] ??= []).push({ src, text });

// 1. studies
for (const [id, s] of Object.entries(SOURCES)) {
  const m = s.url?.match(/lichess\.org\/study\/(\w+)/);
  if (!m) continue;
  const pgn = await cached(`study-${m[1]}.pgn`, `https://lichess.org/api/study/${m[1]}.pgn?comments=true&variations=true&clocks=false`);
  if (!pgn) { console.log(`study ${id}: not available`); continue; }
  const c = pgnComments(pgn);
  for (const [p, arr] of Object.entries(c)) for (const t of arr) push(p, id, t);
  console.log(`study ${id}: ${Object.keys(c).length} commented positions`);
}

// 2. wikibooks along shipped lines (stop descending when a page is missing)
const paths = new Set();
for (const o of REPERTOIRE) for (const l of [...o.lines, ...(o.surprise ?? [])]) for (let i = 1; i <= l.moves.length; i++) paths.add(l.moves.slice(0, i).join(' '));
const missing = new Set();
let wbPages = 0;
for (const p of [...paths].sort((a, b) => a.split(' ').length - b.split(' ').length)) {
  const arr = p.split(' ');
  if (missing.has(arr.slice(0, -1).join(' '))) { missing.add(p); continue; }
  const name = `wb-${createHash('sha1').update(p).digest('hex').slice(0, 12)}.txt`;
  const raw = await cached(name, wikibooksUrl(arr));
  if (!raw || /^#REDIRECT/i.test(raw)) { missing.add(p); continue; }
  wbPages++;
  const prose = wikiProse(raw);
  if (prose.length > 40) push(p, 'wikibooks', prose.slice(0, 1500));
}
console.log(`wikibooks: ${wbPages} pages along our lines`);

writeFileSync(new URL('index.json', DIR), JSON.stringify(index, null, 1));

// 3. coverage of shipped plies
for (const o of REPERTOIRE) {
  const all = new Set();
  for (const l of [...o.lines, ...(o.surprise ?? [])]) for (let i = 1; i <= l.moves.length; i++) all.add(l.moves.slice(0, i).join(' '));
  const hit = [...all].filter((p) => index[p]);
  console.log(`${o.id}: ${hit.length} of ${all.size} plies have at least one source comment`);
}
