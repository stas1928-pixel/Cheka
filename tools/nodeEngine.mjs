/* ---------------------------------------------------------------
   Stockfish for Node — same evaluate() contract as js/engine.js, so
   js/branchBuilder.js can be driven from the command line (batch
   rebuilds of the repertoire, game analysis) without a browser.

   Usage:
     import { createNodeEngine } from './nodeEngine.mjs';
     const engine = await createNodeEngine();
     const r = await engine.evaluate(['e4', 'e5'], { depth: 16 });
     engine.stop();
--------------------------------------------------------------- */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Chess } from '../vendor/chess.js';
import { parseInfo } from '../js/engine.js';

const require = createRequire(import.meta.url);
const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../vendor/stockfish');
const JS = path.join(DIR, 'stockfish-18-lite-single.js');

export async function createNodeEngine({ defaultDepth = 16 } = {}) {
  const INIT = require(JS);
  const listeners = new Set();
  const engine = {
    // The build asks for "stockfish.wasm"; point any .wasm request at our file.
    locateFile: (p) => (p.endsWith('.wasm') ? path.join(DIR, 'stockfish-18-lite-single.wasm') : path.join(DIR, p)),
    print: (line) => { for (const fn of listeners) fn(String(line)); },
    printErr: () => {},
    listener: (line) => { for (const fn of listeners) fn(String(line)); },
  };
  await INIT()(engine);
  while (engine._isReady && !engine._isReady()) await new Promise((r) => setTimeout(r, 10));

  const send = (cmd) => engine.ccall('command', null, ['string'], [cmd], { async: /^go\b/.test(cmd) });
  const command = (cmd, until) => new Promise((resolve) => {
    const onLine = (l) => { if (l.startsWith(until)) { listeners.delete(onLine); resolve(l); } };
    listeners.add(onLine);
    send(cmd);
  });

  await command('uci', 'uciok');
  await command('isready', 'readyok');

  let queue = Promise.resolve();
  async function doEvaluate(sans, depth) {
    const game = new Chess();
    for (const san of sans) game.move(san);
    const uci = game.history({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? '')).join(' ');
    const sign = game.turn() === 'w' ? 1 : -1;
    let last = { cp: null, mate: null, depth: 0 };
    const onInfo = (l) => { const p = parseInfo(l); if (p && p.depth >= last.depth) last = p; };
    listeners.add(onInfo);
    send(`position startpos${uci ? ' moves ' + uci : ''}`);
    const best = await command(`go depth ${depth}`, 'bestmove');
    listeners.delete(onInfo);
    const bestUci = best.split(' ')[1];
    let bestMove = null;
    if (bestUci && bestUci !== '(none)') {
      bestMove = game.move({ from: bestUci.slice(0, 2), to: bestUci.slice(2, 4), promotion: bestUci[4] }).san;
    }
    return {
      cp: last.cp === null ? null : last.cp * sign,
      mate: last.mate === null ? null : last.mate * sign,
      depth: last.depth,
      bestMove,
    };
  }

  return {
    evaluate(sans, { depth = defaultDepth } = {}) {
      const job = queue.then(() => doEvaluate(sans, depth));
      queue = job.catch(() => {});
      return job;
    },
    stop() { try { send('quit'); } catch { /* already gone */ } },
  };
}
