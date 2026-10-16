'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Lens } from '@/lib/lens';
import { ACCENT, BODY, KR, MONO, MONO_KR, MUTED, XRAY } from '@/lib/tokens';
import { Unfold } from './Unfold';
import { Word } from './Word';
import { Loading } from '../Loading';
import { CountUp, Scramble } from '../Scramble';
import '@/styles/hero.css';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

const R = 84;
const LIFT = 90;

/**
 * Mobile hero: the same composition stacked. Press and hold anywhere on the hero (not on a link or the
 * Unfold mark), then drag; the lens floats 90px above the finger. A plain swipe still scrolls the page.
 */
export function HeroMobile({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('hero');
  const ts = useTranslations('stage');
  const hero = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const xrow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const xray = useRef<HTMLDivElement>(null);
  const finger = useRef<HTMLDivElement>(null);
  const lens = useRef<Lens | null>(null);
  const spans = useRef<HTMLSpanElement[]>([]);
  const [dragging, setDragging] = useState(false);
  const [cube, setCube] = useState(false);
  const drag = useRef({ id: -1, x0: 0, y0: 0, on: false, timer: 0 as unknown as ReturnType<typeof setTimeout> });

  const park = () => {
    const r = row.current;
    if (r && lens.current) lens.current.park(r.offsetLeft + r.offsetWidth / 2 + 70, r.offsetTop + r.offsetHeight / 2 - 30, undefined, false, false);
  };
  const sync = () => {
    const a = row.current, b = xrow.current;
    if (!a || !b) return;
    b.style.left = `${a.offsetLeft}px`; b.style.top = `${a.offsetTop}px`;
    b.style.width = `${a.offsetWidth}px`; b.style.height = `${a.offsetHeight}px`;
  };
  useLayoutEffect(sync, []);
  useEffect(() => {
    if (!ring.current || !xray.current) return;
    lens.current = new Lens({ ring: ring.current, clips: [xray.current] }, R);
    park();
    const ro = new ResizeObserver(() => { sync(); if (!drag.current.on) park(); });
    if (hero.current) ro.observe(hero.current);
    if (row.current) ro.observe(row.current);
    // While the lens is out the page must not scroll under the finger.
    const el = hero.current;
    const block = (ev: TouchEvent) => { if (drag.current.on) ev.preventDefault(); };
    el?.addEventListener('touchmove', block, { passive: false });
    return () => { ro.disconnect(); el?.removeEventListener('touchmove', block); lens.current?.dispose(); clearTimeout(drag.current.timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const local = (e: { clientX: number; clientY: number }) => {
    const r = hero.current!.getBoundingClientRect();
    return { mx: e.clientX - r.left, my: e.clientY - r.top };
  };
  const show = (mx: number, my: number) => {
    lens.current?.move(mx, Math.max(R, my - LIFT));
    if (finger.current) finger.current.style.transform = `translate3d(${mx - 22}px, ${my - 22}px, 0)`;
  };
  const onDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Links and the Unfold mark keep their own taps.
    if ((e.target as Element).closest('a, button')) return;
    const d = drag.current;
    d.id = e.pointerId; d.x0 = e.clientX; d.y0 = e.clientY;
    clearTimeout(d.timer);
    const p = local(e);
    // Mouse drags start at once; touch waits for a hold so a normal swipe still scrolls the page.
    const start = () => { d.on = true; setDragging(true); show(p.mx, p.my); try { hero.current?.setPointerCapture(d.id); } catch {} };
    if (e.pointerType === 'mouse') start(); else d.timer = setTimeout(start, 280);
  };
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (e.pointerId !== d.id) return;
    if (d.on) { const p = local(e); show(p.mx, p.my); return; }
    if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 10) clearTimeout(d.timer);
  };
  const onUp = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (e.pointerId !== d.id) return;
    clearTimeout(d.timer);
    if (d.on) { d.on = false; setDragging(false); park(); }
    d.id = -1;
  };

  const stats = t.raw('stats') as string[];
  const vals = [5, 1, 2, 1];

  return (
    <section ref={hero} aria-label={t('label')} className="qh qh-m"
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      onContextMenu={(e) => { if (!(e.target as Element).closest('a')) e.preventDefault(); }}
      style={{ fontFamily: ko ? MONO_KR : MONO }}>
      <div className="qh-top" style={{ letterSpacing: ko ? '0.06em' : undefined }}>
        <span>{t('fileMobile')}</span>
        <span><span className="qldot" style={{ color: ACCENT }}>●</span> {t('statusMobile')}</span>
      </div>

      <div ref={row} className="qh-wordrow">
        <Word spans={spans} />
        <div className="qh-cube" aria-hidden="true">
          <div className="qh-fade qlfloatm" style={{ opacity: cube ? 1 : 0 }}>
            {enabled && <HeroCanvas layer="shell" active={false} perspective={1400} mobile onReady={() => setCube(true)} />}
          </div>
        </div>
        <Loading show={!cube} code="QL-000" label={ts('loading')} />
        <div className="qh-hint" style={{ letterSpacing: ko ? '0.04em' : '0.1em' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="6" cy="6" r="4.5" /><path d="M6 0v3M6 9v3M0 6h3M9 6h3" /></svg>
          {dragging ? t('hintDrag') : t('hintIdle')}
        </div>
      </div>

      <div className="qh-foot">
        <h1 className="qh-brand" style={ko
          ? { fontFamily: KR, fontWeight: 700, fontSize: 34, lineHeight: 1.25, letterSpacing: '-0.06em' }
          : { fontWeight: 500, fontSize: 32, lineHeight: 1.12, letterSpacing: '-0.04em' }}>
          <Scramble text={t('brand.0')} /><br /><Scramble text={t('brand.1')} delay={120} />
        </h1>
        <div className="qh-side">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', flexDirection: 'column', containerType: 'inline-size', maxWidth: 270 }}><Unfold mobile aria={t('unfoldAria')} /></div>
            <span style={{ fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.04em' : '0.12em', color: MUTED }}>{t('keyMobile')}</span>
          </div>
          <p style={ko
            ? { margin: 0, fontFamily: KR, fontSize: 15, lineHeight: 1.75, color: BODY }
            : { margin: 0, fontSize: 14, lineHeight: 1.7, color: BODY }}>{t('bodyMobile')}</p>
          <div className="qh-ctas">
            <a href="#specimens" className="qh-cta" style={{ fontSize: ko ? 14 : 13, letterSpacing: ko ? '0.02em' : '0.06em' }}>{t('ctaOpen')}</a>
            <a href="#index" className="qh-sec" style={{ fontSize: ko ? 14 : 13, letterSpacing: ko ? '0.02em' : '0.06em' }}>{t('ctaIndex')}</a>
          </div>
          <div style={{ fontSize: 10, letterSpacing: ko ? '0.04em' : '0.1em', color: MUTED, lineHeight: 1.6 }}>
            {stats.map((s, i) => (
              <span key={s} style={{ whiteSpace: 'nowrap' }}>{i > 0 && '  ·  '}{s} <span style={{ color: i === 1 ? ACCENT : undefined }}><CountUp value={vals[i]} /></span></span>
            ))}
          </div>
        </div>
      </div>

      <div ref={xray} className="qh-xray" aria-hidden="true" style={{ background: XRAY(28), fontFamily: MONO_KR }}>
        <div ref={xrow} className="qh-wordrow">
          <Word xray spans={spans} offset={4} />
          <div className="qh-cube">
            <div className="qh-fade qlfloatm" style={{ opacity: cube ? 1 : 0 }}>
              {enabled && <HeroCanvas layer="xray" active={false} perspective={1400} mobile />}
            </div>
          </div>
          <div className="qh-note" style={{ left: 0, top: 0 }}>{t('xray.mA')}</div>
          <div className="qh-note" style={{ right: 0, bottom: 0, textAlign: 'right' }}>{t('xray.mB')}</div>
        </div>
      </div>

      <div ref={ring} className="qh-ring" aria-hidden="true" style={{ width: R * 2, height: R * 2 }}>
        <i style={{ left: '50%', top: -10, bottom: -10, width: 1 }} />
        <i style={{ top: '50%', left: -10, right: -10, height: 1 }} />
      </div>
      <div ref={finger} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, zIndex: 5, width: 44, height: 44, borderRadius: '50%', border: `1px dashed ${MUTED}`, pointerEvents: 'none', boxSizing: 'border-box', display: dragging ? 'block' : 'none' }} />
    </section>
  );
}
