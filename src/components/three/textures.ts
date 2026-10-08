import { CanvasTexture, LinearFilter, SRGBColorSpace, NoColorSpace } from 'three';

export const TEX_SCALE = 2;

export type Painter = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** Paint a w×h CSS-px box into a texture (2× resolution). */
export function paintTexture(w: number, h: number, paint: Painter, pad = 0) {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.ceil((w + pad * 2) * TEX_SCALE));
  c.height = Math.max(2, Math.ceil((h + pad * 2) * TEX_SCALE));
  const ctx = c.getContext('2d')!;
  ctx.scale(TEX_SCALE, TEX_SCALE);
  ctx.translate(pad, pad);
  paint(ctx, w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = NoColorSpace;
  t.minFilter = LinearFilter;
  t.generateMipmaps = false;
  t.anisotropy = 4;
  void SRGBColorSpace;
  return t;
}

/** Draw text centred like a flex-centred CSS line box. */
export function centerText(
  ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, font: string, color: string,
  letterSpacing = 0, stretch: CanvasFontStretch = 'normal',
) {
  ctx.save();
  ctx.font = font;
  ctx.fontStretch = stretch;
  ctx.letterSpacing = `${letterSpacing}px`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const m = ctx.measureText(text);
  const asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
  ctx.fillText(text, cx - m.width / 2, cy + (asc - desc) / 2);
  ctx.restore();
}

/** Draw text with its line box top-left at (x, y). */
export function topLeftText(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, color: string, letterSpacing = 0,
) {
  ctx.save();
  ctx.font = font;
  ctx.letterSpacing = `${letterSpacing}px`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText(text);
  ctx.fillText(text, x, y + m.fontBoundingBoxAscent);
  ctx.restore();
}

export function measure(ctx: CanvasRenderingContext2D, text: string, font: string, letterSpacing = 0) {
  ctx.save();
  ctx.font = font;
  ctx.letterSpacing = `${letterSpacing}px`;
  const m = ctx.measureText(text);
  ctx.restore();
  return { w: m.width, asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent };
}

export function cssFont(varName: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

export function fontsReady(specs: string[]) {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.all(specs.map((s) => document.fonts.load(s).catch(() => undefined))).then(() => undefined);
}

import { useEffect, useState } from 'react';

let fontsDone = false;
/** True once the site's web fonts are usable from canvas (textures repaint on change). */
export function useFontsReady() {
  const [ready, set] = useState(fontsDone);
  useEffect(() => {
    if (fontsDone) return;
    const mono = cssFont('--font-mono', 'monospace');
    const arch = cssFont('--font-archivo', 'sans-serif');
    const kr = cssFont('--font-kr', 'sans-serif');
    fontsReady([`500 10px ${mono}`, `600 10px ${mono}`, `900 21px ${arch}`, `700 22px ${kr}`]).then(() => {
      fontsDone = true;
      set(true);
    });
  }, []);
  return ready;
}
