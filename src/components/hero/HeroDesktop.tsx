'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { heroCounts, type Project } from '@/lib/projects';
import dynamic from 'next/dynamic';
import { Lens } from '@/lib/lens';
import { ACCENT, BODY, KR, MONO, MONO_KR, MUTED, XRAY } from '@/lib/tokens';
import { Unfold } from './Unfold';
import { Word, useProximity } from './Word';
import { Loading } from '../Loading';
import { CountUp, Scramble } from '../Scramble';
import '@/styles/hero.css';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

const R = 120;

/**
 * Desktop hero (Open Lab): full-bleed "QMIN" whose letters widen/bolden toward the cursor, the WebGL Q cube
 * floating unframed over it, and the scope lens (ring + x-ray clip via src/lib/lens.ts) across the whole hero.
 */
export function HeroDesktop({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('hero');
  const ts = useTranslations('stage');
  const tr = useTranslations();
  const hero = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const xrow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const xray = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const lens = useRef<Lens | null>(null);
  const tilt = useRef({ tx: 0, ty: 0 });
  const hovering = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [live, setLive] = useState(false);
  const [cube, setCube] = useState(false);
  const { spans, point, reset } = useProximity();

  // The lens rests just up-right of the cube centre.
  const park = (animate: boolean) => {
    const r = row.current;
    if (!r || !lens.current) return;
    lens.current.park(r.offsetLeft + r.offsetWidth / 2 + 150, r.offsetTop + r.offsetHeight / 2 - 100, t('lensIdle'), animate);
  };

  // Keep the x-ray copy of the word row exactly over the real one.
  const sync = () => {
    const a = row.current, b = xrow.current;
    if (!a || !b) return;
    b.style.left = `${a.offsetLeft}px`; b.style.top = `${a.offsetTop}px`;
    b.style.width = `${a.offsetWidth}px`; b.style.height = `${a.offsetHeight}px`;
  };

  useLayoutEffect(sync, []);
  useEffect(() => {
    if (!ring.current || !xray.current) return;
    lens.current = new Lens({ ring: ring.current, clips: [xray.current], label: label.current }, R);
    park(false);
    const ro = new ResizeObserver(() => { sync(); if (lens.current && !hovering.current) park(false); });
    if (hero.current) ro.observe(hero.current);
    if (row.current) ro.observe(row.current);
    return () => { ro.disconnect(); lens.current?.dispose(); clearTimeout(idle.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    hovering.current = true;
    // Over the buttons the scope steps aside so the real cursor can click them.
    if ((e.target as HTMLElement).closest?.('a, button')) lens.current?.hide();
    else lens.current?.move(mx, my, `X ${String(Math.round(mx)).padStart(4, '0')} · Y ${String(Math.round(my)).padStart(4, '0')}`);
    tilt.current = { tx: (mx / r.width - 0.5) * 16, ty: -(my / r.height - 0.5) * 12 };
    point(e.clientX);
    clearTimeout(idle.current);
    if (!live) setLive(true);
  };
  const onLeave = () => {
    hovering.current = false;
    tilt.current = { tx: 0, ty: 0 };
    reset();
    park(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setLive(false), 700);
  };

  const ls = (en: number, k: number) => `${ko ? k : en}em`;
  const stats = t.raw('stats') as string[];
  const vals = heroCounts(tr.raw('projects') as Project[]);

  return (
    <section ref={hero} aria-label={t('label')} className="qh qh-d" onMouseMove={onMove} onMouseLeave={onLeave} style={{ fontFamily: ko ? MONO_KR : MONO }}>
      <div className="qh-top" style={{ letterSpacing: ls(0.12, 0.08) }}>
        <span>{t('file')}</span>
        <span>
          <span className="qldot" style={{ color: ACCENT }}>●</span> {t('status')}
          {stats.map((s, i) => (
            <span key={s}>{'  ·  '}{s} <span style={{ color: i === 1 ? ACCENT : undefined }}><CountUp value={vals[i]} /></span></span>
          ))}
        </span>
      </div>

      <div ref={row} className="qh-wordrow">
        <Word spans={spans} />
        <div className="qh-cube" aria-hidden="true">
          <div className="qh-fade qlfloat" style={{ opacity: cube ? 1 : 0 }}>
            {enabled && <HeroCanvas layer="shell" tilt={tilt} active={live} perspective={1600} onReady={() => setCube(true)} />}
          </div>
          <Loading show={!cube} code="QL-000" label={ts('loading')} />
        </div>
      </div>

      <div className="qh-foot">
        <h1 className="qh-brand" style={ko
          ? { fontFamily: KR, fontWeight: 700, fontSize: 'clamp(34px, 3.6vw, 56px)', lineHeight: 1.2, letterSpacing: '-0.05em' }
          : { fontFamily: MONO, fontWeight: 500, fontSize: 'clamp(32px, 3.4vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
          <Scramble text={t('brand.0')} /><br /><Scramble text={t('brand.1')} delay={120} />
        </h1>
        <div className="qh-side">
          <Unfold mobile={false} aria={t('unfoldAria')} />
          <span style={{ fontSize: ko ? 12 : 11, letterSpacing: ls(0.12, 0.04), color: MUTED }}>{t('key')}</span>
          <p style={ko
            ? { margin: 0, fontFamily: KR, fontSize: 15, lineHeight: 1.75, color: BODY }
            : { margin: 0, fontSize: 14, lineHeight: 1.7, color: BODY }}>{t('body')}</p>
          <div className="qh-ctas">
            <a href="#specimens" className="qh-cta" style={{ fontSize: ko ? 14 : 13, letterSpacing: ls(0.06, 0.02) }}>{t('ctaOpen')}</a>
            <a href="#index" className="qh-sec" style={{ fontSize: ko ? 14 : 13, letterSpacing: ls(0.06, 0.02) }}>{t('ctaIndex')}</a>
          </div>
        </div>
      </div>

      <div ref={xray} className="qh-xray" aria-hidden="true" style={{ background: XRAY(34), fontFamily: MONO_KR }}>
        <div ref={xrow} className="qh-wordrow">
          <Word xray spans={spans} offset={4} />
          <div className="qh-cube">
            <div className="qh-fade qlfloat" style={{ opacity: cube ? 1 : 0 }}>
              {enabled && <HeroCanvas layer="xray" tilt={tilt} active={live} perspective={1600} />}
            </div>
          </div>
        </div>
        <div className="qh-note" style={{ left: '6%', top: '15%' }}>{t('xray.a')}</div>
        <div className="qh-note" style={{ right: '6%', top: '17%', textAlign: 'right' }}>{t('xray.b')}</div>
        <div className="qh-note" style={{ left: '7%', bottom: '9%' }}>{t('xray.c')}</div>
        <div className="qh-note" style={{ right: '7%', bottom: '7%', textAlign: 'right' }}>{t('xray.d')}</div>
      </div>

      <div ref={ring} className="qh-ring" aria-hidden="true" style={{ width: R * 2, height: R * 2 }}>
        <i style={{ left: '50%', top: -14, bottom: -14, width: 1 }} />
        <i style={{ top: '50%', left: -14, right: -14, height: 1 }} />
        <i style={{ left: '50%', top: '50%', width: 10, height: 10, margin: '-5px 0 0 -5px', background: 'transparent', border: `1px solid ${ACCENT}`, borderRadius: '50%' }} />
        <span ref={label} style={{ position: 'absolute', left: '50%', top: '100%', marginTop: 22, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, letterSpacing: ls(0.12, 0.1), color: ACCENT, fontFamily: MONO_KR }} />
      </div>
    </section>
  );
}
