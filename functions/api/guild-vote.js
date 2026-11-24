// Cloudflare Pages Function behind /guild-vote/: a one-off poll where guild members pick the guild emblem.
// Each member votes once for one emblem (1-8) and one banner (1-8). The poll is open until CLOSES_AT.
// Votes live in a D1 database bound as GUILD_VOTE_DB (Pages → Settings → Bindings).
// GET  → current standings. POST { nickname, icon, banner } → casts a vote, then returns the standings.
// Who picked what is never returned, only who has voted.
//
// One vote per nickname, per browser and per network: a vote leaves a cookie on the browser and a salted hash
// of the voter's network (IPv4 address, or IPv6 /64) in the database, and a second vote from either is refused.
// This is a light guard against casual double voting, not proof of identity.

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
const CLOSES_AT = Date.parse('2026-11-27T00:00:00+09:00'); // midnight between Nov 26 and 27, Korea time

const COOKIE = 'gv_device';

let tableReady = false;
async function database(env) {
  const db = env.GUILD_VOTE_DB;
  if (!db) return null;
  if (!tableReady) {
    await db.batch([
      db.prepare(
        'CREATE TABLE IF NOT EXISTS guild_votes (nickname TEXT PRIMARY KEY, icon INTEGER NOT NULL, banner INTEGER NOT NULL, voted_at INTEGER NOT NULL, ip_hash TEXT, device TEXT)',
      ),
      // Unique, so two phones on one network (or two tabs of one browser) racing each other still get one vote.
      db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS guild_votes_ip ON guild_votes (ip_hash)'),
      db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS guild_votes_device ON guild_votes (device)'),
      db.prepare('CREATE TABLE IF NOT EXISTS guild_vote_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)'),
    ]);
    tableReady = true;
  }
  return db;
}

// The salt for network hashes is made on first use and kept in the database, never in this public repository.
let saltValue = null;
async function salt(db) {
  if (saltValue) return saltValue;
  await db
    .prepare("INSERT OR IGNORE INTO guild_vote_meta (key, value) VALUES ('salt', ?)")
    .bind(crypto.randomUUID() + crypto.randomUUID())
    .run();
  const row = await db.prepare("SELECT value FROM guild_vote_meta WHERE key = 'salt'").first();
  saltValue = row.value;
  return saltValue;
}

// What counts as "the same network": the whole IPv4 address, or the /64 of an IPv6 address
// (one device rotates through many addresses inside its /64).
function network(ip) {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) return mapped[1];
  if (!ip.includes(':')) return ip;
  let groups = ip.split(':');
  if (ip.includes('::')) {
    const [head, tail] = ip.split('::');
    const h = head ? head.split(':') : [];
    const t = tail ? tail.split(':') : [];
    groups = [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t];
  }
  return groups.slice(0, 4).map((g) => (parseInt(g, 16) || 0).toString(16)).join(':') + '::/64';
}

async function sha256(text) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Who is asking: the browser's cookie (if it has voted before) and the hash of its network.
async function requester(db, request) {
  const cookie = /(?:^|;\s*)gv_device=([A-Za-z0-9-]{16,64})/.exec(request.headers.get('Cookie') || '');
  const ip = request.headers.get('CF-Connecting-IP');
  return {
    device: cookie ? cookie[1] : null,
    ipHash: ip ? await sha256((await salt(db)) + '|' + network(ip.trim())) : null,
  };
}

// 'device' or 'ip' when a vote has already come from this browser or network, else null.
async function blockedBy(db, who) {
  if (who.device && (await db.prepare('SELECT 1 FROM guild_votes WHERE device = ?').bind(who.device).first())) return 'device';
  if (who.ipHash && (await db.prepare('SELECT 1 FROM guild_votes WHERE ip_hash = ?').bind(who.ipHash).first())) return 'ip';
  return null;
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
    endsAt: CLOSES_AT,
    closed: now >= CLOSES_AT,
  };
}

export async function onRequestGet({ request, env }) {
  const db = await database(env);
  if (!db) return json({ error: 'no_database' }, 503);
  const who = await requester(db, request);
  return json({ ...(await standings(db, Date.now())), blocked: await blockedBy(db, who) }, 200);
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
  const who = await requester(db, request);
  const before = await standings(db, now);
  if (before.closed) return json({ error: 'closed', ...before, blocked: await blockedBy(db, who) }, 403);

  // Why a vote is refused, most specific reason first.
  const refusal = async () => {
    if (await db.prepare('SELECT 1 FROM guild_votes WHERE nickname = ?').bind(nickname).first()) return 'already_voted';
    const by = await blockedBy(db, who);
    return by ? `${by}_voted` : null;
  };
  let reason = await refusal();
  let device = who.device;
  if (!reason) {
    device = device || crypto.randomUUID();
    // The primary key and the unique indexes make the three "once" rules hold even when requests arrive together.
    const res = await db
      .prepare('INSERT OR IGNORE INTO guild_votes (nickname, icon, banner, voted_at, ip_hash, device) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(nickname, icon, banner, now, who.ipHash, device)
      .run();
    if (!res.meta.changes) reason = (await refusal()) || 'already_voted';
  }
  const after = await standings(db, now);
  if (reason) return json({ error: reason, ...after, blocked: await blockedBy(db, who) }, 409);

  // Remember this browser until well after the poll has closed.
  const cookie = `${COOKIE}=${device}; Path=/api/guild-vote; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; Secure; SameSite=Lax`;
  return json({ ...after, blocked: 'device' }, 200, { 'Set-Cookie': cookie });
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}
