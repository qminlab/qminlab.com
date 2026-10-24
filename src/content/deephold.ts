/**
 * DeepHold case file (QL-004): the long-form page at /<locale>/deephold/.
 * Figures come from the game repo and release history as of v0.6.0 (2026-10-21). Costs are estimates from
 * public list prices, not receipts, and the page says so.
 */
import { GITHUB } from '@/lib/identity';

export type Stat = { n: string; l: string };
export type Row = string[];
export type Step = { date: string; ver: string; title: string; body: string };
export type Trial = { title: string; tried: string; broke: string; fixed: string };
export type Place = { img: string; name: string; floors: string; boss: string; bossImg: string; line: string };

export type CaseFile = {
  meta: { title: string; description: string };
  back: string;
  file: string;
  status: string;
  title: string;
  lead: string;
  cta: { download: string; notes: string };
  stats: Stat[];
  toc: { id: string; label: string }[];
  intro: { eyebrow: string; title: string; body: string[]; rulesTitle: string; rules: Row[]; loopTitle: string; loop: string[]; controlsTitle: string; controls: Row[] };
  world: { eyebrow: string; title: string; body: string[]; villageCap: string; placesTitle: string; places: Place[]; mineCap: string };
  making: { eyebrow: string; title: string; body: string[]; roomsTitle: string; rooms: Row[]; flowTitle: string; flow: string[]; artTitle: string; art: string[]; timelineTitle: string; timeline: Step[] };
  trials: { eyebrow: string; title: string; body: string; labels: { tried: string; broke: string; fixed: string }; items: Trial[]; hitCap: string; villageCap: string; furnaceCap: string };
  tools: { eyebrow: string; title: string; body: string; head: Row; rows: Row[]; costHead: Row; costs: Row[]; total: string; note: string };
  now: { eyebrow: string; title: string; items: Row[]; outro: string };
  footer: { copy: string; home: string };
};

const RELEASES = `${GITHUB}/deephold-releases/releases/latest`;
const NOTES = `${GITHUB}/deephold-releases/blob/main/%ED%8C%A8%EC%B9%98%EB%85%B8%ED%8A%B8/README.md`;
export const DEEPHOLD_LINKS = { RELEASES, NOTES };

const ko: CaseFile = {
  meta: {
    title: '딥홀드 — 케이스 파일 QL-004 · qminlab',
    description: '랜턴 하나 들고 내려가는 하드코어 2.5D 도트 액션 게임 딥홀드. 게임 소개, 세계관, AI로 만든 제작 과정, 시행착오, 쓴 도구와 비용을 모두 공개합니다.',
  },
  back: '← qminlab',
  file: 'FILE QL-004 / 게임 / 케이스 파일',
  status: '개발 중 · v0.6.0 · 친구 테스트',
  title: '딥홀드',
  lead: '랜턴 하나 들고, 끝없이 깊어지는 던전으로. 무작위 던전에서 캐 온 자원으로 내 던전을 짓고, 친구가 그 던전에 도전하는 2.5D 도트 PC 액션 게임이에요. 기획부터 코드, 그림, 소리까지 한 사람이 Claude와 대화하며 만들었어요.',
  cta: { download: '최신 버전 받기', notes: '패치 노트' },
  stats: [
    { n: '5', l: '바이옴 (13층부터 끝없이)' },
    { n: '50', l: '몬스터 · 보스 5종' },
    { n: '3', l: '번 맞으면 끝' },
    { n: '25', l: '번 출시 (5일)' },
    { n: '2,400+', l: '자동 시험' },
    { n: '0', l: '줄 직접 쓴 코드' },
  ],
  toc: [
    { id: 'intro', label: '게임 소개' },
    { id: 'world', label: '세계관' },
    { id: 'making', label: '제작 과정' },
    { id: 'trials', label: '시행착오' },
    { id: 'tools', label: '도구와 비용' },
    { id: 'now', label: '지금과 다음' },
  ],
  intro: {
    eyebrow: '01 — 게임 소개',
    title: '실력 말고는 아무것도 늘지 않아요',
    body: [
      '딥홀드는 탑다운 실시간 액션에 로그라이트 파밍과 던전 건설을 섞은 게임이에요. 층을 내려갈수록 몬스터는 많아지고 빨라지지만 보상도 커져요. 지금 돌아갈지, 한 층만 더 내려갈지는 언제나 내 선택이에요. 체력 세 칸이 바닥나기 전에요.',
      '모아 온 자원으로는 나만의 던전을 지어요. 함정을 깔고, 소환한 몬스터를 배치하고, 친구에게 도전장을 보내요. 누가 더 깊이 내려가고, 누구의 던전이 더 악랄한지 겨루는 게임이에요.',
    ],
    rulesTitle: '다섯 가지 원칙',
    rules: [
      ['성장 없음', '공격력 · 체력 · 속도는 어떤 방법으로도 오르지 않아요. 장비도 스탯도 레벨도 없어요.'],
      ['세 번 맞으면 끝', '피격 1번 = 체력 1칸. 회복은 드물게 나오는 회복약뿐이에요.'],
      ['어렵게, 짜게', '몬스터는 강하고, 좋은 층과 재화는 드물어요.'],
      ['억울하지 않게', '모든 공격에는 예고 동작이 있어요. 죽으면 내 실수라고 느껴야 해요.'],
      ['같은 몬스터는 같은 패턴', '깊어질수록 공격 속도만 빨라지고 패턴은 바뀌지 않아요.'],
    ],
    loopTitle: '한 번의 원정',
    loop: [
      '랜턴 하나만 들고 던전 입구로 내려가요.',
      '층마다 지도 · 몬스터 편성 · 층 성격(함정 · 사냥꾼 · 보물 창고 · 혼불 제단…)이 무작위로 바뀌어요.',
      '3 · 6 · 9층의 탈출 포탈로 살아 나와야 전리품이 창고에 들어가요. 죽으면 들고 있던 걸 잃어요.',
      '바이옴 마지막 층에는 보스방 문이 따로 있어요. 들어갈지는 내가 정해요.',
      '마을에서 정산하고, 내 던전을 꾸미고, 몬스터를 소환하고, 다시 내려가요.',
    ],
    controlsTitle: '조작',
    controls: [
      ['이동', 'WASD · 방향키'],
      ['공격', 'J'],
      ['구르기 (앞 절반 무적)', 'K'],
      ['상호작용', 'E'],
      ['회복약', 'Q'],
      ['방향 고정', 'L (누르는 동안)'],
      ['지도 (게임은 안 멈춰요)', 'Tab'],
    ],
  },
  world: {
    eyebrow: '02 — 세계관',
    title: '무너진 지하왕국, 마지막 등불',
    body: [
      '땅 밑에는 오래전에 무너진 지하왕국이 있어요. 그 입구 위, 안개 낀 폐허에 천막과 판잣집 몇 채가 모인 작은 캠프가 있고, 가운데의 큰 등불 하나가 마을 전체를 비춰요. 그래서 마을 이름이 "마지막 등불"이에요.',
      '주인공은 이름 없는 도굴꾼이에요. 디자인이 정해진 한 사람이고, 손에 든 랜턴이 유일한 빛이에요. 화면 대부분은 어둡고, 적의 눈만 어둠 속에서 붉게 빛나요. 폐광산에서 캔 광석과 역청은 마을 제련소에서 주괴로 바꿔요.',
      '깊이마다 왕국의 다른 얼굴이 나와요. 다섯 바이옴에는 각자 전설 보스가 하나씩 살고, 보스마다 방 구조를 이용하는 공략이 있어요.',
    ],
    villageCap: '마을 "마지막 등불". 던전 입구 · 제련소 · 소환 사원 · 기록비 · 도전 게시판 · 폐광산이 모여 있어요.',
    placesTitle: '다섯 개의 깊이와 그 주인들',
    places: [
      { img: 'room_moss_graveyard', name: '이끼 묘지', floors: '1~3층', boss: '무덤지기 거미왕', bossImg: 'boss_spider_king', line: '원형 묘역과 기둥 네 개. 천장으로 올라간 거미왕의 낙하를 유도해 뒤집힌 배를 때려야 해요.' },
      { img: 'room_rusted_workshop', name: '녹슨 공방', floors: '4~6층', boss: '멈추지 않는 용광로', bossImg: 'boss_endless_furnace', line: '벽에 박힌 용광로와 컨베이어 바닥. 냉각 밸브 셋을 부숴야 화구가 열려요.' },
      { img: 'room_sunken_temple', name: '가라앉은 신전', floors: '7~9층', boss: '익사한 왕', bossImg: 'boss_drowned_king', line: '페이즈마다 물이 차올라 발판이 줄어요. 삼지창이 돌아오는 틈을 노려요.' },
      { img: 'room_lava_vein', name: '용암 광맥', floors: '10~12층', boss: '잠든 화룡', bossImg: 'boss_sleeping_dragon', line: '처음엔 잠들어 있어요. 몰래 다가가 첫 타를 넣고, 기둥이 다 부서지기 전에 끝내야 해요.' },
      { img: 'room_black_abyss', name: '칠흑 심연', floors: '13층부터 끝없이', boss: '랜턴을 삼킨 자', bossImg: 'boss_lantern_swallower', line: '빛이 하나도 없는 방. 빛 기둥을 켜야 피해가 들어가고, 마지막엔 내 랜턴까지 삼켜요.' },
    ],
    mineCap: '폐광산. 몬스터 없이 곡괭이로 블록을 캐요. 광석은 랜턴 빛이 닿아야 반짝여요.',
  },
  making: {
    eyebrow: '03 — 제작 과정',
    title: '한 사람과 여러 개의 Claude 대화방',
    body: [
      '딥홀드의 코드 · 그림 · 소리 · 음악은 전부 Claude가 만들었어요. 저는 무엇을 만들지 정하고, 화면을 직접 해 보고, 어디가 이상한지 말하고, 출시 버튼을 눌렀어요. 코드는 한 줄도 직접 쓰지 않았어요.',
      '하나의 대화로는 감당이 안 돼서 대화방을 역할별로 나눴어요. 방끼리는 서로의 대화를 못 보기 때문에, 중앙관리자 방이 지시서를 파일로 써 두고 저는 "이 파일 읽고 작업해 줘" 한 줄만 각 방에 보냈어요.',
    ],
    roomsTitle: '대화방 구성',
    rooms: [
      ['기획 방', '기획서(문서) 작성 · 수치와 확률을 인기 하드코어 게임 수치를 표본으로 맞춤'],
      ['중앙관리자 방', '버전 결정 · 방별 지시서 · 모든 결과 검증 · 출시 확인 · 패치 노트 · 홍보와 펀딩 준비'],
      ['개발 1번 방', '파티 · 카메라 · 마을 · 충돌 편집기 · 운영자 페이지 · 서버 · 빌드'],
      ['개발 2번 방', 'UI 전체'],
      ['개발 3번 방', '던전 · 몬스터 · 보스 · 핵심 규칙 · 기록 검증 · 봇'],
      ['에셋 방', '도트 그림 · 애니메이션 · 효과음 · 음악'],
    ],
    flowTitle: '패치 하나가 나가는 순서',
    flow: [
      '중앙관리자 방이 무엇을 왜 고칠지 지시서(md 파일)로 써요.',
      '개발 방은 자기 작업 폴더(git worktree)에서만 고치고, 타입 검사와 단위 시험만 돌려요. 화면은 제가 직접 봐요.',
      '중앙관리자 방이 결과를 클라우드에서 다시 받아 타입 검사와 시험 2,400여 개를 전부 돌려 확인해요.',
      '제가 화면에서 확인한 뒤 태그를 달면, GitHub Actions가 Windows · macOS · Steam용 파일을 만들어 올려요.',
      '설치형 게임은 켤 때 자동으로 업데이트돼요. 패치 노트는 출시가 끝난 뒤에 그림과 함께 써요.',
    ],
    artTitle: '그림과 소리',
    art: [
      '도트 그림은 Claude가 Python으로 그리는 스크립트를 써서 픽셀 단위로 뽑았어요. 마을 건물은 먼저 간단한 3D 모델로 만든 뒤 도트로 래스터해서, 앞뒤 순서와 바닥 판정까지 같은 모델에서 뽑아요.',
      '효과음 약 640개와 음악 31곡은 외부 음원 없이 코드로 합성했어요. 모든 몬스터 공격 예고에는 같은 "경고 틱" 소리가 깔려서, 어둠 속에서도 소리로 피할 수 있어요.',
      '그림 방과 개발 방이 서로를 기다리지 않도록 파일 이름 · 크기 · 기준점을 약속으로 고정하고, 묶음마다 manifest.json으로 넘겼어요.',
      '게임 규칙은 화면과 분리해서 짰어요. 같은 시드와 같은 입력이면 늘 같은 결과가 나오기 때문에, 서버가 입력 기록을 다시 돌려 기록이 진짜인지 확인하고, 그 기록이 그대로 리플레이가 돼요.',
    ],
    timelineTitle: '연표',
    timeline: [
      { date: '10.15', ver: '기획', title: '기획서', body: '핵심 원칙 · 몬스터 50종 · 보스 5종 · 경제 · 내 던전 규칙을 한 문서에 정리했어요.' },
      { date: '10.17', ver: 'v0.2 ~ v0.3', title: '첫 빌드와 보스층', body: '첫 업로드 · 자동 빌드 · 서버 연결. 같은 날 보스층 · 파티 · 제련소 · 폐광산 개편까지 들어갔어요.' },
      { date: '10.18', ver: 'v0.4', title: '엠블럼과 숨은 방', body: '엠블럼 · 칭호 · 숨은 방 · 소환 확률 공개 · 쉬운 모드 · 폐광산 좀벌레. 하루에 열 번 출시했어요.' },
      { date: '10.19', ver: 'v0.5', title: '파티와 업적', body: '파티 렉 개선 · 계정 삭제 · 맥 버전 · 업적 5단계 · 용광로 손질, 그리고 멈춤 긴급 수정.' },
      { date: '10.21', ver: 'v0.6', title: '그림대로 맞는다', body: '판정을 그림 픽셀 모양으로 바꾸고, 마을 앞뒤 그리기와 건물 충돌을 새로 만들었어요.' },
    ],
  },
  trials: {
    eyebrow: '04 — 시행착오',
    title: '그대로 된 건 하나도 없었어요',
    body: 'AI가 만들어도 처음부터 맞게 되는 건 거의 없어요. 대부분은 제가 직접 해 보고 "이상하다"고 말한 데서 고쳐졌어요. 기억에 남는 것들이에요.',
    labels: { tried: '처음 한 것', broke: '어긋난 점', fixed: '바꾼 것' },
    items: [
      {
        title: '판정: 동그라미에서 픽셀로',
        tried: '캐릭터와 공격을 동그라미 · 네모로 어림잡아 판정했어요.',
        broke: '보이는 곳을 쳐도 안 맞고, 예고 장판 밖에서 맞는 일이 생겼어요. 그림에서 자동으로 뽑은 판도 꼬리 · 흙먼지까지 몸으로 잡았고, 기절한 몬스터에 닿아도 맞는 버그가 있었어요.',
        fixed: '초안을 세 번 다시 뽑고, 판은 모양만 정하고 피해 여부는 코드 규칙이 정하게 나눴어요. 예고가 있는 공격은 판을 예고 범위 안으로 잘랐어요.',
      },
      {
        title: '마을: 누가 앞에 서 있나',
        tried: '"뒷바닥 선보다 위는 전부 캐릭터 위에 그린다"는 규칙을 썼어요.',
        broke: '앞 난간 · 울타리처럼 앞으로 나온 물체에서 틀렸어요. 바닥 판도 높이를 무시해서 신전 기둥 충돌이 계단 꼭대기에 찍혀 있었어요.',
        fixed: '픽셀마다 "그 점 아래 바닥의 줄"을 적은 16비트 정렬선 판을 3D 모델에서 뽑고, 바닥 판을 화면 좌표로 다시 투영했어요. 건물 18곳의 새는 곳이 0이 됐어요.',
      },
      {
        title: '반투명이 두 겹',
        tried: '건물 뒤에 서면 건물을 50%로 흐리게 했어요.',
        broke: '불꽃 · 물빛 애니메이션은 따로 그려져 그대로 진했고, 같은 알파를 줘도 네모 모양으로 75%가 됐어요. 애니메이션 그림이 투명 픽셀 없는 꽉 찬 네모였기 때문이에요.',
        fixed: '애니메이션이 늘 덮는 자리의 건물 픽셀을 불러올 때 지워서, 어느 픽셀이든 한 겹만 남게 했어요.',
      },
      {
        title: '용광로 난이도',
        tried: '체력 50타, 과열 때 쇳물이 쉬지 않고 쏟아지는 보스였어요.',
        broke: '너무 길고, 과열은 피하기 거의 불가능했어요. 고치고 나니 이번엔 너무 쉬워졌고, 밸브 곁 예고는 다 차도 피해가 없었어요. 두 번째로 만나면 게임이 멈추는 오류도 나왔어요.',
        fixed: '36타 · 열림당 3타로 줄이고, 과열은 묶음 → 12개 연속으로 두 번 다시 맞췄어요. 멈춤은 한 시간 안에 v0.5.3으로 고쳤어요.',
      },
      {
        title: '서버 옮기기',
        tried: 'Supabase 무료 플랜으로 시작했어요. 계정 · DB · 서버 함수가 한곳에 있어서요.',
        broke: '서버 함수가 요청당 CPU 2초라 기록 재생 검증을 잘게 나눠 돌려야 했고, 실시간 파티에는 맞지 않았어요.',
        fixed: 'Google Cloud Run(웹소켓 파티)과 Firestore(영구 저장)로 옮겼어요. 게임과 서버가 같은 TypeScript 규칙 코드를 그대로 써요.',
      },
      {
        title: '친구들이 받기를 무서워함',
        tried: 'GitHub에 설치 파일을 올려 나눠 줬어요.',
        broke: '서명 없는 exe라 Windows · 브라우저가 경고를 띄워 바이러스처럼 보였어요.',
        fixed: '경고 넘기는 방법을 README에 그림처럼 적고, 포터블 파일과 VirusTotal 검사 결과를 함께 두고, itch.io 페이지를 준비했어요.',
      },
      {
        title: '테스터 대신 봇',
        tried: '테스터가 부족해서 사람처럼 반응이 늦고 실수하는 봇을 만들어 1~25층을 돌렸어요.',
        broke: '봇은 1층에서 20판 중 19판이 죽었어요. 친구는 8층까지 갔는데요. 사람 흉내가 지나치게 가혹했어요.',
        fixed: '반응 지연 없는 "초인" 봇부터 만들고 사람 조건을 하나씩 켜는 방식으로 바꿨어요. 초인 봇도 친구처럼 8층 용광로에서 막혀요. 층별 사망 · 보스 패턴별 막타 표를 쌓고, 친구 리플레이로 보정할 예정이에요.',
      },
    ],
    hitCap: 'v0.6.0 판정. 초록은 맞는 곳, 주황은 때리는 곳이에요.',
    villageCap: '마을 앞뒤 그리기 전후. 벤치 앞 · 나무 몸통 뒤 · 울타리 앞.',
    furnaceCap: '멈추지 않는 용광로를 손질하며 새로 그린 화구 · 경고등 · 쇳물 · 증기구.',
  },
  tools: {
    eyebrow: '05 — 도구와 비용',
    title: '쓴 도구, 든 돈',
    body: '게임에 들어간 것은 전부 오픈소스이거나 무료 사용량 안에서 썼어요. 돈이 드는 건 사실상 Claude 하나예요.',
    head: ['도구', '어디에 썼나'],
    rows: [
      ['Claude (앱 대화 · Opus / Sonnet)', '기획 · 코드 · 도트 그림 · 효과음 · 음악 · 검증 · 패치 노트 · 이 페이지까지 전부'],
      ['TypeScript · Phaser 3', '게임 엔진과 게임 규칙. 서버도 같은 규칙 코드를 써요'],
      ['Electron · electron-builder · electron-updater', 'Windows · macOS 설치 파일과 자동 업데이트'],
      ['esbuild · tsx (node:test)', '빌드와 단위 시험 2,400여 개'],
      ['Python · Pillow', '도트 그림 · 애니메이션 · 판정 판 · 패치 노트 그림을 그리는 스크립트'],
      ['Google Cloud Run · Firestore', '게임 서버(계정 · 친구 · 파티 · 기록 검증)와 저장소'],
      ['GitHub · GitHub Actions', '비공개 코드 저장소 · 자동 빌드 · 공개 배포 저장소'],
      ['Galmuri (SIL OFL)', '게임 안 한글 도트 글꼴'],
      ['itch.io · Steam', '배포 준비 (Steam 플레이테스트 예정)'],
    ],
    costHead: ['항목', '공개 요금 기준 추정'],
    costs: [
      ['Claude 유료 요금제 (Max)', '월 $100 ~ $200'],
      ['Google Cloud Run · Firestore', '$0 (친구 규모라 무료 사용량 안)'],
      ['GitHub · Actions', '$0 (무료 범위)'],
      ['qminlab.com 도메인 (Cloudflare)', '연 약 $10.46'],
      ['Steam Direct 등록비', '$100 (게임당 1번, 매출 $1,000 넘으면 돌려받음)'],
      ['엔진 · 글꼴 · 라이브러리', '$0 (오픈소스)'],
    ],
    total: '첫 달 합계 추정: 약 $210 ~ $310',
    note: '영수증이 아니라 각 서비스의 공개 요금으로 계산한 추정이에요. Claude 요금제는 딥홀드만이 아니라 다른 프로젝트에도 같이 썼어요.',
  },
  now: {
    eyebrow: '06 — 지금과 다음',
    title: '아직 아무도 끝까지 못 갔어요',
    items: [
      ['지금', 'v0.6.0 · 친구들이 테스트 중. 가장 깊이 간 친구는 8층(2바이옴 보스 용광로)이에요. 저도 아직 끝까지 못 깼어요.'],
      ['다음', '친구 리플레이로 층별 난이도 다듬기 · 봇 보정 · 남은 보스 손질'],
      ['공개', '게임물관리위원회 시험용 게임물 확인 → Steam 플레이테스트(한국 50명부터) → 언어 패치 후 해외'],
      ['개발비', '텀블벅 펀딩과 지원사업을 준비하고 있어요'],
    ],
    outro: '직접 해 보고 싶다면 최신 버전을 받아 보세요. 의견은 GitHub Issues로 받아요.',
  },
  footer: { copy: '© 2026 QMINLAB. 딥홀드의 코드와 에셋은 무단으로 복제 · 재배포할 수 없어요. 플레이 영상과 스크린샷은 자유롭게 올려도 돼요.', home: 'qminlab 처음으로' },
};

const en: CaseFile = {
  meta: {
    title: 'DeepHold — Case file QL-004 · qminlab',
    description: 'DeepHold is a hardcore 2.5D pixel action game where you go down with a single lantern. The game, its world, how it was made with AI, what went wrong, and every tool and cost.',
  },
  back: '← qminlab',
  file: 'FILE QL-004 / GAME / CASE FILE',
  status: 'In development · v0.6.0 · friend test',
  title: 'DeepHold',
  lead: 'One lantern, a dungeon that never stops getting deeper. Farm random dungeons, build your own dungeon from the loot, and dare your friends to beat it — a 2.5D pixel action game for PC. Design, code, art and sound were all made by one person talking with Claude.',
  cta: { download: 'Get the latest build', notes: 'Patch notes' },
  stats: [
    { n: '5', l: 'biomes (endless from 13)' },
    { n: '50', l: 'monsters · 5 bosses' },
    { n: '3', l: 'hits and you’re out' },
    { n: '25', l: 'releases in 5 days' },
    { n: '2,400+', l: 'automated tests' },
    { n: '0', l: 'lines written by hand' },
  ],
  toc: [
    { id: 'intro', label: 'The game' },
    { id: 'world', label: 'The world' },
    { id: 'making', label: 'How it’s made' },
    { id: 'trials', label: 'What went wrong' },
    { id: 'tools', label: 'Tools & cost' },
    { id: 'now', label: 'Now & next' },
  ],
  intro: {
    eyebrow: '01 — The game',
    title: 'Nothing gets stronger except you',
    body: [
      'DeepHold mixes top-down real-time action with roguelite farming and dungeon building. Every floor down brings more and faster monsters, and better loot. Whether to turn back now or risk one more floor is always your call, as long as your three hearts last.',
      'What you bring back builds a dungeon of your own: lay traps, place the monsters you summoned, and send your friends a challenge. Who goes deepest, and whose dungeon is the cruelest?',
    ],
    rulesTitle: 'Five rules',
    rules: [
      ['No growth', 'Attack, health and speed never go up. No gear, no stats, no levels.'],
      ['Three hits', 'One hit costs one heart. The only healing is a rare potion.'],
      ['Hard and stingy', 'Monsters are strong; good floors and currency are rare.'],
      ['Never unfair', 'Every attack has a wind-up. A death should feel like your own mistake.'],
      ['Same monster, same moves', 'Deeper floors only speed attacks up; patterns never change.'],
    ],
    loopTitle: 'One expedition',
    loop: [
      'Take nothing but your lantern down the dungeon gate.',
      'Each floor rolls a new map, a new monster cast and a floor type (traps, hunters, treasure vault, soul-flame altar…).',
      'Loot only reaches your storehouse if you walk out through the escape portal on floors 3, 6 and 9. Die and you lose what you carry.',
      'The last floor of each biome has a separate boss door. Going in is your choice.',
      'Back in the village: settle up, build your dungeon, summon monsters, go down again.',
    ],
    controlsTitle: 'Controls',
    controls: [
      ['Move', 'WASD · arrow keys'],
      ['Attack', 'J'],
      ['Roll (first half invulnerable)', 'K'],
      ['Interact', 'E'],
      ['Potion', 'Q'],
      ['Hold facing', 'L (while held)'],
      ['Map (the game keeps running)', 'Tab'],
    ],
  },
  world: {
    eyebrow: '02 — The world',
    title: 'A fallen kingdom, the Last Lantern',
    body: [
      'Under the ground lies a kingdom that collapsed long ago. Over its entrance, in the foggy ruins, a handful of tents and shacks make a small camp, and one great lantern in the middle lights all of it. That is why the village is called the Last Lantern.',
      'You play a nameless digger whose lantern is the only light. Most of the screen is dark, and only enemy eyes glow red in it. Ore and bitumen dug in the old mine are smelted into ingots at the village smelter.',
      'Every depth shows a different face of the kingdom. Each of the five biomes has one legendary boss, and every boss is beaten by using its room.',
    ],
    villageCap: 'The village, the Last Lantern: dungeon gate, smelter, summoning temple, record stone, challenge board and the old mine.',
    placesTitle: 'Five depths and their masters',
    places: [
      { img: 'room_moss_graveyard', name: 'Moss Graveyard', floors: 'Floors 1–3', boss: 'Gravekeeper Spider King', bossImg: 'boss_spider_king', line: 'A round crypt with four pillars. Bait the king down from the ceiling and hit its upturned belly.' },
      { img: 'room_rusted_workshop', name: 'Rusted Workshop', floors: 'Floors 4–6', boss: 'Endless Furnace', bossImg: 'boss_endless_furnace', line: 'A furnace built into the wall over conveyor floors. Break three cooling valves to open its mouth.' },
      { img: 'room_sunken_temple', name: 'Sunken Temple', floors: 'Floors 7–9', boss: 'Drowned King', bossImg: 'boss_drowned_king', line: 'The water rises every phase and the footing shrinks. Strike while the trident is away.' },
      { img: 'room_lava_vein', name: 'Lava Vein', floors: 'Floors 10–12', boss: 'Sleeping Dragon', bossImg: 'boss_sleeping_dragon', line: 'It starts asleep. Sneak in for the first hit, and finish before every pillar breaks.' },
      { img: 'room_black_abyss', name: 'Black Abyss', floors: 'Floor 13 and endless', boss: 'Lantern Swallower', bossImg: 'boss_lantern_swallower', line: 'A room with no light at all. Light the pillars to make it vulnerable — until it swallows your lantern too.' },
    ],
    mineCap: 'The old mine: no monsters, just a pickaxe. Ore only glints where your lantern reaches.',
  },
  making: {
    eyebrow: '03 — How it’s made',
    title: 'One person and a handful of Claude chats',
    body: [
      'All of DeepHold’s code, art, sound and music was made by Claude. I decided what to build, played it, said what felt wrong and pressed the release button. I didn’t write a single line of code myself.',
      'One chat couldn’t hold it all, so the work is split into chats by role. Chats can’t see each other, so the central chat writes each order as a file and I send each chat one line: “read this file and do it.”',
    ],
    roomsTitle: 'The chats',
    rooms: [
      ['Design', 'The design doc; odds and numbers sampled from well-known hardcore games'],
      ['Central', 'Version calls, orders for each chat, verifying every result, release checks, patch notes, promotion and funding'],
      ['Dev 1', 'Party, camera, village, collision editor, admin page, server, builds'],
      ['Dev 2', 'All UI'],
      ['Dev 3', 'Dungeons, monsters, bosses, core rules, run verification, test bots'],
      ['Assets', 'Pixel art, animation, sound effects, music'],
    ],
    flowTitle: 'How one patch ships',
    flow: [
      'The central chat writes what to change and why as an order file (markdown).',
      'A dev chat works only in its own folder (a git worktree) and runs only type checks and unit tests. I look at the screen myself.',
      'The central chat pulls the result into the cloud and re-runs the type check and all 2,400-odd tests.',
      'After I check it in the game and push a tag, GitHub Actions builds Windows, macOS and Steam files.',
      'Installed copies update themselves on launch. Patch notes, with pictures, are written only after the release is out.',
    ],
    artTitle: 'Art and sound',
    art: [
      'The pixel art comes from Python drawing scripts Claude wrote, pixel by pixel. Village buildings start as simple 3D models that are rasterised into pixels, so draw order and floor collision come from the same model.',
      'About 640 sound effects and 31 music tracks were synthesised in code, with no outside audio. Every monster wind-up shares one “warning tick,” so you can dodge by sound in the dark.',
      'So the art and dev chats never wait on each other, file names, sizes and anchor points are fixed by contract and every bundle ships with a manifest.json.',
      'Game rules are separate from rendering and fully deterministic: the same seed and inputs always give the same result. The server replays your inputs to verify a record, and that record doubles as a replay.',
    ],
    timelineTitle: 'Timeline (2026)',
    timeline: [
      { date: 'Oct 15', ver: 'Design', title: 'Design doc', body: 'Core rules, 50 monsters, 5 bosses, the economy and dungeon-building rules in one document.' },
      { date: 'Oct 17', ver: 'v0.2 – v0.3', title: 'First build, boss floors', body: 'First upload, automated builds, server. Boss floors, parties, the refinery and a new mine the same day.' },
      { date: 'Oct 18', ver: 'v0.4', title: 'Emblems and secrets', body: 'Emblems, titles, secret rooms, public summon odds, easy mode, mine silverfish. Ten releases in one day.' },
      { date: 'Oct 19', ver: 'v0.5', title: 'Parties and achievements', body: 'Less party lag, account deletion, a Mac build, five-tier achievements, a furnace rework — and a crash hotfix.' },
      { date: 'Oct 21', ver: 'v0.6', title: 'Hit what you see', body: 'Hit detection follows sprite pixels; the village gets proper draw order and building collision.' },
    ],
  },
  trials: {
    eyebrow: '04 — What went wrong',
    title: 'Nothing worked the first time',
    body: 'AI-made doesn’t mean right the first time. Most fixes started with me playing it and saying “this feels off.” The ones I remember:',
    labels: { tried: 'First try', broke: 'What broke', fixed: 'What changed' },
    items: [
      {
        title: 'Hit detection: circles to pixels',
        tried: 'Characters and attacks were approximated with circles and boxes.',
        broke: 'Hits on what you could see didn’t land, and you could be hit outside a warning. Masks traced from sprites caught tails and dust, and stunned monsters still hurt on touch.',
        fixed: 'Three rounds of drafts; masks now decide only the shape while code rules decide whether it hurts, and telegraphed attacks are clipped to their warning.',
      },
      {
        title: 'Village: who stands in front',
        tried: 'A rule: “everything above the back floor edge draws over characters.”',
        broke: 'It failed on railings and fences that stick out. The floor maps also ignored height, so temple pillar collision sat at the top of the stairs.',
        fixed: '16-bit sort maps, one floor row per pixel, baked from the 3D models; floor maps re-projected to screen space. Leaks across all 18 buildings dropped to zero.',
      },
      {
        title: 'Double transparency',
        tried: 'Buildings fade to 50% when you walk behind them.',
        broke: 'Flame and water animations stayed solid, and even with the same alpha they showed a 75% box — the animation frames were solid rectangles.',
        fixed: 'Building pixels always covered by an animation are cut at load time, so every pixel has one layer.',
      },
      {
        title: 'Tuning the furnace',
        tried: 'A 50-hit boss whose overheat poured molten metal non-stop.',
        broke: 'Too long, overheat near-impossible; then too easy after the fix. A valve warning did no damage, and meeting it twice froze the game.',
        fixed: '36 hits, 3 hits per opening, overheat retuned twice (bundles, then 12 in a row). The freeze was fixed within the hour in v0.5.3.',
      },
      {
        title: 'Moving the server',
        tried: 'Started on Supabase’s free plan: accounts, database and functions in one place.',
        broke: 'Functions get 2 s of CPU per request, so replay checks had to be chopped up, and real-time parties didn’t fit.',
        fixed: 'Moved to Google Cloud Run (WebSocket parties) and Firestore. Game and server share the same TypeScript rules.',
      },
      {
        title: 'Friends were scared to download',
        tried: 'Installers were shared through GitHub.',
        broke: 'Unsigned .exe files trigger Windows and browser warnings and look like malware.',
        fixed: 'Step-by-step warning notes, a portable build, a VirusTotal scan, and an itch.io page in the works.',
      },
      {
        title: 'Bots instead of testers',
        tried: 'Too few testers, so a bot with human-like reaction time and mistakes plays floors 1–25.',
        broke: 'It died on floor 1 in 19 of 20 runs, while a friend reached floor 8. The human model was far too harsh.',
        fixed: 'A “superhuman” bot first, then human limits switched on one at a time. Like my friend, it stalls at the floor-8 furnace. Deaths per floor and killing blows per boss pattern are logged, to be calibrated against friends’ replays.',
      },
    ],
    hitCap: 'v0.6.0 hit masks: green is where it can be hit, orange is where it hits.',
    villageCap: 'Village draw order, before and after: in front of a bench, behind a tree trunk, in front of a fence.',
    furnaceCap: 'New furnace art from the rework: mouth, warning lamp, molten metal, steam vents.',
  },
  tools: {
    eyebrow: '05 — Tools & cost',
    title: 'What it took',
    body: 'Everything inside the game is open source or within free tiers. The only real cost is Claude.',
    head: ['Tool', 'Used for'],
    rows: [
      ['Claude (app chats · Opus / Sonnet)', 'Design, code, pixel art, sound, music, verification, patch notes — and this page'],
      ['TypeScript · Phaser 3', 'Engine and game rules; the server runs the same rules'],
      ['Electron · electron-builder · electron-updater', 'Windows and macOS installers, auto-update'],
      ['esbuild · tsx (node:test)', 'Builds and 2,400-odd unit tests'],
      ['Python · Pillow', 'Scripts that draw the pixel art, animations, hit masks and patch-note images'],
      ['Google Cloud Run · Firestore', 'Game server (accounts, friends, parties, run verification) and storage'],
      ['GitHub · GitHub Actions', 'Private code repo, automated builds, public release repo'],
      ['Galmuri (SIL OFL)', 'Korean pixel font in the game'],
      ['itch.io · Steam', 'Distribution (Steam playtest planned)'],
    ],
    costHead: ['Item', 'Estimate from public prices'],
    costs: [
      ['Claude paid plan (Max)', '$100 – $200 / month'],
      ['Google Cloud Run · Firestore', '$0 (friend-sized, inside the free tier)'],
      ['GitHub · Actions', '$0 (free tier)'],
      ['qminlab.com domain (Cloudflare)', '≈ $10.46 / year'],
      ['Steam Direct fee', '$100 (once per game, refunded after $1,000 in revenue)'],
      ['Engine, fonts, libraries', '$0 (open source)'],
    ],
    total: 'Estimated first month: about $210 – $310',
    note: 'Estimates from each service’s public pricing, not receipts. The Claude plan is shared with my other projects, not only DeepHold.',
  },
  now: {
    eyebrow: '06 — Now & next',
    title: 'Nobody has reached the bottom yet',
    items: [
      ['Now', 'v0.6.0, tested by friends. The deepest run so far is floor 8 (the second biome boss, the furnace). I haven’t beaten it either.'],
      ['Next', 'Tune difficulty floor by floor from friends’ replays, calibrate the bots, rework the remaining bosses'],
      ['Release', 'Korean rating-board test certification → Steam playtest (50 players in Korea first) → translations and a global release'],
      ['Funding', 'Preparing a Tumblbug crowdfunding campaign and grant applications'],
    ],
    outro: 'Want to try it? Grab the latest build. Feedback goes to GitHub Issues.',
  },
  footer: { copy: '© 2026 QMINLAB. DeepHold’s code and assets may not be copied or redistributed. Gameplay videos and screenshots are welcome.', home: 'Back to qminlab' },
};

export const DEEPHOLD: Record<'ko' | 'en', CaseFile> = { ko, en };
