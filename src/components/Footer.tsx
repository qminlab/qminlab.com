'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ACCENT, ARCHIVO, INK, KR } from '@/lib/tokens';
import { GITHUB } from '@/lib/links';
import { Lens } from '@/lib/lens';
import { routing } from '@/i18n/routing';
import { useLiquidWord } from './LiquidWord';

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
  const { host, letters, clip } = useReveal(enabled);
  // Under the lens the wordmark turns to liquid metal; only built once the letters have settled.
  const metal = useLiquidWord(host, enabled && !clip, '#ECE8DE');
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
    metal.setActive(true);
  };
  const word: React.CSSProperties = { fontFamily: ARCHIVO, fontWeight: 900, fontStretch: '125%', fontSize: '15.2vw', lineHeight: 0.82, letterSpacing: '-0.03em', whiteSpace: 'nowrap' };

  return (
    <footer id="contact" style={{ background: '#ECE8DE', color: INK }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, padding: '120px 40px 56px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: ko ? '0.12em' : '0.16em' }}>{t('eyebrow')}</span>
          <p style={ko
            ? { margin: 0, fontFamily: KR, fontSize: 'clamp(40px, 4.4vw, 64px)', fontWeight: 700, lineHeight: 1.18, letterSpacing: '-0.05em', maxWidth: '13em', textWrap: 'balance', wordBreak: 'keep-all' }
            : { margin: 0, fontSize: 'clamp(40px, 4.4vw, 64px)', fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: '14em', textWrap: 'balance' }}>{t('title')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, letterSpacing: '0.06em' }}>
          <a href="mailto:hello@qminlab.com" className="qlpress" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 56, padding: '0 26px', borderRadius: 999, background: INK, color: '#ECE8DE', fontSize: 18, textDecoration: 'none' }}>hello@qminlab.com ↗</a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" style={{ color: INK, fontSize: 15, alignSelf: 'flex-end' }}>github.com/starMinK ↗</a>
        </div>
      </div>
      <div ref={host} aria-hidden="true" onMouseMove={onMove} onMouseLeave={() => { lens.current?.hide(); metal.setActive(false); }}
        style={{ position: 'relative', padding: '24px 24px 0', overflow: 'hidden', borderTop: `1px solid ${INK}`, cursor: 'none', ...word }}>
        {letters(WORD)}
        {/* x-ray layer: same wordmark, its letters filled with the lab grid */}
        <div ref={xray} style={{ position: 'absolute', inset: 0, padding: '24px 24px 0', clipPath: 'circle(0px at 0 0)', pointerEvents: 'none', background: '#ECE8DE' }}>
          <span style={{ color: 'transparent', WebkitTextStroke: `1.5px ${INK}`, backgroundImage: `linear-gradient(${ACCENT} 1px, transparent 1px), linear-gradient(90deg, ${ACCENT} 1px, transparent 1px)`, backgroundSize: '14px 14px', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>{WORD}</span>
          <div ref={metal.mount} style={{ position: 'absolute', inset: 0 }} />
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
  // No lens on phones, so the whole wordmark turns to liquid metal once it has risen into place.
  const metal = useLiquidWord(host, enabled && !clip, '#ECE8DE');
  useEffect(() => { metal.setActive(true); }, [metal]);
  return (
    <footer id="m-contact" style={{ background: '#ECE8DE', color: INK, paddingBottom: 24 }}>
      <div style={{ padding: '72px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.1em' : '0.14em' }}>{t('eyebrow')}</span>
        <p style={ko
          ? { margin: 0, fontFamily: KR, fontSize: 34, fontWeight: 700, lineHeight: 1.22, letterSpacing: '-0.05em', wordBreak: 'keep-all' }
          : { margin: 0, fontSize: 34, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.04em' }}>{t('title')}</p>
        <a href="mailto:hello@qminlab.com" className="qlpress" style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', minHeight: 52, padding: '0 22px', borderRadius: 999, background: INK, color: '#ECE8DE', fontSize: 16, textDecoration: 'none', marginTop: 8 }}>hello@qminlab.com ↗</a>
        <a href={GITHUB} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', minHeight: 44, color: INK, fontSize: 14 }}>github.com/starMinK ↗</a>
      </div>
      <div ref={host} aria-hidden="true" style={{ position: 'relative', overflow: 'hidden', borderTop: `1px solid ${INK}`, padding: '18px 10px 0', fontFamily: ARCHIVO, fontWeight: 900, fontStretch: '125%', fontSize: 'calc(15.2vw - 2px)', lineHeight: 0.85, letterSpacing: '-0.03em', whiteSpace: 'nowrap', clipPath: clip ? 'inset(0)' : undefined }}>
        {letters(WORD)}
        <div ref={metal.mount} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      </div>
      <div style={{ padding: '18px 16px 0', fontSize: ko ? 11 : 10, letterSpacing: ko ? undefined : '0.1em' }}>© 2026 QMIN LAB · <LangLinks /></div>
    </footer>
  );
}
