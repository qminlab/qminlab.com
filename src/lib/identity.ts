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

/** Date the facts on the profile, FAQ and case pages were last checked by hand (shown on those pages). */
export const UPDATED = '2026-10-22';

export const PERSON = {
  ko: { name: '김규민', role: 'AI 크리에이터', city: '대구' },
  en: { name: 'Gyumin Kim', role: 'AI creator', city: 'Daegu, South Korea' },
};

/** Profiles of the same person elsewhere, for `sameAs`. Add LinkedIn, YouTube and so on as they go up. */
export const SAME_AS = [GITHUB];

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
    knowsAbout: ['Claude Code', 'Claude API', 'AI agents', 'Generative AI', 'React Native', 'Phaser', 'Seedance', 'ElevenLabs'],
    sameAs: SAME_AS,
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
