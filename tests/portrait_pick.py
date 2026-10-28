#!/usr/bin/env python3
"""Portrait picker. python3 tests/portrait_pick.py [--root DIR]
Tap the portrait: a sheet lists 20 art portraits. Pick one: portrait is set (data URL in the saved state), sheet closes. Remove clears it. 390x844 and 1250x850. No page error."""
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
async def main():
    srv, base = serve(); fails = 0
    def chk(n, ok):
        nonlocal fails
        print("%s  %s" % ("ok  " if ok else "FAIL", n)); fails += 0 if ok else 1
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in ((390, 844), (1250, 850)):
            t = "%dx%d" % (W, H)
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block")
            await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_timeout(2000)
            await pg.click("#homeV .hcard [data-hview]"); await pg.wait_for_selector("#photo", state="attached"); await pg.wait_for_timeout(1000)
            await pg.evaluate("document.getElementById('photo').click()"); await pg.wait_for_selector("#sheetBody .pp-i", state="attached"); await pg.wait_for_timeout(500)
            n = await pg.evaluate("document.querySelectorAll('#sheetBody .pp-i').length")
            chk(t + " sheet lists 20 art portraits (%d)" % n, n == 20)
            chk(t + " no sheet overflow sideways", await pg.evaluate("var b=document.getElementById('sheetBody');b.scrollWidth<=b.clientWidth+1"))
            await pg.evaluate("document.querySelector('#sheetBody .pp-i').click()"); await pg.wait_for_timeout(1200)
            chk(t + " portrait is set", await pg.evaluate("document.getElementById('photo').classList.contains('has')&&document.getElementById('photo').style.backgroundImage.indexOf('data:image/jpeg')>0"))
            chk(t + " sheet closed", await pg.evaluate("!document.getElementById('sheet').classList.contains('on')"))
            await pg.evaluate("document.documentElement.setAttribute('data-frame','wood')"); await pg.wait_for_timeout(300)
            chk(t + " wood frame draws over a set portrait", await pg.evaluate("getComputedStyle(document.getElementById('photo'),'::before').backgroundImage.indexOf('frame-portrait')>0"))
            await pg.evaluate("document.documentElement.removeAttribute('data-frame')")
            await pg.evaluate("document.getElementById('photo').click()"); await pg.wait_for_selector("#sheetBody [data-pp-rm]", state="attached")
            await pg.evaluate("document.querySelector('#sheetBody [data-pp-rm]').click()"); await pg.wait_for_timeout(800)
            chk(t + " Remove clears it", await pg.evaluate("!document.getElementById('photo').classList.contains('has')"))
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
