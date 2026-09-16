/* ---------------------------------------------------------------
   TREE HELPERS — pure functions over the repertoire shape.

   An opening is a bundle of LINES that all start from the same root:
     { id, name, side, signaturePlies, lines: [
         { id, name, kind: 'main' | 'side', moves: [san…], deviatesAt?, … } ] }
   - lines[0] is the TRUNK (the primary main line).
   - every other line shares a prefix with the trunk and leaves it at
     `deviatesAt` (an opponent ply) with a different opponent move.
   - kind 'main' = a sound variation you must know; kind 'side' = an
     opponent mistake with the punishment worked out.
   Because a repertoire is "one move per position for OUR side", any two
   lines that reach the same position play the same move for us. The
   repertoire tests check that.

   "Pure" means: no DOM, no chess engine, no randomness unless passed in.
--------------------------------------------------------------- */

/** Even plies are White's moves, odd plies are Black's. */
export function isWhitePly(ply) {
  return ply % 2 === 0;
}

/** Is it the user's turn at this ply, given which side they train? */
export function isUserPly(opening, ply) {
  return isWhitePly(ply) === (opening.side === 'w');
}

/** The trunk: the primary main line's moves. */
export function mainLine(opening) {
  return opening.lines[0].moves;
}

export function lineById(opening, id) {
  return opening.lines.find((l) => l.id === id) ?? null;
}

export function linesOfKind(opening, kind) {
  return opening.lines.filter((l) => l.kind === kind);
}

/** Does `moves` start with every move of `prefix`? */
export function startsWith(moves, prefix) {
  return prefix.length <= moves.length && prefix.every((m, i) => moves[i] === m);
}

/**
 * The move our repertoire plays after `prefix` (any line that goes through
 * this position). null when no line reaches that far.
 */
export function repertoireMove(opening, prefix) {
  for (const l of opening.lines) {
    if (l.moves.length > prefix.length && startsWith(l.moves, prefix)) return l.moves[prefix.length];
  }
  return null;
}

/** All next moves our lines cover after `prefix` (for opponent nodes: covered replies). */
export function continuations(opening, prefix) {
  const out = new Set();
  for (const l of opening.lines) {
    if (l.moves.length > prefix.length && startsWith(l.moves, prefix)) out.add(l.moves[prefix.length]);
  }
  return [...out];
}

/** The ply whose move defines this line: its deviation, or the trunk's first opponent move after the signature. */
export function definingPly(opening, line) {
  if (line.deviatesAt !== undefined && line.deviatesAt !== null) return line.deviatesAt;
  let ply = opening.signaturePlies;
  while (ply < line.moves.length && isUserPly(opening, ply)) ply++;
  return Math.min(ply, line.moves.length - 1);
}

/** Where `line` leaves the trunk: { ply, move } or null for the trunk itself. */
export function deviation(opening, line) {
  const trunk = mainLine(opening);
  for (let i = 0; i < line.moves.length; i++) {
    if (trunk[i] !== line.moves[i]) return { ply: i, move: line.moves[i] };
  }
  return null;
}

/** Stable key for progress records. */
export function lineKey(line) {
  return line.id;
}

/** "3.d4" for a White ply, "3...exd4" for a Black ply. */
export function moveLabel(ply, san) {
  const moveNumber = Math.floor(ply / 2) + 1;
  return isWhitePly(ply) ? `${moveNumber}.${san}` : `${moveNumber}...${san}`;
}

/** Human title: "3...f5 · Latvian lunge" or just the name for the trunk. */
export function describeLine(opening, line) {
  const d = deviation(opening, line);
  return d ? `${moveLabel(d.ply, d.move)} · ${line.name}` : line.name;
}

/**
 * "1. e4 e5 2. Nf3 Nc6" — the first `upTo` plies of a line, numbered.
 * Returns an array of { ply, text } so the UI can highlight one entry.
 */
export function formatMoves(sans, upTo = sans.length) {
  const out = [];
  for (let ply = 0; ply < Math.min(upTo, sans.length); ply++) {
    const prefix = isWhitePly(ply) ? `${Math.floor(ply / 2) + 1}. ` : '';
    out.push({ ply, text: prefix + sans[ply] });
  }
  return out;
}

/**
 * Pick one item at random, proportionally to its weight.
 * weights[i] <= 0 means "never". Returns null if nothing is pickable.
 * `random` is injectable for tests.
 */
export function pickWeighted(items, weights, random = Math.random) {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) return null;
  let r = random() * total;
  for (let i = 0; i < items.length; i++) {
    const w = Math.max(0, weights[i]);
    if (w === 0) continue;
    if (r < w) return items[i];
    r -= w;
  }
  return items[items.length - 1];
}
