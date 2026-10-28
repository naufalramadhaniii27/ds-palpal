#!/usr/bin/env python3
"""A new blank character carries nothing from the Fighter template (proficiency sources, Second Wind), and the service worker caches the offline picture.
  python3 tests/blank_new.py [OUTDIR]"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, "out", "blank_new"); os.makedirs(OUT, exist_ok=True)
RES = []; ERRS = []
def check(n, ok, info=""): RES.append((n, ok)); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info)[:300] if not ok else ""))
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d/" % p
async def main():
    u = serve()
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for vp, w, h in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await ctx.new_page(); pg.on("pageerror", lambda e: ERRS.append(str(e)))
            await pg.goto(u + "index.html"); await pg.wait_for_function("()=>window.__store&&__store.mode()", timeout=15000); await pg.wait_for_timeout(1500)
            await pg.evaluate("()=>{__store.setItem('cs-new','1');return __store.flush()}")
            await pg.reload(); await pg.wait_for_timeout(4000); await pg.evaluate("()=>__store.flush()")
            o = json.loads(await pg.evaluate("()=>__store.getItem('yudhi-kelapa-build-v3')") or "{}")
            left = [k for k, v in o.items() if "Fighter" in json.dumps(v) or "Second Wind" in json.dumps(v)]
            check(vp + " new character has no Fighter leftovers", not left, left)
            ps = o.get("profSrc") or {}
            check(vp + " new character proficiency sources empty", all(not ps.get(k) for k in ("armor", "weapons", "tools")), ps)
            check(vp + " new character has no actions", not o.get("acts"), o.get("acts"))
            await pg.screenshot(path=os.path.join(OUT, vp + "-new.png"))
            # service worker cache holds the offline picture
            await pg.evaluate("()=>navigator.serviceWorker.ready")
            await pg.wait_for_timeout(1500)
            hit = await pg.evaluate("()=>caches.keys().then(ks=>Promise.all(ks.map(k=>caches.open(k).then(c=>c.match('img/vig/state/offline.avif'))))).then(a=>a.some(Boolean))")
            check(vp + " offline picture is in the service worker cache", hit)
            await ctx.close()
        await b.close()
    check("no page errors", not ERRS, ERRS[:3])
    bad = [r for r in RES if not r[1]]; print("%d checks, %d failed" % (len(RES), len(bad))); return 1 if bad else 0
sys.exit(asyncio.run(main()))
