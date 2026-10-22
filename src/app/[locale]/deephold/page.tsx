import type { Metadata, Viewport } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { DEEPHOLD } from '@/content/deephold';
import { DeepholdSite } from '@/components/deephold/DeepholdSite';
import '@/styles/deephold.css';

const pick = (locale: string) => (locale === 'ko' ? 'ko' : 'en') as 'ko' | 'en';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = DEEPHOLD[pick(locale)];
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: { canonical: `/${locale}/deephold/`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/deephold/`])) },
    openGraph: { title: c.meta.title, description: c.meta.description, images: ['/deephold/banner.webp'] },
  };
}

export const viewport: Viewport = { themeColor: '#07060B', width: 'device-width', initialScale: 1 };

export default async function DeepHoldPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = pick(locale);
  return <DeepholdSite c={DEEPHOLD[l]} locale={l} />;
}
