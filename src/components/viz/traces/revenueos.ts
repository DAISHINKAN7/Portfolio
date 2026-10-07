import { P, type Trace, box, label, line, seg, text } from '../trace-kit';

/**
 * The planner (top lane) can only propose which bounded tool runs next.
 * Opportunities flow down the deterministic chain — predict, rank, authorize,
 * execute, verify, record — and every so often the planner tries to pass a
 * monetary argument across the boundary, which is screened out. Component
 * names are the system's own. Pointing at a stage shows what it cannot do.
 */
const CHAIN = [
  { k: 'Predictor', v: 'predicts', cannot: 'rank · price · decide' },
  { k: 'Financial', v: 'ranks', cannot: 'see a model · see text' },
  { k: 'Policy', v: 'authorizes', cannot: 'accept a text argument' },
  { k: 'Payment', v: 'executes', cannot: 'choose action or amount' },
  { k: 'Webhook', v: 'verifies', cannot: 'trust a browser callback' },
  { k: 'Audit', v: 'records', cannot: 'be mutated or deleted' },
];
const LOOP = 6;

export default function revenueos(): Trace {
  return {
    still: 3.3,
    height: (w) => (w < 480 ? 196 : 168),
    draw(g, w, h, time, _dt, ptr) {
      const t = time % LOOP;
      const narrow = w < 480;
      const laneY = 30;
      const boundY = 62;
      const chainY = 104;
      const x0 = 12;
      const sw = (w - 24) / CHAIN.length;

      // Planner lane.
      label(g, 'llm planner', x0, 16);
      box(g, x0, laneY - 10, narrow ? 120 : 150, 22, P.panel, P.rule2);
      text(g, 'proposes next_tool', x0 + 8, laneY + 5, { mono: true, size: 9.5, color: P.ink2 });

      // The boundary: structural, not a filter.
      line(g, x0, boundY, w - 12, boundY, P.caution, 1, [5, 4]);
      label(g, 'authority boundary · no tool accepts money', w - 12, boundY - 6, P.caution, 'right', 8);

      // Tool proposals drop down as names only.
      const pProp = seg(t, 0.1, 0.9);
      const target = Math.min(CHAIN.length - 1, Math.floor(t / 1.0));
      if (pProp > 0 && pProp < 1) {
        const tx = x0 + sw * target + sw / 2;
        const sx = x0 + 70;
        const px = sx + (tx - sx) * pProp;
        const py = laneY + 12 + (chainY - 14 - laneY - 12) * pProp;
        box(g, px - 3, py - 3, 6, 6, P.white, P.ink2);
      }

      // An attempted monetary argument, bounced at the boundary.
      const pAtt = seg(t, 2.6, 3.6);
      if (pAtt > 0 && pAtt < 1) {
        const k = pAtt < 0.5 ? pAtt * 2 : 1 - (pAtt - 0.5) * 2;
        const ax = x0 + (narrow ? 140 : 190) + pAtt * 40;
        const ay = laneY + (boundY - 6 - laneY) * k;
        box(g, ax - 18, ay - 7, 36, 14, P.cautionSoft, P.caution);
        text(g, '₹ amt', ax, ay + 3.5, { mono: true, size: 8.5, color: P.caution, align: 'center' });
        if (pAtt > 0.45) label(g, 'rejected · argument screening', ax + 26, boundY - 14 + 26, P.caution, 'left', 8);
      }

      // The chain.
      const flow = (t / LOOP) * (CHAIN.length + 0.6);
      let hover = -1;
      CHAIN.forEach((c, i) => {
        const x = x0 + sw * i;
        const lit = flow > i && flow < i + 1.6;
        const gate = i === 2;
        if (ptr.inside && ptr.x >= x && ptr.x < x + sw && ptr.y > boundY) hover = i;
        box(g, x + 3, chainY - 14, sw - 6, 34, lit ? (gate ? P.soft : P.panel) : P.white, lit || hover === i ? P.accent : P.rule2);
        if (gate) {
          g.fillStyle = P.accent;
          g.fillRect(x + 3, chainY - 14, 2, 34);
        }
        label(g, c.v, x + 9, chainY - 2, lit ? P.accent : P.ink3, 'left', narrow ? 7 : 8);
        text(g, c.k, x + 9, chainY + 13, { mono: true, size: narrow ? 8.5 : 10, color: P.ink });
        if (i < CHAIN.length - 1) line(g, x + sw - 3, chainY + 3, x + sw + 3, chainY + 3, P.rule2);
      });

      // Opportunity token moving along the chain.
      if (flow < CHAIN.length) {
        const fx = x0 + sw * flow + sw / 2;
        g.fillStyle = P.accent;
        g.beginPath();
        g.arc(Math.min(fx, w - 16), chainY + 28, 3, 0, 7);
        g.fill();
      }
      if (flow > 2.4 && flow < 3.2) label(g, 'pass', x0 + sw * 2 + sw / 2, chainY + 40, P.accent, 'center', 8);
      if (flow > 4.4 && flow < 5.2) label(g, 'hmac ✓', x0 + sw * 4 + sw / 2, chainY + 40, P.accent, 'center', 8);

      const msg =
        hover >= 0
          ? `${CHAIN[hover].k} cannot ${CHAIN[hover].cannot}`
          : '0 unauthorized executions · 0 policy bypasses · verified';
      text(g, msg, x0, h - 10, { mono: true, size: 9.5, color: hover >= 0 ? P.caution : P.ink3 });
    },
  };
}
