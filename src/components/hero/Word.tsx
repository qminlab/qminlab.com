'use client';
import { forwardRef, useCallback, useRef } from 'react';

export const LETTERS = ['Q', 'M', 'I', 'N'] as const;

/**
 * The giant "QMIN" word (Archivo variable). `xray` draws it as an orange outline for the lens layer.
 * Letter spans are exposed through `spans` so the proximity effect can drive both copies in one pass.
 */
export const Word = forwardRef<HTMLDivElement, { xray?: boolean; spans: React.RefObject<HTMLSpanElement[]>; offset?: number }>(
  function Word({ xray, spans, offset = 0 }, ref) {
    return (
      <div ref={ref} className={xray ? 'qh-word qh-word-x' : 'qh-word'} aria-hidden={xray ? true : undefined} aria-label={xray ? undefined : 'QMIN'} role={xray ? undefined : 'img'}>
        {LETTERS.map((l, i) => (
          <span key={l} ref={(el) => { if (el) spans.current[offset + i] = el; }}>{l}</span>
        ))}
      </div>
    );
  },
);

/**
 * Cursor proximity → font-variation-settings (mockup: closest letter widest/boldest).
 * wdth 62→125, wght 300→900; CSS transitions the change over 600ms ease-out. Disabled under reduced motion.
 */
export function useProximity() {
  const spans = useRef<HTMLSpanElement[]>([]);
  const reduce = useRef<boolean | null>(null);
  const isReduced = () => {
    if (reduce.current === null) reduce.current = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduce.current;
  };
  const point = useCallback((clientX: number) => {
    if (isReduced()) return;
    const all = spans.current;
    const n = LETTERS.length;
    const vw = window.innerWidth;
    // Read every centre first, then write, so the loop causes one layout instead of four.
    const cx = all.slice(0, n).map((el) => { if (!el) return NaN; const r = el.getBoundingClientRect(); return r.left + r.width / 2; });
    for (let i = 0; i < n; i++) {
      const el = all[i];
      if (!el) continue;
      const d = Math.abs(clientX - cx[i]) / vw;
      const k = Math.max(0, 1 - d * 2.6);
      const v = `"wdth" ${Math.round(62 + 63 * k)}, "wght" ${Math.round(300 + 600 * k)}`;
      el.style.fontVariationSettings = v;
      const twin = all[i + n];
      if (twin) twin.style.fontVariationSettings = v;
    }
  }, []);
  const reset = useCallback(() => { spans.current.forEach((el) => { if (el) el.style.fontVariationSettings = ''; }); }, []);
  return { spans, point, reset };
}
