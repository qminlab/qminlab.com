/**
 * Where each project can be reached outside this site, keyed by project code. URLs are the same in every
 * language, so they live here rather than in messages/*.json; the button labels come from `linkKinds`.
 * Add a line when a project ships somewhere (App Store, Google Play, a download, a playable build).
 */
export type LinkKind = 'github' | 'appstore' | 'googleplay' | 'download' | 'web' | 'play';
export type ProjectLink = { kind: LinkKind; href: string };

import { gh } from './identity';

/** The studio's own GitHub profile, shown under the contact email. */
export { GITHUB, GH_USER } from './identity';

export const LINKS: Record<string, ProjectLink[]> = {
  'QL-001': [{ kind: 'github', href: gh('weming') }],
  'QL-004': [{ kind: 'download', href: gh('deephold-releases/releases/latest') }],
  'QL-005': [{ kind: 'github', href: gh('claude-board') }],
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

export const linksFor = (code: string) => LINKS[code] ?? [];
