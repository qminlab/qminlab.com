/**
 * A small playable DeepHold for the Qmin OS window: the game's real room art and sprites, its core rules
 * (three hits and you are out, every attack is telegraphed, roll through it), five floors that loop.
 * Not the game itself: no items, bosses or building. Arrows/WASD move, J or Space attacks, K or Shift rolls;
 * on touch screens a stick and two buttons appear.
 */
const ROOM_DIR = '/deephold/', SPR = '/specimens/deephold/';
const W = 768, H = 576, S = 1.5, F = 32 * S;
// Each room picture has the lantern-bearer painted at the spawn point; it is covered with nearby floor.
const ROOMS = [
  { file: 'room_moss_graveyard', ko: '이끼 묘지', en: 'Moss Graveyard', hero: [266, 386], patch: 64 },
  { file: 'room_rusted_workshop', ko: '녹슨 공방', en: 'Rusted Workshop', hero: [266, 388], patch: 64 },
  { file: 'room_sunken_temple', ko: '가라앉은 신전', en: 'Sunken Temple', hero: [330, 388], patch: 64 },
  { file: 'room_lava_vein', ko: '용암 광맥', en: 'Lava Vein', hero: [330, 388], patch: -64 },
  { file: 'room_black_abyss', ko: '검은 심연', en: 'Black Abyss', hero: [266, 388], patch: 64 },
];
// hero.png rows: idle 4 · walk 6 · attack 4 · roll 5 · descend 6 · hurt 2; slime.png: idle 4 · wind-up 3 · bump 3 · death 4
const HERO = { idle: [0, 4, 6], walk: [1, 6, 11], attack: [2, 4, 16], roll: [3, 5, 16], descend: [4, 6, 9], hurt: [5, 2, 10] } as const;
const SLIME = { idle: [0, 4, 6], windup: [1, 3, 6], bump: [2, 3, 10], death: [3, 4, 10] } as const;
const BOUNDS = { x0: 84, x1: 684, y0: 168, y1: 452 };
const TXT = {
  ko: { title: '아무 키나 누르거나 탭해서 시작', keys: '이동 ←↑↓→ / WASD · 공격 J · 구르기 K', over: '세 번 맞으면 끝.', again: '다시 하기 (R 또는 탭)', clear: '계단으로 내려가세요', atk: '공격', roll: '구르기', sample: '웹 체험판', won: 'B5F 클리어!', wonP: '웹 체험판은 여기까지예요. 더 깊은 층은 실제 게임에서 이어져요.', site: '딥홀드 사이트', dl: '다운로드', restart: '처음부터 다시' },
  en: { title: 'Press any key or tap to start', keys: 'Move ←↑↓→ / WASD · Attack J · Roll K', over: 'Three hits and you are out.', again: 'Try again (R or tap)', clear: 'Take the stairs down', atk: 'Attack', roll: 'Roll', sample: 'Web demo', won: 'B5F cleared!', wonP: 'That is the end of the web demo. The deeper floors are in the real game.', site: 'DeepHold site', dl: 'Download', restart: 'Play again' },
};

type Slime = { x: number; y: number; st: keyof typeof SLIME; t: number; vx: number; vy: number; cd: number };

/** The web demo ends after five floors and points to the real game. */
const LAST_FLOOR = 5;

export function mountDeepHold(el: HTMLElement, ko: boolean, go: { site?: string; download?: string } = {}) {
  const L = ko ? TXT.ko : TXT.en;
  const touch = matchMedia('(pointer:coarse)').matches;
  const out = (href: string, label: string) => `<a href="${href}" target="_blank" rel="noopener">↗ ${label}</a>`;
  const end = `<div class="dhg-end" hidden><b>${L.won}</b><p>${L.wonP}</p><div>${go.site ? out(go.site, L.site) : ''}${go.download ? out(go.download, L.dl) : ''}<button data-again>${L.restart}</button></div></div>`;
  el.innerHTML = `<div class="dhg"><div class="dhg-stage"><canvas width="${W}" height="${H}"></canvas>${end}</div>${touch ? `<div class="dhg-pad"><div class="dhg-stick"><i></i></div><div class="dhg-btns"><button data-b="roll">${L.roll}</button><button data-b="atk">${L.atk}</button></div></div>` : ''}</div>`;
  const cv = el.querySelector('canvas')!, g = cv.getContext('2d')!;
  const endEl = el.querySelector<HTMLElement>('.dhg-end')!;
  endEl.querySelector<HTMLElement>('[data-again]')!.onclick = () => newRun();
  g.imageSmoothingEnabled = false;
  const img = (src: string) => { const i = new Image(); i.src = src; return i; };
  const hero = img(SPR + 'hero.png'), slime = img(SPR + 'slime.png'), hearts = img(SPR + 'hearts.png');
  const rooms = ROOMS.map((r) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const i = img(ROOM_DIR + r.file + '.webp');
    i.onload = () => {
      const x = c.getContext('2d')!; x.drawImage(i, 0, 0);
      const [hx, hy] = r.hero; x.drawImage(i, hx + r.patch, hy, 48, 64, hx, hy, 48, 64);
    };
    return c;
  });

  const keys = new Set<string>();
  const stick = { x: 0, y: 0 };
  let phase: 'title' | 'play' | 'down' | 'dead' | 'won' = 'title';
  let floor = 0, depth = 1, fade = 0, msg = 0;
  const P = { x: 0, y: 0, face: 1, hp: 3, st: 'idle' as keyof typeof HERO, t: 0, inv: 0, rx: 0, ry: 0 };
  let mobs: Slime[] = [];
  let stairs = false;

  function start(f: number) {
    floor = f; const r = ROOMS[f];
    P.x = r.hero[0] + 24; P.y = r.hero[1] + 58; P.st = 'idle'; P.t = 0; P.inv = 0;
    stairs = false; msg = 0;
    const n = Math.min(4, 2 + Math.floor(depth / 2));
    mobs = Array.from({ length: n }, (_, i) => {
      let x = 0, y = 0;
      do { x = BOUNDS.x0 + Math.random() * (BOUNDS.x1 - BOUNDS.x0); y = BOUNDS.y0 + Math.random() * (BOUNDS.y1 - BOUNDS.y0); } while (Math.hypot(x - P.x, y - P.y) < 220);
      return { x, y, st: 'idle', t: Math.random(), vx: 0, vy: 0, cd: 0.6 + i * 0.5 };
    });
  }
  function newRun() { P.hp = 3; depth = 1; fade = 0; start(0); phase = 'play'; endEl.hidden = true; }

  const act = (b: 'atk' | 'roll') => {
    if (phase === 'title' || phase === 'dead') { newRun(); return; }
    if (phase !== 'play' || P.st === 'attack' || P.st === 'roll' || P.st === 'hurt') return;
    if (b === 'atk') { P.st = 'attack'; P.t = 0; }
    else { const [mx, my] = moveVec(); const d = Math.hypot(mx, my) || 1; P.rx = (mx || P.face) / d; P.ry = my / d; P.st = 'roll'; P.t = 0; }
  };
  const onKey = (e: KeyboardEvent) => {
    if (!el.isConnected || !el.offsetParent || isTyping() || el.closest('.win.inactive,.win[hidden]')) return;
    // Read the physical key (e.code), so WASD/J/K still work with a Korean or other non-Latin input source on.
    const k = CODE[e.code] ?? e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (e.type === 'keydown') {
      if (phase !== 'play') { if (phase === 'title' || phase === 'dead') newRun(); return; }
      keys.add(k);
      if (k === 'j' || k === ' ' || k === 'z') act('atk');
      if (k === 'k' || k === 'shift' || k === 'x') act('roll');
    } else keys.delete(k);
  };
  const CODE: Record<string, string> = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyJ: 'j', KeyK: 'k', KeyZ: 'z', KeyX: 'x', Space: ' ', ShiftLeft: 'shift', ShiftRight: 'shift', ArrowUp: 'arrowup', ArrowDown: 'arrowdown', ArrowLeft: 'arrowleft', ArrowRight: 'arrowright' };
  const isTyping = () => { const a = document.activeElement; return !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA'); };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  const clearKeys = () => keys.clear(); addEventListener('blur', clearKeys);
  cv.addEventListener('pointerdown', () => { if (phase === 'title' || phase === 'dead') newRun(); else if (!touch) act('atk'); });
  const sEl = el.querySelector<HTMLElement>('.dhg-stick');
  if (sEl) {
    const knob = sEl.querySelector('i') as HTMLElement;
    const upd = (e: PointerEvent) => {
      const r = sEl.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
      stick.x = Math.abs(x) > 0.2 ? x : 0; stick.y = Math.abs(y) > 0.2 ? y : 0; knob.style.transform = `translate(${x * 28}px,${y * 28}px)`;
    };
    sEl.addEventListener('pointerdown', (e) => { sEl.setPointerCapture(e.pointerId); upd(e); if (phase === 'title' || phase === 'dead') newRun(); });
    sEl.addEventListener('pointermove', (e) => { if (sEl.hasPointerCapture(e.pointerId)) upd(e); });
    const end = () => { stick.x = stick.y = 0; knob.style.transform = ''; };
    sEl.addEventListener('pointerup', end); sEl.addEventListener('pointercancel', end);
    el.querySelectorAll<HTMLElement>('[data-b]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); act(b.dataset.b as 'atk' | 'roll'); }));
  }

  function moveVec(): [number, number] {
    let x = stick.x, y = stick.y;
    if (keys.has('arrowleft') || keys.has('a')) x -= 1;
    if (keys.has('arrowright') || keys.has('d')) x += 1;
    if (keys.has('arrowup') || keys.has('w')) y -= 1;
    if (keys.has('arrowdown') || keys.has('s')) y += 1;
    return [Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))];
  }
  const clampP = () => { P.x = Math.max(BOUNDS.x0, Math.min(BOUNDS.x1, P.x)); P.y = Math.max(BOUNDS.y0, Math.min(BOUNDS.y1, P.y)); };

  function hurt(from: Slime) {
    if (P.inv > 0 || P.st === 'roll' || phase !== 'play') return;
    P.hp--; P.inv = 1.1; P.st = 'hurt'; P.t = 0;
    const d = Math.hypot(P.x - from.x, P.y - from.y) || 1; P.x += (P.x - from.x) / d * 26; P.y += (P.y - from.y) / d * 26; clampP();
    if (P.hp <= 0) { phase = 'dead'; P.hp = 0; }
  }

  function step(dt: number) {
    if (phase !== 'play' && phase !== 'down') return;
    P.t += dt; P.inv = Math.max(0, P.inv - dt);
    if (phase === 'down') { P.st = 'descend'; if (P.t > 0.7) fade = Math.min(1, fade + dt * 3); if (fade >= 1) { if (depth >= LAST_FLOOR) { phase = 'won'; endEl.hidden = false; return; } depth++; start((floor + 1) % ROOMS.length); phase = 'play'; } return; }
    fade = Math.max(0, fade - dt * 3);
    const [mx, my] = moveVec();
    if (P.st === 'roll') { P.x += P.rx * 330 * dt; P.y += P.ry * 330 * dt; if (P.t > 0.32) P.st = 'idle'; }
    else if (P.st === 'attack') {
      if (P.t > 0.08 && P.t < 0.2) for (const m of mobs) if (m.st !== 'death' && (m.x - P.x) * P.face > -12 && Math.abs(m.x - P.x) < 66 && Math.abs(m.y - P.y) < 36) { m.st = 'death'; m.t = 0; }
      if (P.t > 0.3) P.st = 'idle';
    } else if (P.st === 'hurt') { if (P.t > 0.3) P.st = 'idle'; }
    else {
      const d = Math.hypot(mx, my);
      if (d) { P.x += mx / d * 150 * dt; P.y += my / d * 150 * dt; if (mx) P.face = mx > 0 ? 1 : -1; if (P.st !== 'walk') { P.st = 'walk'; P.t = 0; } }
      else if (P.st !== 'idle') { P.st = 'idle'; P.t = 0; }
    }
    clampP();
    for (const m of mobs) {
      m.t += dt;
      if (m.st === 'death') continue;
      const dx = P.x - m.x, dy = P.y - m.y, dist = Math.hypot(dx, dy) || 1;
      if (m.st === 'idle') {
        m.cd -= dt; m.x += dx / dist * 34 * dt; m.y += dy / dist * 34 * dt;
        if (m.cd <= 0 && dist < 240) { m.st = 'windup'; m.t = 0; m.vx = dx / dist; m.vy = dy / dist; }
      } else if (m.st === 'windup') { if (m.t > 0.65) { m.st = 'bump'; m.t = 0; } }
      else if (m.st === 'bump') {
        m.x += m.vx * 360 * dt; m.y += m.vy * 360 * dt;
        m.x = Math.max(BOUNDS.x0, Math.min(BOUNDS.x1, m.x)); m.y = Math.max(BOUNDS.y0, Math.min(BOUNDS.y1, m.y));
        if (Math.hypot(P.x - m.x, P.y - m.y) < 30) hurt(m);
        if (m.t > 0.36) { m.st = 'idle'; m.t = 0; m.cd = 0.9 + Math.random() * 0.9; }
      }
    }
    mobs = mobs.filter((m) => !(m.st === 'death' && m.t > 0.5));
    if (!mobs.length && !stairs) { stairs = true; msg = 2.2; }
    msg = Math.max(0, msg - dt);
    if (stairs && Math.hypot(P.x - 384, P.y - 290) < 30) { phase = 'down'; P.t = 0; P.x = 384; P.y = 290; }
  }

  const frame = (sheet: HTMLImageElement, row: number, f: number, x: number, y: number, flip: boolean) => {
    g.save(); g.translate(Math.round(x), Math.round(y)); if (flip) g.scale(-1, 1);
    g.drawImage(sheet, f * 32, row * 32, 32, 32, -F / 2, -F + 6, F, F); g.restore();
  };
  function draw() {
    g.drawImage(rooms[floor], 0, 0);
    if (stairs) {
      const p = 0.5 + 0.5 * Math.sin(performance.now() / 300);
      g.fillStyle = `rgba(233,162,59,${0.18 + p * 0.2})`; g.beginPath(); g.ellipse(384, 284, 40, 22, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#120D09'; for (let i = 0; i < 4; i++) g.fillRect(360 + i * 4, 270 + i * 6, 48 - i * 8, 6);
      g.fillStyle = '#E9A23B'; g.fillRect(358, 268, 52, 3);
    }
    const list: { y: number; d: () => void }[] = [];
    for (const m of mobs) {
      const [row, n, fps] = SLIME[m.st];
      if (m.st === 'windup') {
        g.save(); g.globalAlpha = 0.25 + 0.25 * Math.sin(m.t * 30); g.strokeStyle = '#FF3B1F'; g.lineWidth = 22; g.lineCap = 'round';
        g.beginPath(); g.moveTo(m.x, m.y - 8); g.lineTo(m.x + m.vx * 130, m.y - 8 + m.vy * 130); g.stroke(); g.restore();
      }
      list.push({ y: m.y, d: () => frame(slime, row, Math.min(n - 1, Math.floor(m.t * fps)) % n, m.x, m.y, P.x < m.x) });
    }
    if (!(phase === 'down' && P.t > 0.7)) {
      const [row, n, fps] = HERO[P.st];
      const f = P.st === 'idle' || P.st === 'walk' ? Math.floor(P.t * fps) % n : Math.min(n - 1, Math.floor(P.t * fps));
      list.push({ y: P.y, d: () => { if (P.inv > 0 && Math.floor(P.inv * 16) % 2) return; frame(hero, row, f, P.x, P.y, P.face < 0); } });
    }
    list.sort((a, b) => a.y - b.y).forEach((o) => o.d());
    for (let i = 0; i < 3; i++) g.drawImage(hearts, i < P.hp ? 0 : 16, 0, 16, 16, 18 + i * 38, 16, 32, 32);
    g.font = 'bold 20px Galmuri11, monospace'; g.textAlign = 'right'; g.fillStyle = '#E9DCC6';
    g.fillText(`B${depth}F · ${ko ? ROOMS[floor].ko : ROOMS[floor].en}`, W - 20, 40);
    g.textAlign = 'center';
    if (msg > 0) { g.fillStyle = `rgba(233,162,59,${Math.min(1, msg)})`; g.fillText(L.clear, W / 2, 120); }
    if (fade > 0) { g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, W, H); }
    if (phase === 'title' || phase === 'dead') {
      g.fillStyle = 'rgba(8,6,4,.62)'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#E9DCC6'; g.font = 'bold 54px Galmuri11, monospace'; g.fillText(phase === 'title' ? 'DEEPHOLD' : L.over, W / 2, H / 2 - 20);
      g.font = '20px Galmuri11, monospace'; g.fillStyle = '#E9A23B'; g.fillText(phase === 'title' ? L.title : L.again, W / 2, H / 2 + 26);
      g.fillStyle = '#9C8D77'; g.font = '16px Galmuri11, monospace'; g.fillText(touch ? '' : L.keys, W / 2, H / 2 + 60); g.fillText(L.sample, W / 2, H - 28);
    }
  }

  start(0);
  let last = performance.now(), raf = 0;
  const loop = (now: number) => {
    if (!el.isConnected) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (el.offsetParent) { step(dt); draw(); }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  // Galmuri is the game's own pixel font, served with the DeepHold site.
  if (!document.querySelector('style[data-galmuri]')) {
    const st = document.createElement('style'); st.dataset.galmuri = '1';
    st.textContent = "@font-face{font-family:Galmuri11;src:url(/deephold/fonts/Galmuri11-Bold.woff) format('woff');font-weight:700}@font-face{font-family:Galmuri11;src:url(/deephold/fonts/Galmuri11.woff) format('woff');font-weight:400}";
    document.head.appendChild(st);
  }
  return () => { cancelAnimationFrame(raf); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('blur', clearKeys); };
}
