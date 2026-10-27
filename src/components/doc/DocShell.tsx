import type { ReactNode } from 'react';
import { ACCENT, BODY, BONE, INK, KR, LINE, MONO, MONO_KR, MUTED } from '@/lib/tokens';
import { EMAIL, UPDATED } from '@/lib/identity';

/**
 * Plain text pages (profile, FAQ, case files): no canvas, no scroll effects, every fact in selectable HTML.
 * They are what search engines and AI assistants quote, so readability comes before spectacle here.
 */
export function DocShell({ ko, back, eyebrow, title, updated, children }: { ko: boolean; back: string; eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: INK, color: BONE, fontFamily: ko ? KR : MONO, wordBreak: ko ? 'keep-all' : undefined }}>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 16px 96px' }}>
        <a href={ko ? '/ko/' : '/en/'} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontFamily: ko ? MONO_KR : MONO, fontSize: 13, color: BONE, textDecoration: 'none', letterSpacing: '0.06em' }}>{back}</a>
        <p style={{ margin: '32px 0 8px', fontFamily: ko ? MONO_KR : MONO, fontSize: 12, letterSpacing: '0.12em', color: ACCENT }}>{eyebrow}</p>
        <h1 style={{ margin: 0, fontSize: 'clamp(34px, 6vw, 52px)', lineHeight: 1.15, letterSpacing: '-0.04em', fontWeight: 700 }}>{title}</h1>
        <p style={{ margin: '12px 0 0', fontFamily: ko ? MONO_KR : MONO, fontSize: 12, color: MUTED }}>{updated} <time dateTime={UPDATED}>{UPDATED}</time></p>
        <div style={{ marginTop: 40, display: 'grid', gap: 48, fontSize: 16, lineHeight: 1.8, color: BODY }}>{children}</div>
        <footer style={{ marginTop: 80, paddingTop: 20, borderTop: `1px solid ${LINE}`, fontFamily: ko ? MONO_KR : MONO, fontSize: 12, color: MUTED }}>
          © 2026 QMINLAB · <a href={`mailto:${EMAIL}`} style={{ color: BONE }}>{EMAIL}</a>
        </footer>
      </main>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.3, color: BONE, letterSpacing: '-0.02em' }}>{title}</h2>
      {children}
    </section>
  );
}

/** Label / value rows as a definition list, so each fact reads as its own sentence when quoted. */
export function Facts({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'minmax(96px, max-content) 1fr', gap: '10px 20px' }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'contents' }}>
          <dt style={{ color: MUTED }}>{r.label}</dt>
          <dd style={{ margin: 0, color: BONE }}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const linkStyle = { color: BONE, textDecorationColor: ACCENT, textUnderlineOffset: 4 } as const;
