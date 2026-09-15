/* ---------------------------------------------------------------
   ENGINE — Stockfish 18 (lite, single-threaded WebAssembly) running in
   a Web Worker, talking UCI.

   UCI in one paragraph: we send text commands ("uci", "position …",
   "go depth 12"), the engine answers with text lines. While thinking it
   prints "info depth N … score cp X …" lines; when done it prints
   "bestmove e2e4". Scores are in centipawns (100 = one pawn) from the
   point of view of the side to move — we convert to White's view so
   every number in this app means the same thing.

   Vendor facts (docs/sources.md, 2026-09-15):
   - Files: vendor/stockfish/stockfish-18-lite-single.{js,wasm}, ~7 MB,
     GPL-3. Single-threaded, so no COOP/COEP headers are needed.
   - The .js locates the .wasm next to itself via the Worker's URL.
   - Output can arrive several lines per message; split on "\n".

   Only one search runs at a time (a queue), because the engine is a
   single process and interleaving "go" commands corrupts results.
--------------------------------------------------------------- */
import { Chess } from '../vendor/chess.js';

export const ENGINE_URL = new URL('../vendor/stockfish/stockfish-18-lite-single.js', import.meta.url);
export const DEFAULT_DEPTH = 14;

export class Engine {
  #worker = null;
  #listeners = new Set();
  #queue = Promise.resolve();
  #ready = null;

  /** Start the worker and finish the UCI handshake. Safe to call twice. */
  start() {
    if (this.#ready) return this.#ready;
    this.#worker = new Worker(ENGINE_URL);
    this.#worker.onmessage = (e) => {
      for (const line of String(e.data).split('\n')) {
        if (line) for (const fn of this.#listeners) fn(line);
      }
    };
    this.#ready = (async () => {
      await this.#command('uci', 'uciok');
      await this.#command('isready', 'readyok');
    })();
    return this.#ready;
  }

  stop() {
    this.#worker?.terminate();
    this.#worker = null;
    this.#ready = null;
  }

  /** Send `cmd`, resolve with the first output line starting with `until`. */
  #command(cmd, until, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#listeners.delete(onLine);
        reject(new Error(`Engine did not answer "${cmd}" in time`));
      }, timeoutMs);
      const onLine = (line) => {
        if (line.startsWith(until)) {
          clearTimeout(timer);
          this.#listeners.delete(onLine);
          resolve(line);
        }
      };
      this.#listeners.add(onLine);
      this.#worker.postMessage(cmd);
    });
  }

  /**
   * Evaluate the position after `sans` (SAN moves from the start).
   * Resolves { cp, mate, bestMove, depth } with cp/mate from WHITE's view
   * (positive = good for White). `bestMove` is SAN.
   */
  evaluate(sans, { depth = DEFAULT_DEPTH } = {}) {
    // Chain onto the queue so searches never overlap.
    const job = this.#queue.then(() => this.#evaluate(sans, depth));
    this.#queue = job.catch(() => {}); // a failure must not block later jobs
    return job;
  }

  async #evaluate(sans, depth) {
    await this.start();
    const game = new Chess();
    for (const san of sans) game.move(san);
    const uci = game.history({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? '')).join(' ');
    const whiteToMove = game.turn() === 'w';

    let last = { cp: null, mate: null, depth: 0 };
    const onInfo = (line) => {
      const parsed = parseInfo(line);
      if (parsed && parsed.depth >= last.depth) last = parsed;
    };
    this.#listeners.add(onInfo);
    let bestLine;
    try {
      this.#worker.postMessage(`position startpos${uci ? ' moves ' + uci : ''}`);
      bestLine = await this.#command(`go depth ${depth}`, 'bestmove');
    } finally {
      this.#listeners.delete(onInfo);
    }

    // Flip to White's point of view when Black was to move.
    const sign = whiteToMove ? 1 : -1;
    const bestUci = bestLine.split(' ')[1];
    let bestMove = null;
    if (bestUci && bestUci !== '(none)') {
      const m = game.move({ from: bestUci.slice(0, 2), to: bestUci.slice(2, 4), promotion: bestUci[4] });
      bestMove = m.san;
    }
    return {
      cp: last.cp === null ? null : last.cp * sign,
      mate: last.mate === null ? null : last.mate * sign,
      depth: last.depth,
      bestMove,
    };
  }
}

/** "info depth 12 … score cp 35 …" -> { depth: 12, cp: 35, mate: null } */
export function parseInfo(line) {
  if (!line.startsWith('info') || !line.includes(' score ')) return null;
  if (line.includes(' multipv ') && !/ multipv 1 /.test(line)) return null;
  const depth = Number(/ depth (\d+)/.exec(line)?.[1] ?? 0);
  const cp = / score cp (-?\d+)/.exec(line);
  const mate = / score mate (-?\d+)/.exec(line);
  return {
    depth,
    cp: cp ? Number(cp[1]) : null,
    mate: mate ? Number(mate[1]) : null,
  };
}
