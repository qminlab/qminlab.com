import { M4 } from './m4';

// The mockup builds its 3D objects with CSS transforms (y points down). These helpers read the very same
// transform strings and turn them into GL matrices (y points up), so geometry matches the mockup 1:1.
const FLIP = new M4().makeScale(1, -1, 1);

export function css(transform: string): M4 {
  const d = new DOMMatrix(transform || 'none');
  return new M4().fromArray(d.toFloat32Array());
}

/** Matrix (CSS space) that places a w×h plane, centred at its own origin, like a CSS box. */
export function box(x: number, y: number, w: number, h: number, transform = 'none', ox = w / 2, oy = h / 2): M4 {
  return new M4()
    .makeTranslation(x + ox, y + oy, 0)
    .multiply(css(transform))
    .multiply(new M4().makeTranslation(w / 2 - ox, h / 2 - oy, 0));
}

/** Convert a CSS-space matrix into GL space. */
export function toGL(m: M4, out = new M4()): M4 {
  return out.mul(FLIP, m).multiply(FLIP);
}
