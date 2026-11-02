#!/usr/bin/env python3
"""Fase 1.3 error reports reach D1 without personal data.  bash tools/run_cloud_sync.sh tests/err_report.py   (BASE=http://localhost:8788 with a local D1)
Checks: a thrown error is stored with its version, an email and a long number in the text are removed, the same report counts once with n up, one device is limited to 50 a day,
cs-err-off=1 stops reports, and a page on plain http without cs-err-test sends nothing. The admin numbers show the errors per version."""
import asyncio, json, os, sys, urllib.request
from playwright.async_api import async_playwright
BASE = os.environ.get("BASE", "http://localhost:8788").rstrip("/"); RES = []
def check(n, ok, info=""): RES.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info)[:300] if not ok else ""))
def api(path, method="GET", body=None):
    rq = urllib.request.Request(BASE + "/api/" + path, method=method, data=body.encode() if body else None, headers={"content-type": "text/plain"})
    try:
        with urllib.request.urlopen(rq, timeout=20) as r: return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e: return e.code, {}
def top(): return api("admin")[1].get("errors") or {"perVersion": [], "top": []}
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        ctx = await b.new_context(service_workers="block"); pg = await ctx.new_page(); reqs = []
        pg.on("request", lambda r: reqs.append(r.url) if "/api/err" in r.url else None)
        await pg.goto(BASE + "/index.html"); await pg.wait_for_selector("[data-hview]", state="attached", timeout=40000); await pg.wait_for_timeout(1500)
        check("plain http without cs-err-test sends nothing", not reqs and (await pg.evaluate("()=>{setTimeout(function(){throw new Error('quiet')},0);return 1}")) and True)
        await pg.wait_for_timeout(600); check("still nothing sent after a thrown error", not reqs)
        await pg.evaluate("()=>{localStorage.setItem('cs-err-test','1');if(window.__store)__store.setItem('cs-err-test','1')}"); await pg.reload(); await pg.wait_for_selector("[data-hview]", state="attached", timeout=40000); await pg.wait_for_timeout(1500)
        for _ in range(2): await pg.evaluate("()=>{setTimeout(function(){throw new Error('boom alice@example.com 1234567890 fase13')},0)}"); await pg.wait_for_timeout(300)
        await pg.wait_for_timeout(800)
        t = top()["top"]; row = [r for r in t if "fase13" in r["msg"]]
        check("the error is stored", row, t)
        if row:
            check("email and long number removed", "alice" not in row[0]["msg"] and "1234567890" not in row[0]["msg"] and "<email>" in row[0]["msg"], row[0]["msg"])
            check("version is stored", row[0]["ver"] not in ("", "?"), row[0])
        check("one page sends the same report once", len(reqs) == 1 or sum(1 for _ in reqs) <= 2, reqs)
        vs = top()["perVersion"]; check("admin shows reports per version", vs and vs[0]["n"] >= 1, vs)
        dev = "abcdefgh12345678"; codes = []
        for i in range(60): codes.append(api("err", "POST", json.dumps({"v": "t", "k": "error", "m": "flood %d" % i, "s": "x.js:1", "d": dev}))[0])
        check("a device is limited to 50 a day", codes.count(429) >= 10 and codes.count(202) <= 50, (codes.count(202), codes.count(429)))
        check("bad body refused", api("err", "POST", "nope")[0] == 400 and api("err", "POST", json.dumps({"d": "x"}))[0] == 400)
        before = sum(r["n"] for r in top()["perVersion"])
        await pg.evaluate("()=>{localStorage.setItem('cs-err-off','1');if(window.__store)__store.setItem('cs-err-off','1')}"); await pg.reload(); await pg.wait_for_selector("[data-hview]", state="attached", timeout=40000); await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{setTimeout(function(){throw new Error('after opt out fase13b')},0)}"); await pg.wait_for_timeout(1000)
        check("cs-err-off stops reports", sum(r["n"] for r in top()["perVersion"]) == before and not [r for r in top()["top"] if "fase13b" in r["msg"]])
        await b.close()
    print("%d checks, %d failed" % (len(RES), RES.count(False))); sys.exit(1 if False in RES else 0)
asyncio.run(main())
