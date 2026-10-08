import { P, type Trace, box, label, line, noise1, text } from '../trace-kit';

/**
 * Forecast beta volatility 20 days ahead, then decide in strict priority:
 * VIX above 22.0 overrides to min-variance; predicted betavol above the
 * frozen 0.1794 threshold rebalances; otherwise hold and pay nothing. The
 * thresholds are the case study's; the series is a procedural stand-in.
 * Pointing scrubs the timeline and reads out that day's decision.
 */
const THRESH = 0.1794;
const VIX_GATE = 22;
const DAYS = 220;
const SPEED = 26; // days per second

type Day = { bv: number; vix: number; d: 0 | 1 | 2 }; // 0 hold, 1 rebalance, 2 override

function series(offset: number): Day[] {
  return Array.from({ length: DAYS }, (_, i) => {
    const x = (i + offset) / 22;
    // Volatility clusters: slow regime × fast wobble.
    const regime = noise1(x * 0.55, 4);
    const bv = 0.1 + regime * 0.13 + (noise1(x * 3.1, 8) - 0.5) * 0.04;
    const vix = 13 + regime * 9 + Math.max(0, noise1(x * 0.9, 21) - 0.72) * 60;
    const d: Day['d'] = vix > VIX_GATE ? 2 : bv > THRESH ? 1 : 0;
    return { bv, vix, d };
  });
}

export default function beta(): Trace {
  return {
    still: 6,
    height: (w) => (w < 480 ? 176 : Math.round(Math.min(280, Math.max(164, w * 0.13)))),
    draw(g, w, h, time, _dt, ptr) {
      const off = Math.floor(time * SPEED);
      const frac = time * SPEED - off;
      const s = series(off);
      const left = 12, right = w - (w < 480 ? 12 : 92);
      const top = 22, chartH = h - 72;
      const forecast = 20;
      const histN = DAYS - forecast;
      const xs = (i: number) => left + ((i - frac) / (DAYS - 1)) * (right - left);
      const ys = (v: number) => top + chartH - ((v - 0.06) / 0.22) * chartH;

      label(g, 'betavol · 20d ahead', left, 14);

      // Threshold.
      const ty = ys(THRESH);
      line(g, left, ty, right, ty, P.accent, 1, [3, 3]);
      if (w >= 480) text(g, `θ = ${THRESH}`, right + 8, ty + 3, { mono: true, size: 9.5, color: P.accent });

      // Override windows shaded behind the series.
      g.fillStyle = P.cautionSoft;
      s.forEach((d, i) => {
        if (d.d === 2 && i < histN) g.fillRect(xs(i), top, (right - left) / DAYS + 0.5, chartH);
      });

      // Realised history.
      g.strokeStyle = P.ink;
      g.lineWidth = 1.4;
      g.beginPath();
      for (let i = 0; i < histN; i++) (i ? g.lineTo : g.moveTo).call(g, xs(i), ys(s[i].bv));
      g.stroke();

      // Forecast: dashed mean with a widening band.
      const n0 = histN - 1;
      g.fillStyle = P.soft;
      g.beginPath();
      for (let i = n0; i < DAYS; i++) g.lineTo(xs(i), ys(s[i].bv + 0.004 * (i - n0) ** 0.8));
      for (let i = DAYS - 1; i >= n0; i--) g.lineTo(xs(i), ys(s[i].bv - 0.004 * (i - n0) ** 0.8));
      g.fill();
      g.strokeStyle = P.accent;
      g.setLineDash([4, 3]);
      g.lineWidth = 1.4;
      g.beginPath();
      for (let i = n0; i < DAYS; i++) (i === n0 ? g.moveTo : g.lineTo).call(g, xs(i), ys(s[i].bv));
      g.stroke();
      g.setLineDash([]);
      line(g, xs(n0), top, xs(n0), top + chartH, P.rule2);
      label(g, 'today', xs(n0) + 4, top + 9, P.ink3);

      // Decision strip: one tick per day, the cascade's output.
      const sy = top + chartH + 10;
      const colors = [P.rule, P.accent, P.caution];
      s.forEach((d, i) => {
        if (i >= histN) return;
        g.fillStyle = colors[d.d];
        g.fillRect(xs(i), sy, Math.max(1, (right - left) / DAYS - 0.6), 8);
      });
      const counts = [0, 0, 0];
      s.slice(0, histN).forEach((d) => counts[d.d]++);

      // Today's decision.
      const today = s[n0 + forecast - 1];
      const verdict = s[n0].vix > VIX_GATE ? 2 : today.bv > THRESH ? 1 : 0;
      const names = ['HOLD · no trade, no cost', 'REBALANCE · regime-routed', 'MIN-VAR · VIX override'];
      if (w >= 480) {
        box(g, right + 8, sy - 2, 10, 10, colors[verdict], null);
        text(g, ['hold', 'rebalance', 'override'][verdict], right + 22, sy + 7, { mono: true, size: 9.5, color: colors[verdict] === P.rule ? P.ink2 : colors[verdict] });
      }

      // Scrub readout.
      if (ptr.inside && ptr.x > left && ptr.x < right) {
        const i = Math.round(((ptr.x - left) / (right - left)) * (DAYS - 1) + frac);
        const d = s[Math.min(DAYS - 1, Math.max(0, i))];
        const x = xs(i);
        line(g, x, top, x, sy + 8, P.ink2);
        g.fillStyle = P.ink;
        g.beginPath();
        g.arc(x, ys(d.bv), 2.5, 0, 7);
        g.fill();
        const isF = i >= histN;
        text(g, `${isF ? 'forecast ' : ''}betavol ${d.bv.toFixed(3)} · VIX ${d.vix.toFixed(1)} → ${isF ? '—' : names[d.d]}`, left, h - 10, {
          mono: true,
          size: 9.5,
          color: P.ink2,
        });
      } else {
        const tot = counts[0] + counts[1] + counts[2];
        text(
          g,
          `window: hold ${Math.round((counts[0] / tot) * 100)}% · rebalance ${Math.round((counts[1] / tot) * 100)}% · override ${Math.round((counts[2] / tot) * 100)}%   (full backtest: 59.6 / 26.9 / 13.4)`,
          left,
          h - 10,
          { mono: true, size: 9, color: P.ink3 }
        );
      }
    },
  };
}
