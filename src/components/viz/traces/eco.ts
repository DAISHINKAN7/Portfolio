import { P, type Trace, label, line, noise1, seg, text } from '../trace-kit';

/**
 * A model trained only on pre-storm dynamics is rolled forward past the
 * event without ever seeing it. Fifty MC-dropout rollouts fan out; the gap
 * between their mean and the observed record is the attributed impact, held
 * above a climatology floor. The curve is a procedural NDVI-like series —
 * the method, not the data. Pointing reads out the gap at that quarter.
 */
const Q = 32; // quarterly composites, 2016 Q1 → 2023 Q4
const EVENT = 14;
const SAMPLES = 50;
const LOOP = 7;

const season = (q: number) => 0.62 + 0.06 * Math.sin((q / 4) * Math.PI * 2) + (noise1(q * 0.9, 2) - 0.5) * 0.06;
function observed(q: number) {
  if (q <= EVENT) return season(q);
  const k = q - EVENT;
  const drop = 0.24 * Math.exp(-k / 9);
  return season(q) - drop;
}

export default function eco(): Trace {
  // Fixed rollouts at sub-quarter resolution: seasonal truth plus a
  // compounding per-sample drift (the autoregressive error the floor bounds).
  const R = 4;
  const rolls = Array.from({ length: SAMPLES }, (_, s) => {
    let drift = 0;
    return Array.from({ length: Q * R }, (_, k) => {
      const q = k / R;
      if (q < EVENT) return season(q);
      drift += (noise1(q * 1.7 + s * 13.1, 5) - 0.5) * (0.022 / R) * 1.6;
      return season(q) + drift;
    });
  });
  const at = (r: number[], q: number) => r[Math.min(r.length - 1, Math.round(q * R))];
  const floor = (q: number) => season(q) - 0.11;

  return {
    still: 5.2,
    height: (w) => (w < 480 ? 176 : Math.round(Math.min(280, Math.max(164, w * 0.13)))),
    draw(g, w, h, time, _dt, ptr) {
      const t = time % LOOP;
      const left = 34, right = w - 14, top = 20, bot = h - 34;
      const xs = (q: number) => left + (q / (Q - 1)) * (right - left);
      const ys = (v: number) => bot - ((v - 0.25) / 0.6) * (bot - top);
      const ex = xs(EVENT);

      label(g, 'ndvi · quarterly', left, 12);
      text(g, 'high', left - 6, top + 6, { mono: true, size: 8.5, color: P.ink3, align: 'right' });
      text(g, 'low', left - 6, bot, { mono: true, size: 8.5, color: P.ink3, align: 'right' });
      line(g, left, bot, right, bot, P.rule2);

      // Training window.
      g.fillStyle = P.panel;
      g.fillRect(left, top, ex - left, bot - top);
      label(g, 'train · pre-event only', left + 6, top + 12, P.ink3, 'left', 8.5);

      const roll = seg(t, 0.4, 3.6); // rollout progress past the event
      const qNow = EVENT + roll * (Q - 1 - EVENT);

      // Fan of rollouts.
      g.lineWidth = 1;
      g.strokeStyle = P.accent;
      g.globalAlpha = 0.07;
      for (const r of rolls) {
        g.beginPath();
        for (let q = EVENT; q <= qNow; q += 1 / R) (q === EVENT ? g.moveTo : g.lineTo).call(g, xs(q), ys(Math.max(floor(q), at(r, q))));
        g.stroke();
      }
      g.globalAlpha = 1;

      // Mean counterfactual + attribution gap.
      const mean = (q: number) => Math.max(floor(q), rolls.reduce((a, r) => a + at(r, q), 0) / SAMPLES);
      const qi = Math.floor(qNow * R) / R;
      const step = 1 / R;
      if (qi > EVENT) {
        g.fillStyle = P.cautionSoft;
        g.beginPath();
        for (let q = EVENT; q <= qi; q += step) g.lineTo(xs(q), ys(mean(q)));
        for (let q = qi; q >= EVENT; q -= step) g.lineTo(xs(q), ys(observed(q)));
        g.fill();
      }
      g.strokeStyle = P.accent;
      g.lineWidth = 1.6;
      g.setLineDash([5, 3]);
      g.beginPath();
      for (let q = EVENT; q <= qi; q += step) (q === EVENT ? g.moveTo : g.lineTo).call(g, xs(q), ys(mean(q)));
      g.stroke();
      g.setLineDash([]);

      // Climatology floor (μ − 2σ), faint.
      g.strokeStyle = P.rule2;
      g.setLineDash([1, 3]);
      g.beginPath();
      for (let q = EVENT; q < Q; q += step) (q === EVENT ? g.moveTo : g.lineTo).call(g, xs(q), ys(floor(q)));
      g.stroke();
      g.setLineDash([]);

      // Observed record.
      g.strokeStyle = P.ink;
      g.lineWidth = 1.6;
      g.beginPath();
      for (let q = 0; q <= Q - 1; q += step) (q ? g.lineTo : g.moveTo).call(g, xs(q), ys(observed(q)));
      g.stroke();

      // Event line.
      line(g, ex, top - 4, ex, bot + 4, P.caution, 1, [4, 3]);
      label(g, 'hurricane · t_event', ex + 5, top - 6 + 12 * 0, P.caution, 'left', 8.5);

      // Rollout head.
      if (roll > 0 && roll < 1) {
        g.fillStyle = P.accent;
        g.beginPath();
        g.arc(xs(qNow), ys(mean(qi)), 2.6, 0, 7);
        g.fill();
      }

      // Readout.
      let msg = `${SAMPLES} MC-dropout rollouts · mean = counterfactual · shaded = attributed impact`;
      if (ptr.inside && ptr.x > ex && ptr.x < right) {
        const q = Math.round(((ptr.x - left) / (right - left)) * (Q - 1));
        const gap = mean(q) - observed(q);
        line(g, xs(q), top, xs(q), bot, P.ink2);
        const year = 2016 + Math.floor(q / 4);
        msg = `${year} Q${(q % 4) + 1} · Δndvi ${gap >= 0 ? '−' : '+'}${Math.abs(gap).toFixed(3)} vs counterfactual`;
      }
      text(g, msg, left, h - 10, { mono: true, size: 9.5, color: ptr.inside ? P.ink2 : P.ink3 });
    },
  };
}
