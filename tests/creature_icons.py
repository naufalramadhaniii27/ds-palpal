#!/usr/bin/env python3
"""Creature type icons. python3 tests/creature_icons.py [--root DIR]
New Wizard (Find Familiar): Extras lists creatures and each row has a type icon. 1250x850. No page error."""
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
async def main():
    srv, base = serve(); fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1250, "height": 850}, service_workers="block")
        pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
        await pg.goto(base); await pg.wait_for_timeout(2000)
        await pg.evaluate("document.querySelector('[data-hnew]').click()"); await pg.wait_for_selector("#qbCls", state="attached"); await pg.wait_for_timeout(500)
        await pg.select_option("#qbCls", "Wizard"); await pg.evaluate("document.querySelector('[data-qb]').click()"); await pg.wait_for_timeout(1800)
        await pg.evaluate("document.getElementById('b-toSheet').click()"); await pg.wait_for_selector("#dmgBtn", state="attached"); await pg.wait_for_timeout(1000)
        await pg.evaluate("document.querySelector(\"#tabs .tab[data-tab='p-ext']\").click()"); await pg.wait_for_timeout(800)
        n, k = await pg.evaluate("[document.querySelectorAll('.crr').length,document.querySelectorAll('.crr .art-ic').length]")
        ok = n > 0 and n == k and not errs
        print("%s  creature rows %d, with icon %d, errors %s" % ("ok  " if ok else "FAIL", n, k, errs)); fails += 0 if ok else 1
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
