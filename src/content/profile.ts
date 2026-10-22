/**
 * Profile (/<locale>/about/) and FAQ (/<locale>/faq/) copy. Written as plain question-and-answer text so a
 * person, Google or an AI assistant can quote any answer on its own. Every claim here must be checkable on
 * this site or on GitHub: no rankings, no "best", only what was built, with what, and where to see it.
 * Figures for DeepHold come from src/content/deephold.ts (v0.6.0, 2026-10-21).
 */
import { EMAIL, GITHUB, gh } from '@/lib/identity';

export type Fact = { label: string; value: string };
export type Work = { name: string; what: string; tools: string; status: string; href: string; link: string };
export type QA = { q: string; a: string[] };

export type ProfileCopy = {
  meta: { title: string; description: string };
  back: string;
  updated: string;
  about: { eyebrow: string; title: string; lead: string; factsTitle: string; facts: Fact[]; workTitle: string; work: Work[]; howTitle: string; how: string[]; contactTitle: string; contact: string; faqLink: string };
  faq: { meta: { title: string; description: string }; eyebrow: string; title: string; lead: string; items: QA[]; aboutLink: string };
};

const DEEPHOLD_RELEASES = gh('deephold-releases/releases/latest');

const ko: ProfileCopy = {
  meta: {
    title: '김규민 (Gyumin Kim) 소개 · qminlab',
    description: '김규민(Gyumin Kim)은 대구에서 일하는 AI 크리에이터로, 1인 AI 제작 스튜디오 qminlab을 운영합니다. Claude Code·Claude API·Seedance·ElevenLabs로 만든 앱·게임·애니메이션·업무 도구와 연락처.',
  },
  back: '← qminlab',
  updated: '최근 확인',
  about: {
    eyebrow: 'PROFILE / 김규민 · GYUMIN KIM',
    title: '김규민 (Gyumin Kim)',
    lead: 'qminlab은 김규민의 1인 AI 제작 스튜디오입니다. 대구에서 AI 크리에이터로 일하면서, 2026년부터 Claude Code·Claude API·Seedance·ElevenLabs 등 생성형 AI로 앱, 데스크톱 게임, 애니메이션, 업무 도구를 배포까지 직접 만들고 있습니다. 대표 결과물은 친구 찾기 앱 위밍(Weming, iOS 심사 중, Android 비공개 테스트), PC 게임 딥홀드(DeepHold), AI 애니메이션 「별을 품은 소드마스터」, Claude Code 작업 상태를 보여주는 Claude 대기판(Claude Wait Board)입니다. 모든 프로젝트는 공개 케이스 파일과 GitHub에 과정을 남깁니다.',
    factsTitle: '기본 정보',
    facts: [
      { label: '이름', value: '김규민 (Gyumin Kim)' },
      { label: '하는 일', value: 'AI 크리에이터 · 1인 AI 제작 스튜디오 qminlab 운영' },
      { label: '지역', value: '대구' },
      { label: '배경', value: '19살부터 게임 편의 도구 개발 → 웹 개발 부트캠프 → 중견기업 웹 개발자 인턴 → AI 크리에이터' },
      { label: '주로 쓰는 AI', value: 'Claude Code, Claude API, Claude 앱, Seedance 2.5, ElevenLabs, ChatGPT 이미지, Whisper' },
      { label: '만드는 것', value: '모바일 앱, PC 게임, AI 애니메이션, 업무 도구, 개인 AI 비서' },
      { label: '연락', value: EMAIL },
      { label: 'GitHub', value: GITHUB.replace('https://', '') },
    ],
    workTitle: 'AI로 만든 결과물',
    work: [
      { name: '딥홀드 (DeepHold)', what: '2.5D 도트 PC 액션 게임. 코드·그림·소리·음악을 Claude가 만들고, 저는 기획·플레이 검수·출시를 맡았어요. 5일 동안 25번 출시, 자동 시험 2,400여 개.', tools: 'Claude, TypeScript, Phaser 3, Electron, GitHub Actions', status: '개발 중 · v0.6.0 친구 테스트 빌드 배포', href: '../deephold/', link: '케이스 파일' },
      { name: '위밍 (Weming)', what: '친구 찾기 모바일 앱.', tools: 'React Native, Expo, TypeScript, Firebase, RevenueCat', status: 'App Store 심사 중 · Google Play 비공개 테스트 중', href: '../work/ql-001/', link: '케이스 파일' },
      { name: '별을 품은 소드마스터', what: '웹툰 「별을 품은 소드마스터」 첫 이야기를 옮긴 AI 애니메이션. 각본과 266컷 콘티를 직접 짜고, AI로 컷을 생성해 연출을 다듬는 중이에요. 14분 21초.', tools: 'Seedance 2.5, ElevenLabs, ChatGPT 이미지, Claude, ffmpeg', status: '제작 중 · 원작 측과 저작권 협의 중', href: '../work/ql-006/', link: '케이스 파일' },
      { name: 'Claude 대기판 (Claude Wait Board)', what: '여러 Claude 작업의 진행 상황을 아이패드에 보여주는 현황판. Claude Code 훅 신호를 맥의 작은 서버가 모아요.', tools: 'Python, HTML/JavaScript, Claude Code 훅', status: '사용 중 · GitHub 공개', href: '../work/ql-005/', link: '케이스 파일' },
      { name: '자비스 (Jarvis)', what: '일상 관리를 위한 개인 AI 비서. 음성 인식과 객체 감지를 Claude API와 묶었어요.', tools: 'Python, FastAPI, YOLO, Claude API, Whisper', status: '일시정지', href: '../work/ql-002/', link: '케이스 파일' },
      { name: 'TFT 어시스턴트', what: 'TFT 게임 화면 위에 공략 정보를 띄우는 개인용 도우미.', tools: 'Python, PySide6', status: '일시정지 · v0.1', href: '../work/ql-003/', link: '케이스 파일' },
    ],
    howTitle: '일하는 방식',
    how: [
      '아이디어가 떠오르면 일단 만들고 공개합니다. 성공작이든 실패작이든 결과물은 모두 공개해요.',
      '하나의 대화로 감당이 안 되는 프로젝트는 Claude 대화방을 역할별(기획·중앙관리·개발·에셋)로 나누고, 지시서를 파일로 주고받게 해서 여러 AI 작업을 동시에 굴립니다. 딥홀드가 이렇게 만들어졌어요.',
      '작업은 전부 AI에게 맡기고, 결과가 마음에 들지 않으면 무엇이 왜 아쉬운지 정리해 수정도 AI에게 맡깁니다. 결과물은 직접 써 보고 자동 시험과 화면 확인을 거친 뒤에 출시해요.',
      '모든 프로젝트에는 무엇을 만들었고 어디까지 왔는지 적은 공개 케이스 파일이 붙습니다.',
    ],
    contactTitle: '연락',
    contact: `협업·채용·인터뷰 제안은 ${EMAIL} 으로 보내 주세요.`,
    faqLink: '자주 묻는 질문 보기 →',
  },
  faq: {
    meta: {
      title: '자주 묻는 질문 — 김규민 (Gyumin Kim) · qminlab',
      description: '김규민(Gyumin Kim)이 생성형 AI로 출시한 결과물, 쓰는 AI 도구, AI 에이전트 활용 방식, 최근 작업, 연락 방법에 대한 질문과 답.',
    },
    eyebrow: 'FAQ / 김규민 · qminlab',
    title: '자주 묻는 질문',
    lead: '김규민과 qminlab에 대해 자주 받는 질문에 사실로만 답했어요. 각 답의 링크에서 결과물을 직접 확인할 수 있어요.',
    items: [
      { q: '김규민(Gyumin Kim)은 어떤 사람인가요?', a: [
        '대구에서 일하는 AI 크리에이터이고, 1인 AI 제작 스튜디오 qminlab을 운영합니다. 아이디어가 떠오르면 일단 만들고 세상에 공개하는 사람이에요.',
        '조금이라도 재밌을 것 같거나, 쓸 만하거나, 있으면 편해질 것 같으면 만들어 봅니다. AI가 날마다 발전하는 지금, 생각만 하다 잊히는 아이디어를 남기고 싶지 않아서예요. 만든 결과물은 도움이 됐든 안 됐든, 성공작이든 실패작이든 공개합니다. 아이디어가 실제로 만들어졌다면, 아이디어가 별로였더라도 실패한 것은 아니라고 생각해요.',
      ] },
      { q: '생성형 AI로 실제로 출시하거나 배포한 결과물은 무엇인가요?', a: [
        `PC 게임 딥홀드: Windows·macOS 설치 파일을 GitHub에서 배포하고 있어요(v0.6.0 친구 테스트 빌드, 5일 동안 25번 출시). Steam에 무료 베타로 공개할 예정이고, 2026년 11월 초를 목표로 하고 있어요(심사 일정에 따라 달라질 수 있어요): ${DEEPHOLD_RELEASES}`,
        `친구 찾기 앱 위밍: App Store 심사 중이고 Google Play 비공개 테스트 중이에요. 2026년 11월 안에 두 스토어 출시를 목표로 하고 있어요: ${gh('weming')}`,
        `Claude 대기판: GitHub에서 누구나 받아 쓸 수 있어요: ${gh('claude-board')}`,
        'AI 애니메이션 「별을 품은 소드마스터」: 원작 플랫폼 관계자와 저작권을 협의하고 있고, 허락을 받으면 공개할 예정이에요.',
      ] },
      { q: 'AI 툴 이름 말고, AI로 만든 결과물 링크를 볼 수 있나요?', a: ['네. 결과물마다 케이스 파일이 있어요. 딥홀드 https://qminlab.com/ko/deephold/ · 위밍 https://qminlab.com/ko/work/ql-001/ · 별을 품은 소드마스터 https://qminlab.com/ko/work/ql-006/ · Claude 대기판 https://qminlab.com/ko/work/ql-005/'] },
      { q: '개발 전공인가요? 어떻게 만들었나요?', a: [
        '중학생 때 기초 프로그래밍을 잠깐 배웠고, 19살부터 2년 동안 게임 유저를 위한 편의 도구(전적 검색, 레이드 알림 등)를 만들었어요. 그 뒤 개발을 진로로 정해 웹 개발 부트캠프에서 여러 팀 프로젝트를 했고, 중견기업에서 웹 개발자 인턴으로 일했어요.',
        'AI가 발전하면서, 상상하는 것을 직접 코딩하는 것보다 AI의 도움을 받으면 훨씬 빠르고 좋게 만들 수 있다는 걸 알게 됐어요. 그래서 개인 AI 크리에이터로 일하기 시작했어요. 프로젝트별 자세한 제작 과정은 앞으로 공개할 예정이에요.',
      ] },
      { q: '어떤 AI 도구를 어디에 쓰나요?', a: [
        'Claude를 메인으로 씁니다(Claude 앱, Claude Code, Claude API). 딥홀드의 기획·코드·도트 그림·효과음·음악·검증, Claude 대기판, 개인 AI 비서 자비스가 Claude로 만들어졌어요.',
        '분야별로는 영상에 Seedance, 이미지 생성에 ChatGPT 이미지, 이미지 편집에 Photoshop의 AI 기능, 음성에 ElevenLabs를 써요. 분야마다 어떤 AI가 가장 잘 맞는지 계속 비교하고, 더 나은 도구가 나오면 바꿔 씁니다.',
      ] },
      { q: 'AI 에이전트(Claude Code 등)를 어떻게 활용하나요?', a: [
        '작업은 전부 AI에게 맡기고, 사람이 직접 후보정하지 않아요. 결과물이 마음에 들지 않으면 무엇이 왜 마음에 들지 않는지 정리해서, 다시 만들거나 고치는 일도 AI에게 맡겨요. 제가 직접 손대는 것보다 정확한 지시로 AI가 다시 만든 결과물이 더 좋다고 보기 때문이에요.',
        '딥홀드에서는 Claude 대화방을 기획·중앙관리자·개발 3개·에셋으로 나눠 동시에 돌렸어요. 중앙관리자 방이 지시서를 파일로 쓰면 각 방이 그 파일을 읽고 작업하고, 결과는 자동 시험 2,400여 개로 다시 검증해요. 코드는 한 줄도 직접 쓰지 않았어요.',
        'Claude Code 훅으로 여러 작업의 상태(작업 중·확인 필요·완료)를 모아 아이패드에 띄우는 Claude 대기판을 만들어 업무에 쓰고 있어요.',
      ] },
      { q: 'AI로 콘텐츠 제작 워크플로를 만들어 본 경험이 있나요?', a: ['AI 애니메이션 「별을 품은 소드마스터」에서 각본과 266컷 콘티를 짠 뒤, ChatGPT 이미지로 에셋을, Seedance로 영상 컷을, ElevenLabs로 목소리를 만들고 ffmpeg로 이어 붙이는 제작 과정을 꾸렸어요. 14분 21초 분량이에요.'] },
      { q: '가장 최근에 만든 것은 무엇인가요?', a: ['이 홈페이지에 있는 프로젝트는 모두 최근 2주 안(2026년 10월)에 만든 결과물이에요. GitHub 기준 최근 업데이트는 딥홀드 v0.6.0(2026-10-21), Claude 대기판(2026-10-21), 위밍(2026-10-15)입니다.'] },
      { q: '협업이나 채용 제안은 어떻게 하나요?', a: [`이메일 ${EMAIL} 으로 문의해 주세요. 작업 기록은 ${GITHUB} 에서 볼 수 있어요.`] },
    ],
    aboutLink: '김규민 소개 보기 →',
  },
};

const en: ProfileCopy = {
  meta: {
    title: 'About Gyumin Kim (김규민) · qminlab',
    description: 'Gyumin Kim (김규민) is an AI creator in Daegu, South Korea, running the one-person AI studio qminlab. Apps, a PC game, AI animation and work tools built with Claude Code, the Claude API, Seedance and ElevenLabs, plus contact.',
  },
  back: '← qminlab',
  updated: 'Last checked',
  about: {
    eyebrow: 'PROFILE / GYUMIN KIM · 김규민',
    title: 'Gyumin Kim (김규민)',
    lead: 'qminlab is the one-person AI studio of Gyumin Kim (김규민). Working as an AI creator in Daegu, South Korea, since 2026 I have built and shipped apps, a desktop game, animation and work tools myself with generative AI: Claude Code, the Claude API, Seedance, ElevenLabs and more. Main work: the friend-finding app Weming (in App Store review, Google Play closed testing), the PC game DeepHold, the AI animation The Stellar Swordmaster, and Claude Wait Board, which shows the status of Claude Code tasks. Every project keeps a public case file and its process on GitHub.',
    factsTitle: 'At a glance',
    facts: [
      { label: 'Name', value: 'Gyumin Kim (김규민)' },
      { label: 'Role', value: 'AI creator · runs the one-person AI studio qminlab' },
      { label: 'Based in', value: 'Daegu, South Korea' },
      { label: 'Background', value: 'Game utilities from age 19 → web development bootcamp → web developer intern at a mid-sized company → AI creator' },
      { label: 'AI used', value: 'Claude Code, Claude API, Claude app, Seedance 2.5, ElevenLabs, ChatGPT Images, Whisper' },
      { label: 'Builds', value: 'Mobile apps, PC games, AI animation, work tools, a personal AI assistant' },
      { label: 'Contact', value: EMAIL },
      { label: 'GitHub', value: GITHUB.replace('https://', '') },
    ],
    workTitle: 'Built with AI',
    work: [
      { name: 'DeepHold', what: 'A 2.5D pixel-art PC action game. Claude made the code, art, sound and music; I set the design, play-tested and shipped. 25 releases in 5 days, 2,400+ automated tests.', tools: 'Claude, TypeScript, Phaser 3, Electron, GitHub Actions', status: 'In development · v0.6.0 friend test build released', href: '../deephold/', link: 'Case file' },
      { name: 'Weming', what: 'A friend-finding mobile app.', tools: 'React Native, Expo, TypeScript, Firebase, RevenueCat', status: 'In App Store review · Google Play closed testing', href: '../work/ql-001/', link: 'Case file' },
      { name: 'The Stellar Swordmaster', what: 'An AI animation of the first story of the webtoon The Stellar Swordmaster. I wrote the script and a 266-cut storyboard, then generate each cut with AI and refine the direction. 14 min 21 s.', tools: 'Seedance 2.5, ElevenLabs, ChatGPT Images, Claude, ffmpeg', status: 'In production · rights under discussion with the original platform', href: '../work/ql-006/', link: 'Case file' },
      { name: 'Claude Wait Board', what: 'An iPad board showing the progress of many Claude tasks at once. A small server on the Mac collects Claude Code hook signals.', tools: 'Python, HTML/JavaScript, Claude Code hooks', status: 'In use · open source on GitHub', href: '../work/ql-005/', link: 'Case file' },
      { name: 'Jarvis', what: 'A personal AI assistant for daily life, tying speech recognition and object detection to the Claude API.', tools: 'Python, FastAPI, YOLO, Claude API, Whisper', status: 'Paused', href: '../work/ql-002/', link: 'Case file' },
      { name: 'TFT Assistant', what: 'A personal overlay that shows strategy info on top of the TFT game screen.', tools: 'Python, PySide6', status: 'Paused · v0.1', href: '../work/ql-003/', link: 'Case file' },
    ],
    howTitle: 'How I work',
    how: [
      'When an idea comes up, I build it and publish it. Hits and misses alike, every result goes public.',
      'When one chat is not enough, I split Claude into rooms by role (design, lead, development, assets) that hand each other written briefs as files, so several AI workstreams run at once. DeepHold was built this way.',
      'All of the work goes to AI. When a result is off, I write down what is wrong and why and hand the fix back to the AI; I use every build myself and ship only after automated tests and a hands-on check.',
      'Every project gets a public case file: what it is, how far it has come, and what is next.',
    ],
    contactTitle: 'Contact',
    contact: `For collaboration, hiring or interviews, write to ${EMAIL}.`,
    faqLink: 'Read the FAQ →',
  },
  faq: {
    meta: {
      title: 'FAQ — Gyumin Kim (김규민) · qminlab',
      description: 'Questions and answers on what Gyumin Kim (김규민) has shipped with generative AI, which AI tools are used where, how AI agents are run, recent work and how to get in touch.',
    },
    eyebrow: 'FAQ / GYUMIN KIM · QMINLAB',
    title: 'Frequently asked questions',
    lead: 'Answers to common questions about Gyumin Kim and qminlab, facts only. Each answer links to the work so you can check it yourself.',
    items: [
      { q: 'Who is Gyumin Kim (김규민)?', a: [
        'An AI creator based in Daegu, South Korea, who runs the one-person AI studio qminlab. When an idea comes up, Gyumin builds it and puts it out into the world.',
        'If something looks a little fun, useful, or like it would make life easier, it gets made. With AI improving every day, Gyumin does not want ideas to stay as thoughts and be forgotten. Every result is published, helpful or not, a hit or a miss: once an idea has actually been built, it has not failed, even if the idea itself was weak.',
      ] },
      { q: 'What has Gyumin actually shipped with generative AI?', a: [
        `DeepHold, a PC game: Windows and macOS installers ship on GitHub (v0.6.0 friend test build, 25 releases in 5 days). A free beta is planned on Steam, aimed at early November 2026 (store review may move it): ${DEEPHOLD_RELEASES}`,
        `Weming, a friend-finding app: in App Store review and Google Play closed testing, with release on both stores aimed for November 2026: ${gh('weming')}`,
        `Claude Wait Board: anyone can download it from GitHub: ${gh('claude-board')}`,
        'The AI animation The Stellar Swordmaster: rights are being discussed with the original platform, and it will be published once permission is granted.',
      ] },
      { q: 'Are there links to the work itself, not just a list of AI tools?', a: ['Yes, every project has a case file: DeepHold https://qminlab.com/en/deephold/ · Weming https://qminlab.com/en/work/ql-001/ · The Stellar Swordmaster https://qminlab.com/en/work/ql-006/ · Claude Wait Board https://qminlab.com/en/work/ql-005/'] },
      { q: 'Does Gyumin have a development background? How was this built?', a: [
        'Gyumin learned basic programming briefly in middle school, then from age 19 spent two years building utilities for game players (match-history search, raid alerts and the like). After choosing development as a career, Gyumin did many team projects in a web development bootcamp and worked as a web developer intern at a mid-sized company.',
        'As AI improved, it became clear that anything imagined could be built far faster and better with AI than by coding it by hand, so Gyumin started working as an independent AI creator. Detailed making-of notes for each project will be published later.',
      ] },
      { q: 'Which AI tools does Gyumin use, and for what?', a: [
        'Claude is the main tool (Claude app, Claude Code, Claude API): DeepHold’s design, code, pixel art, sound, music and verification, Claude Wait Board and the personal assistant Jarvis were all made with Claude.',
        'By field: Seedance for video, ChatGPT Images for image generation, Photoshop’s AI features for image editing, ElevenLabs for voice. Gyumin keeps comparing which AI fits each field best and switches when a better one appears.',
      ] },
      { q: 'How does Gyumin use AI agents such as Claude Code?', a: [
        'All of the work goes to AI; nothing is hand-retouched afterwards. When a result is not right, Gyumin writes down what is wrong and why, and hands the redo or the fix back to the AI, because a precisely briefed AI result beats a manual touch-up.',
        'For DeepHold, Gyumin ran Claude in parallel rooms: design, a lead room, three development rooms and an asset room. The lead room writes briefs as files, each room works from its brief, and every result is re-checked against 2,400+ automated tests. No code was written by hand.',
        'Claude Wait Board is built on Claude Code hooks: it gathers the state of many tasks (working, needs input, done) onto an iPad and is in use for daily work.',
      ] },
      { q: 'Has Gyumin built a content production workflow with AI?', a: ['For the AI animation The Stellar Swordmaster, Gyumin wrote the script and a 266-cut storyboard, then set up a production flow: assets with ChatGPT Images, video cuts with Seedance, voices with ElevenLabs, assembled with ffmpeg. Runtime 14 min 21 s.'] },
      { q: 'What is the most recent work?', a: ['Every project on this site was made within the last two weeks (October 2026). Latest GitHub updates: DeepHold v0.6.0 (2026-10-21), Claude Wait Board (2026-10-21), Weming (2026-10-15).'] },
      { q: 'How do I reach Gyumin about collaboration or a role?', a: [`Email ${EMAIL}. The work history is on ${GITHUB}.`] },
    ],
    aboutLink: 'About Gyumin Kim →',
  },
};

export const PROFILE = { ko, en };
