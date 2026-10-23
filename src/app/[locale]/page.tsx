import type { Viewport } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { QminOS } from '@/components/os/QminOS';
import { osData } from '@/components/os/data';
import { BRAND, SITE, ldScript, orgLd, personLd } from '@/lib/identity';
import '@/styles/os.css';

export const viewport: Viewport = { themeColor: '#E9ECEF', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

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
        <a href={`/${l}/about/`}>{l === 'ko' ? '소개' : 'About'}</a> <a href={`/${l}/faq/`}>FAQ</a> <a href={`mailto:${data.email}`}>{data.email}</a>
      </main>
      <QminOS data={data} />
    </>
  );
}
