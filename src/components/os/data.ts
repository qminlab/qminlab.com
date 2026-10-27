/**
 * Everything the Qmin OS home screen shows, read on the server from messages/<locale>.json, the profile copy and
 * the link tables, so the engine never repeats a project fact. Keys are the engine's short names for projects.
 */
import { PROFILE } from '@/content/profile';
import { CASES, linksFor } from '@/lib/links';
import { EMAIL, GH_USER, GITHUB, SITE } from '@/lib/identity';
import { routing } from '@/i18n/routing';

const KEY: Record<string, string> = { 'QL-001': 'weming', 'QL-002': 'jarvis', 'QL-003': 'tft', 'QL-004': 'deephold', 'QL-005': 'board', 'QL-006': 'sword' };
const KIND: Record<string, string> = { APP: 'app', GAME: 'game', ANIME: 'anime', TOOL: 'tool', PROGRAM: 'program' };
/** Preview image of a project page's top, made by scripts/build-doc-thumbs.mjs (same naming). */
const thumbOf = (href: string) => `/os/docs/${href.replace(/^\/|\/$/g, '').replace(/\//g, '_')}.jpg`;
const LANG_LABEL: Record<string, string> = { ko: '한국어', en: 'EN' };

/** Past homepages, rebuilt by scripts/build-archive.sh into public/archive/<date>/. The last entry is this one. */
const ARCHIVE = ['2026-10-08', '2026-10-16'];

type Project = { code: string; name: string; type: string; st: string; one: string; desc?: string; platform: string; stage: string; stageLine: string; stack: string };
type Messages = { projects: Project[]; types: Record<string, string>; status: Record<string, string>; linkKinds: Record<string, string>; hero: { brand: string[] }; lab: { tabs: { title: string; body: string }[] } };

export type OsProject = Omit<Project, 'type'> & { type: string; stl: string; kind: string; links: [string, string][]; caseHref: string; caseLabel: string; caseExt: boolean };
export type OsPayload = {
  locale: 'ko' | 'en';
  github: string;
  ghUser: string;
  email: string;
  brand: string[];
  langs: { code: string; label: string }[];
  projects: Record<string, OsProject>;
  order: string[];
  /**
   * Every project link, each its own item on the home screen: pages on this site (production notes, trial and error,
   * asset gallery, the DeepHold site) carry a preview `thumb` and open inside; links elsewhere (GitHub, a download,
   * the stores) carry their link kind in `out` and open in a new tab.
   */
  docs: { k: string; project: string; name: string; what: string; href: string; thumb?: string; out?: string }[];
  about: { lead: string; facts: { label: string; value: string }[] };
  rules: { title: string; body: string }[];
  versions: { url: string; shot: string }[];
};

// English labels in messages are uppercase for the old design; Apple UI uses sentence case.
const sentence = (s: string, locale: string) => (locale === 'en' ? s.charAt(0) + s.slice(1).toLowerCase() : s);

export function osData(locale: string, m: Messages): OsPayload {
  const l = locale === 'ko' ? 'ko' : 'en';
  const projects: Record<string, OsProject> = {};
  const order: string[] = [];
  const docs: OsPayload['docs'] = [];
  for (const p of m.projects) {
    const key = KEY[p.code];
    if (!key) continue;
    order.push(key);
    const isDeep = p.code === 'QL-004';
    projects[key] = {
      ...p,
      type: sentence(m.types[p.type] ?? p.type, l),
      stl: sentence(m.status[p.st] ?? p.st, l),
      kind: p.st === 'paused' ? 'paused' : KIND[p.type] ?? 'app',
      links: linksFor(p.code, l).map((x) => [m.linkKinds[x.kind] ?? x.kind, x.href]),
      caseHref: CASES[p.code] ? `/${l}/${CASES[p.code]}` : '',
      caseExt: isDeep,
      caseLabel: isDeep ? (l === 'ko' ? '딥홀드 사이트' : 'DeepHold site') : l === 'ko' ? '케이스 파일' : 'Case file',
    };
    // "위밍 시행착오", "Weming trial and error": the project's full name, then what the page is.
    const doc = (kind: string, label: string, href: string) => {
      const inside = href.startsWith('/');
      const what = l === 'en' && /^[A-Z][a-z]/.test(label) ? label.charAt(0).toLowerCase() + label.slice(1) : label;
      docs.push({ k: `${key}-${kind}`, project: key, name: `${p.name} ${what}`, what: label, href, ...(inside ? { thumb: thumbOf(href) } : { out: kind }) });
    };
    if (isDeep) doc('site', l === 'ko' ? '사이트' : 'Site', projects[key].caseHref);
    for (const x of linksFor(p.code, l)) doc(x.kind, m.linkKinds[x.kind] ?? x.kind, x.href.startsWith(SITE) ? x.href.slice(SITE.length) : x.href);
  }
  const a = PROFILE[l].about;
  return {
    locale: l,
    github: GITHUB,
    ghUser: GH_USER,
    email: EMAIL,
    brand: m.hero.brand,
    langs: routing.locales.map((code) => ({ code, label: LANG_LABEL[code] ?? code.toUpperCase() })),
    projects,
    order,
    docs,
    about: { lead: a.lead, facts: a.facts.slice(0, 4) },
    rules: m.lab.tabs.map((t) => ({ title: t.title, body: t.body })),
    versions: [...ARCHIVE.map((d, i) => ({ url: `/archive/${d}/${l}/`, shot: `/os/v${i + 1}.jpg` })), { url: `/${l}/`, shot: `/os/v${ARCHIVE.length + 1}.jpg` }],
  };
}
