'use client';
import { useEffect, useMemo, useRef } from 'react';
import type { Mesh } from '../three/gl';
import { css, box } from '@/lib/cssMatrix';
import { ACCENT, MONO, KR, MUTED, BONE } from '@/lib/tokens';
import { easeOutCubic as ease } from '@/lib/ease';
import { CssCanvas, useFrame, useGroup } from '../three/CssCanvas';
import { makePlane, setCss, setOpacity, disposeMesh } from '../three/Plane';
import { paintTexture, cssFont, useFontsReady, measure } from '../three/textures';
import { annulus, repeatSegs, type Seg } from '../three/paint';

const A = ACCENT;
const BONE6 = 'rgba(236,232,222,0.6)';
const GLOW = 'rgba(255,90,31,0.75)';
// Ring definitions copied from the mockup (radius, thickness, z, deg/s, pattern, glow).
const DEFS: { r: number; th: number; z: number; v: number; segs: Seg[]; glow: boolean }[] = [
  { r: 200, th: 9, z: -34, v: 6, segs: repeatSegs(0.7, 5, BONE6), glow: false },
  { r: 182, th: 3, z: -34, v: -11, segs: [[0, 112, A], [196, 228, A]], glow: true },
  { r: 152, th: 14, z: 6, v: 17, segs: repeatSegs(1.6, 15, 'rgba(255,90,31,0.85)'), glow: false },
  { r: 128, th: 2, z: 38, v: -24, segs: [[0, 360, BONE6]], glow: false },
  { r: 106, th: 8, z: 62, v: 38, segs: repeatSegs(38, 90, A), glow: true },
  { r: 74, th: 4, z: 88, v: -58, segs: repeatSegs(3, 9, BONE6), glow: false },
  { r: 48, th: 2, z: 108, v: 90, segs: [[0, 260, A]], glow: true },
];
const PAD = 14;

type Pointer = { current: { x: number; y: number } };

function Rings({ active, labels, nameRef, pointer }: { active: boolean; labels: string[]; nameRef: React.RefObject<HTMLDivElement | null>; pointer?: Pointer }) {
  const ready = useFontsReady();
  const group = useGroup();
  const since = useRef(0);
  const wasActive = useRef(false);
  const tilt = useRef({ x: 0, y: 0 });

  const parts = useMemo(() => {
    const rings = DEFS.map((d) => {
      const tex = paintTexture(d.r * 2, d.r * 2, (ctx) => annulus(ctx, d.r, d.r, d.r, d.th, d.segs, d.glow ? GLOW : undefined), PAD);
      return makePlane(d.r * 2, d.r * 2, tex, { pad: PAD, depthWrite: false });
    });
    const beam = makePlane(2, 230, paintTexture(2, 230, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, 'rgba(255,90,31,0)'); g.addColorStop(0.4, 'rgba(255,90,31,0.7)'); g.addColorStop(1, 'rgba(255,90,31,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }), { depthWrite: false });
    const core = makePlane(92, 92, paintTexture(92, 92, (ctx) => {
      const g = ctx.createRadialGradient(46, 46, 0, 46, 46, 46);
      g.addColorStop(0, '#FFF1E8'); g.addColorStop(7 / 46, '#FFF1E8'); g.addColorStop(12 / 46, A);
      g.addColorStop(26 / 46, 'rgba(255,90,31,0.35)'); g.addColorStop(1, 'rgba(255,90,31,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 92, 92);
    }), { depthWrite: false });
    const mono = cssFont('--font-mono', 'monospace');
    const kr = cssFont('--font-kr', 'sans-serif');
    const font = `400 10px ${mono}, ${kr}`;
    const tags = labels.map((text) => {
      const probe = document.createElement('canvas').getContext('2d')!;
      const m = measure(probe, text, font, 1.2);
      const bw = Math.ceil(m.w + 14 + 2), bh = Math.ceil(m.asc + m.desc + 6 + 2);
      const tex = paintTexture(bw, bh, (ctx, w, h) => {
        ctx.fillStyle = 'rgba(12,13,11,0.75)'; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,90,31,0.6)'; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
        ctx.font = font; ctx.letterSpacing = '1.2px'; ctx.fillStyle = A; ctx.fillText(text, 8, 4 + m.asc);
      });
      return { mesh: makePlane(bw, bh, tex, { depthWrite: false, order: 2 }), bw, bh };
    });
    return { rings, beam, core, tags };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels.join('|'), ready]);

  useEffect(() => {
    const all = [...parts.rings, parts.beam, parts.core, ...parts.tags.map((t) => t.mesh)];
    all.forEach((m: Mesh) => group.add(m));
    return () => all.forEach((m) => { group.remove(m); disposeMesh(m); });
  }, [parts, group]);

  useFrame(() => {
    const t = performance.now() / 1000;
    if (active && !wasActive.current) since.current = t;
    wasActive.current = active;
    const intro = Math.max(0, Math.min(1, (t - since.current) / 1.4));
    // Cursor tilt ±6° (mockup note: "링 전체가 커서 방향으로 ±6° 기울어짐").
    const p = pointer?.current ?? { x: 0, y: 0 };
    tilt.current.x += (p.x * 6 - tilt.current.x) * 0.08;
    tilt.current.y += (p.y * 6 - tilt.current.y) * 0.08;
    const G = css(`rotateY(${tilt.current.x}deg) rotateX(${-tilt.current.y}deg) translateY(${(Math.sin(t * 0.9) * 6).toFixed(2)}px) rotateX(64deg) rotateZ(${(t * 3) % 360}deg)`);
    DEFS.forEach((d, i) => {
      const k = ease(intro * 1.7 - i * 0.1);
      const tf = css(`translateZ(${d.z * k}px) rotateZ(${(t * d.v) % 360}deg) scale(${0.6 + 0.4 * k})`);
      setCss(parts.rings[i], G.clone().multiply(tf).multiply(box(-d.r, -d.r, d.r * 2, d.r * 2)));
      setOpacity(parts.rings[i], k);
    });
    setCss(parts.beam, G.clone().multiply(box(-1, -230, 2, 230, 'rotateX(-64deg)', 1, 230)));
    setOpacity(parts.beam, (0.5 + Math.sin(t * 1.7) * 0.2) * ease(intro * 2 - 0.4));
    const cs = 1 + Math.sin(t * 2.4) * 0.08;
    setCss(parts.core, G.clone().multiply(css('translateZ(118px) rotateX(-64deg)')).multiply(box(-46, -46, 92, 92, `scale(${cs})`)));
    setOpacity(parts.core, ease(intro * 2));
    parts.tags.forEach((tg, i) => {
      const th = ((t * 12 + i * 90) * Math.PI) / 180;
      const k = ease(intro * 1.4 - 0.5 - i * 0.08);
      const tr = css(`translate3d(${Math.cos(th) * 168}px, ${Math.sin(th) * 168}px, ${14 + 10 * Math.sin(t + i)}px)`);
      setCss(tg.mesh, G.clone().multiply(tr).multiply(box(0, -tg.bh, tg.bw, tg.bh, `rotateX(-64deg) translateX(${-tg.bw / 2}px)`, 0, tg.bh)));
      setOpacity(tg.mesh, k);
    });
    if (nameRef.current) nameRef.current.style.opacity = String(ease(intro * 1.5 - 0.6));
  });

  return null;
}

export function JarvisCore({ active, ko, pointer, onReady }: { active: boolean; ko: boolean; pointer?: Pointer; onReady?: () => void }) {
  const nameRef = useRef<HTMLDivElement>(null);
  const labels = ko ? ['시각 · YOLO', '음성 · WHISPER', '계획 · CLAUDE', '서버 · FASTAPI'] : ['VISION · YOLO', 'VOICE · WHISPER', 'PLAN · CLAUDE', 'API · FASTAPI'];
  return (
    <div style={{ position: 'relative', width: 480, height: 500, overflow: 'hidden', fontFamily: MONO, color: BONE }}>
      <CssCanvas perspective={1100} originX={240} originY={210} active={active} onReady={onReady}>
        <Rings active={active} labels={labels} nameRef={nameRef} pointer={pointer} />
      </CssCanvas>
      <div ref={nameRef} style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 22, fontWeight: 600, letterSpacing: '0.06em' }}>
          <span>JARVIS</span><span style={{ color: '#5E5C55' }}>/</span><span style={{ fontFamily: KR, fontWeight: 700, letterSpacing: '-0.02em' }}>자비스</span>
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: MUTED }}>{ko ? 'AI 비서 겸 감독관 · 개발 중' : 'AI ASSISTANT + SUPERVISOR · IN DEVELOPMENT'}</div>
      </div>
    </div>
  );
}
