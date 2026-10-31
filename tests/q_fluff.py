#!/usr/bin/env python3
"""Stage S: lore shows in the Library detail of species, backgrounds, classes and subclasses.
  python3 tests/q_fluff.py"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    so = socket.socket(); so.bind(("127.0.0.1", 0)); port = so.getsockname()[1]; so.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
async def main():
    srv, url = serve(); errs = []
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            tag = "%dx%d" % vp
            ctx = await br.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(FIX))
            await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
            await pg.wait_for_function("()=>!!window.FLUFF&&!!window.__libAudit", timeout=90000)
            n = await pg.evaluate("()=>Object.keys(window.FLUFF).map(function(k){return k+':'+Object.keys(window.FLUFF[k]).length}).join(' ')")
            check("%s lore loaded %s" % (tag, n), "species:" in n and "bg:" in n and "class:" in n and "sub:" in n)
            a = await pg.evaluate("()=>window.__libAudit()")
            check("%s Library audit, bad %d of %d" % (tag, a["nbad"], a["n"]), a["nbad"] == 0, str(a["bad"][:3]))
            check(tag + " no page errors", not errs, str(errs[:2]))
            await ctx.close()
        await br.close()
    srv.shutdown(); print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(1 if False in res else 0)
asyncio.run(main())
