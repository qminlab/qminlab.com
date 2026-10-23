import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE, UPDATED } from '@/lib/identity';

// Static export: written once to out/sitemap.xml at build time.
export const dynamic = 'force-static';

const PAGES = ['', 'about/', 'faq/', 'deephold/', 'work/ql-001/', 'work/ql-002/', 'work/ql-003/', 'work/ql-005/', 'work/ql-006/'];

export default function sitemap(): MetadataRoute.Sitemap {
  const localized = PAGES.flatMap((path) => routing.locales.map((l) => ({
    url: `${SITE}/${l}/${path}`,
    lastModified: UPDATED,
    alternates: { languages: Object.fromEntries(routing.locales.map((x) => [x, `${SITE}/${x}/${path}`])) },
  })));
  // The 소드마스터 production notes are a single Korean page outside the locale folders.
  return [...localized, { url: `${SITE}/notes/sword-master-rsa5m/`, lastModified: UPDATED }];
}
