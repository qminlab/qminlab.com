'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ACCENT, ARCHIVO, BONE, INK, KR, MONO } from '@/lib/tokens';
import { routing } from '@/i18n/routing';

function LangSwitch({ mobile }: { mobile: boolean }) {
  const t = useTranslations('header');
  const locale = useLocale();
  return (
    <div role="group" aria-label={t('langLabel')} style={{ display: 'flex', border: `1px solid ${BONE}`, borderRadius: 999, padding: 3, fontSize: mobile ? 11 : 12, letterSpacing: mobile ? undefined : '0.08em' }}>
      {routing.locales.map((l) => {
        const on = l === locale;
        return (
          <a key={l} href={`../${l}/`} className="qlpress" aria-current={on ? 'page' : undefined}
            // Remembered by the `/` redirect (functions/index.js) on the next visit.
            onClick={() => { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; }}
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

// The bar floats over every scene and inverts against whatever is under it (mix-blend difference), so it
// needs no background of its own: bone on the dark lab, ink on the bone footer.
export function HeaderDesktop({ ko }: { ko: boolean }) {
  const t = useTranslations('header');
  const links = ['specimens', 'index', 'lab', 'contact'] as const;
  return (
    <header className="qlbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, height: 64, padding: '0 40px', color: BONE }}>
      <Logo mobile={false} />
      <nav aria-label={t('navLabel')} style={{ display: 'flex', gap: 30, fontSize: ko ? 14 : 13, letterSpacing: ko ? '0.02em' : '0.06em' }}>
        {links.map((k) => <a key={k} href={`#${k}`} className="qlnav" style={{ textDecoration: 'none' }}>{t(`nav.${k}`)}</a>)}
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
    <>
      <header className="qlbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 31, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 64, padding: '0 16px', color: BONE }}>
        <Logo mobile />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LangSwitch mobile />
          <button type="button" aria-label={open ? t('closeMenu') : t('openMenu')} aria-expanded={open} aria-controls="m-menu" onClick={() => setOpen(!open)} className="qlpress"
            style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BONE}`, background: 'transparent', color: BONE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={open ? 'M4 4l10 10M14 4L4 14' : 'M2 6h14M2 12h14'} /></svg>
          </button>
        </div>
      </header>
      {/* Full-screen menu, outside the blended bar so it keeps its own solid ground. */}
      {open && (
        <nav id="m-menu" aria-label={t('navLabel')} className="qlreveal" style={{ position: 'fixed', inset: 0, zIndex: 30, background: INK, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '80px 16px 40px' }}>
          {links.map((k, i) => (
            <a key={k} href={`#m-${k}`} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'baseline', gap: 14, minHeight: 64, textDecoration: 'none', fontFamily: KR, fontWeight: 700, fontSize: 44, letterSpacing: '-0.04em' }}>
              <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: 12, letterSpacing: '0.1em', color: ACCENT }}>0{i + 1}</span>{t(`nav.${k}`)}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
