#!/usr/bin/env python3
"""One AudioContext. python3 tests/audio_ctx.py [--root DIR]
Counts AudioContext constructions while a damage sound plays and the tavern music starts (1250x850). Must be exactly 1. No page error."""
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
COUNT = "window.__acN=0;(function(){var O=window.AudioContext;if(!O)return;window.AudioContext=function(){window.__acN++;return new O()};window.AudioContext.prototype=O.prototype})()"
async def main():
    srv, base = serve(); fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 1250, "height": 850}, service_workers="block")
        await ctx.add_init_script(COUNT)
        await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);localStorage.setItem('mi-music','tavern');localStorage.setItem('mi-snd','on');sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
        pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
        await pg.goto(base); await pg.wait_for_timeout(2500)
        await pg.wait_for_selector("[data-hview]", state="attached"); await pg.click("#homeV .hcard [data-hview]"); await pg.wait_for_selector("#dmgBtn", state="attached"); await pg.wait_for_timeout(1200)
        await pg.fill("#hpAmt", "3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(1500)
        await pg.fill("#hpAmt", "2"); await pg.click("#healBtn"); await pg.wait_for_timeout(1500)
        n = await pg.evaluate("window.__acN")
        ok = n == 1
        print("%s  AudioContext constructed %d time(s) after damage, heal and music" % ("ok  " if ok else "FAIL", n)); fails += 0 if ok else 1
        print("%s  no page errors %s" % ("ok  " if not errs else "FAIL", errs)); fails += 1 if errs else 0
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
