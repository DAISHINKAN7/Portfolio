/**
 * Shared drawing kit for the project traces — small Canvas2D animations that
 * show what each system actually does. Same palette, type and line weights
 * as the static SVG diagrams, so a trace reads as that figure, running.
 */

export const P = {
  ink: '#15181A',
  ink2: '#4E565C',
  ink3: '#7C858B',
  rule: '#D2D6D1',
  rule2: '#B6BCB6',
  accent: '#0E5A63',
  accent2: '#12777F',
  soft: '#DBE9EA',
  caution: '#8F4F10',
  cautionSoft: '#EFE3D3',
  panel: '#F7F8F6',
  panel2: '#E8EAE6',
  white: '#FFFFFF',
};

export const MONO = '"IBM Plex Mono", ui-monospace, monospace';
export const SANS = '"IBM Plex Sans", ui-sans-serif, system-ui';

export type Ptr = { x: number; y: number; inside: boolean; down: boolean };

export type Trace = {
  /** Logical height in CSS px for a given width. */
  height(w: number): number;
  draw(g: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number, ptr: Ptr): void;
  /** Time at which a single still frame best explains the system. */
  still: number;
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
/** 0→1 over [a, b] of a looping timeline. */
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

export function label(g: CanvasRenderingContext2D, text: string, x: number, y: number, color = P.ink3, align: CanvasTextAlign = 'left', size = 9) {
  g.font = `400 ${size}px ${MONO}`;
  g.fillStyle = color;
  g.textAlign = align;
  g.textBaseline = 'alphabetic';
  // Tracked uppercase, like the .eyebrow class.
  const s = text.toUpperCase();
  const ls = g as CanvasRenderingContext2D & { letterSpacing?: string };
  const tracked = ls.letterSpacing !== undefined;
  if (tracked) ls.letterSpacing = `${size * 0.12}px`;
  g.fillText(s, x, y);
  if (tracked) ls.letterSpacing = '0px';
}

export function text(g: CanvasRenderingContext2D, s: string, x: number, y: number, o: { size?: number; color?: string; mono?: boolean; weight?: number; align?: CanvasTextAlign } = {}) {
  g.font = `${o.weight ?? 400} ${o.size ?? 11}px ${o.mono ? MONO : SANS}`;
  g.fillStyle = o.color ?? P.ink;
  g.textAlign = o.align ?? 'left';
  g.textBaseline = 'alphabetic';
  g.fillText(s, x, y);
}

export function line(g: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = P.rule2, w = 1, dash?: number[]) {
  g.strokeStyle = color;
  g.lineWidth = w;
  g.setLineDash(dash ?? []);
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
  g.setLineDash([]);
}

export function dot(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha = 1) {
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
}

export function ring(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha = 1, w = 1) {
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = w;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;
}

export function box(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string | null, stroke: string | null, lw = 1) {
  if (fill) {
    g.fillStyle = fill;
    g.fillRect(x, y, w, h);
  }
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = lw;
    g.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);
  }
}

/** Point along a quadratic curve. */
export function quad(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, t: number) {
  const u = 1 - t;
  return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2] as const;
}

export function curve(g: CanvasRenderingContext2D, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, color: string, w = 1, alpha = 1, upTo = 1) {
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(x1, y1);
  if (upTo >= 1) g.quadraticCurveTo(cx, cy, x2, y2);
  else {
    const n = 18;
    for (let i = 1; i <= n * upTo; i++) {
      const [x, y] = quad(x1, y1, cx, cy, x2, y2, i / n);
      g.lineTo(x, y);
    }
  }
  g.stroke();
  g.globalAlpha = 1;
}

/** Deterministic smooth noise for procedural series. */
export function noise1(x: number, seed = 1) {
  const s = (n: number) => {
    const v = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return s(i) * (1 - u) + s(i + 1) * u;
}
