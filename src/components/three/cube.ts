import type { Tex } from './gl';
import { box } from '@/lib/cssMatrix';
import { paintTexture, centerText, topLeftText, type Painter } from './textures';

export type FaceId = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom';
export const SHADE: Record<FaceId, number> = { front: 1, back: 1, right: 0.78, left: 0.68, top: 1.12, bottom: 0.45 };

/** Same face list as the mockup's box(w, h, d) helper. */
export function boxFaces(w: number, h: number, d: number) {
  const F: [FaceId, number, number, string][] = [
    ['front', w, h, `translateZ(${d / 2}px)`],
    ['back', w, h, `rotateY(180deg) translateZ(${d / 2}px)`],
    ['right', d, h, `rotateY(90deg) translateZ(${w / 2}px)`],
    ['left', d, h, `rotateY(-90deg) translateZ(${w / 2}px)`],
    ['top', w, d, `rotateX(90deg) translateZ(${h / 2}px)`],
    ['bottom', w, d, `rotateX(-90deg) translateZ(${h / 2}px)`],
  ];
  return F.map(([id, fw, fh, tf]) => ({ id, fw, fh, tf, local: box(-fw / 2, -fh / 2, fw, fh, tf) }));
}

export type FaceSkin = { bg?: string; border?: [number, string]; paint?: Painter; shade?: number };

export function faceTexture(fw: number, fh: number, skin: FaceSkin): Tex {
  return paintTexture(fw, fh, (ctx, w, h) => {
    if (skin.bg) { ctx.fillStyle = skin.bg; ctx.fillRect(0, 0, w, h); }
    skin.paint?.(ctx, w, h);
    if (skin.border) {
      const [bw, c] = skin.border;
      ctx.strokeStyle = c;
      ctx.lineWidth = bw;
      ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);
    }
  });
}

export { centerText, topLeftText };
