'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** A band of the studio's genres that drifts on its own and speeds up and leans with scroll velocity. */
export function Marquee() {
  const t = useTranslations('marquee');
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let x = 0, vel = 0, onScreen = false;
    const st = ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onToggle: (s) => { onScreen = s.isActive; },
      onUpdate: (s) => { vel = s.getVelocity(); },
    });
    const tick = () => {
      if (!onScreen) return;
      x -= 0.6 + Math.min(14, Math.abs(vel) / 220);
      const half = el.scrollWidth / 2;
      if (-x > half) x += half;
      const skew = Math.max(-10, Math.min(10, -vel / 300));
      el.style.transform = `translate3d(${x}px, 0, 0) skewX(${skew}deg)`;
      vel *= 0.9;
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); st.kill(); };
  }, []);
  const words = t.raw('words') as string[];
  const unit = words.map((w, i) => (
    <span key={i} style={{ display: 'contents' }}>
      <span className={/[가-힣]/.test(w) ? 'kr' : undefined}>{w}</span><em><svg viewBox="-12 -12 24 24" width="0.55em" height="0.55em"><g stroke="currentColor" strokeWidth="4" strokeLinecap="square"><path d="M0-11V11M-9.5-5.5L9.5 5.5M-9.5 5.5L9.5-5.5" /></g></svg></em>
    </span>
  ));
  return (
    <div className="qlmarquee" aria-hidden="true">
      <div ref={track} className="qlmarquee-track">{unit}{unit}{unit}{unit}</div>
    </div>
  );
}
