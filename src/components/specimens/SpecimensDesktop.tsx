'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ACCENT, BODY, BONE, DOTS, KR, LINE, MUTED, EASE_SWAP, pill } from '@/lib/tokens';
import type { Project } from '@/lib/projects';
import { Scramble } from '../Scramble';
import { SpecimenStage } from './SpecimenStage';

gsap.registerPlugin(ScrollTrigger);

export function SpecimensDesktop({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('specimens');
  const tt = useTranslations();
  const projects = tt.raw('projects') as Project[];
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  stepRef.current = step;
  const column = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ScrollTrigger watches the description column; the spacer whose centre is nearest the viewport
  // middle is the current step (same rule as the mockup). One `step` drives model, text and markers.
  useEffect(() => {
    const col = column.current;
    if (!col) return;
    const pick = () => {
      if (lock.current) {
        clearTimeout(idle.current);
        idle.current = setTimeout(() => { lock.current = false; }, 160);
        return;
      }
      const els = col.querySelectorAll<HTMLElement>('[data-step]');
      const mid = window.innerHeight * 0.5;
      let best = stepRef.current, bd = Infinity;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < bd) { bd = d; best = Number(el.dataset.step); }
      });
      if (best !== stepRef.current) setStep(best);
    };
    const st = ScrollTrigger.create({ trigger: col, start: 'top bottom', end: 'bottom top', onUpdate: pick, onRefresh: pick });
    return () => { st.kill(); clearTimeout(idle.current); };
  }, []);

  const goStep = (i: number) => {
    setStep(i);
    lock.current = true;
    clearTimeout(idle.current);
    idle.current = setTimeout(() => { lock.current = false; }, 1200);
    column.current?.querySelector(`[data-step="${i}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cur = projects[step];
  const f = (en: number, k: number) => (ko ? k : en);
  const bar = { display: 'flex', justifyContent: 'space-between', padding: '14px 16px', fontSize: f(10, 11), letterSpacing: `${f(0.14, 0.1)}em`, color: MUTED } as const;

  return (
    // The stage fills the window below the sticky header (never shorter than the mockup's 660px), so a tall
    // window shows no empty band under it. Scroll distance per specimen grows with it to keep the pacing.
    <section id="specimens" aria-label={t('label')} style={{ padding: '72px 40px 40px', borderBottom: `1px solid ${LINE}`, ['--stage-h' as string]: 'max(660px, calc(100vh - 104px))' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, paddingBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 11, letterSpacing: `${f(0.16, 0.12)}em`, color: ACCENT }}>{t('eyebrow')}</span>
          <h2 style={ko ? { margin: 0, fontFamily: KR, fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em' } : { margin: 0, fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em' }}>{t('title')}</h2>
        </div>
        <p style={ko ? { margin: 0, maxWidth: 400, fontFamily: KR, fontSize: 14, lineHeight: 1.8, color: MUTED } : { margin: 0, maxWidth: 380, fontSize: 13, lineHeight: 1.7, color: MUTED }}>{t('intro')}</p>
      </div>

      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 520px', minWidth: 0, position: 'sticky', top: 84, height: 'var(--stage-h)', border: `1px solid ${LINE}`, background: DOTS, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...bar, borderBottom: `1px solid ${LINE}` }}>
            <span>{t('stage')} / {cur.code}</span>
            <span>{t('form')}: <span style={{ color: ACCENT }}><Scramble text={cur.form} trigger={step} duration={500} /></span></span>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <SpecimenStage step={step} ko={ko} mobile={false} enabled={enabled} />
          </div>
          <div style={{ ...bar, alignItems: 'center', borderTop: `1px solid ${LINE}` }}>
            <span><Scramble text={cur.dims} trigger={step} duration={500} /></span>
            <div style={{ display: 'flex', gap: 6 }}>
              {projects.map((p, i) => (
                <button key={p.code} type="button" onClick={() => goStep(i)} aria-label={`${t('stepAria')} ${p.code}`} aria-current={i === step ? 'step' : undefined}
                  style={{ width: 44, height: 28, padding: 0, border: `1px solid ${LINE}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ display: 'block', width: 28, height: 4, background: i === step ? ACCENT : LINE, transition: 'background 300ms ease' }} />
                </button>
              ))}
            </div>
            <span>{`0${step + 1} / 0${projects.length}`}</span>
          </div>
        </div>

        <div ref={column} style={{ flex: '1 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* The sticky panel lives in a layer exactly as tall as the column, so it stops level with the
              stage instead of sliding 660px into the registry (the mockup's negative margin let it overflow). */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <div aria-live="polite" style={{ position: 'sticky', top: 84, height: 'var(--stage-h)', overflow: 'hidden' }}>
            {projects.map((p, i) => {
              const on = i === step;
              const pl = pill(p.st);
              return (
                <article key={p.code} aria-hidden={!on} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '40px 0', opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : i < step ? -28 : 28}px)`, pointerEvents: on ? 'auto' : 'none', transition: `opacity 600ms ease, transform 900ms ${EASE_SWAP}` }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, fontSize: f(11, 12), letterSpacing: `${f(0.14, 0.1)}em` }}>
                    <span style={{ color: MUTED }}>{p.code}</span><span style={{ color: MUTED }}>/</span><span style={{ color: MUTED }}>{tt(`types.${p.type}`)}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 10px', border: `1px solid ${pl.bd}`, background: pl.bg, color: pl.fg }}>
                      <span className={p.st === 'paused' ? undefined : 'qldot'}>{p.st === 'paused' ? '❚❚' : '●'}</span>{tt(`status.${p.st}`)}
                    </span>
                  </div>
                  <h3 style={ko
                    ? { margin: 0, fontFamily: KR, fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.05em', color: p.st === 'paused' ? MUTED : BONE }
                    : { margin: 0, fontSize: 64, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.04em', color: p.st === 'paused' ? MUTED : BONE }}>{p.name}</h3>
                  <p style={ko ? { margin: 0, maxWidth: 520, fontFamily: KR, fontSize: 17, lineHeight: 1.8, color: BODY } : { margin: 0, maxWidth: 520, fontSize: 16, lineHeight: 1.7, color: BODY }}>{p.one}</p>
                  {p.tip && <span style={{ fontSize: f(11, 12), letterSpacing: `${f(0.12, 0.04)}em`, color: ACCENT }}>{p.tip}</span>}
                  <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 24, borderTop: `1px solid ${LINE}` }}>
                    {(['platform', 'stage', 'stack'] as const).map((k) => (
                      <div key={k} style={{ gridColumn: k === 'stack' ? '1 / -1' : undefined, padding: '12px 0', borderBottom: `1px solid ${LINE}` }}>
                        <dt style={{ fontSize: f(10, 11), letterSpacing: `${f(0.14, 0.08)}em`, color: MUTED }}>{t(`fields.${k}`)}</dt>
                        <dd style={{ margin: '4px 0 0', fontSize: f(13, 14), lineHeight: 1.6, whiteSpace: k === 'stack' ? undefined : 'pre-line' }}>{p[k]}</dd>
                      </div>
                    ))}
                  </dl>
                  <a href="#index" tabIndex={on ? 0 : -1} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: f(12, 13), letterSpacing: `${f(0.12, 0.06)}em`, textDecoration: 'none', borderBottom: `1px solid ${ACCENT}` }}>{t('link')}</a>
                </article>
              );
            })}
          </div>
          </div>
          {projects.map((p, i) => <div key={p.code} data-step={i} aria-hidden="true" style={{ height: 'calc(var(--stage-h) - 20px)' }} />)}
        </div>
      </div>
    </section>
  );
}
