'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ACCENT, ARCHIVO, BODY, BONE, KR, MONO, MONO_KR, MUTED } from '@/lib/tokens';
import type { Project } from '@/lib/projects';
import { scrollToEl } from '@/lib/scroll';
import { Scramble } from '../Scramble';
import { SpecimenStage } from './SpecimenStage';
import { ProjectLinks } from '../ProjectLinks';
import { CASES, caseHref } from '@/lib/links';
import { OutlineNumbers, StatusPill } from './parts';

gsap.registerPlugin(ScrollTrigger);

const EASE_OUT = 'cubic-bezier(.23,1,.32,1)';

export function SpecimensDesktop({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('specimens');
  const tt = useTranslations();
  const projects = tt.raw('projects') as Project[];
  const order = projects.map((p) => p.code);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  stepRef.current = step;
  const column = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ScrollTrigger watches the spacer column; the spacer whose centre is nearest the viewport middle is the
  // current step. One `step` drives the object, the text, the outlined number and the progress bar.
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
    scrollToEl(column.current?.querySelector(`[data-step="${i}"]`) ?? null, { center: true });
  };

  const n = projects.length;
  const cur = projects[step];
  const f = (en: number, k: number) => (ko ? k : en);
  const label = { fontFamily: ko ? MONO_KR : MONO, fontSize: 12, letterSpacing: `${f(0.1, 0.06)}em`, color: MUTED } as const;

  return (
    // The scene fills the window under the floating header; scroll distance per specimen follows its height.
    <section id="specimens" aria-label={t('label')} style={{ position: 'relative', padding: '128px 0 48px', ['--stage-h' as string]: 'max(640px, calc(100vh - 64px))' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px 48px', padding: '0 40px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          <span style={{ ...label, color: ACCENT }}>{t('eyebrow')}</span>
          <h2 className="sp-name" style={ko
            ? { fontFamily: KR, fontSize: 'clamp(52px, 6.4vw, 104px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.05em' }
            : { fontFamily: ARCHIVO, fontSize: 'clamp(56px, 7vw, 112px)', fontWeight: 800, fontVariationSettings: "'wdth' 112", lineHeight: 0.92, letterSpacing: '-0.035em' }}>{t('title')}</h2>
        </div>
        <p style={{ margin: 0, maxWidth: 380, fontFamily: KR, fontSize: f(15, 16), lineHeight: 1.75, color: MUTED, textWrap: 'pretty', wordBreak: 'keep-all' }}>{t('intro')}</p>
      </header>

      <div ref={column} style={{ position: 'relative' }}>
        {/* The sticky scene lives in a layer exactly as tall as the spacer column, so it stops level with the
            last spacer instead of sliding into the next section. */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <div style={{ position: 'sticky', top: 64, height: 'var(--stage-h)', overflow: 'hidden', pointerEvents: 'auto' }}>
            <OutlineNumbers count={n} step={step} className="sp-nums sp-nums-d" />

            <div style={{ position: 'absolute', inset: '8px 40px 72px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.08fr) minmax(0, 1fr)', gap: 48, zIndex: 1 }}>
              <div style={{ position: 'relative', minWidth: 0, minHeight: 0 }}>
                <SpecimenStage code={cur.code} order={order} ko={ko} mobile={false} enabled={enabled} />
              </div>

              <div aria-live="polite" style={{ position: 'relative', minWidth: 0 }}>
                {projects.map((p, i) => {
                  const on = i === step;
                  const x = on ? 0 : i < step ? -64 : 64;
                  return (
                    <article key={p.code} className="qlswap sp-art" aria-hidden={!on}
                      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 580, opacity: on ? 1 : 0, transform: `translateX(${x}px)`, pointerEvents: on ? 'auto' : 'none', transition: `opacity ${on ? 600 : 380}ms ease ${on ? 120 : 0}ms, transform 900ms ${EASE_OUT} ${on ? 60 : 0}ms` }}>
                      <span style={label}>{p.code} · {tt(`types.${p.type}`)}</span>
                      <h3 className="sp-name" style={ko
                        ? { fontFamily: KR, fontSize: 'clamp(40px, min(6.4vw, 10.5vh), 96px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.05em', color: p.st === 'paused' ? MUTED : BONE }
                        // Long English titles drop a size so a four-line name still fits the stage height.
                        : { fontFamily: ARCHIVO, fontSize: p.name.length > 20 ? 'clamp(36px, min(5.4vw, 8.8vh), 80px)' : 'clamp(40px, min(6.4vw, 10.5vh), 96px)', fontWeight: 800, fontVariationSettings: "'wdth' 108", lineHeight: 0.92, letterSpacing: '-0.035em', color: p.st === 'paused' ? MUTED : BONE }}>{p.name}</h3>
                      <StatusPill st={p.st} label={tt(`status.${p.st}`)} ko={ko} />
                      <p style={{ margin: 0, maxWidth: 520, fontFamily: KR, fontSize: f(17, 18), lineHeight: 1.7, color: BODY, wordBreak: 'keep-all', textWrap: 'pretty' }}>{p.one}</p>
                      {p.desc && <p className="sp-desc" style={{ margin: 0, maxWidth: 520, fontFamily: KR, color: MUTED, wordBreak: 'keep-all', textWrap: 'pretty' }}>{p.desc}</p>}
                      {p.tip && <span style={{ fontFamily: KR, fontSize: f(13, 14), lineHeight: 1.6, color: ACCENT, wordBreak: 'keep-all' }}>{p.tip}</span>}
                      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '6px 20px', maxWidth: 540 }}>
                        {(['platform', 'stage', 'stack'] as const).map((k) => (
                          <div key={k} style={{ display: 'contents' }}>
                            <dt style={{ ...label, fontSize: 11, paddingTop: 3 }}>{t(`fields.${k}`)}</dt>
                            <dd style={{ margin: 0, fontFamily: KR, fontSize: f(13, 14), lineHeight: 1.6, color: BONE, wordBreak: 'keep-all' }}>{k === 'stage' ? p.stageLine : k === 'platform' ? p.platform.replace(/\n/g, ' · ') : p.stack}</dd>
                          </div>
                        ))}
                      </dl>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 24px', paddingTop: 4 }}>
                        <ProjectLinks code={p.code} ko={ko} active={on} />
                        <a href={caseHref(p.code, '#index')} tabIndex={on ? 0 : -1} className="sp-case" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontFamily: ko ? MONO_KR : MONO, fontSize: f(12, 13), letterSpacing: `${f(0.1, 0.04)}em`, color: BONE, textDecoration: 'none', borderBottom: `1px solid ${ACCENT}` }}>{t(CASES[p.code] ? 'siteLink' : 'link')}</a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Progress: count, five clickable segments, and the current specimen's form. */}
            <div style={{ position: 'absolute', left: 40, right: 40, bottom: 18, display: 'flex', alignItems: 'center', gap: 20, zIndex: 2 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: BONE, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                <span style={{ color: ACCENT }}>{`0${step + 1}`}</span>{` / 0${n}`}
              </span>
              <div style={{ flex: 1, display: 'flex', gap: 6, minWidth: 0 }}>
                {projects.map((p, i) => (
                  <button key={p.code} type="button" className="sp-seg" data-on={i <= step} onClick={() => goStep(i)}
                    aria-label={`${t('stepAria')} ${p.code}`} aria-current={i === step ? 'step' : undefined}><i /></button>
                ))}
              </div>
              <span style={{ ...label, minWidth: 200, textAlign: 'right', whiteSpace: 'nowrap' }}>{t('form')} · <span style={{ color: ACCENT }}><Scramble text={cur.form} trigger={step} duration={500} /></span></span>
            </div>
          </div>
        </div>
        {projects.map((p, i) => <div key={p.code} data-step={i} aria-hidden="true" style={{ height: 'calc(var(--stage-h) - 20px)' }} />)}
        {/* Tail: the last specimen holds the full scene while its spacer is centred, then the scene unpins. */}
        <div aria-hidden="true" style={{ height: 'calc(var(--stage-h) * 0.5 - 40px)' }} />
      </div>
    </section>
  );
}
