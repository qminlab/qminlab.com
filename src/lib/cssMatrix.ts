import { Matrix4 } from 'three';

// The mockup builds its 3D objects with CSS transforms (y points down). These helpers read the very same
// transform strings and turn them into three.js matrices (y points up), so geometry matches the mockup 1:1.
const FLIP = new Matrix4().makeScale(1, -1, 1);

export function css(transform: string): Matrix4 {
  const d = new DOMMatrix(transform || 'none');
  return new Matrix4().fromArray(Array.from(d.toFloat32Array()));
}

/** Matrix (CSS space) that places a w×h plane, centred at its own origin, like a CSS box. */
export function box(x: number, y: number, w: number, h: number, transform = 'none', ox = w / 2, oy = h / 2): Matrix4 {
  return new Matrix4()
    .makeTranslation(x + ox, y + oy, 0)
    .multiply(css(transform))
    .multiply(new Matrix4().makeTranslation(w / 2 - ox, h / 2 - oy, 0));
}

/** Convert a CSS-space matrix into three.js space. */
export function toThree(m: Matrix4): Matrix4 {
  return FLIP.clone().multiply(m).multiply(FLIP);
}

export function cssSize(fw: number, fh: number): [number, number] {
  return [fw, fh];
}
