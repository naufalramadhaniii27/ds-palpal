#!/usr/bin/env python3
"""Install hints. python3 tests/pwa_note.py [--root DIR]
Settings says how to install. With a fake beforeinstallprompt event, the Home search offers 'Install the app' and clicking it calls prompt().
390x844 and 1250x850. No page error."""
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
            await pg.click("[data-hbk='info']"); await pg.wait_for_selector("#bkp"); await pg.wait_for_timeout(400)
            chk(t + " Settings explains how to install", "Install:" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.evaluate("""()=>{window.__pc=0;var e=new Event('beforeinstallprompt');e.prompt=function(){window.__pc++};e.userChoice=Promise.resolve({outcome:'dismissed'});window.dispatchEvent(e)}""")
            await pg.wait_for_timeout(300)
            await pg.fill("#homeQ", "install"); await pg.wait_for_timeout(300)
            chk(t + " Home search offers the Install command", await pg.evaluate("[...document.querySelectorAll('.hcmd')].some(x=>/Install the app/.test(x.textContent))"))
            await pg.click(".hcmd:not([data-hlib])"); await pg.wait_for_timeout(500)
            chk(t + " Install command calls prompt()", await pg.evaluate("window.__pc===1"))
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
