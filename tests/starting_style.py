#!/usr/bin/env python3
"""@starting-style entrances. python3 tests/starting_style.py [--root DIR]
The Builder jump list and the offline note start transparent and settle to full. With motion off they are full at once. 390x844 and 1250x850. No page error."""
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
PROBE = "new Promise(r=>{var e=document.querySelector('.bpal-b');if(!e)return r([-1,-1]);var o0=+getComputedStyle(e).opacity;setTimeout(()=>r([o0,+getComputedStyle(document.querySelector('.bpal-b')).opacity]),700)})"
async def main():
    srv, base = serve(); fails = 0
    def chk(n, ok):
        nonlocal fails
        print("%s  %s" % ("ok  " if ok else "FAIL", n)); fails += 0 if ok else 1
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in ((390, 844), (1250, 850)):
            for off in (False, True):
                t = "%dx%d %s" % (W, H, "motion off" if off else "motion on")
                ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", reduced_motion="reduce" if off else "no-preference")
                await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
                pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
                await pg.goto(base); await pg.wait_for_timeout(2000)
                await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
                await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(1000)
                await pg.keyboard.press("Control+k"); await pg.wait_for_selector(".bpal-b", state="attached")
                o0, o1 = await pg.evaluate(PROBE)
                if off: chk(t + " jump list is full at once (%.2f)" % o0, o0 == 1 and o1 == 1)
                else: chk(t + " jump list fades in (%.2f to %.2f)" % (o0, o1), o0 < 0.9 and o1 == 1)
                chk(t + " no page errors", not errs)
                await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
