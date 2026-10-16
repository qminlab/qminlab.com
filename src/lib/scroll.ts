import type Lenis from 'lenis';

// The page-wide Lenis instance (set by SmoothScroll). Anything that scrolls the page in code goes through
// scrollToEl so Lenis and native scrolling never fight; with no Lenis (touch, reduced motion) it falls back.
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => { lenis = l; };
export const getLenis = () => lenis;

export function scrollToEl(el: Element | null, opts: { center?: boolean; offset?: number } = {}) {
  if (!el) return;
  if (lenis) {
    const r = el.getBoundingClientRect();
    const offset = opts.center ? -(window.innerHeight - r.height) / 2 : (opts.offset ?? 0);
    lenis.scrollTo(el as HTMLElement, { offset });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: opts.center ? 'center' : 'start' });
  }
}
