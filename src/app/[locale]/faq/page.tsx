import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { PROFILE } from '@/content/profile';
import { DocShell, linkStyle } from '@/components/doc/DocShell';
import { BONE, LINE } from '@/lib/tokens';
import { SITE, UPDATED, ldScript } from '@/lib/identity';

const pick = (locale: string) => (locale === 'ko' ? 'ko' : 'en') as 'ko' | 'en';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = PROFILE[pick(locale)].faq.meta;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/${locale}/faq/`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/faq/`])) },
    openGraph: { title: m.title, description: m.description, url: `/${locale}/faq/` },
  };
}

/** Bare URLs inside answers become links; the text itself stays exactly as written. */
function Linked({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return <>{parts.map((p, i) => (/^https?:\/\//.test(p) ? <a key={i} href={p} style={linkStyle}>{p}</a> : p))}</>;
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = pick(locale);
  const c = PROFILE[l];
  const f = c.faq;
  // FAQ rich results are gone from Google (2026-05), but the markup still states each pair plainly for any reader.
  const ld = {
    '@type': 'FAQPage',
    '@id': `${SITE}/${l}/faq/`,
    inLanguage: l,
    dateModified: UPDATED,
    about: { '@id': `${SITE}/#person` },
    mainEntity: f.items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a.join(' ') } })),
  };
  return (
    <DocShell ko={l === 'ko'} back={c.back} eyebrow={f.eyebrow} title={f.title} updated={c.updated}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
      <p style={{ margin: 0, fontSize: 18, color: BONE }}>{f.lead}</p>
      <div style={{ display: 'grid', gap: 32 }}>
        {f.items.map((it) => (
          <section key={it.q} style={{ paddingTop: 20, borderTop: `1px solid ${LINE}`, display: 'grid', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.4, color: BONE }}>{it.q}</h2>
            {it.a.map((p) => <p key={p} style={{ margin: 0, overflowWrap: 'anywhere' }}><Linked text={p} /></p>)}
          </section>
        ))}
      </div>
      <a href="../about/" style={linkStyle}>{f.aboutLink}</a>
    </DocShell>
  );
}
