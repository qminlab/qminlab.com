import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { PROFILE } from '@/content/profile';
import { DocShell, Facts, Section, linkStyle } from '@/components/doc/DocShell';
import { BONE, LINE, MUTED } from '@/lib/tokens';
import { SITE, UPDATED, ldScript, orgLd, personLd } from '@/lib/identity';

const pick = (locale: string) => (locale === 'ko' ? 'ko' : 'en') as 'ko' | 'en';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = PROFILE[pick(locale)];
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: { canonical: `/${locale}/about/`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/about/`])) },
    openGraph: { type: 'profile', title: c.meta.title, description: c.meta.description, url: `/${locale}/about/` },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = pick(locale);
  const c = PROFILE[l];
  const a = c.about;
  // Google ProfilePage: the page is about one Person, with the dates a human last edited it.
  const ld = {
    '@graph': [
      { '@type': 'ProfilePage', '@id': `${SITE}/${l}/about/`, url: `${SITE}/${l}/about/`, name: c.meta.title, inLanguage: l, dateModified: UPDATED, mainEntity: { '@id': `${SITE}/#person` } },
      personLd(l),
      orgLd(),
    ],
  };
  return (
    <DocShell ko={l === 'ko'} back={c.back} eyebrow={a.eyebrow} title={a.title} updated={c.updated}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
      <p style={{ margin: 0, fontSize: 18, color: BONE }}>{a.lead}</p>
      <Section title={a.factsTitle}>
        <Facts rows={a.facts.map((f) => ({ label: f.label, value: f.value }))} />
      </Section>
      <Section title={a.workTitle}>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 20 }}>
          {a.work.map((w) => (
            <li key={w.name} style={{ paddingTop: 16, borderTop: `1px solid ${LINE}`, display: 'grid', gap: 6 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: BONE }}>{w.name}</h3>
              <p style={{ margin: 0 }}>{w.what}</p>
              <p style={{ margin: 0, fontSize: 14, color: MUTED }}>{w.tools} · {w.status}</p>
              <a href={w.href} style={{ ...linkStyle, fontSize: 14, alignSelf: 'start' }}>{w.link} →</a>
            </li>
          ))}
        </ol>
      </Section>
      <Section title={a.howTitle}>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>{a.how.map((h) => <li key={h}>{h}</li>)}</ul>
      </Section>
      <Section title={a.contactTitle}>
        <p style={{ margin: 0 }}>{a.contact}</p>
        <a href="../faq/" style={linkStyle}>{a.faqLink}</a>
      </Section>
    </DocShell>
  );
}
