'use client';

import { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/**
 * Hover the portrait and a lens shows what a convolution sees: a real 3×3
 * Sobel filter run over the photo's pixels in the browser, rendered as ink
 * edges. It rides on the tilt enhancer's --lx / --ly / --lift variables, so
 * it needs no animation loop of its own. Fine pointers only.
 */
export function PortraitLens({ src }: { src: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    const cv = canvas.current!;
    const host = cv.parentElement!;
    let cancelled = false;

    const img = new Image();
    img.decoding = 'async';
    img.src = src;

    const render = () => {
      if (cancelled || !img.naturalWidth) return;
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(r.width * dpr));
      const H = Math.max(1, Math.round(r.height * dpr));
      cv.width = W;
      cv.height = H;
      const g = cv.getContext('2d', { willReadFrequently: true });
      if (!g) return;

      // object-fit: cover, matching the photo underneath.
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      g.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      const src = g.getImageData(0, 0, W, H);
      const d = src.data;

      // Luminance, then Sobel magnitude.
      const lum = new Float32Array(W * H);
      for (let i = 0, p = 0; i < lum.length; i++, p += 4) lum[i] = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
      const out = g.createImageData(W, H);
      const o = out.data;
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const gx = -lum[i - W - 1] - 2 * lum[i - 1] - lum[i + W - 1] + lum[i - W + 1] + 2 * lum[i + 1] + lum[i + W + 1];
          const gy = -lum[i - W - 1] - 2 * lum[i - W] - lum[i - W + 1] + lum[i + W - 1] + 2 * lum[i + W] + lum[i + W + 1];
          const m = Math.min(1, Math.hypot(gx, gy) / 360);
          const p = i * 4;
          // Ink on paper, with the strongest edges in the accent teal.
          const k = m > 0.55 ? 1 : 0;
          o[p] = 241 - (241 - (k ? 14 : 21)) * m;
          o[p + 1] = 242 - (242 - (k ? 90 : 24)) * m;
          o[p + 2] = 239 - (239 - (k ? 99 : 26)) * m;
          o[p + 3] = 255;
        }
      }
      g.putImageData(out, 0, 0);
      host.dataset.lens = 'ready';
    };

    img.onload = render;
    const ro = new ResizeObserver(() => img.complete && render());
    ro.observe(host);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [src]);

  return (
    <>
      <canvas ref={canvas} className="portrait-lens" aria-hidden />
      <span className="portrait-lens-ring" aria-hidden>
        <span>conv · sobel 3×3</span>
      </span>
    </>
  );
}
