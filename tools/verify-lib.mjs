/* ---------------------------------------------------------------
   Verification core for the repertoire — pure functions, no I/O, so the
   tests can drive them with a fake engine and fake frequencies.

   The rules (owner, 2026-09-23 — see PLAN.md round 7):

   ALL lines
     - every move legal and in canonical SAN; named; sourced; a plan with
       plan sources and a planBasis ('quoted' | 'interpreted')
     - ends after OUR move; ≥ minOurMoves of our moves after the defining
       point (deviation, or the surprise move itself)
     - no exact or strict-prefix duplicate; one move per position
     - Stockfish: none of OUR moves after the opening signature loses
       ≥ dropCp against the engine's best (DROP). The engine never adds a
       move; it can only veto.

   main   (opening.lines)  weight A/B only; a sound opponent choice.
   side   (opening.lines)  an inferior opponent move with a clear answer:
          the mistake swings the eval ≥ sideMistakeCp (+0.5) and the line
          ends ≥ sideEndCp (+0.75, a clear edge)
   trap   (opening.lines)  a real blunder the opponent must cooperate with:
          swing ≥ mistakeCp (+1.0), line ends ≥ endCp (+1.5)
          side/trap may be weight A/B/C (YouTube, studies are fine) but:
          - `mistakeAt` names the opponent ply that is the mistake
          - it is common: ≥ minClubShare % of Lichess 1400-1800 players
            play it there, in a position with ≥ minClubGames games (RARE)
          - it is a real mistake: the engine eval swings ≥ mistakeCp in our
            favour on that move (NOT-A-MISTAKE)
          - the line ends with the gain locked in: final eval ≥ endCp (SIDE?)
   surprise (opening.surprise)  OUR offbeat alternative, drilled apart:
          - leaves the main repertoire at one of OUR moves (conflicts are
            the point), weight A/B/C, same DROP rule, consistent among
            the surprise lines themselves.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';
import { fromUserPov } from '../js/branchBuilder.js';
import { moveLabel } from '../js/tree.js';

const isOurPly = (side, ply) => (ply % 2 === 0) === (side === 'w');
const startsWith = (a, p) => p.length <= a.length && p.every((m, i) => a[i] === m);

export const DEFAULTS = {
  minOurMoves: 4, minTrunkPlies: 16, dropCp: 50,
  minClubShare: 10, minClubGames: 200, mistakeCp: 100, endCp: 150, sideMistakeCp: 50, sideEndCp: 75,
};

/** The main repertoire's move after `prefix` (from opening.lines), or null. */
function repMove(lines, prefix) {
  for (const l of lines) if (l.moves.length > prefix.length && startsWith(l.moves, prefix)) return l.moves[prefix.length];
  return null;
}

/** Defining ply: main/side/trap → first ply differing from the trunk; surprise → first OUR ply that differs from the main repertoire. */
export function definingPly(o, l) {
  if (l.kind === 'surprise') {
    for (let p = 0; p < l.moves.length; p++) {
      if (!isOurPly(o.side, p)) continue;
      const rm = repMove(o.lines, l.moves.slice(0, p));
      if (rm && rm !== l.moves[p]) return p;
    }
    return null;
  }
  const trunk = o.lines[0].moves;
  for (let i = 0; i < l.moves.length; i++) if (trunk[i] !== l.moves[i]) return i;
  return null;
}

export function checkStructure(seed, opts = {}) {
  const { minOurMoves, minTrunkPlies, minClubShare, minClubGames } = { ...DEFAULTS, ...opts };
  const { sources = null, clubShare = null } = opts;
  const flags = [];
  for (const o of seed) {
    const tag = (l, msg) => flags.push(`${o.id}/${l.id}: ${msg}`);
    if (!o.lines.length) { flags.push(`${o.id}: no lines`); continue; }
    const trunk = o.lines[0];
    if (trunk.kind !== 'main') tag(trunk, 'trunk must be kind main');
    if (trunk.moves.length < minTrunkPlies) tag(trunk, `trunk has ${trunk.moves.length} plies, needs ${minTrunkPlies}`);
    const surprise = o.surprise ?? [];
    const ids = new Set();
    for (const [set, lines] of [['lines', o.lines], ['surprise', surprise]]) {
      const seenOurMoves = new Map();
      for (const l of lines) {
        if (!l.id || ids.has(l.id)) tag(l, 'duplicate or missing id'); ids.add(l.id);
        if (!l.name) tag(l, 'needs a name');
        const kinds = set === 'lines' ? ['main', 'side', 'trap'] : ['surprise'];
        if (!kinds.includes(l.kind)) tag(l, `kind ${l.kind} not allowed in opening.${set}`);
        const weights = l.kind === 'main' ? ['A', 'B'] : ['A', 'B', 'C'];
        if (!weights.includes(l.weight)) tag(l, `weight ${l.weight} — ${l.kind} lines ship only as ${weights.join('/')}`);
        if (!l.sources?.length) tag(l, 'needs sources');
        if (sources) for (const s of l.sources ?? []) if (!sources[s]) tag(l, `unknown source ${s}`);
        if (!l.plan || l.plan.length < 20) tag(l, 'needs a plan');
        if (!l.planSources?.length) tag(l, 'plan needs sources');
        if (sources) for (const s of l.planSources ?? []) if (!sources[s]) tag(l, `unknown plan source ${s}`);
        if (!['quoted', 'interpreted'].includes(l.planBasis)) tag(l, 'planBasis must be quoted or interpreted');
        // legality + canonical SAN
        const g = new Chess();
        let legal = true;
        for (const [ply, san] of l.moves.entries()) {
          let m;
          try { m = g.move(san); } catch { tag(l, `ILLEGAL ${san} at ply ${ply}`); legal = false; break; }
          if (m.san !== san) { tag(l, `SAN: write "${m.san}" not "${san}" at ply ${ply}`); legal = false; break; }
        }
        if (!legal) continue;
        const sig = trunk.moves.slice(0, o.signaturePlies);
        if (!startsWith(l.moves, sig)) tag(l, 'must start with the opening signature');
        // defining point + depth
        if (l !== trunk) {
          const dev = definingPly(o, l);
          if (dev === null) tag(l, l.kind === 'surprise' ? 'never leaves the main repertoire at one of our moves' : 'identical to or a prefix of the trunk');
          else {
            if (l.kind !== 'surprise' && isOurPly(o.side, dev)) tag(l, `deviates at OUR ply ${dev} (${moveLabel(dev, l.moves[dev])}) — conflicting repertoire move`);
            const last = l.moves.length - 1;
            if (!isOurPly(o.side, last)) tag(l, `ends after the opponent's ${moveLabel(last, l.moves[last])} — must end after our move`);
            let ours = 0;
            for (let p = l.kind === 'surprise' ? dev : dev + 1; p < l.moves.length; p++) if (isOurPly(o.side, p)) ours++;
            if (ours < minOurMoves) tag(l, `only ${ours} of our moves ${l.kind === 'surprise' ? 'from the surprise move' : 'after the deviation'} ${moveLabel(dev, l.moves[dev])} (need ${minOurMoves})`);
            if (l.kind === 'side' || l.kind === 'trap') {
              const ma = l.mistakeAt;
              if (!Number.isInteger(ma) || ma < dev || ma >= l.moves.length || isOurPly(o.side, ma)) tag(l, `mistakeAt ${ma} must be an opponent ply at or after the deviation ${dev}`);
              else {
                if (clubShare) {
                  const f = clubShare(l.moves.slice(0, ma), l.moves[ma]);
                  if (!f) tag(l, `RARE? no club data for ${moveLabel(ma, l.moves[ma])}`);
                  else if (f.total < minClubGames || f.share < minClubShare) tag(l, `RARE ${moveLabel(ma, l.moves[ma])}: ${f.share}% of ${f.total} club games (need ≥ ${minClubShare}% of ≥ ${minClubGames})`);
                }
              }
            }
          }
        }
        // one move per position (within the set; surprise lines are checked among themselves)
        for (let ply = 0; ply < l.moves.length; ply++) {
          if (!isOurPly(o.side, ply)) continue;
          const key = l.moves.slice(0, ply).join(' ');
          const prev = seenOurMoves.get(key);
          if (prev && prev.san !== l.moves[ply]) tag(l, `REPEAT after "${key}": plays ${l.moves[ply]} but ${prev.id} plays ${prev.san}`);
          if (!prev) seenOurMoves.set(key, { san: l.moves[ply], id: l.id });
        }
      }
      // duplicates / prefixes within the set
      for (const a of lines) for (const b of lines) {
        if (a === b || a.moves.length > b.moves.length) continue;
        if (startsWith(b.moves, a.moves)) {
          flags.push(a.moves.length === b.moves.length ? `${o.id}/${a.id}: exact duplicate of ${b.id}` : `${o.id}/${a.id}: strict prefix of ${b.id} — keep the longer line only`);
        }
      }
    }
  }
  return flags;
}

export async function verify(seed, evaluate, opts = {}) {
  const { depth = 18, dropCp, mistakeCp, endCp, sideMistakeCp, sideEndCp } = { ...DEFAULTS, ...opts };
  const log = opts.log ?? (() => {});
  const flags = checkStructure(seed, opts);
  for (const f of flags) log(`  STRUCTURE ${f}`);
  const cache = new Map();
  const ev = async (sans) => {
    const k = sans.join(' ');
    if (!cache.has(k)) cache.set(k, await evaluate(sans, { depth }));
    return cache.get(k);
  };
  const data = [];
  for (const o of seed) {
    log(`\n== ${o.name}`);
    const out = { lines: [], surprise: [] };
    for (const [set, lines] of [['lines', o.lines], ['surprise', o.surprise ?? []]]) {
      for (const l of lines) {
        const dev = l === o.lines[0] ? null : definingPly(o, l);
        const evals = [];
        const notes = [];
        const flag = (msg) => { const f = `${o.id}/${l.id}: ${msg}`; flags.push(f); notes.push(msg); };
        for (let ply = 0; ply < l.moves.length; ply++) {
          if (!isOurPly(o.side, ply)) continue;
          const prefix = l.moves.slice(0, ply);
          const before = await ev(prefix);
          const after = await ev([...prefix, l.moves[ply]]);
          const cpBefore = fromUserPov(before.cp ?? 0, o.side);
          const cpAfter = fromUserPov(after.cp ?? 0, o.side);
          evals.push({ ply, san: l.moves[ply], cp: Math.round(cpAfter) });
          if (ply >= o.signaturePlies && before.bestMove !== l.moves[ply] && cpBefore - cpAfter >= dropCp) {
            flag(`DROP ${moveLabel(ply, l.moves[ply])} -${((cpBefore - cpAfter) / 100).toFixed(2)} (engine ${before.bestMove})`);
          }
        }
        const final = evals.at(-1)?.cp ?? 0;
        let swing = null;
        if ((l.kind === 'side' || l.kind === 'trap') && Number.isInteger(l.mistakeAt)) {
          const b = fromUserPov((await ev(l.moves.slice(0, l.mistakeAt))).cp ?? 0, o.side);
          const a = fromUserPov((await ev(l.moves.slice(0, l.mistakeAt + 1))).cp ?? 0, o.side);
          swing = Math.round(a - b);
          const need = l.kind === 'side' ? sideMistakeCp : mistakeCp;
          if (swing < need) flag(`NOT-A-MISTAKE ${moveLabel(l.mistakeAt, l.moves[l.mistakeAt])} swings only ${(swing / 100).toFixed(2)} (need ${(need / 100).toFixed(2)})`);
          const end = l.kind === 'side' ? sideEndCp : endCp;
          if (final < end) flag(`SIDE? ${l.kind} line ends at ${(final / 100).toFixed(2)} — gain not locked in (need ${(end / 100).toFixed(2)})`);
        }
        out[set].push({
          id: l.id, libraryId: l.libraryId, name: l.name, kind: l.kind, weight: l.weight, moves: [...l.moves],
          deviatesAt: dev ?? undefined, mistakeAt: l.mistakeAt, cp: final, swing: swing ?? undefined, evals,
          sources: l.sources, note: l.note, plan: l.plan, planSources: l.planSources, planBasis: l.planBasis, planCredit: l.planCredit,
          club: l.club,
        });
        log(`  ${l.kind.padEnd(8)} ${l.id.padEnd(18)} ${String(l.moves.length).padStart(2)} plies  end ${(final / 100).toFixed(2).padStart(6)}${swing !== null ? `  swing ${(swing / 100).toFixed(2)}` : ''}  ${notes.join(' | ')}`);
      }
    }
    data.push({ id: o.id, name: o.name, side: o.side, signaturePlies: o.signaturePlies, lines: out.lines, surprise: out.surprise });
  }
  log(`\n${flags.length} flag(s)`);
  return { ok: flags.length === 0, flags, data: flags.length === 0 ? data : null };
}

export function renderDataModule(data, { depth, date = new Date().toISOString().slice(0, 10) } = {}) {
  return `/* GENERATED by tools/verify-repertoire.mjs on ${date} from tools/repertoire.seed.mjs (a selection of library/lines.mjs), verified with Stockfish 18 depth ${depth}.\n   Every move is the library's sourced move — the engine adds nothing. Do not edit by hand: edit the library or the selection and re-run. */\nexport default ${JSON.stringify(data, null, 2)};\n`;
}
