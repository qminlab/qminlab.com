/**
 * Trial-and-error pages (/<locale>/trials/<slug>/): one long page per project, version by version, in the shape of
 * the 소드마스터 notes' 버전 변화 tab (tried → what fell short → so the next version...).
 * Every line comes from the project's own record as of 2026-10-24: git history, the Weming handoff document
 * (docs/HANDOFF.md), the DeepHold decision log (docs/결정사항.md, docs/손맛비교_gen8_gen9.md) and the Claude Wait Board
 * README and commits. Nothing here is a guess; when the record has no reason for a change, the page gives none.
 * Never put internal values here: keys, IDs, IPs, folder paths, phone numbers, business numbers.
 */
import { gh } from '@/lib/identity';

export type TrialVersion = {
  /** Big label, e.g. "v1.0" or "빌드 7". */
  v: string;
  title: string;
  when: string;
  tried: string;
  /** Problems met along the way, each with what was done about it. */
  hit?: string[];
  /** What still fell short, the reason the next version exists. */
  short?: string;
  /** "So the next version..." line. */
  next?: string;
  /** The version in use now. */
  now?: boolean;
  /** Pictures, clips or small live demos shown with this version. */
  media?: TrialMedia[];
};

type Cap = { ko: string; en: string };
/** img/video live under public/ (paths from the site root). A demo is a small CSS animation drawn by the page. */
export type TrialMedia =
  | { kind: 'img'; src: string; w: number; h: number; alt: Cap; cap: Cap; pixel?: boolean; phone?: boolean }
  | { kind: 'video'; src: string; poster: string; w: number; h: number; alt: Cap; cap: Cap }
  | { kind: 'demo'; demo: 'board' | 'instant' | 'att'; cap: Cap };

export type TrialPage = {
  slug: string;
  code: string;
  name: string;
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  lead: string[];
  stats: { n: string; l: string }[];
  rule?: { title: string; body: string };
  versions: TrialVersion[];
  lessons?: { title: string; items: string[] };
  limits?: { title: string; items: string[] };
  links: { label: string; href: string }[];
};

export type TrialLabels = {
  back: string;
  jump: string;
  tried: string;
  hit: string;
  short: string;
  now: string;
  others: string;
  updated: string;
};

export const TRIAL_LABELS: Record<'ko' | 'en', TrialLabels> = {
  ko: { back: '← qminlab', jump: '버전', tried: '시도', hit: '부딪힌 문제', short: '아쉬운 점', now: '지금', others: '다른 시행착오', updated: '기록 기준' },
  en: { back: '← qminlab', jump: 'Versions', tried: 'What I tried', hit: 'What went wrong', short: 'What still fell short', now: 'Now', others: 'More trial and error', updated: 'Record as of' },
};

/** The date the records behind these pages were read. */
export const TRIALS_AS_OF = '2026-10-24';

const board: Record<'ko' | 'en', TrialPage> = {
  ko: {
    slug: 'claude-board',
    code: 'QL-005',
    name: 'Claude 대기판',
    meta: {
      title: 'Claude 대기판 시행착오 — 장치 0.2부터 1.2까지 · qminlab',
      description: '여러 Claude 작업을 아이패드에 띄우는 Claude 대기판을 공개 뒤 8일 동안 네 번 다시 짠 과정. 버전마다 무엇을 시도했고, 무엇이 어긋났고, 다음 버전에서 어떻게 바꿨는지 적었어요.',
    },
    eyebrow: 'FILE QL-005 / 생산성 도구 / 시행착오',
    title: 'Claude 대기판 시행착오',
    lead: [
      'Claude에게 일을 여러 개 맡기면 어느 대화가 끝났는지, 어느 대화가 권한 승인을 기다리며 멈춰 있는지 알 수 없었어요. 그래서 패스트푸드점 주문 대기판처럼 작업중 · 확인 필요 · 완료를 아이패드 한 화면에 띄우는 도구를 만들었어요.',
      '어려운 건 화면이 아니라 "지금 이 대화가 정말 사람을 기다리는가"를 맞히는 일이었어요. 공개한 날부터 8일 동안 그 판단을 맡은 장치를 0.2 → 1.0 → 1.1 → 1.2로 다시 짰어요.',
    ],
    stats: [
      { n: '4', l: '개 장치 버전 (0.2 · 1.0 · 1.1 · 1.2)' },
      { n: '8', l: '일 동안 (10.15 공개 ~ 10.22)' },
      { n: '13', l: '개 커밋' },
      { n: '10', l: '초 이상 막혀야 확인 필요 (처음엔 바로)' },
    ],
    rule: {
      title: '처음부터 정한 기준',
      body: '확인 필요는 "작업 도중 막혀서 사람이 처리해야 진행되는 경우"만이에요. 할 일을 마치고 "다음 단계로 갈까요?"라고 묻는 답이나, 버튼을 직접 누르라는 안내로 끝난 답은 완료예요. 아래의 모든 시행착오는 이 기준을 어떻게 정확히 지키느냐의 문제였어요.',
    },
    versions: [
      {
        v: '0.2',
        title: '대화가 스스로 판단하던 장치',
        when: '2026.10.15 · 첫 공개',
        tried: '맥에서 작은 Python 서버를 돌리고, 아이패드 Safari로 3칸 대기판을 띄웠어요. Claude Code는 훅으로, Claude 앱 대화는 대화마다 붙이는 자동 기록 장치(Claude 확장 모드)로 신호를 보냈어요. 이때는 장치가 직접 "작업중 · 확인 필요 · 완료" 중 어디인지 정해서 보냈어요.',
        hit: [
          '웹페이지 가져오기 같은 확인 창이 떠도 카드가 확인 필요로 바뀌지 않았어요. → 같은 날, 앱이 "사용자에게 묻기"로 판정한 도구는 모두 확인 필요로 올리게 고쳤어요.',
          '그러자 반대로, 미리 "항상 허용"해 둔 도구까지 빨간 카드가 됐어요. 판정은 똑같이 "묻기"로 나오는데 실제로는 창 없이 바로 실행되기 때문이에요. → 4초 기다려 보고 그 안에 실행이 끝나면 "미리 허용됨"으로 기억하고, 다음부터는 45초까지 기다리게 했어요.',
          '규칙이 대화마다 붙은 장치 안에 들어 있어서, 규칙을 한 번 고칠 때마다 열려 있는 모든 대화에서 /board 업데이트를 다시 해야 했어요.',
        ],
        short: '판단 규칙이 대화마다 흩어져 있어서, 고치기도 어렵고 대화마다 버전이 달라지기 쉬웠어요.',
        next: '그래서 1.0은 장치는 일어난 일만 보내고, 판단은 맥 서버 한곳에서 하기로 했어요.',
      },
      {
        v: '1.0',
        title: '판단은 맥 서버 한곳에서',
        when: '2026.10.15 ~ 10.21',
        tried: '장치는 턴 시작 · 권한 판정 · 도구 실행 끝 · 턴 끝 같은 날것의 신호만 보내고, 어느 칸에 둘지는 맥 서버가 정해요. 서버는 자기 파일이 바뀌면 스스로 다시 시작하기 때문에, 규칙을 고치면 열려 있는 모든 대화에 바로 적용돼요. 1.0 이상인 대화는 업데이트도 필요 없어졌어요.',
        hit: [
          '긴 작업 도중에 카드와 연결이 통째로 사라졌어요. 세션 종료 신호가 대화를 지울 때만 오는 줄 알았는데, 맥락 정리나 작업 환경 재시작 때도 왔어요. → 종료 신호로는 지우지 않고, 신호가 끊긴 카드만 시간이 지나면 정리하게 했어요. 작업중 카드는 긴 작업일 수 있어서 6시간까지 기다려요. (10.16)',
          '시간이 지나 카드를 정리하면 연결까지 끊겨서, 그 대화가 다시 일을 시작해도 카드가 안 떴어요. → 카드는 화면에서만 숨기고 연결은 30일 동안 유지해요. 새 신호가 오면 카드가 다시 떠요. (10.19)',
          '잠깐 묻고 바로 넘어가는 승인에도 화면 전체가 빨갛게 깜빡였어요. → 같은 작업에서 10초 이상 막혀 있을 때만 확인 필요로 옮겨요. (10.21)',
          '브라우저 도구는 한 번에 여러 동작을 해서 10초를 넘기기 쉬웠어요. → 브라우저 도구 묶음은 처음부터 미리 허용된 걸로 보고, "미리 허용됨" 기억도 도구 하나가 아니라 묶음 단위로 바꿨어요. (10.21)',
        ],
        short: '미리 허용된 도구인지를 "몇 초 안에 끝났나"로만 추측했어요. 그래서 원래 오래 걸리는 명령은 여전히 확인 필요로 잘못 갈 수 있었어요.',
        next: '그래서 1.1은 장치가 실제 실행 시간까지 보내서, 서버가 추측 대신 계산하게 했어요.',
      },
      {
        v: '1.1',
        title: '기다린 시간 = 전체 시간 − 실행 시간',
        when: '2026.10.22',
        tried: '실행 끝 신호에 실제 실행 시간을 같이 보내요. 서버는 "승인을 기다린 시간 = 전체 시간 − 실행 시간"으로 계산해서, 2.5초 넘게 기다렸으면 사람이 눌러 준 것이니 그 묶음은 "물어보는 도구"로 배워요. 미리 허용된 걸로 아는 도구는 180초까지 기다려서, 시간 제한이 걸린 긴 명령도 확인 필요로 가지 않아요. 아이패드 연결 탭에서 대기판에 보이는 이름을 바로 바꿀 수 있게도 했어요.',
        hit: [
          '어떤 Claude Code 세션은 대기판에 아예 붙지 않았어요. → 원인을 찾으려고, 훅 신호가 서버에 도착할 때마다 기록을 남기게 했어요.',
          '메시지를 이어서 보내면, 앞 명령이 끝나는 순간 카드가 완료로 갔어요. 뒤 명령이 이미 돌고 있는데도요.',
        ],
        short: '서버는 "이 대화의 턴이 끝났다"는 것만 알고, 어느 턴이 끝났는지는 몰랐어요. 메인 대화가 띄운 백그라운드 에이전트가 아직 일하는지도 몰랐어요.',
        next: '그래서 1.2는 턴마다 번호를 붙이기로 했어요.',
      },
      {
        v: '1.2',
        title: '턴 번호와 백그라운드 에이전트',
        when: '2026.10.22 ~ 지금',
        tried: '장치가 턴마다 번호를 붙여 보내요. 앞 명령이 끝나는 순간 그보다 나중에 시작한 턴이 아직 돌고 있으면 완료로 옮기지 않아요. 턴이 끝나도 백그라운드 에이전트가 돌고 있으면 작업중으로 둬요.',
        now: true,
      },
    ],
    limits: {
      title: '아직 못 푼 것',
      items: [
        'Claude 앱 대화의 신호는 Claude 쪽에서 맥까지 파일이 건너가는 데 2~4초가 걸려요. 연결 방식 자체의 시간이라 줄일 수 없어요. (Claude Code는 1초 안에 반영돼요.)',
        '휴대폰에서 연 대화는 기록되지 않아요. 맥과 연결된 데스크톱 앱 대화만 돼요.',
        '자동 기록 장치는 대화마다 한 번씩 허용해야 켜져요.',
        '대화를 지운 순간을 알 수 없어서, 신호가 끊긴 카드는 시간이 지나야 숨겨져요. 바로 치우려면 카드를 길게 눌러요.',
      ],
    },
    links: [
      { label: '케이스 파일 QL-005', href: '../../work/ql-005/' },
      { label: 'GitHub 저장소', href: gh('claude-board') },
    ],
  },
  en: {
    slug: 'claude-board',
    code: 'QL-005',
    name: 'Claude Wait Board',
    meta: {
      title: 'Claude Wait Board: trial and error, from 0.2 to 1.2 · qminlab',
      description: 'How the Claude Wait Board, an iPad board for every running Claude task, was rebuilt four times in the eight days after release: what each version tried, what went wrong, and what the next one changed.',
    },
    eyebrow: 'FILE QL-005 / PRODUCTIVITY TOOL / TRIAL AND ERROR',
    title: 'Claude Wait Board: trial and error',
    lead: [
      'With several Claude tasks running at once, I could not tell which chat had finished and which one was stuck waiting for me to approve something. So I built a pickup board for the iPad, like the one at a fast-food counter: Working, Needs attention, Done.',
      'The hard part was never the screen. It was answering one question correctly: is this chat really waiting for a person right now? In the eight days after release, the recorder that answers it went from 0.2 to 1.0, 1.1 and 1.2.',
    ],
    stats: [
      { n: '4', l: 'recorder versions (0.2 · 1.0 · 1.1 · 1.2)' },
      { n: '8', l: 'days (released 10.15 – 10.22)' },
      { n: '13', l: 'commits' },
      { n: '10', l: 'seconds stuck before "needs attention" (at first: none)' },
    ],
    rule: {
      title: 'The rule from day one',
      body: '"Needs attention" means only one thing: the task is stuck mid-way and a person has to act before it can go on. A reply that finishes the job and asks "shall I go to the next step?", or ends by asking me to press a button, is Done. Every problem below is about keeping that rule exactly.',
    },
    versions: [
      {
        v: '0.2',
        title: 'Each chat judged for itself',
        when: '2026.10.15 · first release',
        tried: 'A small Python server on the Mac, and a three-lane board in Safari on the iPad. Claude Code sent signals through hooks; each Claude app chat got its own recorder (a Claude extension mod). In this version the recorder itself decided whether the chat was Working, Needs attention or Done.',
        hit: [
          'Confirmation prompts such as "fetch this web page" did not turn the card red. → The same day, every tool the app judged as "ask the user" started going to Needs attention.',
          'Then the opposite happened: tools I had set to "always allow" turned red too. The judgement still says "ask", but the tool runs at once without a prompt. → Wait 4 seconds; if the tool finishes in time, remember it as pre-allowed and wait up to 45 seconds for it from then on.',
          'The rules lived inside every chat\'s recorder, so each rule change meant running /board update again in every open chat.',
        ],
        short: 'The judging rules were scattered across chats, hard to change and easy to let drift apart.',
        next: 'So 1.0 made the recorder report only what happened, and moved every decision to one place: the Mac server.',
      },
      {
        v: '1.0',
        title: 'One judge, on the Mac',
        when: '2026.10.15 – 10.21',
        tried: 'The recorder sends raw events only: turn start, permission check, tool finished, turn end. The Mac server decides which lane a card belongs in, and restarts itself when its file changes, so a rule fix reaches every open chat at once. Chats on 1.0 or later never need updating again.',
        hit: [
          'Cards and links vanished in the middle of long tasks. I assumed the session-end signal meant the chat was deleted, but it also fires when context is compacted or the environment restarts. → Session end no longer deletes anything; only cards whose signals stop are tidied away later, and Working cards get six hours because long jobs are real. (10.16)',
          'Tidying an old card also cut its link, so the chat\'s card never came back when it started working again. → Cards are now only hidden; the link stays for 30 days and the card returns with the next signal. (10.19)',
          'A prompt that was approved a moment later still flashed the whole screen red. → A task moves to Needs attention only after it has been stuck for 10 seconds. (10.21)',
          'Browser tools do several actions in one call and easily run past 10 seconds. → The browser tool family counts as pre-allowed from the start, and the "pre-allowed" memory now works per tool family, not per tool. (10.21)',
        ],
        short: 'The server still guessed whether a tool was pre-allowed from "did it finish within a few seconds". Commands that are simply slow could still land in Needs attention by mistake.',
        next: 'So 1.1 had the recorder send the real run time, and the server calculate instead of guess.',
      },
      {
        v: '1.1',
        title: 'Time waiting = total time − run time',
        when: '2026.10.22',
        tried: 'The "tool finished" event now carries the tool\'s actual run time. The server works out how long it waited for approval as total time minus run time. Over 2.5 seconds means a person pressed the button, so that tool family is learned as one that asks. Tools known to be pre-allowed get 180 seconds, so even long commands with a timeout stay out of Needs attention. The iPad link tab also got a rename button.',
        hit: [
          'Some Claude Code sessions never showed up on the board. → To find out why, the server now logs every hook signal that arrives.',
          'When I sent messages back to back, the card went to Done the moment the first command ended, even though the next one was already running.',
        ],
        short: 'The server knew that a turn had ended, but not which turn. It also could not see background agents the main chat had started.',
        next: 'So 1.2 numbers every turn.',
      },
      {
        v: '1.2',
        title: 'Turn numbers and background agents',
        when: '2026.10.22 – now',
        tried: 'The recorder numbers each turn. When a command ends while a later turn is still running, the card stays in Working. If background agents are still running when a turn ends, the card stays in Working too.',
        now: true,
      },
    ],
    limits: {
      title: 'Not solved yet',
      items: [
        'Signals from Claude app chats take 2 to 4 seconds to reach the Mac. That is the transport itself and cannot be shortened. (Claude Code shows up within a second.)',
        'Chats opened on a phone are not recorded; only desktop app chats connected to the Mac are.',
        'The recorder has to be allowed once in every chat.',
        'There is no way to know when a chat is deleted, so a silent card is hidden only after a while. A long press clears it at once.',
      ],
    },
    links: [
      { label: 'Case file QL-005', href: '../../work/ql-005/' },
      { label: 'GitHub repository', href: gh('claude-board') },
    ],
  },
};

const weming: Record<'ko' | 'en', TrialPage> = {
  ko: {
    slug: 'weming',
    code: 'QL-001',
    name: '위밍',
    meta: {
      title: '위밍 시행착오 — 첫 MVP부터 App Store 출시까지 · qminlab',
      description: '친구 찾기 앱 위밍을 9월 30일부터 만들며 겪은 일. 첫 MVP, 출시 준비, 두 번의 App Store 거절과 고친 방법, App Store 출시와 Google Play 심사까지 버전별로 적었어요.',
    },
    eyebrow: 'FILE QL-001 / 앱 / 시행착오',
    title: '위밍 시행착오',
    lead: [
      '위밍은 새로운 사람과 편하게 이야기하는 친구 찾기 앱이에요. 익명 피드 · 스토리 · 쪽지, 그리고 처음 만난 사람과 3분 동안 이야기하는 "바로 대화"가 있어요.',
      '2026년 9월 30일에 시작해서 10월 8일까지는 Claude와 한 대화에서 1,041턴을 주고받으며 만들었어요. 대화 안에서 고친 판은 v152까지 나왔고, App Store에는 두 번 거절당했어요. 그 과정을 큰 단계로 나눠 적었어요.',
    ],
    stats: [
      { n: '1,041', l: '턴 (한 대화, 9.30 ~ 10.8)' },
      { n: 'v152', l: '대화에서 낸 마지막 판 번호' },
      { n: '2', l: '번 App Store 거절' },
      { n: '9', l: '번째 빌드로 App Store 출시' },
    ],
    versions: [
      {
        v: 'MVP',
        title: '돌아가는 기능부터',
        when: '2026.09.30 ~ 10.01 · v1 ~ v42',
        tried: 'Expo로 프로젝트를 만들고 전화번호 인증 · 프로필 · 1:1 매칭 대화부터 만들었어요. 이어서 유저 탭, 익명 피드, 스토리와 스토리 편집기, 쪽지, 음성 녹음, 차단, 알림, 탈퇴, 설정, 약관까지 이틀 만에 들어갔어요. 디자인은 네 번 다시 해서 지금의 다크 디자인과 글꼴을 정했어요.',
        hit: [
          '로그인은 익명 로그인, 본인인증은 PASS로 시작했다가 둘 다 버리고 전화번호 문자 인증으로 정했어요.',
          '관리자 기능을 앱 안에 넣었는데, 나중에 별도 관리자 웹사이트로 떼어 냈어요.',
          '무료 쪽지를 하루 30개로 시작했다가 3개로 줄였어요.',
        ],
        short: '기능은 다 돌아갔지만 결제 · 광고 · 제재 · 안드로이드처럼 실제로 출시해서 운영하는 데 필요한 것이 없었어요.',
        next: '그래서 다음 판들은 "출시할 수 있는 앱"을 목표로 했어요.',
      },
      {
        v: 'v50+',
        title: '출시할 수 있는 앱으로',
        when: '2026.10.02 ~ 10.03 · v50 ~ v99',
        tried: '안드로이드 대응, 보안 · 어뷰징 · 다계정 막기(한 기기 한 계정), RevenueCat 결제, 말풍선 반응 · 답장 · 입력 중 표시, 3D 큐브로 넘기는 스토리를 넣었어요. 관리자는 별도 웹사이트로 옮겨 역할별 권한 · 운영 기록 · 기간별 · 기능별 제재를 만들고, AdMob 광고를 붙였어요.',
        hit: [
          '피드 카드 디자인을 네 번 갈아엎었어요. 목록형(v88) → 시안 카드(v89) → 작은 카드(v90) → 넓고 덜 둥근 카드(v92).',
          '고친 파일을 전달하다가, 직접 넣어 둔 결제 설정 값을 빈 값으로 덮어써서 결제가 멈췄어요. → v75에서 되살리고, 사용자가 채운 값이 있는 파일은 덮어쓰지 않는다는 규칙을 만들었어요.',
          '광고가 왜 안 나오는지, 상품이 왜 안 불러와지는지 알 수 없었어요. → 안 보여 주는 이유와 못 받은 이유를 남기는 진단 기록과 운영자 전용 결제 진단 버튼을 만들었어요.',
          '상품 ID를 App Store Connect에 등록한 이름에 맞춰 다시 바꿨어요(v79).',
        ],
        short: '스토어 심사 기준에 맞는지는 제출해 보고서야 알 수 있었어요.',
        next: '그래서 10월 3일, 1.0.0을 심사에 냈어요.',
      },
      {
        v: '빌드 6',
        title: '첫 심사와 첫 거절',
        when: '2026.10.03 ~ 10.04',
        tried: '빌드 5로 처음 제출했어요. Apple이 신규 개발자 계정에 추가 정보를 요청해서, 실기기 녹화 영상과 질문 여섯 개에 대한 영어 답변을 붙여 빌드 6으로 다시 냈어요.',
        hit: [
          '10월 4일 거절. 이유는 세 가지였어요.',
          '가이드라인 2.1(b): 앱 안에서 파는 상품을 앱과 함께 심사에 내지 않았어요.',
          '가이드라인 1.2: 처음 만난 사람과 이어 주는 채팅은 대화 전에 상대 정보를 보여 주고 수락 · 거절 · 건너뛰기를 고를 수 있어야 하고, 신고를 24시간 안에 처리해야 하고, 스토어 설명에 "무작위 채팅" 같은 표현을 쓰면 안 됐어요.',
          '가이드라인 2.5.4: 쓰지 않는 백그라운드 오디오 권한이 켜져 있었어요.',
        ],
        short: '앱의 핵심인 바로 대화가 "아무 정보 없이 모르는 사람과 바로 이어지는" 구조였어요.',
        next: '그래서 바로 대화를 숨기는 대신(A안), 기능을 살린 채 다시 설계하는 B안을 골랐어요.',
      },
      {
        v: '빌드 7',
        title: '바로 대화를 다시 설계',
        when: '2026.10.04 ~ 10.20',
        tried: '매칭되면 서로의 프로필 카드(닉네임 · 성별 · 나이 · 지역 · 소개 · 사진)를 20초 동안 보여 주고, 둘 다 수락해야 대화방이 열리게 바꿨어요. 대화는 1분에서 3분으로 늘렸어요. 연락처나 다른 앱으로 옮기자는 말은 서버가 찾아내서 보낸 사람에게만 경고를 보여 주고 자동으로 신고해요. 약관에 신고 24시간 처리를 넣고, 스토어 문구에서 "랜덤" 표현을 모두 뺐어요. 상품 9개를 앱과 같은 제출에 담고 데모 영상과 영어 답변을 붙여 다시 냈어요.',
        hit: [
          '연락처 감지는 처음에 보내기 전에 경고했다가 버렸어요. 보낸 뒤 말풍선 아래에 안내하는 방식으로 바꾸고, 초성과 우회 표현도 잡게 했어요.',
          '두 사람의 타이머가 서로 달랐어요. "둘 다 준비되면 시작" 대신 서버 시계에 맞추는 방식으로 고쳤어요.',
          '다시 낼 때 실수로 앱만 제출해서, 심사에서 빼고 상품 9개와 앱을 같은 초안에 담아 다시 냈어요.',
          '그사이 갤럭시 대응(진동 · 키보드 · 뒤로가기), 화면 최적화 5단계, 서버 비용 줄이기(항상 켜 두던 인증 서버 끄기, 임시 기록 자동 삭제)를 했어요.',
          'Google Play 계정이 10월 6일 승인돼 내부 테스트를 시작했고, 받은 쪽지 화면에서 뒤로가기가 안 되는 버그를 찾아 고쳤어요. 10월 8일에는 비공개 테스트 검토를 통과했어요.',
          '한 대화가 1,041턴까지 길어져서 10월 7일 작업을 Claude Code로 옮겼어요. 대화 전체를 구간별로 다시 읽어 "무엇을 왜 정했는지"를 인수인계 문서로 남기고, 대화에서 전달한 변경 197개가 코드에 다 들어갔는지 하나씩 대조했어요.',
        ],
        short: '10월 20일, 두 번째 거절. 앱이 광고 추적 허용(ATT)을 쓰는데 심사팀이 그 창을 찾지 못했어요. 로그인하고 2.5초 뒤에 물어봤는데, 같은 때 알림 허용 창이 먼저 떠서 iOS가 추적 창을 건너뛰었던 거예요.',
        next: '그래서 빌드 9는 앱을 켜자마자, 로그인 전에 묻기로 했어요.',
      },
      {
        v: '빌드 9',
        title: '로그인 전에 묻기',
        when: '2026.10.21 ~ 지금',
        tried: '앱을 켜면 로그인 화면이 뜨기 전, 앱이 활성 상태가 되고 1초 뒤에 추적 허용을 물어요. 창이 안 떴으면 한 번 더 묻고, 알림 허용과 광고 시작은 그다음이에요. 같은 빌드에서 다른 거절 위험도 미리 고쳤어요. 위치 권한을 거부하면 지역을 직접 고를 수 있고, 사진은 사진첩 전체 권한 없이 시스템 선택기로만 골라요. 캡처 방지는 로그인한 뒤부터 켜서 심사용 녹화를 찍을 수 있게 했어요.',
        hit: [
          '새로 설치 → 로그인 화면 위에 추적 창 → 거부 → 로그인 화면까지 8초짜리 실기기 녹화를 찍어 심사 답변에 붙였어요.',
          '거절된 제출 상태에서는 인앱 상품 칸이 안 보이고 다시 제출도 막혀 있어서, 거절 건을 취소하고 새 초안에 앱과 상품을 모두 담아 10월 21일 다시 냈어요.',
          'Android는 10월 23일 Google Play 프로덕션 출시 신청이 접수됐어요.',
          '그리고 App Store 심사를 통과해 10월 30일 한국 App Store에 출시했어요. Google Play는 아직 심사 중이에요.',
        ],
        now: true,
      },
    ],
    lessons: {
      title: '만들면서 생긴 사고와 배운 것',
      items: [
        '여러 줄 명령이 한 줄로 붙어 실행되면서 서버 코드 폴더가 지워졌어요. git으로 되살렸고, 그 뒤로 지우는 명령은 따로 한 줄씩 실행해요.',
        '설정 파일에 줄을 덧붙이다 두 줄이 붙어서 관리자 사이트가 서버에 연결되지 않았어요. 그 뒤로 설정 파일은 직접 열어 고쳐요.',
        '서버 배포를 빠뜨려서 심사용 계정 로그인이 실패했어요. 그 뒤로 변경마다 "서버 배포 필요"를 따로 적어요.',
        'TestFlight로 설치한 앱이 개발용 앱을 덮어써서, 고친 게 아이폰에 반영되지 않는 줄 알았어요.',
        '판매 지역을 대한민국으로만 해 두었더니, 미국 계정에서는 상품이 하나도 안 보였어요.',
        '"코드에 들어갔는지"와 "값이 맞는지"는 달랐어요. 197개 변경이 모두 들어간 걸 확인한 뒤에도, 광고 단위 값이 틀려서 이전 빌드에서는 실제 광고가 안 나왔을 수 있다는 걸 찾았어요.',
      ],
    },
    links: [
      { label: '케이스 파일 QL-001', href: '../../work/ql-001/' },
      { label: 'GitHub 소개 저장소', href: gh('weming') },
    ],
  },
  en: {
    slug: 'weming',
    code: 'QL-001',
    name: 'Weming',
    meta: {
      title: 'Weming: trial and error, from first MVP to App Store release · qminlab',
      description: 'What happened while building Weming, a friend-finding app, since September 30: the first MVP, getting ready to ship, two App Store rejections and how each was fixed, the App Store release and Google Play review.',
    },
    eyebrow: 'FILE QL-001 / APP / TRIAL AND ERROR',
    title: 'Weming: trial and error',
    lead: [
      'Weming is a friend-finding app for talking to new people without the pressure: an anonymous feed, stories, notes, and Instant Chat, three minutes with someone you have just met.',
      'I started on September 30, 2026. Until October 8 it was a single conversation with Claude, 1,041 turns long, with changes numbered up to v152. The App Store rejected it twice. Here is that story in big steps.',
    ],
    stats: [
      { n: '1,041', l: 'turns in one chat (9.30 – 10.8)' },
      { n: 'v152', l: 'last change number in that chat' },
      { n: '2', l: 'App Store rejections' },
      { n: '9th', l: 'build, released on the App Store' },
    ],
    versions: [
      {
        v: 'MVP',
        title: 'Working features first',
        when: '2026.09.30 – 10.01 · v1 – v42',
        tried: 'An Expo project with phone verification, profiles and one-to-one matching came first. In two days the users tab, anonymous feed, stories with a story editor, notes, voice recording, blocking, notifications, account deletion, settings and terms followed. The design was redone four times before the current dark look and typeface were settled.',
        hit: [
          'Sign-in started as anonymous login and identity checks started with a carrier verification service (PASS). Both were dropped for phone number SMS verification.',
          'Admin tools were built into the app at first, then moved out to a separate admin website.',
          'Free notes started at 30 a day and came down to 3.',
        ],
        short: 'Everything worked, but nothing needed to actually ship and run an app was there yet: payments, ads, moderation, Android.',
        next: 'So the next rounds aimed at an app that could ship.',
      },
      {
        v: 'v50+',
        title: 'An app that can ship',
        when: '2026.10.02 – 10.03 · v50 – v99',
        tried: 'Android support, security and abuse checks, one account per device, RevenueCat payments, message reactions, replies and typing indicators, and stories that turn like a 3D cube. Admin moved to its own website with roles, an audit log and time-limited, per-feature sanctions. AdMob ads went in.',
        hit: [
          'The feed card design was thrown out four times: a list (v88) → the mockup card (v89) → small cards (v90) → wider, less rounded cards (v92).',
          'A delivered update overwrote a payment setting I had filled in by hand with an empty value, and purchases stopped. → Restored in v75, with a new rule: never overwrite a file that holds values the user entered.',
          'There was no way to see why ads did not show or products did not load. → Diagnostic logs for both, plus an operator-only payment check button.',
          'Product IDs were renamed to match what was registered in App Store Connect (v79).',
        ],
        short: 'Whether it met the store\'s review rules could only be learned by submitting.',
        next: 'So on October 3, version 1.0.0 went in for review.',
      },
      {
        v: 'Build 6',
        title: 'First review, first rejection',
        when: '2026.10.03 – 10.04',
        tried: 'Build 5 was the first submission. Apple asked the new developer account for more information, so build 6 went back with a screen recording on a real phone and English answers to six questions.',
        hit: [
          'Rejected on October 4, for three reasons.',
          'Guideline 2.1(b): the in-app products were not submitted together with the app.',
          'Guideline 1.2: a chat that connects strangers must show who the other person is before the chat, let you accept, decline or skip, handle reports within 24 hours, and keep phrases like "random chat" out of the store listing.',
          'Guideline 2.5.4: a background audio permission was on but never used.',
        ],
        short: 'Instant Chat, the heart of the app, connected you to a stranger straight away with nothing to go on.',
        next: 'So instead of hiding Instant Chat (plan A), I chose plan B: keep it and redesign it.',
      },
      {
        v: 'Build 7',
        title: 'Instant Chat, redesigned',
        when: '2026.10.04 – 10.20',
        tried: 'A match now shows both profile cards (nickname, gender, age, region, bio, photos) for 20 seconds, and the room opens only if both accept. Chats went from one minute to three. When someone tries to move the chat to a phone number or another app, the server spots it, warns only the sender and files a report automatically. The terms now promise reports are handled within 24 hours, and every "random" phrase left the store listing. The nine products went into the same submission as the app, with a demo video and an English reply.',
        hit: [
          'Contact detection first warned before sending; that was dropped for a note under the message after sending, and it learned initials-only spellings and workarounds.',
          'The two people\'s timers disagreed. "Start when both are ready" was replaced by syncing to the server clock.',
          'On resubmitting I accidentally sent only the app, so I pulled it from review and resubmitted the app and all nine products in one draft.',
          'Meanwhile: Galaxy fixes (vibration, keyboard, back gesture), five rounds of screen performance work, and lower server costs (no always-on auth server, temporary records that delete themselves).',
          'The Google Play account was approved on October 6. Internal testing found a missing back gesture on the received-notes screen, which was fixed, and the closed test passed review on October 8.',
          'The single chat had reached 1,041 turns, so on October 7 the work moved to Claude Code. The whole conversation was re-read section by section into a handoff document of what was decided and why, and all 197 changes delivered in chat were checked against the code one by one.',
        ],
        short: 'October 20, the second rejection. The app uses App Tracking Transparency, but the reviewer never saw its prompt. It was asked 2.5 seconds after login, the notification prompt came up first, and iOS skipped the tracking prompt.',
        next: 'So build 9 asks the moment the app opens, before login.',
      },
      {
        v: 'Build 9',
        title: 'Ask before login',
        when: '2026.10.21 – now',
        tried: 'When the app opens, before the login screen, it waits until it is active, then one more second, and asks for tracking permission. If no prompt appeared, it asks once more; the notification prompt and ads come after. The same build fixed other review risks ahead of time: if you deny location you can pick your region by hand, photos are chosen through the system picker without access to the whole library, and screenshot blocking starts only after login so the review recording could be made.',
        hit: [
          'An 8-second recording on a real phone (fresh install → tracking prompt over the login screen → deny → login screen) went into the reply to review.',
          'While a submission sits rejected, the in-app products section disappears and resubmitting is blocked, so the rejected submission was cancelled and the app and products went into a new draft, resubmitted on October 21.',
          'On Android, the request for Google Play production access was received on October 23.',
          'Then it passed App Store review and was released on the Korean App Store on October 30. Google Play is still in review.',
        ],
        now: true,
      },
    ],
    lessons: {
      title: 'Accidents along the way, and what they taught',
      items: [
        'Several commands ran together as one line and deleted the server code folder. Git brought it back; since then, delete commands run alone, one per line.',
        'Appending a line to a settings file glued two lines together and the admin site could no longer reach the server. Since then, settings files are edited by hand.',
        'A missed server deploy made the review account\'s login fail. Since then, every change says whether it needs a server deploy.',
        'Installing from TestFlight replaced the development app, which made it look as if fixes were not reaching the iPhone.',
        'With sales limited to South Korea, a US account saw no products at all.',
        '"The code is in" and "the values are right" are different checks. Even after all 197 changes were confirmed, the ad unit values turned out to be wrong, so earlier builds may never have shown real ads.',
      ],
    },
    links: [
      { label: 'Case file QL-001', href: '../../work/ql-001/' },
      { label: 'GitHub intro repository', href: gh('weming') },
    ],
  },
};

const deephold: Record<'ko' | 'en', TrialPage> = {
  ko: {
    slug: 'deephold',
    code: 'QL-004',
    name: '딥홀드',
    meta: {
      title: '딥홀드 시행착오 — v0.1부터 v0.6까지 · qminlab',
      description: '하드코어 2.5D 도트 액션 게임 딥홀드를 10일 동안 v0.1에서 v0.6까지 올리며 부딪힌 문제들. 버전마다 무엇을 시도했고, 무엇이 어긋났고, 다음 버전에서 어떻게 바꿨는지 적었어요.',
    },
    eyebrow: 'FILE QL-004 / 게임 / 시행착오',
    title: '딥홀드 시행착오',
    lead: [
      '딥홀드는 장비도 레벨도 없이 세 번 맞으면 끝나는 하드코어 2.5D 도트 액션 게임이에요. 모든 공격에 예고를 넣어서, 죽으면 내 실수라고 느끼게 만드는 게 목표예요.',
      '10월 15일 기획서를 쓰고 10일 동안 v0.1에서 v0.6.3까지 올렸어요. 기능을 넣을 때마다 밸런스 · 판정 · 파티 렉 · 서버가 차례로 문제가 됐어요. 버전마다 무엇이 어긋났고 다음 버전에서 어떻게 바꿨는지 적었어요.',
    ],
    stats: [
      { n: '10', l: '일 (10.15 기획 → 10.24 v0.6.3)' },
      { n: '28', l: '번 태그 단 버전 (v0.2.0 ~ v0.6.3)' },
      { n: '453', l: '개 커밋' },
      { n: 'gen 11', l: '지금 던전 규칙 번호' },
    ],
    rule: {
      title: '규칙을 바꿀 때마다 지킨 약속',
      body: '게임 규칙은 화면과 떼어 60Hz 고정 틱으로 돌려요. 같은 시드와 같은 입력이면 늘 같은 결과가 나와서, 서버가 입력 기록을 다시 돌려 기록이 진짜인지 확인하고 그 기록이 그대로 리플레이가 돼요. 그래서 결과가 달라지는 수정을 할 때마다 던전 규칙 번호(gen)를 올리고, 옛 리플레이는 옛 규칙으로 똑같이 재생되게 나눠 뒀어요. v0.3.4에서 처음 만든 이 번호가 v0.6.2에서 11이 됐어요.',
    },
    versions: [
      {
        v: 'v0.1',
        title: '규칙부터 만든 첫 빌드',
        when: '2026.10.15 ~ 10.16 · 개발 단계 M1 ~ M9',
        tried: '기획서에 다섯 원칙(성장 없음 · 세 번 맞으면 끝 · 어렵게 · 억울하지 않게 · 같은 몬스터는 같은 패턴)과 몬스터 50종 · 보스 5종 · 경제 · 내 던전 규칙을 정리했어요. 그다음 화면 없이 도는 규칙 코어를 먼저 짜고, 몬스터 36종은 에이전트 4개가 나눠서 동시에 만들었어요. 보스 5종, 마을 · 소환 · 폐광산, 내 던전 편집기, 기록 검증 서버, 데스크톱 앱 포장까지 이어 붙였어요.',
        hit: [
          '서버를 Supabase 무료 플랜으로 시작했는데, 서버 함수가 요청 한 번에 CPU 2초까지만 돼서 기록 검증을 1만 5천 틱씩 잘라 여러 번에 나눠 돌려야 했어요.',
          '데스크톱 앱 포장은 작업 환경에서 npm에 접속할 수 없어서, 설정만 만들고 실행은 확인하지 못한 채 넘어갔어요.',
          '그림이 아직 없는 자리는 같은 크기의 단색 도형으로 대신했어요.',
        ],
        short: '혼자 하는 원정의 뼈대는 섰지만 그림 · 소리 · 마을이 임시였고, 친구와 같이 할 방법이 없었어요.',
        next: '그래서 v0.2는 그림과 소리를 붙이고 마을과 광장을 새로 만들었어요.',
      },
      {
        v: 'v0.2',
        title: '그림을 붙이고 친구에게 보내기',
        when: '2026.10.16 ~ 10.17 · 업데이트 2 ~ 5',
        tried: '그림 848장 · 효과음 · 음악을 연결하고, 기록관(도감) · 저주 · 유물 · 업적 250개 · 꾸미기 · 오늘의 심연을 넣었어요. 마을은 새 그림으로 다시 만들고 마을 안에서도 베고 구를 수 있게 했어요. 광장 · 채팅 · 감정 표현, 마을 창 UI v2, 경제와 폐광산 개편이 같이 들어갔어요. 깃허브 릴리스로 자동 업데이트를 붙이고, 배포처를 공개 저장소로 따로 떼어 코드 저장소를 비공개로 돌릴 준비를 했어요.',
        hit: [
          '옛 마을 그림과 새 마을 그림에 이름이 같은 애니메이션이 있어서 시험이 깨졌어요. → 옛 마을 그림은 아예 불러오지 않게 했어요.',
          '자동 빌드가 실패했어요. 빌드에 필요한 자동 생성 데이터가 저장소에 없었고, 릴리스를 만들기 전에 파일을 올리려다 오류가 났어요. → 생성 데이터를 넣고, 릴리스를 먼저 만든 뒤 파일을 올리게 바꿨어요.',
          '베는 도중에는 구르기를 쓸 수 없었어요. → 베기를 그 자리에서 끊고 구르는 평타 캔슬을 핵심 규칙으로 바꿔 넣었어요. 던전과 마을 모두요.',
        ],
        short: '여전히 혼자 하는 게임이었고, 원정 규칙과 경제는 아직 대충 맞춘 숫자였어요.',
        next: '그래서 v0.3(업데이트 6)은 파티와 원정 규칙을 한꺼번에 다시 짰어요.',
      },
      {
        v: 'v0.3',
        title: '업데이트 6: 같이 내려가기',
        when: '2026.10.17',
        tried: '실시간 파티 · 같이 던전 · 친구 코드를 넣고, 원정 규칙(바이옴 · 보스층 · 사망 손실 · 보험 · 연습 · 랭킹 시즌 2)과 경제(제련소 · 괴 가격)를 다시 짰어요. 화면은 1080 해상도와 설정 창을 새로 만들고, 운영자 페이지 1단계를 열었어요.',
        hit: [
          '글자 크기를 3단계로 고를 수 있게 했더니 마을 창 · 입력창 곳곳에서 글이 넘치고 겹쳤어요. 크기 계산 시험을 만들어 겹침을 하나씩 고치다가 → 결국 글자 크기 대신 "UI 크기"로 바꿔서, 창 전체를 창 카메라로 한꺼번에 키우고 줄였어요. 긴 설명은 자르지 않고 휠로 넘겨 봐요. (v0.3.1)',
          '폐광산에서 한 방향으로 계속 캐기만 하는 자동 채굴이 가능했어요. → 위 갱도에 못 캐는 암반을 한 칸씩 흩어 놓았어요. 매크로 판정은 캐기 키를 누르고 뗄 때만 보게 고쳐서 오판정을 줄였어요.',
          '경제 숫자도 다시 맞췄어요. → 광물 수입을 1/3로 줄이고, 사망 손실은 1층 75%에서 층마다 낮아져 21층부터 50%가 되게 했어요. 판매가가 바뀐 몫은 처음 켤 때 한 번 보상했어요.',
          '저장 시험이 될 때도 있고 안 될 때도 있었어요. 서버 시작 기록이 시험 도구의 출력에 끼어들고 있었어요.',
        ],
        short: '파티를 넣자 렉이 생겼는데, 어디서 느려지는지 잴 도구가 없었어요. 숫자를 바꿔도 실제로 어떻게 플레이되는지 볼 기록도 없었어요.',
        next: '그래서 v0.4는 재는 것부터 시작했어요. 플레이 기록, 렉 측정, 그리고 규칙 번호.',
      },
      {
        v: 'v0.4',
        title: '재고, 기록하고, 되돌리기',
        when: '2026.10.17 ~ 10.19 · v0.4.0 ~ v0.4.11',
        tried: '플레이 기록을 서버에 90일 남기고 운영자 페이지에 유저별 기록 · 통계를 붙였어요. 파티 렉 측정 화면(틱 · 빛 계산 · 입력 도착 지연)을 만들고, 결과가 달라지는 수정마다 던전 규칙 번호(gen)를 올리기 시작했어요. 숨은 방 · 빈 공간, 엠블럼 · 칭호, 쉬운 모드, 소환 확률 공개, 폐광산 좀벌레가 이때 들어갔어요.',
        hit: [
          '파티 렉: 동료 랜턴의 빛줄기 계산이 무거웠어요. → 빛줄기 120개를 40개로 줄이고, 안 움직이면 지난 결과를 다시 써요. 입력 지연은 판 도중 6~12틱 사이에서 자동으로 맞춰요.',
          '기록 검증이 파티 중계와 같은 줄에서 돌아서 검증하는 동안 파티가 멈칫했어요. → 검증을 따로 작업자 스레드로 떼어 냈어요. (v0.4.11)',
          '서버 설정 때문에 60분마다 웹소켓이 끊겼어요. → 판 도중 끊기면 9초 동안 자리를 잡아 두고, 다시 붙으면 같은 방 · 같은 틱에서 이어 가요.',
          '폐광산 깊은 갱도 광맥을 10% → 5% → 다시 10%로 바꿨다가, 결국 v0.4.1 방식으로 되돌리고 광맥 수만 36개에서 200개로 늘렸어요. 하루 사이에 네 번 바꿨어요.',
          '무너지는 바닥이 길을 끊고(gen 5), 던전 소품이 길을 막았어요(gen 6). 둘 다 생성 단계에서 길을 검사하게 고쳤어요.',
          '좀벌레를 공격 키로 톡 쳐서는 잘 안 맞았어요. → 한 번 휘두르면 끝까지 휘둘러 맞게 하고, 닿는 거리 · 휘두르는 각도 · 물린 뒤 멈춤을 두 번 다시 맞췄어요.',
          '랜턴 기름은 한 판 1병 · 하루 3병 한도, 1~3층 초반 사망 환급, 자동 충전 20분 · 2병 → 30분 · 5병으로 계속 손봤어요.',
        ],
        short: '숫자를 바꾸고, 출시하고, 해 보고, 되돌리는 일이 반복됐어요.',
        next: '그래서 v0.5는 몬스터 · 보스 · 유물을 그 자리에서 바꿔 가며 시험하는 개발자 실험실부터 만들었어요.',
      },
      {
        v: 'v0.5',
        title: '실험실, 그리고 용광로',
        when: '2026.10.19 · v0.5.0 ~ v0.5.4',
        tried: '개발자 실험실에서 몬스터를 불러내고, 보스 페이즈를 고르고, 무적을 켜고, 유물을 바로 붙여 볼 수 있게 했어요. 유물 30종이 실제로 발동하는지는 자동으로 검사해요. 업적 점수 5단계와 고유 엠블럼, 스팀 빌드 준비, 경고 · 정지 화면이 들어갔어요. 두 번째 보스 "멈추지 않는 용광로"를 손질했어요. 체력은 50타에서 36타로, 화구가 열려도 3타까지만.',
        hit: [
          '용광로를 두 번째로 만나면 게임이 멈췄어요. 이미 지운 그림을 다시 쓰려고 해서였어요. → 한 시간 안에 v0.5.3으로 고쳤어요.',
          '냉각 밸브 예고가 다 차도 피해가 없었어요. → 다 차면 증기가 터져 1 피해를 줘요.',
          '과열 때 쇳물을 묶음으로 떨어뜨렸다가, 12개 연속 · 노리는 순서 · 고리 무작위로 다시 짰어요. (v0.5.4, gen 9)',
          '블록 깨지는 효과를 넣자 같은 종류의 다른 블록이 쪼그라들었어요. 폐광산 어둠에는 영웅을 따라다니는 가는 세로선이 생겼어요. → 어둠을 한 장으로 칠하고 빛 모양만 지우는 방식으로 바꿨어요.',
          '빌드할 때마다 충돌 데이터를 새로 만들었는데, 컴퓨터마다 결과가 달라 봇 길목이 막히고 건물 판정이 틀린 적이 있었어요. → 빌드는 저장소에 있는 값을 그대로 쓰고, 다시 만들기는 따로 명령으로 해요.',
        ],
        short: '판정이 여전히 동그라미와 네모 어림이라, 보이는 곳을 쳐도 안 맞거나 예고 장판 밖에서 맞는 일이 있었어요.',
        next: '그래서 v0.6은 판정을 그림 모양 그대로 바꾸기로 했어요.',
      },
      {
        v: 'v0.6.0',
        title: '그림대로 맞는다, 그리고 너무 어려워졌다',
        when: '2026.10.20 ~ 10.21',
        tried: '몬스터 · 보스 · 주인공 · 임팩트 그림에서 맞는 판과 때리는 판의 초안을 자동으로 뽑고, 손으로 칠한 것과 합쳐 게임 규칙에 넣었어요(gen 9). 예고가 있는 공격은 판을 예고 범위 안으로 잘랐어요. 사람처럼 보고 반응하고 실수하는 봇으로 1~25층을 원정시키는 도구도 만들었어요.',
        hit: [
          '같은 봇으로 손맛을 비교해 보니, 몬스터를 잡는 시간이 2~10배로 늘었어요. 1 · 2바이옴 일반 몬스터 18종 중 9종을 60초 안에 못 잡았고, 보스 셋은 4분 안에 못 이겼어요.',
          '원인은 주인공의 베기 판이었어요. 칼 그림만 따서 만든 판이라, 코드에서는 반지름 30px이던 닿는 거리가 15px 정도로 줄었고 정면(아래쪽)은 거의 닿지 않았어요. → 주인공 베기 판만 채택에서 빼고 예전 반원을 그대로 썼어요.',
          '기절 · 달라붙기 · 땅속처럼 닿아도 안 되는 상태에서도, 연출 그림 판이 겹치면 맞았어요. → 판은 모양만 정하고, 피해를 줄지는 늘 코드 규칙이 정하게 나눴어요.',
        ],
        short: '두 번째 보스 용광로의 과열 공격이 정말 피할 수 있는 공격인지는 아직 아무도 재 보지 않았어요.',
        next: '그래서 v0.6.1은 용광로가 공정한지부터 쟀어요.',
      },
      {
        v: 'v0.6.1',
        title: '봇으로 보스를 공정하게',
        when: '2026.10.22 ~ 10.23',
        tried: '쇳물이 떨어질 때마다 그 순간의 게임을 복제해서, 걷기와 구르기로 피해 없이 설 자리가 있는지 계산했어요. gen 9에서는 3,000번 중 26번이 피할 길이 없었어요. 쇳물 수를 줄이고 간격을 늘리고 동시에 뜨는 예고를 줄인 gen 10에서는 2,500번 중 0번이 됐어요.',
        hit: [
          '봇이 못 깨는 이유 1위는 화구가 열려도 0~1타로 끝나는 것(59%)이었어요. 마지막 밸브에서 화구까지 가는 데만 2.6~3.8초가 걸려서 4초 열림 중 1초쯤만 남았어요. → 열림을 5.5초로 늘리자 0~1타 열림이 32%에서 9%로 줄고, 회복약 없이 20판 중 2판을 깼어요.',
          '그러자 다음 병목은 증기였어요(20판 중 16판이 증기로 사망). → 증기 예고를 1.4초로 고정하고 밸브 자리를 다시 정했어요.',
          '화구 그림이 몸보다 커서 테두리와 경고등을 덮었어요. 이어서 용광로 그림을 새로 그리면서 판정도 새 그림에 맞게 다시 뽑았어요. 옛 기록은 옛 판 그대로예요.',
          '리플레이를 멈추거나 구간을 옮기면 음악 · 반복 소리 · 보스 페이즈가 어긋났어요. → 보기 전용 시계를 따로 두고, 곡은 진행 위치에서 이어 틀어요.',
        ],
        short: '랜턴 기름은 v0.4부터 하루 한도 · 초반 사망 환급 · 충전 시간 변경으로 계속 덧대어져 있었어요.',
        next: '그리고 v0.6.2에서는 랜턴 기름을 아예 없앴어요.',
      },
      {
        v: 'v0.6.2',
        title: '랜턴 기름 폐지',
        when: '2026.10.24 ~ 지금 · v0.6.2 ~ v0.6.3',
        tried: '기름 재화, 자동 충전, 견습 원정, 하루 한도, 환급을 모두 걷어 냈어요(gen 11). 기름 샘은 보물 상자를 주는 "검은 샘"이 되고, 역청은 폐광산 광석 등급표에 합쳤어요. 그래도 gen 10 이하의 옛 리플레이는 옛 규칙 그대로 재생돼요. 확인용 세계 60개의 결과가 바꾸기 전과 똑같았어요. GitHub 아이디 이전에 맞춰 배포 주소도 옮기고, 리플레이는 한 판에 한 부만 저장해서 중복을 정리했어요.',
        now: true,
      },
    ],
    links: [
      { label: '딥홀드 사이트', href: '../../deephold/' },
      { label: '에셋 도감 (그림·소리 전부)', href: '/deephold-assets/' },
      { label: '패치 노트 (GitHub)', href: gh('deephold-releases') },
    ],
  },
  en: {
    slug: 'deephold',
    code: 'QL-004',
    name: 'DeepHold',
    meta: {
      title: 'DeepHold: trial and error, from v0.1 to v0.6 · qminlab',
      description: 'What went wrong while taking DeepHold, a hardcore 2.5D pixel action game, from v0.1 to v0.6 in ten days: what each version tried, what broke, and what the next version changed.',
    },
    eyebrow: 'FILE QL-004 / GAME / TRIAL AND ERROR',
    title: 'DeepHold: trial and error',
    lead: [
      'DeepHold is a hardcore 2.5D pixel action game: no gear, no levels, three hits and you are out. Every attack has a wind-up, so that when you die it feels like your own mistake.',
      'The design document was written on October 15, and ten days later the game was on v0.6.3. Each new feature turned balance, hitboxes, party lag or the server into the next problem. Here is what broke in each version and how the next one changed it.',
    ],
    stats: [
      { n: '10', l: 'days (10.15 design → 10.24 v0.6.3)' },
      { n: '28', l: 'tagged versions (v0.2.0 – v0.6.3)' },
      { n: '453', l: 'commits' },
      { n: 'gen 11', l: 'current dungeon rule number' },
    ],
    rule: {
      title: 'The promise kept on every rule change',
      body: 'The game rules run apart from the screen, on a fixed 60 Hz tick. The same seed and the same inputs always give the same result, so the server replays a run\'s inputs to check it is real, and that record is the replay. Every fix that changes results bumps the dungeon rule number (gen), and old replays keep playing under their old rules. That number started in v0.3.4 and reached 11 in v0.6.2.',
    },
    versions: [
      {
        v: 'v0.1',
        title: 'Rules first',
        when: '2026.10.15 – 10.16 · milestones M1 – M9',
        tried: 'The design document set five principles (no growth, three hits and out, hard, never unfair, same monster same pattern) along with 50 monsters, 5 bosses, the economy and the rules for building your own dungeon. Then came a rules core that runs without a screen; 36 monsters were built in parallel by four agents. Five bosses, the village, summoning, the old mine, the dungeon editor, a record-checking server and a desktop app wrapper followed.',
        hit: [
          'The server started on Supabase\'s free plan, where a server function gets 2 seconds of CPU per request, so checking one run had to be split into 15,000-tick slices over several requests.',
          'The desktop wrapper was set up without ever running it, because the build environment could not reach npm.',
          'Wherever art did not exist yet, a plain shape of the same size stood in.',
        ],
        short: 'The skeleton of a solo run stood up, but art, sound and the village were placeholders and there was no way to play with friends.',
        next: 'So v0.2 put the art and sound in and rebuilt the village and the plaza.',
      },
      {
        v: 'v0.2',
        title: 'Art in, and off to friends',
        when: '2026.10.16 – 10.17 · Updates 2 – 5',
        tried: '848 images, sound effects and music were wired in, along with the archive (bestiary), curses, relics, 250 achievements, cosmetics and the daily Abyss. The village was rebuilt from new art and you can now slash and roll inside it too. The plaza, chat and emotes, village window UI v2 and a reworked economy and mine came in at the same time. Auto-updates went out through GitHub Releases, and downloads moved to their own public repository so the code repository could go private.',
        hit: [
          'Old and new village art had animations with the same names, and tests broke. → The old village art is no longer loaded at all.',
          'The automatic build failed: generated data it needed was missing from the repository, and it tried to upload files before the release existed. → The data went in, and the release is now created first.',
          'You could not roll while mid-slash. → Attack cancel became a core rule, in the dungeon and the village alike: rolling cuts the slash short on the spot.',
        ],
        short: 'It was still a solo game, and the run rules and economy were still rough numbers.',
        next: 'So v0.3 (Update 6) rebuilt parties and the run rules together.',
      },
      {
        v: 'v0.3',
        title: 'Update 6: going down together',
        when: '2026.10.17',
        tried: 'Real-time parties, co-op dungeons and friend codes went in, and the run rules (biomes, boss floors, death loss, insurance, practice, ranking season 2) and the economy (smelter, ingot prices) were rebuilt. The screen got 1080p and a new settings window, and the first operator page opened.',
        hit: [
          'Offering three text sizes made text overflow and overlap all over the village windows and input boxes. A size-calculation test suite caught them one at a time, until → text size became "UI size": the whole window scales up and down through its own camera, and long text scrolls with the wheel instead of being cut. (v0.3.1)',
          'In the mine you could dig in one straight line forever, so auto-miners worked. → Undiggable bedrock is now scattered through the upper tunnels, and the macro check looks only at the dig key going down and up, which cut false alarms.',
          'The economy numbers were redone too. → Ore income was cut to a third, and death loss now starts at 75% on floor 1 and drops each floor to 50% from floor 21. The price change was paid back once, on first launch.',
          'A save test passed some runs and failed others: the server\'s start-up log was leaking into the test tool\'s output.',
        ],
        short: 'Parties brought lag, with no tool to measure where it came from, and no record of how changed numbers actually played out.',
        next: 'So v0.4 began by measuring: play logs, a lag meter, and rule versions.',
      },
      {
        v: 'v0.4',
        title: 'Measure, record, roll back',
        when: '2026.10.17 – 10.19 · v0.4.0 – v0.4.11',
        tried: 'Play logs are kept on the server for 90 days, and the operator page shows per-player logs and stats. A party lag overlay shows ticks, light calculation and input delay, and every result-changing fix now bumps the dungeon rule number (gen). Hidden rooms and empty space, emblems and titles, easy mode, published summon rates and the mine\'s silverfish all arrived here.',
        hit: [
          'Party lag: party members\' lantern rays were expensive. → 120 rays became 40, and a still lantern reuses its last result. Input delay now adjusts itself between 6 and 12 ticks during a run.',
          'Run checking ran on the same thread as the party relay, so parties stuttered while a run was being checked. → Checking moved to its own worker thread. (v0.4.11)',
          'A server setting dropped every websocket after 60 minutes. → A dropped player\'s seat is held for 9 seconds, and reconnecting resumes in the same room on the same tick.',
          'Deep mine veins went 10% → 5% → back to 10%, and finally back to the v0.4.1 layout with the vein count raised from 36 to 200. Four changes in one day.',
          'Collapsing floors cut paths (gen 5) and dungeon props blocked them (gen 6). Generation now checks paths for both.',
          'A quick tap of the attack key rarely hit a silverfish. → One press now swings all the way through, and reach, swing angle and the pause after a bite were tuned twice more.',
          'Lantern oil kept getting patched: one bottle per run and three per day, refunds for early deaths on floors 1 to 3, auto-refill from 20 minutes and 2 bottles to 30 minutes and 5.',
        ],
        short: 'Change a number, ship, play, roll back, again and again.',
        next: 'So v0.5 started with a developer lab, to swap monsters, bosses and relics on the spot and test them.',
      },
      {
        v: 'v0.5',
        title: 'The lab, and the furnace',
        when: '2026.10.19 · v0.5.0 – v0.5.4',
        tried: 'The developer lab spawns monsters, picks a boss phase, turns on invincibility and attaches relics on the spot, and all 30 relics are checked automatically to make sure they really trigger. Five-tier achievement scores with unique emblems, Steam build prep and warning and ban screens went in. The second boss, the Endless Furnace, was reworked: 50 hits down to 36, and only 3 hits per opening.',
        hit: [
          'Meeting the furnace a second time froze the game, because it tried to reuse an image that had already been destroyed. → Fixed within the hour in v0.5.3.',
          'A cooling valve\'s warning could fill up and do no damage. → Now it bursts into steam for 1 damage.',
          'Overheat dropped molten iron in bundles; it was rebuilt as 12 in a row, in a targeting order, around a random ring. (v0.5.4, gen 9)',
          'The block-break effect shrank other blocks of the same kind, and the mine\'s darkness grew a thin vertical line that followed the hero. → Darkness is now painted as one sheet with the light shapes erased from it.',
          'Every build regenerated the collision data, and because the result differed between machines, it once blocked the bot\'s paths and broke building collisions. → Builds now use the values in the repository; regenerating is a separate command.',
        ],
        short: 'Hits were still rough circles and boxes, so you could strike what you saw and miss, or get hit outside the warning zone.',
        next: 'So v0.6 set out to make hits follow the art itself.',
      },
      {
        v: 'v0.6.0',
        title: 'Hits that match the art, and a game that got too hard',
        when: '2026.10.20 – 10.21',
        tried: 'Draft hit and hurt shapes were generated automatically from the monster, boss, hero and impact art, merged with hand-painted ones and put into the rules (gen 9). Attacks with a ground warning have their shapes clipped to the warning area. A tool also sends a human-like bot, with perception, reaction time and mistakes, on runs from floor 1 to 25.',
        hit: [
          'Comparing the feel with the same bot, kill times went up 2 to 10 times. Nine of the eighteen common monsters in the first two biomes could not be killed within 60 seconds, and three bosses could not be beaten within four minutes.',
          'The cause was the hero\'s slash. Its shape was cut from the sword art alone, so reach shrank from the code\'s 30 px radius to about 15 px and the front (downward) barely hit at all. → Only the hero\'s slash shape was left out; it kept the old half circle.',
          'Monsters in states that should not hurt on contact (stunned, latched on, underground) still hit when their effect art overlapped you. → Shapes now decide only where; the code\'s rules always decide whether there is damage.',
        ],
        short: 'Nobody had yet measured whether the second boss, the furnace, could really be dodged when it overheats.',
        next: 'So v0.6.1 measured whether the furnace was fair.',
      },
      {
        v: 'v0.6.1',
        title: 'Making a boss fair with a bot',
        when: '2026.10.22 – 10.23',
        tried: 'For every drop of molten iron, the game was copied at that moment and searched for a place to walk or roll to without taking damage. In gen 9, 26 of 3,000 drops had no escape. In gen 10, with fewer drops, longer gaps and fewer warnings at once, it was 0 of 2,500.',
        hit: [
          'The top reason the bot failed was an opening that ended with 0 or 1 hits (59%). Getting from the last valve to the furnace mouth took 2.6 to 3.8 seconds, leaving about one second of a 4-second opening. → At 5.5 seconds, openings with 0 or 1 hits fell from 32% to 9%, and the bot, with no potions, cleared it in 2 runs out of 20.',
          'Then steam became the bottleneck (16 of 20 deaths). → The steam warning is fixed at 1.4 seconds and the valve spots were placed again.',
          'The furnace mouth was drawn larger than the body and covered its outline and warning lights. The furnace was then redrawn, and its hit shapes generated again for the new art. Old records keep the old shapes.',
          'Pausing or seeking a replay knocked music, looping sounds and boss phases out of sync. → Replays now have their own view clock, and music resumes from its position.',
        ],
        short: 'Since v0.4, lantern oil had been patched again and again: daily limits, early-death refunds, new refill timers.',
        next: 'And in v0.6.2, lantern oil was removed altogether.',
      },
      {
        v: 'v0.6.2',
        title: 'No more lantern oil',
        when: '2026.10.24 – now · v0.6.2 – v0.6.3',
        tried: 'The oil currency, auto-refill, apprentice runs, daily limits and refunds are all gone (gen 11). Oil springs became "black springs" that give treasure chests, and pitch joined the mine\'s ore table. Old replays from gen 10 and earlier still play under their old rules: 60 check worlds came out exactly the same as before. Download addresses moved with the GitHub account rename, and each run\'s replay is now stored once, with duplicates cleaned up.',
        now: true,
      },
    ],
    links: [
      { label: 'DeepHold site', href: '../../deephold/' },
      { label: 'Asset gallery, all art and sound (Korean)', href: '/deephold-assets/' },
      { label: 'Patch notes (GitHub)', href: gh('deephold-releases') },
    ],
  },
};

export const TRIALS = { 'claude-board': board, weming, deephold } as const;
export type TrialSlug = keyof typeof TRIALS;
export const TRIAL_SLUGS = Object.keys(TRIALS) as TrialSlug[];
/** Trial page per project code, for links from case files and the home screen. */
export const TRIAL_BY_CODE: Record<string, TrialSlug> = { 'QL-001': 'weming', 'QL-004': 'deephold', 'QL-005': 'claude-board' };

/**
 * Media per version, by position in `versions` (the same in both languages). Screenshots are the projects' own:
 * the Wait Board README images (first release), Weming store screenshots (sample data), DeepHold game captures
 * and work files. DeepHold pictures already on the game site are reused from /deephold/ as they are.
 */
const M: Record<TrialSlug, Record<number, TrialMedia[]>> = {
  'claude-board': {
    0: [{ kind: 'img', src: '/trials/claude-board/board.webp', w: 1400, h: 973,
      alt: { ko: '아이패드 대기판 화면. 작업중 · 확인 필요 · 완료 세 칸에 번호 붙은 카드들', en: 'The iPad board: numbered cards in Working, Needs attention and Done' },
      cap: { ko: '첫 공개 때의 대기판. 카드마다 번호 · 이름 · 지금 하는 일 · 경과 시간이 붙어요.', en: 'The board at first release. Each card shows a number, a name, what it is doing and for how long.' } }],
    1: [
      { kind: 'img', src: '/trials/claude-board/architecture.webp', w: 1400, h: 554,
        alt: { ko: '구조도: Claude 앱 대화와 Claude Code의 신호가 맥 서버를 거쳐 아이패드로 가요', en: 'Diagram: signals from Claude app chats and Claude Code go through the Mac server to the iPad' },
        cap: { ko: '두 길로 들어온 신호가 맥 서버 한곳에 모여요. 1.0부터는 칸을 정하는 판단도 전부 이 서버가 해요.', en: 'Signals from two paths meet at the Mac server. From 1.0 on, every lane decision is made there too.' } },
      { kind: 'img', src: '/trials/claude-board/flash.webp', w: 1400, h: 973,
        alt: { ko: '확인 필요가 생겨 화면 전체가 빨갛게 깜빡이는 대기판', en: 'The board flashing red because something needs attention' },
        cap: { ko: '확인 필요가 생기면 화면 전체가 빨갛게 깜빡여요. 10초 규칙 전에는 잠깐 묻고 넘어가는 승인에도 이렇게 깜빡였어요.', en: 'Needs attention flashes the whole screen red. Before the 10-second rule, even a prompt approved a moment later did this.' } },
    ],
    2: [{ kind: 'img', src: '/trials/claude-board/links.webp', w: 1400, h: 973,
      alt: { ko: '연결 탭: 대기판에 신호를 보내는 대화 목록과 연결 끊기 버튼', en: 'The link tab: chats sending signals to the board, each with a disconnect button' },
      cap: { ko: '연결 탭 (첫 공개 때 그림). 1.1부터 대화마다 이름을 바꾸는 버튼이 생겼어요.', en: 'The link tab (first-release picture). From 1.1 each chat also gets a rename button.' } }],
    3: [{ kind: 'demo', demo: 'board',
      cap: { ko: '움직이는 예시: 권한 승인이 10초 넘게 막히면 확인 필요로, 승인하면 다시 작업중으로, 앞 턴이 끝나도 뒤 턴이 돌고 있으면 그대로 작업중이에요.', en: 'Live example: stuck on a prompt for over 10 seconds goes to Needs attention, approving sends it back to Working, and a finished turn stays Working while a later turn runs.' } }],
  },
  weming: {
    1: [
      { kind: 'img', src: '/trials/weming/feed.webp', w: 540, h: 960, phone: true,
        alt: { ko: '위밍 피드 화면', en: 'Weming feed screen' },
        cap: { ko: '네 번 갈아엎은 끝에 정한 피드 카드', en: 'The feed card, settled after four redesigns' } },
      { kind: 'img', src: '/trials/weming/chat.webp', w: 540, h: 960, phone: true,
        alt: { ko: '위밍 대화방 화면', en: 'Weming chat screen' },
        cap: { ko: '말풍선 반응 · 답장 · 입력 중 표시가 들어간 대화방', en: 'Chat with reactions, replies and typing indicators' } },
    ],
    2: [{ kind: 'img', src: '/trials/weming/instant-old.webp', w: 540, h: 960, phone: true,
      alt: { ko: '바로 대화 시작 화면: 서로의 프로필은 공개되지 않는다는 안내', en: 'Instant Chat start screen saying profiles are not shown' },
      cap: { ko: '처음 바로 대화 화면. "서로의 프로필은 공개되지 않고" 바로 다음 친구와 이어졌어요. 심사에서 걸린 게 바로 이 부분이에요. (스토어 스크린샷, 예시 데이터)', en: 'The original Instant Chat screen: "profiles are not shown", and you were connected straight away. This is exactly what review flagged. (Store screenshot, sample data.)' } }],
    3: [{ kind: 'demo', demo: 'instant',
      cap: { ko: '움직이는 예시: 다시 설계한 바로 대화. 서로의 프로필 카드를 20초 동안 보고, 둘 다 수락해야 3분 대화가 열려요.', en: 'Live example: the redesigned Instant Chat. Both profile cards for 20 seconds, both accept, then a three-minute chat.' } }],
    4: [{ kind: 'demo', demo: 'att',
      cap: { ko: '움직이는 예시: 빌드 9의 순서. 앱을 켜면 로그인 화면 위에서 추적 허용을 먼저 묻고, 알림 허용은 그다음이에요.', en: 'Live example: the build 9 order. When the app opens, tracking permission is asked first, over the login screen; notifications come after.' } }],
  },
  deephold: {
    0: [{ kind: 'img', src: '/deephold/boss_spider_king.webp', w: 288, h: 288, pixel: true,
      alt: { ko: '무덤지기 거미왕 도트 그림', en: 'Pixel art of the Grave-keeper Spider King' },
      cap: { ko: 'v0.1에서 규칙부터 만든 보스 다섯 중 첫째, 무덤지기 거미왕 (지금 그림)', en: 'The first of the five bosses built rules-first in v0.1: the Grave-keeper Spider King (current art)' } }],
    1: [{ kind: 'img', src: '/deephold/village.webp', w: 1280, h: 896, pixel: true,
      alt: { ko: '새로 그린 마을 "마지막 등불" 전경', en: 'The redrawn village, Last Lantern' },
      cap: { ko: '새 그림으로 다시 만든 마을 "마지막 등불". 마을 안에서도 베고 구를 수 있어요.', en: 'The village Last Lantern, rebuilt from new art. You can slash and roll here too.' } }],
    2: [{ kind: 'img', src: '/trials/deephold/mine-bedrock.webp', w: 1440, h: 810, pixel: true,
      alt: { ko: '폐광산에서 곡괭이가 단단한 암반에 튕겨 나오는 장면', en: 'In the mine, the pickaxe bounces off bedrock' },
      cap: { ko: '"너무 단단해서 곡괭이가 튕겨 나온다." 한 방향으로만 캐는 자동 채굴을 막으려고 못 캐는 암반을 흩어 놓았어요.', en: '"Too hard, the pickaxe bounces off." Undiggable bedrock was scattered to stop straight-line auto-mining.' } }],
    3: [{ kind: 'img', src: '/trials/deephold/mine-deep.webp', w: 1440, h: 810, pixel: true,
      alt: { ko: '폐광산 깊은 갱도 입구', en: 'Entrance to the mine\'s deep tunnels' },
      cap: { ko: '깊은 갱도. 이곳의 광맥 숫자를 하루 사이에 네 번 바꿨어요.', en: 'The deep tunnels, where the vein numbers changed four times in one day.' } }],
    4: [
      { kind: 'img', src: '/deephold/v052_furnace.webp', w: 880, h: 300, pixel: true,
        alt: { ko: '멈추지 않는 용광로의 새 그림들: 화구 · 경고등 · 쇳물 · 증기', en: 'New Endless Furnace art: mouth, warning light, molten iron, steam' },
        cap: { ko: '손질한 두 번째 보스, 멈추지 않는 용광로. 체력 36 · 열림당 3타.', en: 'The reworked second boss, the Endless Furnace: 36 hits, 3 per opening.' } },
      { kind: 'img', src: '/trials/deephold/emblems.webp', w: 1904, h: 480, pixel: true,
        alt: { ko: '업적 엠블럼 크기 비교, 고치기 전과 후', en: 'Achievement emblems before and after resizing' },
        cap: { ko: '업적 엠블럼 크기를 다시 맞출 때 쓴 비교 그림 (v0.5.2)', en: 'The comparison sheet used when emblem sizes were redone (v0.5.2)' } },
    ],
    5: [
      { kind: 'img', src: '/deephold/v060_hitbox.webp', w: 944, h: 344, pixel: true,
        alt: { ko: '판정을 그림 모양 그대로: 초록은 맞는 곳, 주황은 때리는 곳', en: 'Hits follow the art: green is where you get hit, orange is where you hit' },
        cap: { ko: '그림 모양 그대로의 판정. 초록은 맞는 곳, 주황은 때리는 곳이에요.', en: 'Hit shapes taken from the art. Green gets hit, orange hits.' } },
      { kind: 'video', src: '/trials/deephold/collision.mp4', poster: '/trials/deephold/collision-poster.webp', w: 540, h: 960,
        alt: { ko: '건물 충돌 판정을 만드는 과정 영상', en: 'Clip: how building collision is made' },
        cap: { ko: '같은 버전에서 마을 건물 충돌도 다시 만들었어요. 3D 모델을 높이별로 잘라 픽셀마다 앞뒤 순서를 정하는 과정 (5초).', en: 'The same version rebuilt building collision: slicing a 3D model by height to set the front-back order of every pixel (5 s).' } },
    ],
    6: [{ kind: 'img', src: '/trials/deephold/decal-furnace.webp', w: 1368, h: 320, pixel: true,
      alt: { ko: '용광로 화구 열림 예고 장판, 고치기 전과 후', en: 'Furnace mouth warning zone, before and after' },
      cap: { ko: '같은 때 예고 장판도 매끈한 원에서 도트 데칼로 바꿨어요 (왼쪽 전, 오른쪽 후).', en: 'Warning zones also went from flat circles to pixel decals (left before, right after).' } }],
    7: [{ kind: 'img', src: '/trials/deephold/mine-oil-rule.webp', w: 1440, h: 810, pixel: true,
      alt: { ko: '"기름이 있어서 역청이 단단하다" 말풍선이 뜬 폐광산', en: 'Mine bubble: "you have oil, so the pitch is too hard"' },
      cap: { ko: '"기름이 있어서 역청이 단단하다." v0.6.2에서 기름과 함께 없앤 규칙이에요.', en: '"You have oil, so the pitch is too hard." One of the rules that left with lantern oil in v0.6.2.' } }],
  },
};

for (const slug of TRIAL_SLUGS) {
  for (const l of ['ko', 'en'] as const) {
    TRIALS[slug][l].versions.forEach((v, i) => { if (M[slug][i]) v.media = M[slug][i]; });
  }
}
