'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { onTick, scroll } from '@/lib/runtime';

/**
 * A full-bleed band of oversized type that drifts on its own, accelerates
 * with scroll velocity, follows the scroll direction and leans into it.
 * Purely decorative — every phrase in it also appears as real text on the
 * page — so it is hidden from assistive tech. Static under reduced motion.
 */
export function Marquee({ items, reverse = false, speed = 40 }: { items: string[]; reverse?: boolean; speed?: number }) {
  const band = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = band.current!;
    const tr = track.current!;
    if (prefersReducedMotion()) return;
    let x = 0;
    let dir = reverse ? 1 : -1;
    let skew = 0;
    let stop: (() => void) | null = null;

    const tick = (dt: number) => {
      const half = tr.scrollWidth / 2;
      if (!half) return;
      const v = scroll.v;
      // Scrolling down pushes the band its own way; scrolling up flips it.
      if (Math.abs(v) > 40) dir = (v > 0 ? -1 : 1) * (reverse ? -1 : 1);
      const boost = Math.min(900, Math.abs(v) * 0.6);
      x += dir * (speed + boost) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      skew += (Math.max(-9, Math.min(9, -v * 0.006)) - skew) * Math.min(1, dt * 8);
      tr.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !stop) stop = onTick(tick);
      else if (!e.isIntersecting && stop) {
        stop();
        stop = null;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      stop?.();
    };
  }, [reverse, speed]);

  const run = (copy: number) =>
    items.map((t, i) => (
      <span key={`${copy}-${i}`} className="marquee-item">
        <span className={i % 2 ? 'marquee-outline' : ''}>{t}</span>
        <span className="marquee-node" />
      </span>
    ));

  return (
    <div ref={band} className="marquee" aria-hidden>
      <div ref={track} className="marquee-track">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
