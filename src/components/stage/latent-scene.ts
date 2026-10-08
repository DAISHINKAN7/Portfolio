/**
 * The latent stage renderer: one point cloud, re-embedded per chapter.
 *
 * Every form is a VBO of N vec4 (xyz + accent). A frame binds two of them —
 * the form we are leaving and the form we are heading to — and the vertex
 * shader does the rest: a per-point staggered morph, a turbulent flight
 * between forms, a gentle idle shimmer, and a screen-space push away from the
 * cursor. The CPU only feeds a handful of uniforms per frame.
 */
import { mat4, multiply, orbitView, perspective } from '@/lib/gl/mat4';
import type { Form } from './shapes';

const VS = `
attribute vec4 aFrom; attribute vec4 aTo; attribute vec4 aRnd;
uniform mat4 uMVP; uniform float uMix; uniform float uTime; uniform vec2 uMouse; uniform float uAspect;
uniform float uDpr; uniform float uSize; uniform float uPress; uniform vec2 uShift; uniform float uDist;
varying float vAccent; varying float vAlpha;
void main(){
  // Staggered: each point leaves on its own schedule.
  float m = clamp((uMix - aRnd.x * 0.42) / 0.58, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 p = mix(aFrom.xyz, aTo.xyz, m);
  // Flight between forms: the cloud winds into a vortex and unwinds into the
  // next form. Each point orbits the vertical axis by its own amount, lifts
  // along a helix, and rides a low-frequency flow field.
  float fly = sin(3.14159 * m);
  float ang = fly * (2.2 + aRnd.y * 2.6) * (aRnd.z > 0.5 ? 1.0 : 0.82);
  float rad = length(p.xz);
  float rr = rad + fly * (0.35 + aRnd.x * 0.45);
  float a0 = atan(p.z, p.x) + ang;
  p.xz = vec2(cos(a0), sin(a0)) * rr;
  p.y += fly * (aRnd.w - 0.5) * 0.9;
  vec3 q = p * 1.4 + aRnd.w * 6.2831;
  p += vec3(sin(q.y + uTime * 0.6), sin(q.z * 1.13 + uTime * 0.5), sin(q.x * 0.91 + uTime * 0.7)) * 0.12 * fly;
  // Idle shimmer: the cloud is never quite still.
  float ph = aRnd.w * 40.0;
  p += vec3(sin(uTime * 0.7 + ph), cos(uTime * 0.6 + ph * 1.3), sin(uTime * 0.5 + ph * 0.7)) * 0.0045;

  vec4 c = uMVP * vec4(p, 1.0);
  vec2 ndc = c.xy / c.w + uShift;
  // Scatter away from the cursor (aspect-correct), harder while pressed.
  vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
  float r = length(d);
  float f = smoothstep(0.32 + uPress * 0.12, 0.0, r);
  ndc += (d / max(r, 1e-4)) / vec2(uAspect, 1.0) * f * f * (0.07 + uPress * 0.16);
  c.xy = ndc * c.w;
  gl_Position = c;
  gl_PointSize = max(1.0, uSize * uDpr * (0.65 + aRnd.z * 0.7) * (uDist / c.w));
  vAccent = mix(aFrom.w, aTo.w, m);
  vAlpha = (0.42 + aRnd.z * 0.4) * (1.0 - fly * 0.25) + f * 0.25;
}`;

const FS = `
precision mediump float;
varying float vAccent; varying float vAlpha;
uniform float uAlpha;
void main(){
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d = dot(uv, uv);
  if (d > 1.0) discard;
  vec3 ink = vec3(0.082, 0.094, 0.102);
  vec3 acc = vec3(0.055, 0.353, 0.388);
  gl_FragColor = vec4(mix(ink, acc, step(0.5, vAccent)), vAlpha * uAlpha * (1.0 - d * 0.35));
}`;

export type LatentScene = {
  resize(w: number, h: number, compact: boolean): void;
  frame(opts: { chapter: number; t: number; dt: number; mouse: [number, number] | null; press: boolean; alpha: number }): void;
  destroy(): void;
};

export function createLatentScene(canvas: HTMLCanvasElement, forms: Form[], n: number): LatentScene | null {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const A = { from: gl.getAttribLocation(prog, 'aFrom'), to: gl.getAttribLocation(prog, 'aTo'), rnd: gl.getAttribLocation(prog, 'aRnd') };
  const U = Object.fromEntries(
    ['uMVP', 'uMix', 'uTime', 'uMouse', 'uAspect', 'uDpr', 'uSize', 'uPress', 'uShift', 'uDist', 'uAlpha'].map((k) => [k, gl.getUniformLocation(prog, k)])
  ) as Record<string, WebGLUniformLocation | null>;

  // One VBO per form, plus shared per-point randoms.
  const vbos = forms.map((f) => {
    const b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, f.pts, gl.STATIC_DRAW);
    return b;
  });
  const rnd = new Float32Array(n * 4);
  let s = 1234567;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n * 4; i++) rnd[i] = r();
  const rbuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, rbuf);
  gl.bufferData(gl.ARRAY_BUFFER, rnd, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, rbuf);
  gl.enableVertexAttribArray(A.rnd);
  gl.vertexAttribPointer(A.rnd, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(A.from);
  gl.enableVertexAttribArray(A.to);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);

  const proj = mat4(), view = mat4(), mvp = mat4();
  let W = 1, H = 1, dpr = 1, compact = false;
  let bound: [number, number] = [-1, -1];
  // Smoothed state, so scroll jitter never reaches the cloud.
  let chap = 0;
  let mx = 0, my = 0, mActive = 0, press = 0;
  let spinClock = 0;

  const shortest = (a: number, b: number) => {
    let d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  return {
    resize(w, h, c) {
      W = w;
      H = h;
      compact = c;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    frame({ chapter, t, dt, mouse, press: pressed, alpha }) {
      chap += (chapter - chap) * Math.min(1, dt * 7);
      const last = forms.length - 1;
      const c = Math.max(0, Math.min(last, chap));
      const a = Math.min(last - 1, Math.floor(c));
      const local = c - a;
      // Hold each form for the middle of its segment, morph at the seams.
      const mix = Math.max(0, Math.min(1, (local - 0.18) / 0.64));
      if (bound[0] !== a || bound[1] !== a + 1) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbos[a]);
        gl.vertexAttribPointer(A.from, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbos[a + 1]);
        gl.vertexAttribPointer(A.to, 4, gl.FLOAT, false, 0, 0);
        bound = [a, a + 1];
      }
      const F = forms[a], G = forms[a + 1];
      const e = mix * mix * (3 - 2 * mix);
      spinClock += dt;
      const ya = F.yaw + F.spin * spinClock;
      const yb = G.yaw + G.spin * spinClock;
      const yaw = ya + shortest(ya, yb) * e;
      const tilt = F.tilt + (G.tilt - F.tilt) * e;

      if (mouse) {
        mx += (mouse[0] - mx) * Math.min(1, dt * 10);
        my += (mouse[1] - my) * Math.min(1, dt * 10);
      }
      mActive += ((mouse ? 1 : 0) - mActive) * Math.min(1, dt * 6);
      press += ((pressed ? 1 : 0) - press) * Math.min(1, dt * 5);

      const aspect = W / H;
      const dist = compact ? 5.9 : 4.6;
      perspective(proj, 0.62, aspect, 0.1, 50);
      // Gentle pointer parallax on top of the form's own pose.
      orbitView(view, tilt + (mouse ? my * 0.06 : 0), yaw + (mouse ? mx * 0.1 : 0), dist);
      multiply(mvp, proj, view);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(U.uMVP, false, mvp);
      gl.uniform1f(U.uMix, mix);
      gl.uniform1f(U.uTime, t);
      gl.uniform2f(U.uMouse, mActive > 0.01 ? mx : 9, mActive > 0.01 ? my : 9);
      gl.uniform1f(U.uAspect, aspect);
      gl.uniform1f(U.uDpr, dpr);
      gl.uniform1f(U.uSize, compact ? 1.5 : 1.75);
      gl.uniform1f(U.uPress, press);
      gl.uniform2f(U.uShift, compact ? 0 : 0.36, compact ? 0.3 : 0.04);
      gl.uniform1f(U.uDist, dist);
      gl.uniform1f(U.uAlpha, alpha);
      gl.drawArrays(gl.POINTS, 0, n);
    },
    destroy() {
      vbos.forEach((b) => gl.deleteBuffer(b));
      gl.deleteBuffer(rbuf);
      gl.deleteProgram(prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
