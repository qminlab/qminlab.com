import { M4 } from '@/lib/m4';

/*
 * A tiny WebGL renderer for what the site actually draws: flat, textured, CSS-transformed planes.
 * It reproduces three.js's MeshBasicMaterial path the site used before (transparent, double-sided,
 * normal blending, linear output, no tone mapping) and three's transparent sort order, so frames match
 * while the 3D code shrinks from ~244 KB to a few KB gzipped.
 */

/** A canvas-painted texture. Uploaded lazily to whichever renderer first draws it. */
export class Tex {
  gl: WebGLRenderingContext | null = null;
  handle: WebGLTexture | null = null;
  constructor(public canvas: HTMLCanvasElement) {}
  dispose() {
    if (this.gl && this.handle) this.gl.deleteTexture(this.handle);
    this.gl = null;
    this.handle = null;
  }
}

let nextId = 0;

/** A w×h plane centred on its origin. `matrix` is in GL space (y up). */
export class Mesh {
  id = nextId++;
  matrix = new M4();
  opacity = 1;
  visible = true;
  constructor(
    public w: number,
    public h: number,
    public map: Tex | null,
    public shade = 1,
    public depthWrite = true,
    public renderOrder = 0,
  ) {}
  dispose() {
    this.map?.dispose();
  }
}

export class Group {
  children = new Set<Mesh>();
  add(m: Mesh) { this.children.add(m); }
  remove(m: Mesh) { this.children.delete(m); }
}

const VS = `
attribute vec2 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 size;
varying vec2 vUv;
void main() {
  vUv = position + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * size, 0.0, 1.0);
}`;
const FS = `
precision highp float;
uniform sampler2D map;
uniform vec3 diffuse;
uniform float opacity;
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(diffuse, opacity) * texture2D(map, vUv);
}`;

function shader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export class Renderer {
  gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private u: Record<'mv' | 'p' | 'size' | 'diffuse' | 'opacity' | 'map', WebGLUniformLocation | null>;
  private proj = new M4();
  private view = new M4();
  private pv = new M4();
  private mv = new M4();
  private f32 = new Float32Array(16);
  width = 0;
  height = 0;

  constructor(public canvas: HTMLCanvasElement) {
    const attrs: WebGLContextAttributes = { alpha: true, depth: true, stencil: false, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    const gl = (canvas.getContext('webgl2', attrs) ?? canvas.getContext('webgl', attrs)) as WebGLRenderingContext | null;
    if (!gl) throw new Error('WebGL unavailable');
    this.gl = gl;
    const p = gl.createProgram()!;
    gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(p, 0, 'position');
    gl.linkProgram(p);
    this.prog = p;
    gl.useProgram(p);
    const U = (n: string) => gl.getUniformLocation(p, n);
    this.u = { mv: U('modelViewMatrix'), p: U('projectionMatrix'), size: U('size'), diffuse: U('diffuse'), opacity: U('opacity'), map: U('map') };
    gl.uniform1i(this.u.map, 0);
    // Same vertex layout and uv orientation as three.js PlaneGeometry (uv v=1 at the top edge).
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
  }

  setSize(w: number, h: number, dpr: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private bind(t: Tex) {
    const gl = this.gl;
    if (t.gl !== gl) {
      t.dispose();
      t.gl = gl;
      t.handle = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t.handle);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.canvas);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, t.handle);
    }
  }

  /** CSS `perspective` projection: 1 unit = 1 CSS px on z=0, vanishing point at (ox, oy) in canvas px. */
  render(meshes: Iterable<Mesh>, perspective: number, ox: number, oy: number) {
    const gl = this.gl, { width: w, height: h } = this;
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!w || !h) return;
    this.proj.makeCssPerspective(w, h, perspective, w / 2 - ox, h / 2 - oy, 1, perspective * 4);
    this.view.makeTranslation(0, 0, -perspective);
    this.pv.mul(this.proj, this.view);
    // three.js transparent order: renderOrder, then far-to-near by projected origin depth, then creation order.
    const list: { m: Mesh; z: number }[] = [];
    const P = this.pv.e;
    for (const m of meshes) {
      if (!m.visible || !m.map) continue;
      const M = m.matrix.e, x = M[12], y = M[13], z = M[14];
      const cw = P[3] * x + P[7] * y + P[11] * z + P[15];
      list.push({ m, z: (P[2] * x + P[6] * y + P[10] * z + P[14]) / cw });
    }
    list.sort((a, b) => a.m.renderOrder - b.m.renderOrder || b.z - a.z || a.m.id - b.m.id);
    this.f32.set(this.proj.e);
    gl.uniformMatrix4fv(this.u.p, false, this.f32);
    for (const { m } of list) {
      this.mv.mul(this.view, m.matrix);
      this.f32.set(this.mv.e);
      gl.uniformMatrix4fv(this.u.mv, false, this.f32);
      gl.uniform2f(this.u.size, m.w, m.h);
      gl.uniform3f(this.u.diffuse, m.shade, m.shade, m.shade);
      gl.uniform1f(this.u.opacity, m.opacity);
      gl.depthMask(m.depthWrite);
      this.bind(m.map!);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  dispose() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
