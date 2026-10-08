import { setRequestLocale } from 'next-intl/server';
import { Site } from '@/components/Site';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Site />;
}
