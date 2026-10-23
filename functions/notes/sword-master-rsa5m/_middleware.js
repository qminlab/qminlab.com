// The private production-notes page is not in this repository. It lives in a separate private
// Cloudflare Pages project, which keeps its own password check; this only passes requests through
// so the page stays at qminlab.com/notes/sword-master-rsa5m/.
const ORIGIN = 'https://qminlab.pages.dev';

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const upstream = new Request(ORIGIN + url.pathname + url.search, request);
  return fetch(upstream, { redirect: 'manual' });
}
