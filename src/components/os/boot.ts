// @ts-nocheck -- a direct DOM engine (windows, Dock, Spotlight, iOS sheets) kept in the mockup's compact style.
/**
 * Qmin OS engine: turns one empty element into the homepage computer.
 * Wide screens get a macOS desktop (menu bar, widgets, desktop files, Dock, spring windows, Spotlight, Apps (the Tahoe launcher),
 * Mission Control, Show Desktop, Quick Look, context menus); phones (max-width 720px) get an iOS 26 home screen
 * (pages, folders, apps that zoom open from their icon, home-bar swipe, long-press menus, jiggle editing, search).
 * Every visitor's arrangement (desktop icons, widgets, Dock order, iPhone icons) is kept in their own browser.
 * Words come from strings.ts (`D.T`); project facts come from messages/<locale>.json through QminOS.tsx.
 * Returns a cleanup that removes every listener, timer and animation loop it started.
 */
import type { OsData } from './QminOS';
import { genie, type Box } from './genie';
import { mountDeepHold } from './apps/deephold';
import { mountBoard, mountJarvis, mountSword, mountTft } from './apps/screens';

export function boot(root: HTMLElement, D: OsData) {
const T = D.T, L = D.locale, GH = D.github;
const ac = new AbortController(), sig = { signal: ac.signal };
const on = (t, ev, fn, o = {}) => t.addEventListener(ev, fn, { ...o, ...sig });
const timers = new Set();
const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
const $ = (s) => root.querySelector(s);
const has = (c) => root.classList.contains(c);

/* ---------- Apple squircle mask ---------- */
{let d='';for(let i=0;i<=160;i++){const t=i/160*2*Math.PI,c=Math.cos(t),s=Math.sin(t),n=5;
  d+=(i?'L':'M')+(50+50*Math.sign(c)*Math.abs(c)**(2/n)).toFixed(2)+','+(50+50*Math.sign(s)*Math.abs(s)**(2/n)).toFixed(2)}
  root.style.setProperty('--sq',`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${d}Z'/></svg>`)}")`)}

/* ---------- data ---------- */
const P = D.projects, ORDER = D.order;
const SEARCH = ['M10.2 10.2l3.6 3.6', '<circle cx="6.8" cy="6.8" r="4.6"/>'];
const searchSvg = (w) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round">${SEARCH[1]}<path d="${SEARCH[0]}"/></svg>`;
const GLYPH={
  weming:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l4 12 5-9 5 9 4-12"/></svg>',
  deephold:'<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="3" y="2" width="10" height="2" fill="#E9A23B"/><rect x="2" y="4" width="2" height="10" fill="#E9A23B"/><rect x="12" y="4" width="2" height="10" fill="#E9A23B"/><rect x="5" y="6" width="6" height="8" fill="#2A1C12"/><rect x="7" y="9" width="2" height="2" fill="#FF5A1F"/></svg>',
  sword:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 2v15" stroke="#E8F0FF" stroke-width="2" stroke-linecap="round"/><path d="M8 17h8M12 17v4" stroke="#C9A35C" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="5" r="1.4" fill="#FFE9A8"/><circle cx="6" cy="8" r=".9" fill="#FFE9A8"/></svg>',
  board:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="5" height="14" rx="1.5" fill="#5B6FD8"/><rect x="9.5" y="5" width="5" height="14" rx="1.5" fill="#E2574C"/><rect x="16" y="5" width="5" height="14" rx="1.5" fill="#3DB36B"/></svg>',
  jarvis:'<svg viewBox="0 0 24 24" fill="none" stroke="#5FE0FF" stroke-width="1.4"><circle cx="12" cy="12" r="8.5" opacity=".6"/><circle cx="12" cy="12" r="5.5" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="2" fill="#5FE0FF"/></svg>',
  tft:'<svg viewBox="0 0 24 24" fill="none" stroke="#6FE3C8" stroke-width="1.5"><path d="M12 3l7 4v8l-7 4-7-4V7z"/><path d="M12 8l3.5 2v4L12 16l-3.5-2v-4z" fill="#6FE3C8" fill-opacity=".3"/></svg>',
  qmin:'<svg viewBox="0 0 24 24"><text x="11.5" y="17.5" text-anchor="middle" font-family="-apple-system,Helvetica" font-weight="900" font-size="15" fill="#0C0D0B">Q</text><circle cx="18" cy="17" r="2" fill="#FF5A1F"/></svg>',
  archive:'<svg viewBox="0 0 24 24" style="width:80%;height:80%"><circle cx="12" cy="12" r="10" fill="#1E90FF"/><circle cx="12" cy="12" r="8.4" fill="none" stroke="#fff" stroke-width=".5" stroke-dasharray=".5 1.3"/><path d="M16.4 7.6l-3.1 5.7-5.7 3.1 3.1-5.7z" fill="#fff"/><path d="M16.4 7.6l-5.7 3.1 2.6 2.6z" fill="#FF453A"/></svg>',
  files:'<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#1E90FF"/><path d="M3 10h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#4AA8FF"/></svg>',
  trash:'<svg viewBox="0 0 24 24"><path d="M6 6.5h12l-1.2 14a1.6 1.6 0 0 1-1.6 1.5H8.8a1.6 1.6 0 0 1-1.6-1.5z" fill="rgba(255,255,255,.75)" stroke="rgba(0,0,0,.28)" stroke-width=".6"/><path d="M5 5.5h14" stroke="rgba(0,0,0,.4)" stroke-width="1.3" stroke-linecap="round"/><path d="M9.5 9v10M12 9v10M14.5 9v10" stroke="rgba(0,0,0,.22)" stroke-width=".6"/></svg>',
  rules:'<svg viewBox="0 0 24 24"><circle cx="6" cy="7" r="2" fill="#FF5A1F"/><circle cx="6" cy="12" r="2" fill="#0A84FF"/><circle cx="6" cy="17" r="2" fill="#30D158"/><path d="M10 7h9M10 12h9M10 17h9" stroke="#C7C7CC" stroke-width="1.4"/></svg>',
  contact:'<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="#F2F2F7"/><path d="M4.5 21c.8-4 4-6 7.5-6s6.7 2 7.5 6z" fill="#F2F2F7"/></svg>',
  gh:'<svg viewBox="0 0 24 24">'+[...Array(20)].map((_,i)=>`<rect x="${3+(i%5)*3.8}" y="${4+Math.floor(i/5)*4.2}" width="3" height="3" rx=".7" fill="#FF5A1F" fill-opacity="${[.2,.5,.9,.35,.7][(i*7)%5]}"/>`).join('')+'</svg>',
  launch:'<svg viewBox="0 0 24 24">'+['#FF453A','#FF9F0A','#FFD60A','#30D158','#64D2FF','#0A84FF','#BF5AF2','#FF375F','#AC8E68'].map((c,i)=>`<rect x="${4.5+(i%3)*5.5}" y="${4.5+Math.floor(i/3)*5.5}" width="4" height="4" rx="1" fill="${c}"/>`).join('')+'</svg>',
};
const icon=(k,paused)=>`<div class="appic ${P[k]?'ic-'+k:'ic-'+k}${paused?' paused':''}">${GLYPH[k]}</div>`;
const pIcon=k=>icon(k,P[k]&&P[k].st==='paused');
const macIcon=k=>`<span class="mi">${pIcon(k)}</span>`;
const FOLDER_SVG='<svg class="mfold" viewBox="0 0 100 100"><defs><linearGradient id="qfb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4AA6F2"/><stop offset="1" stop-color="#2F8DE4"/></linearGradient><linearGradient id="qff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC7FC"/><stop offset="1" stop-color="#58B1F7"/></linearGradient></defs><path d="M7 21.5a5 5 0 0 1 5-5h21.5c1.9 0 3 .6 4.2 1.9l3.2 3.5c.9 1 1.8 1.4 3.2 1.4H88a5 5 0 0 1 5 5V80a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5z" fill="url(#qfb)"/><path d="M5 32.5a5 5 0 0 1 5-5h80a5 5 0 0 1 5 5V81a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z" fill="url(#qff)"/><path d="M10 28.1h80" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/></svg>';
const SIDE_FOLDER='<svg viewBox="0 0 17 14"><path d="M1.2 3A1.6 1.6 0 0 1 2.8 1.4h3.6l1.6 1.7h6.2A1.6 1.6 0 0 1 15.8 4.7v6.7A1.6 1.6 0 0 1 14.2 13H2.8a1.6 1.6 0 0 1-1.6-1.6zM1.2 5h14.6" fill="none" stroke="#007AFF" stroke-width="1.3"/></svg>';
const VERSIONS=T.versions.map((v,i)=>({...v,v:'v'+(i+1),url:D.versions[i]?.url,shot:D.versions[i]?.shot,now:i===T.versions.length-1}));
const verOf=v=>VERSIONS.find(a=>a.v===v);

/* ---------- skeleton ---------- */
const brand=D.brand;
// Visitors on Windows see their own column of the shortcuts widget highlighted.
const IS_WIN=/Win/.test(navigator.platform||'')||/Windows/.test(navigator.userAgent);
const wordHtml=id=>`<div class="word" id="${id}" tabindex="0" aria-label="${T.wordAria}"><span class="q">Q</span><span class="rest">URIOUS-</span><span>MIN</span><span class="rest">EAN</span></div>`;
const ghTop=`<span class="k">GitHub · ${D.ghUser}</span>`;
root.innerHTML=`<canvas id="wall" aria-hidden="true"></canvas>
<div id="mac">
  <nav class="menubar" aria-label="${T.menuLabel}">
    <button class="logo" id="mbLogo" aria-label="Qmin">Q<b>·</b></button>
    <span class="app" id="activeApp">Finder</span>
    ${T.menus.map(m=>`<span class="mn">${m}</span>`).join('')}
    <span class="sp"></span>
    <button class="mbi" id="mbSpot" aria-label="${T.spotlight} (⌘K)">${searchSvg(1.6)}</button>
    <span class="seg" role="group" aria-label="${T.langLabel}">${D.langs.map(l=>`<a href="/${l.code}/" data-lang="${l.code}" aria-current="${l.code===L}" hreflang="${l.code}">${l.label}</a>`).join('')}</span>
    <span class="clock" id="clock"></span>
  </nav>
  <section class="widgets" aria-label="${T.widgetsLabel}">
    <div class="wg med vib wg-hero" data-k="hero"><div class="k">${T.since}</div>${wordHtml('word1')}<p>${brand.join(' ')}</p></div>
    <div class="wg vib wg-status" data-k="status"><h3>${T.onBench}</h3><div id="statusList"></div></div>
    <a class="wg med vib wg-gh" data-k="gh" draggable="false" href="${GH}" target="_blank" rel="noopener">
      <div class="gh-top">${ghTop}</div>
      <div class="gh-top" style="margin-top:4px"><span class="gh-n" data-ghn></span><span class="gh-sub" data-ghs>${T.ghLoading}</span></div>
      <div class="contrib" data-contrib="26"></div>
    </a>
  </section>
  <section class="widgets2" aria-label="${T.keysTitle}">
    <div class="wg vib wg-keys" data-k="keys"><h3>${T.keysTitle}</h3>
      <table><thead><tr><th></th><th${IS_WIN?'':' class="me"'}>Mac</th><th${IS_WIN?' class="me"':''}>Windows</th></tr></thead>
      <tbody>${T.keys.map(([a,m,w])=>`<tr><td>${a}</td><td${IS_WIN?'':' class="me"'}>${m}</td><td${IS_WIN?' class="me"':''}>${w}</td></tr>`).join('')}</tbody></table></div>
  </section>
  <section class="dicons" id="dicons" aria-label="${T.desktop}"></section>
  <nav class="dock" id="dock" aria-label="Dock"></nav>
</div>
<div id="ios" aria-label="${T.homeLabel}">
  <canvas id="iwall" aria-hidden="true"></canvas>
  <div class="home" id="home">
    <div class="pages" id="pages">
      <div class="page"><div class="iwrap">
        <div class="iw lg"><div class="k">${T.since}</div>${wordHtml('word2')}<p>${brand.join('<br>')}</p></div>
        <div class="igrid" id="igrid"></div>
        <div class="iw lg idocs p1"></div>
      </div></div>
      <div class="page"><div class="iwrap">
        <div class="iw lg idocs p2"></div>
        <a class="iw lg gh" href="${GH}" target="_blank" rel="noopener"><div><div class="k">GitHub</div><div class="gh-n" data-ghn style="margin-top:4px"></div><div class="gh-sub" data-ghs>${T.ghLoading}</div></div><div class="contrib" data-contrib="16"></div></a>
      </div></div>
    </div>
    <button class="ipill lg" id="ipill" aria-label="${T.search}"><span class="lbl">${searchSvg(2)}${T.search}</span><span class="dts"><i class="on"></i><i></i></span></button>
    <div class="idock lg" id="idock"></div>
  </div>
</div>`;
root.querySelectorAll('[data-lang]').forEach(a=>on(a,'click',()=>{document.cookie=`lang=${a.dataset.lang}; path=/; max-age=31536000; samesite=lax`}));

/* ---------- GitHub contributions (read by functions/api/github.js from github.com/<user>) ---------- */
function drawContrib(days){
  root.querySelectorAll('[data-contrib]').forEach(el=>{const weeks=+el.dataset.contrib,today=new Date();
    const n=(weeks-1)*7+today.getDay()+1,list=days?days.slice(-n):Array.from({length:n},()=>null);
    el.innerHTML=list.map((x,i)=>`<i data-l="${x?x.l:0}"${x?` title="${x.d} · ${x.n}"`:''}${i===list.length-1?' class="today"':''}></i>`).join('')})}
drawContrib(null);
fetch('/api/github',{signal:ac.signal}).then(r=>r.ok?r.json():Promise.reject()).then(g=>{
  if(!g||!Array.isArray(g.days)||!g.days.length)throw 0;
  let streak=0;for(let i=g.days.length-1;i>=0;i--){if(g.days[i].n)streak++;else if(i<g.days.length-1)break}
  drawContrib(g.days);
  root.querySelectorAll('[data-ghn]').forEach(e=>e.textContent=Number(g.total||0).toLocaleString(L));
  root.querySelectorAll('[data-ghs]').forEach(e=>e.textContent=T.ghRecent(streak));
}).catch(()=>{if(ac.signal.aborted)return;root.querySelectorAll('[data-ghn]').forEach(e=>e.textContent='GitHub');root.querySelectorAll('[data-ghs]').forEach(e=>e.textContent=T.ghOffline)});

/* ---------- content renderers (shared by mac and iOS) ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ext=(href,label,cls='btn')=>`<a class="${cls}" href="${href}" target="_blank" rel="noopener">↗ ${label}</a>`;
// A project's case file opens inside the site, in a Safari window; the DeepHold site is a page of its own, so it gets a new tab.
const caseLink=(p,cls)=>!p.caseHref?'':p.caseExt?ext(p.caseHref,p.caseLabel,cls):`<a class="${cls}" href="${p.caseHref}" data-saf="${p.caseHref}" data-saf-t="${esc(p.name+' — '+p.caseLabel)}">${p.caseLabel}</a>`;
function caseFile(k){const p=P[k];return `<article class="doc">
  <div class="eyebrow">${p.code} · ${p.type} <span class="pill ${p.st}">${p.stl}</span></div>
  <h2>${p.name}</h2><p>${p.one}</p>${p.desc?`<p>${p.desc}</p>`:''}
  <dl class="kv"><dt>${T.platform}</dt><dd>${p.platform}</dd><dt>${T.stage}</dt><dd>${p.stage}</dd><dt>${T.stack}</dt><dd>${p.stack}</dd></dl>
  <div class="btns">${p.kind!=='paused'?`<button class="btn pri" data-open="${k}">${T.run}</button>`:''}${p.links.map(([l,h])=>ext(h,l)).join('')}${caseLink(p,'btn')}</div></article>`}
const CHEV='<svg viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2L2 8l6 6"/></svg>';
function about(){return `<article class="doc"><div class="eyebrow">${T.aboutEyebrow}</div>
  <h2>${brand.join(' ')}</h2><p>${esc(D.about.lead)}</p><p>${T.aboutName}</p>
  <dl class="kv">${D.about.facts.map(f=>`<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join('')}</dl>
  <div class="btns">${ext(`/${L}/about/`,T.aboutMore[0])}${ext(`/${L}/faq/`,T.aboutMore[1])}</div></article>`}
function rules(){return `<div class="rules">${D.rules.map((r,i)=>`<div class="rule"><div class="n">${T.rule(i+1)}</div><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p></div>`).join('')}</div>`}
function contact(){return `<div class="card"><div class="av">Q<b>.</b></div><h2>qminlab</h2><div class="role">${T.contactRole}</div>
  <div class="cfield"><div><small>${T.email}</small><span>${D.email}</span></div><button class="btn" data-copy="${D.email}">${T.copy}</button></div>
  <div class="cfield"><div><small>GitHub</small><span>${GH.replace('https://','')}</span></div>${ext(GH,T.open)}</div></div>`}
const thumb=v=>`<div class="shot" style="${v.shot?`background-image:url(${v.shot})`:''}"></div>`;
function history(){return `<div class="hist"><p class="lead">${T.histLead}</p><div class="tl">${VERSIONS.map(v=>`<div class="ver${v.now?' now':''}">${thumb(v)}<div><div class="d">${v.v} · ${v.d}</div><h3>${v.name}</h3><p>${v.p}</p>${v.now?'':`<div class="btns" style="margin-top:6px"><button class="btn pri" data-arch="${v.v}">${T.openVersion}</button>${ext(v.url,T.newTab)}</div>`}</div></div>`).join('')}</div></div>`}
// Past homepages run in a frame from /archive/<date>/, exactly as they shipped.
const safPage=(url,title)=>`<div class="saf"><div class="addr"><span>qminlab.com${url}</span>${ext(url,T.newTab,'')}</div><iframe src="${url}" title="${title}" loading="lazy"></iframe></div>`;
function archived(v){const x=verOf(v);return safPage(x.url,esc(x.name))}
const safHistory=()=>`<div class="saf"><div class="addr"><span>qminlab.com/archive/</span></div><div class="saf-body">${history()}</div></div>`;

// Each app runs its real screen (sample data, playable a little); see apps/ and WemingPhone.
const APPS={
  weming:{title:P.weming.name,w:393,h:760,dark:true},
  deephold:{title:P.deephold.name,w:768,h:576,dark:true},
  sword:{title:`${P.sword.name} — ${T.cut}`,w:800,h:500,dark:true},
  board:{title:P.board.name,w:820,h:560,dark:true},
  jarvis:{title:P.jarvis.name,w:760,h:480,dark:true},
  tft:{title:P.tft.name,w:820,h:520,dark:true},
};
const MOUNT={weming:el=>D.mountWeming(el),deephold:el=>mountDeepHold(el,L==='ko',{site:P.deephold.caseHref,download:P.deephold.links[0]?.[1]}),sword:el=>mountSword(el,L==='ko'),board:el=>mountBoard(el,L==='ko'),jarvis:el=>mountJarvis(el,L==='ko'),tft:el=>mountTft(el,L==='ko')};
// Every app here is a web preview: say so, and link to where the real thing lives.
const appTools=k=>{const p=P[k];return `<span class="atools"><span class="apv" title="${T.previewNote}">${T.previewTag}</span>${p.links.map(([l,h])=>ext(h,l,'alink')).join('')}${caseLink(p,'alink')}</span>`};
const appBody=k=>`<div class="appmount app-${k}" data-app="${k}"></div>`;
// Mount the app into its window or sheet; the returned stop runs when that window closes.
function startApp(k,host){const m=host.querySelector('[data-app]');return m?MOUNT[k](m):()=>{}}

/* ---------- spring easing ---------- */
function spring(k=210,c=22,n=48){let x=0,v=0,t=0;const dt=1/600,h=[];while(t<2){v+=(-k*(x-1)-c*v)*dt;x+=v*dt;t+=dt;h.push(x);if(t>.25&&Math.abs(x-1)<.001&&Math.abs(v)<.02)break}
  const p=[];for(let i=1;i<=n;i++)p.push(+h[Math.round(i/n*(h.length-1))].toFixed(4));p[n-1]=1;return{e:`linear(0,${p.join(',')})`,d:Math.round(t*1000)}}
const LIN=CSS.supports('animation-timing-function','linear(0,1)');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SP=LIN?spring():{e:'cubic-bezier(.2,.9,.2,1.04)',d:520};
const SP2=LIN?spring(260,26):{e:'cubic-bezier(.2,.9,.2,1)',d:420};

/* ---------- wallpaper: soft light colour fields that drift and lean toward the pointer, plus the brand's flow lines ---------- */
const WALLS={
  mac:{base:['#F6F4EF','#E8EEF3'],blobs:[['#BDEBD8',.80,.28,.42,.12],['#B8D4FF',.22,.82,.48,.08],['#FFD9C4',.58,.98,.36,.1],['#DCD3FF',.08,.12,.32,.06],['#FFB894',.66,.58,.12,.18]],line:'29,29,31',lineA:.045,hot:'255,90,31',hotA:.32},
  ios:{base:['#7FB2E5','#F2B8A2'],blobs:[['#7FD8C0',.85,.22,.55,.1],['#6F9BF0',.15,.45,.6,.08],['#FFB48F',.6,.92,.5,.1],['#B9A4FF',.05,.05,.4,.06],['#FF7A45',.75,.62,.18,.16]],line:'255,255,255',lineA:.08,hot:'255,255,255',hotA:.35},
};
function wallpaper(cv,W0,active){const g=cv.getContext('2d'),lo=document.createElement('canvas'),lg=lo.getContext('2d');let W,H,dpr,mx=.5,my=.5,tx=.5,ty=.5,raf=0,lastT=-1e9;
  function rs(){dpr=1;const r=cv.getBoundingClientRect();W=r.width||innerWidth;H=r.height||innerHeight;cv.width=W*dpr;cv.height=H*dpr;lo.width=Math.max(8,Math.round(W/12));lo.height=Math.max(8,Math.round(H/12))}
  rs();on(window,'resize',rs);
  on(window,'pointermove',e=>{tx=e.clientX/innerWidth;ty=e.clientY/innerHeight});
  function f(t){raf=0;if(!root.isConnected)return;if(!active()||document.hidden||t-lastT<40){raf=requestAnimationFrame(f);return}lastT=t;
    mx+=(tx-mx)*.04;my+=(ty-my)*.04;
    const lw=lo.width,lh=lo.height,bg=lg.createLinearGradient(0,0,0,lh);bg.addColorStop(0,W0.base[0]);bg.addColorStop(1,W0.base[1]);lg.globalAlpha=1;lg.fillStyle=bg;lg.fillRect(0,0,lw,lh);
    W0.blobs.forEach(([c,x,y,r,d],i)=>{const px=(x+Math.sin(t*.00011+i*1.7)*.05+(mx-.5)*d)*lw,py=(y+Math.cos(t*.00009+i*2.3)*.05+(my-.5)*d)*lh,rr=r*Math.max(lw,lh);
      const rg=lg.createRadialGradient(px,py,0,px,py,rr);rg.addColorStop(0,c);rg.addColorStop(1,c+'00');lg.globalAlpha=.9;lg.fillStyle=rg;lg.fillRect(0,0,lw,lh)});
    g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(lo,0,0,cv.width,cv.height);
    g.setTransform(dpr,0,0,dpr,0,0);
    const rows=Math.round(H/22),step=W>600?12:8,cx=mx*W,cy=my*H;
    for(let r=0;r<rows;r++){const y0=(r+.5)*H/rows,hot=Math.abs(r-rows*.62)<1;g.beginPath();
      for(let x=0;x<=W+step;x+=step){let y=y0+Math.sin(x*.004+t*.00025+r*.35)*10+Math.sin(x*.011-t*.0004+r*.9)*4*(1+Math.sin(r*.7));
        const dx=x-cx,dy=y0-cy;y+=(dy>0?1:-1)*30*Math.exp(-(dx*dx+dy*dy)/9000);x?g.lineTo(x,y):g.moveTo(x,y)}
      g.strokeStyle=hot?`rgba(${W0.hot},${W0.hotA})`:`rgba(${W0.line},${W0.lineA*(.6+.8*Math.sin(r*.5+t*.0003)**2)})`;g.lineWidth=hot?1.3:1;g.stroke()}
    if(!RM)raf=requestAnimationFrame(f)}
  raf=requestAnimationFrame(f);return()=>cancelAnimationFrame(raf)}
const stopWalls=[wallpaper($('#wall'),WALLS.mac,()=>!has('ios')),wallpaper($('#iwall'),WALLS.ios,()=>has('ios'))];

const DAYS=L==='ko'?['일','월','화','수','목','금','토']:null;
function tick(){const d=new Date(),time=d.toLocaleTimeString(L,{hour:'numeric',minute:'2-digit'});
  $('#clock').textContent=DAYS?`${d.getMonth()+1}월 ${d.getDate()}일 (${DAYS[d.getDay()]}) ${time}`:`${d.toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}  ${time}`}
tick();const clockT=setInterval(tick,15000);

/* ================= shared ================= */
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem('qos.'+k));return v??d}catch{return d}},set(k,v){try{localStorage.setItem('qos.'+k,JSON.stringify(v))}catch{}}};
// FLIP: animate siblings from where they were to where a DOM change put them
function flip(nodes,mutate){const a=new Map(nodes.map(n=>[n,n.getBoundingClientRect()]));mutate();
  nodes.forEach(n=>{const b=n.getBoundingClientRect(),o=a.get(n),dx=o.left-b.left,dy=o.top-b.top;
    if(Math.abs(dx)+Math.abs(dy)>.5&&!RM)n.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.9,.2,1)'})})}
let noClick=false;on(window,'click',e=>{if(noClick){e.preventDefault();e.stopPropagation();noClick=false}},{capture:true});
const eatClick=()=>{noClick=true;later(()=>noClick=false,40)};
// one-shot drag listeners on window (removed on pointerup)
function track(mv,up){const u=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',u);up(ev)};
  addEventListener('pointermove',mv);addEventListener('pointerup',u);ac.signal.addEventListener('abort',()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',u)})}

/* desktop files */
// Project pages (production notes, trial and error, asset gallery, the DeepHold site) sit on the desktop as documents of their own,
// so each is one double-click (one tap on the iPhone widget) away instead of a link inside an app.
// One column per project (in the projects' order); inside it: the site, the notes and records, trial and error, then links elsewhere.
const DOC_RANK={site:1,notes:2,assets:3,trials:4,download:5,github:6};
const DOCS=D.docs.map((d,i)=>({k:d.k,name:d.name,what:d.what,kind:'link',href:d.href,thumb:d.thumb,out:d.out,proj:d.project,g:ORDER.indexOf(d.project)+1,r:DOC_RANK[d.k.slice(d.project.length+1)]||7,i}))
  .sort((a,b)=>a.g-b.g||a.r-b.r||a.i-b.i);
// Each project with pages or links gets a folder on the desktop holding its app and those items.
const PFOLDERS=ORDER.filter(k=>DOCS.some(d=>d.proj===k)).map(k=>({k:'f-'+k,name:P[k].name,kind:'folder',proj:k,g:1}));
const DESK=[{k:'projects',name:T.projects,kind:'folder'},{k:'about',name:T.files.about,ext:'md'},{k:'rules',name:T.files.rules,ext:'md'},{k:'contact',name:T.files.contact,ext:'vcf'},{k:'history',name:T.files.history,ext:'html'},...PFOLDERS];
const ALL=[...DESK,...DOCS];
const deskItem=k=>ALL.find(d=>d.k===k);
const folderItems=id=>id==='projects'?ORDER:id.startsWith('f-')?[id.slice(2),...DOCS.filter(d=>d.proj===id.slice(2)).map(d=>d.k)]:DESK.map(d=>d.k);
function docSvg(ext){const mid=ext==='md'?'<path d="M32 38h36M32 46h36M32 54h28M32 62h32" stroke="#C7C7CC" stroke-width="2.5" stroke-linecap="round"/>'
  :ext==='vcf'?'<circle cx="50" cy="42" r="9" fill="#A1A1A6"/><path d="M34 64c2-8 9-12 16-12s14 4 16 12z" fill="#A1A1A6"/>'
  :'<circle cx="50" cy="49" r="15" fill="none" stroke="#007AFF" stroke-width="2.5"/><path d="M35 49h30M50 34c-6 5-6 25 0 30M50 34c6 5 6 25 0 30" fill="none" stroke="#007AFF" stroke-width="2"/>';
  return `<svg class="mfold" viewBox="0 0 100 100"><path d="M23 4h37l20 20v69a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#FBFBFD" stroke="rgba(0,0,0,.12)" stroke-width=".8"/><path d="M60 4v17a3 3 0 0 0 3 3h17z" fill="#D8D8DD"/>${mid}<text x="50" y="86" text-anchor="middle" font-family="-apple-system,Helvetica,sans-serif" font-weight="700" font-size="10" fill="#8E8E93">${ext.toUpperCase()}</text></svg>`}
// A project page shows as Finder shows a document with a preview: the top of the real page, shrunk, in a thin white frame.
// A link to somewhere else (GitHub, a download, a store) is a web location file: a page with what it leads to drawn on it.
const OUT_GLYPH={github:'<path d="M40 40l-11 10 11 10M60 40l11 10-11 10M54 34l-8 32" fill="none" stroke="#1D1D1F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
  download:'<path d="M50 30v28M38 47l12 12 12-12" fill="none" stroke="#007AFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 64v5a3 3 0 0 0 3 3h28a3 3 0 0 0 3-3v-5" fill="none" stroke="#007AFF" stroke-width="4.5" stroke-linecap="round"/>'};
const outSvg=kind=>`<svg class="mfold" viewBox="0 0 100 100"><path d="M23 4h37l20 20v69a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#FBFBFD" stroke="rgba(0,0,0,.12)" stroke-width=".8"/><path d="M60 4v17a3 3 0 0 0 3 3h17z" fill="#D8D8DD"/>${OUT_GLYPH[kind]||'<path d="M40 60l20-20M44 40h16v16" fill="none" stroke="#007AFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>'}</svg>`;
const linkArt=d=>d.out?outSvg(d.out):`<span class="ldoc"><img src="${d.thumb}" alt="" loading="lazy" decoding="async" draggable="false"></span>`;
const openOut=d=>open(d.href,'_blank','noopener');
// A project folder carries its app's symbol pressed into the front, as macOS folders can show a symbol.
const pFolder=d=>`<span class="pfold">${FOLDER_SVG}<span class="pglyph">${GLYPH[d.proj]}</span></span>`;
const artOf=k=>{const d=deskItem(k);if(d)return d.kind==='folder'?(d.proj?pFolder(d):FOLDER_SVG):d.kind==='link'?linkArt(d):docSvg(d.ext);return macIcon(k)};
const label=k=>deskItem(k)?.name||P[k]?.name||k;
const kindOf=d=>d.ext?T.kinds[d.ext]:d.kind==='link'?(d.out?T.kinds.out:T.kinds.link):T.kinds.folder;
// Quick Look of a web location: what it is and where it goes (other sites refuse to run inside a frame).
const outView=d=>`<div class="paused-doc"><div style="width:84px;height:84px">${outSvg(d.out)}</div><h2>${esc(d.name)}</h2><p>${esc(d.href.replace(/^https?:\/\//,''))}</p><div class="btns">${ext(d.href,T.open,'btn pri')}</div></div>`;
const docBody=k=>k==='about'?about():k==='rules'?rules():k==='contact'?contact():history();
const docView=k=>{const d=deskItem(k);return d?.out?outView(d):d?.kind==='link'?safPage(d.href,esc(d.name)):k==='contact'?contact():k==='history'?history():`<div class="mdoc">${docBody(k)}</div>`};

/* ================= MAC ================= */
const mac=$('#mac'),dock=$('#dock'),dicons=$('#dicons');
$('#statusList').innerHTML=ORDER.map(k=>`<button class="st-row" data-open="${k}">${pIcon(k)}<span>${P[k].name}<small>${P[k].type}</small></span><span class="pill ${P[k].st}">${P[k].stl}</span></button>`).join('');
['#word1','#word2'].forEach(id=>{const w=$(id);on(w,'click',()=>w.classList.toggle('open'))});

// desktop icons and widgets keep each visitor's arrangement (offsets from their default place)
let deskPos=LS.get('desk',{}),wgPos=LS.get('wg',{});
const tr=p=>p?`transform:translate(${p.dx}px,${p.dy}px)`:'';
dicons.innerHTML=DESK.map(d=>`<button class="dicon${d.kind==='link'?' link':''}" data-g="${d.g||0}" data-k="${d.k}" style="${tr(deskPos[d.k])}"><span class="art">${artOf(d.k)}</span><span class="lbl">${esc(d.name)}</span></button>`).join('');
// Icons fill columns from the top right, as Finder arranges a desktop; a column ends above the shortcuts widget.
// The computer's own files fill the first column; the project folders start the next.
function deskRows(){const k=$('.widgets2'),bottom=k&&getComputedStyle(k).display!=='none'?k.getBoundingClientRect().top:innerHeight-110,rows=Math.max(3,Math.floor((bottom-44)/112));
  const icons=[...dicons.querySelectorAll('.dicon')],cols=[];let cur=null,n=0;
  icons.forEach(el=>{const g=el.dataset.g;if(!cur||g!==cur.g||n===(g==='0'?5:rows)){cur={g,el:document.createElement('div')};cur.el.className='dcol';cols.push(cur);n=0}cur.el.appendChild(el);n++});
  dicons.replaceChildren(...cols.map(c=>c.el))}
deskRows();on(window,'resize',deskRows);
root.querySelectorAll('.wg').forEach(w=>{const p=wgPos[w.dataset.k];if(p)w.style.transform=`translate(${p.dx}px,${p.dy}px)`});
function dragGroup(e,els,store,key){const sx=e.clientX,sy=e.clientY,base=els.map(el=>({el,p:store[el.dataset.k]||{dx:0,dy:0}}));let moved=false;
  track(ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;if(!moved){if(Math.hypot(dx,dy)<4)return;moved=true;els.forEach(el=>el.classList.add('drag'))}
    base.forEach(b=>b.el.style.transform=`translate(${b.p.dx+dx}px,${b.p.dy+dy}px)`)},
  ev=>{if(!moved)return;const dx=ev.clientX-sx,dy=ev.clientY-sy;
    base.forEach(b=>{store[b.el.dataset.k]={dx:b.p.dx+dx,dy:b.p.dy+dy};b.el.classList.remove('drag')});LS.set(key,store);eatClick()})}
function cleanUp(){deskPos={};wgPos={};LS.set('desk',{});LS.set('wg',{});
  root.querySelectorAll('.dicon,.wg').forEach(el=>{const cur=el.style.transform;if(!cur)return;el.style.transform='';el.animate([{transform:cur},{transform:'none'}],{duration:SP.d,easing:SP.e})})}

// selection
let sel={scope:null,keys:[]};
function clearSel(){root.querySelectorAll('.dicon.sel,.fitem.sel').forEach(x=>x.classList.remove('sel'));sel={scope:null,keys:[]}}
function syncDeskSel(){sel={scope:'desk',keys:[...dicons.querySelectorAll('.sel')].map(x=>x.dataset.k)}}
on(dicons,'pointerdown',e=>{const b=e.target.closest('.dicon');if(!b||e.button!==0)return;
  if(e.metaKey||e.shiftKey)b.classList.toggle('sel');else if(!b.classList.contains('sel')){clearSel();b.classList.add('sel')}
  syncDeskSel();if(b.classList.contains('sel'))dragGroup(e,[...dicons.querySelectorAll('.sel')],deskPos,'desk')});
on(dicons,'dblclick',e=>{const b=e.target.closest('.dicon');b&&macOpen(b.dataset.k,b)});
on(dicons,'keydown',e=>{const b=e.target.closest('.dicon');if(b&&e.key==='Enter')macOpen(b.dataset.k,b)});
root.querySelectorAll('.wg').forEach(w=>on(w,'pointerdown',e=>{if(e.button===0&&!e.target.closest('.st-row,.word'))dragGroup(e,[w],wgPos,'wg')}));

// rubber-band selection on the empty desktop
const band=document.createElement('div');band.className='band';band.hidden=true;mac.appendChild(band);
on(mac,'pointerdown',e=>{if(e.target!==mac||e.button!==0)return;closeMenu();clearSel();if(showDesk){toggleDesktop(false);return}
  const sx=e.clientX,sy=e.clientY;
  track(ev=>{const x=Math.min(sx,ev.clientX),y=Math.min(sy,ev.clientY),w=Math.abs(ev.clientX-sx),h=Math.abs(ev.clientY-sy);if(w+h<4)return;
    Object.assign(band.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});band.hidden=false;
    dicons.querySelectorAll('.dicon').forEach(d=>{const r=d.getBoundingClientRect();d.classList.toggle('sel',r.left<x+w&&r.right>x&&r.top<y+h&&r.bottom>y)});syncDeskSel()},
  ()=>{const dragged=!band.hidden;band.hidden=true;
    // Sonoma: a plain click on the wallpaper moves every window aside to reveal the desktop.
    if(!dragged&&Object.values(wins).some(o=>!o.min))toggleDesktop(true)})});

// dock: magnification, launching, drag to reorder
const DOCK_DEFAULT=['qmin','launch',...ORDER];
let dockOrd=LS.get('dock',DOCK_DEFAULT);if(!Array.isArray(dockOrd)||dockOrd.length!==DOCK_DEFAULT.length||!DOCK_DEFAULT.every(k=>dockOrd.includes(k)))dockOrd=DOCK_DEFAULT;
const dockName=k=>({qmin:T.apps.finder,launch:T.apps.launchpad,archive:T.history,trash:T.trash})[k]||P[k].name;
const dockType=k=>P[k]?` · ${P[k].type}`:'';
const dkBtn=(k,fixed)=>`<button class="dk" data-dock="${k}"${fixed?' data-fixed="1"':''} aria-label="${esc(dockName(k)+dockType(k))}">${macIcon(k)}<span class="tip">${dockName(k)}${P[k]?`<small>${dockType(k)}</small>`:''}</span><span class="dot"></span></button>`;
dock.innerHTML=dockOrd.map(k=>dkBtn(k)).join('')+'<span class="dsep"></span>'+dkBtn('archive',1)+dkBtn('trash',1);
on(dock,'pointermove',e=>{if(e.pointerType!=='mouse'||dock.querySelector('.dk.drag'))return;dock.querySelectorAll('.dk').forEach(b=>{const r=b.getBoundingClientRect(),d=Math.abs(e.clientX-(r.left+r.width/2));b.style.setProperty('--s',(1+.6*Math.max(0,1-d/160)**2).toFixed(3))})});
on(dock,'pointerleave',()=>dock.querySelectorAll('.dk').forEach(b=>b.style.setProperty('--s',1)));
on(dock,'click',e=>{const b=e.target.closest('[data-dock]');if(!b)return;const k=b.dataset.dock;
  if(k==='qmin')macOpenFolder('projects',b);else if(k==='launch')launchpad(true);else if(k==='archive')macOpen('history',b);else if(k==='trash')macOpenFolder('trash',b);else macOpenApp(k,b)});
on(dock,'pointerdown',e=>{const b=e.target.closest('.dk');if(!b||b.dataset.fixed||e.button!==0)return;
  const movable=()=>[...dock.querySelectorAll('.dk:not([data-fixed])')];const sx=e.clientX,sy=e.clientY,grab=sx-b.getBoundingClientRect().left;let go=false;
  track(ev=>{if(!go){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<6)return;go=true;dock.querySelectorAll('.dk').forEach(x=>x.style.setProperty('--s',1));b.classList.add('drag')}
    const others=movable().filter(x=>x!==b);
    const over=others.find(x=>{const r=x.getBoundingClientRect();return ev.clientX>r.left+r.width*.3&&ev.clientX<r.right-r.width*.3});
    if(over)flip(others,()=>{const l=movable();l.indexOf(over)>l.indexOf(b)?over.after(b):over.before(b)});
    b.style.transform='none';const r=b.getBoundingClientRect();b.style.transform=`translate(${ev.clientX-grab-r.left}px,${Math.min(0,ev.clientY-sy)}px)`},
  ()=>{if(!go)return;const cur=b.style.transform;b.style.transform='';b.classList.remove('drag');
    b.animate([{transform:cur},{transform:'none'}],{duration:SP2.d,easing:SP2.e});dockOrd=movable().map(x=>x.dataset.dock);LS.set('dock',dockOrd);eatClick()})});

/* windows */
let Z=10;const wins={};
function place(w,h){const vw=innerWidth,vh=innerHeight-24-104;w=Math.min(w,vw-40);h=Math.min(h,vh-20);const n=Object.keys(wins).length;
  return{w,h,x:Math.round((vw-w)/2+(n%4)*26-26),y:Math.round(24+(vh-h)/2+(n%4)*22-10)}}
function focusWin(id){Object.values(wins).forEach(o=>o.el.classList.add('inactive'));const o=wins[id];if(!o)return;o.el.classList.remove('inactive');o.el.style.zIndex=++Z;$('#activeApp').textContent=o.app||o.title}
function animFrom(el,src,reverse){const a=el.getBoundingClientRect();if(!src)src={left:a.left+a.width/2-30,top:a.top+a.height/2-30,width:60,height:60};
  const from=`translate(${src.left-a.left}px,${src.top-a.top}px) scale(${src.width/a.width},${src.height/a.height})`;
  if(RM)return el.animate([{opacity:reverse?1:0},{opacity:reverse?0:1}],{duration:150,fill:'forwards'});
  return reverse?el.animate([{transform:'none',opacity:1},{transform:from,opacity:0}],{duration:260,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'})
    :el.animate([{transform:from,opacity:0,offset:0},{opacity:1,offset:.25},{transform:'none',opacity:1}],{duration:SP.d,easing:SP.e})}
const rectOf=n=>{const r=(n.querySelector('.appic,.mfold')||n).getBoundingClientRect();return{left:r.left,top:r.top,width:r.width,height:r.height}};
const dockKeyOf=id=>id.startsWith('app:')?id.slice(4):(id==='doc:history'||id.startsWith('arch'))?'archive':'qmin';
const boxOf=el=>{const r=el.getBoundingClientRect();return{left:r.left,top:r.top,width:r.width,height:r.height}};
// Genie out of the Dock icon (app launch, un-minimize), as macOS does for windows coming back from the Dock.
function genieOut(o){const d=o.dockRect();if(!d||RM){animFrom(o.el,d);return}const el=o.el;el.style.visibility='hidden';
  genie(el,boxOf(el),d,'out',root).then(()=>{el.style.visibility=''})}
function openWin(id,{title,app,w,h,html,bare,cls,src,after,fromDock,tools}){
  if(showDesk)toggleDesktop(false);
  if(wins[id]){const o=wins[id];if(o.min){o.min=false;o.el.hidden=false;genieOut(o)}focusWin(id);return o}
  const p=place(w,h);const el=document.createElement('section');el.className='win'+(bare?' bare':'')+(cls?' '+cls:'');el.setAttribute('aria-label',title);
  Object.assign(el.style,{left:p.x+'px',top:p.y+'px',width:p.w+'px',height:p.h+'px'});
  el.innerHTML=`<div class="tb"><span class="lights"><i title="${T.window.close}" data-x></i><i title="${T.window.min}" data-m></i><i title="${T.window.zoom}" data-f></i></span>${bare?'':`<span class="t">${esc(title)}</span>`}${tools||''}</div><div class="wb">${html}</div>`;
  mac.appendChild(el);const dk=dockKeyOf(id);
  const o=wins[id]={el,title,app,src,dock:dk,dockRect:()=>{const d=root.querySelector(`[data-dock="${dk}"]`);return d?rectOf(d):null}};
  focusWin(id);root.querySelector(`[data-dock="${dk}"]`)?.classList.add('running');
  el.addEventListener('pointerdown',()=>{if(!has('mc-on'))focusWin(id)});
  const tb=el.querySelector('.tb');
  const drag=e=>{if(e.target.closest('.lights,button,a,input')||has('mc-on'))return;const sx=e.clientX-el.offsetLeft,sy=e.clientY-el.offsetTop;
    const frames=el.querySelectorAll('iframe');frames.forEach(f=>f.style.pointerEvents='none');
    track(ev=>{el.style.left=(ev.clientX-sx)+'px';el.style.top=Math.max(24,ev.clientY-sy)+'px'},()=>frames.forEach(f=>f.style.pointerEvents=''))};
  tb.addEventListener('pointerdown',drag);tb.addEventListener('dblclick',e=>{if(!e.target.closest('.lights'))el.querySelector('[data-f]').click()});
  el.querySelector('.ftool,.saf .addr')?.addEventListener('pointerdown',drag);
  el.querySelector('[data-x]').onclick=()=>closeWin(id);
  // Minimize: the Genie effect into the app's Dock icon (macOS default).
  el.querySelector('[data-m]').onclick=()=>{o.min=true;const d=o.dockRect();if(!d||RM){el.hidden=true;return}const b=boxOf(el);genie(el,b,d,'in',root);el.hidden=true;
    if(!Object.values(wins).some(w=>w!==o&&!w.min)){$('#activeApp').textContent='Finder'}};
  el.querySelector('[data-f]').onclick=()=>{const r=el.getBoundingClientRect();
    if(el.dataset.full){const[a,b,c,d]=el.dataset.full.split(',');Object.assign(el.style,{left:a,top:b,width:c,height:d});delete el.dataset.full}
    else{el.dataset.full=[el.style.left,el.style.top,el.style.width,el.style.height].join(',');Object.assign(el.style,{left:'0px',top:'24px',width:innerWidth+'px',height:(innerHeight-24)+'px'})}
    const n=el.getBoundingClientRect();el.animate([{transform:`translate(${r.left-n.left}px,${r.top-n.top}px) scale(${r.width/n.width},${r.height/n.height})`},{transform:'none'}],{duration:SP2.d,easing:SP2.e})};
  wire(el,'mac');o.stop=after?after(el):null;
  if(fromDock)genieOut(o);else animFrom(el,src);
  return o}
// Close: macOS just lets the window go, with a short fade.
function closeWin(id){const o=wins[id];if(!o)return;delete wins[id];o.stop&&o.stop();
  o.el.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.97)'}],{duration:RM?1:160,easing:'ease-out',fill:'forwards'}).onfinish=()=>o.el.remove();
  if(!Object.values(wins).some(w=>w.dock===o.dock))root.querySelector(`[data-dock="${o.dock}"]`)?.classList.remove('running');
  const rest=Object.keys(wins);if(rest.length)focusWin(rest[rest.length-1]);else $('#activeApp').textContent='Finder'}

function macOpenApp(k,srcNode){const a=APPS[k];const d=root.querySelector(`[data-dock="${k}"]`);if(d&&!wins['app:'+k]){d.classList.remove('bounce');void d.offsetWidth;d.classList.add('bounce')}
  openWin('app:'+k,{title:a.title,app:P[k].name,w:a.w,h:a.h+28,cls:'appwin'+(a.dark?' dark':'')+(a.w<500?' narrow':''),html:appBody(k),tools:appTools(k),fromDock:true,after:el=>startApp(k,el)})}
function macOpen(k,src){const d=deskItem(k);if(!d)return macOpenApp(k,src);if(d.kind==='folder')return macOpenFolder(d.k,src);if(d.out)return openOut(d);if(d.kind==='link')return macSaf(d.href,d.name,src);
  const [app,w,h]={about:[T.apps.textedit,640,560],rules:[T.apps.textedit,560,480],contact:[T.apps.contacts,440,430],history:[T.apps.safari,880,580]}[k];
  const html=k==='history'?safHistory():k==='contact'?contact():`<div class="mdoc">${docBody(k)}</div>`;
  openWin('doc:'+k,{title:d.name,app,w,h,html,cls:k==='history'?'safwin':'',src:src?rectOf(src):null})}
const NAV=[{id:'desktop',name:T.desktop},{id:'projects',name:T.projects},...PFOLDERS.map(f=>({id:f.k,name:f.name})),{id:'trash',name:T.trash}];
const navName=id=>NAV.find(n=>n.id===id).name;
function finder(active){
  return `<div class="finder"><div class="side"><h4>${T.favorites}</h4>${NAV.map(f=>`<button data-nav="${f.id}" aria-current="${f.id===active}">${SIDE_FOLDER}${f.name}</button>`).join('')}</div>
  <div class="fpane"><div class="ftool"><span class="nav">${CHEV}<span style="transform:scaleX(-1);display:inline-block">${CHEV}</span></span><b data-ftitle>${navName(active)}</b></div><div class="fmain" data-fmain>${folderBody(active)}</div></div></div>`}
function folderBody(id){
  if(id==='trash')return `<div class="paused-doc" style="padding-top:90px"><p>${T.trashEmpty}</p></div>`;
  const items=folderItems(id);
  return `<div class="fgrid">${items.map(k=>`<button class="fitem" data-item="${k}"><span class="art">${artOf(k)}</span><span class="nm">${esc(label(k))}</span>${P[k]?`<span class="meta">${P[k].type}</span><span class="meta"><span class="pill ${P[k].st}">${P[k].stl}</span></span>`:''}</button>`).join('')}</div>`}
function macOpenFolder(f,srcNode){const o=openWin('finder',{title:navName(f),app:'Finder',w:800,h:500,cls:'finderwin',html:finder(f),src:srcNode?rectOf(srcNode):null});navFinder(o.el,f)}
function navFinder(el,f){const m=el.querySelector('[data-fmain]');if(!m)return;m.innerHTML=folderBody(f);el.querySelector('[data-ftitle]').textContent=navName(f);
  el.querySelectorAll('[data-nav]').forEach(b=>b.setAttribute('aria-current',b.dataset.nav===f));wins.finder.title=navName(f);
  m.animate([{opacity:0},{opacity:1}],{duration:160,easing:'ease-out'});wire(m,'mac')}
function macCase(k,src){openWin('case:'+k,{title:T.info(P[k].name),app:'Finder',w:600,h:520,html:caseFile(k),src:src?rectOf(src):null})}
function macSaf(url,title,src){openWin('saf:'+url,{title,app:T.apps.safari,w:Math.min(1180,innerWidth-80),h:Math.min(760,innerHeight-130),cls:'safwin',html:safPage(url,title),src:src?rectOf(src):null})}
function macArch(v,src){const x=verOf(v);openWin('arch:'+v,{title:x.name,app:T.apps.safari,w:Math.min(1180,innerWidth-80),h:Math.min(760,innerHeight-130),cls:'safwin',html:archived(v),src:src?rectOf(src):null})}
function info(k){if(P[k])return macCase(k);const d=deskItem(k);
  openWin('info:'+k,{title:T.info(d.name),app:'Finder',w:300,h:390,html:`<div class="paused-doc"><div style="width:84px;height:84px">${artOf(k)}</div><h2>${d.name}</h2><dl class="kv" style="text-align:left;width:100%"><dt>${T.infoKind}</dt><dd>${kindOf(d)}</dd><dt>${T.infoWhere}</dt><dd>${T.desktop}</dd><dt>${T.infoDate}</dt><dd>${T.modified}</dd></dl></div>`})}
function quickLook(){if(wins.ql){closeWin('ql');return}const k=sel.keys[0];if(!k)return;const d=deskItem(k);
  const html=P[k]?caseFile(k):d.kind==='folder'?`<div class="paused-doc" style="padding-top:60px"><div style="width:110px;height:110px">${artOf(k)}</div><h2>${esc(d.name)}</h2><p>${T.items(folderItems(k).length)}</p></div>`:docView(k);
  openWin('ql',{title:label(k),app:T.apps.quicklook,w:600,h:480,html})}

/* shared wiring for content inside windows/sheets */
function wire(scope,mode){
  scope.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>navFinder(b.closest('.win'),b.dataset.nav));
  scope.querySelectorAll('.fitem').forEach(b=>{b.onclick=()=>{clearSel();b.classList.add('sel');sel={scope:'finder',keys:[b.dataset.item]}};b.ondblclick=()=>macOpen(b.dataset.item,b)});
  scope.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>mode==='mac'?macCase(b.dataset.case,b):iSheet(caseFile(b.dataset.case),P[b.dataset.case].name,b));
  scope.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>mode==='mac'?macOpenApp(b.dataset.open,b):iOpenApp(b.dataset.open,b));
  scope.querySelectorAll('[data-saf]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();mode==='mac'?macSaf(b.dataset.saf,b.dataset.safT,b):iSheet(safPage(b.dataset.saf,b.dataset.safT),b.dataset.safT,b,null,'sheetsaf')});
  scope.querySelectorAll('[data-arch]').forEach(b=>b.onclick=()=>mode==='mac'?macArch(b.dataset.arch,b):iSheet(archived(b.dataset.arch),verOf(b.dataset.arch).name,b,null,'sheetsaf'));
  scope.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{const done=()=>{b.textContent=T.copied};
    navigator.clipboard?navigator.clipboard.writeText(b.dataset.copy).then(done,()=>{}):null});
}
wire($('#statusList'),'mac');

/* context menus (right click / two-finger click) */
let cm=null;
function menu(x,y,items){closeMenu();cm=document.createElement('div');cm.className='cmenu';cm.setAttribute('role','menu');
  cm.innerHTML=items.map((it,i)=>it==='-'?'<hr>':`<button role="menuitem" data-i="${i}"${it.off?' disabled':''}>${it.t}</button>`).join('');root.appendChild(cm);
  const r=cm.getBoundingClientRect();cm.style.left=Math.min(x,innerWidth-r.width-6)+'px';cm.style.top=Math.min(y,innerHeight-r.height-6)+'px';
  cm.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b){const it=items[+b.dataset.i];closeMenu();it.go&&it.go()}});
}
function closeMenu(){if(!cm)return;const m=cm;cm=null;m.style.pointerEvents='none';m.animate([{opacity:1},{opacity:0}],{duration:RM?1:180,fill:'forwards'}).onfinish=()=>m.remove()}
on(window,'pointerdown',e=>{if(cm&&!e.target.closest('.cmenu'))closeMenu()},{capture:true});
const F=T.ctxFile,DK=T.ctxDesk,AP=T.ctxApple;
on(mac,'contextmenu',e=>{const b=e.target.closest('.dicon,.fitem');
  if(b){e.preventDefault();const k=b.dataset.k||b.dataset.item;if(!b.classList.contains('sel')){clearSel();b.classList.add('sel')}sel={scope:b.dataset.k?'desk':'finder',keys:[k]};
    menu(e.clientX,e.clientY,[{t:F[0],go:()=>macOpen(k,b)},'-',{t:F[1],go:()=>info(k)},{t:`${F[2]}: “${label(k)}”`,go:quickLook},'-',{t:F[3],off:1},{t:F[4],off:1},{t:F[5],off:1}])}
  else if(e.target===mac||e.target.closest('.wg')){e.preventDefault();
    menu(e.clientX,e.clientY,[{t:DK[0],off:1},'-',{t:DK[1],off:1},{t:DK[2],off:1},'-',{t:DK[3],go:cleanUp},{t:DK[4],off:1},{t:DK[5],off:1},'-',{t:DK[6],go:()=>spotlight(true)},{t:DK[7],go:()=>mission(true)},{t:DK[8],go:()=>launchpad(true)}])}});
on($('#mbLogo'),'click',e=>{const r=e.currentTarget.getBoundingClientRect();
  menu(r.left,r.bottom+2,[{t:AP[0],go:()=>macOpen('about')},'-',{t:AP[1],off:1},{t:AP[2],off:1},'-',{t:AP[3],go:cleanUp},{t:AP[4],go:()=>{LS.set('dock',DOCK_DEFAULT);location.reload()}},'-',{t:AP[5],off:1},{t:AP[6],go:()=>location.reload()}])});


/* ---------- search index (Spotlight on mac, search on iOS) ---------- */
const DOC_WORDS={contact:'email 이메일 연락 contact github vcard',history:'archive 변화 과정 history version 이전 specimen lab open 표본실 열린 실험실',about:'about 소개 김규민 gyumin kim curious mean qmin',rules:'rules 규칙 lab 연구실'};
const IDX=[...ORDER.map(k=>({grp:T.groups.app,label:P[k].name,meta:`${P[k].type} · ${P[k].stl}`,art:pIcon(k),txt:[P[k].name,P[k].type,P[k].one,P[k].stack,P[k].code].join(' '),go:m=>m==='mac'?macOpenApp(k):iOpenApp(k)})),
  ...ALL.filter(d=>d.kind!=='folder').map(d=>({grp:T.groups.doc,label:d.name,meta:d.kind==='link'?P[d.proj].name:kindOf(d),art:`<span class="sdoc">${d.kind==='link'?linkArt(d):docSvg(d.ext)}</span>`,txt:d.name+' '+(DOC_WORDS[d.k]||d.href),go:m=>m==='mac'?macOpen(d.k):iDoc(d.k)})),
  ...VERSIONS.filter(v=>!v.now).map(v=>({grp:T.groups.history,label:v.name,meta:v.d,art:pIcon('archive'),txt:v.name+' '+v.p,go:m=>m==='mac'?macArch(v.v):iSheet(archived(v.v),v.name,null,null,'sheetsaf')})),
  ...ORDER.map(k=>({grp:T.groups.case,label:T.info(P[k].name),meta:P[k].code,art:pIcon(k),txt:P[k].name+' case info '+P[k].stack,go:m=>m==='mac'?macCase(k):iSheet(caseFile(k),P[k].name)}))];
function search(q){q=q.trim().toLowerCase();if(!q)return[];return IDX.filter(x=>x.txt.toLowerCase().includes(q)).slice(0,9)}
let spotEl=null,spotSel=0,spotRes=[];
function spotlight(show){
  if(show===undefined)show=!spotEl;if(!show){if(spotEl){const s=spotEl;spotEl=null;s.animate([{opacity:1},{opacity:0}],{duration:RM?1:150,fill:'forwards'}).onfinish=()=>s.remove()}return}
  if(spotEl){spotEl.querySelector('input').focus();return}
  spotEl=document.createElement('div');spotEl.className='spot';spotEl.setAttribute('role','dialog');spotEl.setAttribute('aria-label',T.spotlight);
  spotEl.innerHTML=`<div class="in">${searchSvg(1.5)}<input placeholder="${T.spotlight}" autocomplete="off" spellcheck="false" aria-label="${T.spotlight}"></div><div class="res" role="listbox"></div>`;
  root.appendChild(spotEl);const inp=spotEl.querySelector('input'),res=spotEl.querySelector('.res');
  spotEl.animate([{opacity:0},{opacity:1}],{duration:RM?1:120,easing:'ease-out'});inp.focus();
  const draw=()=>{spotRes=search(inp.value);let g='';res.innerHTML=spotRes.map((r,i)=>{const h=r.grp!==g||i===0?`<h5>${i===0?T.topHit:r.grp}</h5>`:'';g=r.grp;return h+`<button class="r" role="option" aria-selected="${i===spotSel}" data-i="${i}">${r.art}<span>${r.label}</span><small>${r.meta}</small></button>`}).join('')};
  inp.addEventListener('input',()=>{spotSel=0;draw()});
  inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();spotSel=(spotSel+(e.key==='ArrowDown'?1:-1)+spotRes.length)%Math.max(1,spotRes.length);draw()}
    if(e.key==='Enter'&&spotRes[spotSel]){const r=spotRes[spotSel];spotlight(false);r.go('mac')}});
  res.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b){const r=spotRes[+b.dataset.i];spotlight(false);r.go('mac')}})}
on($('#mbSpot'),'click',()=>spotlight());
on(window,'pointerdown',e=>{if(spotEl&&!e.target.closest('.spot,#mbSpot'))spotlight(false)});

/* ---------- Apps (macOS Tahoe replaced Launchpad with it; pinch opens it) ---------- */
let lpEl=null;
function launchpad(show){
  if(show&&!lpEl){if(spotEl)spotlight(false);lpEl=document.createElement('div');lpEl.className='lp';
    const items=[...ORDER.map(k=>({k,label:P[k].name,sub:P[k].type,go:()=>macOpenApp(k)})),{k:'archive',label:T.history,go:()=>macOpen('history')},{k:'gh',label:'GitHub',href:GH}];
    lpEl.innerHTML=`<div class="lsearch">${searchSvg(1.8)}${T.search}</div><div class="lgrid">${items.map((it,i)=>`<button data-li="${i}"><span class="art">${macIcon(it.k)}</span><span>${it.label}${it.sub?`<small>${it.sub}</small>`:''}</span></button>`).join('')}</div>`;
    root.appendChild(lpEl);requestAnimationFrame(()=>lpEl&&lpEl.classList.add('on'));
    lpEl.addEventListener('click',e=>{const b=e.target.closest('[data-li]');const it=b&&items[+b.dataset.li];launchpad(false);if(it){it.href?open(it.href,'_blank','noopener'):later(it.go,120)}})}
  else if(!show&&lpEl){const l=lpEl;lpEl=null;l.classList.remove('on');later(()=>l.remove(),300)}}

/* ---------- Mission Control ---------- */
let mcEl=null;
function mission(show){
  if(show===undefined)show=!mcEl;
  const list=Object.values(wins).filter(o=>!o.min);
  if(show&&!mcEl){launchpad(false);spotlight(false);closeMenu();if(showDesk)toggleDesktop(false);
    mcEl=document.createElement('div');mcEl.className='mc';mcEl.innerHTML=`<div class="spaces"><div class="sp1">${T.space1}</div></div>`;mac.appendChild(mcEl);root.classList.add('mc-on');requestAnimationFrame(()=>mcEl&&mcEl.classList.add('on'));
    const n=list.length,cols=Math.ceil(Math.sqrt(n||1)),rows=Math.ceil((n||1)/cols),top=130,bot=40,side=60,cw=(innerWidth-side*2)/cols,ch=(innerHeight-top-bot)/rows;
    list.forEach((o,i)=>{const r=o.el.getBoundingClientRect(),c=i%cols,rw=Math.floor(i/cols),s=Math.min(cw*.82/r.width,(ch-30)*.82/r.height,1);
      const cx=side+cw*(c+.5),cy=top+ch*rw+(ch-30)/2,tx=cx-r.width*s/2-r.left,ty=cy-r.height*s/2-r.top;
      o.mc=o.el.animate([{transform:'none'},{transform:`translate(${tx}px,${ty}px) scale(${s})`}],{duration:SP2.d,easing:SP2.e,fill:'forwards'});
      const lab=document.createElement('div');lab.className='lab';lab.style.left=cx+'px';lab.style.top=(cy+r.height*s/2+10)+'px';
      lab.innerHTML=`${pIcon(o.dock)}${esc(o.app||o.title)}`;mcEl.appendChild(lab);
      o.mcClick=e=>{e.stopPropagation();e.preventDefault();mission(false);focusWin(Object.keys(wins).find(id=>wins[id]===o))};o.el.addEventListener('click',o.mcClick,true)});
    mcEl.addEventListener('click',()=>mission(false))}
  else if(!show&&mcEl){const m=mcEl;mcEl=null;m.classList.remove('on');later(()=>m.remove(),300);root.classList.remove('mc-on');
    list.forEach(o=>{if(o.mc){const a=o.mc;o.mc=null;o.el.removeEventListener('click',o.mcClick,true);
      const cur=getComputedStyle(o.el).transform;a.cancel();o.el.animate([{transform:cur},{transform:'none'}],{duration:SP2.d,easing:SP2.e})}})}}

/* ---------- Show Desktop (spread fingers) ---------- */
let showDesk=false;
function toggleDesktop(show){showDesk=show===undefined?!showDesk:show;
  Object.values(wins).filter(o=>!o.min).forEach(o=>{const r=o.el.getBoundingClientRect(),left=r.left+r.width/2<innerWidth/2;
    // Show Desktop: each window slides out toward the screen edge nearest its centre, leaving a sliver in view.
    const cy=r.top+r.height/2-innerHeight/2,tx=left?-(r.right-36):(innerWidth-r.left-36),ty=cy/(innerHeight/2)*Math.min(220,r.height*.45);
    if(showDesk){o.sd=o.el.animate([{transform:'none'},{transform:`translate(${tx}px,${ty}px)`}],{duration:RM?1:380,easing:'cubic-bezier(.3,.7,.2,1)',fill:'forwards'})}
    else if(o.sd){const cur=getComputedStyle(o.el).transform;o.sd.cancel();o.sd=null;o.el.animate([{transform:cur},{transform:'none'}],{duration:SP2.d,easing:SP2.e})}})}

/* ---------- gestures & keys ---------- */
// Trackpad pinch arrives as ctrl+wheel (Chrome, Edge, Firefox) or gesture events (Safari).
let pinch=0,pinchT=0,pinchLock=0;
function onPinch(dir){if(has('ios')||Date.now()<pinchLock)return;pinchLock=Date.now()+600;
  if(dir<0){if(mcEl)mission(false);else if(showDesk)toggleDesktop(false);else launchpad(true)}
  else{if(lpEl)launchpad(false);else toggleDesktop()}}
on(window,'wheel',e=>{if(!e.ctrlKey||has('ios'))return;e.preventDefault();pinch+=e.deltaY;clearTimeout(pinchT);pinchT=later(()=>pinch=0,220);
  if(pinch>45){pinch=0;onPinch(-1)}else if(pinch<-45){pinch=0;onPinch(1)}},{passive:false});
let gScale=1;on(window,'gesturestart',e=>{if(has('ios'))return;e.preventDefault();gScale=1});on(window,'gesturechange',e=>{if(has('ios'))return;e.preventDefault();gScale=e.scale});
on(window,'gestureend',e=>{if(has('ios'))return;e.preventDefault();if(gScale<.8)onPinch(-1);else if(gScale>1.25)onPinch(1)});
let hc=0;on(window,'pointermove',e=>{if(has('ios')||e.pointerType!=='mouse')return;
  if(e.clientX<3&&e.clientY<3){if(!hc)hc=later(()=>{hc=0;mission()},200)}else{clearTimeout(hc);hc=0}});
on(window,'keydown',e=>{if(has('ios'))return;
  const mod=e.metaKey||e.ctrlKey,typing=document.activeElement&&/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
  const front=Object.keys(wins).find(id=>!wins[id].min&&!wins[id].el.classList.contains('inactive'));
  if((front==='app:deephold'||(front==='app:sword'&&e.code!=='KeyD'))&&!mod&&e.key!=='Escape')return; // the game and the player own the keyboard while in front
  if((mod&&e.code==='Space')||(mod&&e.key.toLowerCase()==='k')||(e.key==='/'&&!typing)){e.preventDefault();spotlight();return}
  if(e.code==='Space'&&!typing&&(sel.keys.length||wins.ql)){e.preventDefault();quickLook();return}
  if(e.key==='F3'||(e.ctrlKey&&e.key==='ArrowUp')){e.preventDefault();mission();return}
  if(e.key==='F4'){e.preventDefault();launchpad(!lpEl);return}
  // F11 / Win+D are taken by the system before a page sees them, so D (and a click on the wallpaper) shows the desktop here.
  if(e.key==='F11'||(e.code==='KeyD'&&!mod&&!e.altKey&&!typing)){e.preventDefault();toggleDesktop();return}
  if(e.key==='Escape'){if(cm)closeMenu();else if(spotEl)spotlight(false);else if(lpEl)launchpad(false);else if(mcEl)mission(false);else if(wins.ql)closeWin('ql');else if(showDesk)toggleDesktop(false)}});


/* ================= iOS ================= */
const home=$('#home'),ios=$('#ios'),igrid=$('#igrid'),idock=$('#idock');
const PAUSED=ORDER.filter(k=>P[k].st==='paused');
const ifolder=keys=>`<div class="ifold">${keys.slice(0,9).map(k=>`<div class="appic ic-${k}">${GLYPH[k]}</div>`).join('')}</div>`;
const SYS={files:['files',T.apps.files],safari:['archive',T.history],contacts:['contact',T.contacts],gh:['gh','GitHub']};
// Under each app: its full name (wrapping to a second line rather than being cut) and what kind of work it is.
const iLabel=k=>`<span class="nm">${P[k].name}<small>${P[k].type}</small></span>`;
function iItem(key){const[t,k]=key.split(':');
  if(t==='app')return P[k]?`<button class="iapp" data-key="${key}" aria-label="${esc(P[k].name)}, ${P[k].type}">${pIcon(k)}${iLabel(k)}</button>`:'';
  if(t==='fold')return `<button class="iapp" data-key="${key}">${ifolder(PAUSED)}<span>${T.paused}</span></button>`;
  return SYS[t]?`<button class="iapp" data-key="${key}">${icon(SYS[t][0])}<span>${SYS[t][1]}</span></button>`:''}
// Paused projects sit in a folder in the Dock, so page 1 has room for the records widget; GitHub is the widget on page 2.
const IOS_DEFAULT={grid:ORDER.filter(k=>P[k].st!=='paused').map(k=>'app:'+k),dock:['files','safari','contacts',...(PAUSED.length?['fold:paused']:['gh'])]};
let iord=LS.get('ios',IOS_DEFAULT);{const all=[...(iord.grid||[]),...(iord.dock||[])],def=[...IOS_DEFAULT.grid,...IOS_DEFAULT.dock];if(all.length!==def.length||!def.every(k=>all.includes(k))||iord.dock.length>4)iord=IOS_DEFAULT}
igrid.innerHTML=iord.grid.map(iItem).join('');idock.innerHTML=iord.dock.map(iItem).join('');
// The records widget: every project page, one tap each.
root.querySelectorAll('.idocs').forEach(w=>{if(!DOCS.length)return w.remove();
  w.innerHTML=`<div class="k">${T.records}</div>${DOCS.map(d=>`<button class="idoc" data-ldoc="${d.k}" aria-label="${esc(d.name)}">${pIcon(d.proj)}<span><b>${esc(d.what)}${d.out?' ↗':''}</b><small>${esc(P[d.proj].name)}</small></span></button>`).join('')}`});
// Page 1 when the widget clears the search pill on this screen; shorter phones get it at the top of page 2.
function fitDocs(){const w=$('.idocs.p1');if(!w||!has('ios'))return;home.classList.remove('docs-p2');
  if(w.getBoundingClientRect().bottom>$('#ipill').getBoundingClientRect().top-6)home.classList.add('docs-p2')}
function iOpenKey(key,src){const[t,k]=key.split(':');
  if(t==='app')iOpenApp(k,src);else if(t==='fold')iFolder(src);else if(t==='files')iFiles(src);
  else if(t==='safari')iSheet(safHistory(),T.history,src,null,'sheetsaf');
  else if(t==='contacts')iSheet(contact(),T.contacts,src);else if(t==='gh')open(GH,'_blank','noopener')}

let jig=false,lpT=0,st=null,moved=false;
function setJiggle(v){jig=v;home.classList.toggle('jiggle',v);let d=ios.querySelector('.done');
  if(v&&!d){d=document.createElement('button');d.className='done';d.textContent=T.done;d.onclick=e=>{e.stopPropagation();setJiggle(false)};ios.appendChild(d)}if(!v&&d)d.remove()}
on(home,'pointerdown',e=>{moved=false;st={x:e.clientX,y:e.clientY};const it=e.target.closest('.iapp');
  if(jig){if(it)startIDrag(e,it);return}
  lpT=later(()=>{moved=true;st=null;const w=e.target.closest('.iw');if(it||w)iCtx(it||w);else setJiggle(true)},480)});
on(home,'pointermove',e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;if(Math.hypot(dx,dy)>8)clearTimeout(lpT);
  if(dy>60&&Math.abs(dx)<40&&!jig&&!ios.querySelector('.isearch')){st=null;moved=true;iSearch()}});
on(home,'pointerup',()=>{clearTimeout(lpT);st=null});
on(home,'pointercancel',()=>{clearTimeout(lpT);st=null});
on(home,'contextmenu',e=>e.preventDefault());
{const pages=$('#pages'),pill=$('#ipill');let t=0;
  on(pages,'scroll',()=>{clearTimeout(lpT);pill.classList.add('dots');const i=Math.round(pages.scrollLeft/pages.clientWidth);
    pill.querySelectorAll('.dts i').forEach((d,j)=>d.classList.toggle('on',j===i));clearTimeout(t);t=later(()=>pill.classList.remove('dots'),1400)},{passive:true})}
on(home,'click',e=>{if(moved){moved=false;e.preventDefault();return}
  if(jig){if(!e.target.closest('.iapp'))setJiggle(false);e.preventDefault();return}
  const dc=e.target.closest('[data-ldoc]');if(dc){iDoc(dc.dataset.ldoc,dc);return}
  const it=e.target.closest('.iapp');if(it)iOpenKey(it.dataset.key,it)});
on($('#ipill'),'click',e=>{e.stopPropagation();if(!jig)iSearch()});
const irect=(n,inner=true)=>{const r=((inner&&n.querySelector('.appic,.ifold'))||n).getBoundingClientRect(),s=ios.getBoundingClientRect();return{x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height}};

// long press: lift the icon and show its menu (as on iPhone)
function iCtx(el){const key=el.dataset.key,r=irect(el,false),W=ios.offsetWidth,H=ios.offsetHeight,C=T.iosCtx;
  const items=key?[[C.open,()=>iOpenKey(key,el)],[C.share,null,1],[key.startsWith('fold')?C.rename:C.appInfo,key.startsWith('app')?()=>iSheet(caseFile(key.split(':')[1]),C.appInfo):null,!key.startsWith('app')],[C.edit,()=>setJiggle(true)]]:[[C.widget,null,1],[C.edit,()=>setJiggle(true)]];
  const ov=document.createElement('div');ov.className='ictx';const lift=el.cloneNode(true);lift.classList.add('lift');lift.removeAttribute('id');lift.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
  Object.assign(lift.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
  const m=document.createElement('div');m.className='imenu';m.innerHTML=items.map((it,i)=>`<button data-i="${i}"${it[2]?' disabled':''}>${it[0]}</button>`).join('');
  ov.append(lift,m);ios.appendChild(ov);
  const mh=m.offsetHeight,below=r.y+r.h+14+mh<H-30;m.style.left=Math.max(16,Math.min(r.x,W-16-250))+'px';m.style.top=(below?r.y+r.h+14:r.y-14-mh)+'px';m.style.transformOrigin=below?'top left':'bottom left';
  if(!RM){ov.animate([{opacity:0},{opacity:1}],{duration:200});lift.animate([{transform:'scale(1)'},{transform:'scale(1.06)'}],{duration:SP.d,easing:SP.e,fill:'forwards'});m.animate([{transform:'scale(.3)',opacity:0},{transform:'none',opacity:1}],{duration:SP.d,easing:SP.e})}
  ov.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();const b=e.target.closest('[data-i]');ov.animate([{opacity:1},{opacity:0}],{duration:160}).onfinish=()=>ov.remove();if(b){const f=items[+b.dataset.i][1];f&&later(f,120)}})}

// edit mode: drag icons between places and into or out of the dock
function startIDrag(e,el){const r0=el.getBoundingClientRect(),g={x:e.clientX-r0.left,y:e.clientY-r0.top};let go=false,last=null;
  track(ev=>{if(!go){if(Math.hypot(ev.clientX-e.clientX,ev.clientY-e.clientY)<6)return;go=true;el.classList.add('dragging')}
    const all=[...igrid.children,...idock.children].filter(x=>x!==el);
    const tgt=all.find(x=>{const r=x.getBoundingClientRect();return Math.abs(ev.clientX-(r.left+r.width/2))<24&&Math.abs(ev.clientY-(r.top+r.height/2))<30});
    const dr=idock.getBoundingClientRect(),inDock=ev.clientY>dr.top;
    if(tgt&&tgt!==last){const toDock=tgt.parentElement===idock;if(!(toDock&&el.parentElement!==idock&&idock.children.length>=4))
      flip(all,()=>{const sib=[...tgt.parentElement.children];tgt.parentElement===el.parentElement&&sib.indexOf(tgt)>sib.indexOf(el)?tgt.after(el):tgt.before(el)})}
    else if(!tgt&&inDock&&el.parentElement!==idock&&idock.children.length<4)flip(all,()=>idock.appendChild(el));
    else if(!tgt&&ev.clientY<dr.top-60&&el.parentElement===idock)flip(all,()=>igrid.appendChild(el));
    last=tgt||null;el.style.transform='none';const r=el.getBoundingClientRect();el.style.transform=`translate(${ev.clientX-g.x-r.left}px,${ev.clientY-g.y-r.top}px)`},
  ()=>{if(!go)return;const cur=el.style.transform;el.style.transform='';el.classList.remove('dragging');
    el.animate([{transform:cur},{transform:'none'}],{duration:SP2.d,easing:SP2.e});
    iord={grid:[...igrid.children].map(x=>x.dataset.key),dock:[...idock.children].map(x=>x.dataset.key)};LS.set('ios',iord);moved=true})}

function iSheet(html,title,src,onReady,cls){
  const W=ios.offsetWidth,H=ios.offsetHeight,r=src&&src.isConnected?irect(src):{x:W/2-30,y:H/2-30,w:60,h:60};
  const el=document.createElement('section');el.className='iappwin'+(cls?' '+cls:'');el.setAttribute('aria-label',title);
  Object.assign(el.style,{left:0,top:0,width:W+'px',height:H+'px',transformOrigin:'0 0'});
  el.innerHTML=`<div class="ihead"></div><div class="ibody">${html}</div><button class="hbar" aria-label="${T.toHome}"></button>`;ios.appendChild(el);
  home.classList.add('behind');
  wire(el,'ios');const stop=onReady?onReady(el):null;
  // Apps zoom out of their icon and back into it. The Genie warp copies the whole app into 32 full-screen layers,
  // which runs iPhone browsers out of memory (the tab dies with "can't open this page"), so phones animate the app itself.
  const atIcon=x=>({transform:`translate(${x.x}px,${x.y}px) scale(${x.w/W},${x.h/H})`,borderRadius:'90px',opacity:.35});
  if(!RM)el.animate([atIcon(r),{transform:'none',borderRadius:'0',opacity:1}],{duration:430,easing:'cubic-bezier(.2,.75,.3,1)'});
  const close=()=>{if(el.classList.contains('closing'))return;el.classList.add('closing');typeof stop==='function'&&stop();const still=src&&src.isConnected&&!src.closest('.fov')?irect(src):r;
    if(RM)el.remove();else{el.style.pointerEvents='none';el.animate([{transform:getComputedStyle(el).transform,opacity:1},atIcon(still)],{duration:380,easing:'cubic-bezier(.45,0,.75,.95)',fill:'forwards'}).finished.then(()=>el.remove(),()=>el.remove())}
    if(!ios.querySelector('.iappwin:not(.closing)')&&!ios.querySelector('.fov'))home.classList.remove('behind')};
  el.close=close;
  const hb=el.querySelector('.hbar');let sy=null;
  hb.addEventListener('pointerdown',e=>{sy=e.clientY;hb.setPointerCapture(e.pointerId)});
  hb.addEventListener('pointermove',e=>{if(sy==null)return;const d=Math.min(0,e.clientY-sy);el.style.transform=`translateY(${d*.5}px) scale(${1+d/1400})`;el.style.borderRadius='44px'});
  hb.addEventListener('pointerup',()=>{sy=null;close()});
  return el}
function iOpenApp(k,src){const a=APPS[k];iSheet(`<div class="ibar">${appTools(k)}</div>`+appBody(k),a.title,src,el=>startApp(k,el),'app'+(a.dark?' dark':''))}
function iDoc(k,src){const d=deskItem(k);if(d.out)return openOut(d);if(d.kind==='link')return iSheet(safPage(d.href,esc(d.name)),d.name,src,null,'sheetsaf');iSheet(`<div class="inav"><b>${deskItem(k).name}</b></div>${docView(k)}`,deskItem(k).name,src)}
function iFiles(src){const el=iSheet(`<div class="files"><h1>qminlab</h1><div class="flist">${ALL.filter(d=>d.kind!=='folder').map(d=>`<button class="frow" data-doc="${d.k}"><span class="fic">${d.kind==='link'?linkArt(d):docSvg(d.ext)}</span><span><b>${esc(d.name)}</b><small>${d.kind==='link'?P[d.proj].name:`${T.modifiedShort} · ${kindOf(d)}`}</small></span></button>`).join('')}</div></div>`,T.apps.files,src);
  const body=el.querySelector('.ibody');body.addEventListener('click',e=>{const b=e.target.closest('[data-doc]');if(!b)return;const d=deskItem(b.dataset.doc);
    if(d.kind==='link'){iDoc(d.k,b);return}
    const page=document.createElement('div');page.className='ipage';page.innerHTML=`<div class="inav"><button class="back">‹ qminlab</button><b>${d.name}</b></div>${docView(d.k)}`;body.appendChild(page);wire(page,'ios');
    if(!RM)page.animate([{transform:'translateX(100%)'},{transform:'none'}],{duration:SP2.d,easing:SP2.e});
    page.querySelector('.back').onclick=()=>page.animate([{transform:'none'},{transform:'translateX(100%)'}],{duration:RM?1:260,easing:'ease-in',fill:'forwards'}).onfinish=()=>page.remove()})}
function iFolder(src){const ov=document.createElement('div');ov.className='fov';
  ov.innerHTML=`<h3>${T.paused}</h3><div class="fpanel">${PAUSED.map(k=>`<button class="iapp" data-fi="${k}">${pIcon(k)}${iLabel(k)}</button>`).join('')}</div>`;
  ios.appendChild(ov);home.classList.add('behind');const r=irect(src),pr=ov.querySelector('.fpanel');
  pr.style.transformOrigin=`${r.x+30-(ios.offsetWidth-322)/2}px ${r.y+30-pr.offsetTop}px`;requestAnimationFrame(()=>ov.classList.add('on'));
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-fi]');if(b){iOpenApp(b.dataset.fi,b);return}
    if(!e.target.closest('.fpanel')){ov.classList.remove('on');later(()=>{ov.remove();if(!ios.querySelector('.iappwin'))home.classList.remove('behind')},320)}})}
function iSearch(){const s=document.createElement('div');s.className='isearch';
  s.innerHTML=`<div style="display:flex;align-items:center"><div class="in" style="flex:1">${searchSvg(2)}<input placeholder="${T.search}" autocomplete="off" aria-label="${T.search}"></div><button class="x">${T.cancel}</button></div><div class="res"></div>`;
  ios.appendChild(s);requestAnimationFrame(()=>s.classList.add('on'));const inp=s.querySelector('input'),res=s.querySelector('.res');let R=[];
  const draw=()=>{R=inp.value?search(inp.value):IDX.slice(0,6);res.innerHTML=R.map((r,i)=>`<button class="r" data-i="${i}">${r.art}<span>${r.label}</span><small>${r.meta}</small></button>`).join('')};draw();
  inp.addEventListener('input',draw);later(()=>inp.focus(),50);
  const close=()=>{s.classList.remove('on');later(()=>s.remove(),250)};
  s.querySelector('.x').onclick=close;res.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b){close();R[+b.dataset.i].go('ios')}})}

/* ---------- a page in a Safari window that links back home (← qminlab) closes its window instead of nesting the homepage ---------- */
const isHome=u=>u.origin===location.origin&&/^\/([a-z]{2}\/?)?$/.test(u.pathname);
function closeFrame(f){const w=f.closest('.win'),id=w&&Object.keys(wins).find(k=>wins[k].el===w);if(id){closeWin(id);return}f.closest('.iappwin')?.close?.()}
on(root,'load',e=>{const f=e.target;if(f.tagName!=='IFRAME')return;let win;try{win=f.contentWindow;win.location.pathname}catch{return}
  // Reached home anyway (a script, a redirect): close it now.
  if(isHome(win.location)){f.src='about:blank';closeFrame(f);return}
  // Otherwise catch the click on a home link before the homepage starts loading inside the window.
  win.document.addEventListener('click',ev=>{const a=ev.target.closest&&ev.target.closest('a[href]');if(!a||a.target==='_blank')return;
    let u;try{u=new URL(a.href)}catch{return}if(isHome(u)){ev.preventDefault();closeFrame(f)}},true)},{capture:true});

/* ---------- mode: phones get the iPhone, everything wider gets the Mac ---------- */
const mq=matchMedia('(max-width:720px)');
const mode=()=>{root.classList.toggle('ios',mq.matches);fitDocs()};on(window,'resize',fitDocs);
on(mq,'change',mode);mode();


return()=>{ac.abort();timers.forEach(clearTimeout);clearInterval(clockT);stopWalls.forEach(f=>f());root.innerHTML='';root.classList.remove('ios','mc-on')};
}
