'use client';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ACCENT, BODY, BONE, DIM, INK, KR, LINE, MONO, MONO_KR, MUTED, pill } from '@/lib/tokens';
import type { Project } from '@/lib/projects';

type Filter = 'ALL' | 'APP' | 'PROGRAM' | 'GAME';
const FILTERS: Filter[] = ['ALL', 'APP', 'PROGRAM', 'GAME'];

function useFilter(projects: Project[]) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [open, setOpen] = useState(-1);
  const counts: Record<string, number> = { ALL: projects.length };
  projects.forEach((p) => { counts[p.type] = (counts[p.type] || 0) + 1; });
  const rows = projects.map((p, i) => ({ p, i })).filter(({ p }) => filter === 'ALL' || p.type === filter);
  return { filter, setFilter: (f: Filter) => { setFilter(f); setOpen(-1); }, open, setOpen, counts, rows };
}

export function RegistryDesktop({ ko }: { ko: boolean }) {
  const t = useTranslations('index');
  const tt = useTranslations();
  const projects = tt.raw('projects') as Project[];
  const { filter, setFilter, open, setOpen, counts, rows } = useFilter(projects);
  const f = (en: number, k: number) => (ko ? k : en);
  const grid = '120px minmax(0, 1fr) 160px 200px 56px';
  const keys = t.raw('keys') as string[];
  // Mockup note ④: a small preview plate follows the cursor over a row.
  const plate = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(-1);
  const movePlate = (e: React.MouseEvent) => {
    const el = plate.current;
    if (el) el.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
  };
  const hp = hover >= 0 ? projects[hover] : null;

  return (
    <section id="index" aria-label={t('label')} style={{ padding: '72px 40px', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, paddingBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 11, letterSpacing: `${f(0.16, 0.12)}em`, color: ACCENT }}>{t('eyebrow')}</span>
          <h2 style={ko ? { margin: 0, fontFamily: KR, fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em' } : { margin: 0, fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em' }}>{t('title')}</h2>
        </div>
        <div role="group" aria-label={t('filterLabel')} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map((k) => {
            const on = filter === k;
            return (
              <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={on} style={{ minHeight: 44, padding: '0 16px', border: `1px solid ${on ? BONE : LINE}`, background: on ? BONE : 'transparent', color: on ? INK : BONE, fontFamily: ko ? MONO_KR : MONO, fontSize: f(12, 13), letterSpacing: `${f(0.1, 0.06)}em`, cursor: 'pointer' }}>
                {tt(`types.${k}`)} <span style={{ opacity: 0.6 }}>{String(counts[k] || 0).padStart(2, '0')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: grid, gap: 16, padding: '10px 16px', fontSize: f(10, 11), letterSpacing: `${f(0.16, 0.1)}em`, color: MUTED, borderTop: `1px solid ${BONE}`, borderBottom: `1px solid ${LINE}` }}>
        {(t.raw('cols') as string[]).map((c) => <span key={c}>{c}</span>)}<span />
      </div>
      {rows.map(({ p, i }) => {
        const isOpen = open === i;
        const pl = pill(p.st);
        return (
          <div key={p.code} style={{ borderBottom: `1px solid ${LINE}` }}>
            <button type="button" className="qlrow" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
              onMouseEnter={(e) => { setHover(i); movePlate(e); }} onMouseMove={movePlate} onMouseLeave={() => setHover(-1)}
              style={{ width: '100%', display: 'grid', gridTemplateColumns: grid, gap: 16, alignItems: 'center', minHeight: 76, padding: '0 16px', border: 0, color: BONE, fontFamily: ko ? MONO_KR : MONO, textAlign: 'left', cursor: 'pointer' }}>
              <span className="qlmuted" style={{ fontSize: 12, letterSpacing: '0.1em', color: MUTED }}>{p.code}</span>
              <span style={ko ? { fontFamily: KR, fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em' } : { fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>{p.name}</span>
              <span className="qlmuted" style={{ fontSize: f(12, 13), letterSpacing: `${f(0.12, 0.06)}em`, color: MUTED }}>{tt(`types.${p.type}`)}</span>
              <span style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 10px', fontSize: f(11, 12), letterSpacing: `${f(0.12, 0.06)}em`, border: `1px solid ${pl.bd}`, background: pl.bg, color: pl.fg }}>{tt(`status.${p.st}`)}</span>
              <span style={{ fontSize: 22, textAlign: 'right' }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px minmax(0, 1fr) 360px', gap: 16, padding: '4px 16px 28px' }}>
                <span />
                <p style={ko ? { margin: 0, fontFamily: KR, fontSize: 15, lineHeight: 1.8, color: BODY, maxWidth: 560 } : { margin: 0, fontSize: 14, lineHeight: 1.7, color: BODY, maxWidth: 560 }}>{p.one}</p>
                <div style={{ fontSize: f(11, 12), letterSpacing: `${f(0.06, 0.04)}em`, color: MUTED, lineHeight: 1.9 }}>{t('stage')} · {p.stageLine}<br />{t('stack')} · {p.stack}</div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: 'grid', gridTemplateColumns: grid, gap: 16, alignItems: 'center', minHeight: 76, padding: '0 16px', borderBottom: `1px dashed ${LINE}`, color: DIM }}>
        <span style={{ fontSize: 12, letterSpacing: '0.1em' }}>QL-005</span>
        <span style={ko ? { fontFamily: KR, fontSize: 26, letterSpacing: '-0.04em' } : { fontSize: 26, letterSpacing: '-0.02em' }}>{t('next')}</span>
        <span style={{ fontSize: f(12, 13), letterSpacing: `${f(0.12, 0.06)}em` }}>{t('nextType')}</span>
        <span style={{ fontSize: f(11, 12), letterSpacing: ko ? undefined : '0.12em' }}>—</span>
        <span />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, paddingTop: 20, fontSize: f(11, 12), letterSpacing: `${f(0.12, 0.06)}em`, color: MUTED }}>
        <span>{t('key')}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, background: BONE }} />{keys[0]}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, background: ACCENT }} />{keys[1]}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, border: `1px solid ${BONE}`, boxSizing: 'border-box' }} />{keys[2]}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, border: `1px dashed ${MUTED}`, boxSizing: 'border-box' }} />{keys[3]}</span>
      </div>
      <div ref={plate} aria-hidden="true" style={{ position: 'fixed', left: 0, top: 0, zIndex: 40, pointerEvents: 'none', width: 168, padding: '10px 12px', background: INK, border: `1px solid ${ACCENT}`, fontSize: 10, letterSpacing: '0.12em', lineHeight: 1.7, color: MUTED, opacity: hp ? 1 : 0, transition: 'opacity 150ms ease' }}>
        {hp && <><span style={{ color: ACCENT }}>{hp.code}</span><br />{hp.form}<br /><span style={{ color: BONE }}>{hp.dims}</span></>}
      </div>
    </section>
  );
}

export function RegistryMobile({ ko }: { ko: boolean }) {
  const t = useTranslations('index');
  const tt = useTranslations();
  const projects = tt.raw('projects') as Project[];
  const { filter, setFilter, open, setOpen, counts, rows } = useFilter(projects);
  const f = (en: number, k: number) => (ko ? k : en);
  return (
    <section id="m-index" aria-label={t('label')} style={{ padding: '48px 16px', borderBottom: `1px solid ${LINE}` }}>
      <span style={{ fontSize: f(10, 11), letterSpacing: `${f(0.14, 0.1)}em`, color: ACCENT }}>{t('eyebrow')}</span>
      <h2 style={ko ? { margin: '10px 0 18px', fontFamily: KR, fontSize: 28, fontWeight: 700, letterSpacing: '-0.05em' } : { margin: '10px 0 18px', fontSize: 30, fontWeight: 500, letterSpacing: '-0.03em' }}>{t('titleMobile')}</h2>
      <div role="group" aria-label={t('filterLabel')} style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 16 }}>
        {FILTERS.map((k) => {
          const on = filter === k;
          return (
            <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={on} style={{ flex: 'none', minHeight: 44, padding: '0 12px', border: `1px solid ${on ? BONE : LINE}`, background: on ? BONE : 'transparent', color: on ? INK : BONE, fontFamily: ko ? MONO_KR : MONO, fontSize: f(11, 12), letterSpacing: ko ? undefined : '0.08em', cursor: 'pointer' }}>
              {tt(`types.${k}`)} {String(counts[k] || 0).padStart(2, '0')}
            </button>
          );
        })}
      </div>
      <div style={{ borderTop: `1px solid ${BONE}` }}>
        {rows.map(({ p, i }) => {
          const isOpen = open === i;
          const pl = pill(p.st);
          const fg = isOpen ? INK : BONE;
          return (
            <div key={p.code} style={{ borderBottom: `1px solid ${LINE}`, background: isOpen ? ACCENT : 'transparent', transition: 'background 250ms ease' }}>
              <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 4px', border: 0, background: 'transparent', color: fg, fontFamily: ko ? MONO_KR : MONO, textAlign: 'left', cursor: 'pointer' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: f(10, 11), letterSpacing: `${f(0.12, 0.06)}em` }}>
                  <span>{p.code} · {tt(`types.${p.type}`)}</span>
                  <span style={{ padding: '3px 7px', border: `1px solid ${isOpen ? INK : pl.bd}`, background: isOpen ? INK : pl.bg, color: isOpen ? ACCENT : pl.fg }}>{tt(`statusMobile.${p.st}`)}</span>
                </span>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={ko ? { fontFamily: KR, fontSize: 21, fontWeight: 700, letterSpacing: '-0.04em' } : { fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{p.name}</span>
                  <span style={{ fontSize: 20 }}>{isOpen ? '−' : '+'}</span>
                </span>
              </button>
              {isOpen && <p style={ko ? { margin: 0, padding: '0 4px 18px', fontFamily: KR, fontSize: 14, lineHeight: 1.75, color: fg } : { margin: 0, padding: '0 4px 18px', fontSize: 13, lineHeight: 1.7, color: fg }}>{p.one}</p>}
            </div>
          );
        })}
        <div style={{ padding: '16px 4px', borderBottom: `1px dashed ${LINE}`, color: DIM }}>
          <div style={{ fontSize: f(10, 11), letterSpacing: `${f(0.12, 0.1)}em` }}>QL-005</div>
          <div style={ko ? { fontFamily: KR, fontSize: 19, marginTop: 6 } : { fontSize: 20, marginTop: 6 }}>{t('next')}</div>
        </div>
      </div>
    </section>
  );
}
