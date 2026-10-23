/**
 * Apple's Genie effect, as macOS uses to minimize a window into the Dock (and to bring it back out), and as
 * iOS 26 uses to open and close apps from their icon. The element is copied into thin horizontal strips; the
 * strips nearest the icon pinch to the icon's width first, then the whole stack slides into the icon.
 */
export type Box = { left: number; top: number; width: number; height: number };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** A static copy of `el` for animating: frames become plain panels, canvases keep their current picture. */
function snapshot(el: HTMLElement) {
  const copy = el.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('iframe').forEach((f) => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background:${getComputedStyle(f).backgroundColor || '#fff'}`;
    f.replaceWith(d);
  });
  copy.querySelectorAll('video').forEach((v) => {
    const i = document.createElement('img');
    i.src = v.poster; i.style.cssText = v.style.cssText; i.className = v.className;
    i.style.objectFit = 'contain'; i.style.width = '100%'; i.style.height = '100%';
    v.replaceWith(i);
  });
  const from = el.querySelectorAll('canvas'), to = copy.querySelectorAll('canvas');
  from.forEach((c, i) => {
    try { to[i].getContext('2d')?.drawImage(c, 0, 0); } catch { /* a WebGL or tainted canvas stays blank */ }
  });
  copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  copy.removeAttribute('id');
  copy.setAttribute('aria-hidden', 'true');
  return copy;
}

/**
 * Projective map (Heckbert) taking the unit square's corners (0,0),(1,0),(1,1),(0,1) to the points p0..p3:
 * x = (a·u + b·v + c) / (g·u + h·v + 1), y = (d·u + e·v + f) / (g·u + h·v + 1).
 */
function square2quad(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
  const det = dx1 * dy2 - dx2 * dy1 || 1e-9;
  const g = (sx * dy2 - dx2 * sy) / det, h = (dx1 * sy - sx * dy1) / det;
  return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h];
}

/** cubic-bezier(x1,y1,x2,y2) as a function of time, like the CSS timing function. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const f = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (f(x1, x2, t) < x) lo = t; else hi = t; }
    return f(y1, y2, t);
  };
}
const EASE_IN = bezier(0.45, 0, 0.75, 0.95), EASE_OUT = bezier(0.2, 0.75, 0.3, 1);

/**
 * Animate `el` (at `rect`) into `icon` (dir 'in') or out of it (dir 'out'). Copies are placed in `host`
 * with position:fixed, so `rect` and `icon` are viewport boxes. Each strip is mapped onto the trapezoid between
 * its top and bottom edge with a projective transform, so neighbouring strips meet exactly and the curved
 * sides stay smooth instead of stepping. Resolves when the motion ends.
 */
export function genie(el: HTMLElement, rect: Box, icon: Box, dir: 'in' | 'out', host: HTMLElement, opts: { duration?: number; strips?: number; lag?: number } = {}) {
  const N = opts.strips ?? 28, dur = opts.duration ?? 520, lag = opts.lag ?? 0.22;
  const below = icon.top + icon.height / 2 > rect.top + rect.height / 2;
  const base = snapshot(el);
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;z-index:9500;pointer-events:none;overflow:visible';
  host.appendChild(layer);
  const W = rect.width, H = rect.height, hs = H / N;
  const near = (v: number) => (below ? v : 1 - v);
  const pv = (t: number, v: number) => smooth(clamp01((t - 0.12 - lag * (1 - near(v))) / (0.88 - lag)));
  const ph = (t: number, v: number) => smooth(clamp01(t * 1.9 - (1 - near(v)) * 0.9));
  // Left x, width and y of the horizontal line at v (0 top .. 1 bottom), relative to rect, at time t.
  const line = (t: number, v: number) => {
    const p = ph(t, v);
    return [lerp(rect.left, icon.left, p) - rect.left, lerp(W, icon.width, p), lerp(rect.top + v * H, icon.top + v * icon.height, pv(t, v)) - rect.top];
  };
  const strips: HTMLElement[] = [];
  for (let i = 0; i < N; i++) {
    const s = i === N - 1 ? base : (base.cloneNode(true) as HTMLElement);
    if (s !== base) {
      const a = base.querySelectorAll('canvas'), b = s.querySelectorAll('canvas');
      a.forEach((c, j) => { try { b[j].getContext('2d')?.drawImage(c, 0, 0); } catch { /* blank */ } });
    }
    const y0 = i * hs;
    Object.assign(s.style, {
      position: 'fixed', left: rect.left + 'px', top: rect.top + 'px', width: W + 'px', height: H + 'px',
      margin: '0', transition: 'none', animation: 'none', boxShadow: 'none', visibility: 'visible', opacity: '1',
      // each strip overlaps the next by half a pixel so no seam shows between them
      clipPath: `inset(${y0}px 0 ${Math.max(0, H - y0 - hs - 0.5)}px 0)`, transformOrigin: '0 0', willChange: 'transform',
    });
    s.hidden = false;
    strips.push(s);
    layer.appendChild(s);
  }
  const frame = (t: number) => {
    const op = t > 0.86 ? String(1 - (t - 0.86) / 0.14) : '1';
    let prev = line(t, 0);
    for (let i = 0; i < N; i++) {
      const next = line(t, (i + 1) / N), y0 = i * hs;
      const [tl, tw, ty] = prev, [bl, bw, by] = next;
      // unit square -> destination trapezoid, then pre-compose with the strip's own box (x/W, (y-y0)/hs)
      const [a, b, c, d, e, f, g, h] = square2quad(tl, ty, tl + tw, ty, bl + bw, by, bl, by);
      const A = a / W, B = b / hs, D = d / W, E = e / hs, G = g / W, Hh = h / hs;
      const C = c - B * y0, F = f - E * y0, I = 1 - Hh * y0;
      strips[i].style.transform = `matrix3d(${A},${D},0,${G},${B},${E},0,${Hh},0,0,1,0,${C},${F},0,${I})`;
      strips[i].style.opacity = op;
      prev = next;
    }
  };
  frame(dir === 'in' ? 0 : 1);
  return new Promise<void>((done) => {
    const t0 = performance.now(), ease = dir === 'in' ? EASE_IN : EASE_OUT;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur), e = ease(k);
      frame(dir === 'in' ? e : 1 - e);
      if (k < 1 && layer.isConnected) requestAnimationFrame(step);
      else { layer.remove(); done(); }
    };
    requestAnimationFrame(step);
  });
}
