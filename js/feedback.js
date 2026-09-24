/* ---------------------------------------------------------------
   FEEDBACK — make correct / incorrect feel like something.

   Two channels:
   - flash(): a coloured pulse on the squares involved (CSS animation,
     see .flash-good / .flash-bad in style.css).
   - play(): a very short sound synthesised with the Web Audio API.
     No audio files to ship, works offline, and it is tiny.

   Browsers only allow sound after the user has interacted with the page,
   so the AudioContext is created lazily on the first play() call, which
   always happens right after a tap.
--------------------------------------------------------------- */

let ctx = null;
let soundOn = true;

export function setSoundEnabled(on) {
  soundOn = Boolean(on);
}

/** Pulse the given squares. `kind` is 'good' or 'bad'. */
export function flash(boardEl, squares, kind) {
  for (const square of squares) {
    const el = boardEl.querySelector(`[data-square="${square}"]`);
    if (!el) continue;
    // Remove + re-add so the animation restarts even on a quick repeat.
    el.classList.remove('flash-good', 'flash-bad');
    void el.offsetWidth; // forces the browser to notice the removal
    el.classList.add(`flash-${kind}`);
  }
}

/** Play the 'good' chime or the 'bad' buzz. Silently does nothing if
 *  sound is off or the browser refuses (e.g. no user gesture yet). */
export function play(kind) {
  if (!soundOn) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    if (kind === 'good') {
      tone(660, now, 0.10, 'sine', 0.16);
      tone(990, now + 0.08, 0.14, 'sine', 0.16);
    } else if (kind === 'complete') {
      tone(523, now, 0.12, 'sine', 0.16);        // C
      tone(659, now + 0.10, 0.12, 'sine', 0.16); // E
      tone(784, now + 0.20, 0.22, 'sine', 0.16); // G
    } else {
      tone(150, now, 0.20, 'sawtooth', 0.10);
    }
  } catch {
    /* audio is a nicety, never let it break the trainer */
  }
}

/** One note: oscillator -> gain envelope -> speakers. */
function tone(freq, start, duration, type, peak) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);       // quick attack
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration); // fade out
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/* ---------------------------------------------------------------
   HAPTICS (Android Chrome supports navigator.vibrate; elsewhere a no-op).
   Events only — piece moves stay silent (owner, 2026-09-24).
--------------------------------------------------------------- */
let hapticsOn = true;
export function setHapticsEnabled(on) { hapticsOn = on; }
const PATTERNS = {
  good: 12,                    // a light tick
  bad: [35, 40, 35],           // two short buzzes — clear but slight
  deviation: [20, 60, 20],     // "look up"
  complete: [15, 40, 15, 40, 60],
  milestone: [30, 50, 30, 50, 120],
};
export function haptic(kind) {
  if (!hapticsOn || typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches && kind === 'good') return;
  try { navigator.vibrate(PATTERNS[kind] ?? 10); } catch { /* ignored */ }
}

/** Slight shake of an element (the board on a wrong move). Restarts on repeat. */
export function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}
