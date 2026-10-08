'use client';
import { useEffect, useMemo, useRef } from 'react';
import type { M4 } from '@/lib/m4';
import { css } from '@/lib/cssMatrix';
import { useFrame, useGroup, useInvalidate } from './CssCanvas';
import { bezier, Tween } from '@/lib/ease';
import { ACCENT, BONE, INK } from '@/lib/tokens';
import { boxFaces, faceTexture, SHADE, centerText, topLeftText } from './cube';
import { makePlane, setCss, disposeMesh } from './Plane';
import { cssFont, useFontsReady } from './textures';

const heroEase = bezier(0.2, 0.7, 0.2, 1);
const WIRE_LABEL: Record<string, string> = { front: 'shell.front', back: 'shell.back', right: 'ql::core', left: 'mount()', top: 'lid.open()', bottom: 'base' };

/**
 * The hero "Q cube". `layer="shell"` is the bone cube; `layer="xray"` is the wireframe shell + orange core
 * seen through the lens. Rotation follows `tilt` with the mockup's 500ms cubic-bezier(.2,.7,.2,1).
 */
export function HeroCube({ layer, tilt, mobile = false }: { layer: 'shell' | 'xray'; tilt?: { current: { tx: number; ty: number } }; mobile?: boolean }) {
  const group = useGroup();
  const invalidate = useInvalidate();
  const tx = useRef(new Tween(0, 500, heroEase));
  const ty = useRef(new Tween(0, 500, heroEase));
  const ready = useFontsReady();
  const faces = useMemo(() => {
    const out: { mesh: ReturnType<typeof makePlane>; local: M4 }[] = [];
    const mono = cssFont('--font-mono', 'monospace');
    const arch = cssFont('--font-archivo', 'sans-serif');
    if (layer === 'shell') {
      for (const f of boxFaces(200, 200, 200)) {
        const tex = faceTexture(f.fw, f.fh, {
          bg: BONE,
          paint: (ctx, w, h) => {
            if (f.id === 'front' || f.id === 'back') centerText(ctx, 'Q', w / 2 - (mobile ? 0 : 136 * 0.02), h / 2, `900 136px ${arch}`, INK, mobile ? 0 : 136 * 0.04, 'expanded');
            if (f.id === 'right' && !mobile) centerText(ctx, 'QL-000', w / 2 - 11 * 0.02, h / 2, `500 11px ${mono}`, INK, 11 * 0.04);
          },
        });
        out.push({ mesh: makePlane(f.fw, f.fh, tex, { shade: SHADE[f.id] }), local: f.local });
      }
    } else {
      for (const f of boxFaces(84, 84, 84)) {
        const tex = faceTexture(f.fw, f.fh, {
          bg: ACCENT,
          paint: (ctx, w, h) => { if (f.id === 'front' || f.id === 'back') centerText(ctx, 'CORE', w / 2, h / 2, `500 10px ${mono}`, INK); },
        });
        out.push({ mesh: makePlane(f.fw, f.fh, tex, { shade: SHADE[f.id] }), local: f.local });
      }
      for (const f of boxFaces(200, 200, 200)) {
        const tex = faceTexture(f.fw, f.fh, {
          bg: 'rgba(255,90,31,0.06)',
          border: [1.5, ACCENT],
          paint: (ctx) => topLeftText(ctx, WIRE_LABEL[f.id], 9.5, 9.5, `500 10px ${mono}`, ACCENT),
        });
        out.push({ mesh: makePlane(f.fw, f.fh, tex, { depthWrite: false, order: 1 }), local: f.local });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, mobile, ready]);

  useEffect(() => {
    faces.forEach((f) => group.add(f.mesh));
    invalidate();
    return () => { faces.forEach((f) => { group.remove(f.mesh); disposeMesh(f.mesh); }); };
  }, [faces, group, invalidate]);

  useFrame(() => {
    const now = performance.now();
    tx.current.set(tilt?.current.tx ?? 0, now);
    ty.current.set(tilt?.current.ty ?? 0, now);
    const rx = -24 + ty.current.tick(now);
    const ry = -38 + tx.current.tick(now);
    const rot = css(`rotateX(${rx}deg) rotateY(${ry}deg)`);
    for (const f of faces) setCss(f.mesh, rot.clone().multiply(f.local));
    if (!tx.current.done || !ty.current.done) invalidate();
  });

  return null;
}
