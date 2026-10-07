'use client';

import { useLayoutEffect, useRef } from 'react';
import { easeOutExpo, prefersReducedMotion } from '@/lib/motion';
import { onTick } from '@/lib/runtime';

/**
 * Counts every number inside a figure up from zero the first time it is
 * seen — "97.60% ± 0.31", "156 → 3,180", "−17.36%" all keep their exact
 * formatting. The server renders the real value; the animation is only ever
 * a client-side flourish on top of it, and the accessible name never changes.
 */
const NUM = /\d[\d,]*(?:\.\d+)?/g;

export function CountUp({ value, className, duration = 1400 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !document.documentElement.classList.contains('motion')) return;
    const parts = value.split(NUM);
    const nums = (value.match(NUM) ?? []).map((m) => ({
      target: parseFloat(m.replace(/,/g, '')),
      decimals: m.includes('.') ? m.split('.')[1].length : 0,
      grouped: m.includes(','),
    }));
    if (!nums.length) return;

    const fmt = (p: number) =>
      parts
        .map((s, i) => {
          if (i >= nums.length) return s;
          const n = nums[i];
          const v = n.target * p;
          const str = n.grouped
            ? v.toLocaleString('en-US', { minimumFractionDigits: n.decimals, maximumFractionDigits: n.decimals })
            : v.toFixed(n.decimals);
          return s + str;
        })
        .join('');

    // Already scrolled past (e.g. back navigation restoring position): leave it.
    if (el.getBoundingClientRect().bottom < 0) return;
    el.textContent = fmt(0);

    let stop: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now() + 150;
        stop = onTick(() => {
          const p = Math.max(0, Math.min(1, (performance.now() - t0) / duration));
          el.textContent = fmt(easeOutExpo(p));
          if (p >= 1) {
            el.textContent = value;
            stop?.();
          }
        });
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop?.();
      el.textContent = value;
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={`count ${className ?? ''}`}>
      {value}
    </span>
  );
}
