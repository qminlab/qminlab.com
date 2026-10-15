'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Lens } from '@/lib/lens';
import { ACCENT, BODY, DOTS_M, INK, KR, LINE, MONO_KR, MUTED, XRAY } from '@/lib/tokens';
import { Unfold } from './Unfold';
import { Loading } from '../Loading';
import { CountUp, Scramble } from '../Scramble';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

const R = 84;
const LIFT = 90;

/** Mobile hero (MobileEN/KO boards): press and hold the panel, then drag; the lens floats 90px above the finger. */
export function HeroMobile({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('hero');
  const panel = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const xray = useRef<HTMLDivElement>(null);
  const finger = useRef<HTMLDivElement>(null);
  const lens = useRef<Lens | null>(null);
  const [dragging, setDragging] = useState(false);
  const [cube, setCube] = useState(false);
  const ts = useTranslations('stage');
  const drag = useRef({ id: -1, x0: 0, y0: 0, on: false, timer: 0 as unknown as ReturnType<typeof setTimeout> });

  const park = () => {
    const p = panel.current;
    if (p && lens.current) lens.current.park(p.clientWidth / 2 + 70, p.clientHeight / 2 - 56, undefined, false, false);
  };
  useEffect(() => {
    if (!ring.current || !xray.current) return;
    lens.current = new Lens({ ring: ring.current, clips: [xray.current] }, R);
    park();
    const ro = new ResizeObserver(() => { if (!drag.current.on) park(); });
    if (panel.current) ro.observe(panel.current);
    // While the lens is out the page must not scroll under the finger.
    const el = panel.current;
    const block = (ev: TouchEvent) => { if (drag.current.on) ev.preventDefault(); };
    el?.addEventListener('touchmove', block, { passive: false });
    return () => { ro.disconnect(); el?.removeEventListener('touchmove', block); lens.current?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const local = (e: { clientX: number; clientY: number }) => {
    const r = panel.current!.getBoundingClientRect();
    return { mx: e.clientX - r.left, my: e.clientY - r.top };
  };
  const show = (mx: number, my: number) => {
    lens.current?.move(mx, Math.max(R, my - LIFT));
    if (finger.current) finger.current.style.transform = `translate3d(${mx - 22}px, ${my - 22}px, 0)`;
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const d = drag.current;
    d.id = e.pointerId; d.x0 = e.clientX; d.y0 = e.clientY;
    clearTimeout(d.timer);
    const p = local(e);
    // Mouse drags start at once; touch waits for a hold so a normal swipe still scrolls the page.
    const start = () => { d.on = true; setDragging(true); show(p.mx, p.my); try { panel.current?.setPointerCapture(d.id); } catch {} };
    if (e.pointerType === 'mouse') start(); else d.timer = setTimeout(start, 280);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (e.pointerId !== d.id) return;
    if (d.on) { const p = local(e); show(p.mx, p.my); return; }
    if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 10) clearTimeout(d.timer);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (e.pointerId !== d.id) return;
    clearTimeout(d.timer);
    if (d.on) { d.on = false; setDragging(false); park(); }
    d.id = -1;
  };

  const xr = (s: string) => s.split('\n').map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>);
  const stats = t.raw('stats') as string[];
  const vals = [5, 1, 2, 1];

  return (
    <section aria-label={t('label')} style={{ padding: '18px 16px 48px', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: ko ? '0.1em' : '0.12em', color: MUTED, paddingBottom: 14, borderBottom: `1px dashed ${LINE}` }}>
        <span>{t('fileMobile')}</span>
        <span><span className="qldot" style={{ color: ACCENT }}>●</span> {t('statusMobile')}</span>
      </div>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', containerType: 'inline-size', gap: 8 }}>
        <Unfold mobile aria={t('unfoldAria')} />
        <span style={{ fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.04em' : '0.12em', color: MUTED }}>{t('keyMobile')}</span>
      </div>
      <h1 style={ko
        ? { margin: '22px 0 0', fontFamily: KR, fontWeight: 700, fontSize: 34, lineHeight: 1.25, letterSpacing: '-0.06em' }
        : { margin: '22px 0 0', fontWeight: 500, fontSize: 32, lineHeight: 1.12, letterSpacing: '-0.04em' }}>
        <Scramble text={t('brand.0')} /><br /><Scramble text={t('brand.1')} delay={120} />
      </h1>
      <p style={ko
        ? { margin: '16px 0 0', fontFamily: KR, fontSize: 15, lineHeight: 1.75, color: BODY }
        : { margin: '18px 0 0', fontSize: 14, lineHeight: 1.7, color: BODY }}>{t('bodyMobile')}</p>

      <div ref={panel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{ position: 'relative', marginTop: 24, height: 400, overflow: 'hidden', border: `1px solid ${LINE}`, touchAction: 'pan-y', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: DOTS_M }}>
          <div className="qlfloat" style={{ position: 'absolute', inset: 0, opacity: cube ? 1 : 0, transition: 'opacity 600ms ease' }}>
            {enabled && <HeroCanvas layer="shell" active={false} perspective={1400} mobile onReady={() => setCube(true)} />}
          </div>
        </div>
        <div ref={xray} aria-hidden="true" style={{ position: 'absolute', inset: 0, clipPath: 'circle(0px at 0 0)', background: XRAY(28) }}>
          <div className="qlfloat" style={{ position: 'absolute', inset: 0, opacity: cube ? 1 : 0, transition: 'opacity 600ms ease' }}>
            {enabled && <HeroCanvas layer="xray" active={false} perspective={1400} mobile />}
          </div>
          <div style={{ position: 'absolute', left: 14, top: 40, fontSize: 11, lineHeight: 1.6, color: ACCENT, fontFamily: MONO_KR }}>{xr(t('xray.mA'))}</div>
          <div style={{ position: 'absolute', right: 14, bottom: 44, fontSize: 11, lineHeight: 1.6, color: ACCENT, textAlign: 'right', fontFamily: MONO_KR }}>{xr(t('xray.mB'))}</div>
        </div>
        <Loading show={!cube} code="QL-000" label={ts('loading')} />
        <div ref={ring} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: R * 2, height: R * 2, border: `1.5px solid ${ACCENT}`, borderRadius: '50%', pointerEvents: 'none', boxSizing: 'border-box', visibility: 'hidden', willChange: 'transform' }}>
          <div style={{ position: 'absolute', left: '50%', top: -10, bottom: -10, width: 1, background: ACCENT }} />
          <div style={{ position: 'absolute', top: '50%', left: -10, right: -10, height: 1, background: ACCENT }} />
        </div>
        <div ref={finger} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: 44, height: 44, borderRadius: '50%', border: `1px dashed ${MUTED}`, pointerEvents: 'none', boxSizing: 'border-box', display: dragging ? 'block' : 'none' }} />
        <div style={{ position: 'absolute', left: 12, top: 12, fontSize: 10, letterSpacing: ko ? '0.1em' : '0.12em', color: MUTED }}>{t('panel.mobile')}</div>
        <div style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: `1px solid ${LINE}`, background: INK, fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.06em' : '0.12em', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="6" cy="6" r="4.5" /><path d="M6 0v3M6 9v3M0 6h3M9 6h3" /></svg>
          {dragging ? t('hintDrag') : t('hintIdle')}
        </div>
      </div>

      <dl style={{ margin: '20px 0 0', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE}` }}>
        {stats.map((s, i) => (
          <div key={s} style={{ padding: '12px 14px', borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
            <dt style={{ fontSize: ko ? 11 : 10, letterSpacing: ko ? undefined : '0.12em', color: MUTED }}>{s}</dt>
            <dd style={{ margin: '4px 0 0', fontSize: 24, color: i === 1 ? ACCENT : undefined }}><CountUp value={vals[i]} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
