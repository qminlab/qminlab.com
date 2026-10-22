import { setRequestLocale } from 'next-intl/server';
import { Site } from '@/components/Site';
import { BRAND, SITE, ldScript, orgLd, personLd } from '@/lib/identity';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale === 'ko' ? 'ko' : 'en';
  // Who runs the site, stated once for search engines: the studio, its founder, and the site itself.
  const ld = { '@graph': [{ '@type': 'WebSite', '@id': `${SITE}/#site`, url: SITE, name: BRAND, inLanguage: l, publisher: { '@id': `${SITE}/#org` } }, orgLd(), personLd(l)] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
      <Site />
    </>
  );
}
