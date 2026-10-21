'use client';
import { useEffect, useRef } from 'react';

// Hero backdrop: pixel-scale fog lit by a flickering lantern that follows the pointer (or wanders on its own),
// with embers drifting up. Rendered at 1/4 resolution and scaled up with nearest-neighbour, so the fog itself
// reads as pixel art. Falls back to a CSS gradient when WebGL is missing; holds still on reduced motion.
const FRAG = `
precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform float glow;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1.0,0.0)), f.x), mix(h(i+vec2(0.0,1.0)), h(i+vec2(1.0,1.0)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*n(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 p = (gl_FragCoord.xy - 0.5*r) / r.y;
  vec2 mm = (m - 0.5*r) / r.y;
  float fog = fbm(p*2.4 + vec2(t*0.035, -t*0.05)) * 0.65 + fbm(p*6.0 - t*0.07) * 0.25;
  float d = length(p - mm);
  float flick = 0.9 + 0.06*sin(t*11.0) + 0.04*sin(t*23.0 + 1.7);
  float light = exp(-d*d*(5.5 - glow*2.0)) * flick;
  vec3 col = vec3(0.016, 0.014, 0.026) + fog * vec3(0.06, 0.05, 0.085);
  col += light * vec3(1.0, 0.52, 0.18) * (0.28 + fog*1.05);
  col += exp(-d*d*60.0) * vec3(1.0, 0.8, 0.45) * 0.35 * flick;
  for (int i = 0; i < 28; i++){
    float fi = float(i);
    float sp = 0.025 + 0.05*h(vec2(fi, 3.0));
    vec2 e = vec2((h(vec2(fi, 1.0))*2.0 - 1.0) * (r.x/r.y) * 0.5, mod(h(vec2(fi, 2.0)) + t*sp, 1.0)*1.3 - 0.65);
    e.x += sin(t*0.9 + fi*1.3) * 0.04;
    float s = 0.0035 + 0.004*h(vec2(fi, 4.0));
    col += vec3(1.0, 0.42, 0.12) * smoothstep(s, 0.0, length(p - e)) * (0.55 + 0.45*sin(t*3.0 + fi));
  }
  col *= smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(1.25, 1.6)));
  gl_FragColor = vec4(col, 1.0);
}`;
const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
const SCALE = 4;

export function LanternFog({ glow = 0 }: { glow?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef(glow);
  glowRef.current = glow;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) { cv.dataset.fallback = '1'; return; }
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.dataset.fallback = '1'; return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm'), uG = gl.getUniformLocation(pr, 'glow');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const st = { w: 1, h: 1, tx: 0.62, ty: 0.42, x: 0.62, y: 0.42, idle: 0, g: 0, raf: 0, on: true, t0: performance.now() };
    const size = () => {
      const b = cv.getBoundingClientRect();
      st.w = Math.max(1, Math.round(b.width / SCALE)); st.h = Math.max(1, Math.round(b.height / SCALE));
      cv.width = st.w; cv.height = st.h; gl.viewport(0, 0, st.w, st.h);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(cv);
    const move = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      st.tx = (e.clientX - b.left) / b.width; st.ty = (e.clientY - b.top) / b.height; st.idle = 0;
    };
    window.addEventListener('pointermove', move, { passive: true });
    const io = new IntersectionObserver(([en]) => { st.on = en.isIntersecting; if (st.on && !st.raf) st.raf = requestAnimationFrame(frame); });
    io.observe(cv);
    function frame(now: number) {
      st.raf = 0;
      const t = (now - st.t0) / 1000;
      st.idle += 1;
      if (st.idle > 180) { st.tx = 0.6 + Math.sin(t * 0.31) * 0.22; st.ty = 0.45 + Math.sin(t * 0.47) * 0.16; }
      st.x += (st.tx - st.x) * 0.06; st.y += (st.ty - st.y) * 0.06;
      st.g += (glowRef.current - st.g) * 0.08;
      gl!.uniform2f(uR, st.w, st.h);
      gl!.uniform1f(uT, reduce ? 4 : t);
      gl!.uniform2f(uM, st.x * st.w, (1 - st.y) * st.h);
      gl!.uniform1f(uG, st.g);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (st.on && !reduce) st.raf = requestAnimationFrame(frame);
    }
    st.raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(st.raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', move); };
  }, []);
  return <canvas ref={ref} className="dh-fog" aria-hidden="true" />;
}
