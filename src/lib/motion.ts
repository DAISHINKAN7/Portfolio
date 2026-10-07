/**
 * Motion system.
 *
 * Two families of movement, deliberately contrasted:
 *  - computational: exact, eased, deterministic (reveals, counters, rules
 *    drawing across, data flowing through a diagram)
 *  - physical: spring-integrated, inertial, cursor-driven (magnetic buttons,
 *    tilting panels, nodes bending toward the pointer)
 *
 * Everything that moves on this site draws its timing from here.
 */

export const ease = {
  /** Default deceleration — things arriving. */
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Symmetric, for things that travel and settle. */
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Precise, mechanical — used for rules and data. */
  linearish: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const dur = {
  micro: 180,
  short: 320,
  base: 640,
  long: 1100,
} as const;

/** JS counterparts of the CSS curves. */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a));

/* ------------------------------------------------------------------ */
/* Springs — semi-implicit Euler, stable at the step sizes we use.     */
/* ------------------------------------------------------------------ */

export type SpringCfg = { k: number; c: number };

/** Named spring presets. k = stiffness, c = damping. */
export const springs = {
  /** Magnetic UI: quick, slight overshoot. */
  magnetic: { k: 260, c: 20 },
  /** Panels and cards: heavier, no visible wobble. */
  panel: { k: 140, c: 22 },
  /** Cursor ring: soft trail. */
  trail: { k: 380, c: 32 },
  /** Elastic release after a strong pull. */
  elastic: { k: 120, c: 9 },
} satisfies Record<string, SpringCfg>;

export class Spring {
  v = 0;
  constructor(
    public x = 0,
    public target = 0,
    public cfg: SpringCfg = springs.panel
  ) {}
  step(dt: number) {
    const f = -this.cfg.k * (this.x - this.target) - this.cfg.c * this.v;
    this.v += f * dt;
    this.x += this.v * dt;
    return this.x;
  }
  get resting() {
    return Math.abs(this.v) < 0.001 && Math.abs(this.x - this.target) < 0.001;
  }
  snap(v: number) {
    this.x = this.target = v;
    this.v = 0;
  }
}

/* ------------------------------------------------------------------ */
/* Environment                                                          */
/* ------------------------------------------------------------------ */

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasFinePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export type PerfTier = 0 | 1 | 2;

/**
 * 0 = minimal (static frames only), 1 = reduced density, 2 = full.
 * Heuristic, cheap, and conservative: when in doubt, step down.
 */
export function perfTier(): PerfTier {
  if (typeof window === 'undefined' || prefersReducedMotion()) return 0;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return 0;
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory ?? 8;
  const small = window.innerWidth < 768;
  if (cores <= 2 || mem <= 2) return 0;
  if (small || cores <= 4 || mem <= 4) return 1;
  return 2;
}

/** Deterministic PRNG so procedural scenes look identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
