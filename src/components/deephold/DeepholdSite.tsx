'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { CaseFile } from '@/content/deephold';
import { LanternFog } from './LanternFog';

const IMG = '/deephold/';
type TabId = 'intro' | 'world' | 'making' | 'trials' | 'tools' | 'now';
const TABS: TabId[] = ['intro', 'world', 'making', 'trials', 'tools', 'now'];
const CODES: Record<TabId, string> = { intro: 'GAME', world: 'WORLD', making: 'MAKING', trials: 'TRIALS', tools: 'TOOLS', now: 'NEXT' };

const UI = {
  ko: { home: 'QMIN LAB', scroll: '아래로', play: '최신 버전 받기', notes: '패치 노트', tabs: '딥홀드 안내', depth: '깊이', boss: '주인', lang: '언어', before: '처음', broke: '어긋남', after: '바꿈', total: '첫 달 추정', est: '추정', issues: '의견 남기기', prev: '이전', next: '다음', press: '눌러 보세요' },
  en: { home: 'QMIN LAB', scroll: 'Scroll', play: 'Get the latest build', notes: 'Patch notes', tabs: 'DeepHold sections', depth: 'Depth', boss: 'Master', lang: 'Language', before: 'First', broke: 'Broke', after: 'Fixed', total: 'First month (est.)', est: 'est.', issues: 'Send feedback', prev: 'Previous', next: 'Next', press: 'Try a key' },
};
const RELEASES = 'https://github.com/starMinK/deephold-releases/releases/latest';
const NOTES = 'https://github.com/starMinK/deephold-releases/blob/main/%ED%8C%A8%EC%B9%98%EB%85%B8%ED%8A%B8/README.md';
const ISSUES = 'https://github.com/starMinK/deephold-releases/issues';

const useReduced = () => {
  const [r, setR] = useState(false);
  useEffect(() => { const q = window.matchMedia('(prefers-reduced-motion: reduce)'); setR(q.matches); const f = () => setR(q.matches); q.addEventListener('change', f); return () => q.removeEventListener('change', f); }, []);
  return r;
};

/** Letters settle out of pixel noise, left to right. */
function Scramble({ text, run }: { text: string; run: number }) {
  const [out, setOut] = useState(text);
  const reduced = useReduced();
  useEffect(() => {
    if (reduced) { setOut(text); return; }
    const glyphs = '▓▒░█▚▞#%&@$<>/\\';
    let f = 0, raf = 0;
    const total = 22;
    const tick = () => {
      f++;
      const k = Math.floor((f / total) * text.length);
      setOut(text.split('').map((ch, i) => (i < k || ch === ' ' ? ch : glyphs[(i * 7 + f) % glyphs.length])).join(''));
      if (f < total) raf = requestAnimationFrame(tick); else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, run, reduced]);
  return <span aria-label={text}><span aria-hidden="true">{out}</span></span>;
}

/** Children rise in (staggered by --i) once they scroll into view. */
function Reveal({ children, as: Tag = 'div', className = '', style }: { children: ReactNode; as?: 'div' | 'ul' | 'ol' | 'section'; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.dataset.in = '1'; io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as 'div';
  return <T ref={ref as React.RefObject<HTMLDivElement>} className={`dh-reveal ${className}`} style={style}>{children}</T>;
}

/** Number that counts up the first time it is seen (keeps any suffix like "+" or ","). */
function Count({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  const m = value.match(/^([\d,]+)(.*)$/);
  const target = m ? Number(m[1].replace(/,/g, '')) : NaN;
  const [n, setN] = useState(Number.isNaN(target) ? value : '0');
  const reduced = useReduced();
  useEffect(() => {
    if (Number.isNaN(target)) return;
    const el = ref.current;
    if (!el) return;
    const fmt = (x: number) => x.toLocaleString('en-US') + (m?.[2] ?? '');
    if (reduced) { setN(fmt(target)); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 1400);
        const ease = 1 - Math.pow(1 - k, 4);
        setN(fmt(Math.round(target * ease)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, reduced]); // eslint-disable-line react-hooks/exhaustive-deps
  return <b ref={ref}>{n}</b>;
}

/** Card that leans toward the pointer and carries a moving glare. */
function Tilt({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current!; const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`); el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
    el.style.setProperty('--gx', `${x * 100}%`); el.style.setProperty('--gy', `${y * 100}%`);
  };
  const onLeave = () => { const el = ref.current!; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
  return <div ref={ref} className={`dh-tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>{children}</div>;
}

/** An image kept in the dark except where the lantern (pointer) is. */
function Lantern({ src, alt, w, h, cap }: { src: string; alt: string; w: number; h: number; cap: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current!; const b = el.getBoundingClientRect();
    el.style.setProperty('--lx', `${e.clientX - b.left}px`); el.style.setProperty('--ly', `${e.clientY - b.top}px`);
    el.dataset.lit = '1';
  };
  return (
    <figure className="dh-lantern">
      <div ref={ref} className="dh-lantern-in" onPointerMove={move} onPointerDown={move} onPointerLeave={() => { if (ref.current) delete ref.current.dataset.lit; }}>
        <img src={`${IMG}${src}`} alt={alt} width={w} height={h} loading="lazy" />
        <div className="dh-dark" aria-hidden="true" />
      </div>
      <figcaption>{cap}</figcaption>
    </figure>
  );
}

/** Magnetic call-to-action: drifts toward the pointer a few pixels. */
function Magnet({ href, children, solid }: { href: string; children: ReactNode; solid?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current!; const b = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.18}px, ${(e.clientY - b.top - b.height / 2) * 0.3}px)`;
  };
  return (
    <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" className={solid ? 'dh-btn dh-btn--solid' : 'dh-btn'}
      onPointerMove={move} onPointerLeave={() => { if (ref.current) ref.current.style.transform = ''; }}>
      <span>{children}</span><i aria-hidden="true">↗</i>
    </a>
  );
}

function Keycap({ k, label, sub }: { k: string; label: string; sub: string }) {
  const [down, setDown] = useState(false);
  return (
    <li className="dh-key" data-down={down || undefined}>
      <button type="button" onPointerDown={() => setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)} aria-label={`${k}: ${label}`}>
        <kbd>{k}</kbd>
      </button>
      <span>{label}{sub && <small>{sub}</small>}</span>
    </li>
  );
}

export function DeepholdSite({ c, locale }: { c: CaseFile; locale: 'ko' | 'en' }) {
  const ui = UI[locale];
  const [tab, setTab] = useState<TabId>('intro');
  const [run, setRun] = useState(0);
  const [heat, setHeat] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const labels = Object.fromEntries(c.toc.map((t) => [t.id, t.label])) as Record<TabId, string>;

  // Deep link: #world etc. opens that tab.
  useEffect(() => {
    const read = () => { const h = window.location.hash.slice(1) as TabId; if (TABS.includes(h)) setTab(h); };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  // Press any game key on the page and the lantern flares (the hero fog brightens briefly).
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const key = (e: KeyboardEvent) => {
      if (!['j', 'k', 'e', 'q', 'l'].includes(e.key.toLowerCase()) || (e.target as HTMLElement)?.closest('input,textarea')) return;
      setHeat(1); clearTimeout(t); t = setTimeout(() => setHeat(0), 260);
    };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); clearTimeout(t); };
  }, []);

  const go = useCallback((id: TabId, focus = false) => {
    if (id === tab) return;
    const apply = () => {
      setTab(id); setRun((r) => r + 1);
      history.replaceState(null, '', `#${id}`);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) doc.startViewTransition(apply);
    else apply();
    const top = bar.current ? bar.current.getBoundingClientRect().top + window.scrollY : 0;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    if (focus) requestAnimationFrame(() => document.getElementById(`dh-tab-${id}`)?.focus());
  }, [tab]);

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.indexOf(tab);
    if (e.key === 'ArrowRight') { e.preventDefault(); go(TABS[(i + 1) % TABS.length], true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(TABS[(i - 1 + TABS.length) % TABS.length], true); }
    if (e.key === 'Home') { e.preventDefault(); go(TABS[0], true); }
    if (e.key === 'End') { e.preventDefault(); go(TABS[TABS.length - 1], true); }
  };

  const idx = TABS.indexOf(tab);
  const prev = idx > 0 ? TABS[idx - 1] : null;
  const next = idx < TABS.length - 1 ? TABS[idx + 1] : null;

  return (
    <div className="dh" data-ko={locale === 'ko' || undefined}>
      <div className="dh-scan" aria-hidden="true" />
      <header className="dh-top">
        <a href="../" className="dh-home"><span aria-hidden="true">◂</span> {ui.home}</a>
        <nav aria-label={ui.lang} className="dh-lang">
          {(['ko', 'en'] as const).map((l) => <a key={l} href={`../../${l}/deephold/`} aria-current={l === locale ? 'page' : undefined}>{l.toUpperCase()}</a>)}
        </nav>
      </header>

      <section className="dh-hero" aria-labelledby="dh-title">
        <LanternFog glow={heat} />
        <div className="dh-hero-in">
          <span className="dh-kicker">{c.file}</span>
          <h1 id="dh-title" className="dh-logo">
            <span className="dh-logo-txt" data-text="DEEPHOLD">DEEPHOLD</span>
            {locale === 'ko' && <span className="dh-logo-ko">딥홀드</span>}
          </h1>
          <p className="dh-lead">{c.lead}</p>
          <div className="dh-cta">
            <Magnet href={RELEASES} solid>{ui.play}</Magnet>
            <Magnet href={NOTES}>{ui.notes}</Magnet>
          </div>
          <span className="dh-status"><i aria-hidden="true" />{c.status}</span>
        </div>
        <div className="dh-walker" aria-hidden="true"><i /></div>
        <a href="#dh-tabs" className="dh-down" aria-label={ui.scroll}><span>{ui.scroll}</span><i aria-hidden="true" /></a>
      </section>

      <div className="dh-marquee" aria-hidden="true">
        <div>{Array.from({ length: 2 }).map((_, k) => <span key={k}>{c.stats.map((s) => <em key={s.l}><b>{s.n}</b> {s.l}</em>)}</span>)}</div>
      </div>

      <div id="dh-tabs" ref={bar} className="dh-bar">
        <div role="tablist" aria-label={ui.tabs} className="dh-tabs" onKeyDown={onTabKey}>
          {TABS.map((id, i) => (
            <button key={id} id={`dh-tab-${id}`} role="tab" type="button" aria-selected={tab === id} aria-controls="dh-panel" tabIndex={tab === id ? 0 : -1}
              className="dh-tab" onClick={() => go(id)}>
              <small>{String(i + 1).padStart(2, '0')} · {CODES[id]}</small>
              <span>{labels[id]}</span>
            </button>
          ))}
          <span className="dh-ink" aria-hidden="true" style={{ '--i': idx } as CSSProperties} />
        </div>
      </div>

      <main id="dh-panel" ref={panel} role="tabpanel" aria-labelledby={`dh-tab-${tab}`} className="dh-panel" key={tab} data-tab={tab}>
        {tab === 'intro' && (
          <>
            <PanelHead code={CODES.intro} eyebrow={c.intro.eyebrow} title={c.intro.title} run={run} />
            <div className="dh-split">
              <Reveal className="dh-prose">{c.intro.body.map((p) => <p key={p.slice(0, 12)}>{p}</p>)}</Reveal>
              <Reveal as="ul" className="dh-stats">
                {c.stats.map((s, i) => <li key={s.l} style={{ '--i': i } as CSSProperties}><Count value={s.n} /><span>{s.l}</span></li>)}
              </Reveal>
            </div>
            <h3 className="dh-h3">{c.intro.rulesTitle}</h3>
            <Reveal as="ul" className="dh-rules">
              {c.intro.rules.map(([k, v], i) => (
                <li key={k} style={{ '--i': i } as CSSProperties}><span className="dh-rule-n">{String(i + 1).padStart(2, '0')}</span><b>{k}</b><p>{v}</p></li>
              ))}
            </Reveal>
            <h3 className="dh-h3">{c.intro.loopTitle}</h3>
            <Reveal as="ol" className="dh-loop">
              {c.intro.loop.map((s, i) => <li key={s.slice(0, 12)} style={{ '--i': i } as CSSProperties}><span>{String(i + 1).padStart(2, '0')}</span><p>{s}</p></li>)}
            </Reveal>
            <h3 className="dh-h3">{c.intro.controlsTitle} <small>— {ui.press}</small></h3>
            <Reveal as="ul" className="dh-keys">
              {c.intro.controls.map(([label, k]) => <Keycap key={label} k={k.split(' ')[0]} label={label} sub={k.includes(' ') ? k : ''} />)}
            </Reveal>
          </>
        )}

        {tab === 'world' && (
          <>
            <PanelHead code={CODES.world} eyebrow={c.world.eyebrow} title={c.world.title} run={run} />
            <Reveal className="dh-prose dh-prose--wide">{c.world.body.map((p) => <p key={p.slice(0, 12)}>{p}</p>)}</Reveal>
            <Lantern src="village.webp" alt={c.world.villageCap} w={1280} h={896} cap={c.world.villageCap} />
            <h3 className="dh-h3">{c.world.placesTitle}</h3>
            <ol className="dh-depths">
              {c.world.places.map((p, i) => (
                <li key={p.name} className="dh-depth" style={{ '--i': i } as CSSProperties}>
                  <div className="dh-gauge" aria-hidden="true"><span>B{String(i * 3 + 1).padStart(2, '0')}</span></div>
                  <Reveal className="dh-depth-card">
                    <div className="dh-room"><img src={`${IMG}${p.img}.webp`} alt={p.name} width={768} height={576} loading="lazy" /></div>
                    <div className="dh-depth-txt">
                      <small>{ui.depth} · {p.floors}</small>
                      <h4>{p.name}</h4>
                      <Tilt className="dh-bosscard">
                        <img src={`${IMG}${p.bossImg}.webp`} alt={p.boss} width={144} height={144} loading="lazy" />
                        <div><small>{ui.boss}</small><b>{p.boss}</b><p>{p.line}</p></div>
                      </Tilt>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
            <Lantern src="mine.webp" alt={c.world.mineCap} w={1040} h={384} cap={c.world.mineCap} />
          </>
        )}

        {tab === 'making' && (
          <>
            <PanelHead code={CODES.making} eyebrow={c.making.eyebrow} title={c.making.title} run={run} />
            <Reveal className="dh-prose dh-prose--wide">{c.making.body.map((p) => <p key={p.slice(0, 12)}>{p}</p>)}</Reveal>
            <h3 className="dh-h3">{c.making.roomsTitle}</h3>
            <Reveal className="dh-graph">
              <svg viewBox="0 0 600 340" className="dh-wires" aria-hidden="true" preserveAspectRatio="none">
                {[[300, 170, 100, 60], [300, 170, 500, 60], [300, 170, 80, 280], [300, 170, 300, 300], [300, 170, 520, 280]].map(([x1, y1, x2, y2], i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={{ '--i': i } as CSSProperties} />
                ))}
              </svg>
              <ul className="dh-nodes">
                {c.making.rooms.map(([name, role], i) => (
                  <li key={name} className={i === 1 ? 'dh-node dh-node--hub' : 'dh-node'} style={{ '--i': i } as CSSProperties}><b>{name}</b><p>{role}</p></li>
                ))}
              </ul>
            </Reveal>
            <h3 className="dh-h3">{c.making.flowTitle}</h3>
            <Reveal as="ol" className="dh-pipe">
              {c.making.flow.map((s, i) => <li key={s.slice(0, 12)} style={{ '--i': i } as CSSProperties}><span>{String(i + 1).padStart(2, '0')}</span><p>{s}</p></li>)}
            </Reveal>
            <h3 className="dh-h3">{c.making.artTitle}</h3>
            <Reveal as="ul" className="dh-bento">
              {c.making.art.map((s, i) => <li key={s.slice(0, 12)} style={{ '--i': i } as CSSProperties}><p>{s}</p></li>)}
            </Reveal>
            <h3 className="dh-h3">{c.making.timelineTitle}</h3>
            <Reveal as="ol" className="dh-time">
              {c.making.timeline.map((t, i) => (
                <li key={t.date} style={{ '--i': i } as CSSProperties}><span className="dh-date">{t.date}</span><small>{t.ver}</small><b>{t.title}</b><p>{t.body}</p></li>
              ))}
            </Reveal>
          </>
        )}

        {tab === 'trials' && (
          <>
            <PanelHead code={CODES.trials} eyebrow={c.trials.eyebrow} title={c.trials.title} run={run} />
            <Reveal className="dh-prose dh-prose--wide"><p>{c.trials.body}</p></Reveal>
            <Trials c={c} ui={ui} />
            <div className="dh-shots">
              {([['v060_hitbox.webp', c.trials.hitCap, 944, 344], ['v060_village.webp', c.trials.villageCap, 940, 300], ['v052_furnace.webp', c.trials.furnaceCap, 880, 300]] as const).map(([src, cap, w, h], i) => (
                <Reveal key={src} className="dh-shot" style={{ '--i': i } as CSSProperties}>
                  <figure><img src={`${IMG}${src}`} alt={cap} width={w} height={h} loading="lazy" /><figcaption>{cap}</figcaption></figure>
                </Reveal>
              ))}
            </div>
          </>
        )}

        {tab === 'tools' && (
          <>
            <PanelHead code={CODES.tools} eyebrow={c.tools.eyebrow} title={c.tools.title} run={run} />
            <Reveal className="dh-prose dh-prose--wide"><p>{c.tools.body}</p></Reveal>
            <Reveal as="ul" className="dh-tools">
              {c.tools.rows.map(([name, use], i) => <li key={name} style={{ '--i': i } as CSSProperties}><Tilt><b>{name}</b><p>{use}</p></Tilt></li>)}
            </Reveal>
            <h3 className="dh-h3">{c.tools.costHead[0]} · {c.tools.costHead[1]}</h3>
            <Costs c={c} />
            <Reveal className="dh-total"><small>{ui.total}</small><b>{c.tools.total.replace(/^[^:：]*[:：]\s*/, '')}</b></Reveal>
            <p className="dh-note">{c.tools.note}</p>
          </>
        )}

        {tab === 'now' && (
          <>
            <PanelHead code={CODES.now} eyebrow={c.now.eyebrow} title={c.now.title} run={run} />
            <Reveal as="ol" className="dh-road">
              {c.now.items.map(([k, v], i) => <li key={k} style={{ '--i': i } as CSSProperties} data-on={i === 0 || undefined}><span /><b>{k}</b><p>{v}</p></li>)}
            </Reveal>
            <Reveal className="dh-final">
              <p>{c.now.outro}</p>
              <div className="dh-cta">
                <Magnet href={RELEASES} solid>{ui.play}</Magnet>
                <Magnet href={ISSUES}>{ui.issues}</Magnet>
              </div>
            </Reveal>
          </>
        )}

        <nav className="dh-pager" aria-label={ui.tabs}>
          {prev ? <button type="button" onClick={() => go(prev)}><small>← {ui.prev}</small><span>{labels[prev]}</span></button> : <span />}
          {next ? <button type="button" className="dh-pager-next" onClick={() => go(next)}><small>{ui.next} →</small><span>{labels[next]}</span></button> : <span />}
        </nav>
      </main>

      <footer className="dh-foot">
        <a href="../" className="dh-home"><span aria-hidden="true">◂</span> {c.footer.home}</a>
        <p>{c.footer.copy}</p>
      </footer>
    </div>
  );
}

function PanelHead({ code, eyebrow, title, run }: { code: string; eyebrow: string; title: string; run: number }) {
  return (
    <header className="dh-head">
      <span className="dh-ghost" aria-hidden="true">{code}</span>
      <span className="dh-eyebrow">{eyebrow}</span>
      <h2 className="dh-h2"><Scramble text={title} run={run} /></h2>
    </header>
  );
}

function Trials({ c, ui }: { c: CaseFile; ui: (typeof UI)['ko'] }) {
  const [open, setOpen] = useState(0);
  return (
    <ol className="dh-trials">
      {c.trials.items.map((t, i) => {
        const on = open === i;
        return (
          <li key={t.title} className="dh-trial" data-open={on || undefined} style={{ '--i': i } as CSSProperties}>
            <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)}>
              <span className="dh-trial-n">{String(i + 1).padStart(2, '0')}</span>
              <b>{t.title}</b>
              <i aria-hidden="true">{on ? '−' : '+'}</i>
            </button>
            <div className="dh-trial-body">
              <div>
                <section><small>{ui.before}</small><p>{t.tried}</p></section>
                <section className="dh-x"><small>{ui.broke}</small><p>{t.broke}</p></section>
                <section className="dh-ok"><small>{ui.after}</small><p>{t.fixed}</p></section>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Cost rows as bars: the bar length follows the upper estimate, so it is plain where the money goes. */
function Costs({ c }: { c: CaseFile }) {
  const top = (raw: string) => { const s = raw.split('(')[0]; const nums = (s.match(/\$\s?([\d,.]+)/g) ?? []).map((x) => Number(x.replace(/[$,\s]/g, ''))); return nums.length ? Math.max(...nums) : 0; };
  const max = Math.max(...c.tools.costs.map(([, v]) => top(v)), 1);
  return (
    <Reveal as="ul" className="dh-costs">
      {c.tools.costs.map(([k, v], i) => (
        <li key={k} style={{ '--i': i, '--w': `${Math.max(2, (top(v) / max) * 100)}%` } as CSSProperties}>
          <b>{k}</b><span className="dh-cost-bar" aria-hidden="true"><i /></span><em>{v}</em>
        </li>
      ))}
    </Reveal>
  );
}
