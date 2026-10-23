// Cloudflare Pages Function: the GitHub contribution calendar of the studio account, as JSON for the desktop widget.
// GitHub has no unauthenticated API for this, so it reads the public calendar fragment that github.com itself loads.
// Response: { total, days: [{ d: 'YYYY-MM-DD', n: count, l: level 0-4 }] }, cached at the edge for an hour.
const USER = 'qminlab'; // keep in sync with GH_USER in src/lib/identity.ts

export async function onRequestGet({ request, waitUntil }) {
  const cache = caches.default;
  const key = new Request(new URL('/api/github', request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { 'User-Agent': 'qminlab.com contribution widget', Accept: 'text/html' },
  });
  if (!res.ok) return json({ error: 'upstream', status: res.status }, 502, 'no-store');
  const html = await res.text();

  // Each day is a <td data-date data-level id>; its count sits in a <tool-tip for="<id>"> next to it.
  const tips = new Map();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /(\d[\d,]*)\s+contribution/.exec(m[2]);
    tips.set(m[1], n ? parseInt(n[1].replace(/,/g, ''), 10) : 0);
  }
  const days = [];
  for (const m of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const tag = m[0];
    const d = /data-date="([^"]+)"/.exec(tag)[1];
    const l = parseInt((/data-level="(\d)"/.exec(tag) || [])[1] || '0', 10);
    const id = (/\bid="([^"]+)"/.exec(tag) || [])[1];
    days.push({ d, n: tips.get(id) ?? (l ? 1 : 0), l });
  }
  days.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  const head = /([\d,]+)\s+contributions?\s+in the last year/.exec(html);
  const total = head ? parseInt(head[1].replace(/,/g, ''), 10) : days.reduce((s, x) => s + x.n, 0);
  if (!days.length) return json({ error: 'parse' }, 502, 'no-store');

  const out = json({ total, days }, 200, 'public, max-age=3600');
  waitUntil(cache.put(key, out.clone()));
  return out;
}

function json(body, status, cacheControl) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cacheControl },
  });
}
