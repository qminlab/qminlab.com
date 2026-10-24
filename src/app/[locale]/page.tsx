import type { Metadata, Viewport } from 'next';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { PROFILE } from '@/content/profile';
import { QminOS } from '@/components/os/QminOS';
import { osData } from '@/components/os/data';
import { BRAND, SITE, ldScript, orgLd, personLd, OG_IMAGE } from '@/lib/identity';
import '@/styles/os.css';

export const viewport: Viewport = { themeColor: '#E9ECEF', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// The homepage is the link people share most, so it carries its own preview card like the other pages.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    openGraph: { type: 'website', siteName: BRAND, locale: locale === 'ko' ? 'ko_KR' : 'en_US', title: t('title'), description: t('description'), url: `/${locale}/`, images: [OG_IMAGE] },
  };
}

// Off-screen but readable by search engines and screen readers: the same facts the desktop shows in its windows.
const hidden = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } as const;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale === 'ko' ? 'ko' : 'en';
  const data = osData(l, (await getMessages()) as unknown as Parameters<typeof osData>[1]);
  // Who runs the site, stated once for search engines: the studio, its founder, and the site itself.
  const ld = { '@graph': [{ '@type': 'WebSite', '@id': `${SITE}/#site`, url: SITE, name: BRAND, inLanguage: l, publisher: { '@id': `${SITE}/#org` } }, orgLd(), personLd(l)] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
      <main style={hidden}>
        <h1>{BRAND} · {data.brand.join(' ')}</h1>
        <p>{data.about.lead}</p>
        <ul>
          {data.order.map((k) => {
            const p = data.projects[k];
            return (
              <li key={p.code}>
                <h2>{p.name}</h2>
                <p>{p.type} · {p.stl}. {p.one}</p>
                {p.caseHref && <a href={p.caseHref}>{p.caseLabel}</a>}
              </li>
            );
          })}
        </ul>
        <h2>{PROFILE[l].faq.title}</h2>
        <ul>
          {PROFILE[l].faq.items.map((x) => <li key={x.q}><a href={`/${l}/faq/`}>{x.q}</a></li>)}
        </ul>
        <a href={`/${l}/about/`}>{l === 'ko' ? '소개' : 'About'}</a> <a href={`/${l}/faq/`}>FAQ</a> <a href={`mailto:${data.email}`}>{data.email}</a>
      </main>
      <QminOS data={data} />
    </>
  );
}
