'use client';

import { useEffect, useRef } from 'react';
import { perfTier, prefersReducedMotion } from '@/lib/motion';
import { onTick, pointer } from '@/lib/runtime';
import type { NetworkScene } from './network-scene';
import { LAYER_NAMES } from './layer-names';

/**
 * Hosts the hero network behind the existing hero content. The canvas never
 * takes pointer events — text stays selectable and every link clickable —
 * it simply reads the shared pointer. The scene code loads after hydration,
 * runs only while the hero is on screen, and under reduced motion renders a
 * single settled frame as a still illustration.
 */
export function HeroField() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const host = wrap.current!.parentElement!;
    const cv = canvas.current!;
    let scene: NetworkScene | null = null;
    let stop: (() => void) | null = null;
    let visible = false;
    let disposed = false;
    const still = prefersReducedMotion();
    const tier = perfTier();
    let compact = window.innerWidth < 1024;

    const size = () => {
      const r = cv.getBoundingClientRect();
      compact = window.innerWidth < 1024;
      scene?.resize(r.width, r.height);
      // Desktop: frame the portrait. Mobile: sit up behind the name.
      const photo = host.querySelector('.hero-photo');
      if (!compact && photo) {
        const p = photo.getBoundingClientRect();
        const cx = (p.left + p.width / 2 - r.left) / r.width;
        const cy = (p.top + p.height * 0.62 - r.top) / r.height;
        scene?.setAnchor(cx * 2 - 1, -(cy * 2 - 1));
      } else scene?.setAnchor(0.15, 0.62);
    };

    const progress = () => {
      const r = host.getBoundingClientRect();
      return Math.min(1, Math.max(0, -r.top / (r.height * 0.9)));
    };

    const placeLabels = () => {
      if (!scene || compact) return;
      scene.labels().forEach((p, i) => {
        const el = labels.current[i];
        if (el) el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translateX(-50%)`;
      });
    };

    const tick = (dt: number, t: number) => {
      if (!scene) return;
      const r = cv.getBoundingClientRect();
      const x = pointer.x - r.left;
      const y = pointer.y - r.top;
      const inside = pointer.active && x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      scene.setPointer(x, y, inside, pointer.down);
      scene.setScroll(progress());
      scene.frame(dt, t);
      placeLabels();
    };

    const run = () => {
      if (stop || !scene || !visible || still) return;
      stop = onTick(tick);
    };
    const halt = () => {
      stop?.();
      stop = null;
    };

    import('./network-scene').then(({ createNetworkScene }) => {
      if (disposed) return;
      scene = createNetworkScene(cv, still ? 1 : tier === 0 ? 1 : tier, compact);
      if (!scene) return;
      size();
      wrap.current!.dataset.ready = 'true';
      if (still) {
        // Settle the springs off-screen, then draw once.
        for (let i = 0; i < 140; i++) scene.frame(1 / 60, 4 + i / 60);
        placeLabels();
      } else run();
    });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) run();
      else halt();
    });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      size();
      if (still && scene) scene.frame(0, 4);
    });
    ro.observe(cv);

    const onTap = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !scene) return;
      const r = cv.getBoundingClientRect();
      scene.tap(e.clientX - r.left, e.clientY - r.top);
    };
    host.addEventListener('pointerdown', onTap, { passive: true });

    // Konami: a hidden state. The hero content steps back, the network comes
    // forward and assembles the initials, then everything settles back.
    let eggTimer: ReturnType<typeof setTimeout> | undefined;
    const onMorph = () => {
      if (!scene || still || scene.morphing()) return;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scene.morph('KA');
      host.dataset.egg = 'on';
      clearTimeout(eggTimer);
      eggTimer = setTimeout(() => delete host.dataset.egg, 5600);
    };
    window.addEventListener('kunal:konami', onMorph);

    return () => {
      disposed = true;
      halt();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener('pointerdown', onTap);
      window.removeEventListener('kunal:konami', onMorph);
      clearTimeout(eggTimer);
      scene?.destroy();
    };
  }, []);

  return (
    <div ref={wrap} className="hero-field" aria-hidden data-ready="false">
      <canvas ref={canvas} />
      <div className="hero-field-labels">
        {LAYER_NAMES.map((n, i) => (
          <span key={n} ref={(el) => void (labels.current[i] = el)}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
