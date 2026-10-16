'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenis } from '@/lib/scroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * Inertia scroll for wheel and trackpad (Lenis). Touch keeps native scrolling, so phones scroll exactly as
 * before; reduced motion turns it off entirely. ScrollTrigger is driven from Lenis' own frames so pinned
 * sections stay in step.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // In-page links glide through Lenis too (landing below the floating header).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"]');
      const id = a?.getAttribute('href')?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === 'top' || id === 'mtop' ? 0 : -64 });
    };
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('click', onClick); gsap.ticker.remove(raf); lenis.destroy(); setLenis(null); };
  }, []);
  return null;
}
