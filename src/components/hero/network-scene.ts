/**
 * The hero network: tokens → embeddings → model → outputs.
 *
 * Not decoration — a small, legible forward pass. Signals enter at whichever
 * node is nearest the pointer (a query entering wherever you look), travel
 * along weighted edges as packets, accumulate at the next layer, and fire
 * onward only past a threshold. Nodes sit on springs: the cursor bends them
 * toward itself, scrolling dollies the camera through the layers, and the
 * whole structure settles back to rest the moment you stop.
 *
 * Hidden: press and hold anywhere in the hero to open a gravity well. Let go.
 */
import { clamp, mulberry32, type PerfTier, Spring, springs } from '@/lib/motion';
import { mat4, multiply, orbitView, perspective, project } from '@/lib/gl/mat4';
import { createRenderer, RGB } from '@/lib/gl/renderer';

type Node = {
  layer: number;
  rx: number; ry: number; rz: number; // rest
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  act: number; // activation 0..1+
  att: number; // cursor attention 0..1
  charge: number;
  refractory: number;
  phase: number;
  out: number[]; // edge indices leaving this node
  sx: number; sy: number; sw: number; // screen projection cache
};
type Edge = { a: number; b: number; w: number; heat: number; lateral: boolean };
type Packet = { e: number; t: number; dur: number };
type Ripple = { n: number; t: number; big: boolean };
type Dust = { x: number; y: number; z: number; ox: number; oy: number; oz: number; tx: number; ty: number; tz: number; ph: number };

export { LAYER_NAMES } from './layer-names';

export type NetworkScene = {
  resize(w: number, h: number): void;
  setScroll(p: number): void;
  setPointer(x: number, y: number, inside: boolean, down: boolean): void;
  /** Screen-space NDC point the network should centre on. */
  setAnchor(x: number, y: number): void;
  tap(x: number, y: number): void;
  frame(dt: number, t: number): void;
  morph(text: string): void;
  morphing(): boolean;
  labels(): { x: number; y: number }[];
  destroy(): void;
};

export function createNetworkScene(canvas: HTMLCanvasElement, tier: PerfTier, compactLayout: boolean): NetworkScene | null {
  const r = createRenderer(canvas);
  if (!r) return null;
  const rand = mulberry32(31682);
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = rand();
    while (!v) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  /* ---------------- topology ---------------- */
  const counts = tier >= 2 ? [9, 24, 16, 5] : [7, 16, 9, 4];
  // Uneven spacing: tokens and the embedding cloud sit in open space left of
  // the portrait; the dense model layer is the black box behind it.
  const X = compactLayout ? [-3.1, -1.05, 1.05, 3.1] : [-3.45, -2.25, 0.45, 2.95];
  const nodes: Node[] = [];
  const mk = (layer: number, x: number, y: number, z: number): Node => ({
    layer, rx: x, ry: y, rz: z, x, y, z, vx: 0, vy: 0, vz: 0,
    act: 0, att: 0, charge: 0, refractory: 0, phase: rand() * Math.PI * 2, out: [], sx: 0, sy: 0, sw: 1,
  });

  // tokens: an ordered column — a sequence
  for (let i = 0; i < counts[0]; i++) {
    const y = (i - (counts[0] - 1) / 2) * 0.6;
    nodes.push(mk(0, X[0] + (rand() - 0.5) * 0.08, y, (rand() - 0.5) * 0.3));
  }
  // embeddings: three semantic clusters in a 3D blob
  const centroids = [
    [X[1] - 0.1, 1.25, 0.3],
    [X[1] + 0.2, -0.05, -0.45],
    [X[1] - 0.05, -1.4, 0.4],
  ];
  for (let i = 0; i < counts[1]; i++) {
    const c = centroids[i % 3];
    nodes.push(mk(1, c[0] + gauss() * 0.22, c[1] + gauss() * 0.34, c[2] + gauss() * 0.36));
  }
  // model: a lattice in the y–z plane — a dense layer seen in perspective
  const side = Math.round(Math.sqrt(counts[2]));
  for (let i = 0; i < counts[2]; i++) {
    const gy = Math.floor(i / side), gz = i % side;
    nodes.push(mk(2, X[2] + (rand() - 0.5) * 0.06, (gy - (side - 1) / 2) * 0.82, (gz - (side - 1) / 2) * 0.7));
  }
  // outputs: a distribution
  for (let i = 0; i < counts[3]; i++) {
    nodes.push(mk(3, X[3], (i - (counts[3] - 1) / 2) * 0.85, 0));
  }

  const edges: Edge[] = [];
  const byLayer = [0, 1, 2, 3].map((l) => nodes.map((n, i) => (n.layer === l ? i : -1)).filter((i) => i >= 0));
  const near = (i: number, pool: number[], k: number) =>
    pool
      .map((j) => [j, (nodes[i].ry - nodes[j].ry) ** 2 + (nodes[i].rz - nodes[j].rz) ** 2 + rand() * 0.15] as const)
      .sort((a, b) => a[1] - b[1])
      .slice(0, k)
      .map((p) => p[0]);
  const fan = [3, 3, 2];
  for (let l = 0; l < 3; l++) {
    for (const i of byLayer[l]) {
      for (const j of near(i, byLayer[l + 1], fan[l])) {
        nodes[i].out.push(edges.length);
        edges.push({ a: i, b: j, w: 0.35 + rand() * 0.65, heat: 0, lateral: false });
      }
    }
  }
  // Ensure every downstream node is reachable.
  for (let l = 1; l < 4; l++) {
    for (const j of byLayer[l]) {
      if (edges.some((e) => e.b === j)) continue;
      const i = near(j, byLayer[l - 1], 1)[0];
      nodes[i].out.push(edges.length);
      edges.push({ a: i, b: j, w: 0.6, heat: 0, lateral: false });
    }
  }
  // Semantic neighbours inside the embedding space: faint, undirected.
  for (const i of byLayer[1]) {
    for (const j of byLayer[1]) {
      if (j <= i) continue;
      const d = Math.hypot(nodes[i].rx - nodes[j].rx, nodes[i].ry - nodes[j].ry, nodes[i].rz - nodes[j].rz);
      if (d < 0.5) edges.push({ a: i, b: j, w: 0.3, heat: 0, lateral: true });
    }
  }

  /* ---------------- ambient field (also the morph substrate) ---------------- */
  const dustN = tier >= 2 ? 300 : 160;
  const dust: Dust[] = [];
  for (let i = 0; i < dustN; i++) {
    const x = (rand() - 0.5) * 11, y = (rand() - 0.5) * 6, z = (rand() - 0.5) * 6 - 1;
    dust.push({ x, y, z, ox: x, oy: y, oz: z, tx: x, ty: y, tz: z, ph: rand() * 6.28 });
  }

  /* ---------------- buffers ---------------- */
  const maxPoints = nodes.length * 2 + dustN + 64 + 64;
  const pts = new Float32Array(maxPoints * 9);
  const lns = new Float32Array(edges.length * 2 * 7);
  const view = mat4(), proj = mat4(), mvp = mat4();
  const tmp = new Float32Array(3);

  /* ---------------- state ---------------- */
  let W = 1, H = 1;
  let scrollP = 0;
  const anchor = { x: 0.4, y: 0 };
  const pointer = { x: -1e4, y: -1e4, inside: false, down: false, held: 0 };
  const camRX = new Spring(0.12, 0.12, springs.panel);
  const camRY = new Spring(-0.34, -0.34, springs.panel);
  const well = new Spring(0, 0, springs.elastic);
  let packets: Packet[] = [];
  let ripples: Ripple[] = [];
  let spawnT = 0.4;
  let morphT = -1;
  let wasHeld = false;
  let morphW = 0;

  const fire = (i: number, strength = 1) => {
    const n = nodes[i];
    if (n.refractory > 0) return;
    n.act = Math.min(1.4, n.act + strength);
    n.refractory = 0.55;
    ripples.push({ n: i, t: 0, big: n.layer === 3 });
    // Forward only, strongest weights first, a small random fan-out.
    const outs = [...n.out].sort((a, b) => edges[b].w - edges[a].w);
    let sent = 0;
    for (const e of outs) {
      if (sent >= 2 && rand() > 0.35) break;
      if (rand() > edges[e].w + 0.25) continue;
      const E = edges[e];
      const len = Math.hypot(nodes[E.b].rx - n.rx, nodes[E.b].ry - n.ry, nodes[E.b].rz - n.rz);
      packets.push({ e, t: 0, dur: 0.22 + len * 0.2 });
      sent++;
    }
  };

  const nearestNode = (x: number, y: number, maxD = Infinity) => {
    let best = -1, bd = maxD;
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.sx - x, n.sy - y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };

  /* ---------------- morph (easter egg) ---------------- */
  const morph = (text: string) => {
    const c = document.createElement('canvas');
    c.width = 240; c.height = 100;
    const g = c.getContext('2d')!;
    g.fillStyle = '#000';
    g.font = '600 86px "IBM Plex Sans Condensed", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 120, 54);
    const data = g.getImageData(0, 0, 240, 100).data;
    const filled: [number, number][] = [];
    for (let y = 0; y < 100; y += 2) for (let x = 0; x < 240; x += 2) if (data[(y * 240 + x) * 4 + 3] > 128) filled.push([x, y]);
    if (!filled.length) return;
    const all = [...dust];
    for (let i = filled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [filled[i], filled[j]] = [filled[j], filled[i]];
    }
    all.forEach((d, i) => {
      const [fx, fy] = filled[i % filled.length];
      d.tx = (fx - 120) / 26;
      d.ty = -(fy - 50) / 26;
      d.tz = (rand() - 0.5) * 0.25;
    });
    morphT = 0;
  };

  /* ---------------- frame ---------------- */
  const frame = (dt: number, t: number) => {
    const aspect = W / H;
    const fov = 0.62;
    const dist = 11.5 - scrollP * 5.5;
    perspective(proj, fov, aspect, 0.1, 60);

    // Camera: slow drift + pointer parallax + scroll rotation.
    const px = pointer.inside ? pointer.x / W - 0.5 : 0;
    const py = pointer.inside ? pointer.y / H - 0.5 : 0;
    // Morph weight from the previous frame squares the camera up and re-centres.
    const mw = morphW;
    camRY.target = (-0.34 + Math.sin(t * 0.07) * 0.06 + px * 0.16 + scrollP * 0.55) * (1 - mw);
    camRX.target = (0.12 + Math.cos(t * 0.05) * 0.03 + py * 0.1 + scrollP * 0.12) * (1 - mw);
    camRX.step(dt); camRY.step(dt);
    // Composition: centre on the anchor (the portrait on desktop), at any width
    // and any dolly distance.
    const half = Math.tan(fov / 2) * dist;
    const panX = anchor.x * aspect * half * (1 - mw);
    const panY = anchor.y * half * (1 - mw);
    orbitView(view, camRX.x, camRY.x, dist, panX, panY);
    multiply(mvp, proj, view);
    const focal = (H / 2) / Math.tan(fov / 2) / 100;

    // Gravity well: press and hold.
    if (pointer.down && pointer.inside) pointer.held += dt;
    else pointer.held = 0;
    const holding = pointer.held > 0.35;
    well.cfg = holding ? springs.panel : springs.elastic;
    well.target = holding ? 1 : 0;
    well.step(dt);
    if (wasHeld && !holding) {
      // Release: everything that was captured fires at once.
      nodes.forEach((n, i) => { if (n.att > 0.25) fire(i, 0.9); });
    }
    wasHeld = holding;

    const spread = 1 + scrollP * 1.8;
    const R = holding ? 300 : 150;

    nodes.forEach((n) => {
      project(tmp, mvp, n.x, n.y, n.z, W, H);
      n.sx = tmp[0]; n.sy = tmp[1]; n.sw = tmp[2];

      // Rest pose breathes; embedding clusters drift slowly.
      const br = 0.035;
      let tx = n.rx + Math.sin(t * 0.6 + n.phase) * br;
      let ty = n.ry + Math.cos(t * 0.5 + n.phase * 1.3) * br;
      let tz = n.rz * spread + Math.sin(t * 0.4 + n.phase * 0.7) * br;
      if (n.layer === 1) {
        const a = t * 0.08;
        const cx = X[1], dz = n.rz * spread, dx = n.rx - cx;
        tx = cx + dx * Math.cos(a) - dz * Math.sin(a) * 0.3;
        tz = dz * Math.cos(a) + dx * Math.sin(a) * 0.3;
      }

      // Cursor attention, computed in screen space and applied in world space.
      let att = 0;
      if (pointer.inside) {
        const dx = pointer.x - n.sx, dy = pointer.y - n.sy;
        const d = Math.hypot(dx, dy);
        if (d < R) {
          att = (1 - d / R) ** 2;
          const ppu = (H / 2) / Math.tan(fov / 2) / n.sw; // px per world unit at this depth
          const pull = 0.22 + well.x * 1.1;
          tx += (dx / ppu) * att * pull;
          ty -= (dy / ppu) * att * pull;
        }
      }
      n.att += (att - n.att) * Math.min(1, dt * 10);

      const k = 26, c = 7.5;
      n.vx += (-(n.x - tx) * k - n.vx * c) * dt;
      n.vy += (-(n.y - ty) * k - n.vy * c) * dt;
      n.vz += (-(n.z - tz) * k - n.vz * c) * dt;
      n.x += n.vx * dt; n.y += n.vy * dt; n.z += n.vz * dt;

      n.act *= Math.exp(-dt * 2.6);
      n.charge *= Math.exp(-dt * 1.2);
      n.refractory = Math.max(0, n.refractory - dt);
    });

    // Spawn queries: from under the pointer if it's here, else from a token.
    spawnT -= dt;
    if (spawnT <= 0 && morphT < 0) {
      let src = -1;
      if (pointer.inside) src = nearestNode(pointer.x, pointer.y, 220);
      if (src < 0) src = byLayer[0][Math.floor(rand() * byLayer[0].length)];
      fire(src, 1);
      spawnT = pointer.inside ? 0.9 : 1.7 + rand() * 0.8;
    }

    // Packets travel, then charge their target.
    const next: Packet[] = [];
    for (const p of packets) {
      p.t += dt / p.dur;
      const E = edges[p.e];
      E.heat = Math.min(1, E.heat + dt * 6);
      if (p.t >= 1) {
        const b = nodes[E.b];
        b.charge += E.w * 0.75;
        b.act = Math.min(1.4, b.act + 0.25);
        if (b.charge > 0.5) {
          b.charge = 0;
          fire(E.b, 0.8);
        }
      } else next.push(p);
    }
    packets = next.length > 160 ? next.slice(-160) : next;
    edges.forEach((e) => (e.heat *= Math.exp(-dt * 2.2)));
    ripples = ripples.filter((rp) => (rp.t += dt) < (rp.big ? 1.1 : 0.8));

    // Morph timeline.
    let m = 0;
    if (morphT >= 0) {
      morphT += dt;
      m = morphT < 1.2 ? morphT / 1.2 : morphT < 5 ? 1 : Math.max(0, 1 - (morphT - 5) / 1.4);
      m = m * m * (3 - 2 * m);
      if (morphT > 6.6) morphT = -1;
    }
    morphW = m;

    /* ---------- write buffers ---------- */
    const fade = clamp(1 - scrollP * 1.15);
    const netA = fade * (1 - m * 0.85);
    let li = 0;
    for (const e of edges) {
      const A = nodes[e.a], B = nodes[e.b];
      const hot = e.heat;
      const base = e.lateral ? 0.2 : 0.28;
      const a = (base + hot * 0.55 + (A.att + B.att) * 0.18) * netA;
      const h = Math.min(1, hot * 1.4);
      const cr = RGB.rule2[0] + (RGB.accent[0] - RGB.rule2[0]) * h;
      const cg = RGB.rule2[1] + (RGB.accent[1] - RGB.rule2[1]) * h;
      const cb = RGB.rule2[2] + (RGB.accent[2] - RGB.rule2[2]) * h;
      lns[li] = A.x; lns[li + 1] = A.y; lns[li + 2] = A.z;
      lns[li + 3] = cr; lns[li + 4] = cg; lns[li + 5] = cb; lns[li + 6] = a;
      lns[li + 7] = B.x; lns[li + 8] = B.y; lns[li + 9] = B.z;
      lns[li + 10] = cr; lns[li + 11] = cg; lns[li + 12] = cb; lns[li + 13] = a;
      li += 14;
    }

    let pi = 0;
    const put = (x: number, y: number, z: number, s: number, c: readonly number[], a: number, k: number) => {
      pts[pi] = x; pts[pi + 1] = y; pts[pi + 2] = z; pts[pi + 3] = s;
      pts[pi + 4] = c[0]; pts[pi + 5] = c[1]; pts[pi + 6] = c[2]; pts[pi + 7] = a; pts[pi + 8] = k;
      pi += 9;
    };

    // Dust first (behind), then the morph substrate.
    for (const d of dust) {
      const wob = 0.08;
      const fx = d.ox + Math.sin(t * 0.15 + d.ph) * wob;
      const fy = d.oy + Math.cos(t * 0.12 + d.ph) * wob;
      d.x = fx + (d.tx - fx) * m;
      d.y = fy + (d.ty - fy) * m;
      d.z = d.oz + (d.tz - d.oz) * m;
      const shimmer = m > 0 ? 0.5 + 0.5 * Math.sin(t * 3 + d.ph * 2) : 0;
      put(d.x, d.y, d.z, 1.6 + m * 3.4, m > 0.5 ? mix(RGB.ink, RGB.accent, shimmer * 0.7) : RGB.ink3, (0.16 + m * 0.74) * fade, 0);
    }

    nodes.forEach((n) => {
      const act = Math.min(1, n.act);
      const col = act > 0.04 || n.att > 0.05 ? mix(RGB.ink, RGB.accent, Math.min(1, act * 1.3 + n.att * 0.7)) : RGB.ink;
      const shape = n.layer === 0 ? 1 : n.layer === 3 ? 2 : 0;
      const size = (n.layer === 3 ? 11 : n.layer === 0 ? 6 : 5) + act * 3.5 + n.att * 3;
      put(n.x, n.y, n.z, size, col, (0.62 + act * 0.38) * netA, shape);
    });

    for (const rp of ripples) {
      const n = nodes[rp.n];
      const life = rp.big ? 1.1 : 0.8;
      const p = rp.t / life;
      put(n.x, n.y, n.z, (rp.big ? 12 : 6) + p * (rp.big ? 30 : 18), RGB.accent, (1 - p) ** 2 * 0.7 * netA, 2);
    }
    for (const p of packets) {
      const E = edges[p.e];
      const A = nodes[E.a], B = nodes[E.b];
      const s = p.t * p.t * (3 - 2 * p.t);
      put(A.x + (B.x - A.x) * s, A.y + (B.y - A.y) * s, A.z + (B.z - A.z) * s, 3.4, RGB.accent, 0.95 * netA, 0);
    }

    r.draw(mvp, focal, lns, li / 7, pts, pi / 9);
  };

  return {
    resize(w, h) {
      W = w; H = h;
      r.resize(w, h, tier >= 2 ? 2 : 1.5);
    },
    setScroll(p) {
      scrollP = clamp(p);
    },
    setAnchor(x, y) {
      anchor.x = x; anchor.y = y;
    },
    setPointer(x, y, inside, down) {
      pointer.x = x; pointer.y = y; pointer.inside = inside; pointer.down = down;
    },
    tap(x, y) {
      const i = nearestNode(x, y, 260);
      fire(i >= 0 ? i : byLayer[0][0], 1);
    },
    frame,
    morph,
    morphing: () => morphT >= 0,
    labels() {
      // Above each layer, for the annotation captions.
      return [0, 1, 2, 3].map((l) => {
        const ids = byLayer[l];
        let x = 0, y = Infinity;
        for (const i of ids) { x += nodes[i].sx; y = Math.min(y, nodes[i].sy); }
        return { x: x / ids.length, y: y - 26 };
      });
    },
    destroy() {
      r.destroy();
    },
  };
}

function mix(a: readonly number[], b: readonly number[], t: number) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
