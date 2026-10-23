// The production-notes page is public and lives in public/notes/sword-master-rsa5m/; this only keeps its
// video and audio playable in Safari, which plays media only from servers that answer byte ranges with 206.
async function ranged(request, res) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') || '');
  if (!m || res.status !== 200 || res.headers.has('Content-Range')) return res;
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  const start = m[1] === '' ? Math.max(0, size - Number(m[2])) : Number(m[1]);
  const end = m[1] !== '' && m[2] !== '' ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  const headers = new Headers(res.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  headers.set('Accept-Ranges', 'bytes');
  return new Response(buf.slice(start, end + 1), { status: 206, headers });
}

export async function onRequest({ request, next }) {
  const res = await next();
  return /\.(mp4|mp3)$/i.test(new URL(request.url).pathname) ? ranged(request, res) : res;
}
