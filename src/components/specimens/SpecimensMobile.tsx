'use client';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ACCENT, BODY, BONE, DIM, DOTS_M, INK, KR, LINE, MONO, MUTED, pill } from '@/lib/tokens';
import type { Project } from '@/lib/projects';
import { SpecimenStage } from './SpecimenStage';

/** Mobile specimens: 400px stage, numbered tabs or swipe; the file below slides sideways in step. */
export function SpecimensMobile({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('specimens');
  const tt = useTranslations();
  const projects = tt.raw('projects') as Project[];
  const [step, setStep] = useState(0);
  const n = projects.length;
  const cur = projects[step];
  // Mockup: a horizontal swipe (40px+) on the stage or the file changes the step. A swipe that starts on
  // the phone is the phone's own gesture (the phone stops the pointerdown), and a cancelled one is dropped.
  const start = useRef<{ x: number; y: number } | null>(null);
  const swipe = {
    onPointerDown: (e: React.PointerEvent) => { start.current = { x: e.clientX, y: e.clientY }; },
    onPointerCancel: () => { start.current = null; },
    onPointerUp: (e: React.PointerEvent) => {
      const s0 = start.current;
      start.current = null;
      if (!s0) return;
      const dx = e.clientX - s0.x, dy = e.clientY - s0.y;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      setStep((s) => Math.max(0, Math.min(n - 1, s + (dx < 0 ? 1 : -1))));
    },
  };
  const small = { fontSize: ko ? 11 : 10, letterSpacing: ko ? undefined : '0.12em', color: MUTED } as const;

  return (
    <section id="m-specimens" aria-label={t('label')} style={{ padding: '48px 16px', borderBottom: `1px solid ${LINE}` }}>
      <span style={{ fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.1em' : '0.14em', color: ACCENT }}>{t('eyebrow')}</span>
      <h2 style={ko ? { margin: '10px 0 20px', fontFamily: KR, fontSize: 28, fontWeight: 700, letterSpacing: '-0.05em' } : { margin: '10px 0 20px', fontSize: 30, fontWeight: 500, letterSpacing: '-0.03em' }}>{t('title')}</h2>

      <div {...swipe} style={{ border: `1px solid ${LINE}`, background: DOTS_M, touchAction: 'pan-y' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.08em' : '0.12em', color: MUTED, borderBottom: `1px solid ${LINE}` }}>
          <span>{`${cur.code} · 0${step + 1}/0${n}`}</span><span style={{ color: ACCENT }}>{cur.formMobile ?? cur.form}</span>
        </div>
        <div style={{ height: 400, overflow: 'hidden' }}>
          <SpecimenStage step={step} ko={ko} mobile enabled={enabled} />
        </div>
        <div role="tablist" aria-label={t('label')} style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, borderTop: `1px solid ${LINE}` }}>
          {projects.map((p, i) => {
            const on = i === step;
            return (
              <button key={p.code} type="button" role="tab" aria-selected={on} onClick={() => setStep(i)}
                style={{ minHeight: 48, border: 0, borderRight: `1px solid ${LINE}`, background: on ? ACCENT : 'transparent', color: on ? INK : BONE, fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer' }}>{'0' + (i + 1)}</button>
            );
          })}
        </div>
      </div>

      <div {...swipe} style={{ display: 'grid', paddingTop: 24, touchAction: 'pan-y', overflow: 'hidden' }}>
        {projects.map((p, i) => {
          const on = i === step;
          const pl = pill(p.st);
          const tip = p.tipMobile;
          return (
            <article key={p.code} aria-hidden={!on} style={{ gridArea: '1 / 1', display: 'flex', flexDirection: 'column', gap: 14, opacity: on ? 1 : 0, transform: `translateX(${on ? 0 : i < step ? -24 : 24}px)`, pointerEvents: on ? 'auto' : 'none', transition: 'opacity 600ms ease, transform 900ms cubic-bezier(.7,0,.2,1)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.06em' : '0.12em', color: MUTED }}>
                <span>{p.code} / {tt(`types.${p.type}`)}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: `1px solid ${pl.bd}`, background: pl.bg, color: pl.fg }}>
                  <span className={p.st === 'paused' ? undefined : 'qldot'}>{p.st === 'paused' ? '❚❚' : '●'}</span>{tt(`statusMobile.${p.st}`)}
                </span>
              </div>
              <h3 style={ko
                ? { margin: 0, fontFamily: KR, fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.05em', color: p.st === 'paused' ? MUTED : BONE }
                : { margin: 0, fontSize: 38, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.04em', color: p.st === 'paused' ? MUTED : BONE }}>{p.name}</h3>
              <p style={ko ? { margin: 0, fontFamily: KR, fontSize: 15, lineHeight: 1.75, color: BODY } : { margin: 0, fontSize: 14, lineHeight: 1.7, color: BODY }}>{p.one}</p>
              {p.desc && <p style={ko ? { margin: 0, fontFamily: KR, fontSize: 13, lineHeight: 1.75, color: MUTED } : { margin: 0, fontSize: 12, lineHeight: 1.7, color: MUTED }}>{p.desc}</p>}
              {tip && <span style={{ fontSize: 12, lineHeight: 1.6, color: ACCENT }}>{tip}</span>}
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 16, borderTop: `1px solid ${LINE}` }}>
                {(['platform', 'stage', 'stack'] as const).map((k) => (
                  <div key={k} style={{ gridColumn: k === 'stack' ? '1 / -1' : undefined, padding: '10px 0', borderBottom: `1px solid ${LINE}` }}>
                    <dt style={small}>{t(`fields.${k}`)}</dt>
                    <dd style={{ margin: '4px 0 0', fontSize: ko ? 13 : 12, lineHeight: 1.6, whiteSpace: k === 'stack' ? undefined : 'pre-line' }}>{p[k]}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
      <div style={{ paddingTop: 14 }}>
        <span style={{ fontSize: ko ? 11 : 10, letterSpacing: ko ? undefined : '0.12em', color: DIM }}>{t('swipe')}</span>
      </div>
    </section>
  );
}
