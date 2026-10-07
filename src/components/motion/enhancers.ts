/**
 * Progressive enhancement for server-rendered markup.
 *
 * Pages stay React Server Components. Interactive behaviour is attached here
 * through a handful of delegated listeners that read data attributes and
 * write CSS custom properties — never structure — so React's DOM is never
 * mutated and the site is complete with JavaScript disabled.
 *
 *   .btn, [data-magnetic]   magnetic pull + directional fill
 *   [data-tilt]             spring-driven perspective tilt, moving light
 *   [data-reveal]           one-shot entrance when scrolled into view
 *   [data-scroll]           continuous --sp / --se scroll progress
 */
import { Spring, springs } from '@/lib/motion';
import { onTick } from '@/lib/runtime';

type Cleanup = () => void;

/* ------------------------------------------------------------------ */
/* Spring registry: one tick drives every active element.              */
/* ------------------------------------------------------------------ */

type Animated = { springs: Spring[]; write: () => void };
const active = new Map<HTMLElement, Animated>();
let stopTick: Cleanup | null = null;

function wake() {
  if (stopTick) return;
  stopTick = onTick((dt) => {
    active.forEach((a, el) => {
      let resting = true;
      for (const s of a.springs) {
        // Sub-step for stability with stiff springs on slow frames.
        s.step(dt / 2);
        s.step(dt / 2);
        if (!s.resting) resting = false;
      }
      a.write();
      // Pointer movement re-registers the element, so resting ones can go.
      if (resting) active.delete(el);
    });
    if (!active.size && stopTick) {
      stopTick();
      stopTick = null;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Magnetic                                                             */
/* ------------------------------------------------------------------ */

const MAG = '.btn, [data-magnetic]';
const magState = new WeakMap<HTMLElement, { x: Spring; y: Spring }>();

function magnetic(): Cleanup {
  const get = (el: HTMLElement) => {
    let s = magState.get(el);
    if (!s) {
      s = { x: new Spring(0, 0, springs.magnetic), y: new Spring(0, 0, springs.magnetic) };
      magState.set(el, s);
    }
    return s;
  };

  const track = (el: HTMLElement) => {
    const s = get(el);
    active.set(el, {
      springs: [s.x, s.y],
      write: () => {
        el.style.setProperty('--mx', `${s.x.x.toFixed(2)}px`);
        el.style.setProperty('--my', `${s.y.x.toFixed(2)}px`);
      },
    });
    wake();
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const el = (e.target as Element).closest<HTMLElement>(MAG);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const strength = Number(el.dataset.magnetic) || 0.28;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const s = get(el);
    s.x.target = dx * strength;
    s.y.target = dy * strength * 0.7;
    track(el);
  };

  const onEnter = (e: PointerEvent) => {
    const el = (e.target as Element).closest<HTMLElement>(MAG);
    if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
    // Fill wipes in from whichever edge the pointer crossed.
    const r = el.getBoundingClientRect();
    const d = [
      ['top', e.clientY - r.top],
      ['bottom', r.bottom - e.clientY],
      ['left', e.clientX - r.left],
      ['right', r.right - e.clientX],
    ].sort((a, b) => (a[1] as number) - (b[1] as number))[0][0] as string;
    el.dataset.enter = d;
  };

  const onLeave = (e: PointerEvent) => {
    const el = (e.target as Element).closest<HTMLElement>(MAG);
    if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
    const r = el.getBoundingClientRect();
    const d = [
      ['top', Math.abs(e.clientY - r.top)],
      ['bottom', Math.abs(r.bottom - e.clientY)],
      ['left', Math.abs(e.clientX - r.left)],
      ['right', Math.abs(r.right - e.clientX)],
    ].sort((a, b) => (a[1] as number) - (b[1] as number))[0][0] as string;
    el.dataset.enter = d;
    const s = get(el);
    s.x.target = 0;
    s.y.target = 0;
    track(el);
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerover', onEnter, { passive: true });
  document.addEventListener('pointerout', onLeave, { passive: true });
  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onEnter);
    document.removeEventListener('pointerout', onLeave);
  };
}

/* ------------------------------------------------------------------ */
/* Tilt — the panel behaves like a sheet of card on a spring mount.    */
/* ------------------------------------------------------------------ */

const tiltState = new WeakMap<HTMLElement, { rx: Spring; ry: Spring; lx: Spring; ly: Spring; lift: Spring }>();

function tilt(): Cleanup {
  const get = (el: HTMLElement) => {
    let s = tiltState.get(el);
    if (!s) {
      s = {
        rx: new Spring(0, 0, springs.panel),
        ry: new Spring(0, 0, springs.panel),
        lx: new Spring(50, 50, springs.panel),
        ly: new Spring(50, 50, springs.panel),
        lift: new Spring(0, 0, springs.panel),
      };
      tiltState.set(el, s);
    }
    return s;
  };
  const track = (el: HTMLElement) => {
    const s = get(el);
    active.set(el, {
      springs: [s.rx, s.ry, s.lx, s.ly, s.lift],
      write: () => {
        el.style.setProperty('--rx', `${s.rx.x.toFixed(3)}deg`);
        el.style.setProperty('--ry', `${s.ry.x.toFixed(3)}deg`);
        el.style.setProperty('--lx', `${s.lx.x.toFixed(2)}%`);
        el.style.setProperty('--ly', `${s.ly.x.toFixed(2)}%`);
        el.style.setProperty('--lift', s.lift.x.toFixed(4));
        // Unitless −1…1 pointer offsets for internal parallax in px.
        el.style.setProperty('--tx', ((s.lx.x - 50) / 50).toFixed(4));
        el.style.setProperty('--ty', ((s.ly.x - 50) / 50).toFixed(4));
      },
    });
    wake();
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const el = (e.target as Element).closest<HTMLElement>('[data-tilt]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const max = Number(el.dataset.tilt) || 5;
    const s = get(el);
    s.ry.target = (px - 0.5) * 2 * max;
    s.rx.target = -(py - 0.5) * 2 * max * 0.8;
    s.lx.target = px * 100;
    s.ly.target = py * 100;
    s.lift.target = 1;
    track(el);
  };
  const onLeave = (e: PointerEvent) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-tilt]');
    if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
    const s = get(el);
    s.rx.target = s.ry.target = 0;
    s.lx.target = s.ly.target = 50;
    s.lift.target = 0;
    track(el);
  };
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onLeave, { passive: true });
  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerout', onLeave);
  };
}

/* ------------------------------------------------------------------ */
/* Reveal + scroll progress                                            */
/* ------------------------------------------------------------------ */

function reveal(): Cleanup {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
  );

  const visible = new Set<HTMLElement>();
  const sio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) visible.add(el);
        else visible.delete(el);
      }
      schedule();
    },
    { rootMargin: '10% 0px 10% 0px' }
  );

  let pending: Cleanup | null = null;
  const update = () => {
    const vh = window.innerHeight;
    visible.forEach((el) => {
      const r = el.getBoundingClientRect();
      // --sp: 0 as the top enters at the bottom, 1 as the bottom leaves the top.
      const sp = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      // --se: entry only, 0 at bottom edge → 1 once the top reaches 40% height.
      const se = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.6)));
      // --sx: exit only, 0 while the top is below the header → 1 at one height up.
      const sx = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      el.style.setProperty('--sp', sp.toFixed(4));
      el.style.setProperty('--se', se.toFixed(4));
      el.style.setProperty('--sx', sx.toFixed(4));
    });
  };
  const schedule = () => {
    if (pending) return;
    pending = onTick(() => {
      update();
      pending?.();
      pending = null;
    });
  };

  const seen = new WeakSet<Element>();
  const scan = () => {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      io.observe(el);
    });
    document.querySelectorAll<HTMLElement>('[data-scroll]').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      sio.observe(el);
    });
  };
  scan();

  // Client navigations and client-side filters add new nodes.
  let queued = false;
  const mo = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    setTimeout(() => {
      queued = false;
      scan();
    }, 60);
  });
  mo.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  return () => {
    io.disconnect();
    sio.disconnect();
    mo.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
}

export function initEnhancers({ fine, motion }: { fine: boolean; motion: boolean }): Cleanup {
  const fns: Cleanup[] = [];
  if (motion) fns.push(reveal());
  if (motion && fine) fns.push(magnetic(), tilt());
  return () => fns.forEach((f) => f());
}
