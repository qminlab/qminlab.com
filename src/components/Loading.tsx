import { ACCENT, LINE, MONO_KR, MUTED } from '@/lib/tokens';

/**
 * Placeholder shown where a 3D specimen will appear until its first frame is drawn. It is absolutely
 * positioned over the stage and only fades (no size of its own), so removing it never moves layout.
 */
export function Loading({ show, code, label }: { show: boolean; code: string; label: string }) {
  return (
    <div role={show ? 'status' : undefined} aria-hidden={!show} aria-label={show ? `${code} · ${label}` : undefined}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, pointerEvents: 'none', opacity: show ? 1 : 0, visibility: show ? 'visible' : 'hidden', transition: show ? 'none' : 'opacity 400ms ease, visibility 0s 400ms', fontFamily: MONO_KR }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <div className="qlspin" style={{ position: 'absolute', inset: 0, border: `1px dashed ${ACCENT}`, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', left: '50%', top: -8, bottom: -8, width: 1, background: ACCENT, opacity: 0.6 }} />
        <div style={{ position: 'absolute', top: '50%', left: -8, right: -8, height: 1, background: ACCENT, opacity: 0.6 }} />
        <div className="qldot" style={{ position: 'absolute', left: '50%', top: '50%', width: 6, height: 6, margin: '-3px 0 0 -3px', background: ACCENT }} />
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.14em', color: MUTED, whiteSpace: 'nowrap' }}>{code} · {label}</div>
      <div style={{ position: 'relative', width: 120, height: 2, background: LINE, overflow: 'hidden' }}>
        <span className="qlscan" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%', background: ACCENT }} />
      </div>
    </div>
  );
}
