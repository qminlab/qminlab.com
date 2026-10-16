'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Lens } from '@/lib/lens';
import { ACCENT, BONE, LINE, MONO_KR, XRAY } from '@/lib/tokens';
import { WemingPhone } from '../objects/WemingPhone';
import { Loading } from '../Loading';

const JarvisCore = dynamic(() => import('../objects/JarvisCore').then((m) => m.JarvisCore), { ssr: false });
const TftBoard = dynamic(() => import('../objects/TftBoard').then((m) => m.TftBoard), { ssr: false });
const GameCart = dynamic(() => import('../objects/GameCart').then((m) => m.GameCart), { ssr: false });
const WaitBoard = dynamic(() => import('../objects/WaitBoard').then((m) => m.WaitBoard), { ssr: false });

const SIZES: [number, number][] = [[320, 660], [480, 500], [600, 500], [420, 460], [560, 420]];
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
    {
      shapes: [{ x: '50%', y: '50%', w: 508, h: 348, br: '12px', label: ko ? 'SCREEN · 3칸' : 'SCREEN · 3 LANES' }],
      notes: [
        { x: '4%', y: '10%', text: ko ? 'Claude 앱 대화\n/board 이름 → 확장 모드' : 'Claude app chat\n/board name → extension mod' },
        { x: '4%', y: '80%', text: ko ? 'Claude Code 훅\nPermissionRequest · Stop' : 'Claude Code hooks\nPermissionRequest · Stop' },
        { x: '96%', y: '10%', text: ko ? '맥 서버: Python 표준 라이브러리\nhttp.server · ssl · launchd' : 'Mac server: Python stdlib\nhttp.server · ssl · launchd', r: true },
        { x: '96%', y: '80%', text: ko ? '아이패드: 1.5초마다 갱신\nWeb Audio · Wake Lock' : 'iPad: poll every 1.5 s\nWeb Audio · Wake Lock', r: true },
      ],
    },
  ][step];
}


export function SpecimenStage({ step, ko, mobile, enabled }: { step: number; ko: boolean; mobile: boolean; enabled: boolean }) {
  const t = useTranslations('stage');
  // Desktop fills its panel (which grows with tall windows); mobile keeps the mockup's fixed height.
  const H = mobile ? 400 : '100%';
  const R = 100;
  const scales = mobile ? [0.5, 0.72, 0.58, 0.8, 0.6] : [0.8, 1, 0.98, 1, 1];
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

  // Desktop: the stage is now one half of a full-height scene, so a narrow window shrinks the object to fit
  // instead of cropping it. Mobile keeps its fixed per-specimen scales.
  const [box, setBox] = useState<[number, number]>([0, 0]);
  useEffect(() => {
    const el = root.current;
    if (!el || mobile) return;
    const ro = new ResizeObserver(([e]) => setBox([e.contentRect.width, e.contentRect.height]));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mobile]);
  const fit = (i: number) => {
    if (mobile || !box[0]) return 1;
    const [w, h] = SIZES[i];
    return Math.min(1, (box[0] - 24) / (w * scales[i]), (box[1] - 72) / (h * scales[i]));
  };

  // Load order: nothing until the stage is near the viewport, then the current specimen first, and the
  // other specimens only once that one has drawn its first frame. The phone (step 0) is plain HTML.
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState([true, false, false, false, false]);
  const [seen, setSeen] = useState([false, false, false, false, false]);
  const [all, setAll] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!near || !enabled) return;
    setSeen((s) => (s[step] ? s : s.map((v, i) => v || i === step)));
    if (ready[step]) setAll(true);
  }, [near, enabled, step, ready]);
  const markReady = useRef([1, 2, 3, 4].map((i) => () => setReady((r) => (r[i] ? r : r.map((v, j) => v || j === i)))));
  const load = (i: number) => enabled && (all || seen[i]);

  useEffect(() => {
    if (!ring.current || !layer.current) return;
    lens.current = new Lens({ ring: ring.current, clips: [layer.current], label: label.current }, R);
    lens.current.hide();
    return () => lens.current?.dispose();
  }, [mobile]);

  // Arriving on the phone step by scroll: keep the lens hidden until the mouse moves (design-phase bug fix).
  useEffect(() => {
    if (step === 0) lens.current?.hide();
  }, [step]);

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

  const X = xray(step, ko);
  const hints = mobile ? (t.raw('hintsMobile') as string[]) : (t.raw('hints') as string[]);

  return (
    <div ref={root} data-stage={mobile ? 'mobile' : 'desktop'} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      style={{ position: 'relative', width: '100%', height: H, overflow: 'hidden', cursor: over || mobile ? 'pointer' : 'none', touchAction: mobile ? 'pan-y' : 'auto', userSelect: 'none', WebkitUserSelect: 'none', fontFamily: MONO_KR, color: BONE, background: 'transparent' }}>
      {SIZES.map(([w, h], i) => {
        const on = i === step;
        const shown = on && ready[i];
        const sc = scales[i] * fit(i) * (on ? 1 : 0.86);
        // The reel: the outgoing specimen slides off to the left, the incoming one arrives from the right
        // (and the reverse when stepping back). Reduced motion (qlswap) keeps only the crossfade.
        const dx = on ? 0 : (i < step ? -1 : 1) * (mobile ? 90 : 160);
        let tf = `translateX(${dx}px) scale(${sc})`;
        // Mobile has no hover, so the phone stands upright from the start, lifted clear of the hint chip.
        if (i === 0) tf = `translateX(${dx}px) ${mobile ? 'translateY(-20px) ' : ''}perspective(1400px) rotateY(${over || mobile ? 0 : -16}deg) rotateX(${over || mobile ? 0 : 5}deg) ${tf}`;
        return (
          <div key={i} className="qlswap" data-phone={i === 0 ? 'true' : 'false'}
            onPointerDown={i === 0 ? (e) => e.stopPropagation() : undefined}
            aria-hidden={!on}
            style={{ position: 'absolute', left: '50%', top: '50%', width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, opacity: shown ? 1 : 0, transform: tf, transition: `opacity ${on ? 650 : 400}ms ease ${on ? 100 : 0}ms, transform 1000ms cubic-bezier(.23,1,.32,1)`, pointerEvents: on && i === 0 ? 'auto' : 'none', cursor: i === 0 ? 'pointer' : 'auto' }}>
            {i === 0 && <WemingPhone />}
            {i === 1 && load(1) && <JarvisCore active={on} ko={ko} pointer={mobile ? undefined : pointer} onReady={markReady.current[0]} />}
            {i === 2 && load(2) && <TftBoard active={on} ko={ko} onReady={markReady.current[1]} />}
            {i === 3 && load(3) && <GameCart active={on} ko={ko} onReady={markReady.current[2]} />}
            {i === 4 && load(4) && <WaitBoard active={on} ko={ko} onReady={markReady.current[3]} />}
          </div>
        );
      })}

      <Loading show={!ready[step]} code={`QL-00${step + 1}`} label={t('loading')} />

      {/* Mobile has no x-ray lens on the stage, so nothing covers the phone. */}
      {!mobile && <div ref={layer} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', clipPath: 'circle(0px at 0 0)', background: XRAY(32) }}>
        {X.shapes.map((s, i) => {
          const k = fit(step);
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
      </div>}

      {!mobile && <div ref={ring} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: R * 2, height: R * 2, border: `1.5px solid ${ACCENT}`, borderRadius: '50%', boxSizing: 'border-box', pointerEvents: 'none', visibility: 'hidden', willChange: 'transform' }}>
        <div style={{ position: 'absolute', left: '50%', top: -12, bottom: -12, width: 1, background: ACCENT }} />
        <div style={{ position: 'absolute', top: '50%', left: -12, right: -12, height: 1, background: ACCENT }} />
        <div ref={label} style={{ position: 'absolute', left: '50%', top: '100%', marginTop: 18, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 10, letterSpacing: '0.12em', color: ACCENT }} />
      </div>}

      <div style={{ position: 'absolute', left: '50%', bottom: mobile ? 10 : 14, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, border: `1px solid ${LINE}`, background: 'rgba(12,13,11,0.78)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', fontSize: mobile ? 10 : 11, letterSpacing: '0.06em', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 24px)', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none' }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="6" cy="6" r="4.5" /><path d="M6 0v3M6 9v3M0 6h3M9 6h3" /></svg>{hints[step]}
      </div>
    </div>
  );
}
