#!/usr/bin/env python3
"""Scene behind Builder steps. python3 tests/builder_art.py [--root DIR]
Class step shows a scene, Abilities a different one, Species follows the species pick, Art off removes it. 390x844 and 1250x850. No page error."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
CUR = "(()=>{var e=document.querySelector('#bld .bld-art.on');return e?e.style.getPropertyValue(innerWidth>=760?'--ca-pc':'--ca-ph'):''})()"
async def main():
    srv, base = serve(); fails = 0
    def chk(n, ok):
        nonlocal fails
        print("%s  %s" % ("ok  " if ok else "FAIL", n)); fails += 0 if ok else 1
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in ((390, 844), (1250, 850)):
            t = "%dx%d" % (W, H)
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_timeout(2000)
            await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(1200)
            s1 = await pg.evaluate(CUR)
            chk(t + " a step scene is on (" + s1[-30:] + ")", bool(s1) and "undefined" not in s1 and "img/" in s1)
            chk(t + " it does not take taps", await pg.evaluate("getComputedStyle(document.querySelector('#bld .bld-art')).pointerEvents==='none'"))
            await pg.evaluate("document.querySelector('#steps [data-step=abil]').click()"); await pg.wait_for_timeout(1200)
            s2 = await pg.evaluate(CUR)
            chk(t + " Abilities has its own scene", "undefined" not in s2 and bool(s2) and s2 != s1 and "/builder/" in s2)
            chk(t + " only one layer shows", await pg.evaluate("document.querySelectorAll('#bld .bld-art.on').length===1"))
            await pg.evaluate("document.querySelector('#steps [data-step=species]').click()"); await pg.wait_for_timeout(1200)
            s3 = await pg.evaluate(CUR)
            chk(t + " Species has a scene", "undefined" not in s3 and bool(s3) and s3 != s2)
            await pg.evaluate("localStorage.setItem('mi-clsart','off')"); await pg.evaluate("document.querySelector('#steps [data-step=equip]').click()"); await pg.wait_for_timeout(900)
            chk(t + " Art off removes it", (await pg.evaluate(CUR)) == "")
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
