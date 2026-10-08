/**
 * Inertial wheel scrolling for fine pointers.
 *
 * Wheel input sets a target; the shared clock eases the real scroll position
 * toward it. Everything else stays native: keyboard, scrollbar drags, touch,
 * anchor jumps and programmatic scrolls simply re-sync the target, and any
 * wheel over an element that can itself scroll in that direction (a diagram
 * panning sideways, the command palette list) is left to the browser.
 */
import { onTick } from '@/lib/runtime';

export function initSmoothScroll() {
  let target = window.scrollY;
  let current = window.scrollY;
  let stop: (() => void) | null = null;

  const max = () => document.documentElement.scrollHeight - window.innerHeight;

  const canScroll = (el: Element | null, dy: number) => {
    for (let n = el; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (!/(auto|scroll)/.test(s.overflowY)) continue;
      if (n.scrollHeight <= n.clientHeight) continue;
      if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
    }
    return false;
  };

  const tick = (dt: number) => {
    // Frame-rate independent exponential ease (~0.12 per 60 Hz frame).
    const k = 1 - Math.pow(1 - 0.12, dt * 60);
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.4) current = target;
    window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
    if (current === target) {
      stop?.();
      stop = null;
    }
  };

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented) return; // pinch-zoom and handled wheels
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal pans stay native
    if (document.documentElement.classList.contains('booting')) return;
    if (canScroll(e.target as Element, e.deltaY)) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    if (!stop) current = window.scrollY;
    target = Math.max(0, Math.min(max(), target + e.deltaY * unit));
    if (!stop) stop = onTick(tick);
  };

  const onScroll = () => {
    // Our own frames land where we put them; anything else (keys, scrollbar,
    // anchors, the router) is followed rather than fought.
    if (stop && Math.abs(window.scrollY - current) < 2) return;
    stop?.();
    stop = null;
    target = current = window.scrollY;
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    stop?.();
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
  };
}
