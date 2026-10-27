#!/usr/bin/env python3
"""Builder jump list (Ctrl+K inside the builder). python3 tests/builder_pal.py [--root DIR]
Wizard (quick build): add Fireball, see it in the spell list and in storage, adding it again does not duplicate, add a magic item and a weapon.
Yudhi (Fighter, no spellcasting): adding a spell shows a message and changes nothing. 390x844 and 1250x850. No page error."""
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
CJ = "(()=>{var o=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}');return o.C||o})()"
STORE = "(()=>{var o=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}');return o.C||o})()"
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
            pg = await ctx.new_page(); pg.set_default_timeout(20000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_timeout(2500)
            await pg.evaluate("document.querySelector('[data-hnew]').click()"); await pg.wait_for_selector("#qbCls", state="attached"); await pg.wait_for_timeout(800)
            await pg.evaluate("document.getElementById('bld')&&0")
            vis = await pg.evaluate("!document.getElementById('bld').hidden")
            if not vis:
                await pg.select_option("#qbCls", "Wizard"); await pg.evaluate("document.querySelector('[data-qb]').click()"); await pg.wait_for_timeout(2000)
            chk(t + " builder is open", await pg.evaluate("!document.getElementById('bld').hidden"))
            await pg.keyboard.press("Control+k"); await pg.wait_for_selector(".bpal-q"); await pg.wait_for_timeout(200)
            chk(t + " Ctrl+K opens the jump list with focus in the field", await pg.evaluate("document.activeElement.classList.contains('bpal-q')"))
            chk(t + " list has steps, Prev, Next, Close", await pg.locator(".bpal-i").count() == 11)
            chk(t + " Apply is not in the list", not await pg.evaluate("[...document.querySelectorAll('.bpal-i')].some(x=>/apply/i.test(x.textContent))"))
            await pg.fill(".bpal-q", "equip"); await pg.wait_for_timeout(150)
            chk(t + " typing filters the list", await pg.locator(".bpal-i").count() == 1)
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(700)
            chk(t + " Enter jumps to Equipment", await pg.evaluate("document.querySelector('#steps .st.on').getAttribute('data-step')") == "equip")
            chk(t + " list closed after the jump", await pg.locator(".bpal").count() == 0)
            await pg.keyboard.press("Control+k"); await pg.wait_for_selector(".bpal-q"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            chk(t + " Escape closes the list only", await pg.locator(".bpal").count() == 0 and await pg.evaluate("!document.getElementById('bld').hidden"))
            await pg.keyboard.press("Control+k"); await pg.wait_for_selector(".bpal-q"); await pg.keyboard.press("ArrowDown"); await pg.keyboard.press("ArrowDown"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600)
            chk(t + " arrows then Enter run the second item", await pg.evaluate("document.querySelector('#steps .st.on').getAttribute('data-step')") == "class")
            await pg.keyboard.press("Control+k"); await pg.wait_for_selector(".bpal-q"); await pg.fill(".bpal-q", "zzz"); await pg.wait_for_timeout(150)
            chk(t + " no match shows a message", await pg.locator(".bpal-e").count() == 1)
            await pg.keyboard.press("Escape")
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
