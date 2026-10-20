'use client';
import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from 'react';
import { ACCENT, BONE, INK, MONO_KR, MUTED } from '@/lib/tokens';
import { useReducedMotion } from '@/lib/useMedia';

// A looping slice of DeepHold, drawn with the game's own pixel sprites: five floors stacked down a shaft,
// the lantern-bearer clears a slime (it always winds up first), then takes the stairs one floor deeper.
const DIR = '/specimens/deephold/';
const S = 3; // sprite scale: 32px frames → 96px
const FR = 32 * S;
const SLAB = 216, GAP = 84, THICK = 22;
const SHADES = ['#2E3324', '#30353A', '#1F3436', '#2A1A16', '#16141F'];

const BIOMES = {
  ko: ['이끼 묘지', '녹슨 공방', '가라앉은 신전', '용암 광맥', '검은 심연'],
  en: ['MOSS GRAVEYARD', 'RUSTED WORKSHOP', 'SUNKEN TEMPLE', 'LAVA VEIN', 'BLACK ABYSS'],
};

// hero.png rows: idle 4 · walk 6 · attack 4 · roll 5 · descend 6 · hurt 2 (all 32 × 32)
const HERO = { idle: [0, 4], walk: [1, 6], attack: [2, 4], roll: [3, 5], descend: [4, 6], hurt: [5, 2] } as const;
// slime.png rows: idle 4 · wind-up 3 · bump 3 · death 4
const SLIME = { idle: [0, 4], windup: [1, 3], bump: [2, 3], death: [3, 4] } as const;

const CYCLE = 6.2; // seconds per floor
const FLOORS = 5;
// On the third floor the hero takes the hit instead of rolling clear, so one heart breaks for the rest of the run.
const HIT_FLOOR = 2;

type Pose = { hero: keyof typeof HERO; hf: number; hx: number; heroOn: boolean; slime: keyof typeof SLIME | null; sf: number; warn: boolean; cam: number; floor: number; hp: number; flash: boolean };

function pose(t: number): Pose {
  const loop = t % (CYCLE * FLOORS);
  const floor = Math.floor(loop / CYCLE);
  const u = loop - floor * CYCLE;
  const fps = (n: number, rate = 9) => Math.floor(u * rate) % n;
  const hit = floor === HIT_FLOOR;
  const hp = floor > HIT_FLOOR || (hit && u > 2.0) ? 2 : 3;
  const p: Pose = { hero: 'idle', hf: fps(4, 5), hx: 0, heroOn: true, slime: 'idle', sf: fps(4, 6), warn: false, cam: floor, floor, hp, flash: false };
  if (u < 0.5) { p.slime = null; p.hero = 'walk'; p.hf = fps(6, 10); }
  else if (u < 1.3) { /* slime idles */ }
  else if (u < 1.9) { p.slime = 'windup'; p.sf = Math.min(2, Math.floor((u - 1.3) * 5)); p.warn = true; }
  else if (u < 2.35) {
    p.slime = 'bump'; p.sf = Math.min(2, Math.floor((u - 1.9) * 7));
    if (hit) { p.hero = 'hurt'; p.hf = fps(2, 8); p.flash = u < 2.1; }
    else { p.hero = 'roll'; p.hf = Math.min(4, Math.floor((u - 1.9) * 11)); p.hx = -46 * Math.min(1, (u - 1.9) / 0.45); }
  } else if (u < 2.8) {
    p.hero = 'attack'; p.hf = Math.min(3, Math.floor((u - 2.35) * 9)); p.hx = hit ? 0 : -46 + 46 * Math.min(1, (u - 2.35) / 0.2);
    p.slime = 'bump'; p.sf = 2;
  } else if (u < 3.4) { p.slime = 'death'; p.sf = Math.min(3, Math.floor((u - 2.8) * 7)); }
  else if (u < 4.0) { p.slime = null; }
  else if (u < 4.7) { p.slime = null; p.hero = 'descend'; p.hf = Math.min(5, Math.floor((u - 4.0) * 9)); }
  else { p.slime = null; p.heroOn = false; p.hero = 'descend'; p.hf = 5; }
  // The shaft rises one floor while the hero is on the stairs; after the last floor a new run starts at B01.
  if (u >= 4.7) {
    const k = Math.min(1, (u - 4.7) / 1.1);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    p.cam = floor === FLOORS - 1 ? floor * (1 - e) : floor + e;
  }
  return p;
}

const sprite = (file: string, cols: number, rows: number, row: number, f: number): CSSProperties => ({
  width: FR, height: FR, backgroundImage: `url(${DIR}${file})`, backgroundSize: `${cols * FR}px ${rows * FR}px`,
  backgroundPosition: `${-f * FR}px ${-row * FR}px`, imageRendering: 'pixelated',
});

function Slab({ i, cam }: { i: number; cam: number }) {
  const d = i - cam; // 0 = the floor the hero stands on, positive = deeper
  const fade = d < -0.6 ? Math.max(0, 1 + (d + 0.6) * 2.5) : Math.max(0.12, 1 - d * 0.34);
  const side: CSSProperties = { position: 'absolute', background: SHADES[i], boxShadow: 'inset 0 0 0 1px rgba(236,232,222,0.06)' };
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: SLAB, height: SLAB, transformStyle: 'preserve-3d', transform: `translateZ(${-i * GAP}px)`, opacity: fade }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${DIR}floor${i}.png)`, backgroundSize: '44px 44px', imageRendering: 'pixelated', boxShadow: `inset 0 0 0 1px rgba(236,232,222,0.12), inset 0 0 40px rgba(0,0,0,${0.35 + Math.min(1, Math.abs(d)) * 0.4})` }} />
      <div style={{ ...side, left: 0, top: SLAB, width: SLAB, height: THICK, transformOrigin: 'top', transform: 'rotateX(-90deg)', filter: 'brightness(0.8)' }} />
      <div style={{ ...side, left: SLAB, top: 0, width: THICK, height: SLAB, transformOrigin: 'left', transform: 'rotateY(90deg)', filter: 'brightness(0.55)' }} />
    </div>
  );
}

export function DeepHold({ active, ko, mobile, pointer, onReady }: { active: boolean; ko: boolean; mobile?: boolean; pointer?: MutableRefObject<{ x: number; y: number }>; onReady?: () => void }) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0.8);
  const [tilt, setTilt] = useState(0);
  const ready = useRef(onReady);
  ready.current = onReady;

  // Signal ready once the sprites are decoded, so the stage never shows an empty shaft.
  useEffect(() => {
    let live = true;
    const files = ['hero.png', 'slime.png', 'hearts.png', ...Array.from({ length: FLOORS }, (_, i) => `floor${i}.png`)];
    Promise.all(files.map((f) => { const im = new Image(); im.src = DIR + f; return im.decode().catch(() => undefined); }))
      .then(() => { if (live) ready.current?.(); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!active || reduce) return;
    let raf = 0, last = performance.now(), acc = t, tl = 0;
    const tick = (now: number) => {
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      setT(acc);
      const target = (pointer?.current.x ?? 0) * 10;
      tl += (target - tl) * 0.08;
      setTilt(tl);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduce, pointer]);

  const p = pose(t);
  const [hRow, hN] = HERO[p.hero];
  const biomes = ko ? BIOMES.ko : BIOMES.en;
  const shown = Math.round(p.cam) % FLOORS;
  const label: CSSProperties = { position: 'absolute', fontSize: 9, letterSpacing: '0.14em', color: MUTED };
  const CX = 210, CY = 236; // where the current floor's centre lands on screen

  return (
    <div style={{ position: 'relative', width: 420, height: 460, overflow: 'hidden', fontFamily: MONO_KR, color: BONE }}>
      <div style={{ position: 'absolute', inset: 0, perspective: 1200, perspectiveOrigin: `${CX}px ${CY - 60}px` }}>
        <div style={{ position: 'absolute', left: CX - SLAB / 2, top: CY - SLAB / 2, width: SLAB, height: SLAB, transformStyle: 'preserve-3d', transformOrigin: '50% 50%', transform: `rotateX(58deg) rotateZ(${45 + tilt}deg) translateZ(${p.cam * GAP}px)` }}>
          {Array.from({ length: FLOORS }, (_, i) => <Slab key={i} i={i} cam={p.cam} />)}
        </div>
      </div>

      {/* Lantern light: everything outside the hero's small circle sinks into the dark. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at ${CX + p.hx * 0.6}px ${CY - 20}px, rgba(255,190,90,0.10) 0, rgba(12,13,11,0) ${112 + Math.sin(t * 9) * 3}px, rgba(12,13,11,0.55) 190px, rgba(12,13,11,0.9) 260px)` }} />

      {p.slime && (
        <div aria-hidden="true" style={{ position: 'absolute', left: CX + 34, top: CY - FR + 22, ...sprite('slime.png', 4, 4, SLIME[p.slime][0], Math.min(p.sf, SLIME[p.slime][1] - 1)), transform: `translateX(${p.slime === 'bump' && p.sf < 2 ? -24 : 0}px)` }} />
      )}
      {p.warn && (
        <span aria-hidden="true" style={{ position: 'absolute', left: CX + 34 + FR / 2 - 7, top: CY - FR - 6, width: 14, textAlign: 'center', fontSize: 18, fontWeight: 700, color: ACCENT, opacity: Math.floor(t * 12) % 2 ? 1 : 0.45 }}>!</span>
      )}
      <div aria-hidden="true" style={{ position: 'absolute', left: CX - FR / 2 - 18 + p.hx, top: CY - FR + 18, opacity: p.heroOn ? 1 : 0, transition: 'opacity 200ms', filter: p.flash ? 'brightness(2.4)' : 'none', ...sprite('hero.png', 6, 6, hRow, Math.min(p.hf, hN - 1)) }} />

      <div aria-hidden="true" style={{ position: 'absolute', left: 22, top: 18, display: 'flex', gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 24, height: 24, backgroundImage: `url(${DIR}hearts.png)`, backgroundSize: '48px 24px', backgroundPosition: i < p.hp ? '0 0' : '-24px 0', imageRendering: 'pixelated' }} />
        ))}
      </div>
      <div style={{ ...label, right: 22, top: 18, textAlign: 'right', lineHeight: 1.7 }}>
        <span style={{ color: ACCENT }}>B{String(shown + 1).padStart(2, '0')}</span> · {biomes[shown]}<br />QL-004
      </div>
      {/* Mobile: the stage's hint chip sits where this key row would be. */}
      {!mobile && <div style={{ ...label, left: 0, right: 0, bottom: 18, textAlign: 'center', fontSize: 10 }}>
        <span style={{ padding: '3px 8px', border: `1px solid ${MUTED}`, color: BONE, background: INK }}>J</span> {ko ? '공격' : 'ATTACK'}{'  '}
        <span style={{ padding: '3px 8px', border: `1px solid ${MUTED}`, color: BONE, background: INK }}>K</span> {ko ? '구르기' : 'ROLL'}{'  ·  '}
        {ko ? '세 번 맞으면 끝' : 'THREE HITS AND OUT'}
      </div>}
    </div>
  );
}
