import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { archivo, plexKr, plexMono } from '@/lib/fonts';
import { NAVER_VERIFY } from '@/lib/identity';
import 'lenis/dist/lenis.css';
import '../globals.css';
import '@/styles/shell.css';
import '@/styles/hero.css';
import '@/styles/specimens.css';
import '@/styles/index.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL('https://qminlab.com'),
    alternates: { canonical: `/${locale}/`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/`])) },
    icons: { icon: '/icon.svg' },
    verification: { other: { 'naver-site-verification': NAVER_VERIFY } },
  };
}

export const viewport: Viewport = { themeColor: '#0C0D0B', width: 'device-width', initialScale: 1 };

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${archivo.variable} ${plexMono.variable} ${plexKr.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
