/* D&D Sheet API (Cloudflare Pages Functions, only /api/*). Stage 3: backup and sync of characters in D1.
   Identity comes only from the Cloudflare Access JWT (header Cf-Access-Jwt-Assertion), verified against the team keys.
   Env: DB (D1 binding), ACCESS_TEAM (team name, e.g. purple-frog-276b), ACCESS_AUD (Application Audience tag).
   DEV_USER (local tests only): when set and ACCESS_AUD is empty, that email is used without a JWT. Never set it on Cloudflare.
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
  if (!env.ACCESS_AUD) return env.DEV_USER ? String(env.DEV_USER).toLowerCase() : null;
  const tok = req.headers.get("cf-access-jwt-assertion");
  if (!tok) return null;
  const p = tok.split("."); if (p.length !== 3) return null;
  let head, body;
  try { head = JSON.parse(new TextDecoder().decode(b64u(p[0]))); body = JSON.parse(new TextDecoder().decode(b64u(p[1]))); } catch (e) { return null; }
  if (head.alg !== "RS256") return null;
  const now = Date.now() / 1000;
  if (!body.exp || body.exp < now || (body.nbf && body.nbf > now + 60)) return null;
  const aud = Array.isArray(body.aud) ? body.aud : [body.aud];
  if (aud.indexOf(env.ACCESS_AUD) < 0) return null;
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
  READY = true;
}

async function rid() { const a = new Uint8Array(9); crypto.getRandomValues(a); return "u" + Array.from(a, x => x.toString(16).padStart(2, "0")).join(""); }

async function userOf(db, email) {
  let u = await db.prepare("SELECT id, name FROM users WHERE email = ?").bind(email).first();
  if (u) return u;
  const id = await rid();
  await db.prepare("INSERT OR IGNORE INTO users (id, email, name, created) VALUES (?, ?, ?, ?)").bind(id, email, email.split("@")[0], Date.now()).run();
  return db.prepare("SELECT id, name FROM users WHERE email = ?").bind(email).first();
}

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
    db.prepare("INSERT INTO state (k, v) VALUES ('mode', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(mode),
    db.prepare("INSERT INTO state (k, v) VALUES ('yesterday', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(JSON.stringify({ day: y, req: tot.req, wr: tot.wr, rd: tot.rd, pct: Math.round(pct * 100) }))
  ]);
  return mode;
}

async function count(db, owner, f) {
  await db.prepare("INSERT INTO usage (owner, day, req, wr, rd) VALUES (?, ?, 1, ?, ?) ON CONFLICT(owner, day) DO UPDATE SET req = req + 1, wr = wr + excluded.wr, rd = rd + excluded.rd")
    .bind(owner, today(), f.wr || 0, f.rd || 0).run();
}

export async function onRequest(ctx) {
  const { request: req, env } = ctx, url = new URL(req.url), path = url.pathname.replace(/^\/api\/?/, "").replace(/\/+$/, ""), parts = path ? path.split("/") : [];
  if (parts[0] === "health") return json({ ok: true, db: !!env.DB });
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

  // GET /api/me
  if (parts[0] === "me" && m === "GET") {
    const s = await db.prepare("SELECT COUNT(*) n, COALESCE(SUM(size),0) bytes FROM chars WHERE owner = ? AND deleted = 0").bind(owner).first();
    await count(db, owner, { rd: 2 });
    return json({ id: owner, name: u.name, mode, chars: s.n, bytes: s.bytes, limits: { bytes: LIM.bytes, chars: LIM.chars, one: LIM.one } });
  }
  if (parts[0] !== "chars") return json({ error: "not-found" }, 404);
  const id = parts[1] || "";
  if (id && !/^[A-Za-z0-9_-]{1,40}$/.test(id)) return json({ error: "bad-id" }, 400);

  // GET /api/chars : list without data
  if (!id && m === "GET") {
    const r = await db.prepare("SELECT id, rev, t, name, sub, size, deleted FROM chars WHERE owner = ? ORDER BY t DESC").bind(owner).all();
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
    const b = { data: await req.text(), base: url.searchParams.get("base"), t: url.searchParams.get("t"), force: url.searchParams.get("force") === "1", name: dec("x-name"), sub: dec("x-sub") };
    if (!b.data) return json({ error: "bad-data" }, 400);
    const size = b.data.length;
    if (size > LIM.one) return json({ error: "too-big", limit: LIM.one }, 413);
    const cur = await db.prepare("SELECT rev, t, size, deleted, vt, name, data FROM chars WHERE owner = ? AND id = ?").bind(owner, id).first();
    if (cur && !b.force && +b.base !== cur.rev) { await count(db, owner, { rd: 1 }); return json({ error: "conflict", rev: cur.rev, t: cur.t }, 409); }
    const s = await db.prepare("SELECT COUNT(*) n, COALESCE(SUM(size),0) bytes FROM chars WHERE owner = ? AND deleted = 0").bind(owner).first();
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
    st.push(db.prepare("INSERT INTO chars (owner, id, rev, t, name, sub, data, size, deleted, vt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?) ON CONFLICT(owner, id) DO UPDATE SET rev = excluded.rev, t = excluded.t, name = excluded.name, sub = excluded.sub, data = excluded.data, size = excluded.size, deleted = 0, vt = excluded.vt")
      .bind(owner, id, rev, t, String(b.name || "").slice(0, 80), String(b.sub || "").slice(0, 120), b.data, size, vt));
    await db.batch(st);
    await count(db, owner, { wr: st.length + 1, rd: 2 });
    return json({ rev, t });
  }
  // DELETE /api/chars/:id  body {base} : to the recycle bin for 30 days
  if (id && !parts[2] && m === "DELETE") {
    const r = await db.prepare("UPDATE chars SET deleted = ?, rev = rev + 1 WHERE owner = ? AND id = ? AND deleted = 0").bind(Date.now(), owner, id).run();
    await count(db, owner, { wr: 2 });
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
