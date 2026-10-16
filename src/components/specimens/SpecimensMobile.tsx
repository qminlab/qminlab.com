'use client';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ACCENT, ARCHIVO, BODY, BONE, DIM, INK, KR, LINE, MONO, MONO_KR, MUTED } from '@/lib/tokens';
import type { Project } from '@/lib/projects';
import { SpecimenStage } from './SpecimenStage';
import { ProjectLinks } from '../ProjectLinks';
import { OutlineNumbers, StatusPill } from './parts';

/** Mobile specimens: a frameless 400px stage over a giant outlined number, a pill segmented control and swipe;
 *  the text below slides sideways in step with the object. */
export function SpecimensMobile({ ko, enabled }: { ko: boolean; enabled: boolean }) {
  const t = useTranslations('specimens');
  const tt = useTranslations();
  const projects = tt.raw('projects') as Project[];
  const [step, setStep] = useState(0);
  const n = projects.length;
  const cur = projects[step];
  // A horizontal swipe (40px+) on the stage or the text changes the step. A swipe that starts on the phone
  // is the phone's own gesture (the phone stops the pointerdown), and a cancelled one is dropped.
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
  const label = { fontFamily: ko ? MONO_KR : MONO, fontSize: 11, letterSpacing: ko ? '0.04em' : '0.1em', color: MUTED } as const;

  return (
    <section id="m-specimens" aria-label={t('label')} style={{ padding: '72px 16px 48px', overflow: 'hidden' }}>
      <span style={{ ...label, color: ACCENT }}>{t('eyebrow')}</span>
      <h2 className="sp-name" style={ko
        ? { margin: '14px 0 12px', fontFamily: KR, fontSize: 42, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.05em' }
        : { margin: '14px 0 12px', fontFamily: ARCHIVO, fontSize: 46, fontWeight: 800, fontVariationSettings: "'wdth' 108", lineHeight: 0.95, letterSpacing: '-0.035em' }}>{t('title')}</h2>
      <p style={{ margin: '0 0 8px', fontFamily: KR, fontSize: 14, lineHeight: 1.7, color: MUTED, wordBreak: 'keep-all' }}>{t('intro')}</p>

      <div {...swipe} style={{ position: 'relative', margin: '0 -16px', height: 400, overflow: 'hidden', touchAction: 'pan-y' }}>
        <OutlineNumbers count={n} step={step} className="sp-nums sp-nums-m" shift={30} />
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <SpecimenStage step={step} ko={ko} mobile enabled={enabled} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 2px 10px', ...label }}>
        <span style={{ whiteSpace: 'nowrap' }}><span style={{ color: ACCENT }}>{`0${step + 1}`}</span>{` / 0${n}`}</span>
        <span style={{ color: BONE, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.formMobile ?? cur.form}</span>
      </div>
      <div role="tablist" aria-label={t('label')} style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, border: `1px solid ${LINE}` }}>
        {projects.map((p, i) => {
          const on = i === step;
          return (
            <button key={p.code} type="button" role="tab" className="sp-tab" aria-selected={on} aria-label={`${t('stepAria')} ${p.code}`} onClick={() => setStep(i)}
              style={{ background: on ? ACCENT : 'transparent', color: on ? INK : BODY, fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em' }}>{'0' + (i + 1)}</button>
          );
        })}
      </div>

      <div {...swipe} style={{ display: 'grid', paddingTop: 32, touchAction: 'pan-y' }}>
        {projects.map((p, i) => {
          const on = i === step;
          const tip = p.tipMobile;
          return (
            <article key={p.code} className="qlswap" aria-hidden={!on}
              style={{ gridArea: '1 / 1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16, opacity: on ? 1 : 0, transform: `translateX(${on ? 0 : i < step ? -40 : 40}px)`, pointerEvents: on ? 'auto' : 'none', visibility: on ? 'visible' : 'hidden', transition: `opacity ${on ? 550 : 350}ms ease ${on ? 80 : 0}ms, transform 900ms cubic-bezier(.23,1,.32,1), visibility 0s ${on ? 0 : 900}ms` }}>
              <span style={label}>{p.code} · {tt(`types.${p.type}`)}</span>
              <h3 className="sp-name" style={ko
                ? { fontFamily: KR, fontSize: 48, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.05em', color: p.st === 'paused' ? MUTED : BONE }
                : { fontFamily: ARCHIVO, fontSize: 52, fontWeight: 800, fontVariationSettings: "'wdth' 106", lineHeight: 0.95, letterSpacing: '-0.035em', color: p.st === 'paused' ? MUTED : BONE }}>{p.name}</h3>
              <StatusPill st={p.st} label={tt(`statusMobile.${p.st}`)} ko={ko} small />
              <p style={{ margin: 0, fontFamily: KR, fontSize: ko ? 16 : 15, lineHeight: 1.7, color: BODY, wordBreak: 'keep-all' }}>{p.one}</p>
              {p.desc && <p style={{ margin: 0, fontFamily: KR, fontSize: 13, lineHeight: 1.75, color: MUTED, wordBreak: 'keep-all' }}>{p.desc}</p>}
              {tip && <span style={{ fontFamily: KR, fontSize: 13, lineHeight: 1.6, color: ACCENT, wordBreak: 'keep-all' }}>{tip}</span>}
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '6px 16px' }}>
                {(['platform', 'stage', 'stack'] as const).map((k) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <dt style={{ ...label, fontSize: 10, paddingTop: 3 }}>{t(`fields.${k}`)}</dt>
                    <dd style={{ margin: 0, fontFamily: KR, fontSize: 13, lineHeight: 1.6, color: BONE, wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>{k === 'stage' ? p.stageLine : k === 'platform' ? p.platform.replace(/\n/g, ' · ') : p.stack}</dd>
                  </div>
                ))}
              </dl>
              <ProjectLinks code={p.code} ko={ko} small active={on} />
            </article>
          );
        })}
      </div>
      <div style={{ paddingTop: 18 }}>
        <span style={{ ...label, fontSize: 10, color: DIM }}>{t('swipe')}</span>
      </div>
    </section>
  );
}
