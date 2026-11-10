#!/usr/bin/env python3
"""Version label: Home shows the current label, an update from build 102 lists labelled versions only (0.0.11 down to 0.0.1), a first visit shows no banner.
  python3 tests/version_label.py [OUTDIR]"""
import asyncio, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, "out", "version_label"); os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
RES = []; ERRS = []
def check(n, ok, info=""): RES.append((n, ok)); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info) if not ok else ""))
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d/index.html" % p
async def main():
    u = serve()
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for vp, w, h in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            # update from build 102 with a character
            ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await ctx.new_page(); pg.on("pageerror", lambda e: ERRS.append(str(e)))
            await pg.goto(u); await pg.wait_for_timeout(800)
            await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);localStorage.setItem('cs-roster-v1',JSON.stringify({active:'c1',chars:{c1:{name:'Yudhi Kelapa',created:1}}}));localStorage.setItem('cs-ui-ver','102')}", YUDHI)
            await pg.reload(); await pg.wait_for_timeout(3000)
            txt = await pg.evaluate("()=>document.body.innerText")
            check(vp + " Home shows Version 0.0.18", "Version 0.0.18 (2026-11-11)" in txt)
            ban = await pg.evaluate("()=>{var b=document.getElementById('hwnB');return b?b.innerText:''}")
            check(vp + " update banner says 0.0.10 and lists no old builds", "0.0.18" in ban and "Version 102" not in ban and "Version 101" not in ban, ban[:200])
            await pg.screenshot(path=os.path.join(OUT, vp + "-update.png"))
            await pg.evaluate("()=>{var b=document.querySelector('[data-hwn=all]'); if(b) b.click()}"); await pg.wait_for_timeout(600)
            dlg = await pg.evaluate("()=>{var d=document.getElementById('bkp');return d?d.innerText:''}")
            check(vp + " What's New lists labelled versions only", "Version 0.0.11" in dlg and "Version 0.0.10" in dlg and "Version 0.0.9" in dlg and "Version 0.0.8" in dlg and "Version 0.0.7" in dlg and "Version 0.0.6" in dlg and "Version 0.0.5" in dlg and "Version 0.0.4" in dlg and "Version 0.0.3" in dlg and "Version 0.0.2" in dlg and "Version 0.0.1" in dlg and "Version 102" not in dlg, dlg[:200])
            await ctx.close()
            # first visit
            ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await ctx.new_page(); pg.on("pageerror", lambda e: ERRS.append(str(e)))
            await pg.goto(u); await pg.wait_for_timeout(3000)
            check(vp + " first visit: no What's new banner", not await pg.evaluate("()=>!!document.getElementById('hwnB')"))
            await ctx.close()
        await b.close()
    check("no page errors", not ERRS, ERRS[:3])
    bad = [r for r in RES if not r[1]]; print("%d checks, %d failed" % (len(RES), len(bad))); return 1 if bad else 0
sys.exit(asyncio.run(main()))
