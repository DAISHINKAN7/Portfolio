/** Just enough column-major 4×4 matrix math for a perspective camera. */
export type Mat4 = Float32Array;

export const mat4 = () => new Float32Array(16);

export function perspective(out: Mat4, fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

export function multiply(out: Mat4, a: Mat4, b: Mat4) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
      out[i * 4 + j] = s;
    }
  }
  return out;
}

/** View matrix: translate by -camera, then rotate X, then rotate Y (orbit). */
export function orbitView(out: Mat4, rx: number, ry: number, dist: number, panX = 0, panY = 0) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  // R = Rx * Ry, then translate (panX, panY, -dist)
  out[0] = cy;        out[1] = sx * sy;  out[2] = -cx * sy; out[3] = 0;
  out[4] = 0;         out[5] = cx;       out[6] = sx;       out[7] = 0;
  out[8] = sy;        out[9] = -sx * cy; out[10] = cx * cy; out[11] = 0;
  out[12] = panX;     out[13] = panY;    out[14] = -dist;   out[15] = 1;
  return out;
}

/** Project a world point to CSS pixels. Returns w (depth) in out[2]. */
export function project(out: Float32Array, m: Mat4, x: number, y: number, z: number, w: number, h: number) {
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  out[0] = (cx / cw * 0.5 + 0.5) * w;
  out[1] = (1 - (cy / cw * 0.5 + 0.5)) * h;
  out[2] = cw;
  return out;
}
