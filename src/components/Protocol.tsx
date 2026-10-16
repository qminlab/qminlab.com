'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@/styles/index.css';

gsap.registerPlugin(ScrollTrigger);

type Tab = { title: string; titleMobile: string; body: string };

/**
 * All three rules stacked as big statements. Each word lights up (.16 → 1) as the paragraph
 * scrolls through the reading band. Words are only dimmed once JS arms the section, so the
 * text is fully readable without JS or with reduced motion.
 */
function useWordLight(root: React.RefObject<HTMLElement | null>, query: string) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(`${query} and (prefers-reduced-motion: no-preference)`, () => {
      el.classList.add('rl-armed');
      const triggers = Array.from(el.querySelectorAll<HTMLElement>('.rl-body')).map((p) => {
        const ws = Array.from(p.querySelectorAll<HTMLElement>('.rl-w'));
        let last = -1;
        return ScrollTrigger.create({
          trigger: p, start: 'top 85%', end: 'bottom 45%', scrub: true,
          onUpdate: (s) => {
            const on = Math.round(s.progress * ws.length);
            if (on === last) return;
            last = on;
            ws.forEach((w, i) => w.classList.toggle('on', i < on));
          },
          onRefresh: (s) => {
            const on = Math.round(s.progress * ws.length);
            last = on;
            ws.forEach((w, i) => w.classList.toggle('on', i < on));
          },
        });
      });
      return () => {
        triggers.forEach((tr) => tr.kill());
        el.classList.remove('rl-armed');
        el.querySelectorAll('.rl-w.on').forEach((w) => w.classList.remove('on'));
      };
    });
    return () => mm.revert();
  }, [root, query]);
}

const Words = ({ text }: { text: string }) => (
  <>
    {text.split(' ').map((w, i, a) => (
      <span key={i}><span className="rl-w">{w}</span>{i < a.length - 1 ? ' ' : ''}</span>
    ))}
  </>
);

function Rules({ ko, mobile }: { ko: boolean; mobile: boolean }) {
  const t = useTranslations('lab');
  const tabs = t.raw('tabs') as Tab[];
  const root = useRef<HTMLElement>(null);
  useWordLight(root, mobile ? '(max-width: 1023.98px)' : '(min-width: 1024px)');
  return (
    <section ref={root} id={mobile ? 'm-lab' : 'lab'} aria-label={t('label')} className={mobile ? 'rl rl--m' : 'rl'} data-ko={ko || undefined}>
      <div className="rl-head">
        <span className="rl-eyebrow">{t('eyebrow')}</span>
        <h2 className="rl-title">{t('title')}</h2>
      </div>
      <ol className="rl-list">
        {tabs.map((x, i) => (
          <li key={i} className="rl-rule">
            <span className="rl-label">{t('protocol')} {i + 1} · {mobile ? x.titleMobile : x.title}</span>
            <p className="rl-body"><Words text={x.body} /></p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export const ProtocolDesktop = ({ ko }: { ko: boolean }) => <Rules ko={ko} mobile={false} />;
export const ProtocolMobile = ({ ko }: { ko: boolean }) => <Rules ko={ko} mobile />;
