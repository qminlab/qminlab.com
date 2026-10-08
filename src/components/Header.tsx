'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ARCHIVO, BONE, INK, LINE, MUTED } from '@/lib/tokens';
import { routing } from '@/i18n/routing';

function LangSwitch({ mobile }: { mobile: boolean }) {
  const t = useTranslations('header');
  const locale = useLocale();
  return (
    <div role="group" aria-label={t('langLabel')} style={{ display: 'flex', border: `1px solid ${LINE}`, borderRadius: 999, padding: 3, fontSize: mobile ? 11 : 12, letterSpacing: mobile ? undefined : '0.08em' }}>
      {routing.locales.map((l) => {
        const on = l === locale;
        return (
          <a key={l} href={`../${l}/`} aria-current={on ? 'page' : undefined}
            style={mobile
              ? { display: 'flex', alignItems: 'center', minHeight: 36, textDecoration: 'none', padding: '0 12px', borderRadius: 999, background: on ? BONE : undefined, color: on ? INK : BONE }
              : { textDecoration: 'none', padding: '7px 14px', borderRadius: 999, background: on ? BONE : undefined, color: on ? INK : BONE }}>
            {l.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}

const Logo = ({ mobile }: { mobile: boolean }) => (
  <a href={mobile ? '#mtop' : '#top'} style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 12, textDecoration: 'none', color: BONE }}>
    <span style={{ width: mobile ? 28 : 30, height: mobile ? 28 : 30, background: BONE, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ARCHIVO, fontWeight: 900, fontStretch: '125%', fontSize: mobile ? 17 : 19 }}>Q</span>
    <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontStretch: '125%', fontSize: mobile ? 14 : 15, letterSpacing: '0.06em' }}>QMIN LAB</span>
  </a>
);

export function HeaderDesktop({ ko }: { ko: boolean }) {
  const t = useTranslations('header');
  const links = ['specimens', 'index', 'lab', 'contact'] as const;
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px 32px', padding: '14px 40px', background: INK, borderBottom: `1px solid ${LINE}` }}>
      <Logo mobile={false} />
      <span style={{ fontSize: ko ? 12 : 11, letterSpacing: ko ? '0.08em' : '0.12em', color: MUTED }}>{t('tagline')}</span>
      <nav aria-label={t('navLabel')} style={{ display: 'flex', flexWrap: 'wrap', gap: 28, fontSize: ko ? 13 : 12, letterSpacing: ko ? '0.06em' : '0.1em' }}>
        {links.map((k) => <a key={k} href={`#${k}`} style={{ textDecoration: 'none' }}>{t(`nav.${k}`)}</a>)}
      </nav>
      <LangSwitch mobile={false} />
    </header>
  );
}

export function HeaderMobile() {
  const t = useTranslations('header');
  const [open, setOpen] = useState(false);
  const links = ['specimens', 'index', 'lab', 'contact'] as const;
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: INK, borderBottom: `1px solid ${LINE}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 64, padding: '0 16px' }}>
        <Logo mobile />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LangSwitch mobile />
          <button type="button" aria-label={open ? t('closeMenu') : t('openMenu')} aria-expanded={open} onClick={() => setOpen(!open)}
            style={{ width: 44, height: 44, border: `1px solid ${LINE}`, background: 'transparent', color: BONE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={open ? 'M4 4l10 10M14 4L4 14' : 'M2 5h14M2 9h14M2 13h9'} /></svg>
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label={t('navLabel')} style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${LINE}` }}>
          {links.map((k) => (
            <a key={k} href={`#m-${k}`} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', minHeight: 52, padding: '0 16px', borderBottom: `1px solid ${LINE}`, textDecoration: 'none', fontSize: 13, letterSpacing: '0.1em' }}>{t(`nav.${k}`)}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
