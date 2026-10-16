'use client';
import type { CSSProperties } from 'react';
import { ACCENT, BONE, INK, MONO, MONO_KR, MUTED, type Status } from '@/lib/tokens';

/** Rounded status pill (shared Open Lab rule): review = accent fill, dev = bone outline, use = accent outline,
 *  paused = muted dashed outline, live = bone fill. */
export function StatusPill({ st, label, ko, small }: { st: Status; label: string; ko: boolean; small?: boolean }) {
  const s: CSSProperties =
    st === 'review' ? { background: ACCENT, color: INK, border: `1px solid ${ACCENT}` }
      : st === 'live' ? { background: BONE, color: INK, border: `1px solid ${BONE}` }
        : st === 'use' ? { color: ACCENT, border: `1px solid ${ACCENT}` }
          : st === 'paused' ? { color: MUTED, border: `1px dashed ${MUTED}` }
            : { color: BONE, border: `1px solid ${BONE}` };
  return (
    <span style={{ ...s, display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', padding: small ? '6px 12px' : '7px 14px', borderRadius: 999, fontFamily: ko ? MONO_KR : MONO, fontSize: small ? 11 : 12, letterSpacing: '0.06em', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
      <span aria-hidden="true" className={st === 'paused' ? undefined : 'qldot'} style={{ fontSize: st === 'paused' ? 9 : 10 }}>{st === 'paused' ? '❚❚' : '●'}</span>{label}
    </span>
  );
}

/** Giant outlined specimen numbers (001…005) stacked in one spot; the current one shows, the others wait
 *  off to the side they will come from, so a step change slides and crossfades them like the reel. */
export function OutlineNumbers({ count, step, className, shift = 18 }: { count: number; step: number; className: string; shift?: number }) {
  return (
    <div aria-hidden="true" className={className}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="sp-num qlswap" style={{ opacity: i === step ? 1 : 0, transform: `translateX(${i === step ? 0 : i < step ? -shift : shift}vw)` }}>
          {String(i + 1).padStart(3, '0')}
        </span>
      ))}
    </div>
  );
}
