#!/usr/bin/env python3
"""Session summary on the Home hero. python3 tests/home_sum.py [--root DIR]
Yudhi: take 7 damage, go Home, the hero shows 'HP x / y' with the new value. Heal back, Home shows full HP. 390x844 and 1250x850."""
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
            await pg.goto(base); await pg.wait_for_selector("[data-hview]", state="attached"); await pg.wait_for_timeout(1500)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn"); await pg.wait_for_timeout(1200)
            hp = lambda: pg.evaluate("(()=>{var l=document.querySelector('#hxHero .hhsum li');var m=l&&/HP (\\d+) \\/ (\\d+)/.exec(l.textContent);return m?[+m[1],+m[2]]:null})()")
            await pg.fill("#hpAmt", "7"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.getElementById('rosterBtn').click()"); await pg.wait_for_selector("#hxHero"); await pg.wait_for_timeout(1500)
            v = await hp()
            chk(t + " hero shows reduced HP " + json.dumps(v), bool(v) and v[0] == v[1] - 7)
            await pg.screenshot(path="/tmp/sum-%s.png" % t)
            await pg.click(".hhgo"); await pg.wait_for_selector("#dmgBtn"); await pg.wait_for_timeout(1500)
            await pg.fill("#hpAmt", "7"); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.getElementById('rosterBtn').click()"); await pg.wait_for_selector("#hxHero"); await pg.wait_for_timeout(1500)
            v = await hp()
            chk(t + " hero shows full HP after heal " + json.dumps(v), bool(v) and v[0] == v[1])
            await pg.reload(); await pg.wait_for_selector("#hxHero", state="attached"); await pg.wait_for_timeout(2000)
            chk(t + " after reload, Home still shows the summary " + json.dumps(await hp()), bool(await hp()))
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
