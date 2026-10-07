/**
 * Skill ↔ project graph, laid out by a live 3D force simulation.
 *
 * The data is the site's own: every skill links to the projects listed as its
 * evidence. Nothing is positioned by hand — repulsion, edge springs and a
 * weak pull toward each skill group's centroid settle it into clusters, so
 * where a skill lands is a consequence of what it was used for.
 */
import { mulberry32, type PerfTier, Spring, springs } from '@/lib/motion';
import { mat4, multiply, orbitView, perspective, project } from '@/lib/gl/mat4';
import { createRenderer, RGB } from '@/lib/gl/renderer';

export type GNode = { id: string; label: string; kind: 'project' | 'skill'; group?: string };
export type GEdge = [number, number];

type SimNode = GNode & { x: number; y: number; z: number; vx: number; vy: number; vz: number; sx: number; sy: number; sw: number; hl: number; deg: number };

export type StackScene = {
  resize(w: number, h: number): void;
  frame(dt: number, t: number): void;
  setPointer(x: number, y: number, inside: boolean): void;
  drag(dx: number, dy: number): void;
  release(vx: number): void;
  setGroup(g: string | null): void;
  hovered(): SimNode | null;
  projected(): SimNode[];
  destroy(): void;
};

export function createStackScene(canvas: HTMLCanvasElement, data: { nodes: GNode[]; edges: GEdge[] }, tier: PerfTier): StackScene | null {
  const r = createRenderer(canvas);
  if (!r) return null;
  const rand = mulberry32(2026);

  const nodes: SimNode[] = data.nodes.map((n) => ({
    ...n,
    // Start collapsed near the centre: the layout unfolds as it comes into view.
    x: (rand() - 0.5) * 0.4,
    y: (rand() - 0.5) * 0.4,
    z: (rand() - 0.5) * 0.4,
    vx: 0, vy: 0, vz: 0, sx: 0, sy: 0, sw: 1, hl: 0, deg: 0,
  }));
  data.edges.forEach(([a, b]) => {
    nodes[a].deg++;
    nodes[b].deg++;
  });
  const adj = nodes.map(() => new Set<number>());
  data.edges.forEach(([a, b]) => {
    adj[a].add(b);
    adj[b].add(a);
  });

  const pts = new Float32Array((nodes.length * 2 + 8) * 9);
  const lns = new Float32Array(data.edges.length * 2 * 7);
  const view = mat4(), proj = mat4(), mvp = mat4(), tmp = new Float32Array(3);

  let W = 1, H = 1;
  let alpha = 1;
  const yaw = new Spring(0.6, 0.6, springs.panel);
  const pitch = new Spring(0.28, 0.28, springs.panel);
  let spin = 0.06; // idle angular velocity, rad/s
  let dragging = false;
  const ptr = { x: -1e4, y: -1e4, inside: false };
  let hover = -1;
  let group: string | null = null;

  const step = (dt: number) => {
    const n = nodes.length;
    const k = alpha;
    // Repulsion (n ≈ 64: all pairs is cheaper than any tree here).
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        let d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 1e-4) { dx = rand() - 0.5; dy = rand() - 0.5; dz = rand() - 0.5; d2 = 0.01; }
        const big = a.kind === 'project' && b.kind === 'project' ? 3 : 1;
        const f = (0.55 * big * k) / d2;
        const inv = 1 / Math.sqrt(d2);
        a.vx += dx * inv * f; a.vy += dy * inv * f; a.vz += dz * inv * f;
        b.vx -= dx * inv * f; b.vy -= dy * inv * f; b.vz -= dz * inv * f;
      }
    }
    // Edge springs.
    for (const [ia, ib] of data.edges) {
      const a = nodes[ia], b = nodes[ib];
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
      const f = (d - 1.5) * 0.09 * k;
      const fx = (dx / d) * f, fy = (dy / d) * f, fz = (dz / d) * f;
      const wa = 1 / (1 + a.deg * 0.15), wb = 1 / (1 + b.deg * 0.15);
      a.vx += fx * wa; a.vy += fy * wa; a.vz += fz * wa;
      b.vx -= fx * wb; b.vy -= fy * wb; b.vz -= fz * wb;
    }
    // Weak cohesion per skill group, and gravity to the origin.
    const cent = new Map<string, [number, number, number, number]>();
    for (const a of nodes) {
      if (!a.group) continue;
      const c = cent.get(a.group) ?? [0, 0, 0, 0];
      c[0] += a.x; c[1] += a.y; c[2] += a.z; c[3]++;
      cent.set(a.group, c);
    }
    for (const a of nodes) {
      if (a.group) {
        const c = cent.get(a.group)!;
        a.vx += (c[0] / c[3] - a.x) * 0.012 * k;
        a.vy += (c[1] / c[3] - a.y) * 0.012 * k;
        a.vz += (c[2] / c[3] - a.z) * 0.012 * k;
      }
      a.vx -= a.x * 0.006; a.vy -= a.y * 0.006; a.vz -= a.z * 0.006;
      a.vx *= 0.82; a.vy *= 0.82; a.vz *= 0.82;
      a.x += a.vx * dt * 60; a.y += a.vy * dt * 60; a.z += a.vz * dt * 60;
    }
    alpha = Math.max(0.04, alpha * Math.pow(0.985, dt * 60));
  };

  const frame = (dt: number) => {
    // Iterations per frame scale with headroom; the layout cools regardless.
    const iters = tier >= 2 ? 2 : 1;
    for (let i = 0; i < iters; i++) step(dt / iters);

    if (!dragging) yaw.target += spin * dt;
    yaw.step(dt); pitch.step(dt);
    spin += (0.06 - spin) * Math.min(1, dt * 0.8); // inertia decays back to idle

    // Fit the camera to the current extent.
    let rad = 0.1;
    for (const a of nodes) rad = Math.max(rad, Math.hypot(a.x, a.y, a.z));
    const fov = 0.7;
    const aspect = W / H;
    const fit = (rad / Math.tan(fov / 2) / Math.min(1, aspect)) * 0.86;
    perspective(proj, fov, aspect, 0.1, 200);
    const dist = Math.max(6, fit + rad * 0.4);
    orbitView(view, pitch.x, yaw.x, dist);
    multiply(mvp, proj, view);
    // Sizes are authored for the orbit centre; nearer nodes grow, farther shrink.
    const focal = dist;

    // Project + pick.
    hover = -1;
    let best = 18;
    nodes.forEach((a, i) => {
      project(tmp, mvp, a.x, a.y, a.z, W, H);
      a.sx = tmp[0]; a.sy = tmp[1]; a.sw = tmp[2];
      if (ptr.inside && !dragging) {
        const d = Math.hypot(a.sx - ptr.x, a.sy - ptr.y);
        const reach = a.kind === 'project' ? 22 : 14;
        if (d < Math.min(best, reach)) { best = d; hover = i; }
      }
    });

    // Highlight set: hovered node + neighbours, or a whole skill group.
    const hot = new Set<number>();
    if (hover >= 0) {
      hot.add(hover);
      adj[hover].forEach((j) => hot.add(j));
    } else if (group) {
      nodes.forEach((a, i) => {
        if (a.group === group) {
          hot.add(i);
          adj[i].forEach((j) => hot.add(j));
        }
      });
    }
    const any = hot.size > 0;
    nodes.forEach((a, i) => (a.hl += ((hot.has(i) ? 1 : 0) - a.hl) * Math.min(1, dt * 9)));

    let li = 0;
    for (const [ia, ib] of data.edges) {
      const a = nodes[ia], b = nodes[ib];
      const h = Math.min(a.hl, b.hl);
      const col = h > 0.02 ? RGB.accent : RGB.rule2;
      const al = any ? 0.12 + h * 0.75 : 0.38;
      for (const v of [a, b]) {
        lns[li++] = v.x; lns[li++] = v.y; lns[li++] = v.z;
        lns[li++] = col[0]; lns[li++] = col[1]; lns[li++] = col[2]; lns[li++] = al;
      }
    }

    let pi = 0;
    const put = (a: SimNode, s: number, c: readonly number[], al: number, k: number) => {
      pts[pi++] = a.x; pts[pi++] = a.y; pts[pi++] = a.z; pts[pi++] = s;
      pts[pi++] = c[0]; pts[pi++] = c[1]; pts[pi++] = c[2]; pts[pi++] = al; pts[pi++] = k;
    };
    nodes.forEach((a) => {
      const dim = any ? 0.25 + a.hl * 0.75 : 1;
      if (a.kind === 'project') {
        put(a, 18 + a.hl * 4, RGB.accent, 0.95 * dim, 2);
        put(a, 5, RGB.accent, dim, 0);
      } else {
        const c = a.hl > 0.3 ? RGB.accent : RGB.ink;
        put(a, 4.5 + a.hl * 2.5 + Math.min(3, a.deg - 1), c, 0.72 * dim, 0);
      }
    });

    r.draw(mvp, focal, lns, li / 7, pts, pi / 9);
  };

  return {
    resize(w, h) {
      W = w; H = h;
      r.resize(w, h, tier >= 2 ? 2 : 1.5);
    },
    frame,
    setPointer(x, y, inside) {
      ptr.x = x; ptr.y = y; ptr.inside = inside;
    },
    drag(dx, dy) {
      dragging = true;
      yaw.target += dx * 0.008;
      pitch.target = Math.max(-1.2, Math.min(1.2, pitch.target + dy * 0.006));
    },
    release(vx) {
      dragging = false;
      spin = Math.max(-3, Math.min(3, vx * 0.5));
    },
    setGroup(g) {
      group = g;
    },
    hovered: () => (hover >= 0 ? nodes[hover] : null),
    projected: () => nodes,
    destroy: () => r.destroy(),
  };
}
