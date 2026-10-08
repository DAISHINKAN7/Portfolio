'use client';

import { useEffect, useRef } from 'react';
import { perfTier, prefersReducedMotion } from '@/lib/motion';
import { onTick, pointer } from '@/lib/runtime';
import type { LatentScene } from './latent-scene';

export type Chapter = {
  eyebrow: string;
  title: string;
  body: string;
  href?: string;
  metric?: { value: string; label: string };
};

/**
 * "One point cloud, re-embedded." A pinned scroll sequence: tens of thousands
 * of points first form a stipple engraving of the author's photograph, then
 * break apart and re-form as a visual metaphor for each project, and finally
 * settle onto a single hairline rule. Every caption is existing site copy.
 *
 * It is an overture to the project list that follows — which carries the same
 * information as real, accessible content — so the stage is hidden from
 * assistive tech, and it only exists for visitors with motion enabled.
 */
export function LatentStage({ chapters, photo }: { chapters: Chapter[]; photo: string }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current!;
    const cv = canvas.current!;
    if (prefersReducedMotion()) return;
    const caps = Array.from(el.querySelectorAll<HTMLElement>('.latent-cap'));
    const ticks = Array.from(el.querySelectorAll<HTMLElement>('.latent-tick'));
    const fig = el.querySelector<HTMLElement>('.latent-fig-label')!;
    const counter = el.querySelector<HTMLElement>('.latent-count')!;
    const fill = el.querySelector<HTMLElement>('.latent-fill')!;

    let scene: LatentScene | null = null;
    let labels: string[] = [];
    let stop: (() => void) | null = null;
    let visible = false;
    let disposed = false;
    let active = -1;
    let compact = window.innerWidth < 1024;
    const tier = perfTier();
    const n = compact ? 14000 : tier >= 2 ? 36000 : 20000;

    const progress = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return Math.max(0, Math.min(1, -r.top / Math.max(1, span)));
    };

    const setActive = (i: number) => {
      if (i === active) return;
      active = i;
      caps.forEach((c, k) => (c.dataset.on = k === i ? 'true' : 'false'));
      ticks.forEach((t, k) => (t.dataset.on = k + 2 <= i ? 'true' : 'false'));
      fig.textContent = labels[i] ?? '';
      el.dataset.chapter = String(i);
    };

    const tick = (dt: number, t: number) => {
      if (!scene) return;
      const p = progress();
      const chapter = p * (chapters.length - 1);
      setActive(Math.min(chapters.length - 1, Math.round(chapter)));
      fill.style.transform = `scaleX(${p.toFixed(4)})`;
      const r = cv.getBoundingClientRect();
      const inside = pointer.active && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
      scene.frame({
        chapter,
        t,
        dt,
        mouse: inside ? [((pointer.x - r.left) / r.width) * 2 - 1, -(((pointer.y - r.top) / r.height) * 2 - 1)] : null,
        press: inside && pointer.down,
        alpha: 1,
      });
    };

    const size = () => {
      compact = window.innerWidth < 1024;
      const r = cv.getBoundingClientRect();
      scene?.resize(r.width, r.height, compact);
    };

    const build = async () => {
      const [{ createLatentScene }, S] = await Promise.all([import('./latent-scene'), import('./shapes')]);
      const img = new Image();
      img.src = photo;
      await img.decode().catch(() => undefined);
      if (disposed) return;
      const forms = [
        img.naturalWidth ? S.portrait(n, img) : S.latent(n),
        S.latent(n),
        S.debris(n),
        S.galaxy(n),
        S.surface(n),
        S.storm(n),
        S.graph(n),
        S.chain(n),
        S.rule(n),
      ];
      labels = forms.map((f) => (f.label ? `fig — ${f.label}` : ''));
      counter.textContent = `n = ${n.toLocaleString('en-US')} points · one cloud, re-embedded`;
      scene = createLatentScene(cv, forms, n);
      if (!scene) {
        el.dataset.failed = 'true';
        return;
      }
      el.dataset.ready = 'true';
      size();
      active = -1;
      if (visible && !stop) stop = onTick(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !scene && !el.dataset.building) {
          el.dataset.building = 'true';
          build().catch(() => (el.dataset.failed = 'true'));
        } else if (visible && scene && !stop) stop = onTick(tick);
        else if (!visible && stop) {
          stop();
          stop = null;
        }
      },
      { rootMargin: '60% 0px 60% 0px' }
    );
    io.observe(el);
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    return () => {
      disposed = true;
      stop?.();
      io.disconnect();
      ro.disconnect();
      scene?.destroy();
    };
  }, [chapters, photo]);

  const projects = chapters.length - 3; // portrait, overview, and the closing rule
  return (
    <section ref={root} className="latent" aria-hidden data-ready="false" style={{ ['--chapters' as string]: chapters.length }}>
      <div className="latent-pin" data-cursor="scene" data-cursor-label="press">
        <canvas ref={canvas} className="latent-canvas" />
        <div className="shell latent-ui">
          {chapters.map((c, i) => (
            <div key={i} className="latent-cap" data-on={i === 0 ? 'true' : 'false'}>
              {c.eyebrow && <p className="eyebrow latent-k" style={{ ['--k' as string]: 0 }}>{c.eyebrow}</p>}
              {c.title && (
                <p className="display-xl latent-title latent-k" style={{ ['--k' as string]: 1 }}>
                  {c.title}
                </p>
              )}
              {c.body && (
                <p className="lede latent-k mt-5" style={{ ['--k' as string]: 2 }}>
                  {c.body}
                </p>
              )}
              {c.metric && (
                <p className="latent-k mt-6 flex items-baseline gap-3" style={{ ['--k' as string]: 3 }}>
                  <span className="data text-3xl text-ink">{c.metric.value}</span>
                  <span className="max-w-[16rem] text-micro leading-snug text-ink-2">{c.metric.label}</span>
                </p>
              )}
              {c.href && (
                <a href={c.href} tabIndex={-1} className="link-arrow latent-k mt-7 inline-flex" style={{ ['--k' as string]: 4 }}>
                  Read the case study →
                </a>
              )}
            </div>
          ))}

          <div className="latent-hud">
            <div className="latent-rail">
              {Array.from({ length: projects }, (_, i) => (
                <span key={i} className="latent-tick">
                  {String(i + 1).padStart(2, '0')}
                </span>
              ))}
              <span className="latent-track">
                <span className="latent-fill" />
              </span>
            </div>
            <p className="latent-fig-label" />
            <p className="latent-count" />
          </div>
          <p className="latent-hint">scroll</p>
        </div>
      </div>
    </section>
  );
}
