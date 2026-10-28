#!/usr/bin/env python3
"""Subclass emblems in the Library. python3 tests/sub_art.py [--root DIR]
Fighter class page lists subclasses with an emblem that loads, the subclass page shows a larger one. Art off hides both. 390x844 and 1250x850. No page error."""
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
            chk(t + " helper gives an emblem for Fighter Champion", await pg.evaluate("__artSub('Fighter','Champion').indexOf('img/emblem/sub/fighter-champion.avif')>0"))
            chk(t + " unknown subclass gives nothing", await pg.evaluate("__artSub('Fighter','Nope')===''"))
            ok = await pg.evaluate("fetch('img/emblem/sub/fighter-champion.avif').then(r=>r.ok&&r.headers.get('content-type').indexOf('image')===0)")
            chk(t + " the file loads", ok)
            await pg.click("#homeV .hcard [data-hview]"); await pg.wait_for_selector("#dmgBtn", state="attached"); await pg.wait_for_timeout(800)
            await pg.keyboard.press("Control+k"); await pg.wait_for_selector("#gsQ"); await pg.wait_for_timeout(400)
            await pg.fill("#gsQ", "fighter"); await pg.wait_for_timeout(700)
            await pg.click(".gs-lib"); await pg.wait_for_selector("#libBd .lib-r"); await pg.wait_for_timeout(500)
            await pg.evaluate("[].slice.call(document.querySelectorAll('#libBd [data-lib-open]')).filter(function(x){return x.getAttribute('data-lib-open')==='class|Fighter'})[0].click()"); await pg.wait_for_timeout(900)
            chk(t + " Fighter page lists subclasses with an emblem", await pg.evaluate("document.querySelectorAll('#libBd .lib-fl .art-sub').length>=3"))
            await pg.evaluate("document.querySelector('#libBd [data-lib-open=\"sub|Champion\"]').click()"); await pg.wait_for_timeout(900)
            chk(t + " Champion page shows the large emblem", await pg.evaluate("!!document.querySelector('#libBd .sub-em .art-sub')"))
            await pg.evaluate("localStorage.setItem('mi-clsart','off')")
            chk(t + " Art off gives nothing", await pg.evaluate("__artSub('Fighter','Champion')===''"))
            chk(t + " no page errors", not errs)
            await ctx.close()
        ctx2 = await b.new_context(viewport={"width": 1250, "height": 850}, service_workers="block")
        y2 = json.loads(YUDHI); y2["sub"] = "Champion"
        await ctx2.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(json.dumps(y2)))
        p2 = await ctx2.new_page(); await p2.goto(base); await p2.wait_for_timeout(2000)
        await p2.click("#homeV .hcard [data-hview]"); await p2.wait_for_selector("#idF", state="attached"); await p2.wait_for_timeout(1200)
        chk("sheet hero shows the Champion emblem", await p2.evaluate("!!document.querySelector('#idF .art-sub[src*=\"fighter-champion\"]')"))
        await ctx2.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
