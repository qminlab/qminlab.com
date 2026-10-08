import { bezier } from './ease';

const back = bezier(0.2, 0.7, 0.2, 1);

export type LensEls = { ring: HTMLElement; clips: HTMLElement[]; label?: HTMLElement | null };

/**
 * Drives one scope lens. The ring and every clipped x-ray layer receive the same coordinates in the
 * same call, so the border and the inner image can never drift apart (bug fixed in the design phase).
 * Positions are local to the lens area, in px.
 */
export class Lens {
  x = 0; y = 0; scale = 1; visible = false;
  private raf = 0;
  constructor(private els: LensEls, private R: number) {}

  setRadius(R: number) { this.R = R; this.apply(); }

  private apply() {
    const { ring, clips } = this.els;
    const r = this.visible ? this.R * this.scale : 0;
    ring.style.transform = `translate3d(${this.x - this.R}px, ${this.y - this.R}px, 0) scale(${this.scale})`;
    ring.style.visibility = this.visible ? 'visible' : 'hidden';
    ring.style.opacity = this.visible ? '1' : '0';
    const cp = `circle(${r}px at ${this.x}px ${this.y}px)`;
    for (const c of clips) c.style.clipPath = cp;
  }

  private stop() { cancelAnimationFrame(this.raf); this.raf = 0; }

  move(x: number, y: number, label?: string) {
    this.stop();
    this.x = x; this.y = y; this.scale = 1; this.visible = true;
    this.apply();
    if (label !== undefined && this.els.label) this.els.label.textContent = label;
  }

  hide() {
    this.stop();
    this.visible = false;
    this.apply();
  }

  /** Glide to the parked spot (300ms), then breathe 0.96↔1 every 2.4s (mockup note ①). */
  park(px: number, py: number, label?: string, animate = true, pulse = true) {
    this.stop();
    if (label !== undefined && this.els.label) this.els.label.textContent = label;
    const fx = this.x, fy = this.y;
    const start = performance.now();
    const wasVisible = this.visible;
    this.visible = true;
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = (now: number) => {
      const t = now - start;
      const k = !animate || !wasVisible || reduce ? 1 : Math.min(1, t / 300);
      const e = back(k);
      this.x = fx + (px - fx) * e;
      this.y = fy + (py - fy) * e;
      const pt = Math.max(0, t - 300);
      this.scale = pulse && !reduce && k >= 1 ? 0.98 + 0.02 * Math.cos((pt / 2400) * Math.PI * 2) : 1;
      this.apply();
      if (k < 1 || (pulse && !reduce)) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  dispose() { this.stop(); }
}
