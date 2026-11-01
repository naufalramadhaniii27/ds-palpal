#!/usr/bin/env node
/* The DEV_USER way in (no ACCESS_TEAM) works on localhost only. Needs no server and no database: the database is a stub that is never reached
   when the sign-in is refused.   node tests/api_dev_guard.mjs */
import { pathToFileURL } from "node:url";
import path from "node:path";
const mod = await import(pathToFileURL(path.join(import.meta.dirname, "..", "functions", "api", "[[path]].js")).href);
let bad = 0;
const check = (n, ok, info = "") => { console.log((ok ? "ok   " : "FAIL ") + n + (ok ? "" : " " + info)); if (!ok) bad++; };
async function call(host, env, headers) {
  const stub = { prepare() { throw new Error("db reached"); }, batch() { throw new Error("db reached"); } };
  try { const r = await mod.onRequest({ request: new Request("http://" + host + "/api/me", { headers: headers || {} }), env: Object.assign({ DB: stub }, env) }); return { status: r.status }; }
  catch (e) { return { reached: String(e.message) }; }
}
let r = await call("dnd.example.com", { DEV_USER: "a@test.dev" });
check("deployed host, no ACCESS_TEAM, DEV_USER set: refused (401)", r.status === 401, JSON.stringify(r));
r = await call("dnd.example.com", { DEV_USER: "a@test.dev" }, { "x-dev-user": "b@test.dev" });
check("deployed host, x-dev-user header: refused (401)", r.status === 401, JSON.stringify(r));
r = await call("dnd.example.com", {});
check("deployed host, no DEV_USER: refused (401)", r.status === 401, JSON.stringify(r));
for (const h of ["localhost:8788", "127.0.0.1:8788"]) {
  r = await call(h, { DEV_USER: "a@test.dev" });
  check(h + ", DEV_USER set: signed in (reaches the database)", r.reached === "db reached", JSON.stringify(r));
  r = await call(h, {});
  check(h + ", no DEV_USER: refused (401)", r.status === 401, JSON.stringify(r));
}
r = await call("dnd.example.com", { ACCESS_TEAM: "team", DEV_USER: "a@test.dev" });
check("ACCESS_TEAM set and DEV_USER set: DEV_USER is ignored, no token means 401", r.status === 401, JSON.stringify(r));
console.log(bad ? bad + " failed" : "api_dev_guard: ok"); process.exit(bad ? 1 : 0);
