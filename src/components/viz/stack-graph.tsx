'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { perfTier, prefersReducedMotion } from '@/lib/motion';
import { onTick, pointer } from '@/lib/runtime';
import type { GEdge, GNode, StackScene } from './stack-graph-scene';

/**
 * Host for the 3D skill ↔ project graph. Drag to orbit (with inertia), point
 * at a node to trace its links, click a project to open it. Hovering any
 * skill-group heading on the page lights that group in the graph. The skill
 * lists beside it remain the accessible source of the same information.
 */
export function StackGraph({ nodes, edges }: { nodes: GNode[]; edges: GEdge[] }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labelBox = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = host.current!;
    const cv = canvas.current!;
    let scene: StackScene | null = null;
    let stop: (() => void) | null = null;
    let visible = false;
    let disposed = false;
    const still = prefersReducedMotion();
    const tier = perfTier();
    const projLabels = Array.from(labelBox.current!.querySelectorAll<HTMLElement>('[data-node]'));

    const size = () => {
      const r = cv.getBoundingClientRect();
      scene?.resize(r.width, r.height);
    };

    const paintLabels = () => {
      if (!scene) return;
      const ns = scene.projected();
      projLabels.forEach((lb) => {
        const n = ns[Number(lb.dataset.node)];
        lb.style.transform = `translate3d(${n.sx.toFixed(1)}px, ${n.sy.toFixed(1)}px, 0)`;
        lb.style.opacity = String(0.55 + Math.min(1, n.hl) * 0.45);
      });
      const h = scene.hovered();
      const t = tip.current!;
      if (h && h.kind === 'skill') {
        t.textContent = h.label;
        t.style.transform = `translate3d(${h.sx.toFixed(1)}px, ${h.sy.toFixed(1)}px, 0)`;
        t.style.opacity = '1';
      } else t.style.opacity = '0';
      el.dataset.hoverProject = h?.kind === 'project' ? 'true' : 'false';
    };

    const tick = (dt: number, t: number) => {
      if (!scene) return;
      const r = cv.getBoundingClientRect();
      const x = pointer.x - r.left, y = pointer.y - r.top;
      scene.setPointer(x, y, pointer.active && x >= 0 && y >= 0 && x <= r.width && y <= r.height);
      scene.frame(dt, t);
      paintLabels();
    };

    const run = () => {
      if (stop || !scene || !visible || still) return;
      stop = onTick(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !scene) {
          import('./stack-graph-scene').then(({ createStackScene }) => {
            if (disposed) return;
            scene = createStackScene(cv, { nodes, edges }, still ? 1 : tier || 1);
            if (!scene) return;
            el.dataset.ready = 'true';
            size();
            if (still) {
              for (let i = 0; i < 400; i++) scene.frame(1 / 60, i / 60);
              paintLabels();
            } else run();
          });
        } else if (visible) run();
        else {
          stop?.();
          stop = null;
        }
      },
      { rootMargin: '0px 0px -15% 0px' }
    );
    io.observe(el);
    const ro = new ResizeObserver(() => {
      size();
      if (still && scene) {
        scene.frame(0, 0);
        paintLabels();
      }
    });
    ro.observe(cv);

    // Orbit by drag. Horizontal drags only on touch so vertical scroll still works.
    let down: { x: number; y: number; moved: boolean; id: number } | null = null;
    let lastX = 0, vx = 0;
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
      lastX = e.clientX;
      vx = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down || !scene || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!down.moved && Math.hypot(dx, dy) > 4) {
        if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) {
          down = null;
          return;
        }
        down.moved = true;
        cv.setPointerCapture(e.pointerId);
        el.dataset.dragging = 'true';
      }
      if (down.moved) {
        scene.drag(e.clientX - lastX, e.pointerType === 'touch' ? 0 : e.movementY);
        vx = vx * 0.6 + (e.clientX - lastX) * 0.4;
        lastX = e.clientX;
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!down || !scene) return;
      if (down.moved) scene.release(vx);
      else {
        const h = scene.hovered();
        if (h?.kind === 'project') router.push(`/projects/${h.id}`);
      }
      down = null;
      el.dataset.dragging = 'false';
      if (cv.hasPointerCapture(e.pointerId)) cv.releasePointerCapture(e.pointerId);
    };
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);

    // Cross-link: skill-group headings elsewhere on the page drive the graph.
    const onOver = (e: PointerEvent) => {
      const g = (e.target as Element).closest<HTMLElement>('[data-skill-group]');
      scene?.setGroup(g?.dataset.skillGroup ?? null);
      if (still && scene) {
        scene.frame(1, 0);
        paintLabels();
      }
    };
    document.addEventListener('pointerover', onOver, { passive: true });

    return () => {
      disposed = true;
      stop?.();
      io.disconnect();
      ro.disconnect();
      cv.removeEventListener('pointerdown', onDown);
      cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerup', onUp);
      cv.removeEventListener('pointercancel', onUp);
      document.removeEventListener('pointerover', onOver);
      scene?.destroy();
    };
  }, [nodes, edges, router]);

  return (
    <figure className="stack-graph mb-10">
      <div ref={host} className="stack-stage relative border border-rule bg-surface" data-ready="false" data-cursor="scene" data-cursor-label="drag">
        <canvas ref={canvas} aria-hidden className="block h-full w-full" />
        <div ref={labelBox} className="stack-labels" aria-hidden>
          {nodes.map((n, i) =>
            n.kind === 'project' ? (
              <span key={n.id} data-node={i} className="stack-label">
                {n.label}
              </span>
            ) : null
          )}
          <span ref={tip} className="stack-tip" />
        </div>
        <span className="stack-corner eyebrow" aria-hidden>
          {nodes.filter((n) => n.kind === 'skill').length} skills · {nodes.filter((n) => n.kind === 'project').length} projects ·{' '}
          {edges.length} evidence links
        </span>
      </div>
      <figcaption className="mt-3 max-w-measure text-micro leading-relaxed text-ink-2">
        Every evidenced skill on this site, linked to the projects that evidence it, and laid out by a force simulation rather than by hand — where a skill
        lands is a consequence of what it was used for. Drag to orbit; point at a node to trace it; hover a group heading to light its
        cluster.
      </figcaption>
    </figure>
  );
}
