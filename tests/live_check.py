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
import re
# the version this commit releases, read from the built page in the repo
LABEL = re.search(r'APP_LABEL="([^"]+)"', open(os.path.join(os.path.dirname(HERE), "index.html"), encoding="utf-8").read()).group(1)
HDR = {}
if os.environ.get("CF_ACCESS_CLIENT_ID"):
    HDR = {"CF-Access-Client-Id": os.environ["CF_ACCESS_CLIENT_ID"], "CF-Access-Client-Secret": os.environ.get("CF_ACCESS_CLIENT_SECRET", "")}
RES = []; ERRS = []; BADRESP = []


GH = bool(os.environ.get("GITHUB_ACTIONS"))


def check(name, ok, info=""):
    RES.append({"check": name, "ok": bool(ok), "info": str(info)[:300]}); print(("ok   " if ok else "FAIL ") + name + ("  " + str(info)[:300] if not ok else ""))
    if GH and not ok: print("::error::FAIL %s %s" % (name, str(info)[:300].replace("\n", " ")))
    json.dump(RES, open(os.path.join(OUT, "result.json"), "w"), indent=1)


def get(path):
    rq = urllib.request.Request(BASE + path, headers=dict(HDR, **{"User-Agent": "Mozilla/5.0 (live-check)"}))
    # three tries: a runner sometimes loses a TLS handshake to Cloudflare
    for i in range(3):
        try:
            with urllib.request.urlopen(rq, timeout=30) as r:
                return r.status, dict(r.headers), r.read()
        except urllib.error.HTTPError as e:
            return e.code, dict(e.headers), e.read()
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            if i == 2: raise
            print("retry %s after %s" % (path, e)); time.sleep(5)


def wait_deploy():
    want = os.environ.get("WAIT_CACHE", "")
    if os.environ.get("GITHUB_REF_NAME", "main") != "main":
        want = ""  # run by hand from another branch: test what is live now
    if not want:
        return
    t0 = time.time()
    while time.time() - t0 < 600:
        st, h, body = get("/sw.js?t=%d" % time.time())
        if st == 200 and want.encode() in body:
            print("live deploy has", want, "after %d s" % (time.time() - t0)); return
        time.sleep(15)
    check("live site has this commit (sw.js CACHE %s)" % want, False, "not after 10 minutes")


def access_cookie(h):
    # Access may answer a valid service token with a CF_Authorization cookie. The browser needs it for requests that skip extra headers (the service worker script)
    for k, v in h.items():
        if k.lower() == "set-cookie" and "CF_Authorization=" in v:
            return v.split("CF_Authorization=", 1)[1].split(";", 1)[0]
    return ""


SW_READY = "()=>navigator.serviceWorker?Promise.race([navigator.serviceWorker.ready.then(r=>!!r.active),new Promise(r=>setTimeout(()=>r('timeout'),20000))]):false"


async def main():
    wait_deploy()
    st, h, body = get("/")
    COOKIE = access_cookie(h) if HDR else ""
    if HDR and GH: print("::notice::Access cookie from service token: %s" % ("yes" if COOKIE else "no"))
    INDEX = body
    hl = {k.lower(): v for k, v in h.items()}
    check("home page 200", st == 200, st)
    check("index has version %s and the store" % LABEL, ('APP_LABEL="%s"' % LABEL).encode() in body and b"__store" in body)
    check("no sample character name in index", b"Yudhi" not in body)
    check("index Cache-Control no-cache", "no-cache" in hl.get("cache-control", ""), hl.get("cache-control"))
    st, h, body = get("/sw.js"); hl = {k.lower(): v for k, v in h.items()}
    check("sw.js 200, no-cache, Service-Worker-Allowed /", st == 200 and "no-cache" in hl.get("cache-control", "") and hl.get("service-worker-allowed") == "/", hl)
    st, h, body = get("/manifest.webmanifest"); hl = {k.lower(): v for k, v in h.items()}
    check("manifest type", st == 200 and "manifest+json" in hl.get("content-type", ""), hl.get("content-type"))
    # T8 cloud API: health without login, and the login token check (a service token is a valid Access login that is not a person: 403)
    st, h, body = get("/api/health")
    try: hj = json.loads(body)
    except Exception: hj = {}
    check("API health answers with the database", st == 200 and hj.get("ok") and hj.get("db"), "%s %s" % (st, body[:120]))
    if GH and hj: print("::notice::API health: aud=%s audSet=%s" % (hj.get("aud"), hj.get("audSet")))
    if HDR:
        st, h, body = get("/api/me")
        check("API verifies the Access token (service token gets 403)", st == 403 and b"service-token" in body, "%s %s" % (st, body[:120]))
    for p in ("/tests/fixtures/yudhi-v3.json", "/src/manifest.json", "/reports/t7-laporan.md", "/build.py", "/wrangler.toml", "/functions/api/[[path]].js"):
        st, h, body = get(p)
        # Pages answers an unknown path with index.html (200). The real file must not come back
        check("not published: " + p, st == 404 or body == INDEX, "%s, %d bytes" % (st, len(body)))
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for vp, w, hh in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            ctx = await b.new_context(viewport={"width": w, "height": hh}, extra_http_headers=HDR)
            if HDR:
                # the service worker script is fetched without extra_http_headers. A route adds the token to every request, that one included
                await ctx.route("**/*", lambda r: r.continue_(headers=dict(r.request.headers, **HDR)))
            if COOKIE:
                await ctx.add_cookies([{"name": "CF_Authorization", "value": COOKIE, "url": BASE + "/"}])
            ctx.on("response", lambda r: r.status != 200 and BADRESP.append("%d %s" % (r.status, r.url[:90])))
            ctx.on("requestfailed", lambda r: BADRESP.append("failed %s %s" % (r.url[:90], r.failure)))
            pg = await ctx.new_page(); pg.on("pageerror", lambda e, vp=vp: ERRS.append(vp + ": " + str(e)))
            await pg.goto(BASE + "/"); await pg.wait_for_function("()=>window.__store&&__store.mode()", timeout=30000); await pg.wait_for_timeout(2500)
            txt = await pg.evaluate("()=>document.body.innerText")
            check(vp + " first visit: empty Home, Version " + LABEL, ("Characters: 0" in txt or "No characters yet" in txt) and ("Version " + LABEL) in txt)
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
            sw = await pg.evaluate(SW_READY)
            check(vp + " service worker active", sw is True, sw)
            if sw is not True and GH:
                d = await pg.evaluate("()=>navigator.serviceWorker.getRegistration().then(r=>r?JSON.stringify({i:!!r.installing,w:!!r.waiting,a:!!r.active}):'none').then(x=>navigator.serviceWorker.register('sw.js').then(()=>x+' re-register ok',e=>x+' re-register: '+e.message))")
                print("::notice::%s sw diag: %s | non-200: %s" % (vp, d, "; ".join(BADRESP[-6:])))
            if sw is not True:
                check(vp + " offline reload opens with the character", False, "skipped, no service worker"); await ctx.close(); continue
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

try:
    code = asyncio.run(main())
except Exception as e:
    import traceback; traceback.print_exc()
    if GH: print("::error::live_check stopped: %s: %s" % (type(e).__name__, str(e)[:300].replace("\n", " ")))
    code = 2
if GH: print("::notice::live_check %d checks, %d failed" % (len(RES), len([r for r in RES if not r["ok"]])))
sys.exit(code)
