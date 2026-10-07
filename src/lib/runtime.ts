/**
 * One animation clock, one pointer, one scroll position — shared by every
 * moving part of the site. Nothing creates its own requestAnimationFrame
 * loop; everything subscribes here, and the clock stops entirely when no one
 * is subscribed or the tab is hidden.
 */

type Tick = (dt: number, t: number) => void;

/** Subscribers that keep the clock running. */
const subs = new Set<Tick>();
/** Bookkeeping that runs only while something else keeps the clock alive. */
const passive = new Set<Tick>();
let raf = 0;
let last = 0;

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  const t = now / 1000;
  passive.forEach((fn) => fn(dt, t));
  subs.forEach((fn) => fn(dt, t));
  raf = subs.size ? requestAnimationFrame(frame) : 0;
}

function start() {
  if (raf || typeof document === 'undefined' || document.hidden) return;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

export function onTick(fn: Tick) {
  subs.add(fn);
  start();
  return () => {
    subs.delete(fn);
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (subs.size) start();
  });
}

/* ------------------------------------------------------------------ */
/* Pointer + scroll state. Mutable on purpose: read in animation      */
/* frames, never pushed through React state.                           */
/* ------------------------------------------------------------------ */

export const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, down: false, active: false };
export const scroll = { y: 0, v: 0 };

let bound = false;
export function bindInputs() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  let lt = performance.now();
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      const now = performance.now();
      const dt = Math.max(8, now - lt);
      lt = now;
      if (pointer.active) {
        pointer.vx = ((e.clientX - pointer.x) / dt) * 16;
        pointer.vy = ((e.clientY - pointer.y) / dt) * 16;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true }
  );
  window.addEventListener('pointerdown', () => (pointer.down = true), { passive: true });
  window.addEventListener('pointerup', () => (pointer.down = false), { passive: true });
  document.documentElement.addEventListener('pointerleave', () => (pointer.active = false));

  let ly = window.scrollY;
  scroll.y = ly;
  window.addEventListener('scroll', () => (scroll.y = window.scrollY), { passive: true });

  passive.add((dt) => {
    const inst = (scroll.y - ly) / Math.max(dt, 0.001);
    ly = scroll.y;
    scroll.v += (inst - scroll.v) * 0.18;
    pointer.vx *= 0.9;
    pointer.vy *= 0.9;
  });
}
