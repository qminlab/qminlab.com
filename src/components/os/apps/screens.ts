/**
 * App screens for the Qmin OS windows: the Stellar Swordmaster cut player, the Claude Wait Board, and the
 * paused JARVIS / 자비스 and TFT Assistant screens. Each mount fills `el`, is playable a little with sample
 * data, and returns a cleanup. Script and storyboard text is copied from the real production documents
 * (Korean originals, shown as-is in both languages); the frames are real stills from cut 2-05.
 */
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
type Stop = () => void;

/* ---------- 별을 품은 소드마스터: QuickTime-style player for one cut, script to graded shot ---------- */
const SK = '/specimens/starknight/';
export function mountSword(el: HTMLElement, ko: boolean): Stop {
  const st = ko ? ['각본', '콘티', '애니매틱', 'AI 영상', '보정 후'] : ['Script', 'Storyboard', 'Animatic', 'AI shot', 'Graded'];
  const cmp = ko ? '끌어서 보정 전후 비교' : 'Drag to compare before and after grading';
  const script = `<div class="sk-paper sk-script"><b>장면 2 — 대장간 앞의 별</b><small>슬럼가 대장간 앞 · 밤</small><i></i><i style="width:78%"></i>
    <p><em>2-05</em> 제미나가 걸어 들어와 허리에 손을 얹고 들여다본다.</p><p class="d">제미나: 또또또. 정신 못 차리고 있네.</p><p class="d">블라드: …방해할 거면 좀 꺼져.</p><i style="width:64%"></i><i style="width:86%"></i></div>`;
  const board = `<div class="sk-paper"><table><tr><th>컷</th><th>길이</th><th>샷</th><th>카메라 · 구도</th></tr>
    <tr><td class="c">2-05</td><td>7초<br>168F</td><td>MS</td><td>아이레벨, 고정 [■ 고정]<br>투샷. 블라드는 오른쪽에서 계속 위를 보고, 제미나가 왼쪽 프레임 밖에서 들어와 그를 들여다본다</td></tr>
    <tr><th>시선</th><td colspan="3">제미나 → 블라드 / 블라드 → 오른쪽 위(검)</td></tr><tr><th>배치</th><td colspan="3">제미나=왼쪽, 블라드=오른쪽, 매달린 검=오른쪽 위 화면 밖</td></tr></table></div>`;
  const shot = (f: string) => `<img src="${SK}${f}" alt="" draggable="false">`;
  // The AI shot and the graded shot are the real clips of this scene (about 7 seconds), muted.
  const clip = (f: string) => `<video poster="${SK}${f}.webp" muted playsinline preload="auto" disablepictureinpicture><source src="${SK}${f}.webm" type="video/webm"><source src="${SK}${f}.mp4" type="video/mp4"></video>`;
  const faces = [script, board, shot('animatic.webp'), clip('raw'), `<div class="sk-cmp">${clip('raw')}<div class="sk-after">${clip('graded')}</div><span class="sk-handle"></span><span class="sk-tip">${cmp}</span></div>`];
  el.innerHTML = `<div class="sk"><div class="sk-stage">${faces.map((f, i) => `<div class="sk-face" data-f="${i}">${f}<span class="sk-lab">CUT 2-05 · ${st[i]}</span></div>`).join('')}</div>
    <div class="sk-bar"><button class="sk-play" aria-label="play"></button><span class="sk-time">0:00</span><div class="sk-track">${st.map((s, i) => `<button data-s="${i}" title="${s}"><span>${s}</span><b><i></i></b></button>`).join('')}</div><span class="sk-time">0:35</span></div></div>`;
  const facesEl = [...el.querySelectorAll<HTMLElement>('.sk-face')], segs = [...el.querySelectorAll<HTMLElement>('[data-s]')];
  const playBtn = el.querySelector<HTMLElement>('.sk-play')!, timeEl = el.querySelector<HTMLElement>('.sk-time')!;
  const after = el.querySelector<HTMLElement>('.sk-after')!, handle = el.querySelector<HTMLElement>('.sk-handle')!, cmpEl = el.querySelector<HTMLElement>('.sk-cmp')!;
  const SEG = 7;
  const vids = facesEl.map((f) => [...f.querySelectorAll('video')]);
  // Keep the clips on the player's clock: play with it, pause with it, and snap back if they drift.
  const syncVideos = (i: number, u: number) => vids.forEach((vs, j) => vs.forEach((v) => {
    if (j !== i || !playing) { if (!v.paused) v.pause(); if (j !== i) return; }
    const at = u * SEG;
    if (Math.abs(v.currentTime - at) > 0.25 && v.readyState > 0) v.currentTime = at;
    if (playing && v.paused) v.play().catch(() => {});
  }));
  let t = 0, playing = true, wipe = -1, last = performance.now(), raf = 0;
  const setWipe = (k: number) => { after.style.clipPath = `inset(0 ${(1 - k) * 100}% 0 0)`; handle.style.left = k * 100 + '%'; };
  // Only touch the DOM when something visible changes; the image drift and the bar fill run on the compositor.
  let shown = -1, shownSec = -1, shownPlay: boolean | null = null, fill = -1;
  const render = () => {
    const i = Math.min(4, Math.floor(t / SEG)), u = (t - i * SEG) / SEG;
    if (i !== shown) { shown = i; facesEl.forEach((f, j) => f.classList.toggle('on', j === i)); segs.forEach((s, j) => s.classList.toggle('sk-past', j < i)); }
    const k = Math.round(u * 200) / 200;
    if (k !== fill) { fill = k; segs.forEach((s, j) => (s.querySelector('i')!.style.transform = `scaleX(${j === i ? k : j < i ? 1 : 0})`)); }
    syncVideos(i, u);
    if (i === 4 && wipe < 0) setWipe(Math.min(1, Math.max(0, (u - 0.1) / 0.5)));
    const sec = Math.floor(t);
    if (sec !== shownSec) { shownSec = sec; timeEl.textContent = `0:${String(sec).padStart(2, '0')}`; }
    if (playing !== shownPlay) { shownPlay = playing; playBtn.classList.toggle('paused', !playing); el.querySelector('.sk')!.classList.toggle('paused', !playing); }
  };
  let visible = true;
  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; });
  io.observe(el);
  const loop = (now: number) => {
    if (!el.isConnected) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (playing && visible) { t += dt; if (t >= SEG * 5) { t = SEG * 5 - 0.01; playing = false; } }
    if (visible) render();
    raf = requestAnimationFrame(loop);
  };
  playBtn.onclick = () => { if (!playing && t >= SEG * 5 - 0.02) { t = 0; wipe = -1; } playing = !playing; };
  segs.forEach((s) => (s.onclick = () => { t = +s.dataset.s! * SEG; wipe = -1; shown = -1; }));
  cmpEl.addEventListener('pointerdown', (e) => {
    playing = false; cmpEl.setPointerCapture(e.pointerId);
    const mv = (ev: PointerEvent) => { const r = cmpEl.getBoundingClientRect(); wipe = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)); setWipe(wipe); };
    mv(e); cmpEl.onpointermove = mv; cmpEl.onpointerup = () => { cmpEl.onpointermove = null; };
  });
  // Media-player keys while this window is in front: Space/K play-pause, ←/→ 5 s, J/L 10 s, Home/End, 1–5 jump to a step.
  const END = SEG * 5 - 0.01;
  const seek = (to: number) => { t = Math.max(0, Math.min(END, to)); wipe = -1; shown = -1; };
  const onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !el.isConnected || !el.offsetParent || el.closest('.win.inactive,.win[hidden]')) return;
    const a = document.activeElement; if (a && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
    if (a instanceof HTMLElement && el.contains(a)) a.blur(); // so Space doesn't also press a focused button
    const c = e.code;
    if (c === 'Space' || c === 'KeyK') { e.preventDefault(); playBtn.click(); }
    else if (c === 'ArrowLeft') { e.preventDefault(); seek(t - 5); }
    else if (c === 'ArrowRight') { e.preventDefault(); seek(t + 5); }
    else if (c === 'KeyJ') seek(t - 10);
    else if (c === 'KeyL') seek(t + 10);
    else if (c === 'Home' || c === 'Digit0') seek(0);
    else if (c === 'End') seek(END);
    else if (/^Digit[1-5]$/.test(c)) seek((+c.slice(5) - 1) * SEG);
  };
  addEventListener('keydown', onKey);
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); io.disconnect(); vids.flat().forEach((v) => v.pause()); removeEventListener('keydown', onKey); };
}

/* ---------- Claude 대기판: the iPad board, live sample tickets; tap a red ticket to approve it ---------- */
type Lane = 'work' | 'need' | 'done';
type Ticket = { n: number; name: number; lane: Lane; min: number; why?: 'perm' | 'pick' };
const BL = {
  ko: { title: 'CLAUDE 대기판', work: '작업중', need: '확인 필요', done: '완료', perm: '권한 승인', pick: '선택 필요', tap: '빨간 작업을 눌러 승인해 보세요',
    names: ['사이트 개발', '자비스 서버', 'TFT 오버레이', '디자인 시안', '위밍 답변', '문서 정리', '딥홀드 보스', '컷 보정'],
    t: (k: Ticket) => (k.lane === 'work' ? `${k.min}분째 작업` : k.lane === 'need' ? `${k.min}분째 대기` : `방금 완료 · ${k.min}분 걸림`) },
  en: { title: 'CLAUDE WAIT BOARD', work: 'WORKING', need: 'NEEDS ATTENTION', done: 'DONE', perm: 'PERMISSION', pick: 'CHOICE', tap: 'Tap a red ticket to approve it',
    names: ['Site build', 'Jarvis server', 'TFT overlay', 'Design draft', 'Weming reply', 'Doc cleanup', 'DeepHold boss', 'Cut grading'],
    t: (k: Ticket) => (k.lane === 'work' ? `${k.min} min working` : k.lane === 'need' ? `waiting ${k.min} min` : `just done · ${k.min} min`) },
};
const COLOR: Record<Lane, string> = { work: '#FF8A1F', need: '#FF3B30', done: '#34C759' };
export function mountBoard(el: HTMLElement, ko: boolean): Stop {
  const tx = ko ? BL.ko : BL.en;
  let next = 16;
  let tickets: Ticket[] = [{ n: 12, name: 0, lane: 'work', min: 12 }, { n: 13, name: 1, lane: 'work', min: 4 }, { n: 11, name: 2, lane: 'need', min: 3, why: 'perm' }, { n: 9, name: 3, lane: 'done', min: 23 }, { n: 14, name: 4, lane: 'work', min: 2 }];
  el.innerHTML = `<div class="wb2"><header><span>${tx.title}</span><span><b class="wb2-dot">●</b> LIVE · 1.5S</span></header><div class="wb2-cols"></div><footer>${tx.tap}</footer><div class="wb2-flash"></div></div>`;
  const cols = el.querySelector<HTMLElement>('.wb2-cols')!, flash = el.querySelector<HTMLElement>('.wb2-flash')!;
  const blink = (c: string) => { flash.style.background = c; flash.getAnimations().forEach((a) => a.cancel()); flash.animate([{ opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }], { duration: 1500 }); };
  const draw = () => {
    cols.innerHTML = (['work', 'need', 'done'] as Lane[]).map((lane) => {
      const list = tickets.filter((k) => k.lane === lane).slice(0, lane === 'done' ? 4 : 6);
      return `<div class="wb2-col"><div class="wb2-h" style="background:${COLOR[lane]}"><span>${tx[lane]}</span><span>${list.length}</span></div>${list.map((k) => `<button class="wb2-t" data-n="${k.n}" style="border-left-color:${COLOR[lane]}"><b style="color:${COLOR[lane]}">${String(k.n).padStart(3, '0')}</b><span>${tx.names[k.name]}</span><small>${tx.t(k)}</small>${k.why ? `<em>${tx[k.why]}</em>` : ''}</button>`).join('')}</div>`;
    }).join('');
  };
  cols.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-n]'); if (!b) return;
    const k = tickets.find((x) => x.n === +b.dataset.n!); if (!k || k.lane !== 'need') return;
    k.lane = 'work'; k.min = 0; k.why = undefined; draw();
  });
  // Every 2.6 s one thing happens, as on the real board: work finishes, asks for a decision, or a new task starts.
  const id = setInterval(() => {
    if (!el.offsetParent) return;
    tickets.forEach((k) => { if (k.lane !== 'done') k.min++; });
    const work = tickets.filter((k) => k.lane === 'work'), r = Math.random();
    if (work.length && r < 0.38) { const k = work[Math.floor(Math.random() * work.length)]; k.lane = 'done'; blink(COLOR.done); }
    else if (work.length && r < 0.62) { const k = work[Math.floor(Math.random() * work.length)]; k.lane = 'need'; k.min = 0; k.why = Math.random() < 0.6 ? 'perm' : 'pick'; blink(COLOR.need); }
    else if (work.length < 4) tickets.push({ n: next++, name: Math.floor(Math.random() * tx.names.length), lane: 'work', min: 0 });
    tickets = tickets.filter((k, i, a) => k.lane !== 'done' || a.filter((x) => x.lane === 'done').indexOf(k) < 4);
    tickets.sort((a, b) => (a.lane === 'done' && b.lane === 'done' ? b.n - a.n : a.n - b.n));
    draw();
  }, 2600);
  draw();
  return () => clearInterval(id);
}

/* ---------- JARVIS / 자비스: the assistant's console, paused; you can still talk to it ---------- */
export function mountJarvis(el: HTMLElement, ko: boolean): Stop {
  const T = ko
    ? { status: '일시정지 · 대기 중', ph: '자비스에게 말하기…', send: '보내기', log: [['09:12', '휴대폰 감지 · 집중 시간이라 알림 보냄'], ['10:40', '45분째 같은 화면 · 스트레칭 권유'], ['13:05', '점심 기록: 김치볶음밥'], ['18:30', '오늘 집중 4시간 20분']],
        hello: '안녕하세요. 지금은 일시정지 상태예요. 게임과 애니메이션에 집중하느라 잠시 멈춰 뒀어요.', reply: ['일시정지 중이라 지금은 기록만 볼 수 있어요.', '다시 켜지면 일정, 집중 시간, 습관을 같이 챙겨 드릴게요.', '저는 맥 서버에서 돌고, 윈도우와 iOS 단축어로도 불러요.'] }
    : { status: 'Paused · standing by', ph: 'Say something to Jarvis…', send: 'Send', log: [['09:12', 'Phone spotted during focus time, nudged'], ['10:40', '45 min on one screen, suggested a stretch'], ['13:05', 'Lunch logged'], ['18:30', 'Focused 4 h 20 min today']],
        hello: 'Hello. I am paused right now; my maker is focusing on the game and the animation.', reply: ['While paused I can only show the log.', 'Once I am back I keep track of schedule, focus time and habits.', 'I run on a Mac server and answer from Windows and iOS Shortcuts.'] };
  el.innerHTML = `<div class="jv"><div class="jv-core"><svg viewBox="0 0 200 200">${[90, 78, 64, 50, 36].map((r, i) => `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${i % 2 ? 'rgba(236,232,222,.55)' : '#FF5A1F'}" stroke-width="${[3, 1.5, 6, 1, 3][i]}" stroke-dasharray="${[`${r * 0.5} ${r * 0.2}`, '2 5', `${r * 0.9} ${r * 0.6}`, '0', `${r * 2} ${r}`][i]}" class="jv-r" style="animation-duration:${[24, 16, 11, 30, 7][i]}s;animation-direction:${i % 2 ? 'reverse' : 'normal'}"/>`).join('')}<circle cx="100" cy="100" r="14" fill="#FF5A1F" class="jv-dot"/></svg><b>JARVIS / 자비스</b><small>${T.status}</small></div>
    <div class="jv-side"><ul class="jv-log">${T.log.map((l) => `<li><time>${l[0]}</time>${esc(l[1])}</li>`).join('')}</ul><div class="jv-chat"><p class="ai">${esc(T.hello)}</p></div><form class="jv-in"><input placeholder="${T.ph}" aria-label="${T.ph}"><button>${T.send}</button></form></div></div>`;
  const chat = el.querySelector<HTMLElement>('.jv-chat')!, form = el.querySelector<HTMLFormElement>('form')!, inp = form.querySelector('input')!;
  let n = 0; const timers: number[] = [];
  form.onsubmit = (e) => {
    e.preventDefault(); const v = inp.value.trim(); if (!v) return; inp.value = '';
    chat.insertAdjacentHTML('beforeend', `<p class="me">${esc(v)}</p>`);
    timers.push(window.setTimeout(() => { chat.insertAdjacentHTML('beforeend', `<p class="ai">${esc(T.reply[n++ % T.reply.length])}</p>`); chat.scrollTop = chat.scrollHeight; }, 700));
    chat.scrollTop = chat.scrollHeight;
  };
  return () => timers.forEach(clearTimeout);
}

/* ---------- TFT 어시스턴트: overlay panels over a hex board; click a unit for its items ---------- */
export function mountTft(el: HTMLElement, ko: boolean): Stop {
  const U = ko
    ? [{ n: '탱커', r: 0, c: 1, items: ['워모그', '가고일', '태양불꽃'] }, { n: '전사', r: 0, c: 4, items: ['피바라기', '거인 학살자', '수호천사'] }, { n: '마법사', r: 2, c: 2, items: ['보석 건틀릿', '라바돈', '대천사'] }, { n: '저격수', r: 3, c: 6, items: ['무한의 대검', '최후의 속삭임', '구인수'] }, { n: '서포터', r: 3, c: 0, items: ['구원', '강철의 솔라리', '쇼진의 창'] }]
    : [{ n: 'Tank', r: 0, c: 1, items: ["Warmog's", 'Gargoyle', 'Sunfire'] }, { n: 'Fighter', r: 0, c: 4, items: ['Bloodthirster', 'Giant Slayer', 'Edge of Night'] }, { n: 'Mage', r: 2, c: 2, items: ['Jeweled Gauntlet', "Rabadon's", "Archangel's"] }, { n: 'Marksman', r: 3, c: 6, items: ['Infinity Edge', 'Last Whisper', "Guinsoo's"] }, { n: 'Support', r: 3, c: 0, items: ['Redemption', 'Solari', "Shojin"] }];
  const L = ko ? { comp: '추천 조합 · 1티어', aug: '증강 추천', augs: ['전투 훈련', '보석 상자', '빠른 레벨업'], items: '추천 아이템', pick: '말을 눌러 보세요', paused: '일시정지 · v0.1' }
    : { comp: 'Suggested comp · Tier 1', aug: 'Augments', augs: ['Combat Training', 'Jeweled Lotus', 'Level Up!'], items: 'Suggested items', pick: 'Click a unit', paused: 'Paused · v0.1' };
  const hex = (r: number, c: number) => ({ x: 46 + c * 64 + (r % 2) * 32, y: 40 + r * 56 });
  const path = (x: number, y: number, s = 30) => Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return `${(x + s * Math.cos(a)).toFixed(1)},${(y + s * Math.sin(a)).toFixed(1)}`; }).join(' ');
  let cells = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const p = hex(r, c); cells += `<polygon points="${path(p.x, p.y)}" class="tf-cell"/>`; }
  const units = U.map((u, i) => { const p = hex(u.r, u.c); return `<g class="tf-u" data-u="${i}" transform="translate(${p.x},${p.y})"><polygon points="${path(0, 0, 24)}"/><text y="5">${u.n.slice(0, ko ? 2 : 3)}</text></g>`; }).join('');
  el.innerHTML = `<div class="tf"><div class="tf-game"><svg viewBox="0 0 500 250">${cells}${units}</svg></div>
    <div class="tf-panel tf-top"><b>${L.comp}</b><span>${U.map((u) => u.n).join(' · ')}</span></div>
    <div class="tf-panel tf-aug"><b>${L.aug}</b>${L.augs.map((a, i) => `<span><i>${i + 1}</i>${a}</span>`).join('')}</div>
    <div class="tf-panel tf-item"><b>${L.items}</b><div class="tf-items">${L.pick}</div></div><span class="tf-tag">${L.paused}</span></div>`;
  const box = el.querySelector<HTMLElement>('.tf-items')!;
  el.querySelectorAll<SVGGElement>('.tf-u').forEach((g) => g.addEventListener('click', () => {
    el.querySelectorAll('.tf-u').forEach((x) => x.classList.toggle('on', x === g));
    const u = U[+g.dataset.u!]; box.innerHTML = `<em>${u.n}</em>${u.items.map((x) => `<span>${esc(x)}</span>`).join('')}`;
  }));
  return () => {};
}
