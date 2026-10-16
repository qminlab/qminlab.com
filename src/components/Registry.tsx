'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Project } from '@/lib/projects';
import { ProjectLinks } from './ProjectLinks';
import { IndexThumb } from './IndexThumbs';
import '@/styles/index.css';

gsap.registerPlugin(ScrollTrigger);

type Filter = 'ALL' | 'APP' | 'PROGRAM' | 'GAME' | 'TOOL';
const FILTERS: Filter[] = ['ALL', 'APP', 'PROGRAM', 'GAME', 'TOOL'];
const HANGUL = /[ㄱ-ㆎ가-힣]/;

/** The dashed placeholder row takes the number after the last specimen. */
const nextCode = (projects: Project[]) => `QL-${String(projects.length + 1).padStart(3, '0')}`;

function useFilter(projects: Project[]) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [open, setOpen] = useState(-1);
  const counts: Record<string, number> = { ALL: projects.length };
  projects.forEach((p) => { counts[p.type] = (counts[p.type] || 0) + 1; });
  const rows = projects.map((p, i) => ({ p, i })).filter(({ p }) => filter === 'ALL' || p.type === filter);
  return { filter, setFilter: (f: Filter) => { setFilter(f); setOpen(-1); }, open, setOpen, counts, rows };
}

/** Rows rise in with a short stagger the first time the list scrolls into view. Content stays visible without JS. */
function useRiseIn(list: React.RefObject<HTMLUListElement | null>, query: string) {
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(`${query} and (prefers-reduced-motion: no-preference)`, () => {
      gsap.from(el.querySelectorAll(':scope > li'), {
        yPercent: 40, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
    return () => mm.revert();
  }, [list, query]);
}

function Filters({ filter, setFilter, counts, label }: { filter: Filter; setFilter: (f: Filter) => void; counts: Record<string, number>; label: string }) {
  const tt = useTranslations();
  return (
    <div role="group" aria-label={label} className="ix-filters">
      {FILTERS.map((k) => (
        <button key={k} type="button" className="ix-filter qlpress" onClick={() => setFilter(k)} aria-pressed={filter === k}>
          {tt(`types.${k}`)}<sup>{String(counts[k] || 0).padStart(2, '0')}</sup>
        </button>
      ))}
    </div>
  );
}

const Name = ({ name }: { name: string }) => (
  <span className={HANGUL.test(name) ? 'ix-nm ix-nm--kr' : 'ix-nm'}>{name}</span>
);

export function RegistryDesktop({ ko }: { ko: boolean }) {
  const t = useTranslations('index');
  const tt = useTranslations();
  const projects = tt.raw('projects') as Project[];
  const { filter, setFilter, open, setOpen, counts, rows } = useFilter(projects);
  const list = useRef<HTMLUListElement>(null);
  useRiseIn(list, '(min-width: 1024px)');

  // Cursor-follow preview: target set on pointer move, position eased toward it each frame (lerp).
  const pv = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(-1);
  const [shown, setShown] = useState(-1); // keeps the last thumbnail while the preview fades out
  const st = useRef({ x: 0, y: 0, qx: 0, qy: 0, raf: 0, on: false, placed: false });
  const fine = useRef(false);
  useEffect(() => {
    fine.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const s = st.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);
  const loop = () => {
    const s = st.current, el = pv.current;
    s.qx += (s.x - s.qx) * 0.16; s.qy += (s.y - s.qy) * 0.16;
    if (el) el.style.transform = `translate3d(${s.qx}px, ${s.qy}px, 0)`;
    const settled = Math.abs(s.x - s.qx) < 0.3 && Math.abs(s.y - s.qy) < 0.3;
    s.raf = s.on || !settled ? requestAnimationFrame(loop) : 0;
  };
  const enter = (i: number, e: React.PointerEvent) => {
    if (!fine.current || e.pointerType !== 'mouse') return;
    const s = st.current;
    s.x = e.clientX; s.y = e.clientY;
    if (!s.placed) { s.qx = s.x; s.qy = s.y; s.placed = true; }
    s.on = true; setHover(i); setShown(i);
    if (!s.raf) s.raf = requestAnimationFrame(loop);
  };
  const move = (e: React.PointerEvent) => { st.current.x = e.clientX; st.current.y = e.clientY; };
  const leave = () => { st.current.on = false; setHover(-1); };

  return (
    <section id="index" aria-label={t('label')} className="ix" data-ko={ko || undefined}>
      <div className="ix-head">
        <div className="ix-head-txt">
          <span className="ix-eyebrow">{t('eyebrow')}</span>
          <h2 className="ix-title">{t('title')}</h2>
        </div>
        <Filters filter={filter} setFilter={setFilter} counts={counts} label={t('filterLabel')} />
      </div>

      <ul ref={list} className="ix-rows" onPointerLeave={leave}>
        {rows.map(({ p, i }) => {
          const isOpen = open === i;
          return (
            <li key={p.code} className="ix-item" data-open={isOpen || undefined}>
              <button type="button" className="ix-row" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                onPointerEnter={(e) => enter(i, e)} onPointerMove={move} onPointerLeave={leave}>
                <span className="ix-code">{p.code}</span>
                <Name name={p.name} />
                <span className="ix-meta">
                  <span className="ix-type">{tt(`types.${p.type}`)}</span>
                  <span className={`ix-pill ix-pill--${p.st}`}>{tt(`status.${p.st}`)}</span>
                </span>
                <span className="ix-pm" aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="ix-detail">
                  <div className="ix-detail-txt">
                    <p className="ix-one">{p.one}</p>
                    {p.desc && <p className="ix-desc">{p.desc}</p>}
                    <ProjectLinks code={p.code} ko={ko} small />
                  </div>
                  <dl className="ix-facts">
                    <dt>{t('stage')}</dt><dd>{p.stageLine}</dd>
                    <dt>{t('stack')}</dt><dd>{p.stack}</dd>
                  </dl>
                </div>
              )}
            </li>
          );
        })}
        <li className="ix-item ix-item--next" aria-label={`${nextCode(projects)} ${t('next')}`}>
          <div className="ix-row ix-row--next">
            <span className="ix-code">{nextCode(projects)}</span>
            <span className="ix-nm ix-nm--ghost">{t('next')}</span>
            <span className="ix-meta"><span className="ix-type">{t('nextType')}</span></span>
            <span />
          </div>
        </li>
      </ul>

      <div ref={pv} className="ix-preview" aria-hidden="true" data-on={hover >= 0 || undefined}>
        <div className="ix-preview-in">
          {shown >= 0 && <>
            <div className="ix-preview-obj"><IndexThumb code={projects[shown].code} /></div>
            <span className="ix-preview-cap">{projects[shown].code} · {projects[shown].form}</span>
          </>}
        </div>
      </div>
    </section>
  );
}

export function RegistryMobile({ ko }: { ko: boolean }) {
  const t = useTranslations('index');
  const tt = useTranslations();
  const projects = tt.raw('projects') as Project[];
  const { filter, setFilter, open, setOpen, counts, rows } = useFilter(projects);
  const list = useRef<HTMLUListElement>(null);
  useRiseIn(list, '(max-width: 1023.98px)');
  return (
    <section id="m-index" aria-label={t('label')} className="ix ix--m" data-ko={ko || undefined}>
      <div className="ix-head">
        <div className="ix-head-txt">
          <span className="ix-eyebrow">{t('eyebrow')}</span>
          <h2 className="ix-title">{t('titleMobile')}</h2>
        </div>
        <Filters filter={filter} setFilter={setFilter} counts={counts} label={t('filterLabel')} />
      </div>
      <ul ref={list} className="ix-rows">
        {rows.map(({ p, i }) => {
          const isOpen = open === i;
          return (
            <li key={p.code} className="ix-item" data-open={isOpen || undefined}>
              <button type="button" className="ix-row" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                <span className="ix-mtop">
                  <span className="ix-code">{p.code} · {tt(`types.${p.type}`)}</span>
                  <span className={`ix-pill ix-pill--${p.st}`}>{tt(`statusMobile.${p.st}`)}</span>
                </span>
                <span className="ix-mname">
                  <Name name={p.name} />
                  <span className="ix-pm" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </span>
              </button>
              {isOpen && (
                <div className="ix-detail">
                  <p className="ix-one">{p.one}</p>
                  {p.desc && <p className="ix-desc">{p.desc}</p>}
                  <ProjectLinks code={p.code} ko={ko} small />
                </div>
              )}
            </li>
          );
        })}
        <li className="ix-item ix-item--next">
          <div className="ix-row ix-row--next">
            <span className="ix-code">{nextCode(projects)}</span>
            <span className="ix-nm ix-nm--ghost">{t('next')}</span>
          </div>
        </li>
      </ul>
    </section>
  );
}
