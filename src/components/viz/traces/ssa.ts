import { P, type Trace, curve, label, seg, smooth, text } from '../trace-kit';

/**
 * The verbatim probe sentence from the evaluation transcript, tagged by the
 * fine-tuned encoder (labels and confidences as published), then lifted into
 * the knowledge graph along four of the system's seven relation types.
 * Pointing at a token shows its BIO label.
 */
const TOKS: { t: string; l?: string; c?: string; id?: number }[] = [
  { t: 'PSLV-C54', l: 'LAUNCH_VEHICLE', c: '0.966', id: 0 },
  { t: 'was' }, { t: 'launched' }, { t: 'by' },
  { t: 'ISRO', l: 'ORGANIZATION', c: '0.914', id: 1 },
  { t: 'from' },
  { t: 'Sriharikota', l: 'LOCATION', c: '0.916', id: 2 },
  { t: 'carrying' },
  { t: 'EOS-06', l: 'SATELLITE', id: 3 },
  { t: 'into' },
  { t: 'Sun Synchronous Orbit', l: 'ORBITAL_PARAM', c: '0.969', id: 4 },
];
const COL: Record<string, string> = {
  LAUNCH_VEHICLE: P.accent,
  ORGANIZATION: P.ink,
  LOCATION: P.caution,
  SATELLITE: P.accent2,
  ORBITAL_PARAM: P.ink2,
};
// Satellite-centred: these are real relation types and signatures.
const EDGES: [number, number, string][] = [
  [0, 3, 'launches'],
  [3, 2, 'launched_from'],
  [3, 1, 'operated_by'],
  [3, 4, 'placed_in_orbit'],
];
const LOOP = 8;

export default function ssa(): Trace {
  return {
    still: 6.2,
    height: (w) => (w < 480 ? 230 : 196),
    draw(g, w, h, time, _dt, ptr) {
      const t = time % LOOP;
      const narrow = w < 480;
      const fs = narrow ? 10 : 11.5;
      g.font = `500 ${fs}px "IBM Plex Sans", sans-serif`;
      const gap = narrow ? 5 : 7;

      // Lay the sentence out, wrapping if needed.
      const pos: { x: number; y: number; w: number }[] = [];
      let x = 12, y = 34;
      for (const tk of TOKS) {
        const tw = g.measureText(tk.t).width;
        if (x + tw > w - 12) {
          x = 12;
          y += 40;
        }
        pos.push({ x, y, w: tw });
        x += tw + gap;
      }
      const rowsBottom = y + 36;

      label(g, 'probe inference · verbatim', 12, 14);

      const pTok = seg(t, 0, 0.9);
      const pTag = seg(t, 0.9, 2.2);
      const pLift = seg(t, 2.4, 3.6);
      const pRel = seg(t, 3.6, 5.2);
      const fade = 1 - seg(t, 7.3, 8);

      let hover = -1;
      TOKS.forEach((tk, i) => {
        const p = pos[i];
        const appear = smooth(pTok * TOKS.length - i);
        if (ptr.inside && ptr.x >= p.x - 3 && ptr.x <= p.x + p.w + 3 && Math.abs(ptr.y - p.y + 4) < 14) hover = i;
        g.globalAlpha = appear * fade;
        if (tk.l) {
          const c = COL[tk.l];
          g.fillStyle = c;
          g.globalAlpha = 0.1 * pTag * fade;
          g.fillRect(p.x - 3, p.y - fs - 3, p.w + 6, fs + 9);
          g.globalAlpha = pTag * fade;
          g.fillRect(p.x - 3, p.y + 5, (p.w + 6) * pTag, 1.6);
          g.globalAlpha = appear * fade;
          text(g, tk.t, p.x, p.y, { size: fs, weight: 500, color: P.ink });
          g.globalAlpha = pTag * fade;
          // Alternate rows so long labels on short tokens never collide.
          label(g, tk.l.replace('_', ' '), p.x - 3, p.y + (tk.id! % 2 ? 27 : 17), c, 'left', 7.5);
        } else {
          text(g, tk.t, p.x, p.y, { size: fs, color: P.ink3 });
        }
        g.globalAlpha = 1;
      });

      // Graph: entities lift from the sentence into a small KG.
      const gy0 = rowsBottom + 8;
      const gh = h - gy0 - 18;
      const cxs = narrow ? [0.18, 0.84, 0.82, 0.5, 0.16] : [0.14, 0.86, 0.84, 0.5, 0.18];
      const cys = [0.25, 0.22, 0.86, 0.55, 0.9];
      const node = (id: number) => [cxs[id] * w, gy0 + cys[id] * gh] as const;
      const ents = TOKS.filter((tk) => tk.id !== undefined);

      if (pLift > 0) {
        // Relations draw first, under the nodes.
        EDGES.forEach(([a, b, name], k) => {
          const pk = smooth(pRel * EDGES.length - k);
          if (pk <= 0) return;
          const [x1, y1] = node(a);
          const [x2, y2] = node(b);
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 10;
          curve(g, x1, y1, mx, my, x2, y2, P.accent, 1.2, 0.7 * fade, pk);
          if (pk > 0.9) {
            g.globalAlpha = fade;
            label(g, name, mx, my + (y2 > y1 ? -4 : 12), P.accent, 'center', 7.5);
            g.globalAlpha = 1;
          }
        });
        ents.forEach((tk) => {
          const i = TOKS.indexOf(tk);
          const p = pos[i];
          const [tx, ty] = node(tk.id!);
          const sx = p.x + p.w / 2, sy = p.y + 8;
          const k = smooth(pLift * 1.3 - tk.id! * 0.08);
          const nx = sx + (tx - sx) * k, ny = sy + (ty - sy) * k;
          const c = COL[tk.l!];
          g.globalAlpha = fade;
          g.fillStyle = P.white;
          g.strokeStyle = c;
          g.lineWidth = 1.2;
          g.beginPath();
          g.arc(nx, ny, 4.5, 0, 7);
          g.fill();
          g.stroke();
          if (k > 0.95) text(g, tk.t, nx + (cxs[tk.id!] > 0.5 ? -9 : 9), ny + 4, { size: 10, align: cxs[tk.id!] > 0.5 ? 'right' : 'left', color: P.ink2 });
          g.globalAlpha = 1;
        });
      }

      const tk = hover >= 0 ? TOKS[hover] : null;
      const read = tk
        ? tk.l
          ? `B-${tk.l}${tk.c ? ` · conf ${tk.c}` : ''}`
          : 'O · outside any entity'
        : '8 classes · 17 BIO labels · 7 relation types';
      text(g, read, 12, h - 6, { mono: true, size: 9.5, color: tk ? P.accent : P.ink3 });
    },
  };
}
