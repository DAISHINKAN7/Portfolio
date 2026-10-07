/**
 * A deliberately tiny WebGL renderer for node-link scenes: hairline segments
 * and point sprites, nothing else. Both scenes on the site (the hero network
 * and the stack graph) are just that, so a general 3D engine would be ~150 kB
 * of code to draw dots and lines.
 *
 * Point layout (9 floats): x y z | size | r g b a | shape
 *   shape 0 = disc, 1 = square (tokens), 2 = hollow ring (outputs, ripples)
 * Line layout (7 floats):  x y z | r g b a
 */
import type { Mat4 } from './mat4';

const POINT_VS = `
attribute vec3 p; attribute float s; attribute vec4 c; attribute float k;
uniform mat4 m; uniform float dpr; uniform float focal;
varying vec4 vc; varying float vk; varying float vs;
void main(){
  vec4 q = m * vec4(p, 1.0);
  gl_Position = q;
  // Perspective size attenuation, clamped so near points never balloon.
  float sz = s * dpr * clamp(focal / q.w, 0.35, 2.4);
  gl_PointSize = max(sz, 1.0);
  vs = gl_PointSize; vc = c; vk = k;
}`;

const POINT_FS = `
precision mediump float;
varying vec4 vc; varying float vk; varying float vs;
void main(){
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float px = 2.0 / vs; // one device pixel in uv units, for crisp edges
  float a;
  if (vk < 0.5) {
    float d = length(uv);
    a = 1.0 - smoothstep(1.0 - px * 1.5, 1.0, d);
  } else if (vk < 1.5) {
    vec2 e = abs(uv);
    a = 1.0 - smoothstep(0.86 - px, 0.86, max(e.x, e.y));
  } else {
    float d = length(uv);
    float w = max(px * 1.6, 0.12);
    a = (1.0 - smoothstep(1.0 - px, 1.0, d)) * smoothstep(1.0 - w - px, 1.0 - w, d);
  }
  if (a <= 0.003) discard;
  gl_FragColor = vec4(vc.rgb, vc.a * a);
}`;

const LINE_VS = `
attribute vec3 p; attribute vec4 c; uniform mat4 m; varying vec4 vc;
void main(){ gl_Position = m * vec4(p, 1.0); vc = c; }`;

const LINE_FS = `
precision mediump float; varying vec4 vc;
void main(){ gl_FragColor = vc; }`;

type Prog = { prog: WebGLProgram; attrs: Record<string, number>; unis: Record<string, WebGLUniformLocation | null> };

function compile(gl: WebGLRenderingContext, vs: string, fs: string, attrs: string[], unis: string[]): Prog {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
  return {
    prog,
    attrs: Object.fromEntries(attrs.map((a) => [a, gl.getAttribLocation(prog, a)])),
    unis: Object.fromEntries(unis.map((u) => [u, gl.getUniformLocation(prog, u)])),
  };
}

export type Renderer = ReturnType<typeof createRenderer>;

export function createRenderer(canvas: HTMLCanvasElement) {
  const gl = (canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power' }) ??
    null) as WebGLRenderingContext | null;
  if (!gl) return null;

  const points = compile(gl, POINT_VS, POINT_FS, ['p', 's', 'c', 'k'], ['m', 'dpr', 'focal']);
  const lines = compile(gl, LINE_VS, LINE_FS, ['p', 'c'], ['m']);
  const pbuf = gl.createBuffer();
  const lbuf = gl.createBuffer();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);

  let dpr = 1;
  let w = 1;
  let h = 1;

  const bindAttr = (loc: number, size: number, stride: number, offset: number) => {
    if (loc < 0) return;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride * 4, offset * 4);
  };

  return {
    gl,
    get width() {
      return w;
    },
    get height() {
      return h;
    },
    get dpr() {
      return dpr;
    },
    resize(cssW: number, cssH: number, maxDpr = 2) {
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      w = cssW;
      h = cssH;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(mvp: Mat4, focal: number, lineData: Float32Array, lineCount: number, pointData: Float32Array, pointCount: number) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (lineCount) {
        gl.useProgram(lines.prog);
        gl.uniformMatrix4fv(lines.unis.m, false, mvp);
        gl.bindBuffer(gl.ARRAY_BUFFER, lbuf);
        gl.bufferData(gl.ARRAY_BUFFER, lineData.subarray(0, lineCount * 7), gl.DYNAMIC_DRAW);
        bindAttr(lines.attrs.p, 3, 7, 0);
        bindAttr(lines.attrs.c, 4, 7, 3);
        gl.drawArrays(gl.LINES, 0, lineCount);
        gl.disableVertexAttribArray(lines.attrs.p);
        gl.disableVertexAttribArray(lines.attrs.c);
      }

      if (pointCount) {
        gl.useProgram(points.prog);
        gl.uniformMatrix4fv(points.unis.m, false, mvp);
        gl.uniform1f(points.unis.dpr, dpr);
        gl.uniform1f(points.unis.focal, focal);
        gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
        gl.bufferData(gl.ARRAY_BUFFER, pointData.subarray(0, pointCount * 9), gl.DYNAMIC_DRAW);
        bindAttr(points.attrs.p, 3, 9, 0);
        bindAttr(points.attrs.s, 1, 9, 3);
        bindAttr(points.attrs.c, 4, 9, 4);
        bindAttr(points.attrs.k, 1, 9, 8);
        gl.drawArrays(gl.POINTS, 0, pointCount);
        for (const a of ['p', 's', 'c', 'k']) if (points.attrs[a] >= 0) gl.disableVertexAttribArray(points.attrs[a]);
      }
    },
    destroy() {
      gl.deleteBuffer(pbuf);
      gl.deleteBuffer(lbuf);
      gl.deleteProgram(points.prog);
      gl.deleteProgram(lines.prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

/** Palette in linear-ish 0–1 floats, matching tailwind.config.ts. */
export const RGB = {
  ink: [0.082, 0.094, 0.102],
  ink2: [0.306, 0.337, 0.361],
  ink3: [0.486, 0.522, 0.545],
  rule: [0.824, 0.839, 0.82],
  rule2: [0.714, 0.737, 0.714],
  accent: [0.055, 0.353, 0.388],
  accent2: [0.071, 0.467, 0.498],
  caution: [0.561, 0.31, 0.063],
} as const;
