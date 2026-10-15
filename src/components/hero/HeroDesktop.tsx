'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Lens } from '@/lib/lens';
import { ACCENT, BODY, BONE, DOTS, INK, KR, LINE, MONO, MONO_KR, MUTED, XRAY } from '@/lib/tokens';
import { Unfold } from './Unfold';
import { Loading } from '../Loading';
import { CountUp, Scramble } from '../Scramble';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

const R = 110; // lensSize default in the mockup

export function HeroDesktop({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('hero');
  const panel = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const xray = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const lens = useRef<Lens | null>(null);
  const tilt = useRef({ tx: 0, ty: 0 });
  const [live, setLive] = useState(false);
  const [cube, setCube] = useState(false);
  const ts = useTranslations('stage');
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);

  const park = (animate: boolean) => {
    const p = panel.current;
    if (!p || !lens.current) return;
    lens.current.park(p.clientWidth / 2 + 104, p.clientHeight / 2 - 70, t('lensIdle'), animate);
  };

  useEffect(() => {
    if (!ring.current || !xray.current) return;
    lens.current = new Lens({ ring: ring.current, clips: [xray.current], label: label.current }, R);
    park(false);
    const ro = new ResizeObserver(() => { if (lens.current && !hovering.current) park(false); });
    if (panel.current) ro.observe(panel.current);
    return () => { ro.disconnect(); lens.current?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hovering = useRef(false);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    hovering.current = true;
    lens.current?.move(mx, my, `X ${String(Math.round(mx)).padStart(4, '0')} · Y ${String(Math.round(my)).padStart(4, '0')}`);
    tilt.current = { tx: (mx / r.width - 0.5) * 16, ty: -(my / r.height - 0.5) * 12 };
    clearTimeout(idle.current);
    if (!live) setLive(true);
  };
  const onLeave = () => {
    hovering.current = false;
    tilt.current = { tx: 0, ty: 0 };
    park(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setLive(false), 700);
  };

  const ls = (en: number, k: number) => `${ko ? k : en}em`;
  const stat = (i: number, v: number, accent = false) => (
    <div style={{ padding: '14px 16px', borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
      <dt style={{ fontSize: ko ? 11 : 10, letterSpacing: ls(0.14, 0.08), color: MUTED }}>{t(`stats.${i}`)}</dt>
      <dd style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 500, color: accent ? ACCENT : undefined }}><CountUp value={v} /></dd>
    </div>
  );
  const xr = (s: string) => s.split('\n').map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>);
  const corner = { position: 'absolute', fontSize: ko ? 11 : 10, letterSpacing: ls(0.14, 0.1), color: MUTED } as const;

  return (
    <section aria-label={t('label')} style={{ padding: '28px 40px 72px', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, fontSize: 11, letterSpacing: '0.14em', color: MUTED, paddingBottom: 20, borderBottom: `1px dashed ${LINE}` }}>
        <span>{t('file')}</span>
        <span><span className="qldot" style={{ color: ACCENT }}>●</span> {t('status')}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, paddingTop: 40, alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', containerType: 'inline-size', gap: 10 }}>
              <Unfold mobile={false} aria={t('unfoldAria')} />
              <span style={{ fontSize: ko ? 12 : 11, letterSpacing: ls(0.14, 0.06), color: MUTED }}>{t('key')}</span>
            </div>
            <h1 style={ko
              ? { margin: 0, fontFamily: KR, fontWeight: 700, fontSize: 46, lineHeight: 1.25, letterSpacing: '-0.05em' }
              : { margin: 0, fontFamily: MONO, fontWeight: 500, fontSize: 46, lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              <Scramble text={t('brand.0')} /><br /><Scramble text={t('brand.1')} delay={120} />
            </h1>
            <p style={ko
              ? { margin: 0, maxWidth: 460, fontFamily: KR, fontSize: 16, lineHeight: 1.8, color: BODY }
              : { margin: 0, maxWidth: 460, fontSize: 15, lineHeight: 1.7, color: BODY }}>{t('body')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a href="#specimens" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 48, padding: '0 22px', background: ACCENT, color: INK, textDecoration: 'none', fontSize: ko ? 14 : 13, fontWeight: 600, letterSpacing: ls(0.08, 0.04) }}>{t('ctaOpen')}</a>
              <a href="#index" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 22px', border: `1px solid ${LINE}`, textDecoration: 'none', fontSize: ko ? 14 : 13, letterSpacing: ls(0.08, 0.04) }}>{t('ctaIndex')}</a>
            </div>
          </div>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE}` }}>
            {stat(0, 5)}{stat(1, 1, true)}{stat(2, 2)}{stat(3, 1)}
          </dl>
        </div>

        <div style={{ flex: '1.35 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div ref={panel} onMouseMove={onMove} onMouseLeave={onLeave} style={{ position: 'relative', height: 620, overflow: 'hidden', border: `1px solid ${LINE}`, cursor: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, background: DOTS }}>
              <div className="qlfloat" style={{ position: 'absolute', inset: 0, opacity: cube ? 1 : 0, transition: 'opacity 600ms ease' }}>
                {enabled && <HeroCanvas layer="shell" tilt={tilt} active={live} perspective={1600} onReady={() => setCube(true)} />}
              </div>
            </div>
            <div ref={xray} aria-hidden="true" style={{ position: 'absolute', inset: 0, clipPath: 'circle(0px at 0 0)', background: XRAY(32) }}>
              <div className="qlfloat" style={{ position: 'absolute', inset: 0, opacity: cube ? 1 : 0, transition: 'opacity 600ms ease' }}>
                {enabled && <HeroCanvas layer="xray" tilt={tilt} active={live} perspective={1600} />}
              </div>
              <div style={{ position: 'absolute', left: '7%', top: '12%', fontSize: 12, lineHeight: 1.7, color: ACCENT, fontFamily: MONO_KR }}>{xr(t('xray.a'))}</div>
              <div style={{ position: 'absolute', right: '7%', top: '16%', fontSize: 12, lineHeight: 1.7, color: ACCENT, textAlign: 'right', fontFamily: MONO_KR }}>{xr(t('xray.b'))}</div>
              <div style={{ position: 'absolute', left: '9%', bottom: '14%', fontSize: 12, lineHeight: 1.7, color: ACCENT, fontFamily: MONO_KR }}>{xr(t('xray.c'))}</div>
              <div style={{ position: 'absolute', right: '8%', bottom: '12%', fontSize: 12, lineHeight: 1.7, color: ACCENT, textAlign: 'right', fontFamily: MONO_KR }}>{xr(t('xray.d'))}</div>
            </div>
            <Loading show={!cube} code="QL-000" label={ts('loading')} />
            <div ref={ring} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: R * 2, height: R * 2, border: `1.5px solid ${ACCENT}`, borderRadius: '50%', pointerEvents: 'none', boxSizing: 'border-box', visibility: 'hidden', willChange: 'transform' }}>
              <div style={{ position: 'absolute', left: '50%', top: -14, bottom: -14, width: 1, background: ACCENT }} />
              <div style={{ position: 'absolute', top: '50%', left: -14, right: -14, height: 1, background: ACCENT }} />
              <div style={{ position: 'absolute', left: '50%', top: '50%', width: 10, height: 10, margin: '-5px 0 0 -5px', border: `1px solid ${ACCENT}`, borderRadius: '50%' }} />
              <div ref={label} style={{ position: 'absolute', left: '50%', top: '100%', marginTop: 22, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, letterSpacing: ls(0.12, 0.1), color: ACCENT, fontFamily: MONO_KR }} />
            </div>
            <div style={{ ...corner, left: 16, top: 14 }}>{t('panel.tl')}</div>
            <div style={{ ...corner, right: 16, top: 14 }}>{t('panel.tr')}</div>
            <div style={{ ...corner, left: 16, bottom: 14 }}>{t('panel.bl')}</div>
            <div style={{ ...corner, right: 16, bottom: 14 }}>{t('panel.br')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
void BONE;
