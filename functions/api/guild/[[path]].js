// Cloudflare Pages Function behind /guild/: the guild hub's data — members, raid attendance, admin, self-updates.
// Storage is a D1 database bound as GUILD_DB. Reading screenshots uses Workers AI bound as AI (optional: without it,
// self-updates wait for the admin instead of being checked automatically).
//
//   GET  /api/guild/state                      members and raid counts (total, this month, this week)
//   GET  /api/guild/img/{char|face}/{uid}      a member's updated picture
//   POST /api/guild/update                     a member (once a day) or the admin uploads a new character picture
//   GET  /api/guild/posts[?before=id]          strategy posts, newest first
//   GET  /api/guild/posts/{id}                 one post with its pictures and comments
//   POST /api/guild/posts                      write a post (a member must be chosen); POST .../{id} edits, DELETE removes
//   POST /api/guild/posts/{id}/comments        comment; DELETE /api/guild/comments/{id} removes
//   GET  /api/guild/posts/img/{id}             a picture attached to a post
//   /api/guild/admin/...                       password set-up, login, attendance by day, pending updates, roster
//
// The admin password is chosen by the admin on first visit and stored only as a salted PBKDF2 hash.

const KST_MS = 9 * 60 * 60 * 1000;
const CLASSES = ['투사', '주술사', '기사', '현자'];
const SESSION_DAYS = 30;
const COOKIE = 'guild_admin';
const MAX = { head: 900_000, shot: 900_000, char: 600_000, face: 120_000 };
const UPDATES_PER_HOUR = 8;
const DAY_MS = 86_400_000;
// A member can change their own character once a day, so that reading screenshots stays inside the Workers AI free
// allocation. The day follows that allocation: it turns over at 00:00 UTC, which is 9 a.m. in Korea.
const dayStart = (now) => Math.floor(now / DAY_MS) * DAY_MS;
// Someone else's screenshot does not use up the member's turn (anyone can pick any nickname, so it would let one
// person lock another out). Those are capped per network address instead.
const USES_TURN = "NOT (status = 'rejected' AND reason = 'nickname')";
const MISMATCHES_PER_DAY = 3;
// Strategy posts: what a post may hold, and how much one network address may write in a day.
const POST = { title: 60, body: 5000, source: 200, link: 300, links: 3, images: 4, image: 500_000, comment: 500, page: 30 };
const POSTS_PER_DAY = 5;
const COMMENTS_PER_DAY = 40;
// How far back a run of missed raids is counted.
const STREAK_DAYS = 30;
// Vision models tried in order until one returns something readable.
const VISION_MODELS = ['@cf/mistralai/mistral-small-3.1-24b-instruct'];

export async function onRequest({ request, env, params }) {
  const path = '/' + [].concat(params.path || []).join('/');
  const method = request.method;
  try {
    const db = await database(env, request);
    if (!db) return json({ error: 'no_database' }, 503);
    const ctx = { request, env, db, url: new URL(request.url), now: Date.now() };

    if (method === 'GET' && path === '/state') return json(await state(ctx), 200);
    const img = /^\/img\/(char|face)\/([A-Za-z0-9]+)$/.exec(path);
    if (method === 'GET' && img) return picture(ctx, img[1], img[2]);
    if (method === 'POST' && path === '/update') return update(ctx);
    if (path === '/posts' || path.startsWith('/posts/') || path.startsWith('/comments/')) return posts(ctx, method, path);

    if (path.startsWith('/admin/')) return admin(ctx, method, path.slice('/admin'.length));
    return json({ error: 'not_found' }, 404);
  } catch (err) {
    return json({ error: 'server', message: String((err && err.message) || err) }, 500);
  }
}

// ───────────────────────── database ─────────────────────────

let ready = false;
async function database(env, request) {
  const db = env.GUILD_DB;
  if (!db) return null;
  if (ready) return db;
  await db.batch([
    db.prepare(
      'CREATE TABLE IF NOT EXISTS guild_members (uid TEXT PRIMARY KEY, nickname TEXT NOT NULL UNIQUE, cls TEXT, class_level INTEGER, level INTEGER, power INTEGER, active INTEGER NOT NULL DEFAULT 1, img_version INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)',
    ),
    db.prepare('CREATE TABLE IF NOT EXISTS guild_images (uid TEXT PRIMARY KEY, char BLOB NOT NULL, face BLOB NOT NULL, updated_at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS guild_raid_days (date TEXT PRIMARY KEY, saved_at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS guild_raid_attend (date TEXT NOT NULL, uid TEXT NOT NULL, PRIMARY KEY (date, uid))'),
    db.prepare('CREATE TABLE IF NOT EXISTS guild_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS guild_sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL)'),
    db.prepare(
      'CREATE TABLE IF NOT EXISTS guild_updates (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT NOT NULL, status TEXT NOT NULL, reason TEXT, read_json TEXT, shot BLOB, char BLOB, face BLOB, ip_hash TEXT, created_at INTEGER NOT NULL, decided_at INTEGER)',
    ),
    db.prepare(
      'CREATE TABLE IF NOT EXISTS guild_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, links TEXT NOT NULL, source TEXT, key_hash TEXT, ip_hash TEXT, created_at INTEGER NOT NULL, updated_at INTEGER, deleted_at INTEGER)',
    ),
    db.prepare('CREATE TABLE IF NOT EXISTS guild_post_images (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, pos INTEGER NOT NULL, body BLOB NOT NULL)'),
    db.prepare(
      'CREATE TABLE IF NOT EXISTS guild_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, uid TEXT NOT NULL, body TEXT NOT NULL, key_hash TEXT, ip_hash TEXT, created_at INTEGER NOT NULL, deleted_at INTEGER)',
    ),
    db.prepare('CREATE INDEX IF NOT EXISTS guild_post_images_post ON guild_post_images (post_id, pos)'),
    db.prepare('CREATE INDEX IF NOT EXISTS guild_comments_post ON guild_comments (post_id, id)'),
  ]);
  // First run: fill the roster from the file that ships with the site.
  const any = await db.prepare('SELECT 1 FROM guild_members LIMIT 1').first();
  if (!any && env.ASSETS) {
    const res = await env.ASSETS.fetch(new URL('/guild/data/members.json', request.url));
    if (res.ok) {
      const seed = await res.json();
      const now = Date.now();
      const rows = seed.members.map((m) =>
        db
          .prepare('INSERT OR IGNORE INTO guild_members (uid, nickname, cls, class_level, level, power, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(m.uid, m.nickname, m.cls, m.classLevel, m.level, m.power, now),
      );
      if (rows.length) await db.batch(rows);
    }
  }
  ready = true;
  return db;
}

async function meta(db, key, make) {
  let row = await db.prepare('SELECT value FROM guild_meta WHERE key = ?').bind(key).first();
  if (!row && make) {
    await db.prepare('INSERT OR IGNORE INTO guild_meta (key, value) VALUES (?, ?)').bind(key, make()).run();
    row = await db.prepare('SELECT value FROM guild_meta WHERE key = ?').bind(key).first();
  }
  return row ? row.value : null;
}
const setMeta = (db, key, value) =>
  db.prepare('INSERT INTO guild_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(key, value).run();

// ───────────────────────── public: state and pictures ─────────────────────────

const kstDate = (ms) => new Date(ms + KST_MS).toISOString().slice(0, 10);

function memberView(m) {
  return {
    uid: m.uid,
    nickname: m.nickname,
    cls: m.cls,
    classLevel: m.class_level,
    level: m.level,
    power: m.power,
    active: !!m.active,
    // Pictures that shipped with the site are plain files; updated ones come from the database.
    char: m.img_version ? `/api/guild/img/char/${m.uid}?v=${m.img_version}` : `/guild/img/chars/${m.uid}.webp`,
    face: m.img_version ? `/api/guild/img/face/${m.uid}?v=${m.img_version}` : `/guild/img/faces/${m.uid}.webp`,
    updatedAt: m.updated_at,
  };
}

async function state({ db, now }) {
  const today = kstDate(now);
  const monthStart = today.slice(0, 8) + '01';
  const dow = (new Date(now + KST_MS).getUTCDay() + 6) % 7; // Monday = 0
  const weekStart = kstDate(now - dow * 86_400_000);
  const since = dayStart(now);
  const [members, totals, days, turns] = await db.batch([
    db.prepare('SELECT * FROM guild_members WHERE active = 1'),
    db.prepare("SELECT value FROM guild_meta WHERE key = 'raid_totals'"),
    db.prepare('SELECT date FROM guild_raid_days ORDER BY date'),
    db.prepare(`SELECT uid, status, reason, char IS NOT NULL AS kept FROM guild_updates WHERE created_at >= ? AND ${USES_TURN} ORDER BY id`).bind(since),
  ]);
  // Who has used today's self-update: 'used', or 'ask' when it was judged older and the admin can still be asked.
  const used = {};
  for (const t of turns.results) used[t.uid] = t.status === 'rejected' && t.reason === 'older' && t.kept ? 'ask' : 'used';
  const dates = days.results.map((r) => r.date);

  // This page is read far more often than attendance is saved, and the free database counts every row read. So the
  // all-time counts are kept ready (rebuilt whenever a day is saved), and only recent days are read here: enough
  // for this month, this week and the run of missed raids.
  const total = totals.results.length ? JSON.parse(totals.results[0].value) : await raidTotals(db);
  const recent = dates.slice(-STREAK_DAYS);
  const month = {};
  const week = {};
  const miss = {};
  if (dates.length) {
    const from = [monthStart, weekStart, recent[0]].sort()[0];
    const { results } = await db.prepare('SELECT date, uid FROM guild_raid_attend WHERE date >= ?').bind(from).all();
    const came = {};
    for (const r of results) {
      if (r.date >= monthStart) month[r.uid] = (month[r.uid] || 0) + 1;
      if (r.date >= weekStart) week[r.uid] = (week[r.uid] || 0) + 1;
      (came[r.date] ||= new Set()).add(r.uid);
    }
    // Raids missed in a row, counting back from the latest recorded one.
    for (const m of members.results) {
      let n = 0;
      for (let i = recent.length - 1; i >= 0 && !(came[recent[i]] && came[recent[i]].has(m.uid)); i--) n++;
      if (n) miss[m.uid] = n;
    }
  }
  return {
    now,
    today,
    members: members.results.map(memberView),
    selfUpdate: { perDay: 1, resetAt: since + DAY_MS, used },
    raid: {
      total,
      month,
      week,
      miss,
      missCap: STREAK_DAYS,
      days: { total: dates.length, month: dates.filter((d) => d >= monthStart).length, week: dates.filter((d) => d >= weekStart).length },
      monthStart,
      weekStart,
      lastDate: dates.length ? dates[dates.length - 1] : null,
    },
  };
}

// All-time raid counts per member, rebuilt from the attendance rows and kept for the state page.
async function raidTotals(db) {
  const { results } = await db.prepare('SELECT uid, COUNT(*) AS n FROM guild_raid_attend GROUP BY uid').all();
  const total = Object.fromEntries(results.map((r) => [r.uid, r.n]));
  await setMeta(db, 'raid_totals', JSON.stringify(total));
  return total;
}

function mimeOf(bytes) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) return 'image/webp';
  return null;
}
const toBytes = (blob) => (blob instanceof ArrayBuffer ? new Uint8Array(blob) : Uint8Array.from(blob));

async function picture({ db }, kind, uid) {
  const row = await db.prepare(`SELECT ${kind === 'char' ? 'char' : 'face'} AS body FROM guild_images WHERE uid = ?`).bind(uid).first();
  if (!row) return json({ error: 'not_found' }, 404);
  const bytes = toBytes(row.body);
  return new Response(bytes, {
    headers: { 'Content-Type': mimeOf(bytes) || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}

// ───────────────────────── self-update ─────────────────────────

async function sha256(text) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function ipHash(db, request) {
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return null;
  const salt = await meta(db, 'salt', () => crypto.randomUUID() + crypto.randomUUID());
  return sha256(salt + '|' + ip.trim());
}

const norm = (s) => String(s ?? '').normalize('NFC').replace(/\s+/g, '').toLowerCase();

// "631K" → 631000, "1.12M" → 1120000, 631000 → 631000
function powerValue(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v);
  const m = /^([\d.,]+)\s*([KkMm만억]?)/.exec(String(v ?? '').trim());
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  const unit = { k: 1e3, m: 1e6, 만: 1e4, 억: 1e8 }[m[2].toLowerCase()] || 1;
  return Math.round(n * unit);
}
function levelValue(v) {
  const m = /(\d{1,3})/.exec(String(v ?? ''));
  return m ? Number(m[1]) : null;
}

function base64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

const READ_PROMPT = [
  'This image is the top part of a character screen from a Korean mobile game.',
  'Read these exactly as they are written in the image:',
  '- nickname: the player name written next to the round portrait at the top left (often Korean, e.g. "라이트유저").',
  '- level: the number after "Lv." under the round portrait.',
  '- power: the combat power next to the crossed tools icon under the nickname, e.g. "631K" or "1.12M". Keep the K or M.',
  '- class: the Korean class name written under the large emblem in the middle. It is one of 투사, 주술사, 기사, 현자.',
  'Answer with JSON only: {"nickname": string|null, "level": number|null, "power": string|null, "class": string|null}. Use null for anything you cannot read. Do not guess.',
].join('\n');

function parseJson(text) {
  if (text && typeof text === 'object') return text;
  const m = /\{[\s\S]*\}/.exec(String(text ?? ''));
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

// What the screenshot says: { nickname, level, power, cls } — or { error } when it could not be read at all.
async function readShot(env, bytes) {
  if (!env.AI) return { error: 'no_ai' };
  const url = `data:${mimeOf(bytes) || 'image/jpeg'};base64,${base64(bytes)}`;
  let last = '';
  for (const model of VISION_MODELS) {
    try {
      const out = await env.AI.run(model, {
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: READ_PROMPT },
              { type: 'image_url', image_url: { url } },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0,
      });
      const obj = parseJson(typeof out === 'string' ? out : (out?.response ?? out?.choices?.[0]?.message?.content));
      if (obj) {
        const cls = CLASSES.find((c) => norm(obj.class).includes(c)) || null;
        return { nickname: obj.nickname ? String(obj.nickname).trim() : null, level: levelValue(obj.level), power: powerValue(obj.power), cls, model, usage: out?.usage ?? null };
      }
      last = 'unparsed: ' + JSON.stringify(out).slice(0, 300);
    } catch (err) {
      last = String((err && err.message) || err).slice(0, 300);
    }
  }
  return { error: 'ai_failed', detail: last };
}

// What to do with an upload, given what the screenshot says and what is on file.
//   applied   the nickname matches and the screenshot is at least as new as the stored level and power
//   rejected  another player's screenshot ('nickname'), or an older one ('older')
//   pending   could not be read, or the member asked the admin to look at an "older" one
export function judge(read, member, ask) {
  if (read.error || !read.nickname) return { status: 'pending', reason: read.error || 'unreadable' };
  if (norm(read.nickname) !== norm(member.nickname)) return { status: 'rejected', reason: 'nickname' };
  if (read.level == null || read.power == null) return { status: 'pending', reason: 'partial' };
  if (read.level < (member.level ?? 0) || read.power < (member.power ?? 0)) return { status: ask ? 'pending' : 'rejected', reason: 'older' };
  return { status: 'applied', reason: null };
}

async function fileBytes(form, name, max, required) {
  const f = form.get(name);
  if (!f || typeof f === 'string') {
    if (required) throw new HttpError(400, 'missing_' + name);
    return null;
  }
  if (f.size > max) throw new HttpError(413, 'too_large_' + name);
  const bytes = new Uint8Array(await f.arrayBuffer());
  if (!mimeOf(bytes)) throw new HttpError(400, 'bad_image_' + name);
  return bytes;
}
class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function applyUpdate(db, uid, fields, char, face, now) {
  const stmts = [];
  if (char && face) {
    stmts.push(
      db
        .prepare('INSERT INTO guild_images (uid, char, face, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET char = excluded.char, face = excluded.face, updated_at = excluded.updated_at')
        .bind(uid, char, face, now),
    );
    stmts.push(db.prepare('UPDATE guild_members SET img_version = ?, updated_at = ? WHERE uid = ?').bind(now, now, uid));
  }
  if (fields.level != null) stmts.push(db.prepare('UPDATE guild_members SET level = ?, updated_at = ? WHERE uid = ?').bind(fields.level, now, uid));
  if (fields.power != null) stmts.push(db.prepare('UPDATE guild_members SET power = ?, updated_at = ? WHERE uid = ?').bind(fields.power, now, uid));
  if (fields.cls) stmts.push(db.prepare('UPDATE guild_members SET cls = ?, updated_at = ? WHERE uid = ?').bind(fields.cls, now, uid));
  if (stmts.length) await db.batch(stmts);
}

async function update(ctx) {
  const { request, env, db, now } = ctx;
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  try {
    const uid = String(form.get('uid') || '');
    const member = await db.prepare('SELECT * FROM guild_members WHERE uid = ? AND active = 1').bind(uid).first();
    if (!member) return json({ error: 'not_member' }, 404);
    // The admin can replace anyone's picture and numbers without the checks.
    if (form.get('as_admin') === '1') {
      if (!(await session(ctx))) return json({ error: 'not_admin' }, 401);
      const char = await fileBytes(form, 'char', MAX.char, true);
      const face = await fileBytes(form, 'face', MAX.face, true);
      const cls = CLASSES.includes(form.get('cls')) ? form.get('cls') : null;
      await applyUpdate(db, uid, { level: levelValue(form.get('level')), power: powerValue(form.get('power')), cls }, char, face, now);
      const fresh = await db.prepare('SELECT * FROM guild_members WHERE uid = ?').bind(uid).first();
      return json({ status: 'applied', member: memberView(fresh) }, 200);
    }

    // One self-update per member per day.
    const ask = form.get('ask') === '1';
    const since = dayStart(now);
    const turn = await db
      .prepare(`SELECT id, status, reason, read_json, char IS NOT NULL AS kept FROM guild_updates WHERE uid = ? AND created_at >= ? AND ${USES_TURN} ORDER BY id DESC LIMIT 1`)
      .bind(uid, since)
      .first();
    if (turn) {
      // "Ask the admin" continues today's turn: the pictures were kept, so nothing is uploaded or read again.
      if (ask && turn.status === 'rejected' && turn.reason === 'older' && turn.kept) {
        await db.batch([
          db.prepare("DELETE FROM guild_updates WHERE uid = ? AND status = 'pending'").bind(uid),
          db.prepare("UPDATE guild_updates SET status = 'pending', decided_at = NULL WHERE id = ?").bind(turn.id),
        ]);
        const was = JSON.parse(turn.read_json || '{}');
        return json({ status: 'pending', reason: 'older', read: { nickname: was.nickname ?? null, level: was.level ?? null, power: was.power ?? null, cls: was.cls ?? null }, onFile: { level: member.level, power: member.power }, member: memberView(member) }, 200);
      }
      return json({ error: 'daily_limit', resetAt: since + DAY_MS }, 429);
    }

    const char = await fileBytes(form, 'char', MAX.char, true);
    const face = await fileBytes(form, 'face', MAX.face, true);
    const head = await fileBytes(form, 'head', MAX.head, true);
    const shot = await fileBytes(form, 'shot', MAX.shot, false);
    const who = await ipHash(db, request);
    if (who) {
      const [recent, wrong] = await db.batch([
        db.prepare('SELECT COUNT(*) AS n FROM guild_updates WHERE ip_hash = ? AND created_at > ?').bind(who, now - 3_600_000),
        db.prepare("SELECT COUNT(*) AS n FROM guild_updates WHERE ip_hash = ? AND created_at >= ? AND status = 'rejected' AND reason = 'nickname'").bind(who, since),
      ]);
      if (recent.results[0].n >= UPDATES_PER_HOUR) return json({ error: 'too_many' }, 429);
      if (wrong.results[0].n >= MISMATCHES_PER_DAY) return json({ error: 'mismatch_limit', resetAt: since + DAY_MS }, 429);
    }

    const read = await readShot(env, head);
    const seen = { nickname: read.nickname ?? null, level: read.level ?? null, power: read.power ?? null, cls: read.cls ?? null };
    const { status, reason } = judge(read, member, ask);
    // Pictures kept for an earlier day's "older" verdict are no longer needed once that day is over.
    const tidy = db.prepare("UPDATE guild_updates SET shot = NULL, char = NULL, face = NULL WHERE status = 'rejected' AND char IS NOT NULL AND created_at < ?").bind(since);

    const log = (extra) =>
      db
        .prepare('INSERT INTO guild_updates (uid, status, reason, read_json, shot, char, face, ip_hash, created_at, decided_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(uid, status, reason ?? null, JSON.stringify({ ...seen, detail: read.detail, model: read.model, usage: read.usage }), ...extra, who, now, status === 'pending' ? null : now);

    if (status === 'applied') {
      await applyUpdate(db, uid, { level: read.level, power: read.power, cls: read.cls }, char, face, now);
      await log([null, null, null]).run();
    } else if (status === 'pending') {
      // One waiting request per member: a newer one replaces the older.
      await db.batch([db.prepare("DELETE FROM guild_updates WHERE uid = ? AND status = 'pending'").bind(uid), log([shot ?? head, char, face]), tidy]);
    } else if (reason === 'older') {
      // Kept until the day turns over, so the member can ask the admin to look without uploading again.
      await db.batch([log([shot ?? head, char, face]), tidy]);
    } else {
      await log([null, null, null]).run();
    }
    const fresh = await db.prepare('SELECT * FROM guild_members WHERE uid = ?').bind(uid).first();
    return json(
      { status, reason: reason ?? null, read: seen, onFile: { level: member.level, power: member.power }, member: memberView(fresh), resetAt: since + DAY_MS, usage: read.usage ?? null },
      status === 'rejected' ? 409 : 200,
    );
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.code }, err.status);
    throw err;
  }
}

// ───────────────────────── strategy posts ─────────────────────────
//
// There are no accounts: the author is the member chosen on the device, and the device keeps a random key. Only the
// device that wrote a post or comment (its key) or the admin can remove it; only its device can edit a post.

// Text as typed: one newline style, no control characters, no trailing space.
const tidyText = (v) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();

function tidyLinks(v) {
  let list = v;
  if (typeof v === 'string') {
    try {
      list = JSON.parse(v);
    } catch {
      list = v.split(/\s+/);
    }
  }
  const out = [];
  for (const raw of [].concat(list || [])) {
    const text = String(raw || '').trim();
    if (!text) continue;
    let url;
    try {
      url = new URL(text);
    } catch {
      throw new HttpError(400, 'bad_link');
    }
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.href.length > POST.link) throw new HttpError(400, 'bad_link');
    out.push(url.href);
  }
  if (out.length > POST.links) throw new HttpError(400, 'too_many_links');
  return out;
}

function postFields(get) {
  const title = tidyText(get('title')).replace(/\s+/g, ' ');
  const body = tidyText(get('body'));
  const source = tidyText(get('source')).replace(/\s+/g, ' ');
  if (title.length < 2 || title.length > POST.title) throw new HttpError(400, 'bad_title');
  if (!body || body.length > POST.body) throw new HttpError(400, 'bad_body');
  if (source.length > POST.source) throw new HttpError(400, 'bad_source');
  return { title, body, source: source || null, links: tidyLinks(get('links')) };
}

async function posts(ctx, method, path) {
  const { request, db, now } = ctx;
  const hashKey = async (k) => (/^[a-f0-9]{32,64}$/.test(k || '') ? sha256('post|' + k) : null);
  const mine = await hashKey(request.headers.get('X-Guild-Key'));
  const owns = (row) => !!mine && row.key_hash === mine;
  const activeMember = (uid) => db.prepare('SELECT uid FROM guild_members WHERE uid = ? AND active = 1').bind(String(uid || '')).first();
  const jsonBody = async () => {
    try {
      return (await request.json()) || {};
    } catch {
      return {};
    }
  };
  try {
    // A picture attached to a post
    const img = /^\/posts\/img\/(\d+)$/.exec(path);
    if (method === 'GET' && img) {
      const row = await db.prepare('SELECT body FROM guild_post_images WHERE id = ?').bind(Number(img[1])).first();
      if (!row) return json({ error: 'not_found' }, 404);
      const bytes = toBytes(row.body);
      return new Response(bytes, {
        headers: { 'Content-Type': mimeOf(bytes) || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
      });
    }

    if (method === 'GET' && path === '/posts') {
      const before = Number(ctx.url.searchParams.get('before')) || 0;
      const { results } = await db
        .prepare(
          `SELECT p.id, p.uid, m.nickname, p.title, substr(p.body, 1, 160) AS excerpt, p.created_at, p.key_hash,
                  (SELECT COUNT(*) FROM guild_comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) AS comments,
                  (SELECT COUNT(*) FROM guild_post_images i WHERE i.post_id = p.id) AS images,
                  (SELECT i.id FROM guild_post_images i WHERE i.post_id = p.id ORDER BY i.pos LIMIT 1) AS thumb
           FROM guild_posts p LEFT JOIN guild_members m ON m.uid = p.uid
           WHERE p.deleted_at IS NULL AND (? = 0 OR p.id < ?) ORDER BY p.id DESC LIMIT ?`,
        )
        .bind(before, before, POST.page + 1)
        .all();
      return json(
        {
          posts: results.slice(0, POST.page).map((r) => ({
            id: r.id, uid: r.uid, nickname: r.nickname, title: r.title, excerpt: r.excerpt.replace(/\s+/g, ' '), createdAt: r.created_at,
            comments: r.comments, images: r.images, thumb: r.thumb ? `/api/guild/posts/img/${r.thumb}` : null, mine: owns(r),
          })),
          more: results.length > POST.page,
          admin: await session(ctx),
        },
        200,
      );
    }

    // Write a post
    if (method === 'POST' && path === '/posts') {
      let form;
      try {
        form = await request.formData();
      } catch {
        return json({ error: 'bad_request' }, 400);
      }
      if (!(await activeMember(form.get('uid')))) return json({ error: 'not_member' }, 403);
      const key = await hashKey(form.get('key'));
      if (!key) return json({ error: 'bad_key' }, 400);
      const fields = postFields((k) => form.get(k));
      const files = form.getAll('image').filter((f) => f && typeof f !== 'string');
      if (files.length > POST.images) return json({ error: 'too_many_images' }, 400);
      const pictures = [];
      for (const f of files) {
        if (f.size > POST.image) return json({ error: 'too_large_image' }, 413);
        const bytes = new Uint8Array(await f.arrayBuffer());
        if (!mimeOf(bytes)) return json({ error: 'bad_image' }, 400);
        pictures.push(bytes);
      }
      const who = await ipHash(db, request);
      if (who) {
        const recent = await db.prepare('SELECT COUNT(*) AS n FROM guild_posts WHERE ip_hash = ? AND created_at > ?').bind(who, now - DAY_MS).first();
        if (recent.n >= POSTS_PER_DAY) return json({ error: 'too_many' }, 429);
      }
      const made = await db
        .prepare('INSERT INTO guild_posts (uid, title, body, links, source, key_hash, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(String(form.get('uid')), fields.title, fields.body, JSON.stringify(fields.links), fields.source, key, who, now)
        .run();
      const id = made.meta.last_row_id;
      if (pictures.length) await db.batch(pictures.map((bytes, i) => db.prepare('INSERT INTO guild_post_images (post_id, pos, body) VALUES (?, ?, ?)').bind(id, i, bytes)));
      return json({ ok: true, id }, 200);
    }

    const one = /^\/posts\/(\d+)$/.exec(path);
    const forComments = /^\/posts\/(\d+)\/comments$/.exec(path);
    const postId = Number((one || forComments || [])[1]);
    const post = postId
      ? await db.prepare('SELECT p.*, m.nickname FROM guild_posts p LEFT JOIN guild_members m ON m.uid = p.uid WHERE p.id = ? AND p.deleted_at IS NULL').bind(postId).first()
      : null;
    if ((one || forComments) && !post) return json({ error: 'not_found' }, 404);

    if (one && method === 'GET') {
      const [pics, notes] = await db.batch([
        db.prepare('SELECT id FROM guild_post_images WHERE post_id = ? ORDER BY pos').bind(postId),
        db.prepare('SELECT c.id, c.uid, m.nickname, c.body, c.created_at, c.key_hash FROM guild_comments c LEFT JOIN guild_members m ON m.uid = c.uid WHERE c.post_id = ? AND c.deleted_at IS NULL ORDER BY c.id').bind(postId),
      ]);
      return json(
        {
          post: {
            id: post.id, uid: post.uid, nickname: post.nickname, title: post.title, body: post.body, links: JSON.parse(post.links || '[]'), source: post.source,
            createdAt: post.created_at, updatedAt: post.updated_at, images: pics.results.map((r) => `/api/guild/posts/img/${r.id}`), mine: owns(post),
          },
          comments: notes.results.map((c) => ({ id: c.id, uid: c.uid, nickname: c.nickname, body: c.body, createdAt: c.created_at, mine: owns(c) })),
          admin: await session(ctx),
        },
        200,
      );
    }
    // Edit the words of a post: its own device only. Pictures stay as they are.
    if (one && method === 'POST') {
      if (!owns(post)) return json({ error: 'not_yours' }, 403);
      const b = await jsonBody();
      const fields = postFields((k) => b[k]);
      await db.prepare('UPDATE guild_posts SET title = ?, body = ?, links = ?, source = ?, updated_at = ? WHERE id = ?').bind(fields.title, fields.body, JSON.stringify(fields.links), fields.source, now, postId).run();
      return json({ ok: true, id: postId }, 200);
    }
    if (one && method === 'DELETE') {
      if (!owns(post) && !(await session(ctx))) return json({ error: 'not_yours' }, 403);
      await db.batch([
        db.prepare('UPDATE guild_posts SET deleted_at = ? WHERE id = ?').bind(now, postId),
        db.prepare('DELETE FROM guild_post_images WHERE post_id = ?').bind(postId),
      ]);
      return json({ ok: true }, 200);
    }

    if (forComments && method === 'POST') {
      const b = await jsonBody();
      if (!(await activeMember(b.uid))) return json({ error: 'not_member' }, 403);
      const key = await hashKey(b.key);
      if (!key) return json({ error: 'bad_key' }, 400);
      const text = tidyText(b.body);
      if (!text || text.length > POST.comment) return json({ error: 'bad_body' }, 400);
      const who = await ipHash(db, request);
      if (who) {
        const recent = await db.prepare('SELECT COUNT(*) AS n FROM guild_comments WHERE ip_hash = ? AND created_at > ?').bind(who, now - DAY_MS).first();
        if (recent.n >= COMMENTS_PER_DAY) return json({ error: 'too_many' }, 429);
      }
      const made = await db.prepare('INSERT INTO guild_comments (post_id, uid, body, key_hash, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(postId, String(b.uid), text, key, who, now).run();
      return json({ ok: true, id: made.meta.last_row_id }, 200);
    }

    const note = /^\/comments\/(\d+)$/.exec(path);
    if (note && method === 'DELETE') {
      const row = await db.prepare('SELECT id, key_hash FROM guild_comments WHERE id = ? AND deleted_at IS NULL').bind(Number(note[1])).first();
      if (!row) return json({ error: 'not_found' }, 404);
      if (!owns(row) && !(await session(ctx))) return json({ error: 'not_yours' }, 403);
      await db.prepare('UPDATE guild_comments SET deleted_at = ? WHERE id = ?').bind(now, row.id).run();
      return json({ ok: true }, 200);
    }
    return json({ error: 'not_found' }, 404);
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.code }, err.status);
    throw err;
  }
}

// ───────────────────────── admin ─────────────────────────

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100_000 }, key, 256));
}
function sameText(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function session({ request, db, now }) {
  const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`).exec(request.headers.get('Cookie') || '');
  if (!m) return false;
  const row = await db.prepare('SELECT expires_at FROM guild_sessions WHERE token_hash = ?').bind(await sha256(m[1])).first();
  return !!row && row.expires_at > now;
}

async function openSession(db, now) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await db.batch([
    db.prepare('DELETE FROM guild_sessions WHERE expires_at < ?').bind(now),
    db.prepare('INSERT INTO guild_sessions (token_hash, expires_at) VALUES (?, ?)').bind(await sha256(token), now + SESSION_DAYS * 86_400_000),
  ]);
  return `${COOKIE}=${token}; Path=/api/guild; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Strict`;
}

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));

async function admin(ctx, method, path) {
  const { request, db, url, now } = ctx;
  const body = async () => {
    try {
      return await request.json();
    } catch {
      return {};
    }
  };
  const stored = await meta(db, 'admin_password');

  if (method === 'GET' && path === '/status') return json({ hasPassword: !!stored, loggedIn: await session(ctx) }, 200);

  if (method === 'POST' && path === '/setup') {
    if (stored) return json({ error: 'already_set' }, 409);
    const { password } = await body();
    if (typeof password !== 'string' || password.length < 8 || password.length > 200) return json({ error: 'weak_password' }, 400);
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    // INSERT OR IGNORE: if two people race, only the first password is kept.
    const res = await db.prepare("INSERT OR IGNORE INTO guild_meta (key, value) VALUES ('admin_password', ?)").bind(salt + ':' + (await passwordHash(password, salt))).run();
    if (!res.meta.changes) return json({ error: 'already_set' }, 409);
    return json({ ok: true }, 200, { 'Set-Cookie': await openSession(db, now) });
  }

  if (method === 'POST' && path === '/login') {
    if (!stored) return json({ error: 'no_password' }, 409);
    const who = (await ipHash(db, request)) || 'local';
    const failKey = 'fail:' + who;
    const fails = JSON.parse((await meta(db, failKey)) || '{"n":0,"t":0}');
    if (fails.n >= 5 && now - fails.t < 10 * 60_000) return json({ error: 'locked' }, 429);
    const { password } = await body();
    const [salt, hash] = stored.split(':');
    if (typeof password !== 'string' || !sameText(await passwordHash(password, salt), hash)) {
      await setMeta(db, failKey, JSON.stringify({ n: now - fails.t < 10 * 60_000 ? fails.n + 1 : 1, t: now }));
      return json({ error: 'wrong_password' }, 401);
    }
    await db.prepare('DELETE FROM guild_meta WHERE key = ?').bind(failKey).run();
    return json({ ok: true }, 200, { 'Set-Cookie': await openSession(db, now) });
  }

  // Everything below needs a logged-in admin.
  if (!(await session(ctx))) return json({ error: 'not_admin' }, 401);

  if (method === 'POST' && path === '/logout') {
    const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`).exec(request.headers.get('Cookie') || '');
    if (m) await db.prepare('DELETE FROM guild_sessions WHERE token_hash = ?').bind(await sha256(m[1])).run();
    return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/api/guild; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
  }

  if (method === 'GET' && path === '/roster') {
    const { results } = await db.prepare('SELECT * FROM guild_members ORDER BY active DESC, power DESC').all();
    return json({ members: results.map(memberView) }, 200);
  }

  if (method === 'GET' && path === '/days') {
    const { results } = await db
      .prepare('SELECT d.date AS date, (SELECT COUNT(*) FROM guild_raid_attend a WHERE a.date = d.date) AS n FROM guild_raid_days d ORDER BY d.date DESC')
      .all();
    return json({ days: results }, 200);
  }

  if (path === '/day') {
    const date = method === 'PUT' ? null : url.searchParams.get('date') || '';
    if (method === 'GET') {
      if (!isDate(date)) return json({ error: 'bad_date' }, 400);
      const [day, rows] = await db.batch([
        db.prepare('SELECT 1 AS saved FROM guild_raid_days WHERE date = ?').bind(date),
        db.prepare('SELECT uid FROM guild_raid_attend WHERE date = ?').bind(date),
      ]);
      return json({ date, saved: day.results.length > 0, present: rows.results.map((r) => r.uid) }, 200);
    }
    if (method === 'DELETE') {
      if (!isDate(date)) return json({ error: 'bad_date' }, 400);
      await db.batch([db.prepare('DELETE FROM guild_raid_attend WHERE date = ?').bind(date), db.prepare('DELETE FROM guild_raid_days WHERE date = ?').bind(date)]);
      await raidTotals(db);
      return json({ ok: true }, 200);
    }
    if (method === 'PUT') {
      const b = await body();
      if (!isDate(b.date) || b.date > kstDate(now)) return json({ error: 'bad_date' }, 400);
      if (!Array.isArray(b.present)) return json({ error: 'bad_request' }, 400);
      const { results } = await db.prepare('SELECT uid FROM guild_members').all();
      const known = new Set(results.map((r) => r.uid));
      const present = [...new Set(b.present.map(String))].filter((u) => known.has(u));
      // One batch is one transaction: the day is replaced as a whole or not at all.
      await db.batch([
        db.prepare('DELETE FROM guild_raid_attend WHERE date = ?').bind(b.date),
        ...present.map((u) => db.prepare('INSERT INTO guild_raid_attend (date, uid) VALUES (?, ?)').bind(b.date, u)),
        db.prepare('INSERT INTO guild_raid_days (date, saved_at) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET saved_at = excluded.saved_at').bind(b.date, now),
      ]);
      await raidTotals(db);
      return json({ ok: true, date: b.date, present }, 200);
    }
  }

  if (method === 'GET' && path === '/pending') {
    const { results } = await db
      .prepare("SELECT u.id, u.uid, u.reason, u.read_json, u.created_at, m.nickname, m.level, m.power FROM guild_updates u JOIN guild_members m ON m.uid = u.uid WHERE u.status = 'pending' ORDER BY u.created_at")
      .all();
    return json({ pending: results.map((r) => ({ id: r.id, uid: r.uid, nickname: r.nickname, reason: r.reason, read: JSON.parse(r.read_json || '{}'), onFile: { level: r.level, power: r.power }, createdAt: r.created_at })) }, 200);
  }
  const pic = /^\/pending\/(\d+)\/(shot|char|face)$/.exec(path);
  if (method === 'GET' && pic) {
    const row = await db.prepare(`SELECT ${pic[2]} AS body FROM guild_updates WHERE id = ? AND status = 'pending'`).bind(Number(pic[1])).first();
    if (!row || !row.body) return json({ error: 'not_found' }, 404);
    const bytes = toBytes(row.body);
    return new Response(bytes, { headers: { 'Content-Type': mimeOf(bytes) || 'application/octet-stream', 'Cache-Control': 'private, no-store' } });
  }
  const decide = /^\/pending\/(\d+)$/.exec(path);
  if (method === 'POST' && decide) {
    const b = await body();
    const row = await db.prepare("SELECT * FROM guild_updates WHERE id = ? AND status = 'pending'").bind(Number(decide[1])).first();
    if (!row) return json({ error: 'not_found' }, 404);
    if (b.action === 'approve') {
      const cls = CLASSES.includes(b.cls) ? b.cls : null;
      await applyUpdate(db, row.uid, { level: levelValue(b.level), power: powerValue(b.power), cls }, toBytes(row.char), toBytes(row.face), now);
    } else if (b.action !== 'reject') return json({ error: 'bad_request' }, 400);
    // Decided requests keep their record but not their pictures.
    await db
      .prepare('UPDATE guild_updates SET status = ?, decided_at = ?, shot = NULL, char = NULL, face = NULL WHERE id = ?')
      .bind(b.action === 'approve' ? 'applied' : 'rejected', now, row.id)
      .run();
    return json({ ok: true }, 200);
  }

  if (method === 'POST' && path === '/member') {
    const b = await body();
    const nickname = typeof b.nickname === 'string' ? b.nickname.trim() : '';
    const cls = CLASSES.includes(b.cls) ? b.cls : null;
    const level = b.level === '' || b.level == null ? null : levelValue(b.level);
    const power = b.power === '' || b.power == null ? null : powerValue(b.power);
    if (b.uid) {
      const cur = await db.prepare('SELECT * FROM guild_members WHERE uid = ?').bind(String(b.uid)).first();
      if (!cur) return json({ error: 'not_found' }, 404);
      const name = nickname || cur.nickname;
      const clash = await db.prepare('SELECT 1 FROM guild_members WHERE nickname = ? AND uid != ?').bind(name, cur.uid).first();
      if (clash) return json({ error: 'nickname_taken' }, 409);
      await db
        .prepare('UPDATE guild_members SET nickname = ?, cls = ?, level = ?, power = ?, active = ?, updated_at = ? WHERE uid = ?')
        .bind(name, cls ?? cur.cls, level ?? cur.level, power ?? cur.power, b.active === false ? 0 : b.active === true ? 1 : cur.active, now, cur.uid)
        .run();
      return json({ ok: true, uid: cur.uid }, 200);
    }
    if (!nickname || nickname.length > 24) return json({ error: 'bad_nickname' }, 400);
    if (await db.prepare('SELECT 1 FROM guild_members WHERE nickname = ?').bind(nickname).first()) return json({ error: 'nickname_taken' }, 409);
    const uid = /^\d{6,20}$/.test(String(b.gameUid || '')) ? String(b.gameUid) : 'm' + now;
    await db.prepare('INSERT INTO guild_members (uid, nickname, cls, level, power, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(uid, nickname, cls, level, power, now).run();
    return json({ ok: true, uid }, 200);
  }

  return json({ error: 'not_found' }, 404);
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}
