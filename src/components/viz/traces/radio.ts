import { P, type Trace, box, label, line, noise1, seg, text } from '../trace-kit';

/**
 * A paired radio + optical cutout becomes a 2-channel tensor, is read by
 * three backbones, and soft-voted into one of six classes. Backbone
 * accuracies and class names are the case study's; the per-sample
 * probabilities are illustrative. Hovering the inputs holds the sample.
 */
const CLASSES = ['Elliptical', 'Spiral', 'Compact', 'FR-II', 'Radio-loud AGN', 'Starburst'];
const BACKBONES = [
  { k: 'ConvNeXt-T', acc: 96.59 },
  { k: 'EffNet-B0', acc: 95.35 },
  { k: 'ResNet-34', acc: 92.09 },
];
const LOOP = 4.2;
const N = 18; // input grid resolution

/** Procedural cutouts, one per class, in (optical, radio) pairs. */
function field(cls: number, ch: 0 | 1, u: number, v: number) {
  const x = u - 0.5, y = v - 0.5;
  const r = Math.hypot(x, y);
  const a = Math.atan2(y, x);
  const n = noise1(u * 9 + v * 13 + cls * 3, 7 + ch) * 0.12;
  const blob = (sx: number, sy: number, s: number) => Math.exp(-((x - sx) ** 2 + (y - sy) ** 2) / s);
  if (ch === 0) {
    switch (cls) {
      case 0: return Math.exp(-((x * 1.2) ** 2 + (y * 1.8) ** 2) / 0.03) + n;
      case 1: return Math.exp(-r * r / 0.012) + 0.55 * Math.max(0, Math.cos(2 * a - r * 22)) * Math.exp(-r / 0.16) + n;
      case 2: return blob(0, 0, 0.004) + n * 0.6;
      case 3: return blob(0, 0, 0.01) * 0.8 + n;
      case 4: return blob(0, 0, 0.015) + n;
      default: return blob(-0.08, 0.05, 0.006) + blob(0.07, -0.04, 0.005) + blob(0.02, 0.1, 0.004) + n;
    }
  }
  switch (cls) {
    case 0: return blob(0, 0, 0.01) * 0.35 + n;
    case 1: return Math.exp(-r * r / 0.03) * 0.4 + n;
    case 2: return blob(0, 0, 0.002) + n * 0.5;
    case 3: return blob(-0.3, 0.12, 0.006) + blob(0.3, -0.12, 0.006) + 0.3 * blob(0, 0, 0.002) + n;
    case 4: return blob(0, 0, 0.003) * 1.2 + 0.25 * blob(0.15, 0.05, 0.01) + n;
    default: return blob(0, 0, 0.02) * 0.5 + n;
  }
}

export default function radio(): Trace {
  // Pre-render every class into small grids once.
  const grids = CLASSES.map((_, c) =>
    ([0, 1] as const).map((ch) =>
      Array.from({ length: N * N }, (_, i) => Math.max(0, Math.min(1, field(c, ch, (i % N) / (N - 1), Math.floor(i / N) / (N - 1)))))
    )
  );
  let sample = 3;
  let clock = 0;
  let lastCycle = -1;

  return {
    still: 3.4,
    height: (w) => (w < 480 ? 220 : 172),
    draw(g, w, h, time, dt, ptr) {
      const narrow = w < 480;
      const cell = narrow ? 3.2 : 3.8;
      const gs = cell * N;
      const holding = ptr.inside && ptr.x < 30 + gs * 2;
      // Hovering freezes the clock; a still frame (dt = 0) jumps to `time`.
      if (dt === 0) clock = Math.max(clock, time);
      else if (!holding) clock += dt;
      const t = clock % LOOP;
      const cyc = Math.floor(clock / LOOP);
      if (cyc !== lastCycle) {
        lastCycle = cyc;
        if (cyc > 0) sample = (sample + 1) % CLASSES.length;
      }

      const y0 = 30;
      label(g, 'optical', 12, 18);
      label(g, 'radio · 144 mhz', 20 + gs, 18);

      // Inputs, revealed by a raster scan.
      const scan = seg(t, 0, 0.7);
      ([0, 1] as const).forEach((ch) => {
        const ox = 12 + ch * (gs + 8);
        const grid = grids[sample][ch];
        for (let i = 0; i < N * N; i++) {
          const row = Math.floor(i / N);
          if (row / N > scan) break;
          const v = grid[i];
          if (v < 0.06) continue;
          g.fillStyle = ch === 0 ? P.ink : P.accent;
          g.globalAlpha = Math.min(1, v * 1.1);
          g.fillRect(ox + (i % N) * cell, y0 + row * cell, cell - 0.6, cell - 0.6);
        }
        g.globalAlpha = 1;
        box(g, ox - 1, y0 - 1, gs + 2, gs + 2, null, P.rule);
      });
      text(g, '(2, 600, 600)', 12, y0 + gs + 16, { mono: true, size: 9.5, color: P.ink3 });

      // Feature pyramid: three shrinking grids.
      const fx = 12 + gs * 2 + 24;
      const featP = seg(t, 0.6, 1.4);
      [8, 4, 2].forEach((n, i) => {
        const s = (narrow ? 22 : 30) - i * 6;
        const x = fx + i * (narrow ? 20 : 28);
        const y = y0 + (gs - s) / 2;
        const on = featP > i / 3;
        for (let a = 0; a < n; a++) {
          for (let b = 0; b < n; b++) {
            const v = noise1(a * 3.1 + b * 7.7 + sample * 5 + i, 3);
            g.fillStyle = on ? P.accent : P.rule;
            g.globalAlpha = on ? 0.15 + v * 0.7 : 0.4;
            g.fillRect(x + (a * s) / n, y + (b * s) / n, s / n - 0.5, s / n - 0.5);
          }
        }
        g.globalAlpha = 1;
      });

      // Backbones.
      const bx = fx + (narrow ? 70 : 96);
      const bw = narrow ? w - bx - 12 : Math.min(150, w * 0.22);
      const bbP = seg(t, 1.2, 2.2);
      BACKBONES.forEach((b, i) => {
        const y = y0 + 6 + i * 20;
        text(g, b.k, bx, y + 4, { mono: true, size: 9.5, color: P.ink2 });
        const tx = bx + (narrow ? 76 : 70);
        const len = bw - (narrow ? 76 : 70);
        box(g, tx, y - 3, len, 6, P.panel2, null);
        box(g, tx, y - 3, len * ((b.acc - 85) / 15) * bbP, 6, i === 0 ? P.accent : P.rule2, null);
      });
      text(g, 'acc · 10 seeds', bx, y0 + 74, { mono: true, size: 9, color: P.ink3 });

      // Ensemble softmax.
      if (!narrow) {
        const sx = bx + bw + 24;
        const sw = w - sx - 12;
        const sP = seg(t, 2.1, 3.0);
        label(g, 'soft vote → class', sx, 18);
        CLASSES.forEach((c, i) => {
          const y = y0 + 4 + i * 15;
          const p = i === sample ? 0.86 : 0.14 * noise1(i * 4.3 + sample, 9) * 0.4;
          const win = i === sample && sP > 0.95;
          text(g, c, sx, y + 3.5, { size: 10, color: win ? P.accent : P.ink2, weight: win ? 600 : 400 });
          const tx = sx + 96;
          box(g, tx, y - 3, Math.max(0, sw - 96), 6, P.panel2, null);
          box(g, tx, y - 3, Math.max(0, sw - 96) * p * sP, 6, win ? P.accent : P.rule2, null);
        });
        line(g, sx, y0 + 96, w - 12, y0 + 96, P.rule);
        text(g, 'ensemble 97.60% ± 0.31 · reported', sx, y0 + 112, { mono: true, size: 9.5, color: P.ink3 });
      } else {
        const sP = seg(t, 2.1, 3.0);
        text(g, `→ ${CLASSES[sample]}`, bx, y0 + 96, { size: 12, weight: 600, color: sP > 0.9 ? P.accent : P.rule2 });
        text(g, 'ensemble 97.60% ± 0.31 · reported', 12, h - 14, { mono: true, size: 9, color: P.ink3 });
      }

      if (holding) label(g, `holding · ${CLASSES[sample]}`, 12, h - (narrow ? 30 : 10), P.accent);
    },
  };
}
