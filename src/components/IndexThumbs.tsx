/**
 * Small static stand-ins for each specimen, shown in the index's cursor-follow preview.
 * Pure SVG/CSS, no WebGL, no text that needs translating. Sized to sit inside a 260 × 320 box.
 */

const A = '#FF5A1F';
const B = '#ECE8DE';

function Phone() {
  const bubbles: [boolean, number][] = [[false, 78], [true, 62], [false, 48], [true, 70], [false, 56]];
  return (
    <div className="ixt-phone">
      <div className="ixt-phone-scr">
        <span className="ixt-notch" />
        {bubbles.map(([me, w], i) => (
          <span key={i} className={me ? 'ixt-bub ixt-bub--me' : 'ixt-bub'} style={{ width: `${w}%` }}>
            <i style={{ width: '82%' }} /><i style={{ width: `${40 + ((i * 17) % 40)}%` }} />
          </span>
        ))}
        <span className="ixt-input" />
      </div>
    </div>
  );
}

function Jarvis() {
  return (
    <svg width="240" height="240" viewBox="-120 -120 240 240" aria-hidden="true">
      <defs>
        <radialGradient id="ixt-core">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".28" stopColor={A} />
          <stop offset="1" stopColor={A} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="44" fill="url(#ixt-core)" />
      <g fill="none" stroke={A}>
        <ellipse className="ixt-rot" rx="112" ry="40" strokeDasharray="2 7" strokeOpacity=".7" />
        <circle className="ixt-rot ixt-rot--rev" r="88" strokeDasharray="38 12" strokeWidth="2.5" strokeOpacity=".9" />
        <circle r="66" stroke={B} strokeOpacity=".45" />
        <circle className="ixt-rot ixt-rot--fast" r="56" strokeDasharray="1 5" strokeWidth="5" strokeOpacity=".8" />
        <circle r="116" strokeOpacity=".22" />
      </g>
    </svg>
  );
}

const HEX_R = 15;
const HEX_W = Math.sqrt(3) * HEX_R;
const PIECES: Record<string, 1 | 2> = { '1-2': 1, '2-4': 1, '3-1': 1, '0-5': 1, '2-2': 2 };
const HEXES = Array.from({ length: 4 * 7 }, (_, n) => {
  const r = Math.floor(n / 7), c = n % 7;
  const x = 22 + c * HEX_W + (r % 2 ? HEX_W / 2 : 0), y = 26 + r * HEX_R * 1.5;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(x + HEX_R * 0.94 * Math.cos(a)).toFixed(1)},${(y + HEX_R * 0.94 * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return { x, y, pts, p: PIECES[`${r}-${c}`] };
});

function Tft() {
  return (
    <svg width="250" height="190" viewBox="0 0 250 190" aria-hidden="true" style={{ transform: 'perspective(600px) rotateX(28deg)' }}>
      {HEXES.map((h, i) => (
        <g key={i}>
          <polygon points={h.pts} fill={h.p ? 'rgba(255,90,31,.18)' : 'rgba(236,232,222,.03)'} stroke={h.p ? A : 'rgba(236,232,222,.25)'} />
          {h.p && <><line x1={h.x} y1={h.y} x2={h.x} y2={h.y - 22} stroke={A} strokeOpacity=".5" /><circle cx={h.x} cy={h.y} r="5" fill={h.p === 2 ? B : A} /></>}
        </g>
      ))}
      <rect x="150" y="128" width="92" height="52" fill="#141612" stroke={A} />
      <rect x="160" y="140" width="40" height="5" fill={A} />
      <rect x="160" y="152" width="70" height="4" fill={B} fillOpacity=".7" />
      <rect x="160" y="163" width="56" height="4" fill={B} fillOpacity=".7" />
    </svg>
  );
}

function Dungeon() {
  return (
    <div className="ixt-dh">
      <span className="ixt-dh-slab ixt-dh-slab--2" />
      <span className="ixt-dh-slab ixt-dh-slab--1" />
      <span className="ixt-dh-slab" />
      <span className="ixt-dh-hero" />
    </div>
  );
}

function Reel() {
  const frames = [0, 1, 2, 3];
  return (
    <svg width="250" height="200" viewBox="0 0 250 200" aria-hidden="true" style={{ transform: 'perspective(600px) rotateY(-16deg)' }}>
      <rect x="40" y="6" width="170" height="96" fill="#141512" stroke="rgba(236,232,222,.25)" />
      <path d="M118 30l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" fill="none" stroke={A} strokeWidth="1.6" />
      <path d="M70 102V72c0-10 8-10 8 0v-14c0-5 7-5 7 0v44" fill="none" stroke={B} strokeOpacity=".6" />
      <rect x="0" y="122" width="250" height="66" fill="#0F100E" />
      <path d="M0 128h250M0 182h250" stroke="#2A2C26" strokeWidth="5" strokeDasharray="7 7" />
      {frames.map((i) => (
        <rect key={i} x={8 + i * 62} y="136" width="54" height="40" fill="#141512" stroke={i === 1 ? A : 'rgba(236,232,222,.25)'} />
      ))}
      <line x1="89" y1="114" x2="89" y2="196" stroke={A} />
    </svg>
  );
}

function WaitBoard() {
  const cols: [string, number[]][] = [['ixt-tk--run', [14, 16]], ['ixt-tk--ask', [15]], ['ixt-tk--done', [12, 13]]];
  return (
    <div className="ixt-ipad">
      <div className="ixt-ipad-scr">
        {cols.map(([cls, ns], i) => (
          <div key={i} className="ixt-col">
            <span className={`ixt-col-head ${cls}`} />
            {ns.map((n) => (
              <span key={n} className={`ixt-tk ${cls}`}>{String(n).padStart(3, '0')}<i /></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function IndexThumb({ code }: { code: string }) {
  switch (code) {
    case 'QL-001': return <Phone />;
    case 'QL-002': return <Jarvis />;
    case 'QL-003': return <Tft />;
    case 'QL-004': return <Dungeon />;
    case 'QL-005': return <WaitBoard />;
    case 'QL-006': return <Reel />;
    default: return null;
  }
}
