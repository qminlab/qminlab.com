'use client';
import { useEffect, useRef, useState } from 'react';
import { ACCENT, BONE, MONO } from '@/lib/tokens';

const T = 'cubic-bezier(.7,0,.2,1)';

/**
 * "Q MIN" ⇄ "CURIOUS-MEAN" (mockup note ②). Every value below comes from the mockup:
 * 2.6s auto toggle, 1ch→8ch / 3ch→4ch over 700ms, second word 80ms late, rows 1.4em tall so the Q tail
 * leaves the window, outgoing letters fade in 250ms, Q reappears only after a 500ms delay when folding.
 */
export function Unfold({ mobile, aria }: { mobile: boolean; aria: string }) {
  const [unfold, setUnfold] = useState(false);
  const hold = useRef(false);
  useEffect(() => {
    const id = setInterval(() => { if (!hold.current) setUnfold((u) => !u); }, 2600);
    return () => clearInterval(id);
  }, []);
  const w1 = unfold ? 8 : 1, w2 = unfold ? 4 : 3, fy = unfold ? -1.4 : 0;
  const fa = unfold ? 0 : 1, fb = unfold ? 1 : 0;
  const faT = unfold ? 'opacity 250ms ease' : 'opacity 250ms ease 500ms';
  const ugap = unfold ? 0 : mobile ? 12 : 18;
  const handlers = mobile
    ? { onClick: () => setUnfold((u) => { hold.current = !u; return !u; }) }
    : {
        onMouseEnter: () => { hold.current = true; setUnfold(true); },
        onMouseLeave: () => { hold.current = false; },
        onClick: () => { hold.current = true; setUnfold((u) => !u); },
      };
  const row = { display: 'block', height: '1.4em' } as const;
  return (
    <button
      type="button"
      {...handlers}
      aria-label={aria}
      style={{
        alignSelf: 'flex-start', display: 'flex', alignItems: 'flex-end', gap: ugap, transition: `gap 700ms ${T}`,
        padding: 0, border: 0, background: 'transparent', color: BONE, fontFamily: MONO, fontWeight: 600,
        fontSize: mobile ? 'min(46px, 13cqw)' : 'min(78px, 13cqw)', lineHeight: 1, letterSpacing: 0, cursor: 'pointer',
      }}
    >
      <span style={{ display: 'inline-block', overflow: 'hidden', height: '1.4em', lineHeight: '1.4em', width: `${w1}ch`, transition: `width 700ms ${T}` }}>
        <span style={{ display: 'block', transform: `translateY(${fy}em)`, transition: `transform 700ms ${T}` }}>
          <span style={{ ...row, opacity: fa, transition: faT }}>Q</span>
          <span style={{ ...row, opacity: fb, transition: 'opacity 400ms ease', color: ACCENT }}>CURIOUS-</span>
        </span>
      </span>
      <span style={{ display: 'inline-block', overflow: 'hidden', height: '1.4em', lineHeight: '1.4em', width: `${w2}ch`, transition: `width 700ms ${T} 80ms` }}>
        <span style={{ display: 'block', transform: `translateY(${fy}em)`, transition: `transform 700ms ${T} 80ms` }}>
          <span style={{ ...row, opacity: fa, transition: faT }}>MIN</span>
          <span style={{ ...row, opacity: fb, transition: 'opacity 400ms ease 80ms', color: ACCENT }}>MEAN</span>
        </span>
      </span>
    </button>
  );
}
