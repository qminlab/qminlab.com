// CSS cubic-bezier timing functions, so JS-driven motion uses the mockup's exact curves.
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}

export const easeOutCubic = (k: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
export const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

/** A value that moves to a target like a CSS transition (duration + bezier). */
export class Tween {
  from: number; to: number; start = 0; value: number;
  constructor(v: number, private dur: number, private ease: (x: number) => number) {
    this.from = this.to = this.value = v;
  }
  set(target: number, now: number) {
    if (target === this.to) return;
    this.from = this.value;
    this.to = target;
    this.start = now;
  }
  tick(now: number) {
    const k = this.dur <= 0 ? 1 : (now - this.start) / this.dur;
    this.value = this.from + (this.to - this.from) * this.ease(Math.min(1, Math.max(0, k)));
    return this.value;
  }
  get done() { return this.value === this.to; }
}
