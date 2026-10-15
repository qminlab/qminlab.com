'use client';
import { useEffect, useRef, useState } from 'react';
import { ACCENT, INK, LINE, MONO_KR, MUTED } from '@/lib/tokens';
import { useReducedMotion } from '@/lib/useMedia';

// A small web-only Claude Wait Board on a tilted iPad: sample tickets, no server connection.
// Lane colours follow the real board: working orange, needs attention red, done green.
const ORANGE = '#FF8A1F', RED = '#FF3B30', GREEN = '#34C759';
const SCREEN = '#0B0B0A', CELL = '#161614', TXT = '#F2EFE8';

type Lane = 'work' | 'need' | 'done';
type Ticket = { n: number; name: number; lane: Lane; min: number; why?: 'perm' | 'pick' };
const LANES: Lane[] = ['work', 'need', 'done'];
const COLOR: Record<Lane, string> = { work: ORANGE, need: RED, done: GREEN };

const L = {
  ko: { title: 'CLAUDE 대기판', work: '작업중', need: '확인 필요', done: '완료', perm: '권한 승인', pick: '선택 필요',
    names: ['사이트 개발', '자비스 서버', 'TFT 오버레이', '디자인 시안', '위밍 답변', '문서 정리'],
    t: (k: Ticket) => (k.lane === 'work' ? `${k.min}분째 작업` : k.lane === 'need' ? `${k.min}분째 대기` : `방금 완료 · ${k.min}분 걸림`) },
  en: { title: 'CLAUDE WAIT BOARD', work: 'WORKING', need: 'NEEDS ATTENTION', done: 'DONE', perm: 'PERMISSION', pick: 'CHOICE',
    names: ['Site build', 'Jarvis server', 'TFT overlay', 'Design draft', 'Weming reply', 'Doc cleanup'],
    t: (k: Ticket) => (k.lane === 'work' ? `${k.min} min working` : k.lane === 'need' ? `waiting ${k.min} min` : `just done · ${k.min} min`) },
};

// A looping script of board states; a ticket entering "need" flashes red, entering "done" flashes green.
const T = (n: number, name: number, lane: Lane, min: number, why?: Ticket['why']) => ({ n, name, lane, min, why });
const SCRIPT: [number, number, Lane, number, Ticket['why']?][][] = [
  [[12, 0, 'work', 12], [13, 1, 'work', 4], [11, 2, 'need', 3, 'perm'], [9, 3, 'done', 23]],
  [[12, 0, 'work', 13], [13, 1, 'done', 5], [11, 2, 'need', 4, 'perm'], [9, 3, 'done', 23]],
  [[12, 0, 'work', 14], [11, 2, 'work', 1], [13, 1, 'done', 5], [9, 3, 'done', 23]],
  [[12, 0, 'need', 1, 'pick'], [11, 2, 'work', 2], [14, 4, 'work', 1], [13, 1, 'done', 5]],
  [[11, 2, 'work', 3], [14, 4, 'work', 2], [12, 0, 'need', 2, 'pick'], [13, 1, 'done', 5]],
  [[12, 0, 'work', 1], [11, 2, 'done', 9], [14, 4, 'work', 3], [13, 1, 'done', 5]],
  [[12, 0, 'work', 2], [14, 4, 'work', 4], [15, 5, 'work', 1], [11, 2, 'done', 9]],
];
const STATES = SCRIPT.map((s) => s.map((a) => T(...a)));

export function WaitBoard({ active, ko, onReady }: { active: boolean; ko: boolean; onReady?: () => void }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [flash, setFlash] = useState<{ c: string; id: number } | null>(null);
  const ready = useRef(onReady);
  ready.current = onReady;
  useEffect(() => { ready.current?.(); }, []);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setI((v) => (v + 1) % STATES.length), 2600);
    return () => clearInterval(id);
  }, [active]);

  // Compare with the previous state to see which lane a ticket just entered.
  const prev = useRef(STATES[0]);
  useEffect(() => {
    const before = new Map(prev.current.map((k) => [k.n, k.lane]));
    prev.current = STATES[i];
    if (reduce) return;
    const moved = STATES[i].filter((k) => before.get(k.n) !== k.lane);
    const c = moved.some((k) => k.lane === 'need') ? RED : moved.some((k) => k.lane === 'done') ? GREEN : null;
    if (c) setFlash({ c, id: Date.now() });
  }, [i, reduce]);

  const tx = ko ? L.ko : L.en;
  const tickets = STATES[i];
  return (
    <div style={{ position: 'relative', width: 560, height: 420, perspective: 1400, fontFamily: MONO_KR }}>
      <div style={{ position: 'absolute', left: 10, top: 20, width: 540, height: 380, padding: 16, boxSizing: 'border-box', borderRadius: 28, background: '#1B1C19', border: `1px solid ${LINE}`, boxShadow: '0 40px 80px rgba(0,0,0,0.55), inset 0 0 0 2px #2A2B27', transform: 'rotateY(-14deg) rotateX(7deg)', transformStyle: 'preserve-3d' }}>
        <span aria-hidden="true" style={{ position: 'absolute', left: 6, top: '50%', width: 4, height: 4, marginTop: -2, borderRadius: '50%', background: '#3A3B36' }} />
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: SCREEN, color: TXT, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', fontSize: 9, letterSpacing: '0.14em', color: MUTED, borderBottom: '1px solid #222220' }}>
            <span style={{ color: TXT }}>{tx.title}</span>
            <span><span className="qldot" style={{ color: ACCENT }}>●</span> LIVE · 1.5S</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, padding: 8 }}>
            {LANES.map((lane) => (
              <div key={lane} style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 7px', background: COLOR[lane], color: INK, fontSize: ko ? 10 : 8, fontWeight: 700, letterSpacing: ko ? '0.02em' : '0.1em' }}>
                  <span>{tx[lane]}</span><span>{tickets.filter((k) => k.lane === lane).length}</span>
                </div>
                {tickets.filter((k) => k.lane === lane).map((k) => (
                  <div key={`${k.n}-${lane}`} className="qlwipe" style={{ padding: '10px 10px 11px', background: CELL, borderLeft: `3px solid ${COLOR[lane]}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', color: COLOR[lane] }}>{String(k.n).padStart(3, '0')}</span>
                    <span style={{ fontSize: 12, color: TXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.names[k.name]}</span>
                    <span style={{ fontSize: 9, letterSpacing: '0.04em', color: MUTED }}>{tx.t(k)}</span>
                    {k.why && <span style={{ alignSelf: 'flex-start', marginTop: 2, padding: '1px 5px', background: RED, color: TXT, fontSize: 8, letterSpacing: '0.06em' }}>{tx[k.why]}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Whole-screen flash: four quick pulses in the lane colour, as on the real board. */}
          {flash && <div key={flash.id} aria-hidden="true" className="qlflash4" style={{ position: 'absolute', inset: 0, background: flash.c, pointerEvents: 'none' }} />}
        </div>
      </div>
    </div>
  );
}
