'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Lens } from '@/lib/lens';
import { ACCENT, BONE, INK, LINE, MONO_KR, XRAY, EASE_SWAP } from '@/lib/tokens';
import { WemingPhone } from '../objects/WemingPhone';

const JarvisCore = dynamic(() => import('../objects/JarvisCore').then((m) => m.JarvisCore), { ssr: false });
const TftBoard = dynamic(() => import('../objects/TftBoard').then((m) => m.TftBoard), { ssr: false });
const GameCart = dynamic(() => import('../objects/GameCart').then((m) => m.GameCart), { ssr: false });

const SIZES: [number, number][] = [[320, 660], [480, 500], [600, 500], [420, 460]];
type Shape = { x: string; y: string; w: number; h: number; br: string; label: string };
type Note = { x: string; y: string; text: string; r?: boolean };
const C = (dx: number) => `calc(50% + ${dx}px)`;

function xray(step: number, ko: boolean): { shapes: Shape[]; notes: Note[] } {
  return [
    {
      shapes: [{ x: '50%', y: '50%', w: 256, h: 528, br: '42px', label: 'SCREEN 393 × 852' }],
      notes: [
        { x: '6%', y: '14%', text: 'app/(tabs)/_layout.tsx\n5 tabs · expo-router' },
        { x: '6%', y: '42%', text: 'firebase/auth\nfirestore: chatRooms, posts' },
        { x: '6%', y: '70%', text: 'theme/tokens.ts\n#0D0A13 #B15CFF #FF4FA3' },
        { x: '94%', y: '18%', text: 'services/matching.ts\nqueue → proposal → room', r: true },
        { x: '94%', y: '46%', text: ko ? 'RevenueCat\n다이아 · VIP' : 'RevenueCat\ndiamonds · VIP', r: true },
        { x: '94%', y: '74%', text: 'React Native · Expo\nTypeScript', r: true },
      ],
    },
    {
      shapes: [{ x: '50%', y: '42%', w: 400, h: 400, br: '50%', label: 'RING 0 · Ø400' }, { x: '50%', y: '42%', w: 220, h: 220, br: '50%', label: 'RING 3' }],
      notes: [
        { x: '6%', y: '12%', text: 'whisper.transcribe(mic)' },
        { x: '6%', y: '40%', text: 'yolo.detect(cam)\n→ desk_state' },
        { x: '6%', y: '68%', text: ko ? 'macOS 메인 서버\n⇄ Windows 보조 기기' : 'macOS main server\n⇄ Windows node' },
        { x: '94%', y: '16%', text: 'claude.plan(today)', r: true },
        { x: '94%', y: '44%', text: 'FastAPI\nPOST /check-in', r: true },
        { x: '94%', y: '72%', text: ko ? 'iOS 단축어\n→ /trigger' : 'iOS Shortcuts\n→ /trigger', r: true },
      ],
    },
    {
      shapes: [{ x: C(-60), y: C(10), w: 70, h: 90, br: '0', label: 'unit 0.94' }, { x: C(70), y: C(30), w: 70, h: 90, br: '0', label: 'unit 0.88' }, { x: '50%', y: C(150), w: 300, h: 40, br: '0', label: 'bench_slot ×9' }],
      notes: [
        { x: '6%', y: '14%', text: 'screen.capture(window)' },
        { x: '6%', y: '44%', text: 'parse_board()\n→ 4 × 7 hex' },
        { x: '94%', y: '16%', text: 'lolchess.comps(meta)', r: true },
        { x: '94%', y: '46%', text: 'PySide6 overlay\nstays_on_top · click-through', r: true },
      ],
    },
    {
      shapes: [{ x: '50%', y: '43%', w: 200, h: 230, br: '0', label: 'build/ — paused' }],
      notes: [
        { x: '6%', y: '16%', text: 'design_v2.md\n' + (ko ? '핵심 루프 다시 쓰는 중' : 'rewriting the core loop') },
        { x: '6%', y: '56%', text: 'save_00.sav\nframe 0412 · frozen' },
        { x: '94%', y: '20%', text: ko ? '공개 범위: 친구들 먼저' : 'audience: friends first', r: true },
        { x: '94%', y: '58%', text: ko ? 'eta: 다시 재밌어질 때' : "eta: when it's fun again", r: true },
      ],
    },
  ][step];
}


export function SpecimenStage({ step, ko, mobile, enabled, onSwipe }: { step: number; ko: boolean; mobile: boolean; enabled: boolean; onSwipe?: (dir: 1 | -1) => void }) {
  const t = useTranslations('stage');
  const H = mobile ? 400 : 560;
  const R = mobile ? 70 : 100;
  const scales = mobile ? [0.56, 0.72, 0.58, 0.8] : [0.8, 1, 0.98, 1];
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const lens = useRef<Lens | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [over, setOver] = useState(false);
  const overRef = useRef(false);
  const stepRef = useRef(step);
  stepRef.current = step;

  const parkAt = (animate: boolean) => {
    const el = root.current;
    if (!el || !lens.current) return;
    const s = stepRef.current;
    const px = (s === 0 ? 0.22 : 0.68) * el.clientWidth;
    const py = (s === 0 ? 0.62 : 0.34) * el.clientHeight;
    lens.current.park(px, py, t('parked'), animate, false);
  };

  useEffect(() => {
    if (!ring.current || !layer.current) return;
    lens.current = new Lens({ ring: ring.current, clips: [layer.current], label: label.current }, R);
    if (mobile) parkAt(false); else lens.current.hide();
    return () => lens.current?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile, R]);

  // Arriving on the phone step by scroll: keep the lens hidden until the mouse moves (design-phase bug fix).
  useEffect(() => {
    if (mobile) { if (!drag.current.lens) parkAt(true); return; }
    if (step === 0) lens.current?.hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mobile]);

  const setOverBoth = (v: boolean) => { if (overRef.current !== v) { overRef.current = v; setOver(v); } };

  // Desktop: the lens exists only while the cursor is inside the stage and not over the phone.
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mobile) return;
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    pointer.current = { x: (mx / r.width - 0.5) * 2, y: (my / r.height - 0.5) * 2 };
    const inPhone = stepRef.current === 0 && !!(e.target as HTMLElement).closest?.('[data-phone="true"]');
    if (inPhone) { lens.current?.hide(); setOverBoth(true); return; }
    setOverBoth(false);
    lens.current?.move(mx, my, `X ${String(Math.round(mx)).padStart(4, '0')} · Y ${String(Math.round(my)).padStart(4, '0')}`);
  };
  const onMouseLeave = () => {
    if (mobile) return;
    pointer.current = { x: 0, y: 0 };
    lens.current?.hide();
    setOverBoth(false);
  };

  // Mobile: press and hold to lift the lens 80px above the finger; a quick horizontal swipe changes stage.
  const drag = useRef({ id: -1, x0: 0, y0: 0, lens: false, timer: 0 as unknown as ReturnType<typeof setTimeout>, moved: false });
  const local = (e: { clientX: number; clientY: number }) => {
    const r = root.current!.getBoundingClientRect();
    return { mx: e.clientX - r.left, my: e.clientY - r.top };
  };
  const showAt = (mx: number, my: number) => lens.current?.move(mx, Math.max(R, my - 80), `X ${String(Math.round(mx)).padStart(4, '0')} · Y ${String(Math.round(my)).padStart(4, '0')}`);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mobile || e.pointerType === 'mouse' && e.button !== 0) return;
    const d = drag.current;
    d.id = e.pointerId; d.x0 = e.clientX; d.y0 = e.clientY; d.lens = false; d.moved = false;
    clearTimeout(d.timer);
    const p = local(e);
    d.timer = setTimeout(() => { d.lens = true; showAt(p.mx, p.my); try { root.current?.setPointerCapture(d.id); } catch {} }, 280);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!mobile || e.pointerId !== d.id) return;
    if (d.lens) { const p = local(e); showAt(p.mx, p.my); return; }
    if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 10) { d.moved = true; clearTimeout(d.timer); }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!mobile || e.pointerId !== d.id) return;
    clearTimeout(d.timer);
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (d.lens) parkAt(true);
    else if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) onSwipe?.(dx < 0 ? 1 : -1);
    d.lens = false; d.id = -1;
  };
  // While the lens is out, the page must not scroll under the finger.
  useEffect(() => {
    const el = root.current;
    if (!el || !mobile) return;
    const block = (ev: TouchEvent) => { if (drag.current.lens) ev.preventDefault(); };
    el.addEventListener('touchmove', block, { passive: false });
    return () => el.removeEventListener('touchmove', block);
  }, [mobile]);

  const X = xray(step, ko);
  const hints = mobile ? (t.raw('hintsMobile') as string[]) : (t.raw('hints') as string[]);

  return (
    <div ref={root} data-stage={mobile ? 'mobile' : 'desktop'} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
      style={{ position: 'relative', width: '100%', height: H, overflow: 'hidden', cursor: over || mobile ? 'pointer' : 'none', touchAction: mobile ? 'pan-y' : 'auto', userSelect: 'none', WebkitUserSelect: 'none', fontFamily: MONO_KR, color: BONE }}>
      {SIZES.map(([w, h], i) => {
        const on = i === step;
        const sc = scales[i] * (on ? 1 : 0.86);
        let tf = `scale(${sc})`;
        if (i === 0) tf = mobile ? tf : `perspective(1400px) rotateY(${over ? 0 : -16}deg) rotateX(${over ? 0 : 5}deg) ${tf}`;
        return (
          <div key={i} data-phone={i === 0 ? 'true' : 'false'}
            onPointerDown={i === 0 ? (e) => e.stopPropagation() : undefined}
            aria-hidden={!on}
            style={{ position: 'absolute', left: '50%', top: '50%', width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, opacity: on ? 1 : 0, transform: tf, transition: `opacity 600ms ease, transform 900ms ${EASE_SWAP}`, pointerEvents: on && i === 0 ? 'auto' : 'none', cursor: i === 0 ? 'pointer' : 'auto' }}>
            {i === 0 && <WemingPhone />}
            {i === 1 && enabled && <JarvisCore active={on} ko={ko} pointer={mobile ? undefined : pointer} />}
            {i === 2 && enabled && <TftBoard active={on} ko={ko} />}
            {i === 3 && enabled && <GameCart active={on} ko={ko} />}
          </div>
        );
      })}

      <div ref={layer} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', clipPath: 'circle(0px at 0 0)', background: XRAY(32) }}>
        {X.shapes.map((s, i) => {
          const k = mobile ? scales[step] : 1;
          const w = s.w * k, h = s.h * k;
          return (
            <div key={`${step}-${i}`} style={{ position: 'absolute', left: s.x, top: s.y, width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, boxSizing: 'border-box', border: `1.5px dashed ${ACCENT}`, borderRadius: s.br }}>
              <span style={{ position: 'absolute', left: 6, top: -16, fontSize: 10, letterSpacing: '0.1em', color: ACCENT, whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
          );
        })}
        {X.notes.map((n, i) => (
          <div key={`${step}-n${i}`} style={{ position: 'absolute', left: n.x, top: n.y, transform: n.r ? 'translateX(-100%)' : 'none', textAlign: n.r ? 'right' : 'left', fontSize: mobile ? 9 : 11, lineHeight: 1.6, color: ACCENT, whiteSpace: 'pre-line' }}>{n.text}</div>
        ))}
      </div>

      <div ref={ring} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: R * 2, height: R * 2, border: `1.5px solid ${ACCENT}`, borderRadius: '50%', boxSizing: 'border-box', pointerEvents: 'none', visibility: 'hidden', willChange: 'transform' }}>
        <div style={{ position: 'absolute', left: '50%', top: -12, bottom: -12, width: 1, background: ACCENT }} />
        <div style={{ position: 'absolute', top: '50%', left: -12, right: -12, height: 1, background: ACCENT }} />
        <div ref={label} style={{ position: 'absolute', left: '50%', top: '100%', marginTop: 18, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 10, letterSpacing: '0.12em', color: ACCENT }} />
      </div>

      <div style={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', border: `1px solid ${LINE}`, background: INK, fontSize: 10, letterSpacing: '0.08em', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="6" cy="6" r="4.5" /><path d="M6 0v3M6 9v3M0 6h3M9 6h3" /></svg>{hints[step]}
      </div>
    </div>
  );
}
