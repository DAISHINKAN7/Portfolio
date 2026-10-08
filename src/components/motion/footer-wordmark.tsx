'use client';

import { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion, Spring, springs } from '@/lib/motion';
import { onTick, pointer } from '@/lib/runtime';

/**
 * The name, set as large as the page allows. Letters rise into place when the
 * footer arrives, and on a fine pointer each one lifts toward the cursor as it
 * passes — a travelling wave on springs. Decorative: the name is already in
 * the footer as text, so this is hidden from assistive tech.
 */
export function FooterWordmark({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (prefersReducedMotion() || !hasFinePointer()) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>('.wordmark-l'));
    const sp = letters.map(() => new Spring(0, 0, springs.magnetic));
    let stop: (() => void) | null = null;
    let visible = false;

    const tick = (dt: number) => {
      const r = el.getBoundingClientRect();
      const inside = pointer.active && pointer.y > r.top - 80 && pointer.y < r.bottom + 40;
      let resting = true;
      letters.forEach((l, i) => {
        const lr = l.getBoundingClientRect();
        const cx = lr.left + lr.width / 2;
        const d = Math.abs(pointer.x - cx) / Math.max(120, r.width * 0.1);
        sp[i].target = inside ? -(Math.max(0, 1 - d) ** 2) * 0.22 : 0;
        sp[i].step(dt / 2);
        sp[i].step(dt / 2);
        l.style.transform = `translate3d(0, ${(sp[i].x * 100).toFixed(2)}%, 0)`;
        if (!sp[i].resting) resting = false;
      });
      if (resting && !inside) {
        stop?.();
        stop = null;
      }
    };
    const wake = () => {
      if (visible && !stop) stop = onTick(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) wake();
    });
    io.observe(el);
    window.addEventListener('pointermove', wake, { passive: true });
    return () => {
      io.disconnect();
      stop?.();
      window.removeEventListener('pointermove', wake);
    };
  }, []);

  let i = 0;
  return (
    <div ref={root} className="wordmark" aria-hidden data-reveal="group">
      {text.split('').map((ch) => (
        <span key={i} className="wordmark-slot" data-r style={{ ['--rd' as string]: i++ * 0.5 }}>
          <span className="wordmark-l">{ch === ' ' ? ' ' : ch}</span>
        </span>
      ))}
    </div>
  );
}
