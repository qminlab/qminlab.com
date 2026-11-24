// Cloudflare Pages Function behind /guild-vote/: a one-off poll where guild members pick the guild emblem.
// Each member votes once for one emblem (1-8) and one banner (1-8). The poll opens with the first vote and
// closes DURATION_MS later. Votes live in a D1 database bound as GUILD_VOTE_DB (Pages → Settings → Bindings).
// GET  → current standings. POST { nickname, icon, banner } → casts a vote, then returns the standings.
// Who picked what is never returned, only who has voted.

// The members allowed to vote. Edit this list when someone joins or leaves the guild.
const MEMBERS = [
  '라이트유저', '배찌', '단단카우', '전통', '착하게살자', '초코시루', '마잔향', '살인중독', '이런날',
  '아트7', '케닌', '로킨', '역천', '유이고니', '경원', '베이비', '용군빠', '에멘탈',
  '으넹이', '연인', '누르', '나쁜남', '아이티나', '바서주', '모루모루', '다움', '꿍꽁',
  '슈롱', '달인123', '범스테드', '로재혁', '히키히', '미나리백합탕', '평사', '조금만하자', '푸탕',
  '으아악극혐', '공도', '바나나쥬스', '정철', 'suubung', '으니긋', '진서', '암거나함', '육식전문가',
  '성민', '젤리말랑', '설요', '헤론', '우현준', '재밌낭이거',
];
const OPTIONS = 8; // emblems and banners both come in eight
const DURATION_MS = 3 * 24 * 60 * 60 * 1000;

let tableReady = false;
async function database(env) {
  const db = env.GUILD_VOTE_DB;
  if (!db) return null;
  if (!tableReady) {
    await db
      .prepare(
        'CREATE TABLE IF NOT EXISTS guild_votes (nickname TEXT PRIMARY KEY, icon INTEGER NOT NULL, banner INTEGER NOT NULL, voted_at INTEGER NOT NULL)',
      )
      .run();
    tableReady = true;
  }
  return db;
}

// Most votes first. A tie goes to the option that reached that count first (its latest vote is the earlier one).
function ranking(rows, field) {
  const count = Array(OPTIONS).fill(0);
  const last = Array(OPTIONS).fill(0);
  for (const r of rows) {
    const i = r[field] - 1;
    if (i < 0 || i >= OPTIONS) continue;
    count[i] += 1;
    last[i] = Math.max(last[i], r.voted_at);
  }
  const order = count
    .map((_, i) => i)
    .sort((a, b) => count[b] - count[a] || last[a] - last[b] || a - b)
    .map((i) => i + 1);
  return { count, order };
}

async function standings(db, now) {
  const { results } = await db.prepare('SELECT nickname, icon, banner, voted_at FROM guild_votes').all();
  const rows = results.filter((r) => MEMBERS.includes(r.nickname));
  const startedAt = rows.length ? Math.min(...rows.map((r) => r.voted_at)) : null;
  const endsAt = startedAt === null ? null : startedAt + DURATION_MS;
  const icons = ranking(rows, 'icon');
  const banners = ranking(rows, 'banner');
  return {
    now,
    members: MEMBERS,
    voted: rows.sort((a, b) => a.voted_at - b.voted_at).map((r) => r.nickname),
    icons: icons.count,
    iconOrder: icons.order,
    banners: banners.count,
    bannerOrder: banners.order,
    startedAt,
    endsAt,
    durationMs: DURATION_MS,
    closed: endsAt !== null && now >= endsAt,
  };
}

export async function onRequestGet({ env }) {
  const db = await database(env);
  if (!db) return json({ error: 'no_database' }, 503);
  return json(await standings(db, Date.now()), 200);
}

export async function onRequestPost({ request, env }) {
  const db = await database(env);
  if (!db) return json({ error: 'no_database' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const nickname = typeof body?.nickname === 'string' ? body.nickname.trim() : '';
  const icon = body?.icon;
  const banner = body?.banner;
  const valid = (n) => Number.isInteger(n) && n >= 1 && n <= OPTIONS;
  if (!MEMBERS.includes(nickname)) return json({ error: 'not_member' }, 403);
  if (!valid(icon) || !valid(banner)) return json({ error: 'bad_request' }, 400);

  const now = Date.now();
  const before = await standings(db, now);
  if (before.closed) return json({ error: 'closed', ...before }, 403);

  // The primary key makes "one vote per nickname" hold even when two phones submit at once.
  const res = await db
    .prepare('INSERT OR IGNORE INTO guild_votes (nickname, icon, banner, voted_at) VALUES (?, ?, ?, ?)')
    .bind(nickname, icon, banner, now)
    .run();
  const after = await standings(db, now);
  if (!res.meta.changes) return json({ error: 'already_voted', ...after }, 409);
  return json(after, 200);
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
