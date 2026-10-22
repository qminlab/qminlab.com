'use client';
import { useTranslations } from 'next-intl';
import { ACCENT, BONE, INK, MONO, MONO_KR } from '@/lib/tokens';
import { CASES, linksFor } from '@/lib/links';

/** Outbound buttons for a project (GitHub, stores, downloads). Renders nothing until a project has one. */
export function ProjectLinks({ code, ko, small, active = true, onAccent }: { code: string; ko: boolean; small?: boolean; active?: boolean; onAccent?: boolean }) {
  const t = useTranslations('linkKinds');
  const links = linksFor(code);
  if (!links.length) return null;
  const bd = onAccent ? INK : ACCENT;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" tabIndex={active ? 0 : -1} className="qllink"
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 999, border: `1px solid ${bd}`, color: onAccent ? INK : BONE, fontFamily: ko ? MONO_KR : MONO, fontSize: small ? 12 : ko ? 13 : 12, letterSpacing: ko ? '0.04em' : '0.12em', textDecoration: 'none' }}>
          {t(l.kind)} <span aria-hidden="true" style={{ color: onAccent ? INK : ACCENT }}>↗</span>
        </a>
      ))}
    </div>
  );
}

/** "Read case file" link for projects that have their own page; renders nothing for the rest. */
export function CaseLink({ code, ko, active = true }: { code: string; ko: boolean; active?: boolean }) {
  const t = useTranslations('specimens');
  const href = CASES[code];
  if (!href) return null;
  return (
    <a href={href} tabIndex={active ? 0 : -1} className="sp-case" onClick={(e) => e.stopPropagation()}
      style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontFamily: ko ? MONO_KR : MONO, fontSize: ko ? 13 : 12, letterSpacing: ko ? '0.04em' : '0.1em', color: BONE, textDecoration: 'none', borderBottom: `1px solid ${ACCENT}`, alignSelf: 'flex-start' }}>
      {t(code === 'QL-004' ? 'siteLink' : 'link')}
    </a>
  );
}
