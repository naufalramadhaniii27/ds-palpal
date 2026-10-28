#!/usr/bin/env python3
"""Checks on the live site (Cloudflare Pages). Run by .github/workflows/live-check.yml after each push to main.

  BASE=https://dnd-sheets-palpale.pages.dev python3 tests/live_check.py [OUTDIR]

Optional env CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET: a Cloudflare Access service token, sent on every request once Access guards the site.
Optional env WAIT_CACHE: the CACHE name from sw.js of this commit. The script waits (up to 10 minutes) until the live sw.js has it, so it tests the new deploy.
Exit code 0 only when every check passes."""
import asyncio, json, os, sys, time, urllib.request
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "https://dnd-sheets-palpale.pages.dev").rstrip("/")
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else "live-out"
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
HDR = {}
if os.environ.get("CF_ACCESS_CLIENT_ID"):
    HDR = {"CF-Access-Client-Id": os.environ["CF_ACCESS_CLIENT_ID"], "CF-Access-Client-Secret": os.environ.get("CF_ACCESS_CLIENT_SECRET", "")}
RES = []; ERRS = []


def check(name, ok, info=""):
    RES.append({"check": name, "ok": bool(ok), "info": str(info)[:300]}); print(("ok   " if ok else "FAIL ") + name + ("  " + str(info)[:300] if not ok else ""))


def get(path):
    rq = urllib.request.Request(BASE + path, headers=dict(HDR, **{"User-Agent": "live-check"}))
    try:
        with urllib.request.urlopen(rq, timeout=30) as r:
            return r.status, dict(r.headers), r.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()


def wait_deploy():
    want = os.environ.get("WAIT_CACHE", "")
    if not want:
        return
    t0 = time.time()
    while time.time() - t0 < 600:
        st, h, body = get("/sw.js?t=%d" % time.time())
        if st == 200 and want.encode() in body:
            print("live deploy has", want, "after %d s" % (time.time() - t0)); return
        time.sleep(15)
    check("live site has this commit (sw.js CACHE %s)" % want, False, "not after 10 minutes")


async def main():
    wait_deploy()
    st, h, body = get("/")
    hl = {k.lower(): v for k, v in h.items()}
    check("home page 200", st == 200, st)
    check("index has version 0.0.1 and the store", b'APP_LABEL="0.0.1"' in body and b"__store" in body)
    check("no sample character names in index", not any(x in body for x in (b"Yudhi", b"Pencak Silat")))
    check("index Cache-Control no-cache", "no-cache" in hl.get("cache-control", ""), hl.get("cache-control"))
    st, h, body = get("/sw.js"); hl = {k.lower(): v for k, v in h.items()}
    check("sw.js 200, no-cache, Service-Worker-Allowed /", st == 200 and "no-cache" in hl.get("cache-control", "") and hl.get("service-worker-allowed") == "/", hl)
    st, h, body = get("/manifest.webmanifest"); hl = {k.lower(): v for k, v in h.items()}
    check("manifest type", st == 200 and "manifest+json" in hl.get("content-type", ""), hl.get("content-type"))
    for p in ("/tests/fixtures/yudhi-v3.json", "/src/manifest.json", "/reports/t7-laporan.md", "/build.py"):
        st, h, body = get(p)
        check("not published: " + p, st == 404 or (b"Yudhi" not in body and b'"entries"' not in body and b"T7 Storage" not in body), st)
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for vp, w, hh in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            ctx = await b.new_context(viewport={"width": w, "height": hh}, extra_http_headers=HDR)
            pg = await ctx.new_page(); pg.on("pageerror", lambda e, vp=vp: ERRS.append(vp + ": " + str(e)))
            await pg.goto(BASE + "/"); await pg.wait_for_function("()=>window.__store&&__store.mode()", timeout=30000); await pg.wait_for_timeout(2500)
            txt = await pg.evaluate("()=>document.body.innerText")
            check(vp + " first visit: empty Home, Version 0.0.1", ("Characters: 0" in txt or "No characters yet" in txt) and "Version 0.0.1" in txt)
            check(vp + " store on IndexedDB", await pg.evaluate("()=>__store.mode()") == "idb")
            await pg.screenshot(path=os.path.join(OUT, vp + "-home.png"))
            # old data in localStorage moves over
            await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", YUDHI)
            await pg.reload(); await pg.wait_for_function("()=>window.__store&&__store.mode()", timeout=30000); await pg.wait_for_timeout(2500)
            txt = await pg.evaluate("()=>document.body.innerText")
            check(vp + " old localStorage data shows after reload", "Yudhi Kelapa" in txt)
            await pg.evaluate("()=>{var x=document.querySelector('[data-hview]'); if(x) x.click()}"); await pg.wait_for_timeout(2000)
            await pg.screenshot(path=os.path.join(OUT, vp + "-sheet.png"))
            # service worker and offline
            sw = await pg.evaluate("()=>navigator.serviceWorker?navigator.serviceWorker.ready.then(r=>!!r.active):false")
            check(vp + " service worker active", sw)
            await pg.wait_for_timeout(1500); await ctx.set_offline(True)
            try:
                await pg.reload(); await pg.wait_for_function("()=>window.__store&&__store.mode()", timeout=30000); await pg.wait_for_timeout(2000)
                txt = await pg.evaluate("()=>document.body.innerText")
                check(vp + " offline reload opens with the character", "Yudhi Kelapa" in txt)
                await pg.screenshot(path=os.path.join(OUT, vp + "-offline.png"))
            except Exception as e:
                check(vp + " offline reload opens with the character", False, e)
            await ctx.set_offline(False); await ctx.close()
        await b.close()
    check("no page errors", not ERRS, ERRS[:3])
    json.dump(RES, open(os.path.join(OUT, "result.json"), "w"), indent=1)
    bad = [r for r in RES if not r["ok"]]; print("%d checks, %d failed" % (len(RES), len(bad)))
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
