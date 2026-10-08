'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ACCENT, ARCHIVO, INK, KR } from '@/lib/tokens';
import { Lens } from '@/lib/lens';
import { routing } from '@/i18n/routing';

gsap.registerPlugin(ScrollTrigger);

const WORD = 'QMIN LAB';
const R = 110;

/**
 * Mockup note ⑥: the wordmark rises letter by letter (60ms stagger) when it scrolls in.
 * Per-letter boxes only exist during the reveal; afterwards the plain string is restored so
 * the kerning matches the mockup exactly.
 */
function useReveal(enabled: boolean) {
  const host = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'static' | 'pending' | 'rising'>('static');
  useEffect(() => {
    const el = host.current;
    if (!enabled || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: no reveal
    setPhase('pending');
    let done: ReturnType<typeof setTimeout>;
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => {
        requestAnimationFrame(() => setPhase('rising'));
        done = setTimeout(() => setPhase('static'), 700 + 60 * WORD.length + 50);
      },
    });
    return () => { st.kill(); clearTimeout(done); };
  }, [enabled]);
  const letters = (text: string) => phase === 'static' ? text : text.split('').map((c, i) => (
    <span key={i} style={{ display: 'inline-block', transform: phase === 'rising' ? 'translateY(0)' : 'translateY(105%)', transition: phase === 'rising' ? `transform 700ms cubic-bezier(.2,.7,.2,1) ${i * 60}ms` : 'none' }}>{c === ' ' ? ' ' : c}</span>
  ));
  return { host, letters, clip: phase !== 'static' };
}

function LangLinks() {
  return (
    <>
      {routing.locales.map((l, i) => (
        <span key={l}>{i > 0 && ' / '}<a href={`../${l}/`} style={{ color: INK }}>{l.toUpperCase()}</a></span>
      ))}
    </>
  );
}

export function FooterDesktop({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('contact');
  const { host, letters } = useReveal(enabled);
  const ring = useRef<HTMLDivElement>(null);
  const xray = useRef<HTMLDivElement>(null);
  const lens = useRef<Lens | null>(null);
  useEffect(() => {
    if (!ring.current || !xray.current) return;
    lens.current = new Lens({ ring: ring.current, clips: [xray.current] }, R);
    lens.current.hide();
    return () => lens.current?.dispose();
  }, []);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    lens.current?.move(e.clientX - r.left, e.clientY - r.top);
  };
  const word: React.CSSProperties = { fontFamily: ARCHIVO, fontWeight: 900, fontStretch: '125%', fontSize: '15.2vw', lineHeight: 0.82, letterSpacing: '-0.03em', whiteSpace: 'nowrap' };

  return (
    <footer id="contact" style={{ background: '#ECE8DE', color: INK }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, padding: '72px 40px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: ko ? '0.12em' : '0.16em' }}>{t('eyebrow')}</span>
          <p style={ko
            ? { margin: 0, fontFamily: KR, fontSize: 40, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.04em', maxWidth: 720 }
            : { margin: 0, fontSize: 40, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.03em', maxWidth: 720 }}>{t('title')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, letterSpacing: '0.06em' }}>
          <a href="mailto:hello@qminlab.com" style={{ color: INK, fontSize: 22 }}>hello@qminlab.com</a>
        </div>
      </div>
      <div ref={host} aria-hidden="true" onMouseMove={onMove} onMouseLeave={() => lens.current?.hide()}
        style={{ position: 'relative', padding: '24px 24px 0', overflow: 'hidden', borderTop: `1px solid ${INK}`, cursor: 'none', ...word }}>
        {letters(WORD)}
        {/* x-ray layer: same wordmark, its letters filled with the lab grid */}
        <div ref={xray} style={{ position: 'absolute', inset: 0, padding: '24px 24px 0', clipPath: 'circle(0px at 0 0)', pointerEvents: 'none', background: '#ECE8DE' }}>
          <span style={{ color: 'transparent', WebkitTextStroke: `1.5px ${INK}`, backgroundImage: `linear-gradient(${ACCENT} 1px, transparent 1px), linear-gradient(90deg, ${ACCENT} 1px, transparent 1px)`, backgroundSize: '14px 14px', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>{WORD}</span>
        </div>
        <div ref={ring} style={{ position: 'absolute', left: 0, top: 0, width: R * 2, height: R * 2, border: `1.5px solid ${ACCENT}`, borderRadius: '50%', pointerEvents: 'none', boxSizing: 'border-box', visibility: 'hidden', willChange: 'transform' }}>
          <div style={{ position: 'absolute', left: '50%', top: -14, bottom: -14, width: 1, background: ACCENT }} />
          <div style={{ position: 'absolute', top: '50%', left: -14, right: -14, height: 1, background: ACCENT }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, padding: '20px 40px 28px', fontSize: ko ? 12 : 11, letterSpacing: ko ? '0.08em' : '0.12em' }}>
        <span>{t('copyright')}</span>
        <span>QMINLAB.COM · <LangLinks /></span>
      </div>
    </footer>
  );
}

export function FooterMobile({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('contact');
  const { host, letters, clip } = useReveal(enabled);
  return (
    <footer id="m-contact" style={{ background: '#ECE8DE', color: INK, paddingBottom: 24 }}>
      <div style={{ padding: '48px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={{ fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.1em' : '0.14em' }}>{t('eyebrow')}</span>
        <p style={ko
          ? { margin: 0, fontFamily: KR, fontSize: 25, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.05em' }
          : { margin: 0, fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.03em' }}>{t('title')}</p>
        <a href="mailto:hello@qminlab.com" style={{ display: 'flex', alignItems: 'center', minHeight: 44, color: INK, fontSize: 17 }}>hello@qminlab.com</a>
      </div>
      <div ref={host} aria-hidden="true" style={{ overflow: 'hidden', borderTop: `1px solid ${INK}`, padding: '18px 10px 0', fontFamily: ARCHIVO, fontWeight: 900, fontStretch: '125%', fontSize: 64, lineHeight: 0.85, letterSpacing: '-0.03em', whiteSpace: 'nowrap', clipPath: clip ? 'inset(0)' : undefined }}>{letters(WORD)}</div>
      <div style={{ padding: '18px 16px 0', fontSize: ko ? 11 : 10, letterSpacing: ko ? undefined : '0.1em' }}>© 2026 QMIN LAB · <LangLinks /></div>
    </footer>
  );
}
