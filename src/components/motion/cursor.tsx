'use client';

import { useEffect, useRef } from 'react';
import { Spring, springs } from '@/lib/motion';
import { onTick, pointer } from '@/lib/runtime';

/**
 * A precise dot (zero lag — the computational half) and four crop marks on
 * springs (the physical half). Over anything interactive the marks lift off
 * the pointer and frame the element, the way a proof gets marked up.
 *
 * Contextual states come from the nearest [data-cursor] attribute:
 *   data-cursor="open"   label beside the pointer ("open")
 *   data-cursor="scene"  wider marks + optional data-cursor-label
 * Fine pointers only, never under reduced motion.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('has-cursor');
    // Captured once: React detaches refs before running effect cleanup, so a
    // frame or event that lands in between must not read them.
    const rootEl = root.current!;
    const frameEl = frame.current!;
    const dotEl = dot.current!;
    const labelEl = label.current!;

    const x = new Spring(pointer.x, pointer.x, springs.trail);
    const y = new Spring(pointer.y, pointer.y, springs.trail);
    const w = new Spring(26, 26, springs.trail);
    const h = new Spring(26, 26, springs.trail);
    const press = new Spring(1, 1, springs.magnetic);
    const all = [x, y, w, h, press];

    let target: Element | null = null;
    let mode: 'idle' | 'frame' | 'open' | 'scene' = 'idle';
    let stop: (() => void) | null = null;
    let first = true;

    const resolve = (el: Element | null) => {
      const ctx = el?.closest('[data-cursor]');
      const hit = el?.closest('a, button, [role="button"], summary, label[for]');
      if (ctx) {
        const kind = ctx.getAttribute('data-cursor');
        mode = kind === 'open' ? 'open' : kind === 'scene' ? 'scene' : 'frame';
        target = mode === 'frame' ? ctx : hit ?? ctx;
        labelEl.textContent = ctx.getAttribute('data-cursor-label') ?? (mode === 'open' ? 'open' : '');
      } else if (hit) {
        mode = 'frame';
        target = hit;
      } else {
        mode = 'idle';
        target = null;
      }
      rootEl.dataset.mode = mode;
    };

    const tick = (dt: number) => {
      let tx = pointer.x;
      let ty = pointer.y;
      let tw = 26;
      let th = 26;
      if (mode === 'frame' && target) {
        const r = target.getBoundingClientRect();
        // Frame the element, but let the pointer tug it slightly.
        tx = r.left + r.width / 2 + (pointer.x - (r.left + r.width / 2)) * 0.08;
        ty = r.top + r.height / 2 + (pointer.y - (r.top + r.height / 2)) * 0.08;
        tw = r.width + 14;
        th = r.height + 12;
      } else if (mode === 'scene') {
        tw = th = 46;
      } else if (mode === 'open') {
        tw = th = 38;
      }
      if (first) {
        x.snap(tx);
        y.snap(ty);
        first = false;
      }
      x.target = tx;
      y.target = ty;
      w.target = tw;
      h.target = th;
      press.target = pointer.down ? 0.82 : 1;
      for (const s of all) {
        s.step(dt / 2);
        s.step(dt / 2);
      }
      const p = press.x;
      frameEl.style.transform = `translate3d(${(x.x - (w.x * p) / 2).toFixed(2)}px, ${(y.x - (h.x * p) / 2).toFixed(2)}px, 0)`;
      frameEl.style.width = `${(w.x * p).toFixed(2)}px`;
      frameEl.style.height = `${(h.x * p).toFixed(2)}px`;
      dotEl.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;

      // Sleep once everything has settled on a still pointer.
      if (all.every((s) => s.resting) && mode !== 'frame') {
        stop?.();
        stop = null;
      }
    };

    const wakeUp = () => {
      if (!stop) stop = onTick(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      rootEl.dataset.visible = 'true';
      wakeUp();
    };
    const onOver = (e: PointerEvent) => {
      resolve(e.target as Element);
      wakeUp();
    };
    const onLeave = () => {
      rootEl.dataset.visible = 'false';
    };
    const onDown = () => wakeUp();

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onDown, { passive: true });
    html.addEventListener('pointerleave', onLeave);
    // Scrolling moves framed targets under a still pointer.
    window.addEventListener('scroll', wakeUp, { passive: true });

    return () => {
      html.classList.remove('has-cursor');
      stop?.();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onDown);
      html.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', wakeUp);
    };
  }, []);

  return (
    <div ref={root} className="cursor" data-mode="idle" data-visible="false" aria-hidden>
      <div ref={frame} className="cursor-frame">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div ref={dot} className="cursor-dot">
        <span ref={label} className="cursor-label" />
      </div>
    </div>
  );
}
