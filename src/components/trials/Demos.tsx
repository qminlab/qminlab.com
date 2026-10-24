/**
 * Small looping demos for the trial pages, drawn in HTML and animated with CSS only (styles in trials.css).
 * They illustrate a rule described in the text next to them; they are not recordings of the real apps.
 */
type L = 'ko' | 'en';

const BOARD = {
  ko: { lanes: ['작업중', '확인 필요', '완료'], title: '홈페이지 업데이트', states: ['3분째 작업', '권한 승인 · 10초 넘게 대기', '다시 작업중', '앞 턴 끝 · 뒤 턴 작업중', '방금 완료 · 6분 걸림'], other: '영상 편집', otherNote: '12분째 작업' },
  en: { lanes: ['Working', 'Needs attention', 'Done'], title: 'Homepage update', states: ['Working, 3 min', 'Prompt · waiting over 10 s', 'Working again', 'Turn ended · next turn running', 'Just done · took 6 min'], other: 'Video edit', otherNote: 'Working, 12 min' },
};

function BoardDemo({ l }: { l: L }) {
  const t = BOARD[l];
  return (
    <div className="dm dm-board" aria-hidden="true">
      <div className="dm-flash dm-flash-red" />
      <div className="dm-flash dm-flash-green" />
      <div className="dm-lanes">
        {t.lanes.map((x, i) => <div key={x} className={`dm-lane dm-lane-${i}`}><b>{x}</b></div>)}
      </div>
      <div className="dm-card dm-card-still"><span className="dm-no">004</span><span className="dm-ct"><b>{t.other}</b><i>{t.otherNote}</i></span></div>
      <div className="dm-card dm-card-move">
        <span className="dm-no">005</span>
        <span className="dm-ct">
          <b>{t.title}</b>
          <span className="dm-states">{t.states.map((s, i) => <i key={s} className={`dm-s dm-s${i}`}>{s}</i>)}</span>
        </span>
      </div>
    </div>
  );
}

const INSTANT = {
  ko: { a: { name: '새벽산책', meta: '24살 · 서울 · INFP', bio: '한강 산책 좋아해요' }, b: { name: '라떼한잔', meta: '26살 · 서울 · ENFJ', bio: '주말엔 카페 투어' }, accept: '수락', wait: '서로의 프로필을 보고 20초 안에 골라요', both: '둘 다 수락 → 대화 시작', chat: '새로운 상대와 대화 중', hi: '안녕하세요! 산책 좋아하시나 봐요', hi2: '네 ㅎㅎ 반가워요' },
  en: { a: { name: 'DawnWalk', meta: '24 · Seoul · INFP', bio: 'Loves river walks' }, b: { name: 'OneLatte', meta: '26 · Seoul · ENFJ', bio: 'Café hopping on weekends' }, accept: 'Accept', wait: 'Both profiles, 20 seconds to decide', both: 'Both accepted → chat opens', chat: 'Chatting with someone new', hi: 'Hi! You like walks too?', hi2: 'Haha yes, nice to meet you' },
};

function InstantDemo({ l }: { l: L }) {
  const t = INSTANT[l];
  const card = (p: { name: string; meta: string; bio: string }, side: string) => (
    <div className={`dm-pc dm-pc-${side}`}>
      <span className="dm-av" />
      <b>{p.name}</b>
      <i>{p.meta}</i>
      <span className="dm-bio">{p.bio}</span>
      <span className="dm-ok">{t.accept} ✓</span>
    </div>
  );
  return (
    <div className="dm dm-instant" aria-hidden="true">
      <div className="dm-step dm-match">
        <p className="dm-hint">{t.wait}</p>
        <div className="dm-pair">{card(t.a, 'a')}{card(t.b, 'b')}</div>
        <div className="dm-timer"><span /></div>
        <p className="dm-both">{t.both}</p>
      </div>
      <div className="dm-step dm-chat">
        <p className="dm-chat-top"><span>{t.chat}</span><b className="dm-clock"><i>3:00</i><i>2:59</i><i>2:58</i></b></p>
        <p className="dm-bub dm-bub-in">{t.hi}</p>
        <p className="dm-bub dm-bub-me">{t.hi2}</p>
      </div>
    </div>
  );
}

const ATT = {
  ko: { steps: ['앱 실행', '추적 허용 먼저 (로그인 전)', '알림 허용은 그다음'], alert: '"위밍"이 다른 회사의 앱 및 웹 사이트에 걸친 사용자의 활동을 추적하도록 허용하겠습니까?', ask: '앱에 추적 금지 요청', allow: '허용', login: '전화번호로 시작하기', notif: '"위밍"에서 알림을 보내고자 합니다.', no: '허용 안 함' },
  en: { steps: ['App opens', 'Tracking first (before login)', 'Notifications after'], alert: 'Allow "Weming" to track your activity across other companies\' apps and websites?', ask: 'Ask App Not to Track', allow: 'Allow', login: 'Start with your phone number', notif: '"Weming" would like to send you notifications.', no: 'Don\'t Allow' },
};

function AttDemo({ l }: { l: L }) {
  const t = ATT[l];
  return (
    <div className="dm dm-att" aria-hidden="true">
      <div className="dm-phone">
        <div className="dm-scr dm-scr-splash"><b>{l === 'ko' ? '위밍.' : 'Weming.'}</b></div>
        <div className="dm-scr dm-scr-login">
          <b>{l === 'ko' ? '위밍.' : 'Weming.'}</b>
          <span className="dm-field" />
          <span className="dm-btn">{t.login}</span>
        </div>
        <div className="dm-alert dm-alert-att"><p>{t.alert}</p><span>{t.ask}</span><span>{t.allow}</span></div>
        <div className="dm-alert dm-alert-noti"><p>{t.notif}</p><span>{t.no}</span><span>{t.allow}</span></div>
      </div>
      <ol className="dm-steps">{t.steps.map((s, i) => <li key={s} className={`dm-st dm-st${i}`}><span>{i + 1}</span>{s}</li>)}</ol>
    </div>
  );
}

export function Demo({ demo, l }: { demo: 'board' | 'instant' | 'att'; l: L }) {
  if (demo === 'board') return <BoardDemo l={l} />;
  if (demo === 'instant') return <InstantDemo l={l} />;
  return <AttDemo l={l} />;
}
