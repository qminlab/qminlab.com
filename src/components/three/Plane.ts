import type { M4 } from '@/lib/m4';
import { toGL } from '@/lib/cssMatrix';
import { Mesh, type Tex } from './gl';

/** A flat CSS box rendered in 3D. `pad` grows the plane on every side (for glows painted past the box). */
export function makePlane(w: number, h: number, map: Tex | null, opts: { shade?: number; depthWrite?: boolean; pad?: number; order?: number } = {}) {
  const pad = opts.pad ?? 0;
  return new Mesh(w + pad * 2, h + pad * 2, map, opts.shade ?? 1, opts.depthWrite ?? true, opts.order ?? 0);
}

/** Place a mesh with a CSS-space matrix (see lib/cssMatrix). */
export function setCss(mesh: Mesh, cssM: M4) {
  toGL(cssM, mesh.matrix);
}

export function setOpacity(mesh: Mesh, o: number) {
  mesh.opacity = o;
  mesh.visible = o > 0.001;
}

export function disposeMesh(mesh: Mesh) {
  mesh.dispose();
}
