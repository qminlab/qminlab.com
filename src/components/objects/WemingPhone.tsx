'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { KR } from '@/lib/tokens';

// A small web-only Weming: sample data, no app or server connection. Colours and layout follow the
// app's screenshots and theme (dark #0D0A13, violet #B15CFF → pink #FF4FA3), as in the mockup.
const G = 'linear-gradient(90deg, #6A5CFF, #B15CFF, #FF4FA3)';
const G135 = 'linear-gradient(135deg, #6A5CFF, #B15CFF, #FF4FA3)';
const TXT = '#F3EEFA', SUB = '#B3A9C4', FAINT = '#726A84', CARD = '#17121F', VIOLET = '#B15CFF', PINK = '#FF4FA3';

type Msg = { me: boolean; text: string; time: string };
type Tab = 'feed' | 'users' | 'chats' | 'store' | 'me';

const ROOM: Msg[] = [
  { me: false, text: '안녕하세요! 프로필 보고 쪽지 드렸어요', time: '오전 9:38' },
  { me: true, text: '앗 안녕하세요! 반가워요', time: '오전 9:40' },
  { me: false, text: '한강 산책 좋아하신다고 해서요. 저도 자주 가거든요', time: '오전 9:42' },
  { me: true, text: '오 진짜요? 저는 주로 반포 쪽으로 가요', time: '오전 9:45' },
  { me: false, text: '저도 반포요! 밤에 무지개 분수 켜지면 예쁘더라고요', time: '오전 9:50' },
  { me: true, text: '요즘 날씨 선선해서 걷기 딱 좋더라고요', time: '오전 10:08' },
  { me: false, text: '그럼 이번 주말에 한강 어때요?', time: '오전 10:18' },
];
const POSTS = [
  { id: 1, nick: '느긋한 판다', ring: '#FF6FB5', time: '7분 전', title: '퇴근길 하늘 너무 예뻐요', body: '오늘 하루 고생한 거 하늘이 알아주는 느낌', likes: 24, comments: 6, thumb: 'linear-gradient(180deg, #8EA6C8 0%, #C9D3DE 55%, #4C5A55 56%, #2E3833 100%)', hot: 2 },
  { id: 2, nick: '용감한 수달', ring: '#5CA8FF', time: '18분 전', title: '점심 메뉴 골라주세요', body: '회사 근처 선택지가 이것뿐이에요 ㅋㅋ', likes: 11, comments: 9, poll: true, hot: 4 },
  { id: 3, nick: '수줍은 고래', ring: '#FF6FB5', time: '42분 전', title: '주말에 다녀온 곳', body: '사람 없을 때 가니까 조용하고 좋더라고요. 다음엔 도...', likes: 38, comments: 12, thumb: 'linear-gradient(180deg, #9CC3D9 0%, #D9D2C1 60%, #7A5B48 61%, #3E2E25 100%)', hot: 1 },
  { id: 4, nick: '졸린 펭귄', ring: '#5CA8FF', time: '1시간 전', title: '요즘 빠진 노래 공유해요', body: '출근길에 무한반복 중인데 다들 요즘 뭐 들으세요?', likes: 17, comments: 21, hot: 3 },
];
const USERS = [
  { name: '새벽산책', bio: '한강 산책 좋아해요', meta: '24살 · 여 · 서울 · INFP', online: true, joined: '', f: true },
  { name: '치즈집사', bio: '고양이 두 마리랑 살아요', meta: '27살 · 남 · 경기 · ISFJ', online: true, joined: '', f: false },
  { name: '봄날의곰', bio: '바다 보러 자주 가요', meta: '23살 · 여 · 부산 · ENFP', online: false, joined: '5시간 전 가입', f: true },
  { name: '라떼한잔', bio: '주말엔 카페 투어', meta: '29살 · 남 · 서울 · INTJ', online: false, joined: '9시간 전 가입', f: false },
  { name: '몽글몽글', bio: '노래방 메이트 구해요', meta: '22살 · 여 · 인천 · ESFP', online: true, joined: '', f: true },
  { name: '야간러너', bio: '퇴근 후 러닝 5km', meta: '31살 · 남 · 대전 · ESTJ', online: false, joined: '20시간 전 가입', f: false },
];
const CHATS = [
  { name: '새벽산책', last: '그럼 이번 주말에 한강 어때요?', time: '오전 10:18', unread: 2, f: true },
  { name: '치즈집사', last: '고양이 사진 보내드릴게요', time: '어제', unread: 0, f: false },
  { name: '라떼한잔', last: '나: 성수 쪽 카페 추천해 주세요', time: '어제', unread: 0, f: false },
  { name: '봄날의곰', last: '종료됨', time: '10월 5일', unread: 0, f: true },
];
const STORIES = [
  { ring: 'linear-gradient(135deg, #FF4FA3, #FF8A65)', fill: 'linear-gradient(180deg, #8EA6C8, #3F4E66)' },
  { ring: 'linear-gradient(135deg, #6A5CFF, #2EC5FF)', fill: 'linear-gradient(180deg, #6B6A5E, #2E2B26)' },
  { ring: 'linear-gradient(135deg, #FF4FA3, #FF8A65)', fill: 'linear-gradient(180deg, #8C8A5A, #4A5A2E)' },
  { ring: 'linear-gradient(135deg, #FF4FA3, #FFB347)', fill: 'linear-gradient(180deg, #C9A77C, #5E4A35)' },
];
const av = (f: boolean) => ({ ring: f ? '#FF6FB5' : '#5CA8FF', fill: f ? '#2A1E36' : '#1B2235' });
const btn: CSSProperties = { fontFamily: KR, cursor: 'pointer' };
const backBtn: CSSProperties = { ...btn, height: 30, padding: '0 12px', borderRadius: 999, border: '1px solid #2B2337', background: CARD, color: TXT, fontSize: 12 };

/** `screen`: only the app's screen, filling its container (a Mac window or a full-screen iPhone app), no bezel or status bar. */
export function WemingPhone({ screen = false }: { screen?: boolean } = {}) {
  const [tab, setTab] = useState<Tab>('feed');
  const [sub, setSub] = useState<null | 'room' | 'random'>(null);
  const [rp, setRp] = useState<'home' | 'searching' | 'proposal' | 'chat'>('home');
  const [seg, setSeg] = useState<'new' | 'recent'>('new');
  const [sort, setSort] = useState<'new' | 'hot'>('new');
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState('');
  const [pulse, setPulse] = useState(0);
  const [room, setRoom] = useState<Msg[]>(ROOM);
  const [random, setRandom] = useState<Msg[]>([]);
  const timers = useRef<{ t?: ReturnType<typeof setTimeout>; p?: ReturnType<typeof setInterval>; r?: ReturnType<typeof setTimeout> }>({});
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => () => { clearTimeout(timers.current.t); clearInterval(timers.current.p); clearTimeout(timers.current.r); }, []);

  const search = () => {
    clearTimeout(timers.current.t); clearInterval(timers.current.p);
    setSub('random'); setRp('searching'); setPulse(0);
    timers.current.p = setInterval(() => setPulse((p) => (p + 1) % 20), 70);
    timers.current.t = setTimeout(() => { clearInterval(timers.current.p); setRp('proposal'); }, 1800);
  };
  const closeSub = () => { clearTimeout(timers.current.t); clearInterval(timers.current.p); setSub(null); };
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const isRandom = sub === 'random';
    const set = isRandom ? setRandom : setRoom;
    set((l) => l.concat([{ me: true, text, time: '방금' }]));
    setDraft('');
    clearTimeout(timers.current.r);
    timers.current.r = setTimeout(() => {
      set((l) => l.concat([{ me: false, text: isRandom ? 'ㅋㅋ 반가워요! 어디 사세요?' : '좋아요! 토요일 저녁 어때요?', time: '방금' }]));
    }, 1200);
  };

  const isThread = sub === 'room' || (sub === 'random' && rp === 'chat');
  const is = { feed: !sub && tab === 'feed', users: !sub && tab === 'users', chats: !sub && tab === 'chats', store: !sub && tab === 'store', me: !sub && tab === 'me', random: sub === 'random' && rp !== 'chat', thread: isThread };
  const titles: Record<Tab, string> = { feed: '위밍', users: '위밍', chats: '대화', store: '스토어', me: 'MY' };
  const msgs = sub === 'random' ? random : room;
  useEffect(() => { if (isThread && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs.length, isThread]);
  const posts = sort === 'hot' ? POSTS.slice().sort((a, b) => a.hot - b.hot) : POSTS;
  const people = seg === 'recent' ? USERS.filter((u) => u.online) : USERS;
  const tabs: [Tab, string, string][] = [['feed', '피드', 'home'], ['users', '친구', 'people'], ['chats', '대화', 'chat'], ['store', '스토어', 'diamond'], ['me', '프로필', 'me']];
  const side = (s: CSSProperties) => <div aria-hidden="true" style={{ position: 'absolute', width: 4, borderRadius: 2, background: '#5A5660', ...s }} />;

  return (
    <div style={screen ? { position: 'relative', width: '100%', height: '100%', fontFamily: KR, color: TXT } : { position: 'relative', width: 320, height: 660, fontFamily: KR, color: TXT }}>
      {!screen && <>{side({ left: 6, top: 120, height: 30 })}{side({ left: 6, top: 166, height: 52 })}{side({ left: 6, top: 228, height: 52 })}{side({ right: 6, top: 190, height: 80 })}</>}
      <div style={screen ? { position: 'absolute', inset: 0 } : { position: 'absolute', left: 10, top: 10, width: 300, height: 640, boxSizing: 'border-box', borderRadius: 52, padding: 9, background: '#18161C', border: '1.5px solid #77737E', boxShadow: '0 0 0 1px #2C2A31 inset, 0 30px 60px rgba(0,0,0,0.55)' }}>
        <div role="application" aria-label="위밍 데모" style={{ position: 'relative', width: '100%', height: '100%', borderRadius: screen ? 0 : 43, overflow: 'hidden', background: '#0D0A13', display: 'flex', flexDirection: 'column' }}>
          {screen ? <div style={{ flex: 'none', height: 8 }} /> : <div style={{ position: 'relative', flex: 'none', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px 0 30px', fontSize: 13, fontWeight: 600 }}>
            <span>10:19</span>
            <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 9, width: 86, height: 25, marginLeft: -43, borderRadius: 13, background: '#000' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="15" height="10" viewBox="0 0 15 10" fill={TXT}><rect x="0" y="7" width="2.6" height="3" rx="0.6" /><rect x="4" y="5" width="2.6" height="5" rx="0.6" /><rect x="8" y="2.5" width="2.6" height="7.5" rx="0.6" /><rect x="12" y="0" width="2.6" height="10" rx="0.6" /></svg>
              <svg width="21" height="10" viewBox="0 0 21 10" fill="none"><rect x="0.5" y="0.5" width="17" height="9" rx="2.5" stroke={TXT} opacity="0.5" /><rect x="2" y="2" width="11" height="6" rx="1.2" fill="#3DDC97" /><rect x="18.8" y="3.2" width="1.4" height="3.6" rx="0.6" fill={TXT} opacity="0.5" /></svg>
            </span>
          </div>}

          {!sub && (
            <div style={{ flex: 'none', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
              <span style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.06em' }}>{titles[tab]}<span style={{ color: PINK }}>{tab === 'feed' || tab === 'users' ? '.' : ''}</span></span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TXT} strokeWidth="1.8" aria-label="알림"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
            </div>
          )}

          <div ref={scroller} data-phone-scroll style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', scrollbarWidth: 'none' }}>
            {is.feed && (
              <>
                <div style={{ display: 'flex', gap: 12, padding: '4px 14px 12px', overflow: 'hidden', borderBottom: '1px solid #2B2337' }}>
                  <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 54, height: 54, borderRadius: '50%', border: '1.5px dashed #4A4058', display: 'flex', alignItems: 'center', justifyContent: 'center', color: VIOLET, fontSize: 26, fontWeight: 300 }}>+</span>
                    <span style={{ fontSize: 10, color: SUB }}>스토리 추가</span>
                  </div>
                  {STORIES.map((s, i) => (
                    <span key={i} style={{ flex: 'none', width: 58, height: 58, borderRadius: '50%', padding: 2.5, boxSizing: 'border-box', background: s.ring }}>
                      <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', border: '2.5px solid #0D0A13', boxSizing: 'border-box', background: s.fill }} />
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, padding: '12px 12px 8px' }}>
                  {([['new', '최신순'], ['hot', '인기순']] as const).map(([k, label]) => (
                    <button key={k} type="button" onClick={() => setSort(k)} style={{ ...btn, height: 30, padding: '0 14px', borderRadius: 999, border: `1px solid ${sort === k ? VIOLET : '#2B2337'}`, background: sort === k ? '#2A1A3C' : CARD, color: sort === k ? '#C98BFF' : SUB, fontSize: 12, fontWeight: 700 }}>{label}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 8px 70px' }}>
                  {posts.map((p) => {
                    const on = !!liked[p.id];
                    const lc = on ? PINK : SUB;
                    return (
                      <article key={p.id} style={{ padding: 12, borderRadius: 14, background: CARD, border: '1px solid #211A2C' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${p.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={p.ring} strokeWidth="2"><path d="M4 10h16M7 10l2-5h6l2 5" /><circle cx="8" cy="15" r="3" /><circle cx="16" cy="15" r="3" /></svg>
                          </span>
                          <span style={{ fontWeight: 700 }}>{p.nick}</span><span style={{ color: FAINT }}>· {p.time}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.03em' }}>{p.title}</div>
                            <div style={{ marginTop: 3, fontSize: 12, color: SUB, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.body}</div>
                          </div>
                          {p.thumb && <span style={{ flex: 'none', width: 52, height: 52, borderRadius: 10, background: p.thumb }} />}
                        </div>
                        {p.poll && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '9px 10px', borderRadius: 10, background: '#0D0A13', fontSize: 11 }}><span>투표 · 3개 중 선택 · 45명 참여</span><span style={{ color: VIOLET, fontWeight: 700 }}>투표하기 ›</span></div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, fontSize: 12, color: SUB }}>
                          <button type="button" onClick={() => setLiked({ ...liked, [p.id]: !on })} aria-pressed={on} style={{ ...btn, display: 'flex', alignItems: 'center', gap: 5, padding: 0, border: 0, background: 'transparent', color: lc, fontSize: 12 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill={on ? PINK : 'none'} stroke={lc} strokeWidth="1.8"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>{p.likes + (on ? 1 : 0)}
                          </button>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="1.8"><path d="M4 12a8 7 0 1 1 3 5.5L4 19z" /></svg>{p.comments}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {is.users && (
              <>
                <div style={{ display: 'flex', gap: 6, padding: '4px 10px 10px' }}>
                  <div style={{ flex: 1, display: 'flex', padding: 3, borderRadius: 12, background: CARD }}>
                    {([['new', '최신 이용자'], ['recent', '최근 접속자']] as const).map(([k, label]) => (
                      <button key={k} type="button" onClick={() => setSeg(k)} style={{ ...btn, flex: 1, height: 32, border: 0, borderRadius: 10, background: seg === k ? G : 'transparent', color: seg === k ? '#fff' : SUB, fontSize: 12, fontWeight: 700 }}>{label}</button>
                    ))}
                  </div>
                  <button type="button" onClick={() => { setSub('random'); setRp('home'); }} style={{ ...btn, display: 'flex', alignItems: 'center', gap: 4, height: 38, padding: '0 12px', border: 0, borderRadius: 12, background: VIOLET, color: '#fff', fontSize: 12, fontWeight: 700 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>바로 대화
                  </button>
                </div>
                <div style={{ padding: '0 10px 8px' }}><span style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 12px', borderRadius: 999, border: '1px solid #2B2337', fontSize: 11, color: SUB }}>필터</span></div>
                <div style={{ padding: '0 10px 70px' }}>
                  {people.map((u) => {
                    const a = av(u.f);
                    return (
                      <button key={u.name} type="button" onClick={() => { setTab('chats'); setSub('room'); }} style={{ ...btn, width: '100%', display: 'flex', gap: 10, alignItems: 'center', padding: '9px 2px', border: 0, background: 'transparent', color: TXT, textAlign: 'left' }}>
                        <span style={{ position: 'relative', flex: 'none', width: 46, height: 46, borderRadius: '50%', border: `2px solid ${a.ring}`, boxSizing: 'border-box', background: a.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: a.ring }}>
                          {u.name.charAt(0)}
                          {u.online && <span style={{ position: 'absolute', right: -2, bottom: -2, width: 11, height: 11, borderRadius: '50%', background: '#3DDC97', border: '2px solid #0D0A13' }} />}
                        </span>
                        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}><span>{u.name}</span><span style={{ fontSize: 10, fontWeight: 600, color: u.online ? '#3DDC97' : FAINT }}>{u.online ? '접속 중' : u.joined}</span></span>
                          <span style={{ fontSize: 11, color: SUB }}>{u.bio}</span>
                          <span style={{ fontSize: 10, color: FAINT }}>{u.meta}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {is.chats && (
              <div style={{ padding: '0 10px 70px' }}>
                {CHATS.map((c) => {
                  const a = av(c.f);
                  return (
                    <button key={c.name} type="button" onClick={() => setSub('room')} style={{ ...btn, width: '100%', display: 'flex', gap: 10, alignItems: 'center', padding: '10px 2px', border: 0, borderBottom: '1px solid #1C1626', background: 'transparent', color: TXT, textAlign: 'left' }}>
                      <span style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', border: `2px solid ${a.ring}`, boxSizing: 'border-box', background: a.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: a.ring }}>{c.name.charAt(0)}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}><span>{c.name}</span><span style={{ fontSize: 10, fontWeight: 500, color: FAINT }}>{c.time}</span></span>
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, fontSize: 11, color: SUB }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last}</span>
                          {c.unread > 0 && <span style={{ flex: 'none', minWidth: 16, height: 16, padding: '0 4px', boxSizing: 'border-box', borderRadius: 8, background: PINK, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {is.store && <div style={{ padding: '30px 20px', textAlign: 'center', fontSize: 12, color: FAINT }}>스토어는 이 데모에서 보여주지 않아요.</div>}

            {is.me && (
              <div style={{ padding: '6px 14px 70px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 62, height: 62, borderRadius: '50%', padding: 2.5, boxSizing: 'border-box', background: G135 }}><span style={{ display: 'flex', width: '100%', height: '100%', borderRadius: '50%', border: '2.5px solid #0D0A13', boxSizing: 'border-box', background: '#2A1E36', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#FF6FB5' }}>판</span></span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 16, fontWeight: 700 }}>느긋한 판다</span><span style={{ fontSize: 11, color: SUB }}>친구 구해요 (진심)</span><span style={{ fontSize: 10, color: FAINT }}>26살 · 서울 · INFP</span></span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', padding: '10px 0', borderRadius: 14, background: CARD, textAlign: 'center' }}>
                  {[['12', '게시글'], ['1.2k', '조회'], ['248', '좋아요'], ['63', '댓글']].map(([n, l]) => (
                    <span key={l}><span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{n}</span><span style={{ fontSize: 10, color: FAINT }}>{l}</span></span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ flex: 1, height: 34, borderRadius: 10, background: '#211A2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>프로필 수정</span>
                  <span style={{ flex: 1, height: 34, borderRadius: 10, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>내 프로필 조회</span>
                </div>
                <div style={{ borderRadius: 14, background: CARD, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #211A2C' }}><span>남은 쪽지</span><span style={{ color: VIOLET, fontWeight: 700 }}>5</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #211A2C' }}><span>받은 쪽지</span><span style={{ color: PINK, fontWeight: 700 }}>2</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #211A2C' }}><span>내 게시글</span><span style={{ color: FAINT }}>›</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12 }}><span>설정</span><span style={{ color: FAINT }}>›</span></div>
                </div>
              </div>
            )}

            {is.random && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 12px 8px' }}>
                  <button type="button" onClick={closeSub} style={backBtn}>‹ 뒤로</button>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{rp === 'proposal' ? '대화 상대' : '바로 대화'}</span>
                  <span style={{ width: 54, textAlign: 'right', fontSize: 11, color: VIOLET }}>{rp === 'proposal' ? '0:12' : ''}</span>
                </div>
                {rp === 'home' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '26px 18px' }}>
                    <div style={{ position: 'relative', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid #2B2337' }} />
                      <span style={{ position: 'absolute', inset: 22, borderRadius: '50%', border: '1px solid #3A2E4A' }} />
                      <span style={{ width: 70, height: 70, borderRadius: '50%', background: G135, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg></span>
                    </div>
                    <span style={{ fontSize: 13, color: SUB }}>지금 <span style={{ color: '#3DDC97', fontWeight: 700 }}>128</span>명 접속 중</span>
                    <span style={{ display: 'flex', alignItems: 'center', height: 28, padding: '0 12px', borderRadius: 999, border: '1px solid #2B2337', fontSize: 11, color: SUB }}>상대 필터</span>
                    <button type="button" onClick={search} style={{ ...btn, width: '100%', height: 46, border: 0, borderRadius: 14, background: G, color: '#fff', fontSize: 14, fontWeight: 700 }}>대화 상대 찾기</button>
                    <span style={{ fontSize: 10, color: FAINT }}>조건이 좁을수록 연결까지 시간이 더 걸릴 수 있어요.</span>
                  </div>
                )}
                {rp === 'searching' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 18px' }}>
                    <div style={{ position: 'relative', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ position: 'absolute', inset: 30 - pulse * 1.5, borderRadius: '50%', border: `2px solid ${VIOLET}`, opacity: 1 - pulse / 20 }} />
                      <span style={{ position: 'absolute', inset: 30, borderRadius: '50%', border: '1px dashed #4A4058' }} />
                      <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#211A2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: VIOLET }}>?</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>대화 상대를 찾고 있어요</span>
                    <span style={{ fontSize: 11, color: SUB }}>새로운 사람이 들어오면 바로 연결해 드릴게요</span>
                    <button type="button" onClick={() => { clearTimeout(timers.current.t); clearInterval(timers.current.p); setRp('home'); }} style={{ ...btn, marginTop: 10, height: 34, padding: '0 18px', borderRadius: 999, border: '1px solid #2B2337', background: 'transparent', color: SUB, fontSize: 12 }}>그만하기</button>
                  </div>
                )}
                {rp === 'proposal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 14px', borderRadius: 18, background: CARD, border: '1px solid #2B2337' }}>
                      <span style={{ width: 70, height: 70, borderRadius: '50%', border: '2.5px solid #FF6FB5', boxSizing: 'border-box', background: '#2A1E36', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#FF6FB5' }}>몽</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>몽글몽글</span>
                      <span style={{ fontSize: 11, color: FAINT }}>22살 · 여성 · 인천 · ESFP</span>
                      <span style={{ fontSize: 12, color: SUB }}>노래방 메이트 구해요</span>
                      <span style={{ marginTop: 6, height: 4, width: '100%', borderRadius: 2, background: '#211A2C', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: '64%', background: VIOLET }} /></span>
                    </div>
                    <span style={{ textAlign: 'center', fontSize: 11, color: SUB }}>둘 다 수락하면 대화가 시작돼요</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={search} style={{ ...btn, flex: 1, height: 44, borderRadius: 14, border: '1px solid #2B2337', background: CARD, color: TXT, fontSize: 13, fontWeight: 700 }}>건너뛰기</button>
                      <button type="button" onClick={() => { setRp('chat'); setRandom([{ me: false, text: '안녕하세요! 노래 좋아하세요?', time: '방금' }]); }} style={{ ...btn, flex: 1, height: 44, border: 0, borderRadius: 14, background: G, color: '#fff', fontSize: 13, fontWeight: 700 }}>수락하기</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {is.thread && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 12px 8px' }}>
                  <button type="button" onClick={closeSub} style={backBtn}>‹ 뒤로</button>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{sub === 'random' ? '새로운 상대와 대화 중' : '새벽산책 ›'}</span>
                  <span style={{ minWidth: 54, textAlign: 'right', fontSize: 11, color: VIOLET }}>{sub === 'random' ? '다음 상대 ›' : '•••'}</span>
                </div>
                <p style={{ margin: '6px 18px 10px', textAlign: 'center', fontSize: 10, lineHeight: 1.6, color: FAINT, whiteSpace: 'pre-line' }}>
                  {sub === 'random' ? '익명의 상대와 연결됐어요. 서로의 프로필은 공개되지 않아요.\n3분이 지나면 쪽지로 대화를 이어갈 수 있어요.' : '대화가 시작됐어요.\n불쾌한 대화는 오른쪽 위 더보기 메뉴에서 신고할 수 있어요.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '0 10px 12px' }}>
                  {msgs.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 5 }}>
                      {m.me && <span style={{ fontSize: 9, color: FAINT }}>{m.time}</span>}
                      <span style={{ maxWidth: '72%', padding: '8px 11px', borderRadius: 16, background: m.me ? G : '#211A2C', fontSize: 12, lineHeight: 1.45 }}>{m.text}</span>
                      {!m.me && <span style={{ fontSize: 9, color: FAINT }}>{m.time}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {is.thread && (
            <div style={{ flex: 'none', display: 'flex', gap: 6, alignItems: 'center', padding: '8px 10px 22px', borderTop: '1px solid #1C1626' }}>
              <span style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={VIOLET} strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m3 18 6-5 4 3 3-2 5 4" /></svg></span>
              <label style={{ flex: 1, minWidth: 0 }}>
                <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>메시지 입력</span>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) send(); }} placeholder="메시지를 입력하세요"
                  style={{ width: '100%', boxSizing: 'border-box', height: 34, padding: '0 12px', border: 0, borderRadius: 999, background: CARD, color: TXT, fontFamily: KR, fontSize: 12, outline: 'none' }} />
              </label>
              <button type="button" onClick={send} aria-label="보내기" style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', border: 0, background: draft.trim() ? G : '#211A2C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 12 20 4l-6 16-3-7z" /></svg></button>
            </div>
          )}

          {!sub && (
            <nav aria-label="하단 탭" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, paddingBottom: 12, boxSizing: 'border-box', display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'rgba(13,10,19,0.92)', borderTop: '1px solid #1C1626' }}>
              {tabs.map(([k, label, icon]) => {
                const on = tab === k;
                const c = on ? TXT : FAINT, f = on ? TXT : 'none';
                return (
                  <button key={k} type="button" onClick={() => { setTab(k); setSub(null); }} aria-label={label} aria-current={on ? 'page' : undefined} style={{ position: 'relative', width: 44, height: 44, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {icon === 'home' && <svg width="22" height="22" viewBox="0 0 24 24" fill={f} stroke={c} strokeWidth="1.8"><path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-6 1 2 2 2 3 2 0-2-1-4 0-7z" /></svg>}
                    {icon === 'people' && <svg width="24" height="22" viewBox="0 0 26 24" fill={f} stroke={c} strokeWidth="1.8"><circle cx="9" cy="8" r="3.5" /><circle cx="18" cy="8" r="3" /><path d="M2 20c0-4 3-6 7-6s7 2 7 6zM17 14c3 0 6 2 6 5h-5" /></svg>}
                    {icon === 'chat' && <svg width="22" height="22" viewBox="0 0 24 24" fill={f} stroke={c} strokeWidth="1.8"><path d="M4 12a8 7 0 1 1 3 5.5L4 19z" /></svg>}
                    {icon === 'diamond' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M6 4h12l3 5-9 11L3 9z M3 9h18 M9 4l3 16 3-16" /></svg>}
                    {icon === 'me' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18c1.5-2 3.5-3 5.5-3s4 1 5.5 3" /></svg>}
                    {k === 'chats' && <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: PINK }} />}
                  </button>
                );
              })}
            </nav>
          )}

          {is.feed && <span aria-hidden="true" style={{ position: 'absolute', right: 14, bottom: 76, width: 48, height: 48, borderRadius: '50%', background: G135, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 300, boxShadow: '0 8px 20px rgba(177,92,255,0.45)' }}>+</span>}
          {!screen && <div aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: 6, width: 96, height: 4, marginLeft: -48, borderRadius: 2, background: TXT, opacity: 0.6 }} />}
        </div>
      </div>
    </div>
  );
}
