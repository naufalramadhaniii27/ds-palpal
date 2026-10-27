#!/usr/bin/env python3
"""Commands on Home. python3 tests/home_cmd.py [--root DIR]
Ctrl+K on Home focuses the search. Typing a command word shows a command button. Enter runs the first one. Click runs it too.
Checks at 390x844 and 1250x850: Ctrl+K focus, 'back' lists Back up, Enter opens the backup dialog, 'settings' click opens Settings,
'zzz' shows no command, a character name shows no command, no page error."""
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
            pg = await ctx.new_page(); pg.set_default_timeout(12000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await ctx.add_init_script("if(!sessionStorage.getItem('__seeded')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__seeded','1')}" % json.dumps(YUDHI))
            await pg.goto(base); await pg.wait_for_selector("#homeQ", state="attached"); await pg.wait_for_timeout(1800)
            await pg.keyboard.press("Control+k"); await pg.wait_for_timeout(200)
            chk(t + " Ctrl+K focuses Home search", await pg.evaluate("document.activeElement&&document.activeElement.id==='homeQ'"))
            await pg.fill("#homeQ", "zzz"); await pg.wait_for_timeout(200)
            chk(t + " no match, no command", await pg.evaluate("!document.querySelector('.hcmd')"))
            await pg.fill("#homeQ", "yudhi"); await pg.wait_for_timeout(200)
            chk(t + " character name shows no command", await pg.evaluate("!document.querySelector('.hcmd')&&!!document.querySelector('.hcard')"))
            await pg.fill("#homeQ", "back"); await pg.wait_for_timeout(200)
            chk(t + " 'back' lists Back up", await pg.evaluate("[...document.querySelectorAll('.hcmd')].some(x=>/Back up/i.test(x.textContent))"))
            await pg.press("#homeQ", "Enter"); await pg.wait_for_selector("#bkp"); await pg.wait_for_timeout(300)
            chk(t + " Enter opens the backup dialog", "Back Up" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.fill("#homeQ", "settings"); await pg.wait_for_timeout(200)
            await pg.click(".hcmd"); await pg.wait_for_selector("#bkp"); await pg.wait_for_timeout(300)
            chk(t + " click on Settings command opens Settings", "Settings" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.screenshot(path="/tmp/home_cmd-%s.png" % t)
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
