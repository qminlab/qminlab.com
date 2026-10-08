import { defineRouting } from 'next-intl/routing';

// Add a locale here (plus messages/<locale>.json) to ship another language.
export const routing = defineRouting({
  locales: ['en', 'ko'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];
