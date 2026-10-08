'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useMedia';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';

/** Text that "decodes" from random glyphs into place (mockup note ②: 600ms scramble). */
export function Scramble({ text, duration = 600, delay = 0, trigger }: { text: string; duration?: number; delay?: number; trigger?: unknown }) {
  const [out, setOut] = useState(text);
  const reduce = useReducedMotion();
  const first = useRef(true);
  useEffect(() => {
    if (reduce) { setOut(text); return; }
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const k = Math.max(0, (now - start) / duration);
      if (k >= 1) { setOut(text); return; }
      const fixed = Math.floor(text.length * k);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        s += i < fixed || c === ' ' || c === '\n' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      raf = requestAnimationFrame(tick);
    };
    if (first.current || trigger !== undefined) raf = requestAnimationFrame(tick);
    first.current = false;
    return () => cancelAnimationFrame(raf);
  }, [text, duration, delay, trigger, reduce]);
  return <>{out}</>;
}

/** Number that counts up from 0 (mockup note ②). */
export function CountUp({ value, duration = 900, pad = 2 }: { value: number; duration?: number; pad?: number }) {
  const [n, setN] = useState(value);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) { setN(value); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);
  return <>{String(n).padStart(pad, '0')}</>;
}
