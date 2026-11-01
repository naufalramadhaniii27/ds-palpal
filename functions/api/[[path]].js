/* D&D Sheet API (Cloudflare Pages Functions, only /api/*). Stage 3: backup and sync of characters in D1. Stage 3b: profiles, mutual follow,
   blocks, view-only sharing, copy requests, feed. Stage 4: portraits in their own table. Synced settings. Admin numbers for the first user.
   Identity comes only from the Cloudflare Access JWT (header Cf-Access-Jwt-Assertion), verified against the team keys.
   Env: DB (D1 binding), ACCESS_TEAM (team name, e.g. purple-frog-276b), ACCESS_AUD (Application Audience tag).
   ACCESS_AUD empty: any application of this team is accepted (the team has one). Set it to lock the API to this application.
   DEV_USER (local tests only): when set and ACCESS_TEAM is empty, that email is used without a JWT, on localhost only. Never set it on Cloudflare.
   Free plan budget, per user and day: 1000 requests, 1200 rows written, 20000 rows read, 50 MB, 50 characters, 1 MB each, 30 versions. */

const LIM = { req: 1000, wr: 1200, rd: 20000, bytes: 50 * 1024 * 1024, chars: 50, one: 1024 * 1024, vers: 30, bin: 30 };
const GLOBAL = { req: 100000, wr: 100000, rd: 5000000 };
const HOUR = 3600 * 1000, DAY = 24 * HOUR;

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, created INTEGER)",
  "CREATE TABLE IF NOT EXISTS chars (owner TEXT NOT NULL, id TEXT NOT NULL, rev INTEGER NOT NULL, t INTEGER NOT NULL, name TEXT, sub TEXT, data TEXT, size INTEGER NOT NULL DEFAULT 0, deleted INTEGER NOT NULL DEFAULT 0, vt INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (owner, id))",
  "CREATE TABLE IF NOT EXISTS versions (owner TEXT NOT NULL, id TEXT NOT NULL, rev INTEGER NOT NULL, t INTEGER NOT NULL, name TEXT, data TEXT, size INTEGER NOT NULL DEFAULT 0, why TEXT, PRIMARY KEY (owner, id, rev))",
  "CREATE TABLE IF NOT EXISTS usage (owner TEXT NOT NULL, day TEXT NOT NULL, req INTEGER NOT NULL DEFAULT 0, wr INTEGER NOT NULL DEFAULT 0, rd INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (owner, day))",
  "CREATE TABLE IF NOT EXISTS state (k TEXT PRIMARY KEY, v TEXT)"
];

/* added in schema 2. ALTER fails when the column is already there, so each runs on its own */
const SCHEMA2 = [
  "ALTER TABLE users ADD COLUMN username TEXT", "ALTER TABLE users ADD COLUMN code TEXT", "ALTER TABLE users ADD COLUMN bio TEXT",
  "ALTER TABLE users ADD COLUMN avatar TEXT", "ALTER TABLE users ADD COLUMN prefs TEXT", "ALTER TABLE users ADD COLUMN prefs_t INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE users ADD COLUMN seen INTEGER NOT NULL DEFAULT 0", "ALTER TABLE users ADD COLUMN active TEXT",
  "ALTER TABLE chars ADD COLUMN vis TEXT NOT NULL DEFAULT 'private'", "ALTER TABLE chars ADD COLUMN copy_ok INTEGER NOT NULL DEFAULT 1",
  "ALTER TABLE chars ADD COLUMN pin INTEGER NOT NULL DEFAULT 0", "ALTER TABLE chars ADD COLUMN sum TEXT", "ALTER TABLE chars ADD COLUMN from_user TEXT",
  "CREATE UNIQUE INDEX IF NOT EXISTS users_username ON users (username)", "CREATE UNIQUE INDEX IF NOT EXISTS users_code ON users (code)",
  "CREATE TABLE IF NOT EXISTS follows (follower TEXT NOT NULL, followee TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY (follower, followee))",
  "CREATE INDEX IF NOT EXISTS follows_back ON follows (followee, follower)",
  "CREATE TABLE IF NOT EXISTS blocks (blocker TEXT NOT NULL, blocked TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY (blocker, blocked))",
  "CREATE TABLE IF NOT EXISTS shares (owner TEXT NOT NULL, char_id TEXT NOT NULL, recipient TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY (owner, char_id, recipient))",
  "CREATE INDEX IF NOT EXISTS shares_to ON shares (recipient)",
  "CREATE TABLE IF NOT EXISTS copy_requests (id TEXT PRIMARY KEY, char_id TEXT NOT NULL, owner TEXT NOT NULL, requester TEXT NOT NULL, message TEXT, status TEXT NOT NULL, created INTEGER NOT NULL, decided INTEGER NOT NULL DEFAULT 0, new_id TEXT)",
  "CREATE INDEX IF NOT EXISTS copy_owner ON copy_requests (owner, status)", "CREATE INDEX IF NOT EXISTS copy_req ON copy_requests (requester, status)",
  "CREATE TABLE IF NOT EXISTS portraits (owner TEXT NOT NULL, id TEXT NOT NULL, h TEXT NOT NULL, data TEXT NOT NULL, size INTEGER NOT NULL, t INTEGER NOT NULL, PRIMARY KEY (owner, id))"
];
const SOC = { follows: 50, shares: 20, copies: 10, pic: 600 * 1024, prefs: 32 * 1024, msg: 140, bio: 160 };

let KEYS = null, KEYS_AT = 0, READY = false;

function json(o, st = 200) {
  return new Response(JSON.stringify(o), { status: st, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function b64u(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
function today(t) { return new Date(t || Date.now()).toISOString().slice(0, 10); }

async function teamKeys(team) {
  if (KEYS && Date.now() - KEYS_AT < HOUR) return KEYS;
  const r = await fetch("https://" + team + ".cloudflareaccess.com/cdn-cgi/access/certs");
  if (!r.ok) throw new Error("certs " + r.status);
  KEYS = (await r.json()).keys || []; KEYS_AT = Date.now(); return KEYS;
}

/* returns the email of the signed-in person, "" for a service token, null when the token is missing or wrong */
async function who(req, env) {
  // local tests only (no team set): DEV_USER, or another test person named in x-dev-user. Only on this computer: if ACCESS_TEAM is lost on a
  // deployed copy, nobody is let in, whatever DEV_USER says
  if (!env.ACCESS_TEAM) {
    const host = new URL(req.url).hostname;
    if (host !== "localhost" && host !== "127.0.0.1" && host !== "[::1]") return null;
    return env.DEV_USER ? String(req.headers.get("x-dev-user") || env.DEV_USER).toLowerCase() : null;
  }
  const tok = req.headers.get("cf-access-jwt-assertion");
  if (!tok) return null;
  const p = tok.split("."); if (p.length !== 3) return null;
  let head, body;
  try { head = JSON.parse(new TextDecoder().decode(b64u(p[0]))); body = JSON.parse(new TextDecoder().decode(b64u(p[1]))); } catch (e) { return null; }
  if (head.alg !== "RS256") return null;
  const now = Date.now() / 1000;
  if (!body.exp || body.exp < now || (body.nbf && body.nbf > now + 60)) return null;
  const aud = Array.isArray(body.aud) ? body.aud : [body.aud];
  if (env.ACCESS_AUD && aud.indexOf(env.ACCESS_AUD) < 0) return null;
  if (body.iss !== "https://" + env.ACCESS_TEAM + ".cloudflareaccess.com") return null;
  let keys = await teamKeys(env.ACCESS_TEAM), jwk = keys.find(k => k.kid === head.kid);
  if (!jwk) { KEYS = null; keys = await teamKeys(env.ACCESS_TEAM); jwk = keys.find(k => k.kid === head.kid); }
  if (!jwk) return null;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(p[2]), new TextEncoder().encode(p[0] + "." + p[1]));
  if (!ok) return null;
  return body.email ? String(body.email).toLowerCase() : "";
}

async function ensure(db) {
  if (READY) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  const v = await db.prepare("SELECT v FROM state WHERE k = 'schema'").first();
  if (!v || +v.v < 2) {
    for (const q of SCHEMA2) { try { await db.prepare(q).run(); } catch (e) { if (!/duplicate column/i.test(String(e && e.message))) throw e; } }
    await db.prepare("INSERT INTO state (k, v) VALUES ('schema', '2') ON CONFLICT(k) DO UPDATE SET v = excluded.v").run();
  }
  const v3 = await db.prepare("SELECT v FROM state WHERE k = 'schema'").first();
  if (+v3.v < 3) {
    // schema 3: friend codes were made from the name and the first name from the email. Both are replaced, so no part of an email shows
    const us = (await db.prepare("SELECT id, email, name FROM users").all()).results;
    for (const x of us) {
      const local = String(x.email || "").split("@")[0];
      let ok = false;
      for (let i = 0; !ok && i < 5; i++) { try { await db.prepare("UPDATE users SET code = ?, name = CASE WHEN name = ? THEN ? ELSE name END WHERE id = ?").bind(codeFor(), local, nameFor(), x.id).run(); ok = true; } catch (e) {} }
    }
    await db.prepare("UPDATE chars SET from_user = NULL WHERE from_user IN (SELECT substr(email, 1, instr(email, '@') - 1) FROM users)").run();
    await db.prepare("INSERT INTO state (k, v) VALUES ('schema', '3') ON CONFLICT(k) DO UPDATE SET v = excluded.v").run();
  }
  READY = true;
}

async function rid() { const a = new Uint8Array(9); crypto.getRandomValues(a); return "u" + Array.from(a, x => x.toString(16).padStart(2, "0")).join(""); }

const UCOLS = "id, name, username, code, bio, avatar, prefs_t, seen, created, active";
/* friend code: random, two groups of four, no letters that look alike (e.g. K7QM-3XPA). Nothing from the email or the name */
const CODE_ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function codeFor() { const a = new Uint8Array(8); crypto.getRandomValues(a); const c = Array.from(a, x => CODE_ABC[x % 32]).join(""); return c.slice(0, 4) + "-" + c.slice(4); }
/* a first name that does not come from the email: Player and four random signs */
function nameFor() { return "Player " + codeFor().slice(0, 4); }
async function userOf(db, email) {
  let u = await db.prepare("SELECT " + UCOLS + " FROM users WHERE email = ?").bind(email).first();
  if (!u) {
    const id = await rid();
    await db.prepare("INSERT OR IGNORE INTO users (id, email, name, created) VALUES (?, ?, ?, ?)").bind(id, email, nameFor(), Date.now()).run();
    u = await db.prepare("SELECT " + UCOLS + " FROM users WHERE email = ?").bind(email).first();
  }
  for (let i = 0; !u.code && i < 5; i++) {
    const c = codeFor();
    try { await db.prepare("UPDATE users SET code = ? WHERE id = ? AND code IS NULL").bind(c, u.id).run(); u.code = c; } catch (e) {}
  }
  const d = today();
  if (u.active !== d) db.prepare("UPDATE users SET active = ? WHERE id = ?").bind(d, u.id).run().catch(() => {});
  return u;
}
async function mutual(db, a, b) {
  const r = await db.prepare("SELECT COUNT(*) n FROM follows WHERE (follower = ? AND followee = ?) OR (follower = ? AND followee = ?)").bind(a, b, b, a).first();
  return r.n === 2;
}
async function blockedEither(db, a, b) {
  return !!(await db.prepare("SELECT 1 x FROM blocks WHERE (blocker = ? AND blocked = ?) OR (blocker = ? AND blocked = ?)").bind(a, b, b, a).first());
}
/* the SQL condition for "viewer may see this character of a mutual friend" (c = chars row) */
const SEEABLE = "c.deleted = 0 AND (c.vis = 'profile' OR (c.vis = 'shared' AND EXISTS (SELECT 1 FROM shares s WHERE s.owner = c.owner AND s.char_id = c.id AND s.recipient = ?1)))";
async function canSee(db, viewer, owner, id) {
  if (viewer === owner) return db.prepare("SELECT c.* FROM chars c WHERE c.owner = ?2 AND c.id = ?3 AND c.deleted = 0").bind(viewer, owner, id).first();
  if (!(await mutual(db, viewer, owner)) || (await blockedEither(db, viewer, owner))) return null;
  return db.prepare("SELECT c.* FROM chars c WHERE c.owner = ?2 AND c.id = ?3 AND " + SEEABLE).bind(viewer, owner, id).first();
}
function pub(u) { return u ? { id: u.id, name: u.name || "", username: u.username || "", avatar: u.avatar || "" } : null; }
async function findUser(db, h) {
  h = String(h || "").trim(); if (!h) return null;
  if (/^u[0-9a-f]{18}$/.test(h)) return db.prepare("SELECT " + UCOLS + " FROM users WHERE id = ?").bind(h).first();
  return db.prepare("SELECT " + UCOLS + " FROM users WHERE username = ? OR code = ?").bind(h.toLowerCase().replace(/^@/, ""), h.toUpperCase()).first();
}
async function body(req, max) { const t = await req.text(); if (t.length > (max || 8192)) throw { st: 413 }; try { return t ? JSON.parse(t) : {}; } catch (e) { throw { st: 400 }; } }
function dayStart() { return Date.parse(today() + "T00:00:00Z"); }

/* once per UTC day: trim versions, empty the recycle bin, drop old usage rows, set today's mode from yesterday's totals */
async function daily(db) {
  const d = today(), st = await db.prepare("SELECT v FROM state WHERE k = 'day'").first();
  if (st && st.v === d) { const m = await db.prepare("SELECT v FROM state WHERE k = 'mode'").first(); return m ? m.v : "normal"; }
  const claim = await db.prepare("INSERT INTO state (k, v) VALUES ('day', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v WHERE state.v <> excluded.v").bind(d).run();
  if (!claim.meta || !claim.meta.changes) { const m = await db.prepare("SELECT v FROM state WHERE k = 'mode'").first(); return m ? m.v : "normal"; }
  const y = today(Date.now() - DAY);
  const tot = await db.prepare("SELECT COALESCE(SUM(req),0) req, COALESCE(SUM(wr),0) wr, COALESCE(SUM(rd),0) rd FROM usage WHERE day = ?").bind(y).first();
  const pct = Math.max(tot.req / GLOBAL.req, tot.wr / GLOBAL.wr, tot.rd / GLOBAL.rd);
  const mode = pct > 0.9 ? "pause" : pct > 0.7 ? "save" : "normal";
  await db.batch([
    db.prepare("DELETE FROM versions WHERE rowid IN (SELECT rowid FROM (SELECT rowid, ROW_NUMBER() OVER (PARTITION BY owner, id ORDER BY rev DESC) n FROM versions) WHERE n > ?)").bind(LIM.vers),
    db.prepare("DELETE FROM versions WHERE (owner, id) IN (SELECT owner, id FROM chars WHERE deleted > 0 AND deleted < ?)").bind(Date.now() - LIM.bin * DAY),
    db.prepare("DELETE FROM chars WHERE deleted > 0 AND deleted < ?").bind(Date.now() - LIM.bin * DAY),
    db.prepare("DELETE FROM usage WHERE day < ?").bind(today(Date.now() - 40 * DAY)),
    db.prepare("UPDATE copy_requests SET status = 'expired', decided = ? WHERE status = 'pending' AND created < ?").bind(Date.now(), Date.now() - 7 * DAY),
    db.prepare("DELETE FROM copy_requests WHERE status <> 'pending' AND decided < ?").bind(Date.now() - 30 * DAY),
    db.prepare("DELETE FROM portraits WHERE NOT EXISTS (SELECT 1 FROM chars c WHERE c.owner = portraits.owner AND c.id = portraits.id)"),
    db.prepare("INSERT INTO state (k, v) VALUES ('mode', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(mode),
    db.prepare("INSERT INTO state (k, v) VALUES ('yesterday', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(JSON.stringify({ day: y, req: tot.req, wr: tot.wr, rd: tot.rd, pct: Math.round(pct * 100) }))
  ]);
  return mode;
}

async function count(db, owner, f) {
  await db.prepare("INSERT INTO usage (owner, day, req, wr, rd) VALUES (?, ?, 1, ?, ?) ON CONFLICT(owner, day) DO UPDATE SET req = req + 1, wr = wr + excluded.wr, rd = rd + excluded.rd")
    .bind(owner, today(), f.wr || 0, f.rd || 0).run();
}

async function used(db, owner) {
  const c = await db.prepare("SELECT COUNT(*) n, COALESCE(SUM(size),0) bytes FROM chars WHERE owner = ? AND deleted = 0").bind(owner).first();
  const p = await db.prepare("SELECT COALESCE(SUM(size),0) bytes FROM portraits WHERE owner = ?").bind(owner).first();
  return { n: c.n, bytes: c.bytes + p.bytes };
}
async function isAdmin(db, owner) {
  const f = await db.prepare("SELECT id FROM users ORDER BY created ASC LIMIT 1").first();
  return !!f && f.id === owner;
}
async function people(db, ids) {
  if (!ids.length) return {};
  const r = await db.prepare("SELECT id, name, username, avatar FROM users WHERE id IN (" + ids.map(() => "?").join(",") + ")").bind(...ids).all();
  const o = {}; r.results.forEach(x => { o[x.id] = pub(x); }); return o;
}
/* removes what two people shared with each other: shares both ways and open copy requests */
function unlinkSt(db, a, b) {
  return [
    db.prepare("DELETE FROM shares WHERE (owner = ? AND recipient = ?) OR (owner = ? AND recipient = ?)").bind(a, b, b, a),
    db.prepare("UPDATE copy_requests SET status = 'cancelled', decided = ? WHERE status = 'pending' AND ((owner = ? AND requester = ?) OR (owner = ? AND requester = ?))").bind(Date.now(), a, b, b, a)
  ];
}

/* everything that is not character sync. Returns null when the path is not handled here */
async function social(db, req, url, parts, m, u, me, mode) {
  const p0 = parts[0], p1 = parts[1] || "", p2 = parts[2] || "";

  if (p0 === "me" && m === "GET") {
    const s = await used(db, me);
    const fo = await db.prepare("SELECT (SELECT COUNT(*) FROM follows WHERE follower = ?1) following, (SELECT COUNT(*) FROM follows WHERE followee = ?1) followers, (SELECT COUNT(*) FROM follows WHERE followee = ?1 AND created > ?2) newFollowers, (SELECT COUNT(*) FROM copy_requests WHERE owner = ?1 AND status = 'pending') requests, (SELECT COUNT(*) FROM copy_requests WHERE owner = ?1 AND status = 'pending' AND created > ?2) newRequests, (SELECT COUNT(*) FROM shares WHERE recipient = ?1 AND created > ?2) newShares").bind(me, u.seen || 0).first();
    await count(db, me, { rd: 8 });
    return json({ id: me, name: u.name, username: u.username || "", code: u.code || "", bio: u.bio || "", avatar: u.avatar || "", admin: await isAdmin(db, me),
      mode, chars: s.n, bytes: s.bytes, prefsT: u.prefs_t || 0, social: fo, limits: { bytes: LIM.bytes, chars: LIM.chars, one: LIM.one, pic: SOC.pic } });
  }
  if (p0 === "me" && m === "PUT") {
    const b = await body(req);
    const name = String(b.name == null ? u.name : b.name).trim().slice(0, 40) || u.name;
    let un = b.username == null ? (u.username || null) : String(b.username).trim().toLowerCase().replace(/^@/, "");
    if (un === "") un = null;
    if (un && !/^[a-z0-9_]{3,20}$/.test(un)) return json({ error: "bad-username" }, 400);
    const bio = String(b.bio == null ? (u.bio || "") : b.bio).slice(0, SOC.bio);
    const av = b.avatar == null ? (u.avatar || "") : String(b.avatar).slice(0, 40);
    try { await db.prepare("UPDATE users SET name = ?, username = ?, bio = ?, avatar = ? WHERE id = ?").bind(name, un, bio, av, me).run(); }
    catch (e) { return json({ error: "username-taken" }, 409); }
    await count(db, me, { wr: 1 });
    return json({ ok: true, name, username: un || "", bio, avatar: av });
  }
  if (p0 === "seen" && m === "POST") { await db.prepare("UPDATE users SET seen = ? WHERE id = ?").bind(Date.now(), me).run(); await count(db, me, { wr: 1 }); return json({ ok: true }); }

  // settings that follow the person to every device: raw text, newest wins
  if (p0 === "prefs" && m === "GET") { const r = await db.prepare("SELECT prefs, prefs_t FROM users WHERE id = ?").bind(me).first(); await count(db, me, { rd: 1 }); return json({ t: r.prefs_t || 0, data: r.prefs || "" }); }
  if (p0 === "prefs" && m === "PUT") {
    const t = await req.text(); if (t.length > SOC.prefs) return json({ error: "too-big" }, 413);
    const at = Math.min(+url.searchParams.get("t") || Date.now(), Date.now());
    await db.prepare("UPDATE users SET prefs = ?, prefs_t = ? WHERE id = ? AND prefs_t <= ?").bind(t, at, me, at).run(); await count(db, me, { wr: 1 });
    return json({ ok: true, t: at });
  }

  if (p0 === "friends" && m === "GET") {
    const fi = await db.prepare("SELECT followee id, created FROM follows WHERE follower = ?").bind(me).all();
    const fe = await db.prepare("SELECT follower id, created FROM follows WHERE followee = ?").bind(me).all();
    const bl = await db.prepare("SELECT blocked id FROM blocks WHERE blocker = ?").bind(me).all();
    const rin = await db.prepare("SELECT r.id, r.char_id charId, r.requester, r.message, r.created, c.name charName FROM copy_requests r LEFT JOIN chars c ON c.owner = r.owner AND c.id = r.char_id WHERE r.owner = ? AND r.status = 'pending' ORDER BY r.created DESC").bind(me).all();
    const rout = await db.prepare("SELECT r.id, r.char_id charId, r.owner, r.message, r.status, r.created, r.decided, c.name charName FROM copy_requests r LEFT JOIN chars c ON c.owner = r.owner AND c.id = r.char_id WHERE r.requester = ? ORDER BY r.created DESC LIMIT 30").bind(me).all();
    const ids = [...new Set([...fi.results, ...fe.results, ...bl.results].map(x => x.id).concat(rin.results.map(x => x.requester), rout.results.map(x => x.owner)))];
    const P = await people(db, ids), back = new Set(fe.results.map(x => x.id)), mine = new Set(fi.results.map(x => x.id));
    await count(db, me, { rd: ids.length + fi.results.length + fe.results.length + rin.results.length + rout.results.length + 5 });
    return json({
      following: fi.results.map(x => Object.assign({ mutual: back.has(x.id), since: x.created }, P[x.id])).filter(x => x.id),
      followers: fe.results.map(x => Object.assign({ mutual: mine.has(x.id), since: x.created }, P[x.id])).filter(x => x.id),
      blocked: bl.results.map(x => P[x.id]).filter(Boolean),
      requestsIn: rin.results.map(x => ({ id: x.id, charId: x.charId, charName: x.charName || "", message: x.message || "", created: x.created, from: P[x.requester] })),
      requestsOut: rout.results.map(x => ({ id: x.id, charId: x.charId, charName: x.charName || "", message: x.message || "", status: x.status, created: x.created, decided: x.decided, to: P[x.owner] })),
      seen: u.seen || 0
    });
  }

  // a profile: header for anyone who knows the name or code, the grid only for mutual friends
  if (p0 === "users" && p1 && m === "GET") {
    const t = await findUser(db, decodeURIComponent(p1));
    if (!t || (t.id !== me && (await blockedEither(db, me, t.id)))) return json({ error: "not-found" }, 404);
    const rel = t.id === me ? { self: true } : {
      following: !!(await db.prepare("SELECT 1 x FROM follows WHERE follower = ? AND followee = ?").bind(me, t.id).first()),
      followsYou: !!(await db.prepare("SELECT 1 x FROM follows WHERE follower = ? AND followee = ?").bind(t.id, me).first())
    };
    rel.mutual = !!rel.self || (rel.following && rel.followsYou);
    const n = await db.prepare("SELECT (SELECT COUNT(*) FROM follows WHERE followee = ?1) followers, (SELECT COUNT(*) FROM follows WHERE follower = ?1) following, (SELECT COUNT(*) FROM chars c WHERE c.owner = ?1 AND c.deleted = 0 AND c.vis = 'profile') chars").bind(t.id).first();
    let chars = [];
    if (rel.mutual) {
      const q = rel.self ? "SELECT c.id, c.name, c.sub, c.sum, c.t, c.pin, c.vis FROM chars c WHERE c.owner = ?2 AND c.deleted = 0 AND c.vis <> 'private' ORDER BY c.pin DESC, c.t DESC"
        : "SELECT c.id, c.name, c.sub, c.sum, c.t, c.pin, c.vis FROM chars c WHERE c.owner = ?2 AND " + SEEABLE + " ORDER BY c.pin DESC, c.t DESC";
      chars = (await db.prepare(q).bind(me, t.id).all()).results;
    }
    await count(db, me, { rd: chars.length + 6 });
    return json({ user: Object.assign(pub(t), { bio: t.bio || "", code: rel.self ? t.code : "" }), counts: n, rel, chars });
  }

  if ((p0 === "follow" || p0 === "block") && p1) {
    const t = await findUser(db, p1);
    if (!t || t.id === me) return json({ error: "not-found" }, 404);
    if (p0 === "follow" && m === "POST") {
      if (await blockedEither(db, me, t.id)) return json({ error: "not-found" }, 404);
      const d = await db.prepare("SELECT COUNT(*) n FROM follows WHERE follower = ? AND created >= ?").bind(me, dayStart()).first();
      if (d.n >= SOC.follows) return json({ error: "limit", limit: SOC.follows }, 429);
      await db.prepare("INSERT OR IGNORE INTO follows (follower, followee, created) VALUES (?, ?, ?)").bind(me, t.id, Date.now()).run();
      await count(db, me, { wr: 1, rd: 3 }); return json({ ok: true, mutual: await mutual(db, me, t.id) });
    }
    if (p0 === "follow" && m === "DELETE") {
      await db.batch([db.prepare("DELETE FROM follows WHERE follower = ? AND followee = ?").bind(me, t.id), ...unlinkSt(db, me, t.id)]);
      await count(db, me, { wr: 3 }); return json({ ok: true });
    }
    if (p0 === "block" && m === "POST") {
      await db.batch([db.prepare("INSERT OR IGNORE INTO blocks (blocker, blocked, created) VALUES (?, ?, ?)").bind(me, t.id, Date.now()),
        db.prepare("DELETE FROM follows WHERE (follower = ? AND followee = ?) OR (follower = ? AND followee = ?)").bind(me, t.id, t.id, me), ...unlinkSt(db, me, t.id)]);
      await count(db, me, { wr: 4 }); return json({ ok: true });
    }
    if (p0 === "block" && m === "DELETE") { await db.prepare("DELETE FROM blocks WHERE blocker = ? AND blocked = ?").bind(me, t.id).run(); await count(db, me, { wr: 1 }); return json({ ok: true }); }
  }

  // sharing settings of one of my characters
  if (p0 === "chars" && p1 && p2 === "meta") {
    const c = await db.prepare("SELECT id, vis, copy_ok, pin FROM chars WHERE owner = ? AND id = ? AND deleted = 0").bind(me, p1).first();
    if (!c) return json({ error: "not-found" }, 404);
    if (m === "GET") {
      const sh = await db.prepare("SELECT recipient FROM shares WHERE owner = ? AND char_id = ?").bind(me, p1).all();
      const P = await people(db, sh.results.map(x => x.recipient));
      await count(db, me, { rd: sh.results.length + 2 });
      return json({ vis: c.vis, copyOk: !!c.copy_ok, pin: !!c.pin, share: sh.results.map(x => P[x.recipient]).filter(Boolean) });
    }
    if (m === "PUT") {
      const b = await body(req);
      const vis = ["private", "profile", "shared"].indexOf(b.vis) >= 0 ? b.vis : c.vis;
      const st = [db.prepare("UPDATE chars SET vis = ?, copy_ok = ?, pin = ? WHERE owner = ? AND id = ?").bind(vis, b.copyOk == null ? c.copy_ok : (b.copyOk ? 1 : 0), b.pin == null ? c.pin : (b.pin ? 1 : 0), me, p1)];
      if (Array.isArray(b.share)) {
        const want = [...new Set(b.share.map(String))].slice(0, 100), ok = [];
        for (const r of want) { if (r !== me && (await mutual(db, me, r)) && !(await blockedEither(db, me, r))) ok.push(r); }
        const had = (await db.prepare("SELECT recipient FROM shares WHERE owner = ? AND char_id = ?").bind(me, p1).all()).results.map(x => x.recipient);
        const add = ok.filter(r => had.indexOf(r) < 0);
        const d = await db.prepare("SELECT COUNT(*) n FROM shares WHERE owner = ? AND created >= ?").bind(me, dayStart()).first();
        if (d.n + add.length > SOC.shares) return json({ error: "limit", limit: SOC.shares }, 429);
        st.push(db.prepare("DELETE FROM shares WHERE owner = ? AND char_id = ?" + (ok.length ? " AND recipient NOT IN (" + ok.map(() => "?").join(",") + ")" : "")).bind(me, p1, ...ok));
        add.forEach(r => st.push(db.prepare("INSERT OR IGNORE INTO shares (owner, char_id, recipient, created) VALUES (?, ?, ?, ?)").bind(me, p1, r, Date.now())));
      }
      await db.batch(st); await count(db, me, { wr: st.length, rd: 4 });
      return json({ ok: true, vis });
    }
  }

  if (p0 === "shared" && m === "GET") {
    const r = await db.prepare("SELECT c.owner, c.id, c.name, c.sub, c.sum, c.t FROM shares s JOIN chars c ON c.owner = s.owner AND c.id = s.char_id WHERE s.recipient = ?1 AND c.deleted = 0 AND c.vis = 'shared' AND EXISTS (SELECT 1 FROM follows f WHERE f.follower = ?1 AND f.followee = c.owner) AND EXISTS (SELECT 1 FROM follows f WHERE f.follower = c.owner AND f.followee = ?1) ORDER BY c.t DESC LIMIT 100").bind(me).all();
    const P = await people(db, [...new Set(r.results.map(x => x.owner))]);
    await count(db, me, { rd: r.results.length * 2 + 2 });
    return json({ chars: r.results.map(x => Object.assign(x, { by: P[x.owner] })) });
  }
  if (p0 === "feed" && m === "GET") {
    const r = await db.prepare("SELECT c.owner, c.id, c.name, c.sub, c.sum, c.t FROM chars c WHERE c.owner IN (SELECT f.followee FROM follows f WHERE f.follower = ?1 AND EXISTS (SELECT 1 FROM follows g WHERE g.follower = f.followee AND g.followee = ?1)) AND " + SEEABLE + " ORDER BY c.t DESC LIMIT 30").bind(me).all();
    const P = await people(db, [...new Set(r.results.map(x => x.owner))]);
    await count(db, me, { rd: r.results.length * 2 + 4 });
    return json({ chars: r.results.map(x => Object.assign(x, { by: P[x.owner] })) });
  }
  // read-only copy of a friend's character
  if (p0 === "view" && p1 && p2 && m === "GET") {
    const c = await canSee(db, me, p1, p2);
    if (!c) return json({ error: "not-found" }, 404);
    const o = await db.prepare("SELECT id, name, username, avatar FROM users WHERE id = ?").bind(p1).first();
    const open = c.owner !== me && (await db.prepare("SELECT id, status FROM copy_requests WHERE char_id = ? AND owner = ? AND requester = ? AND status = 'pending'").bind(p2, p1, me).first());
    await count(db, me, { rd: 6 });
    return json({ id: c.id, name: c.name, sub: c.sub, sum: c.sum, t: c.t, data: c.data, copyOk: !!c.copy_ok, vis: c.vis, by: pub(o), requested: !!open });
  }

  // portraits: PUT pic/:charId?h= (mine), GET pic/:owner/:charId
  if (p0 === "pic" && m === "PUT" && p1) {
    const c = await db.prepare("SELECT 1 x FROM chars WHERE owner = ? AND id = ?").bind(me, p1).first();
    if (!c) return json({ error: "not-found" }, 404);
    const t = await req.text(); if (t.length > SOC.pic) return json({ error: "too-big", limit: SOC.pic }, 413);
    if (!/^data:image\/(jpeg|png|webp|avif);base64,/.test(t)) return json({ error: "bad-data" }, 400);
    const h = String(url.searchParams.get("h") || "").slice(0, 40);
    const s = await used(db, me), old = await db.prepare("SELECT size FROM portraits WHERE owner = ? AND id = ?").bind(me, p1).first();
    if (s.bytes - (old ? old.size : 0) + t.length > LIM.bytes) return json({ error: "full", limit: LIM.bytes }, 413);
    await db.prepare("INSERT INTO portraits (owner, id, h, data, size, t) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(owner, id) DO UPDATE SET h = excluded.h, data = excluded.data, size = excluded.size, t = excluded.t").bind(me, p1, h, t, t.length, Date.now()).run();
    await count(db, me, { wr: 1, rd: 4 }); return json({ ok: true, h });
  }
  if (p0 === "pic" && m === "GET" && p1 && p2) {
    if (p1 !== me && !(await canSee(db, me, p1, p2))) return json({ error: "not-found" }, 404);
    const r = await db.prepare("SELECT h, data FROM portraits WHERE owner = ? AND id = ?").bind(p1, p2).first();
    await count(db, me, { rd: 4 });
    return r ? json(r) : json({ error: "not-found" }, 404);
  }

  // copy requests
  if (p0 === "copy" && p1 && p2 && m === "POST") {
    const b = await body(req);
    const c = await canSee(db, me, p1, p2);
    if (!c || p1 === me) return json({ error: "not-found" }, 404);
    if (!c.copy_ok) return json({ error: "copy-off" }, 403);
    if (await db.prepare("SELECT 1 x FROM copy_requests WHERE char_id = ? AND owner = ? AND requester = ? AND status = 'pending'").bind(p2, p1, me).first()) return json({ error: "already" }, 409);
    const d = await db.prepare("SELECT COUNT(*) n FROM copy_requests WHERE requester = ? AND created >= ?").bind(me, dayStart()).first();
    if (d.n >= SOC.copies) return json({ error: "limit", limit: SOC.copies }, 429);
    const s = await used(db, me);
    if (s.n >= LIM.chars || s.bytes + c.size > LIM.bytes) return json({ error: "full" }, 413);
    const id = "r" + (await rid()).slice(1);
    await db.prepare("INSERT INTO copy_requests (id, char_id, owner, requester, message, status, created) VALUES (?, ?, ?, ?, ?, 'pending', ?)").bind(id, p2, p1, me, String(b.message || "").slice(0, SOC.msg), Date.now()).run();
    await count(db, me, { wr: 1, rd: 10 }); return json({ ok: true, id });
  }
  if (p0 === "requests" && p1) {
    const r = await db.prepare("SELECT * FROM copy_requests WHERE id = ?").bind(p1).first();
    if (!r) return json({ error: "not-found" }, 404);
    if (m === "DELETE" && r.requester === me && r.status === "pending") { await db.prepare("UPDATE copy_requests SET status = 'cancelled', decided = ? WHERE id = ?").bind(Date.now(), p1).run(); await count(db, me, { wr: 1 }); return json({ ok: true }); }
    if (m !== "POST" || r.owner !== me || r.status !== "pending") return json({ error: "not-found" }, 404);
    if (p2 === "decline") { await db.prepare("UPDATE copy_requests SET status = 'declined', decided = ? WHERE id = ?").bind(Date.now(), p1).run(); await count(db, me, { wr: 1 }); return json({ ok: true }); }
    if (p2 === "approve") {
      const c = await canSee(db, r.requester, me, r.char_id);
      if (!c || !c.copy_ok) { await db.prepare("UPDATE copy_requests SET status = 'cancelled', decided = ? WHERE id = ?").bind(Date.now(), p1).run(); return json({ error: "not-allowed" }, 403); }
      const s = await used(db, r.requester);
      if (s.n >= LIM.chars || s.bytes + c.size > LIM.bytes) return json({ error: "their-space-full" }, 413);
      const nid = "c" + Date.now() + Math.floor(Math.random() * 1000), now = Date.now();
      // copied in SQL, the character text is never parsed here
      await db.batch([
        db.prepare("INSERT INTO chars (owner, id, rev, t, name, sub, data, size, deleted, vt, vis, copy_ok, pin, sum, from_user) SELECT ?, ?, 1, ?, name, sub, data, size, 0, 0, 'private', 1, 0, sum, ? FROM chars WHERE owner = ? AND id = ?").bind(r.requester, nid, now, u.name || "", me, r.char_id),
        db.prepare("INSERT OR REPLACE INTO portraits (owner, id, h, data, size, t) SELECT ?, ?, h, data, size, ? FROM portraits WHERE owner = ? AND id = ?").bind(r.requester, nid, now, me, r.char_id),
        db.prepare("UPDATE copy_requests SET status = 'approved', decided = ?, new_id = ? WHERE id = ?").bind(now, nid, p1)
      ]);
      await count(db, me, { wr: 3, rd: 12 }); return json({ ok: true, id: nid });
    }
    return json({ error: "not-found" }, 404);
  }

  // numbers for the owner of the app (the first person who signed in)
  if (p0 === "admin" && m === "GET") {
    if (!(await isAdmin(db, me))) return json({ error: "not-found" }, 404);
    const tot = await db.prepare("SELECT (SELECT COUNT(*) FROM users) users, (SELECT COUNT(*) FROM chars WHERE deleted = 0) chars, (SELECT COALESCE(SUM(size),0) FROM chars) charBytes, (SELECT COALESCE(SUM(size),0) FROM versions) versionBytes, (SELECT COALESCE(SUM(size),0) FROM portraits) picBytes, (SELECT COUNT(*) FROM users WHERE active = ?1) activeToday").bind(today()).first();
    const day = await db.prepare("SELECT COALESCE(SUM(req),0) req, COALESCE(SUM(wr),0) wr, COALESCE(SUM(rd),0) rd FROM usage WHERE day = ?").bind(today()).first();
    const y = await db.prepare("SELECT v FROM state WHERE k = 'yesterday'").first();
    const top = await db.prepare("SELECT u.name, u.username, u.active, (SELECT COUNT(*) FROM chars c WHERE c.owner = u.id AND c.deleted = 0) chars, (SELECT COALESCE(SUM(size),0) FROM chars c WHERE c.owner = u.id) + (SELECT COALESCE(SUM(size),0) FROM portraits p WHERE p.owner = u.id) bytes FROM users u ORDER BY bytes DESC LIMIT 20").all();
    // T11 Learn U12: how many people finished each Learn stop, totals only (no per-person rows, U30). Read from the settings that follow a person (prefs, key cs-learn-v1)
    const STOPS = ["apptour", "tavern", "rooftops", "forest", "campsite", "market", "forge", "bridge"];
    const L = "json_extract(prefs, '$.\"cs-learn-v1\"')";
    let learn = null;
    try {
      learn = await db.prepare("SELECT COUNT(*) started, " + STOPS.map(k => "SUM(CASE WHEN json_extract(" + L + ", '$.done." + k + "') IS NOT NULL THEN 1 ELSE 0 END) " + k).join(", ") + ", SUM(CASE WHEN json_extract(" + L + ", '$.quiz.best') IS NOT NULL THEN 1 ELSE 0 END) quiz FROM users WHERE prefs IS NOT NULL AND json_valid(prefs) AND " + L + " IS NOT NULL AND json_valid(" + L + ")").first();
    } catch (e) { learn = null; }
    await count(db, me, { rd: 40 });
    return json({ mode, today: day, yesterday: y ? JSON.parse(y.v) : null, totals: tot, global: GLOBAL, storageLimit: 5 * 1024 * 1024 * 1024, people: top.results, learn, learnStops: STOPS });
  }
  return null;
}

/* G5: the daily cycle for a Cron Trigger when the app runs on Workers (workers/worker.js). On Pages the first request of the day runs it */
export async function dailyRun(env) { if (!env || !env.DB) return null; await ensure(env.DB); return daily(env.DB); }

export async function onRequest(ctx) {
  const { request: req, env } = ctx, url = new URL(req.url), path = url.pathname.replace(/^\/api\/?/, "").replace(/\/+$/, ""), parts = path ? path.split("/") : [];
  if (parts[0] === "health") {
    // the Audience tag of the login token, shown so ACCESS_AUD can be filled in (not secret)
    let aud = ""; try { const t = req.headers.get("cf-access-jwt-assertion"); if (t) { const a = JSON.parse(new TextDecoder().decode(b64u(t.split(".")[1]))).aud; aud = Array.isArray(a) ? a[0] : a; } } catch (e) {}
    return json({ ok: true, db: !!env.DB, aud, audSet: !!env.ACCESS_AUD });
  }
  if (!env.DB) return json({ error: "no-db" }, 503);
  let email;
  try { email = await who(req, env); } catch (e) { return json({ error: "auth-unavailable" }, 503); }
  if (email === null) return json({ error: "signin" }, 401);
  if (email === "") return json({ error: "service-token" }, 403);
  const db = env.DB;
  await ensure(db);
  const mode = await daily(db);
  const u = await userOf(db, email), owner = u.id;
  const use = await db.prepare("SELECT req, wr, rd FROM usage WHERE owner = ? AND day = ?").bind(owner, today()).first() || { req: 0, wr: 0, rd: 0 };
  const m = req.method;
  const heavy = m !== "GET";
  if (use.req >= LIM.req || use.wr >= LIM.wr || use.rd >= LIM.rd || (mode === "pause" && heavy)) return json({ error: "quota", mode, resets: "00:00 UTC" }, 429);

  try {
    const r = await social(db, req, url, parts, m, u, owner, mode);
    if (r) return r;
  } catch (e) {
    if (e && e.st) return json({ error: e.error || "bad-request" }, e.st);
    throw e;
  }
  if (parts[0] !== "chars") return json({ error: "not-found" }, 404);
  const id = parts[1] || "";
  if (id && !/^[A-Za-z0-9_-]{1,40}$/.test(id)) return json({ error: "bad-id" }, 400);

  // GET /api/chars : list without data
  if (!id && m === "GET") {
    const r = await db.prepare("SELECT id, rev, t, name, sub, size, deleted, vis, copy_ok copyOk, pin, from_user fromUser FROM chars WHERE owner = ? ORDER BY t DESC").bind(owner).all();
    await count(db, owner, { rd: r.results.length + 1 });
    return json({ mode, chars: r.results });
  }
  // GET /api/chars/:id
  if (id && !parts[2] && m === "GET") {
    const c = await db.prepare("SELECT id, rev, t, name, sub, data, deleted FROM chars WHERE owner = ? AND id = ?").bind(owner, id).first();
    await count(db, owner, { rd: 1 });
    return c ? json(c) : json({ error: "not-found" }, 404);
  }
  // PUT /api/chars/:id  body: the character as raw text (never parsed here, the CPU budget is 10 ms). Query: base, t, force. Headers: x-name, x-sub (URI encoded)
  if (id && !parts[2] && m === "PUT") {
    const len = +req.headers.get("content-length") || 0;
    if (len > LIM.one) return json({ error: "too-big", limit: LIM.one }, 413);
    const dec = h => { try { return decodeURIComponent(req.headers.get(h) || ""); } catch (e) { return ""; } };
    const b = { data: await req.text(), base: url.searchParams.get("base"), t: url.searchParams.get("t"), force: url.searchParams.get("force") === "1", name: dec("x-name"), sub: dec("x-sub"), sum: dec("x-sum").slice(0, 600) };
    if (!b.data) return json({ error: "bad-data" }, 400);
    const size = b.data.length;
    if (size > LIM.one) return json({ error: "too-big", limit: LIM.one }, 413);
    const cur = await db.prepare("SELECT rev, t, size, deleted, vt, name, data FROM chars WHERE owner = ? AND id = ?").bind(owner, id).first();
    if (cur && !b.force && +b.base !== cur.rev) { await count(db, owner, { rd: 1 }); return json({ error: "conflict", rev: cur.rev, t: cur.t }, 409); }
    const s = await used(db, owner);
    const live = cur && !cur.deleted;
    if (!live && s.n >= LIM.chars) return json({ error: "too-many", limit: LIM.chars }, 413);
    if (s.bytes - (live ? cur.size : 0) + size > LIM.bytes) return json({ error: "full", limit: LIM.bytes }, 413);
    const rev = cur ? cur.rev + 1 : 1, now = Date.now(), t = Math.min(+b.t || now, now);
    const st = [];
    // keep the replaced copy as a version: always on a forced overwrite (two devices), otherwise at most once an hour (once a day in save mode)
    const gap = mode === "save" ? DAY : HOUR;
    let vt = cur ? cur.vt : 0;
    if (cur && cur.data && (b.force || now - cur.vt >= gap)) {
      st.push(db.prepare("INSERT OR REPLACE INTO versions (owner, id, rev, t, name, data, size, why) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(owner, id, cur.rev, cur.t, cur.name, cur.data, cur.size, b.force ? "other-device" : "auto"));
      vt = now;
    }
    st.push(db.prepare("INSERT INTO chars (owner, id, rev, t, name, sub, data, size, deleted, vt, sum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?) ON CONFLICT(owner, id) DO UPDATE SET rev = excluded.rev, t = excluded.t, name = excluded.name, sub = excluded.sub, data = excluded.data, size = excluded.size, deleted = 0, vt = excluded.vt, sum = excluded.sum")
      .bind(owner, id, rev, t, String(b.name || "").slice(0, 80), String(b.sub || "").slice(0, 120), b.data, size, vt, b.sum || null));
    await db.batch(st);
    await count(db, owner, { wr: st.length + 1, rd: 2 });
    return json({ rev, t });
  }
  // DELETE /api/chars/:id  body {base} : to the recycle bin for 30 days
  if (id && !parts[2] && m === "DELETE") {
    const r = await db.prepare("UPDATE chars SET deleted = ?, rev = rev + 1 WHERE owner = ? AND id = ? AND deleted = 0").bind(Date.now(), owner, id).run();
    await db.prepare("DELETE FROM shares WHERE owner = ? AND char_id = ?").bind(owner, id).run();
    await count(db, owner, { wr: 3 });
    return json({ ok: true, changed: r.meta ? r.meta.changes : 0 });
  }
  // GET /api/chars/:id/versions and /api/chars/:id/versions/:rev
  if (id && parts[2] === "versions" && m === "GET") {
    if (parts[3]) {
      const v = await db.prepare("SELECT rev, t, name, data, why FROM versions WHERE owner = ? AND id = ? AND rev = ?").bind(owner, id, +parts[3] || 0).first();
      await count(db, owner, { rd: 1 });
      return v ? json(v) : json({ error: "not-found" }, 404);
    }
    const r = await db.prepare("SELECT rev, t, name, size, why FROM versions WHERE owner = ? AND id = ? ORDER BY rev DESC LIMIT 30").bind(owner, id).all();
    await count(db, owner, { rd: r.results.length + 1 });
    return json({ versions: r.results });
  }
  return json({ error: "not-found" }, 404);
}
