#!/usr/bin/env python3
"""Empty-state pictures. python3 tests/vignettes.py [--root DIR]
New install: Home empty roster shows the picture and it loads. Art off falls back to the drawn icon. 390x844 and 1250x850. No page error."""
import asyncio, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
LOAD = "(()=>{var i=document.querySelector('#homeV img.es-img');return i?new Promise(r=>{if(i.complete)r(i.naturalWidth>0);else{i.onload=()=>r(true);i.onerror=()=>r(false)}}):false})()"
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
            pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_timeout(2200)
            chk(t + " empty roster shows the picture and it loads", await pg.evaluate(LOAD))
            await pg.evaluate("localStorage.setItem('mi-clsart','off')"); await pg.reload(); await pg.wait_for_timeout(2000)
            chk(t + " Art off falls back to the drawn icon", await pg.evaluate("!document.querySelector('#homeV img.es-img')&&!!document.querySelector('#homeV svg.es-art')"))
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
