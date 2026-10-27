#!/usr/bin/env python3
"""Offline note on Home. python3 tests/offline_note.py [--root DIR]
Go offline: Home shows the note and html gets class is-off. Go online: note is gone. 390x844 and 1250x850. No page error."""
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
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            pg = await ctx.new_page(); pg.set_default_timeout(15000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_selector("#hxHero", state="attached"); await pg.wait_for_timeout(1500)
            chk(t + " online: no note", await pg.evaluate("!document.getElementById('offNote')"))
            await ctx.set_offline(True); await pg.wait_for_timeout(800)
            chk(t + " offline: note on Home", await pg.evaluate("!!document.getElementById('offNote')&&document.documentElement.classList.contains('is-off')"))
            await pg.screenshot(path="/tmp/off-%s.png" % t)
            await ctx.set_offline(False); await pg.wait_for_timeout(800)
            chk(t + " online again: note gone", await pg.evaluate("!document.getElementById('offNote')"))
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
