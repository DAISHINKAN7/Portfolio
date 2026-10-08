import { P, type Trace, box, curve, dot, label, line, noise1, seg, text } from '../trace-kit';

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
    height: (w) => (w < 480 ? 220 : Math.round(Math.min(300, Math.max(176, w * 0.15)))),
    draw(g, w, h, time, dt, ptr) {
      const narrow = w < 480;
      const y0 = 34;
      // Inputs grow with the space available; everything else is proportional.
      const cell = narrow ? 3.2 : Math.max(3.4, Math.min((h - y0 - 40) / N, (w * 0.24 - 8) / (2 * N)));
      const gs = cell * N;
      const inEnd = 12 + gs * 2 + 8;
      const holding = ptr.inside && ptr.x < inEnd;
      // Hovering freezes the clock; a still frame (dt = 0) jumps to `time`.
      if (dt === 0) clock = Math.max(clock, time);
      else if (!holding) clock += dt;
      const t = clock % LOOP;
      const cyc = Math.floor(clock / LOOP);
      if (cyc !== lastCycle) {
        lastCycle = cyc;
        if (cyc > 0) sample = (sample + 1) % CLASSES.length;
      }
      const yc = y0 + gs / 2;

      label(g, 'optical', 12, 20);
      label(g, 'radio · 144 mhz', 20 + gs, 20);

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
      // Scan line across both cutouts while they load.
      if (scan < 1) line(g, 8, y0 + gs * scan, inEnd + 4, y0 + gs * scan, P.accent, 1);
      text(g, '(2, 600, 600)', 12, y0 + gs + 16, { mono: true, size: 9.5, color: P.ink3 });

      // Feature pyramid: three shrinking grids.
      const s0 = narrow ? 22 : Math.min(gs * 0.62, Math.max(30, w * 0.05));
      const fx = inEnd + (narrow ? 16 : Math.max(24, w * 0.035));
      const fStep = s0 * 0.95;
      const featP = seg(t, 0.6, 1.4);
      const fEnd = fx + fStep * 2 + s0 * 0.45;
      [8, 4, 2].forEach((n, i) => {
        const sz = s0 * (1 - i * 0.27);
        const x = fx + i * fStep;
        const y = yc - sz / 2;
        const on = featP > i / 3;
        for (let a = 0; a < n; a++) {
          for (let b = 0; b < n; b++) {
            const v = noise1(a * 3.1 + b * 7.7 + sample * 5 + i, 3);
            g.fillStyle = on ? P.accent : P.rule;
            g.globalAlpha = on ? 0.15 + v * 0.7 : 0.4;
            g.fillRect(x + (a * sz) / n, y + (b * sz) / n, sz / n - 0.5, sz / n - 0.5);
          }
        }
        g.globalAlpha = 1;
      });
      if (!narrow) {
        line(g, inEnd + 2, yc, fx - 4, yc, P.rule, 1, [2, 4]);
        if (featP > 0 && featP < 1) dot(g, inEnd + (fx - inEnd) * featP, yc, 2, P.accent);
      }

      // Backbones.
      const bx = narrow ? fx + 70 : Math.max(fEnd + 28, w * 0.42);
      const bw = narrow ? w - bx - 12 : Math.max(150, w * 0.2);
      const rowGap = narrow ? 20 : Math.min(30, Math.max(20, gs / 3.4));
      const bY = (i: number) => yc - rowGap + i * rowGap;
      const bbP = seg(t, 1.2, 2.2);
      const nameW = narrow ? 76 : 84;
      BACKBONES.forEach((b, i) => {
        const y = bY(i);
        if (!narrow) {
          curve(g, fEnd + 4, yc, (fEnd + bx) / 2, y, bx - 8, y, P.rule, 1, 1);
          if (bbP > 0 && bbP < 1) {
            const k = bbP;
            dot(g, fEnd + (bx - 8 - fEnd) * k, yc + (y - yc) * k * k * (3 - 2 * k), 1.8, P.accent);
          }
        }
        text(g, b.k, bx, y + 4, { mono: true, size: narrow ? 9.5 : 10.5, color: P.ink2 });
        const tx = bx + nameW;
        const len = bw - nameW;
        box(g, tx, y - 3, len, 6, P.panel2, null);
        box(g, tx, y - 3, len * ((b.acc - 85) / 15) * bbP, 6, i === 0 ? P.accent : P.rule2, null);
        if (!narrow && bbP > 0.95) text(g, `${b.acc.toFixed(2)}%`, tx + len + 8, y + 4, { mono: true, size: 9.5, color: P.ink3 });
      });
      text(g, 'acc · 10 seeds', bx, bY(2) + 26, { mono: true, size: 9, color: P.ink3 });

      // Ensemble softmax.
      if (!narrow) {
        const sx = Math.max(bx + bw + 70, w * 0.68);
        const sw = w - sx - 12;
        const sP = seg(t, 2.1, 3.0);
        const cRow = Math.min(22, Math.max(15, gs / 6));
        const cY = (i: number) => yc - cRow * 2.5 + i * cRow;
        label(g, 'soft vote → class', sx, 20);
        // Three backbones converge on one vote.
        BACKBONES.forEach((_, i) => curve(g, bx + bw + 52, bY(i), sx - 30, bY(i), sx - 12, yc, P.rule, 1, 1));
        dot(g, sx - 12, yc, 2.4, sP > 0 ? P.accent : P.rule2);
        if (sP > 0 && sP < 1) BACKBONES.forEach((_, i) => {
          const k = sP;
          dot(g, bx + bw + 52 + (sx - 12 - bx - bw - 52) * k, bY(i) + (yc - bY(i)) * k, 1.8, P.accent);
        });
        CLASSES.forEach((c, i) => {
          const y = cY(i);
          const p = i === sample ? 0.86 : 0.14 * noise1(i * 4.3 + sample, 9) * 0.4;
          const win = i === sample && sP > 0.95;
          text(g, c, sx, y + 3.5, { size: 10.5, color: win ? P.accent : P.ink2, weight: win ? 600 : 400 });
          const tx = sx + 104;
          box(g, tx, y - 3, Math.max(0, sw - 104), 6, P.panel2, null);
          box(g, tx, y - 3, Math.max(0, sw - 104) * p * sP, 6, win ? P.accent : P.rule2, null);
        });
        text(g, 'ensemble 97.60% ± 0.31 · reported', sx, cY(5) + 24, { mono: true, size: 9.5, color: P.ink3 });
      } else {
        const sP = seg(t, 2.1, 3.0);
        text(g, `→ ${CLASSES[sample]}`, bx, y0 + 96, { size: 12, weight: 600, color: sP > 0.9 ? P.accent : P.rule2 });
        text(g, 'ensemble 97.60% ± 0.31 · reported', 12, h - 14, { mono: true, size: 9, color: P.ink3 });
      }

      if (holding) label(g, `holding · ${CLASSES[sample]}`, 12, h - (narrow ? 30 : 8), P.accent);
    },
  };
}
