'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, type Mesh } from 'three';
import { css, box } from '@/lib/cssMatrix';
import { ACCENT, BONE, INK, MONO_KR, MUTED, LINE } from '@/lib/tokens';
import { easeOutCubic as ease } from '@/lib/ease';
import { CssCanvas } from '../three/CssCanvas';
import { makePlane, setCss, setOpacity, disposeMesh } from '../three/Plane';
import { paintTexture } from '../three/textures';
import { hexPath, polyPath, roundRect } from '../three/paint';

const A = ACCENT;
const X0 = -(7 * 58 + 29) / 2;
const Y0 = -(3 * 49 + 64) / 2;
type Kind = 'pawn' | 'tower' | 'crystal' | 'wedge' | 'orb';
const UNITS: [number, number, Kind][] = [[0, 1, 'tower'], [0, 4, 'pawn'], [1, 2, 'crystal'], [1, 5, 'wedge'], [2, 3, 'orb']];
type Part = { w: number; h: number; br: 'circle' | number; clip?: [number, number][] };
const P: Record<Kind, Part[]> = {
  pawn: [{ w: 14, h: 14, br: 'circle' }, { w: 26, h: 26, br: 0, clip: [[32, 0], [68, 0], [100, 100], [0, 100]] }, { w: 34, h: 6, br: 3 }],
  tower: [{ w: 24, h: 8, br: 0, clip: [[0, 0], [30, 0], [30, 50], [70, 50], [70, 0], [100, 0], [100, 100], [0, 100]] }, { w: 20, h: 32, br: 0 }, { w: 30, h: 6, br: 3 }],
  crystal: [{ w: 22, h: 44, br: 0, clip: [[50, 0], [100, 40], [50, 100], [0, 40]] }, { w: 26, h: 6, br: 3 }],
  wedge: [{ w: 28, h: 38, br: 0, clip: [[35, 0], [100, 28], [68, 46], [100, 100], [0, 100], [12, 40]] }, { w: 32, h: 6, br: 3 }],
  orb: [{ w: 24, h: 24, br: 'circle' }, { w: 6, h: 10, br: 0 }, { w: 28, h: 6, br: 3 }],
};
const PAD = 12;

type Refs = { p: (HTMLElement | null)[]; fit: HTMLElement | null; fitN: HTMLElement | null };

function Board({ active, refs }: { active: boolean; refs: React.RefObject<Refs> }) {
  const group = useMemo(() => new Group(), []);
  const since = useRef(0);
  const was = useRef(false);

  const parts = useMemo(() => {
    const occupied = new Set(UNITS.map(([r, c]) => `${r}-${c}`));
    const plate = makePlane(520, 300, paintTexture(520, 300, (ctx, w, h) => {
      ctx.fillStyle = '#10120E'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    }));
    const side = makePlane(520, 16, paintTexture(520, 16, (ctx, w, h) => {
      ctx.fillStyle = '#1B1E18'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = A; ctx.fillRect(0, 0, w, 1);
    }));
    const cells = makePlane(520, 300, paintTexture(520, 300, (ctx) => {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
        const on = occupied.has(`${r}-${c}`);
        const x = X0 + c * 58 + (r % 2) * 29 + 260, y = Y0 + r * 49 + 150;
        hexPath(ctx, x, y, 56, 64); ctx.fillStyle = on ? A : '#2F332B'; ctx.fill();
        hexPath(ctx, x + 2, y + 2, 52, 60); ctx.fillStyle = on ? 'rgba(255,90,31,0.16)' : r < 2 ? '#181B15' : '#1D201A'; ctx.fill();
      }
    }), { depthWrite: false });
    const units = UNITS.map(([r, c, kind]) => {
      const ps = P[kind];
      const bw = Math.max(...ps.map((p) => p.w));
      const bh = ps.reduce((s, p) => s + p.h, 0) + (ps.length - 1);
      const body = makePlane(bw, bh, paintTexture(bw, bh, (ctx) => {
        // Shapes first, then the hologram scanlines inside them, then the glow underneath.
        const shape = document.createElement('canvas');
        shape.width = Math.ceil((bw + PAD * 2) * 2); shape.height = Math.ceil((bh + PAD * 2) * 2);
        const s = shape.getContext('2d')!;
        s.scale(2, 2); s.translate(PAD, PAD);
        let y = 0;
        for (const p of ps) {
          const x = (bw - p.w) / 2;
          if (p.br === 'circle') { s.beginPath(); s.ellipse(x + p.w / 2, y + p.h / 2, p.w / 2, p.h / 2, 0, 0, Math.PI * 2); }
          else if (p.clip) polyPath(s, x, y, p.w, p.h, p.clip);
          else if (p.br) roundRect(s, x, y, p.w, p.h, p.br);
          else { s.beginPath(); s.rect(x, y, p.w, p.h); }
          s.save(); s.clip();
          for (let yy = y + p.h; yy > y - 3; yy -= 3) {
            s.fillStyle = 'rgba(255,140,90,0.85)'; s.fillRect(x, yy - 1, p.w, 1);
            s.fillStyle = 'rgba(255,90,31,0.28)'; s.fillRect(x, yy - 3, p.w, 2);
          }
          s.restore();
          y += p.h + 1;
        }
        ctx.save();
        ctx.shadowColor = 'rgba(255,90,31,0.8)'; ctx.shadowBlur = 6;
        ctx.drawImage(shape, -PAD, -PAD, bw + PAD * 2, bh + PAD * 2);
        ctx.restore();
      }, PAD), { pad: PAD, depthWrite: false, order: 3 });
      const ring = makePlane(44, 44, paintTexture(44, 44, (ctx) => {
        ctx.strokeStyle = A; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(22, 22, 21.25, 0, Math.PI * 2); ctx.stroke();
      }), { depthWrite: false, order: 1 });
      const beam = makePlane(2, 64, paintTexture(2, 64, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(255,90,31,0.8)'); g.addColorStop(1, 'rgba(255,90,31,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }), { depthWrite: false, order: 2 });
      const cx = X0 + c * 58 + (r % 2) * 29 + 28, cy = Y0 + r * 49 + 32;
      return { body, ring, beam, bw, bh, cx, cy };
    });
    return { plate, side, cells, units };
  }, []);

  useEffect(() => {
    const all: Mesh[] = [parts.plate, parts.side, parts.cells, ...parts.units.flatMap((u) => [u.ring, u.beam, u.body])];
    all.forEach((m) => group.add(m));
    return () => all.forEach((m) => { group.remove(m); disposeMesh(m); });
  }, [parts, group]);

  useFrame(() => {
    const t = performance.now() / 1000;
    if (active && !was.current) since.current = t;
    was.current = active;
    const intro = Math.max(0, Math.min(1, (t - since.current) / 1.8));
    const G = css(`rotateX(56deg) rotateZ(${(-6 + Math.sin(t * 0.4) * 3).toFixed(3)}deg)`);
    setCss(parts.plate, G.clone().multiply(box(-260, -150, 520, 300, 'translateZ(-3px)')));
    setCss(parts.side, G.clone().multiply(box(-260, 150, 520, 16, 'translateZ(-3px) rotateX(-90deg)', 260, 0)));
    setCss(parts.cells, G.clone().multiply(box(-260, -150, 520, 300)));
    parts.units.forEach((u, i) => {
      const k = ease(intro * 1.6 - 0.15 - i * 0.12);
      const z = 4 + 24 * k + Math.sin(t * 1.8 + i) * 2.5;
      const pulse = (t * 0.8 + i * 0.2) % 1;
      setCss(u.ring, G.clone().multiply(box(u.cx - 22, u.cy - 22, 44, 44, `translateZ(1px) scale(${0.6 + pulse * 0.6})`)));
      setOpacity(u.ring, (1 - pulse) * k);
      const beam = z + 6;
      setCss(u.beam, G.clone().multiply(box(u.cx - 1, u.cy, 2, beam, 'rotateX(90deg)', 1, 0)).multiply(css(`scale(1, ${beam / 64})`)));
      setOpacity(u.beam, k);
      setCss(u.body, G.clone().multiply(css(`translateZ(${z}px)`)).multiply(box(u.cx, u.cy - u.bh, u.bw, u.bh, `rotateX(-56deg) translateX(${-u.bw / 2}px)`, 0, u.bh)));
      setOpacity(u.body, k);
    });
    const R = refs.current;
    if (R) {
      R.p.forEach((el, i) => {
        if (!el) return;
        const k = ease(intro * 1.6 - 0.75 - Math.min(i, 2) * 0.14);
        if (i === 3) { el.style.opacity = k.toFixed(3); return; }
        el.style.opacity = k.toFixed(3);
        el.style.transform = `translateY(${((1 - k) * 12).toFixed(1)}px)`;
      });
      const fit = Math.round(87 * ease(intro * 1.6 - 0.8));
      if (R.fit) R.fit.style.width = `${fit}%`;
      if (R.fitN) R.fitN.textContent = `${fit}%`;
    }
  });

  return <primitive object={group} />;
}

export function TftBoard({ active, ko }: { active: boolean; ko: boolean }) {
  const refs = useRef<Refs>({ p: [], fit: null, fitN: null });
  const T = ko
    ? { comp: '추천 덱', compName: '선봉 러시', fit: '적합도', items: '아이템 조합', next: '다음 라운드', tip: '지금 레벨업, 4-5에서 리롤', source: 'LoLCHESS 공략 기반 · 예시 데이터', win: 'TFT 게임 화면 · 1920×1080' }
    : { comp: 'RECOMMENDED COMP', compName: 'Vanguard Rush', fit: 'FIT', items: 'ITEM COMBOS', next: 'NEXT ROUND', tip: 'Level up now, roll at 4-5', source: 'BASED ON LoLCHESS GUIDES · SAMPLE DATA', win: 'TFT GAME WINDOW · 1920×1080' };
  const items = ko
    ? [['Ⅰ', 'Ⅰ', '쌍날', '→ 02'], ['Ⅱ', 'Ⅲ', '수호막', '→ 01'], ['Ⅳ', 'Ⅴ', '파동', '→ 05']]
    : [['Ⅰ', 'Ⅰ', 'Twin Edge', '→ 02'], ['Ⅱ', 'Ⅲ', 'Ward', '→ 01'], ['Ⅳ', 'Ⅴ', 'Pulse', '→ 05']];
  const hexClip = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';
  const pRef = (i: number) => (el: HTMLElement | null) => { refs.current.p[i] = el; };
  const sq = { width: 18, height: 18, border: `1px solid ${BONE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 } as const;
  return (
    <div style={{ position: 'relative', width: 600, height: 500, overflow: 'hidden', fontFamily: MONO_KR, color: BONE }}>
      <CssCanvas perspective={1100} originX={300} originY={290} active={active}>
        <Board active={active} refs={refs} />
      </CssCanvas>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 14, border: '1px dashed #3A3D35' }} />
      <div style={{ position: 'absolute', left: 22, top: 6, padding: '0 6px', background: 'transparent', fontSize: 9, letterSpacing: '0.14em', color: MUTED }}>{T.win}</div>
      <div style={{ position: 'absolute', right: 22, top: 6, padding: '0 6px', fontSize: 9, letterSpacing: '0.14em', color: A }}>● OVERLAY ON · v0.1</div>

      <section ref={pRef(0)} style={{ position: 'absolute', left: 28, top: 28, width: 214, boxSizing: 'border-box', padding: 12, background: 'rgba(12,13,11,0.86)', border: `1px solid ${A}`, opacity: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9, letterSpacing: '0.14em', color: MUTED }}>
          <span>{T.comp}</span>
          <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: A, color: INK, fontSize: 12, fontWeight: 600 }}>S</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{T.compName}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
          {[1, 2, 3, 4, 5, 6].map((n, i) => (
            <span key={n} style={{ width: 24, height: 27, clipPath: hexClip, background: i < 2 ? A : i < 5 ? BONE : MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: INK, fontWeight: 600 }}>{'0' + n}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 9, letterSpacing: '0.12em', color: MUTED }}>
          <span>{T.fit}</span>
          <span style={{ flex: 1, height: 3, background: LINE }}><span ref={(el) => { refs.current.fit = el; }} style={{ display: 'block', height: '100%', width: '0%', background: A }} /></span>
          <span ref={(el) => { refs.current.fitN = el; }} style={{ color: BONE }}>0%</span>
        </div>
      </section>

      <section ref={pRef(1)} style={{ position: 'absolute', right: 28, top: 28, width: 196, boxSizing: 'border-box', padding: 12, background: 'rgba(12,13,11,0.86)', border: `1px solid ${BONE}`, opacity: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.14em', color: MUTED }}>{T.items}</div>
        {items.map(([a, b, out, to]) => (
          <div key={out} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11 }}>
            <span style={sq}>{a}</span><span style={{ color: MUTED }}>+</span><span style={sq}>{b}</span><span style={{ color: MUTED }}>→</span>
            <span style={{ flex: 1, color: A }}>{out}</span><span style={{ fontSize: 9, color: MUTED }}>{to}</span>
          </div>
        ))}
      </section>

      <section ref={pRef(2)} style={{ position: 'absolute', left: '50%', bottom: 26, width: 320, marginLeft: -160, boxSizing: 'border-box', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(12,13,11,0.86)', border: '1px solid #3A3D35', opacity: 0 }}>
        <span style={{ fontSize: 9, letterSpacing: '0.14em', color: MUTED, lineHeight: 1.5 }}>{T.next}<br /><span style={{ fontSize: 16, color: BONE, letterSpacing: 0 }}>4-2</span></span>
        <span style={{ width: 1, alignSelf: 'stretch', background: LINE }} />
        <span style={{ flex: 1, fontSize: 11, lineHeight: 1.5 }}>{T.tip}<br /><span style={{ fontSize: 9, color: MUTED, letterSpacing: '0.1em' }}>GOLD 50 · LV 7 · HP 64</span></span>
      </section>
      <div ref={(el) => { refs.current.p[3] = el; }} style={{ position: 'absolute', left: 28, bottom: 30, fontSize: 8, letterSpacing: '0.14em', color: '#5E5C55', opacity: 0 }}>{T.source}</div>
    </div>
  );
}
