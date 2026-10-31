/**
 * Where each project can be reached outside this site, keyed by project code. URLs are the same in every
 * language, so they live here rather than in messages/*.json; the button labels come from `linkKinds`.
 * Add a line when a project ships somewhere (App Store, Google Play, a download, a playable build).
 */
export type LinkKind = 'github' | 'appstore' | 'googleplay' | 'download' | 'web' | 'play' | 'notes' | 'trials' | 'assets';
export type ProjectLink = { kind: LinkKind; href: string };

import { gh, SITE } from './identity';

/** The studio's own GitHub profile, shown under the contact email. */
export { GITHUB, GH_USER } from './identity';

export const LINKS: Record<string, ProjectLink[]> = {
  'QL-001': [{ kind: 'appstore', href: 'https://apps.apple.com/kr/app/%EC%9C%84%EB%B0%8D/id6818257959' }, { kind: 'github', href: gh('weming') }, { kind: 'trials', href: `${SITE}/{locale}/trials/weming/` }],
  'QL-004': [{ kind: 'download', href: gh('deephold-releases/releases/latest') }, { kind: 'trials', href: `${SITE}/{locale}/trials/deephold/` }, { kind: 'assets', href: `${SITE}/deephold-assets/` }],
  'QL-005': [{ kind: 'github', href: gh('claude-board') }, { kind: 'trials', href: `${SITE}/{locale}/trials/claude-board/` }],
  'QL-006': [{ kind: 'notes', href: `${SITE}/notes/sword-master-rsa5m/` }],
};

/**
 * Projects with their own case-file page on this site (/<locale>/<path>/), keyed by project code.
 * Others fall back to the registry on the same page.
 */
export const CASES: Record<string, string> = {
  'QL-001': 'work/ql-001/',
  'QL-002': 'work/ql-002/',
  'QL-003': 'work/ql-003/',
  'QL-004': 'deephold/',
  'QL-005': 'work/ql-005/',
  'QL-006': 'work/ql-006/',
};
export const caseHref = (code: string, fallback: string) => CASES[code] ?? fallback;

/** `{locale}` in an href (pages on this site that exist in every language) becomes the reader's language. */
export const linksFor = (code: string, locale = 'en') =>
  (LINKS[code] ?? []).map((x) => ({ ...x, href: x.href.replace('{locale}', locale === 'ko' ? 'ko' : 'en') }));
