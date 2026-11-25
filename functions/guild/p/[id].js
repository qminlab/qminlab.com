// A short address for one strategy post: /guild/p/{id}.
// Chat apps that unfurl links cannot see the part after "#", so the hub's own address (/guild/#guide/{id}) would
// preview as the same page for every post. This answers with the post's title, opening words and first picture as
// link-preview tags, then sends the browser on to the post inside the hub.

const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function onRequestGet({ request, env, params }) {
  const origin = new URL(request.url).origin;
  const id = /^\d{1,9}$/.test(String(params.id)) ? Number(params.id) : 0;
  let post = null;
  if (id && env.GUILD_DB) {
    try {
      post = await env.GUILD_DB
        .prepare(
          `SELECT p.title, substr(p.body, 1, 200) AS opening, m.nickname,
                  (SELECT i.id FROM guild_post_images i WHERE i.post_id = p.id ORDER BY i.pos LIMIT 1) AS picture
           FROM guild_posts p LEFT JOIN guild_members m ON m.uid = p.uid WHERE p.id = ? AND p.deleted_at IS NULL`,
        )
        .bind(id)
        .first();
    } catch {
      post = null; // the tables appear on the hub's first request; until then there is nothing to preview
    }
  }
  const to = post ? `/guild/#guide/${id}` : '/guild/#guide';
  const title = post ? post.title : '공략 정보 공유';
  const opening = post ? post.opening.replace(/\s+/g, ' ').trim() : '라이트 길드의 공략 모음';
  const about = (post && post.nickname ? post.nickname + ' · ' : '') + (opening.length > 110 ? opening.slice(0, 110) + '…' : opening);
  const picture = post && post.picture ? `<meta property="og:image" content="${escape(origin + '/api/guild/posts/img/' + post.picture)}">\n` : '';
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escape(title)} · 라이트 길드</title>
<meta property="og:type" content="article">
<meta property="og:site_name" content="라이트 길드">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(about)}">
<meta property="og:url" content="${escape(origin + '/guild/p/' + (id || ''))}">
${picture}<meta name="twitter:card" content="${picture ? 'summary_large_image' : 'summary'}">
<meta http-equiv="refresh" content="0;url=${escape(to)}">
<style>body{margin:0;background:#0f1226;color:#edeef8;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}a{color:#f2e2ae}</style>
</head>
<body>
<p><a href="${escape(to)}">${escape(title)}</a> 글로 이동하는 중…</p>
<script>location.replace(${JSON.stringify(to)});</script>
</body>
</html>`;
  return new Response(html, {
    status: post || !id ? 200 : 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' },
  });
}
