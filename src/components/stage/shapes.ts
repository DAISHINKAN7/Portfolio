/**
 * Point-cloud forms for the latent stage. Every form has exactly N points
 * (x, y, z, accent) so any form can morph into any other, point for point.
 * Each one is a visual metaphor for a project — described as such on the page,
 * never presented as data.
 */
import { mulberry32 } from '@/lib/motion';

export type Form = { pts: Float32Array; tilt: number; yaw: number; spin: number; label: string };

type Put = (x: number, y: number, z: number, accent?: number) => void;

function builder(n: number, seed: number) {
  const pts = new Float32Array(n * 4);
  const rand = mulberry32(seed);
  let i = 0;
  const put: Put = (x, y, z, accent = 0) => {
    if (i >= n) return;
    pts[i * 4] = x;
    pts[i * 4 + 1] = y;
    pts[i * 4 + 2] = z;
    pts[i * 4 + 3] = accent;
    i++;
  };
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = rand();
    while (!v) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const onSphere = () => {
    const x = gauss(), y = gauss(), z = gauss();
    const l = Math.hypot(x, y, z) || 1;
    return [x / l, y / l, z / l] as const;
  };
  // Fill any remainder so every form has exactly n points.
  const done = (fill: () => void) => {
    while (i < n) fill();
    return pts;
  };
  return { put, rand, gauss, onSphere, done, count: () => i };
}

/** The author, as a stipple engraving sampled from the photograph's darkness. */
export function portrait(n: number, img: HTMLImageElement): Form {
  const W = 180, H = Math.round((180 * img.naturalHeight) / img.naturalWidth);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  // Luminance, then Sobel edges: an engraving carries features as line, not
  // just tone — so a light face still reads through eyes, brows and jaw.
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
  const E = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const gx = -L[i - W - 1] - 2 * L[i - 1] - L[i + W - 1] + L[i - W + 1] + 2 * L[i + 1] + L[i + W + 1];
      const gy = -L[i - W - 1] - 2 * L[i - W] - L[i - W + 1] + L[i + W - 1] + 2 * L[i + W] + L[i + W + 1];
      E[i] = Math.min(1, Math.hypot(gx, gy) * 1.6);
    }
  const dark = (x: number, y: number) => {
    const i = Math.min(H - 1, y | 0) * W + Math.min(W - 1, x | 0);
    const tone = Math.max(0, (1 - L[i] - 0.16) / 0.84);
    // Edges in the bright studio background are noise, not features.
    const bg = L[i] > 0.8 ? 0.12 : 1;
    return Math.min(1, tone * 0.62 + E[i] * 0.95 * bg);
  };
  const b = builder(n, 7);
  const sy = 1.9 / H;
  let guard = 0;
  while (b.count() < n && guard++ < n * 60) {
    const x = b.rand() * W, y = b.rand() * H;
    const k = dark(x, y);
    if (b.rand() < Math.pow(k, 1.25)) {
      // Darkness becomes slight relief, visible when the cloud turns.
      b.put((x - W / 2) * sy, -(y - H / 2) * sy, k * 0.18 - 0.09, 0);
    }
  }
  return { pts: b.done(() => b.put((b.rand() - 0.5) * W * sy, (b.rand() - 0.5) * H * sy, 0)), tilt: 0, yaw: 0, spin: 0, label: 'points sampled from a photograph' };
}

/** Six clusters: the same points, grouped — one per system. */
export function latent(n: number): Form {
  const b = builder(n, 11);
  const centers = Array.from({ length: 6 }, (_, k) => {
    const a = (k / 6) * Math.PI * 2;
    return [Math.cos(a) * 0.72, Math.sin(a * 2) * 0.28, Math.sin(a) * 0.72];
  });
  const pts = b.done(() => {
    if (b.rand() < 0.07) {
      const [x, y, z] = b.onSphere();
      const r = Math.cbrt(b.rand()) * 1.15;
      b.put(x * r, y * r, z * r);
    } else {
      const k = Math.floor(b.rand() * 6);
      const s = 0.1 + (k % 3) * 0.025;
      const c = centers[k];
      b.put(c[0] + b.gauss() * s, c[1] + b.gauss() * s, c[2] + b.gauss() * s, k === 0 ? 1 : 0);
    }
  });
  return { pts, tilt: 0.25, yaw: 0, spin: 0.12, label: 'the same points, re-embedded as six clusters' };
}

/** AstroGuard — a debris shell around a planet: LEO-heavy, with MEO and a GEO ring. */
export function debris(n: number): Form {
  const b = builder(n, 23);
  const fam = [1.71, 0.9, 1.2, 0.6, 0.12];
  const tracks = Array.from({ length: 72 }, (_, k) => {
    const geo = k >= 66;
    return {
      geo,
      r: geo ? 1.1 : k % 5 === 0 ? 0.8 + b.rand() * 0.12 : 0.52 + b.rand() * 0.16,
      inc: geo ? 0.02 : fam[k % fam.length] + b.gauss() * 0.04,
      raan: b.rand() * Math.PI * 2,
    };
  });
  const pts = b.done(() => {
    const u = b.rand();
    if (u < 0.26) {
      // A wireframe globe: meridians and parallels, plus a light stipple.
      const r = 0.42;
      const w = b.rand();
      if (w < 0.45) {
        const lon = (Math.floor(b.rand() * 12) / 12) * Math.PI * 2;
        const lat = (b.rand() - 0.5) * Math.PI;
        b.put(r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon));
      } else if (w < 0.8) {
        const lat = ((Math.floor(b.rand() * 7) + 0.5) / 7 - 0.5) * Math.PI;
        const lon = b.rand() * Math.PI * 2;
        b.put(r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon));
      } else {
        const [x, y, z] = b.onSphere();
        b.put(x * r, y * r, z * r);
      }
      return;
    }
    // Discrete tracks in real inclination families — sun-synchronous (~98°),
    // ~51.6°, mid-inclination and equatorial — plus a diffuse cloud.
    const trk = tracks[Math.floor(b.rand() * tracks.length)];
    const diffuse = b.rand() < 0.14;
    const r = diffuse ? 0.52 + b.rand() * 0.5 : trk.r + b.gauss() * 0.004;
    const inc = diffuse ? (b.rand() - 0.5) * 3 : trk.inc;
    const raan = diffuse ? b.rand() * Math.PI * 2 : trk.raan;
    const th = b.rand() * Math.PI * 2;
    let x = r * Math.cos(th), y = 0, z = r * Math.sin(th);
    const y1 = y * Math.cos(inc) - z * Math.sin(inc);
    const z1 = y * Math.sin(inc) + z * Math.cos(inc);
    y = y1;
    z = z1;
    const x2 = x * Math.cos(raan) + z * Math.sin(raan);
    const z2 = -x * Math.sin(raan) + z * Math.cos(raan);
    b.put(x2, y, z2, !diffuse && trk.geo ? 1 : 0);
  });
  return { pts, tilt: 0.38, yaw: 0, spin: 0.16, label: 'a debris shell — LEO, MEO and the GEO ring' };
}

/** Radio × Optical — a two-arm spiral disk with FR-II radio lobes and jets. */
export function galaxy(n: number): Form {
  const b = builder(n, 31);
  const pts = b.done(() => {
    const u = b.rand();
    if (u < 0.56) {
      const arm = b.rand() < 0.5 ? 0 : Math.PI;
      const r = 0.06 + Math.pow(b.rand(), 0.85) * 0.82;
      const th = Math.log(r / 0.06) / 0.32 + arm + b.gauss() * 0.28 * (0.4 + r);
      b.put(r * Math.cos(th), b.gauss() * 0.02 * (1.2 - r), r * Math.sin(th));
    } else if (u < 0.68) {
      const s = 0.09;
      b.put(b.gauss() * s, b.gauss() * s * 0.6, b.gauss() * s);
    } else if (u < 0.92) {
      // Edge-brightened lobes, densest at the hotspots.
      const side = b.rand() < 0.5 ? -1 : 1;
      const [x, y, z] = b.onSphere();
      const shell = 0.75 + b.rand() * 0.25;
      b.put(x * 0.2 * shell, side * (1.0 + y * 0.28 * shell) + side * 0.06, z * 0.2 * shell, 1);
    } else {
      const side = b.rand() < 0.5 ? -1 : 1;
      b.put(b.gauss() * 0.008, side * (0.08 + b.rand() * 0.86), b.gauss() * 0.008, 1);
    }
  });
  return { pts, tilt: 0.95, yaw: 0.4, spin: 0.1, label: 'a spiral disk with FR-II radio lobes' };
}

/** AdaptiveBeta — a beta-volatility surface over time × names, cut by the θ plane. */
export function surface(n: number): Form {
  const b = builder(n, 41);
  const theta = 0.12;
  const regime = (x: number) =>
    0.34 * Math.exp(-((x + 0.38) ** 2) / 0.01) + 0.22 * Math.exp(-((x - 0.3) ** 2) / 0.016) + 0.12 * Math.exp(-((x - 0.72) ** 2) / 0.008);
  const f = (x: number, z: number) => -0.32 + regime(x) * (0.7 + 0.45 * Math.sin(z * 7 + x * 3)) + 0.03 * Math.sin(x * 23 + z * 5);
  const pts = b.done(() => {
    const u = b.rand();
    if (u < 0.8) {
      const x = (b.rand() - 0.5) * 1.8, z = (b.rand() - 0.5) * 1.1;
      const y = f(x, z);
      b.put(x, y, z, y > -0.32 + theta ? 1 : 0);
    } else if (u < 0.93) {
      // The frozen threshold as a sparse dashed plane.
      const z = (Math.floor(b.rand() * 9) / 8 - 0.5) * 1.1;
      const x = (b.rand() - 0.5) * 1.8;
      if (Math.floor((x + 2) * 22) % 2) b.put(x, -0.32 + theta, z);
    } else {
      // Time axis along the front edge.
      b.put((b.rand() - 0.5) * 1.8, -0.36, -0.58);
    }
  });
  return { pts, tilt: 0.5, yaw: -0.55, spin: 0.05, label: 'a beta-volatility surface under the θ plane' };
}

/** EcoRewind — low wetland relief with channels, and a storm vortex above it. */
export function storm(n: number): Form {
  const b = builder(n, 53);
  const E = 0.82; // half-extent of the terrain tile
  const relief = (x: number, z: number) =>
    -0.4 + 0.05 * Math.sin(x * 5.1 + Math.sin(z * 3)) + 0.035 * Math.sin(z * 7.3 - x * 2) + 0.015 * Math.sin(x * 17 + z * 11);
  const channel = (x: number, z: number) => Math.abs(Math.sin(x * 2.9 + Math.sin(z * 2.4) * 1.5));
  const pts = b.done(() => {
    const u = b.rand();
    if (u < 0.5) {
      // A DEM-style wireframe: grid lines in x and z, draped over the relief.
      const along = (b.rand() - 0.5) * 2 * E;
      const line = (Math.floor(b.rand() * 21) / 20 - 0.5) * 2 * E;
      const [x, z] = b.rand() < 0.5 ? [along, line] : [line, along];
      const wet = channel(x, z) < 0.1;
      b.put(x, relief(x, z) - (wet ? 0.025 : 0), z, wet ? 1 : 0);
    } else if (u < 0.58) {
      const x = (b.rand() - 0.5) * 2 * E, z = (b.rand() - 0.5) * 2 * E;
      if (channel(x, z) < 0.1) b.put(x, relief(x, z) - 0.025, z, 1);
    } else {
      // The storm: three spiral bands around a clear eye.
      const arm = Math.floor(b.rand() * 3) * ((Math.PI * 2) / 3);
      const r = 0.09 + Math.pow(b.rand(), 0.75) * 0.62;
      const th = -Math.log(r) * 2.5 + arm + b.gauss() * 0.17;
      b.put(0.08 + r * Math.cos(th), 0.44 + b.gauss() * 0.014 * (1 + r * 2), -0.05 + r * Math.sin(th));
    }
  });
  return { pts, tilt: 0.55, yaw: 0.5, spin: 0.07, label: 'wetland relief beneath a storm vortex' };
}

/** SSA-Intel — an entity graph: typed clusters, edges drawn in points. */
export function graph(n: number): Form {
  const b = builder(n, 67);
  const nodes: { p: [number, number, number]; hub: boolean; type: number }[] = [];
  const cents: [number, number, number][] = [[-0.5, 0.25, 0.1], [0.45, 0.35, -0.2], [0.05, -0.4, 0.35]];
  for (let k = 0; k < 54; k++) {
    const type = k % 3;
    const c = cents[type];
    nodes.push({ p: [c[0] + b.gauss() * 0.3, c[1] + b.gauss() * 0.24, c[2] + b.gauss() * 0.3], hub: k < 6, type });
  }
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((o, j) => [j, Math.hypot(a.p[0] - o.p[0], a.p[1] - o.p[1], a.p[2] - o.p[2])] as const)
      .filter(([j]) => j !== i)
      .sort((x, y) => x[1] - y[1]);
    for (let k = 0; k < (a.hub ? 6 : 2); k++) edges.push([i, near[k][0]]);
    if (b.rand() < 0.3) edges.push([i, Math.floor(b.rand() * 6)]); // relations to hubs
  });
  const pts = b.done(() => {
    if (b.rand() < 0.36) {
      const nd = nodes[Math.floor(b.rand() * nodes.length)];
      const s = nd.hub ? 0.045 : 0.018;
      b.put(nd.p[0] + b.gauss() * s, nd.p[1] + b.gauss() * s, nd.p[2] + b.gauss() * s, nd.hub ? 1 : 0);
    } else {
      const [i, j] = edges[Math.floor(b.rand() * edges.length)];
      const t = b.rand();
      const A = nodes[i].p, B = nodes[j].p;
      const j2 = 0.004;
      b.put(A[0] + (B[0] - A[0]) * t + b.gauss() * j2, A[1] + (B[1] - A[1]) * t + b.gauss() * j2, A[2] + (B[2] - A[2]) * t + b.gauss() * j2, nodes[i].hub && nodes[j].hub ? 1 : 0);
    }
  });
  return { pts, tilt: 0.3, yaw: 0, spin: 0.14, label: 'an entity graph with typed edges' };
}

/** RevenueOS — six stages in a row beneath the authority boundary, the planner above. */
export function chain(n: number): Form {
  const b = builder(n, 79);
  const S = 0.2;
  const cx = (i: number) => -0.9 + i * 0.36;
  const pts = b.done(() => {
    const u = b.rand();
    if (u < 0.62) {
      // Cube edges.
      const i = Math.floor(b.rand() * 6);
      const e = Math.floor(b.rand() * 12);
      const t = (b.rand() - 0.5) * 2 * S;
      const s1 = e & 1 ? S : -S, s2 = e & 2 ? S : -S;
      const axis = Math.floor(e / 4);
      const p = axis === 0 ? [t, s1, s2] : axis === 1 ? [s1, t, s2] : [s1, s2, t];
      b.put(cx(i) + p[0], -0.2 + p[1], p[2], i === 2 ? 1 : 0);
    } else if (u < 0.7) {
      const i = Math.floor(b.rand() * 6);
      b.put(cx(i) + (b.rand() - 0.5) * 2 * S, -0.2 + (b.rand() - 0.5) * 2 * S, (b.rand() < 0.5 ? -1 : 1) * S, i === 2 ? 1 : 0);
    } else if (u < 0.86) {
      // The boundary: a dashed plane the planner cannot cross.
      const x = (b.rand() - 0.5) * 2.2;
      if (Math.floor((x + 2) * 18) % 2) b.put(x, 0.32, (Math.floor(b.rand() * 5) / 4 - 0.5) * 0.7);
    } else if (u < 0.95) {
      const [x, y, z] = b.onSphere();
      b.put(-0.6 + x * 0.15, 0.72 + y * 0.15, z * 0.15);
    } else {
      b.put(-0.9 + b.rand() * 1.8, -0.2, 0, 0);
    }
  });
  return { pts, tilt: 0.32, yaw: -0.45, spin: 0, label: 'six stages beneath the authority boundary' };
}

/** Resolution: everything settles onto a single hairline rule. */
export function rule(n: number): Form {
  const b = builder(n, 97);
  const pts = b.done(() => b.put((b.rand() - 0.5) * 3.4, b.gauss() * 0.003, b.gauss() * 0.003));
  return { pts, tilt: 0, yaw: 0, spin: 0, label: '' };
}
