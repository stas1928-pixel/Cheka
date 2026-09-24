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

/** Find a line by id in the main repertoire or in the separate surprise set. */
export function lineById(opening, id) {
  return opening.lines.find((l) => l.id === id) ?? (opening.surprise ?? []).find((l) => l.id === id) ?? null;
}

/** OUR offbeat alternatives (kind 'surprise'), drilled apart from the main repertoire. */
export function surpriseLines(opening) {
  return opening.surprise ?? [];
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

/**
 * The named family a line belongs to, for the line browser (Chess Reps-style
 * grouping). Decided by the opponent's defining moves; stable across data
 * regeneration because it reads only the moves.
 */
export function lineFamily(opening, line) {
  const m = line.moves;
  if (opening.id === 'scotch') {
    if (m[5] !== 'exd4') return '3rd-move sidelines';
    if (line.kind === 'surprise') return 'Surprise weapons';
    return ({
      Nf6: m[9] === 'Ng4' ? '5...Ng4' : m[9] === 'Ne4' ? '5...Ne4' : m[9] === 'Qe7' ? '5...Qe7' : 'Modern Attack (4...Nf6 5.e5 d5)',
      Bc5: 'Greco Gambit (4...Bc5 5.c3)',
      'Bb4+': 'London Defence (4...Bb4+)',
      Be7: 'Hungarian (4...Be7)',
      d6: 'Paris (4...d6)',
      h6: '4...h6',
    })[m[7]] ?? 'Other 4th moves';
  }
  if (opening.id === 'elephant') {
    if (line.kind === 'surprise') return 'Surprise weapons';
    if (m[4] === 'Nxe5') return '3.Nxe5 Bd6';
    if (m[4] === 'd4') return '3.d4 (declined)';
    if (m[4] === 'exd5') {
      if (m[6] === 'Nd4') return '4.Nd4';
      if (m[6] === 'Qe2') return m[8] === 'Nc3' ? 'Paulsen 5.Nc3' : m[8] === 'd3' ? (m[10] === 'dxe4' ? 'Paulsen 5.d3 Qxd5 6.dxe4' : 'Paulsen 5.d3 Qxd5 6.Nc3') : 'Paulsen, other';
      return '3.exd5 e4, other';
    }
    return 'Other 3rd moves';
  }
  return 'Lines';
}

/** Case-insensitive search over name, family and move text ("Nd4 c3", "5.c3", "bxf7"). */
export function matchesQuery(opening, line, query) {
  const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return true;
  const numbered = formatMoves(line.moves).map((x) => x.text).join(' ');
  const hay = `${line.name} ${lineFamily(opening, line)} ${numbered} ${line.moves.join(' ')}`.toLowerCase();
  return q.split(' ').every((t) => hay.includes(t.replace(/^\d+\.+/, '')) || hay.includes(t));
}
