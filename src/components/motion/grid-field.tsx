'use client';

import { useEffect, useRef } from 'react';
import { onTick, pointer } from '@/lib/runtime';

/**
 * The paper is plotter paper — you just can't see the grid until you look.
 *
 * A dot lattice, locked to the page, sits beneath every section. It is drawn
 * only around the cursor, where the dots surface, brighten and bend away like
 * filings near a magnet; a click sends a ripple ring across it. With the
 * pointer still, nothing is drawn at all, so the page at rest is unchanged.
 * Fine pointers with motion enabled only; the loop sleeps when idle.
 */
const GAP = 22;
const R = 190;

export function GridField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const g = cv.getContext('2d')!;
    let dpr = 1;
    let W = 0, H = 0;
    let stop: (() => void) | null = null;
    let energy = 0; // eases in on movement, out when still
    let lastX = -1, lastY = -1, stillFor = 0;
    const ripples: { x: number; y: number; t: number }[] = [];

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const tick = (dt: number) => {
      const moved = pointer.x !== lastX || pointer.y !== lastY;
      lastX = pointer.x;
      lastY = pointer.y;
      stillFor = moved ? 0 : stillFor + dt;
      const want = pointer.active && stillFor < 1.2 ? 1 : 0;
      energy += (want - energy) * Math.min(1, dt * (want ? 6 : 2.2));

      g.clearRect(0, 0, W, H);
      const oy = -(window.scrollY % GAP);
      const px = pointer.x, py = pointer.y;
      const draw = (x0: number, y0: number, x1: number, y1: number) => {
        const cx0 = Math.floor(x0 / GAP) * GAP, cy0 = Math.floor((y0 - oy) / GAP) * GAP + oy;
        for (let y = cy0; y <= y1; y += GAP) {
          for (let x = cx0; x <= x1; x += GAP) {
            let a = 0, dx = 0, dy = 0;
            const ddx = x - px, ddy = y - py;
            const d = Math.hypot(ddx, ddy);
            if (d < R && energy > 0.01) {
              const f = 1 - d / R;
              a = f * f * 0.42 * energy;
              const push = f * f * 9 * energy;
              dx = (ddx / (d || 1)) * push;
              dy = (ddy / (d || 1)) * push;
            }
            for (const rp of ripples) {
              const rr = rp.t * 620;
              const dd = Math.hypot(x - rp.x, y - rp.y);
              const band = 1 - Math.min(1, Math.abs(dd - rr) / 34);
              if (band > 0) {
                const fade = (1 - rp.t / 1.1) ** 2;
                a = Math.max(a, band * 0.5 * fade);
                dx += ((x - rp.x) / (dd || 1)) * band * 7 * fade;
                dy += ((y - rp.y) / (dd || 1)) * band * 7 * fade;
              }
            }
            if (a < 0.015) continue;
            g.globalAlpha = a;
            g.fillStyle = a > 0.3 ? '#0E5A63' : '#15181A';
            g.fillRect(x + dx - 0.9, y + dy - 0.9, 1.8, 1.8);
          }
        }
      };
      // Only the neighbourhoods that can light up are visited.
      if (energy > 0.01) draw(px - R, py - R, px + R, py + R);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.t += dt;
        if (rp.t > 1.1) ripples.splice(i, 1);
      }
      if (ripples.length) draw(0, 0, W, H);
      g.globalAlpha = 1;

      if (energy < 0.005 && !ripples.length) {
        g.clearRect(0, 0, W, H);
        stop?.();
        stop = null;
      }
    };

    const wake = () => {
      if (!stop) stop = onTick(tick);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      ripples.push({ x: e.clientX, y: e.clientY, t: 0 });
      if (ripples.length > 4) ripples.shift();
      wake();
    };
    window.addEventListener('pointermove', wake, { passive: true });
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('resize', size);
    return () => {
      stop?.();
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', size);
    };
  }, []);

  return <canvas ref={ref} className="grid-field" aria-hidden />;
}
