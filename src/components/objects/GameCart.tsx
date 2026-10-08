'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { css } from '@/lib/cssMatrix';
import { ACCENT, ARCHIVO, BONE, INK, MONO_KR, MUTED } from '@/lib/tokens';
import { easeOutCubic as ease } from '@/lib/ease';
import { useReducedMotion } from '@/lib/useMedia';
import { CssCanvas, useGroup, useInvalidate } from '../three/CssCanvas';
import { makePlane, setCss, disposeMesh } from '../three/Plane';
import { boxFaces } from '../three/cube';
import { paintTexture, cssFont, useFontsReady, centerText } from '../three/textures';

const SHADE = { front: 1, back: 1, right: 0.8, left: 0.7, top: 1.1, bottom: 0.5 } as const;

function Cart({ ko }: { ko: boolean }) {
  const ready = useFontsReady();
  const invalidate = useInvalidate();
  const group = useGroup();
  const faces = useMemo(() => {
    const arch = cssFont('--font-archivo', 'sans-serif');
    const mono = cssFont('--font-mono', 'monospace');
    const kr = cssFont('--font-kr', 'sans-serif');
    const G = css('rotateX(-16deg) rotateY(-30deg)');
    return boxFaces(200, 230, 34).map((f) => {
      const front = f.id === 'front' || f.id === 'back';
      const tex = paintTexture(f.fw, f.fh, (ctx, w, h) => {
        ctx.fillStyle = BONE; ctx.fillRect(0, 0, w, h);
        if (front) {
          // bottom barcode strip: repeating-linear-gradient(90deg, #BDB8AA 0 5px, BONE 5px 10px) 50% 100%/86% 12%
          const sw = w * 0.86, sh = h * 0.12, sx = (w - sw) / 2, sy = h - sh;
          for (let x = 0; x < sw; x += 10) { ctx.fillStyle = '#BDB8AA'; ctx.fillRect(sx + x, sy, Math.min(5, sw - x), sh); }
          // accent label block: 50% 22% / 80% 40%
          const aw = w * 0.8, ah = h * 0.4;
          ctx.fillStyle = ACCENT; ctx.fillRect((w - aw) / 2, (h - ah) * 0.22, aw, ah);
          const lh = 21 * 0.95;
          centerText(ctx, 'UNTITLED', w / 2, 34 + lh / 2, `900 21px ${arch}`, INK, 0, 'expanded');
          centerText(ctx, 'GAME', w / 2, 34 + lh * 1.5, `900 21px ${arch}`, INK, 0, 'expanded');
          centerText(ctx, 'QMIN LAB · ' + (ko ? '재설계 중' : 'REDESIGN'), w / 2 - 9 * 0.07, 34 + lh * 2 + 4 + 6.5, `400 9px ${mono}, ${kr}`, INK, 9 * 0.14);
        } else if (f.id === 'top') {
          for (let x = 0; x < w; x += 12) { ctx.fillStyle = '#CFCABD'; ctx.fillRect(x, 0, 6, h); }
        } else {
          ctx.fillStyle = '#CFCABD'; ctx.fillRect(0, 0, w, h);
        }
      });
      const mesh = makePlane(f.fw, f.fh, tex, { shade: SHADE[f.id] });
      setCss(mesh, G.clone().multiply(f.local));
      return mesh;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ko, ready]);
  useEffect(() => {
    faces.forEach((m) => group.add(m));
    invalidate();
    return () => faces.forEach((m) => { group.remove(m); disposeMesh(m); });
  }, [faces, group, invalidate]);
  return null;
}

/** Frozen cartridge: no rotation, grayscale + blur, a 0.12s glitch every 3.4s, hazard tape slides in. */
export function GameCart({ active, ko, onReady }: { active: boolean; ko: boolean; onReady?: () => void }) {
  const [glitch, setGlitch] = useState(false);
  const [tape, setTape] = useState(0);
  const reduce = useReducedMotion();
  const since = useRef(0);
  // The hazard tape waits for the cartridge's first frame, so the animation starts once it is visible.
  const [drawn, setDrawn] = useState(false);
  const ready = () => { setDrawn(true); onReady?.(); };
  useEffect(() => {
    if (!active || !drawn) return;
    since.current = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now / 1000;
      setGlitch(!reduce && t % 3.4 < 0.12);
      const k = Math.min(1, (now - since.current) / 1200);
      setTape(k);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduce, drawn]);
  const tapeX = ((1 - ease(reduce ? 1 : tape)) * -460).toFixed(1);
  return (
    <div style={{ position: 'relative', width: 420, height: 460, overflow: 'hidden', fontFamily: MONO_KR, color: BONE }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '210px 200px', filter: `grayscale(0.85) brightness(0.72) contrast(0.92) blur(${glitch ? 1.6 : 0.5}px)`, transform: `translateX(${glitch ? 5 : 0}px) skewX(${glitch ? 3 : 0}deg)` }}>
        <CssCanvas perspective={1400} originX={210} originY={200} active={false} onReady={ready}>
          <Cart ko={ko} />
        </CssCanvas>
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 1px, transparent 1px 3px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: '50%', top: 200, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div aria-hidden="true" style={{ display: 'flex', gap: 14 }}>
          <span style={{ width: 16, height: 58, background: BONE, boxShadow: `0 0 0 3px ${INK}` }} />
          <span style={{ width: 16, height: 58, background: BONE, boxShadow: `0 0 0 3px ${INK}` }} />
        </div>
        <span style={{ padding: '4px 10px', background: INK, border: `1px dashed ${MUTED}`, fontSize: 12, letterSpacing: '0.16em' }}>{ko ? '일시정지' : 'PAUSED'}</span>
      </div>
      <div style={{ position: 'absolute', left: 22, top: 18, fontSize: 9, letterSpacing: '0.14em', color: MUTED }}>■ 00:13:07 · FRAME 0412</div>
      <div style={{ position: 'absolute', right: 22, top: 18, fontSize: 9, letterSpacing: '0.14em', color: MUTED }}>QL-004</div>
      <div style={{ position: 'absolute', left: -30, right: -30, bottom: 58, height: 30, transform: `rotate(-5deg) translateX(${tapeX}px)`, background: `repeating-linear-gradient(-45deg, ${ACCENT} 0 14px, ${INK} 14px 28px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ padding: '3px 12px', background: INK, color: ACCENT, fontSize: 11, letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>{ko ? '재설계 중 · 잠시 멈춤' : 'REDESIGN IN PROGRESS · ON HOLD'}</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontSize: 10, letterSpacing: '0.14em', color: MUTED }}>{ko ? 'UNTITLED GAME · 일시정지' : 'UNTITLED GAME · PAUSED'}</div>
    </div>
  );
}
void ARCHIVO;
