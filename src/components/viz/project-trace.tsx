'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { onTick, pointer } from '@/lib/runtime';
import type { Ptr, Trace } from './trace-kit';

const LOADERS: Record<string, () => Promise<{ default: () => Trace }>> = {
  astroguard: () => import('./traces/astroguard'),
  'radio-optical-classification': () => import('./traces/radio'),
  'adaptive-beta': () => import('./traces/beta'),
  'eco-rewind': () => import('./traces/eco'),
  'ssa-intel': () => import('./traces/ssa'),
  revenueos: () => import('./traces/revenueos'),
};

const CAPTIONS: Record<string, string> = {
  astroguard: 'ACL-isolated retrieval → two debate rounds → weighted synthesis',
  'radio-optical-classification': 'paired radio + optical input → three backbones → soft-voting ensemble',
  'adaptive-beta': 'forecast beta instability → VIX gate → threshold → rebalance or hold',
  'eco-rewind': 'roll the model past the event without the storm → the gap is the attribution',
  'ssa-intel': 'a real corpus sentence → BIO tags → typed relations in the graph',
  revenueos: 'the planner proposes tools; only the deterministic chain touches money',
};

/**
 * A small live figure: what the project does, running. Loads its drawing code
 * only as it nears the viewport, animates only while visible, and under
 * reduced motion draws the single frame that best explains the system.
 */
export function ProjectTrace({ slug }: { slug: string }) {
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const load = LOADERS[slug];
    const el = host.current;
    const cv = canvas.current;
    if (!load || !el || !cv) return;
    const g = cv.getContext('2d');
    if (!g) return;

    const still = prefersReducedMotion();
    let trace: Trace | null = null;
    let w = 0;
    let h = 0;
    let t = 0;
    let stop: (() => void) | null = null;
    let visible = false;
    let disposed = false;
    let touch: Ptr | null = null;

    const size = () => {
      if (!trace) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // The stage is sized by layout alone; the canvas is absolutely
      // positioned inside it so its pixel size can never feed back into it.
      const stage = cv.parentElement!;
      w = stage.clientWidth;
      h = trace.height(w);
      stage.style.height = `${h}px`;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ptr = (): Ptr => {
      if (touch) return touch;
      const r = cv.getBoundingClientRect();
      const x = pointer.x - r.left;
      const y = pointer.y - r.top;
      return { x, y, inside: pointer.active && x >= 0 && y >= 0 && x <= r.width && y <= r.height, down: pointer.down };
    };

    const paint = (dt: number) => {
      if (!trace) return;
      g.clearRect(0, 0, w, h);
      trace.draw(g, w, h, t, dt, ptr());
    };

    const run = () => {
      if (stop || still || !visible || !trace) return;
      stop = onTick((dt) => {
        t += dt;
        paint(dt);
      });
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !trace) {
          Promise.all([load(), document.fonts?.ready]).then(([m]) => {
            if (disposed) return;
            trace = m.default();
            size();
            t = still ? trace.still : 0;
            paint(0);
            el.dataset.ready = 'true';
            run();
          });
        } else if (visible) run();
        else {
          stop?.();
          stop = null;
        }
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(el);

    const ro = new ResizeObserver(() => {
      size();
      paint(0);
    });
    ro.observe(cv.parentElement!);

    // Touch: a press-and-drag on the figure acts as the pointer.
    const onTouch = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      const r = cv.getBoundingClientRect();
      touch = { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.type !== 'pointerup' && e.type !== 'pointercancel', down: true };
      if (!touch.inside) touch = null;
    };
    cv.addEventListener('pointerdown', onTouch);
    cv.addEventListener('pointermove', onTouch);
    cv.addEventListener('pointerup', onTouch);
    cv.addEventListener('pointercancel', onTouch);

    return () => {
      disposed = true;
      stop?.();
      io.disconnect();
      ro.disconnect();
      cv.removeEventListener('pointerdown', onTouch);
      cv.removeEventListener('pointermove', onTouch);
      cv.removeEventListener('pointerup', onTouch);
      cv.removeEventListener('pointercancel', onTouch);
    };
  }, [slug]);

  if (!LOADERS[slug]) return null;
  return (
    <figure ref={host} className="trace" data-ready="false" data-cursor="scene" data-cursor-label="live">
      <figcaption className="mb-2.5 flex items-start justify-between gap-4">
        <span className="flex items-baseline gap-2.5 text-micro leading-snug text-ink-3">
          <span className="eyebrow flex shrink-0 items-center gap-2 text-accent">
            <span className="trace-led" aria-hidden />
            Live
          </span>
          <span>{CAPTIONS[slug]}</span>
        </span>
        <span
          className="prov prov-reported shrink-0"
          title="An animated schematic of the system's behaviour. Labelled values come from the case study; motion and intermediate states are illustrative."
        >
          schematic
        </span>
      </figcaption>
      <div className="trace-stage border border-rule bg-surface">
        <canvas ref={canvas} aria-hidden className="absolute inset-0 block h-full w-full" />
      </div>
    </figure>
  );
}
