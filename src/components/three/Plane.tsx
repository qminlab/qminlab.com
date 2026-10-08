'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { DoubleSide, type Matrix4, type Mesh, type Texture, MeshBasicMaterial, PlaneGeometry } from 'three';
import { toThree } from '@/lib/cssMatrix';

/** A flat CSS box rendered in 3D. `matrix` is in CSS space (see lib/cssMatrix). */
export function Plane({
  w, h, matrix, map, color = '#ffffff', shade = 1, opacity = 1, transparent = true, depthWrite = true, renderOrder = 0, pad = 0,
}: {
  w: number; h: number; matrix: Matrix4; map?: Texture | null; color?: string; shade?: number; opacity?: number;
  transparent?: boolean; depthWrite?: boolean; renderOrder?: number; pad?: number;
}) {
  const ref = useRef<Mesh>(null);
  const geo = useMemo(() => new PlaneGeometry(w + pad * 2, h + pad * 2), [w, h, pad]);
  const mat = useMemo(() => new MeshBasicMaterial({ side: DoubleSide, toneMapped: false }), []);
  useLayoutEffect(() => {
    mat.map = map ?? null;
    mat.color.set(color);
    mat.color.multiplyScalar(shade);
    mat.opacity = opacity;
    mat.transparent = transparent;
    mat.depthWrite = depthWrite;
    mat.needsUpdate = true;
  }, [mat, map, color, shade, opacity, transparent, depthWrite]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    m.matrixAutoUpdate = false;
    m.matrix.copy(toThree(matrix));
    m.matrixWorldNeedsUpdate = true;
  }, [matrix]);
  useLayoutEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <mesh ref={ref} geometry={geo} material={mat} renderOrder={renderOrder} />;
}

/** Imperative version for objects whose matrices change every frame. */
export function makePlane(w: number, h: number, map: Texture | null, opts: { shade?: number; color?: string; depthWrite?: boolean; pad?: number; order?: number } = {}) {
  const pad = opts.pad ?? 0;
  const mat = new MeshBasicMaterial({ side: DoubleSide, toneMapped: false, transparent: true, map, depthWrite: opts.depthWrite ?? true });
  mat.color.set(opts.color ?? '#ffffff').multiplyScalar(opts.shade ?? 1);
  const mesh = new MeshPlain(new PlaneGeometry(w + pad * 2, h + pad * 2), mat);
  mesh.matrixAutoUpdate = false;
  mesh.renderOrder = opts.order ?? 0;
  return mesh;
}

import { Mesh as MeshPlain } from 'three';

export function setCss(mesh: Mesh, cssM: Matrix4) {
  mesh.matrix.copy(toThree(cssM));
  mesh.matrixWorldNeedsUpdate = true;
}

export function setOpacity(mesh: Mesh, o: number) {
  const m = mesh.material as MeshBasicMaterial;
  m.opacity = o;
  mesh.visible = o > 0.001;
}

export function disposeMesh(mesh: Mesh) {
  mesh.geometry.dispose();
  const m = mesh.material as MeshBasicMaterial;
  m.map?.dispose();
  m.dispose();
}
