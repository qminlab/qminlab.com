'use client';
import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode } from 'react';
import { ACCENT, BONE, INK, LINE, MONO_KR, MUTED } from '@/lib/tokens';
import { useReducedMotion } from '@/lib/useMedia';

// One real cut (scene 2, cut 2-05) followed through the whole pipeline: script page, storyboard row,
// animatic frame, the raw generated shot and the graded shot. Taken from the opening scene, so nothing is spoiled.
const DIR = '/specimens/starknight/';
const CW = 400, CH = 225;
const STEP_S = 2.8; // seconds each stage stays in front

const STAGES = {
  ko: ['각본', '콘티', '애니매틱', 'AI 영상', '보정 후'],
  en: ['SCRIPT', 'STORYBOARD', 'ANIMATIC', 'AI SHOT', 'GRADED'],
};

const paper: CSSProperties = { width: '100%', height: '100%', boxSizing: 'border-box', background: '#E9E4D8', color: '#22221E', fontFamily: MONO_KR, overflow: 'hidden' };
const bar = (w: string): CSSProperties => ({ display: 'block', height: 7, width: w, margin: '7px 0', borderRadius: 2, background: '#CFC9BB' });

// The script and storyboard text is copied from the real documents (Korean originals, shown as-is in both languages).
function Script() {
  return (
    <div style={{ ...paper, padding: '16px 20px', fontSize: 10, lineHeight: 1.6 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.02em' }}>장면 2 — 대장간 앞의 별</div>
      <div style={{ color: '#6B6960', fontSize: 9 }}>슬럼가 대장간 앞 · 밤</div>
      <span style={bar('92%')} /><span style={bar('78%')} />
      <div style={{ marginTop: 8 }}><b style={{ color: ACCENT }}>2-05</b> <i>제미나가 걸어 들어와 허리에 손을 얹고 들여다본다.</i></div>
      <div style={{ paddingLeft: 14 }}>제미나: 또또또. 정신 못 차리고 있네.</div>
      <div style={{ paddingLeft: 14 }}>블라드: …방해할 거면 좀 꺼져.</div>
      <span style={bar('64%')} /><span style={bar('86%')} /><span style={bar('48%')} />
    </div>
  );
}

function Board() {
  const cell: CSSProperties = { padding: '5px 7px', borderRight: '1px solid #CFC9BB', borderBottom: '1px solid #CFC9BB', fontSize: 9, lineHeight: 1.45, verticalAlign: 'top' };
  const head: CSSProperties = { ...cell, background: '#DAD4C6', fontWeight: 700, whiteSpace: 'nowrap' };
  return (
    <div style={{ ...paper, padding: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #CFC9BB', borderLeft: '1px solid #CFC9BB', tableLayout: 'fixed' }}>
        <colgroup><col style={{ width: 52 }} /><col style={{ width: 44 }} /><col style={{ width: 34 }} /><col /></colgroup>
        <tbody>
          <tr><td style={head}>컷</td><td style={head}>길이</td><td style={head}>샷</td><td style={head}>카메라 · 구도</td></tr>
          <tr>
            <td style={{ ...cell, color: ACCENT, fontWeight: 700 }}>2-05</td><td style={cell}>7초<br />168F</td><td style={cell}>MS</td>
            <td style={cell}>아이레벨, 고정 [■ 고정]<br />투샷. 블라드는 오른쪽에서 계속 위를 보고, 제미나가 왼쪽 프레임 밖에서 들어와 그를 들여다본다</td>
          </tr>
          <tr><td style={head}>시선</td><td style={{ ...cell }} colSpan={3}>제미나 → 블라드 / 블라드 → 오른쪽 위(검)</td></tr>
          <tr><td style={head}>배치</td><td style={{ ...cell }} colSpan={3}>제미나=왼쪽, 블라드=오른쪽, 매달린 검=오른쪽 위 화면 밖</td></tr>
        </tbody>
      </table>
    </div>
  );
}

const Img = ({ src }: { src: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={DIR + src} alt="" width={CW} height={CH} draggable={false} style={{ display: 'block', width: CW, height: CH, objectFit: 'cover' }} />
);

/** Raw shot with the graded version wiping across it, then holding. */
function Graded({ u }: { u: number }) {
  const k = Math.min(1, Math.max(0, (u - 0.12) / 0.55));
  const w = k * k * (3 - 2 * k);
  return (
    <div style={{ position: 'relative', width: CW, height: CH }}>
      <Img src="raw.webp" />
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - w) * 100}% 0 0)` }}><Img src="graded.webp" /></div>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: `${w * 100}%`, width: 1, background: ACCENT, opacity: w > 0 && w < 1 ? 1 : 0 }} />
    </div>
  );
}

export function StarKnight({ active, ko, pointer, onReady }: { active: boolean; ko: boolean; pointer?: MutableRefObject<{ x: number; y: number }>; onReady?: () => void }) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(STEP_S * 4 + STEP_S * 0.8);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ready = useRef(onReady);
  ready.current = onReady;

  useEffect(() => {
    let live = true;
    Promise.all(['animatic.webp', 'raw.webp', 'graded.webp'].map((f) => { const im = new Image(); im.src = DIR + f; return im.decode().catch(() => undefined); }))
      .then(() => { if (live) ready.current?.(); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!active || reduce) return;
    let raf = 0, last = performance.now(), acc = t;
    const cur = { x: 0, y: 0 };
    const tick = (now: number) => {
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      setT(acc);
      const px = pointer?.current.x ?? 0, py = pointer?.current.y ?? 0;
      cur.x += (px - cur.x) * 0.08; cur.y += (py - cur.y) * 0.08;
      setTilt({ x: cur.x, y: cur.y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduce, pointer]);

  const stage = Math.floor(t / STEP_S) % 5;
  const u = (t % STEP_S) / STEP_S;
  const names = ko ? STAGES.ko : STAGES.en;
  const faces: ReactNode[] = [<Script key="s" />, <Board key="b" />, <Img key="a" src="animatic.webp" />, <Img key="r" src="raw.webp" />, <Graded key="g" u={stage === 4 ? u : 0} />];

  return (
    <div style={{ position: 'relative', width: 560, height: 420, fontFamily: MONO_KR, color: BONE, perspective: 1300 }}>
      <div style={{ position: 'absolute', left: 80, top: 40, width: CW, height: CH, transformStyle: 'preserve-3d', transform: `rotateY(${-14 + tilt.x * 9}deg) rotateX(${8 - tilt.y * 6}deg)` }}>
        {faces.map((f, i) => {
          // Stages fan out behind the front one: the past ones step back to the left, the next ones to the right.
          const d = (i - stage + 5) % 5; // 0 = front, 1..4 = queued behind
          const back = d === 0 ? 0 : d;
          const x = d === 0 ? 0 : 34 * back;
          const z = -70 * back;
          const y = -14 * back;
          return (
            <div key={i} className="qlswap" style={{ position: 'absolute', inset: 0, transform: `translate3d(${x}px, ${y}px, ${z}px)`, transition: 'transform 700ms cubic-bezier(.23,1,.32,1), opacity 500ms ease, filter 500ms ease', opacity: d === 0 ? 1 : Math.max(0.18, 0.62 - back * 0.12), filter: d === 0 ? 'none' : 'saturate(.4) brightness(.6)', boxShadow: d === 0 ? '0 30px 70px rgba(0,0,0,0.6)' : 'none', outline: `1px solid ${d === 0 ? 'rgba(236,232,222,0.25)' : LINE}`, overflow: 'hidden', background: INK }}>
              {f}
              <span style={{ position: 'absolute', right: 8, top: 7, padding: '2px 6px', fontSize: 9, letterSpacing: '0.1em', background: d === 0 ? ACCENT : 'rgba(12,13,11,0.7)', color: d === 0 ? INK : BONE }}>{String(i + 1).padStart(2, '0')} · {names[i]}</span>
            </div>
          );
        })}
      </div>

      {/* Pipeline rail: which step of the process is in front. */}
      <div style={{ position: 'absolute', left: 40, right: 40, top: 334, display: 'flex', alignItems: 'center', gap: 6 }}>
        {names.map((n, i) => (
          <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span style={{ height: 2, background: i < stage ? BONE : i === stage ? ACCENT : LINE, transition: 'background 300ms' }} />
            <span style={{ fontSize: ko ? 10 : 8.5, letterSpacing: '0.08em', color: i === stage ? ACCENT : MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontSize: 10, letterSpacing: '0.14em', color: MUTED }}>
        {ko ? '장면 2 · 컷 2-05 · 한 컷이 완성되기까지' : 'SCENE 2 · CUT 2-05 · ONE CUT, START TO FINISH'}
      </div>
    </div>
  );
}
