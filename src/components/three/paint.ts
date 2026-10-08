// Canvas painters that reproduce the mockup's CSS backgrounds.

/** Annular sector list: [fromDeg, toDeg, color] measured clockwise from 12 o'clock like conic-gradient. */
export type Seg = [number, number, string];

export function annulus(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, th: number, segs: Seg[], glow?: string) {
  ctx.save();
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 6; }
  for (const [a, b, c] of segs) {
    const s = ((a - 90) * Math.PI) / 180, e = ((b - 90) * Math.PI) / 180;
    ctx.beginPath();
    ctx.arc(cx, cy, r, s, e);
    ctx.arc(cx, cy, r - th, e, s, true);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
  }
  ctx.restore();
}

/** repeating-conic-gradient(C 0 on, transparent on period) */
export function repeatSegs(on: number, period: number, color: string): Seg[] {
  const out: Seg[] = [];
  for (let a = 0; a < 360 - 1e-6; a += period) out.push([a, Math.min(360, a + on), color]);
  return out;
}

export function hexPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y);
  ctx.lineTo(x + w, y + h * 0.25);
  ctx.lineTo(x + w, y + h * 0.75);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.lineTo(x, y + h * 0.75);
  ctx.lineTo(x, y + h * 0.25);
  ctx.closePath();
}

/** clip-path: polygon(...) given as [x%, y%] pairs */
export function polyPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const X = x + (px / 100) * w, Y = y + (py / 100) * h;
    if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
  });
  ctx.closePath();
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}
