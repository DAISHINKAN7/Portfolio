import { P, type Trace, box, curve, dot, label, line, quad, seg, text } from '../trace-kit';

/**
 * Four agents, each retrieving only from its own ACL partition of the corpus,
 * critique one another across two rounds, then a weighted supervisor merges
 * them. Chunk counts, weights and mean risks are the case study's figures.
 * Pointing at an agent isolates its evidence path.
 *
 * Layout is proportional: five stages always span the full width, joined by
 * permanent hairline wiring, so the figure reads as one pipeline at any size.
 */
const AGENTS = [
  { k: 'Policy Oracle', chunks: 7789, w: 0.25, risk: 29.5 },
  { k: 'Debris Physicist', chunks: 5110, w: 0.35, risk: 36.1 },
  { k: 'Mission Historian', chunks: 1307, w: 0.25, risk: 25.1 },
  { k: 'Media Sentinel', chunks: 131, w: 0.15, risk: 15.7 },
];
const MAX_CHUNKS = 7789;
const LOOP = 8;

export default function astroguard(): Trace {
  // Corpus partitions: dot count ∝ sqrt(chunks), deterministic jitter.
  const parts = AGENTS.map((a, i) => {
    const n = Math.max(2, Math.round(Math.sqrt(a.chunks) / 4.2));
    return Array.from({ length: n }, (_, j) => {
      const s = Math.sin((i + 1) * 91.7 + j * 12.9) * 43758.5;
      const s2 = Math.sin((i + 1) * 17.3 + j * 77.1) * 12345.6;
      return [s - Math.floor(s), s2 - Math.floor(s2)] as const;
    });
  });

  return {
    still: 6.6,
    height: (w) => (w < 480 ? 220 : Math.round(Math.min(300, Math.max(196, w * 0.15)))),
    draw(g, w, h, time, _dt, ptr) {
      const t = time % LOOP;
      const narrow = w < 480;
      const wide = w >= 820;
      const top = 34;
      const bottom = h - 26;
      const rowH = (bottom - top) / 4;
      const rowY = (i: number) => top + rowH * i + rowH / 2;

      // Stage columns, as fractions of the width.
      const X = wide
        ? { c0: 0.015, c1: 0.15, agent: 0.19, debate: 0.5, sup: 0.66, v0: 0.74, v1: 0.985 }
        : narrow
          ? { c0: 0.03, c1: 0.18, agent: 0.25, debate: 0.66, sup: 0.84, v0: 0.6, v1: 0.97 }
          : { c0: 0.02, c1: 0.16, agent: 0.22, debate: 0.6, sup: 0.82, v0: 0.62, v1: 0.98 };
      const x = (f: number) => f * w;
      const xAgent = x(X.agent);
      const xDebate = x(X.debate);
      const xSup = x(X.sup);
      const supY = wide ? (top + bottom) / 2 : rowY(1) + rowH * 0.5;
      const labelEnd = xAgent + (wide ? 150 : narrow ? 112 : 128);

      let focus = -1;
      if (ptr.inside && ptr.x < xDebate + 20) focus = Math.max(0, Math.min(3, Math.floor((ptr.y - top) / rowH)));
      const dimOf = (i: number) => (focus >= 0 && focus !== i ? 0.22 : 1);

      label(g, wide ? 'corpus · acl view' : 'corpus', x(X.c0), 18);
      label(g, 'agent', xAgent - 6, 18);
      label(g, 'debate', xDebate - 14, 18);
      label(g, 'supervisor', xSup - 14, 18);
      if (wide) label(g, 'mean risk by agent · scale 10–40', x(X.v0), 18);

      const pRetrieve = seg(t, 0.2, 1.8);
      const pR1 = seg(t, 1.8, 3.2);
      const pR2 = seg(t, 3.2, 4.4);
      const pMerge = seg(t, 4.4, 5.6);
      const pVerdict = seg(t, 5.4, 6.6);
      const fadeOut = 1 - seg(t, 7.4, 8);

      // ---- permanent wiring: the pipeline is always legible --------------
      AGENTS.forEach((_, i) => {
        const y = rowY(i);
        g.globalAlpha = dimOf(i);
        line(g, labelEnd, y, xDebate - 4, y, P.rule, 1, [2, 4]);
        curve(g, xDebate + 4, y, (xDebate + xSup) / 2, y, xSup - 12, supY, P.rule, 1, 1);
        g.globalAlpha = 1;
      });
      if (wide) line(g, xSup + 12, supY, x(X.v0) - 8, supY, P.rule, 1, [2, 4]);

      // ---- corpus partitions + retrieval --------------------------------
      AGENTS.forEach((a, i) => {
        const y = rowY(i);
        const dim = dimOf(i);
        const hot = i === 1;
        const c0 = x(X.c0), c1 = x(X.c1);
        g.globalAlpha = dim;
        line(g, c0, top + rowH * i + 2, xAgent - 16, top + rowH * i + 2, P.rule, 1, [2, 3]);
        g.globalAlpha = 1;
        parts[i].forEach(([rx, ry], j) => {
          const px = c0 + rx * (c1 - c0);
          const py = y + (ry - 0.5) * (rowH - 14);
          const lit = pRetrieve > j / parts[i].length ? 1 : 0;
          dot(g, px, py, wide ? 1.9 : 1.6, lit && fadeOut > 0.2 ? P.accent : P.rule2, dim * (0.5 + lit * 0.5 * fadeOut));
          if (j % 3 === 0 && pRetrieve > 0 && pRetrieve < 1) {
            const k = (pRetrieve * 1.4 - j / parts[i].length / 2) % 1;
            if (k > 0 && k < 1) dot(g, px + (xAgent - 8 - px) * k, py + (y - py) * k, 1.7, P.accent, dim);
          }
        });

        // Agent node, name, and (when there is room) its corpus share.
        box(g, xAgent - 6, y - 6, 12, 12, hot ? P.soft : P.white, hot ? P.accent : P.ink2);
        g.globalAlpha = dim;
        text(g, a.k, xAgent + 14, y + (wide ? 0 : 4), { size: narrow ? 10 : wide ? 13 : 11.5, weight: hot ? 600 : 400 });
        if (wide) {
          const bw = labelEnd - xAgent - 22;
          box(g, xAgent + 14, y + 8, bw, 3, P.panel2, null);
          box(g, xAgent + 14, y + 8, (bw * a.chunks) / MAX_CHUNKS, 3, hot ? P.accent : P.rule2, null);
        }
        g.globalAlpha = 1;

        // Each agent's analysis travels to the debate.
        if (pR1 > 0 && pR1 < 1) dot(g, labelEnd + (xDebate - labelEnd) * pR1, y, 2, P.accent, dim);

        // Weighted merge: line weight ∝ supervisor weight.
        if (pMerge > 0) {
          curve(g, xDebate + 4, y, (xDebate + xSup) / 2, y, xSup - 12, supY, P.accent, a.w * (wide ? 10 : 8) * fadeOut, 0.5 * dim, pMerge);
        }
      });

      // ---- debate: R1 everyone critiques everyone, R2 replies -----------
      const reach = Math.min(70, (xSup - xDebate) * 0.18);
      AGENTS.forEach((_, i) => {
        AGENTS.forEach((__, j) => {
          if (i >= j) return;
          const y1 = rowY(i), y2 = rowY(j);
          const bend = xDebate + 8 + ((j - i) / 3) * reach;
          const dim = focus >= 0 && focus !== i && focus !== j ? 0.15 : 1;
          if (pR1 > 0) curve(g, xDebate, y1, bend, (y1 + y2) / 2, xDebate, y2, P.rule2, 1, dim * fadeOut, pR1);
          if (pR2 > 0 && pR2 < 1) {
            const [px, py] = quad(xDebate, y2, bend, (y1 + y2) / 2, xDebate, y1, pR2);
            dot(g, px, py, 1.9, P.accent, dim);
          }
        });
        dot(g, xDebate, rowY(i), 2.6, pR1 > 0 ? P.accent : P.rule2);
      });
      if (pR1 > 0) label(g, pR2 > 0 ? 'r2 · refine' : 'r1 · critique', xDebate + 8, h - 8, P.accent);

      // ---- supervisor ---------------------------------------------------
      const supHot = pMerge > 0.9;
      box(g, xSup - 11, supY - 11, 22, 22, supHot ? P.ink : P.white, P.ink);
      if (!narrow) text(g, 'Σ w·r', xSup, supY + 28, { mono: true, size: 10, color: P.ink2, align: 'center' });

      // ---- verdict: the four mean risks on one scale ---------------------
      if (wide) {
        // Empty tracks are always present, so the column reads before it fills.
        const v0 = x(X.v0), v1 = x(X.v1);
        AGENTS.forEach((a, i) => {
          line(g, v0, rowY(i), v1, rowY(i), P.panel2, 3);
          label(g, a.k.split(' ')[1], v0, rowY(i) - 8, P.ink3, 'left', 8);
        });
        [10, 20, 30, 40].forEach((r) => {
          const xr = v0 + ((r - 10) / 30) * (v1 - v0);
          line(g, xr, top - 4, xr, bottom - 4, P.rule, 1, [1, 4]);
        });
      }
      if (pVerdict > 0) {
        g.globalAlpha = pVerdict * fadeOut;
        if (wide) {
          // A full readout column: one row per agent, then the divergence.
          const v0 = x(X.v0), v1 = x(X.v1);
          const scale = (r: number) => v0 + ((r - 10) / 30) * (v1 - v0);
          AGENTS.forEach((a, i) => {
            const y = rowY(i);
            const xr = scale(a.risk);
            line(g, v0, y, v0 + (xr - v0) * pVerdict, y, i === 1 || i === 3 ? P.accent : P.rule2, 3);
            text(g, a.risk.toFixed(1), Math.min(v1, xr + 8), y + 4, { mono: true, size: 10.5, color: i === 1 || i === 3 ? P.accent : P.ink2 });
          });
          const xa = scale(36.1), xb = scale(15.7);
          line(g, xb, bottom + 6, xa, bottom + 6, P.accent);
          line(g, xb, bottom + 2, xb, bottom + 10, P.accent);
          line(g, xa, bottom + 2, xa, bottom + 10, P.accent);
          text(g, '20.4 pt divergence · stable over 88 runs', xb, bottom + 20, { mono: true, size: 10, color: P.accent });
        } else {
          const x0 = x(X.v0), x1 = x(X.v1);
          const vy = Math.min(bottom - 6, supY + 44);
          const scale = (r: number) => x0 + ((r - 10) / 30) * (x1 - x0);
          line(g, x0, vy, x1, vy, P.rule2);
          AGENTS.forEach((a, i) => line(g, scale(a.risk), vy - 5, scale(a.risk), vy + 5, i === 1 || i === 3 ? P.accent : P.ink3, 1.2));
          const xa = scale(36.1), xb = scale(15.7);
          line(g, xb, vy + 12, xa, vy + 12, P.accent);
          text(g, '20.4 pt', (xa + xb) / 2, vy + 24, { mono: true, size: 10, color: P.accent, align: 'center' });
        }
        g.globalAlpha = 1;
      }

      if (focus >= 0) {
        const a = AGENTS[focus];
        label(g, `${a.chunks.toLocaleString()} chunks · w ${a.w.toFixed(2)} · risk ${a.risk}`, x(X.c0), h - 8, P.accent);
      }
    },
  };
}
