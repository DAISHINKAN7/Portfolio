import { P, type Trace, box, curve, dot, label, line, quad, seg, text } from '../trace-kit';

/**
 * Four agents, each retrieving only from its own ACL partition of the corpus,
 * critique one another across two rounds, then a weighted supervisor merges
 * them. Chunk counts, weights and mean risks are the case study's figures.
 * Pointing at an agent isolates its evidence path.
 */
const AGENTS = [
  { k: 'Policy Oracle', chunks: 7789, w: 0.25, risk: 29.5 },
  { k: 'Debris Physicist', chunks: 5110, w: 0.35, risk: 36.1 },
  { k: 'Mission Historian', chunks: 1307, w: 0.25, risk: 25.1 },
  { k: 'Media Sentinel', chunks: 131, w: 0.15, risk: 15.7 },
];
const LOOP = 8;

export default function astroguard(): Trace {
  // Corpus partitions: dot count ∝ sqrt(chunks), deterministic jitter.
  const parts = AGENTS.map((a, i) => {
    const n = Math.max(2, Math.round(Math.sqrt(a.chunks) / 4.2));
    return Array.from({ length: n }, (_, j) => {
      const s = Math.sin((i + 1) * 91.7 + j * 12.9) * 43758.5;
      const r = s - Math.floor(s);
      const s2 = Math.sin((i + 1) * 17.3 + j * 77.1) * 12345.6;
      return [r, s2 - Math.floor(s2)] as const;
    });
  });

  return {
    still: 6.6,
    height: (w) => (w < 480 ? 210 : 190),
    draw(g, w, h, time, _dt, ptr) {
      const t = time % LOOP;
      const narrow = w < 480;
      const rowH = (h - 48) / 4;
      const top = 30;
      const cxCorpus = narrow ? 34 : 56;
      const xAgent = narrow ? 92 : 150;
      const xDebate = w * (narrow ? 0.6 : 0.56);
      const xSup = w - (narrow ? 70 : 108);
      const supY = top + rowH * 2 - 6;

      // Hover isolates one agent row.
      let focus = -1;
      if (ptr.inside && ptr.x < xDebate) focus = Math.max(0, Math.min(3, Math.floor((ptr.y - top) / rowH)));

      label(g, narrow ? 'corpus' : 'corpus · acl view', 12, 16);
      label(g, 'agent', xAgent, 16);
      label(g, 'debate', xDebate - 20, 16);
      label(g, 'supervisor', xSup - 14, 16);

      const pRetrieve = seg(t, 0.2, 1.8);
      const pR1 = seg(t, 1.8, 3.2);
      const pR2 = seg(t, 3.2, 4.4);
      const pMerge = seg(t, 4.4, 5.6);
      const pVerdict = seg(t, 5.4, 6.6);
      const fadeOut = 1 - seg(t, 7.4, 8);

      AGENTS.forEach((a, i) => {
        const y = top + rowH * i + rowH / 2;
        const dim = focus >= 0 && focus !== i ? 0.25 : 1;
        const hot = i === 1;
        // Partition: its own cluster, with a hairline fence — the ACL.
        const pts = parts[i];
        const spreadX = narrow ? 22 : 34;
        g.globalAlpha = dim;
        line(g, 10, top + rowH * i + 3, xAgent - 26, top + rowH * i + 3, P.rule, 1, [2, 3]);
        g.globalAlpha = 1;
        pts.forEach(([rx, ry], j) => {
          const px = cxCorpus + (rx - 0.5) * spreadX * 2;
          const py = y + (ry - 0.5) * (rowH - 14);
          const lit = pRetrieve > j / pts.length ? 1 : 0;
          dot(g, px, py, 1.6, lit && fadeOut > 0.2 ? P.accent : P.rule2, dim * (0.5 + lit * 0.5 * fadeOut));
          // Retrieval packets: only from this agent's own partition.
          if (j % 3 === 0 && pRetrieve > 0 && pRetrieve < 1) {
            const k = (pRetrieve * 1.4 - j / pts.length / 2) % 1;
            if (k > 0 && k < 1) dot(g, px + (xAgent - 8 - px) * k, py + (y - py) * k, 1.6, P.accent, dim);
          }
        });

        // Agent node + name.
        box(g, xAgent - 6, y - 6, 12, 12, hot ? P.soft : P.white, hot ? P.accent : P.ink2);
        g.globalAlpha = dim;
        text(g, a.k, xAgent + 12, y + 4, { size: narrow ? 10 : 11.5, weight: hot ? 600 : 400, color: P.ink });
        g.globalAlpha = 1;

        // To the supervisor, line weight ∝ supervisor weight.
        if (pMerge > 0) {
          const sx = xDebate + 40;
          curve(g, sx, y, (sx + xSup) / 2, y, xSup - 10, supY, P.accent, a.w * 8 * fadeOut, 0.55 * dim, pMerge);
        }
      });

      // Debate: critiques arc between agents (R1 = everyone, R2 = replies).
      const ax = xDebate;
      AGENTS.forEach((_, i) => {
        AGENTS.forEach((__, j) => {
          if (i >= j) return;
          const y1 = top + rowH * i + rowH / 2;
          const y2 = top + rowH * j + rowH / 2;
          const bend = ax + 10 + (j - i) * (narrow ? 8 : 14);
          const dim = focus >= 0 && focus !== i && focus !== j ? 0.15 : 1;
          if (pR1 > 0) curve(g, ax, y1, bend, (y1 + y2) / 2, ax, y2, P.rule2, 1, dim * fadeOut, pR1);
          if (pR2 > 0 && pR2 < 1) {
            const [px, py] = quad(ax, y2, bend, (y1 + y2) / 2, ax, y1, pR2);
            dot(g, px, py, 1.8, P.accent, dim);
          }
        });
        const y = top + rowH * i + rowH / 2;
        dot(g, ax, y, 2.4, pR1 > 0 ? P.accent : P.rule2);
      });
      if (pR1 > 0) label(g, pR2 > 0 ? 'r2 · refine' : 'r1 · critique', ax + 6, h - 8, P.accent);

      // Supervisor.
      const supHot = pMerge > 0.9;
      box(g, xSup - 10, supY - 10, 20, 20, supHot ? P.ink : P.white, P.ink);
      text(g, 'Σ w·r', xSup + 16, supY + 4, { mono: true, size: 10, color: P.ink2 });

      // Verdict: four mean risks on one scale, divergence bracketed.
      if (pVerdict > 0) {
        const x0 = xSup - 30;
        const x1 = w - 12;
        const vy = supY + 40;
        const scale = (r: number) => x0 + ((r - 10) / 30) * (x1 - x0);
        g.globalAlpha = pVerdict * fadeOut;
        line(g, x0, vy, x1, vy, P.rule2);
        AGENTS.forEach((a, i) => {
          const x = scale(a.risk);
          line(g, x, vy - 5, x, vy + 5, i === 1 || i === 3 ? P.accent : P.ink3, 1.2);
        });
        const xa = scale(36.1), xb = scale(15.7);
        line(g, xb, vy + 12, xa, vy + 12, P.accent);
        text(g, '20.4 pt', (xa + xb) / 2, vy + 24, { mono: true, size: 10, color: P.accent, align: 'center' });
        g.globalAlpha = 1;
      }

      // Focused agent readout.
      if (focus >= 0) {
        const a = AGENTS[focus];
        label(g, `${a.chunks.toLocaleString()} chunks · w ${a.w.toFixed(2)} · risk ${a.risk}`, 12, h - 8, P.accent);
      }
    },
  };
}
