'use client';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ACCENT, BONE, INK, KR, LINE, MONO } from '@/lib/tokens';

type Tab = { title: string; titleMobile: string; body: string };

/** Mockup note ⑤: on tab change the panel content is replaced with a 400ms clip-path wipe. */
function useTabs() {
  const [tab, setTab] = useState(0);
  const changed = useRef(0);
  return { tab, wipe: changed.current > 0, go: (i: number) => { if (i !== tab) { changed.current++; setTab(i); } } };
}

export function ProtocolDesktop({ ko }: { ko: boolean }) {
  const t = useTranslations('lab');
  const tabs = t.raw('tabs') as Tab[];
  const { tab, wipe, go } = useTabs();
  return (
    <section id="lab" aria-label={t('label')} style={{ padding: '72px 40px', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 28 }}>
        <span style={{ fontSize: 11, letterSpacing: ko ? '0.12em' : '0.16em', color: ACCENT }}>{t('eyebrow')}</span>
        <h2 style={ko ? { margin: 0, fontFamily: KR, fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em' } : { margin: 0, fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em' }}>{t('title')}</h2>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', border: `1px solid ${LINE}` }}>
        <div role="tablist" aria-label={t('tablist')} style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {tabs.map((x, i) => {
            const on = tab === i;
            return (
              <button key={i} type="button" role="tab" aria-selected={on} onClick={() => go(i)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 88, padding: '0 24px', border: 0, borderBottom: `1px solid ${LINE}`, background: on ? ACCENT : 'transparent', color: on ? INK : BONE, fontFamily: ko ? KR : MONO, fontSize: ko ? 19 : 18, fontWeight: ko ? 500 : undefined, textAlign: 'left', cursor: 'pointer' }}>
                <span>{x.title}</span><span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em' }}>{'0' + (i + 1)}</span>
              </button>
            );
          })}
        </div>
        <div role="tabpanel" style={{ flex: '1.6 1 480px', minWidth: 0, background: BONE, color: INK, overflow: 'hidden', display: 'flex' }}>
          <div key={tab} className={wipe ? 'qlwipe' : undefined} style={{ flex: 1, minHeight: 264, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: 11, letterSpacing: ko ? '0.14em' : '0.16em' }}>{t('protocol')} {'0' + (tab + 1)}</span>
            <p style={ko
              ? { margin: 0, fontFamily: KR, fontSize: 27, fontWeight: 500, lineHeight: 1.55, letterSpacing: '-0.03em', maxWidth: 680 }
              : { margin: 0, fontFamily: MONO, fontSize: 26, lineHeight: 1.45, letterSpacing: '-0.02em', maxWidth: 680 }}>{tabs[tab].body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProtocolMobile({ ko }: { ko: boolean }) {
  const t = useTranslations('lab');
  const tabs = t.raw('tabs') as Tab[];
  const { tab, wipe, go } = useTabs();
  return (
    <section id="m-lab" aria-label={t('label')} style={{ padding: '48px 16px', borderBottom: `1px solid ${LINE}` }}>
      <span style={{ fontSize: ko ? 11 : 10, letterSpacing: ko ? '0.1em' : '0.14em', color: ACCENT }}>{t('eyebrow')}</span>
      <h2 style={ko ? { margin: '10px 0 18px', fontFamily: KR, fontSize: 28, fontWeight: 700, letterSpacing: '-0.05em' } : { margin: '10px 0 18px', fontSize: 30, fontWeight: 500, letterSpacing: '-0.03em' }}>{t('title')}</h2>
      <div role="tablist" aria-label={t('tablist')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', border: `1px solid ${LINE}` }}>
        {tabs.map((x, i) => {
          const on = tab === i;
          return (
            <button key={i} type="button" role="tab" aria-selected={on} onClick={() => go(i)}
              style={{ minHeight: 56, padding: 6, border: 0, borderRight: `1px solid ${LINE}`, background: on ? ACCENT : 'transparent', color: on ? INK : BONE, fontFamily: ko ? KR : MONO, fontSize: ko ? 13 : 11, fontWeight: ko ? 500 : undefined, lineHeight: 1.3, cursor: 'pointer' }}>{x.titleMobile}</button>
          );
        })}
      </div>
      <div role="tabpanel" style={{ background: BONE, color: INK, overflow: 'hidden' }}>
        <div key={tab} className={wipe ? 'qlwipe' : undefined} style={{ padding: '24px 18px' }}>
          <p style={ko
            ? { margin: 0, fontFamily: KR, fontSize: 18, fontWeight: 500, lineHeight: 1.6, letterSpacing: '-0.03em' }
            : { margin: 0, fontSize: 18, lineHeight: 1.5, letterSpacing: '-0.02em' }}>{tabs[tab].body}</p>
        </div>
      </div>
    </section>
  );
}
