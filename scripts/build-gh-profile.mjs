// Art for the GitHub profile README (github.com/qminlab): an animated hero, one card per work, section titles,
// a toolbelt and a liquid-metal footer. Served from qminlab.com/gh/ so the README only holds <img> links.
// GitHub shows these through <img>, so: no scripts, no web fonts (system fonts only), SMIL/CSS animation is fine.
// Usage: node scripts/build-gh-profile.mjs  (writes public/gh/*.svg)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('../public/gh/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const SANS = `-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',Helvetica,Arial,sans-serif`;
const MONO = `ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,'Noto Sans Mono',monospace`;
const ACCENT = '#FF5A1F';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = (w, h, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">\n<title>${esc(label)}</title>\n${body}\n</svg>\n`;
const write = (name, s) => writeFileSync(new URL(name, OUT), s);

// App icons, same glyphs and backgrounds as the Qmin OS home screen (src/components/os/boot.ts, os.src.css).
const ICON = {
  qmin: { bg: ['#FFFFFF', '#E9E6DD'], g: `<text x="11.5" y="17.5" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="15" fill="#0C0D0B">Q</text><circle cx="18" cy="17" r="2" fill="${ACCENT}"/>` },
  weming: { bg: ['#6A5CFF', '#FF4FA3'], g: '<path d="M3 6l4 12 5-9 5 9 4-12" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' },
  deephold: { bg: ['#221911', '#110C08'], g: '<g shape-rendering="crispEdges" transform="scale(1.5)"><rect x="3" y="2" width="10" height="2" fill="#E9A23B"/><rect x="2" y="4" width="2" height="10" fill="#E9A23B"/><rect x="12" y="4" width="2" height="10" fill="#E9A23B"/><rect x="5" y="6" width="6" height="8" fill="#2A1C12"/><rect x="7" y="9" width="2" height="2" fill="#FF5A1F"/></g>' },
  sword: { bg: ['#2B3A66', '#0B0F1E'], g: '<path d="M12 2v15" stroke="#E8F0FF" stroke-width="2" stroke-linecap="round"/><path d="M8 17h8M12 17v4" stroke="#C9A35C" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="5" r="1.4" fill="#FFE9A8"/><circle cx="6" cy="8" r=".9" fill="#FFE9A8"/>' },
  board: { bg: ['#FFFFFF', '#ECEAE4'], g: '<rect x="3" y="5" width="5" height="14" rx="1.5" fill="#5B6FD8"/><rect x="9.5" y="5" width="5" height="14" rx="1.5" fill="#E2574C"/><rect x="16" y="5" width="5" height="14" rx="1.5" fill="#3DB36B"/>' },
  jarvis: { bg: ['#0E2733', '#05090C'], g: '<g fill="none" stroke="#5FE0FF" stroke-width="1.4"><circle cx="12" cy="12" r="8.5" opacity=".6"/><circle cx="12" cy="12" r="5.5" stroke-dasharray="3 2"/></g><circle cx="12" cy="12" r="2" fill="#5FE0FF"/>' },
  tft: { bg: ['#1A2B2A', '#0C1514'], g: '<g fill="none" stroke="#6FE3C8" stroke-width="1.5"><path d="M12 3l7 4v8l-7 4-7-4V7z"/><path d="M12 8l3.5 2v4L12 16l-3.5-2v-4z" fill="#6FE3C8" fill-opacity=".3"/></g>' },
  gh: { bg: ['#2A2A2C', '#141415'], g: [...Array(20)].map((_, i) => `<rect x="${3 + (i % 5) * 3.8}" y="${4 + Math.floor(i / 5) * 4.2}" width="3" height="3" rx=".7" fill="${ACCENT}" fill-opacity="${[0.2, 0.5, 0.9, 0.35, 0.7][(i * 7) % 5]}"/>`).join('') },
};
// iOS-style squircle (continuous corners) for a size-s icon at x,y.
const squircle = (s) => {
  const k = s * 0.225, c = k * 0.55;
  return `M${k} 0H${s - k}C${s - k + c} 0 ${s} ${k - c} ${s} ${k}V${s - k}C${s} ${s - k + c} ${s - k + c} ${s} ${s - k} ${s}H${k}C${k - c} ${s} 0 ${s - k + c} 0 ${s - k}V${k}C0 ${k - c} ${k - c} 0 ${k} 0Z`;
};
let uid = 0;
const appIcon = (key, x, y, s, extra = '') => {
  const ic = ICON[key], id = `ic${uid++}`;
  return `<g transform="translate(${x} ${y})"${extra}>
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ic.bg[0]}"/><stop offset="1" stop-color="${ic.bg[1]}"/></linearGradient></defs>
  <path d="${squircle(s)}" fill="url(#${id})"/>
  <path d="${squircle(s)}" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="1"/>
  <g transform="translate(${s * 0.18} ${s * 0.18}) scale(${(s * 0.64) / 24})">${ic.g}</g>
</g>`;
};

/* ---------- hero ---------- */
{
  const W = 1280, H = 600;
  const blob = (cx, cy, r, c, o, dx, dy, dur) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${o}"><animate attributeName="cx" values="${cx};${cx + dx};${cx}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><animate attributeName="cy" values="${cy};${cy + dy};${cy}" dur="${dur * 1.3}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/></circle>`;
  // Contour lines like the Qmin OS wallpaper, drifting slowly.
  const lines = [...Array(9)].map((_, i) => {
    const y = 120 + i * 52, a = 26 + (i % 3) * 10;
    const d = `M-200 ${y} C 100 ${y - a}, 300 ${y + a}, 600 ${y} S 1100 ${y - a}, 1480 ${y + a * 0.6}`;
    return `<path d="${d}" fill="none" stroke="${i % 4 === 1 ? ACCENT : '#FFFFFF'}" stroke-opacity="${i % 4 === 1 ? 0.28 : 0.45}" stroke-width="1.2"><animateTransform attributeName="transform" type="translate" values="0 0;${i % 2 ? 60 : -60} ${i % 2 ? 6 : -6};0 0" dur="${18 + i * 2}s" repeatCount="indefinite"/></path>`;
  }).join('\n');
  const dockKeys = ['qmin', 'weming', 'deephold', 'sword', 'board', 'gh'];
  const S = 64, gap = 14, dockW = dockKeys.length * S + (dockKeys.length - 1) * gap + 36, dockX = (W - dockW) / 2, dockY = H - 112;
  // One icon after another hops, the way the Dock bounces an app that is launching.
  const dock = dockKeys.map((k, i) => {
    const x = dockX + 18 + i * (S + gap), t0 = i / dockKeys.length;
    const hop = `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -22;0 0;0 -10;0 0;0 0" keyTimes="0;${(t0).toFixed(3)};${(t0 + 0.035).toFixed(3)};${(t0 + 0.07).toFixed(3)};${(t0 + 0.095).toFixed(3)};${(t0 + 0.12).toFixed(3)};1" dur="12s" repeatCount="indefinite"/>`;
    return `<g>${appIcon(k, x, dockY + 14, S)}${hop}</g>`;
  }).join('\n');
  const word = (txt, size, ls) => `font-family="${SANS}" font-weight="900" font-size="${size}" letter-spacing="${ls}"`;
  const body = `
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>
  <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8EEE6"/><stop offset=".55" stop-color="#EEF0EC"/><stop offset="1" stop-color="#DDEBF0"/></linearGradient>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#5A4A3A" flood-opacity=".16"/></filter>
  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".62"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".38"/></linearGradient>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g filter="url(#blur)">
    ${blob(250, 170, 230, '#FFB48F', 0.75, 60, 40, 16)}
    ${blob(1040, 140, 210, '#7FD8C0', 0.6, -50, 50, 19)}
    ${blob(980, 470, 240, '#8FB0F5', 0.55, -70, -30, 22)}
    ${blob(640, 330, 120, '#FF7A45', 0.55, 40, -20, 13)}
    ${blob(130, 520, 170, '#C9B8FF', 0.45, 50, -40, 18)}
  </g>
  ${lines}
  <!-- menu bar -->
  <rect width="${W}" height="34" fill="#FFFFFF" fill-opacity=".5"/>
  <g font-family="${SANS}" font-size="14" fill="#1D1D1F">
    <text x="22" y="22" font-weight="900" font-size="15">Q<tspan fill="${ACCENT}">·</tspan></text>
    <text x="52" y="22" font-weight="700">Finder</text>
    <text x="112" y="22" fill="#3A3A3C">File   Edit   View   Go   Window   Help</text>
    <text x="${W - 22}" y="22" text-anchor="end" fill="#3A3A3C">EN  한국어    Daegu, Korea · since 2026</text>
  </g>
  <!-- QMIN, unfolding into CURIOUS-MEAN and back -->
  <g text-anchor="middle" fill="#0C0D0B">
    <text x="${W / 2}" y="292" ${word('', 200, -6)}>
      <tspan fill="${ACCENT}">Q</tspan> MIN
      <animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="0;.4;.46;.9;.96;1" dur="9s" repeatCount="indefinite"/>
    </text>
    <text x="${W / 2}" y="268" ${word('', 108, -3)} opacity="0">
      <tspan fill="${ACCENT}">CURIOUS</tspan>-MEAN
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.42;.48;.88;.94;1" dur="9s" repeatCount="indefinite"/>
    </text>
    <text x="${W / 2}" y="318" font-family="${MONO}" font-size="15" letter-spacing="3" fill="#6E6A63" opacity="0">Q = CURIOUS · MIN = MEAN
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.44;.5;.88;.94;1" dur="9s" repeatCount="indefinite"/>
    </text>
    <text x="${W / 2}" y="374" font-family="${SANS}" font-size="31" font-weight="700" fill="#1D1D1F">궁금함으로 시작해, 의미 있게 만듭니다.</text>
    <text x="${W / 2}" y="410" font-family="${SANS}" font-size="17" fill="#55524C">AI creator · apps, games and animation, built end to end with Claude Code</text>
  </g>
  <!-- Dock -->
  <rect x="${dockX}" y="${dockY}" width="${dockW}" height="${S + 28}" rx="26" fill="url(#glass)" stroke="#FFFFFF" stroke-opacity=".7" filter="url(#soft)"/>
  ${dock}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="28" fill="none" stroke="#000" stroke-opacity=".06"/>`;
  write('hero.svg', svg(W, H, body, 'Q MIN: qminlab, AI creator. 궁금함으로 시작해, 의미 있게 만듭니다.'));
}

/* ---------- ticker ---------- */
{
  const W = 1280, H = 54;
  const items = ['NOW', '딥홀드 v0.6 친구 테스트 빌드', '위밍 App Store 출시', '소드마스터 266컷 제작 중', 'Claude 대기판 매일 사용 중', 'qminlab.com 오픈소스 공개'];
  const run = items.map((t, i) => (i === 0 ? `<tspan fill="${ACCENT}" font-weight="800">${t}</tspan>` : t)).join('   ✦   ') + '   ✦   ';
  const body = `
<defs><clipPath id="c"><rect width="${W}" height="${H}" rx="14"/></clipPath></defs>
<g clip-path="url(#c)">
  <rect width="${W}" height="${H}" fill="#0C0D0B"/>
  <g font-family="${SANS}" font-size="18" fill="#ECE8DE">
    <g><animateTransform attributeName="transform" type="translate" values="0 0;-1300 0" dur="26s" repeatCount="indefinite"/>
      <text x="0" y="34" xml:space="preserve">${run}${run}${run}</text>
    </g>
  </g>
</g>`;
  write('ticker.svg', svg(W, H, body, 'Now: ' + items.slice(1).join(', ')));
}

/* ---------- section titles ---------- */
const section = (name, file, ko, en) => {
  const W = 1280, H = 86;
  const body = `
<g font-family="${MONO}" font-size="14" letter-spacing="2" fill="#8A857C"><text x="0" y="22">${file}</text></g>
<text x="0" y="66" font-family="${SANS}" font-size="34" font-weight="800" fill="${ACCENT}">${ko}<tspan fill="#8A857C" font-size="18" font-weight="600" dx="14">${en}</tspan></text>
<rect x="0" y="84" width="${W}" height="1.5" fill="#8A857C" fill-opacity=".35"/>
<rect x="0" y="84" width="120" height="2" fill="${ACCENT}"><animate attributeName="width" values="0;120;120" keyTimes="0;.25;1" dur="6s" repeatCount="indefinite"/></rect>`;
  write(`title-${name}.svg`, svg(W, H, body, `${ko} ${en}`));
};
section('works', 'FILE 001 / QMINLAB — 표본 대장', '지금 만드는 것', 'NOW BUILDING');
section('history', 'FILE 002 / 변화 과정', '홈페이지도 작품이에요', 'VERSION HISTORY');
section('tools', 'FILE 003 / 연구실 도구', '쓰는 도구', 'TOOLBELT');

/* ---------- work cards ---------- */
const STATUS = {
  ready: { c: '#FFB020', ko: '출시 대기중' },
  live: { c: '#3DDC84', ko: '출시' },
  dev: { c: ACCENT, ko: '개발 중' },
  making: { c: '#A98BFF', ko: '제작 중' },
  use: { c: '#3DDC84', ko: '사용 중' },
  paused: { c: '#9A968E', ko: '일시정지' },
};
const card = (name, o) => {
  const W = 620, H = 340, id = `bg-${name}`;
  const lines = o.one.map((l, i) => `<tspan x="40" dy="${i ? 30 : 0}">${esc(l)}</tspan>`).join('');
  const st = STATUS[o.st];
  const body = `
<defs>
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${o.bg.map((c, i) => `<stop offset="${i / (o.bg.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>
  <clipPath id="cc"><rect width="${W}" height="${H}" rx="26"/></clipPath>
</defs>
<g clip-path="url(#cc)">
  <rect width="${W}" height="${H}" fill="url(#${id})"/>
  ${o.art || ''}
  ${appIcon(name, 40, 38, 84)}
  <g font-family="${MONO}" font-size="14" letter-spacing="2" fill="${o.sub}"><text x="${W - 40}" y="58" text-anchor="end">${o.code} · ${o.type}</text></g>
  <text x="40" y="174" font-family="${SANS}" font-size="40" font-weight="800" fill="${o.ink}" letter-spacing="-.5">${esc(o.ko)}<tspan font-size="20" font-weight="600" fill="${o.sub}" dx="12">${esc(o.en)}</tspan></text>
  <text x="40" y="214" font-family="${SANS}" font-size="20" fill="${o.ink}" fill-opacity=".86">${lines}</text>
  <g transform="translate(40 ${H - 66})">
    <rect width="${o.pillW}" height="34" rx="17" fill="${o.ink}" fill-opacity=".1"/>
    <circle cx="20" cy="17" r="5" fill="${st.c}"><animate attributeName="opacity" values="1;.25;1" dur="1.8s" repeatCount="indefinite"/></circle>
    <circle cx="20" cy="17" r="5" fill="none" stroke="${st.c}"><animate attributeName="r" values="5;12" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="1.8s" repeatCount="indefinite"/></circle>
    <text x="36" y="23" font-family="${SANS}" font-size="16" font-weight="600" fill="${o.ink}">${esc(o.status)}</text>
  </g>
  <g transform="translate(${W - 74} ${H - 66})"><circle cx="17" cy="17" r="17" fill="${o.ink}" fill-opacity=".1"/><path d="M11 17h12M18 12l5 5-5 5" fill="none" stroke="${o.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>
</g>`;
  write(`card-${name}.svg`, svg(W, H, body, `${o.code} ${o.ko} (${o.en}): ${o.one.join(' ')} · ${o.status}`));
};
// Pixel stars, dungeon bricks, phone bubbles, board columns: a little scene behind each card.
const stars = [...Array(26)].map((_, i) => {
  const x = 300 + ((i * 97) % 300), y = 20 + ((i * 53) % 300), r = 0.8 + (i % 3) * 0.6;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFE9A8"><animate attributeName="opacity" values=".2;1;.2" dur="${2 + (i % 5)}s" begin="${(i % 7) * 0.4}s" repeatCount="indefinite"/></circle>`;
}).join('');
const bricks = [...Array(40)].map((_, i) => {
  const cx = i % 8, cy = Math.floor(i / 8);
  return `<rect x="${330 + cx * 36 + (cy % 2) * 18}" y="${70 + cy * 24}" width="32" height="20" fill="#E9A23B" fill-opacity="${0.04 + ((i * 7) % 5) * 0.015}" shape-rendering="crispEdges"/>`;
}).join('');
const torch = `<g transform="translate(560 110)" shape-rendering="crispEdges"><rect x="0" y="10" width="6" height="18" fill="#6B4A2B"/><rect x="-3" y="0" width="12" height="10" fill="#FF9A3C"><animate attributeName="fill" values="#FF9A3C;#FFD27A;#FF7A2C;#FF9A3C" dur=".9s" repeatCount="indefinite"/></rect></g>`;
const bubbles = `<g font-family="${SANS}" font-size="15">
  <g opacity=".95"><rect x="360" y="84" width="190" height="40" rx="20" fill="#FFFFFF" fill-opacity=".22"/><text x="380" y="110" fill="#fff">오늘 뭐 해요? 👋</text>
    <animateTransform attributeName="transform" type="translate" values="0 8;0 0;0 0;0 8" keyTimes="0;.1;.9;1" dur="6s" repeatCount="indefinite"/></g>
  <g><rect x="430" y="134" width="150" height="40" rx="20" fill="#FFFFFF"/><text x="450" y="160" fill="#6A5CFF">코딩이요 😅</text>
    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.25;.35;.9;1" dur="6s" repeatCount="indefinite"/></g>
</g>`;
const columns = ['#5B6FD8', '#E2574C', '#3DB36B'].map((c, i) => {
  const x = 370 + i * 76;
  const tiles = [0, 1, 2].map((j) => `<rect x="${x}" y="${100 + j * 44}" width="66" height="38" rx="8" fill="${c}" fill-opacity="${0.18 - j * 0.04}"/>`).join('');
  const blink = i === 1 ? `<rect x="${x}" y="100" width="66" height="38" rx="8" fill="${c}"><animate attributeName="opacity" values="0;.85;0" dur="1.6s" repeatCount="indefinite"/></rect>` : '';
  return `<rect x="${x}" y="84" width="66" height="8" rx="4" fill="${c}"/>${tiles}${blink}`;
}).join('');

card('weming', { code: 'QL-001', type: 'APP', ko: '위밍', en: 'Weming', st: 'live', status: 'App Store 출시 · Google Play 테스트', pillW: 320,
  one: ['사람 만나는 것보다 코드 짜는 게 더 쉬운', '1인 개발자가 만든 친구 찾기 앱'], bg: ['#5A4CF0', '#9B4FF2', '#F0448F'], ink: '#FFFFFF', sub: 'rgba(255,255,255,.72)', art: bubbles });
card('deephold', { code: 'QL-004', type: 'GAME', ko: '딥홀드', en: 'DeepHold', st: 'dev', status: '개발 중 · v0.6 친구 테스트', pillW: 250,
  one: ['던전에서 캐 온 자원으로 내 던전을 짓고,', '친구가 도전하는 2.5D 도트 액션 게임'], bg: ['#2A1E14', '#120D09'], ink: '#F3E6CF', sub: 'rgba(243,230,207,.6)', art: bricks + torch });
card('sword', { code: 'QL-006', type: 'ANIME', ko: '별을 품은 소드마스터', en: '', st: 'making', status: '제작 중 · 266컷 · 14분 21초', pillW: 262,
  one: ['같은 이름의 소설이 원작인 웹툰의 첫 이야기를', '한 편의 AI 애니메이션으로 옮기는 중'], bg: ['#24335E', '#0B0F1E'], ink: '#EEF2FF', sub: 'rgba(238,242,255,.62)', art: stars });
card('board', { code: 'QL-005', type: 'TOOL', ko: 'Claude 대기판', en: 'Wait Board', st: 'use', status: '사용 중 · 오픈소스', pillW: 190,
  one: ['여러 Claude 작업의 진행 상황을', '한눈에 보여주는 아이패드 현황판'], bg: ['#FFFFFF', '#EEEBE4'], ink: '#1D1D1F', sub: 'rgba(29,29,31,.5)', art: columns });

/* ---------- paused strip ---------- */
{
  const W = 1280, H = 120;
  const item = (k, x, ko, en, line) => `${appIcon(k, x, 24, 72)}
  <text x="${x + 92}" y="56" font-family="${SANS}" font-size="24" font-weight="800" fill="#ECE8DE">${ko}<tspan font-size="15" font-weight="600" fill="#9A968E" dx="10">${en}</tspan></text>
  <text x="${x + 92}" y="86" font-family="${SANS}" font-size="16" fill="#9A968E">${line}</text>`;
  const body = `
<rect width="${W}" height="${H}" rx="24" fill="#16171A"/>
<text x="${W - 36}" y="66" text-anchor="end" font-family="${MONO}" font-size="14" letter-spacing="2" fill="#6E6A63">PAUSED · 게임과 애니메이션에 집중하는 중</text>
${item('jarvis', 28, '자비스', 'Jarvis', 'AI 비서 겸 감독관 · 일시정지')}
${item('tft', 400, 'TFT 어시스턴트', 'Overlay', '게임 화면 위 공략 도우미 · v0.1')}`;
  write('paused.svg', svg(W, H, body, '일시정지: 자비스(AI 비서 겸 감독관), TFT 어시스턴트(게임 오버레이)'));
}

/* ---------- toolbelt ---------- */
{
  const W = 1280;
  const groups = [
    ['만들기', ['Claude Code', 'Claude API', 'TypeScript', 'Python']],
    ['앱 · 웹', ['React Native', 'Expo', 'Next.js', 'Firebase', 'RevenueCat']],
    ['게임', ['Phaser 3', 'Electron', 'GitHub Actions']],
    ['영상 · 소리', ['Seedance', 'ElevenLabs', 'ffmpeg']],
    ['배포', ['Cloudflare Pages', 'App Store', 'Google Play']],
  ];
  let y = 8, out = '';
  for (const [g, tools] of groups) {
    out += `<text x="0" y="${y + 27}" font-family="${SANS}" font-size="17" font-weight="700" fill="#8A857C">${g}</text>`;
    let x = 150;
    tools.forEach((t, i) => {
      const w = Math.round(t.length * 10.2 + 40);
      const hot = g === '만들기' && i === 0;
      out += `<g transform="translate(${x} ${y})"><rect width="${w}" height="40" rx="20" fill="${hot ? ACCENT : '#EFECE6'}"/><text x="${w / 2}" y="26" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="600" fill="${hot ? '#FFFFFF' : '#3A3732'}">${t}</text></g>`;
      x += w + 10;
    });
    y += 54;
  }
  write('tools.svg', svg(W, y, out, 'Toolbelt: ' + groups.map(([g, t]) => `${g}: ${t.join(', ')}`).join(' / ')));
}

/* ---------- footer: liquid-metal QMIN ---------- */
{
  const W = 1280, H = 300;
  const body = `
<defs>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="#5E5E66"/><stop offset=".22" stop-color="#F4F4F6"/><stop offset=".38" stop-color="#8A8A94"/>
    <stop offset=".55" stop-color="#FFFFFF"/><stop offset=".72" stop-color="#6C6C76"/><stop offset="1" stop-color="#E6E6EA"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-.6 0;.6 0;-.6 0" dur="7s" repeatCount="indefinite"/>
  </linearGradient>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="28"/></clipPath>
</defs>
<g clip-path="url(#fc)">
  <rect width="${W}" height="${H}" fill="#0C0D0B"/>
  <text x="${W / 2}" y="190" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="190" letter-spacing="-6" fill="url(#metal)">QMIN</text>
  <circle cx="${W / 2 + 282}" cy="176" r="14" fill="${ACCENT}"><animate attributeName="r" values="14;17;14" dur="2.4s" repeatCount="indefinite"/></circle>
  <text x="${W / 2}" y="252" text-anchor="middle" font-family="${MONO}" font-size="16" letter-spacing="3" fill="#8A857C">QMINLAB.COM  ·  HELLO@QMINLAB.COM  ·  SINCE 2026</text>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="28" fill="none" stroke="#FFFFFF" stroke-opacity=".08"/>`;
  write('footer.svg', svg(W, H, body, 'QMIN · qminlab.com · hello@qminlab.com · since 2026'));
}

/* ---------- version history: the three homepages as Safari windows (screenshots embedded, <img> can't fetch) ---------- */
{
  const W = 1280, H = 470;
  const shot = (i) => 'data:image/jpeg;base64,' + readFileSync(new URL(`../public/os/v${i}.jpg`, import.meta.url)).toString('base64');
  const vers = [
    ['v1', 'Specimen Lab', '2026-10-08', '작품을 연구실 표본처럼 진열'],
    ['v2', 'Open Lab', '2026-10-16', '큰 글자와 가로 스크롤'],
    ['v3', 'Qmin OS', '2026-10-23', '사이트 전체가 macOS · iOS'],
  ];
  const ww = 384, wh = 240 + 30;
  const win = ([v, name, date, line], i) => {
    const x = 32 + i * (ww + 32), y = 40, now = i === 2;
    return `<g transform="translate(${x} ${y})">
  <animateTransform attributeName="transform" type="translate" values="${x} ${y};${x} ${y - 8};${x} ${y}" dur="${6 + i}s" begin="${i * 0.8}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>
  <rect x="0" y="0" width="${ww}" height="${wh}" rx="14" fill="#FFFFFF" filter="url(#sh)"/>
  <circle cx="20" cy="15" r="5.5" fill="#FF5F57"/><circle cx="38" cy="15" r="5.5" fill="#FEBC2E"/><circle cx="56" cy="15" r="5.5" fill="#28C840"/>
  <rect x="92" y="6" width="${ww - 184}" height="18" rx="6" fill="#F0EFEC"/>
  <text x="${ww / 2}" y="19" text-anchor="middle" font-family="${SANS}" font-size="11" fill="#6E6A63">qminlab.com${now ? '' : '/archive/' + date}</text>
  <clipPath id="w${i}"><rect x="0" y="30" width="${ww}" height="240" rx="0"/></clipPath>
  <image href="${shot(i + 1)}" x="0" y="30" width="${ww}" height="240" preserveAspectRatio="xMidYMid slice" clip-path="url(#w${i})"/>
  <text x="0" y="${wh + 44}" font-family="${MONO}" font-size="14" letter-spacing="2" fill="${now ? ACCENT : '#8A857C'}">${v} · ${date}${now ? ' · NOW' : ''}</text>
  <text x="0" y="${wh + 76}" font-family="${SANS}" font-size="24" font-weight="800" fill="${now ? ACCENT : '#8A857C'}">${name}<tspan font-size="16" font-weight="500" fill="#8A857C" dx="10">${line}</tspan></text>
</g>`;
  };
  const body = `
<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity=".22"/></filter></defs>
${vers.map(win).join('\n')}
<path d="M${32 + ww + 6} 175h20M${32 + 2 * ww + 38} 175h20" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="4 4"><animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite"/></path>`;
  write('history.svg', svg(W, H, body, '변화 과정: v1 Specimen Lab (2026-10-08), v2 Open Lab (2026-10-16), v3 Qmin OS (2026-10-23)'));
}
console.log('wrote public/gh/*.svg');
