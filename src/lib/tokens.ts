// Values copied from the approved mockup (Concept A · Specimen Lab).
export const INK = '#0C0D0B';
export const PANEL = '#11130F';
export const LINE = '#2B2E27';
export const BONE = '#ECE8DE';
export const MUTED = '#8D8B82';
export const BODY = '#B9B6AC';
export const DIM = '#5E5C55';
export const ACCENT = '#FF5A1F';

export const MONO = "var(--font-mono), monospace";
export const MONO_KR = "var(--font-mono), var(--font-kr), monospace";
export const KR = "var(--font-kr), sans-serif";
export const ARCHIVO = "var(--font-archivo), sans-serif";

export const DOTS = `radial-gradient(${LINE} 1px, transparent 1.6px) 0 0/22px 22px, ${PANEL}`;
export const DOTS_M = `radial-gradient(${LINE} 1px, transparent 1.6px) 0 0/20px 20px, ${PANEL}`;
export const XRAY = (cell: number) =>
  `linear-gradient(rgba(255,90,31,0.16) 1px, transparent 1px) 0 0/${cell}px ${cell}px, linear-gradient(90deg, rgba(255,90,31,0.16) 1px, transparent 1px) 0 0/${cell}px ${cell}px, #170A04`;

export const EASE_SWAP = 'cubic-bezier(.7,0,.2,1)';

export type Status = 'review' | 'dev' | 'live' | 'use' | 'paused';
export const pill = (st: Status) =>
  st === 'review'
    ? { bg: ACCENT, fg: INK, bd: ACCENT }
    : st === 'live'
      ? { bg: BONE, fg: INK, bd: BONE }
      : st === 'use'
        ? { bg: 'transparent', fg: ACCENT, bd: ACCENT }
        : st === 'paused'
        ? { bg: 'transparent', fg: BODY, bd: MUTED }
        : { bg: 'transparent', fg: BONE, bd: BONE };
