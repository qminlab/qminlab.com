/**
 * Where each project can be reached outside this site, keyed by project code. URLs are the same in every
 * language, so they live here rather than in messages/*.json; the button labels come from `linkKinds`.
 * Add a line when a project ships somewhere (App Store, Google Play, a download, a playable build).
 */
export type LinkKind = 'github' | 'appstore' | 'googleplay' | 'download' | 'web' | 'play';
export type ProjectLink = { kind: LinkKind; href: string };

export const LINKS: Record<string, ProjectLink[]> = {
  'QL-005': [{ kind: 'github', href: 'https://github.com/starMinK/claude-board' }],
};

export const linksFor = (code: string) => LINKS[code] ?? [];
