/**
 * Who is behind the site, in one place. AI search engines and Google match a person across pages by these
 * exact strings, so every page, the JSON-LD and the footer read them from here instead of spelling them again.
 * Brand is always written `qminlab` (same as the domain); the person is 김규민 / Gyumin Kim.
 */
export const SITE = 'https://qminlab.com';
export const BRAND = 'qminlab';
export const EMAIL = 'hello@qminlab.com';

/** GitHub account. Every GitHub link on the site is built from GH_USER. */
export const GH_USER = 'qminlab';
export const GITHUB = `https://github.com/${GH_USER}`;
export const gh = (repo: string) => `${GITHUB}/${repo}`;

/** Naver Search Advisor ownership check. Must stay in <head> of `/` and every page. */
export const NAVER_VERIFY = 'b0bc7b52249b189ee77b3211fd147baecdccc672';

/** Share card for every page without its own image (1200×630, public/og.png). */
export const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: '김규민 (Gyumin Kim) · qminlab' };

/** Date the facts on the profile, FAQ and case pages were last checked by hand (shown on those pages). */
export const UPDATED = '2026-10-22';

export const PERSON = {
  ko: { name: '김규민', role: 'AI 크리에이터', city: '대구' },
  en: { name: 'Gyumin Kim', role: 'AI creator', city: 'Daegu, South Korea' },
};

/** Profiles of the same person elsewhere, for `sameAs`. Add LinkedIn, YouTube and so on as they go up. */
export const INSTAGRAM = 'https://www.instagram.com/qminlab/';
export const THREADS = 'https://www.threads.com/@qminlab';
export const VELOG = 'https://velog.io/@qminlab';
export const LINKEDIN = 'https://www.linkedin.com/in/qminlab';
export const SAME_AS = [GITHUB, LINKEDIN, INSTAGRAM, THREADS, VELOG];

/** Devlogs published on other sites (velog, GPTers). Linked as `subjectOf` so engines tie them back to the person. */
export const WRITING = [
  { name: 'Claude Code로 혼자 PC 게임 만들기 (velog)', url: `${VELOG}/claude-code-solo-pc-game` },
  { name: 'Claude Code 훅으로 승인 대기판 만들기 (velog)', url: `${VELOG}/claude-code-hooks-wait-board` },
  { name: 'Claude Code로 혼자 PC 게임 만들기 (GPTers)', url: 'https://www.gpters.org/dev/post/claude-codero-honja-pc-geim-mandeulgi-daehwabang-6gaero-yeoghaleul-nanweo-312DQN9bmegfyP9' },
  { name: 'Claude Code 훅으로 승인 대기판 만들기 (GPTers)', url: 'https://www.gpters.org/llm-service/post/claude-code-hug-hooks-euro-yeoreo-jageobyi-seungin-daegireul-aipaedeue-A1T9yIzOplloWAr' },
];

/** schema.org Person, shared by every page that names the creator. */
export function personLd(locale: 'ko' | 'en') {
  const p = PERSON[locale];
  return {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: p.name,
    alternateName: locale === 'ko' ? [PERSON.en.name, BRAND] : [PERSON.ko.name, BRAND],
    jobTitle: p.role,
    email: `mailto:${EMAIL}`,
    url: `${SITE}/${locale}/about/`,
    homeLocation: { '@type': 'Place', name: p.city },
    knowsAbout: ['Claude Code', 'Claude Code hooks', 'Claude API', 'AI agents', 'Multi-agent workflows', 'Generative AI', 'AI animation', 'Indie game development', 'React Native', 'Expo', 'Firebase', 'Phaser', 'Electron', 'Seedance', 'ElevenLabs'],
    sameAs: SAME_AS,
    subjectOf: WRITING.map((w) => ({ '@type': 'Article', name: w.name, url: w.url, author: { '@id': `${SITE}/#person` } })),
    worksFor: { '@id': `${SITE}/#org` },
  };
}

export function orgLd() {
  return {
    '@type': 'Organization',
    '@id': `${SITE}/#org`,
    name: BRAND,
    url: SITE,
    email: `mailto:${EMAIL}`,
    founder: { '@id': `${SITE}/#person` },
    sameAs: SAME_AS,
  };
}

/** Renders JSON-LD into the page; `<` is escaped so text can never close the script tag. */
export const ldScript = (data: object) => ({ __html: JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c') });
