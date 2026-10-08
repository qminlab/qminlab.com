// Cloudflare Pages Function for `/` only: send each visitor to their language before any HTML loads.
// Order: the language they last picked in the header (`lang` cookie), then Accept-Language, then country (KR → ko).
// Keep LOCALES in sync with src/i18n/routing.ts.
const LOCALES = ['en', 'ko'];
const DEFAULT = 'en';

function fromCookie(header) {
  const m = /(?:^|;\s*)lang=([a-z-]+)/i.exec(header || '');
  return m && LOCALES.includes(m[1].toLowerCase()) ? m[1].toLowerCase() : null;
}

function fromAcceptLanguage(header) {
  const ranked = (header || '')
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { lang: tag.split('-')[0].toLowerCase(), q: q ? parseFloat(q.slice(2)) || 0 : 1, i };
    })
    .filter((x) => x.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  const hit = ranked.find((x) => LOCALES.includes(x.lang));
  return hit ? hit.lang : null;
}

export function onRequest({ request }) {
  const country = request.cf && request.cf.country;
  const locale =
    fromCookie(request.headers.get('Cookie')) ||
    fromAcceptLanguage(request.headers.get('Accept-Language')) ||
    (country === 'KR' ? 'ko' : DEFAULT);
  const url = new URL(`/${locale}/`, request.url);
  url.search = new URL(request.url).search;
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Cache-Control': 'private, no-store',
      Vary: 'Accept-Language, Cookie',
    },
  });
}
