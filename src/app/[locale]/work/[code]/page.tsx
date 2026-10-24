import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { Project } from '@/lib/projects';
import { linksFor } from '@/lib/links';
import { DocShell, Facts, Section, linkStyle } from '@/components/doc/DocShell';
import { BONE } from '@/lib/tokens';
import { BRAND, PERSON, SITE, UPDATED, ldScript } from '@/lib/identity';

/** Case files that live on this template. DeepHold (QL-004) has its own long-form page at /deephold/. */
const CODES = ['QL-001', 'QL-002', 'QL-003', 'QL-005', 'QL-006'];
/** Last public update on GitHub, where the project has a public repo. */
const PUSHED: Record<string, string> = { 'QL-001': '2026-10-15', 'QL-005': '2026-10-21' };
const KIND: Record<Project['type'], string> = { APP: 'MobileApplication', PROGRAM: 'SoftwareApplication', GAME: 'VideoGame', ANIME: 'CreativeWork', TOOL: 'SoftwareApplication' };

const L = {
  ko: { back: '← qminlab', updated: '최근 확인', file: '케이스 파일', facts: '한눈에', maker: '만든 사람', type: '유형', platform: '플랫폼', stage: '단계', stack: 'AI · 기술 스택', pushed: 'GitHub 최근 업데이트', links: '링크', versions: '버전 변화', tried: '시도', why: '아쉬운 점', now: '지금', seeVersions: '제작노트에서 버전별 영상 보기 →', about: '김규민 소개 보기 →', faq: '자주 묻는 질문 →', types: { APP: '앱', PROGRAM: '프로그램', GAME: '게임', ANIME: '애니메이션', TOOL: '생산성 도구' } },
  en: { back: '← qminlab', updated: 'Last checked', file: 'Case file', facts: 'At a glance', maker: 'Made by', type: 'Type', platform: 'Platform', stage: 'Stage', stack: 'AI and stack', pushed: 'Last GitHub update', links: 'Links', versions: 'How it evolved', tried: 'Tried', why: 'What fell short', now: 'Now', seeVersions: 'Watch each version in the production notes (Korean) →', about: 'About Gyumin Kim →', faq: 'FAQ →', types: { APP: 'App', PROGRAM: 'Program', GAME: 'Game', ANIME: 'Animation', TOOL: 'Productivity tool' } },
};

const pick = (locale: string) => (locale === 'ko' ? 'ko' : 'en') as 'ko' | 'en';
const slug = (code: string) => code.toLowerCase();

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CODES.map((c) => ({ locale, code: slug(c) })));
}

async function load(locale: string, code: string) {
  const m = (await getMessages({ locale })) as unknown as { projects: Project[] };
  return m.projects.find((p) => slug(p.code) === code && CODES.includes(p.code));
}

const flat = (s: string) => s.replace(/\n/g, ' · ');

export async function generateMetadata({ params }: { params: Promise<{ locale: string; code: string }> }): Promise<Metadata> {
  const { locale, code } = await params;
  const p = await load(locale, code);
  if (!p) return {};
  const l = pick(locale);
  const title = `${p.name} — ${L[l].file} ${p.code} · ${PERSON[l].name} · ${BRAND}`;
  const description = `${p.one} ${p.desc ?? ''} ${L[l].stack}: ${p.stack}.`.replace(/\s+/g, ' ').trim();
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/work/${code}/`, languages: Object.fromEntries(routing.locales.map((x) => [x, `/${x}/work/${code}/`])) },
    openGraph: { title, description, url: `/${locale}/work/${code}/` },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const p = await load(locale, code);
  if (!p) notFound();
  const l = pick(locale);
  const t = L[l];
  const links = linksFor(p.code);
  const ld = {
    '@type': KIND[p.type],
    '@id': `${SITE}/${l}/work/${code}/`,
    name: p.name,
    description: [p.one, p.desc].filter(Boolean).join(' '),
    inLanguage: l,
    dateModified: UPDATED,
    creator: { '@id': `${SITE}/#person` },
    publisher: { '@id': `${SITE}/#org` },
    keywords: p.stack,
    ...(links.length ? { sameAs: links.map((x) => x.href) } : {}),
  };
  const rows = [
    { label: t.maker, value: <a href="../../about/" style={linkStyle}>{PERSON[l].name} ({l === 'ko' ? PERSON.en.name : PERSON.ko.name}) · {BRAND}</a> },
    { label: t.type, value: t.types[p.type] },
    { label: t.platform, value: flat(p.platform) },
    { label: t.stage, value: p.stageLine },
    { label: t.stack, value: p.stack },
    ...(PUSHED[p.code] ? [{ label: t.pushed, value: <time dateTime={PUSHED[p.code]}>{PUSHED[p.code]}</time> }] : []),
  ];
  return (
    <DocShell ko={l === 'ko'} back={t.back} eyebrow={`FILE ${p.code} / ${t.types[p.type]} / ${t.file}`} title={p.name} updated={t.updated}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
      <div style={{ display: 'grid', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 18, color: BONE }}>{p.one}</p>
        {p.desc && <p style={{ margin: 0 }}>{p.desc}</p>}
      </div>
      <Section title={t.facts}><Facts rows={rows} /></Section>
      {p.versions && (
        <Section title={t.versions}>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 20 }}>
            {p.versions.map((x) => (
              <li key={x.v} style={{ display: 'grid', gap: 6 }}>
                <p style={{ margin: 0, color: BONE }}><b>{x.v}</b> · {x.title}</p>
                <p style={{ margin: 0 }}>{t.tried}: {x.tried}</p>
                {x.why && <p style={{ margin: 0 }}>{t.why}: {x.why}</p>}
                {x.now && <p style={{ margin: 0 }}>{t.now}: {x.now}</p>}
              </li>
            ))}
          </ol>
          <a href={`${SITE}/notes/sword-master-rsa5m/#versions`} style={linkStyle}>{t.seeVersions}</a>
        </Section>
      )}
      {links.length > 0 && (
        <Section title={t.links}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>{links.map((x) => <li key={x.href}><a href={x.href} style={linkStyle}>{x.href}</a></li>)}</ul>
        </Section>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <a href="../../about/" style={linkStyle}>{t.about}</a>
        <a href="../../faq/" style={linkStyle}>{t.faq}</a>
      </div>
    </DocShell>
  );
}
