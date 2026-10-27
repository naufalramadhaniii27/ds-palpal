#!/usr/bin/env python3
"""Add to my sheet from the library. python3 tests/lib_add.py [--root DIR]
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
async def open_entry(pg, q, cat_key):
    await pg.keyboard.press("Control+k"); await pg.wait_for_selector("#gsQ"); await pg.wait_for_timeout(500)
    await pg.fill("#gsQ", q); await pg.wait_for_timeout(700)
    await pg.click(".gs-lib"); await pg.wait_for_selector("#libBd .lib-r"); await pg.wait_for_timeout(700)
    await pg.click('#libBd [data-lib-open="%s"]' % cat_key); await pg.wait_for_selector("[data-libadd]"); await pg.wait_for_timeout(300)
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
            await pg.select_option("#qbCls", "Wizard"); await pg.evaluate("document.querySelector('[data-qb]').click()"); await pg.wait_for_timeout(2000)
            await pg.evaluate("document.getElementById('b-toSheet').click()"); await pg.wait_for_selector("#dmgBtn", state="attached"); await pg.wait_for_timeout(1500)
            await open_entry(pg, "fireball", "spell|Fireball")
            await pg.click("[data-libadd]"); await pg.wait_for_timeout(1200)
            has = await pg.evaluate("(%s.spells||[]).filter(x=>x.n==='Fireball').length" % CJ)
            chk(t + " Fireball added once to C.spells", has == 1)
            await pg.click("[data-libadd]"); await pg.wait_for_timeout(600)
            chk(t + " adding again does not duplicate", await pg.evaluate("(%s.spells||[]).filter(x=>x.n==='Fireball').length" % CJ) == 1)
            await pg.wait_for_timeout(600)
            saved = await pg.evaluate("Object.keys(localStorage).some(k=>{var v=localStorage.getItem(k);return v&&v.indexOf('Fireball')>=0&&v.indexOf('\"lib\":1')>=0})")
            chk(t + " saved with lib:1", saved)
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            await pg.click("[data-go='3']" if W < 700 else "[data-tab='p-spells']"); await pg.wait_for_timeout(700)
            chk(t + " Fireball shows in the spell list", await pg.evaluate("[...document.querySelectorAll('.sp-r .sp-n b')].some(x=>/Fireball/.test(x.textContent))"))
            await open_entry(pg, "bag of holding", "item|Bag of Holding")
            await pg.click("[data-libadd]"); await pg.wait_for_timeout(700)
            chk(t + " magic item lands in C.inv", await pg.evaluate("(%s.inv||[]).some(x=>x.n==='Bag of Holding'&&x.lib===1)" % CJ))
            await open_entry(pg, "longsword", "gear|Longsword")
            await pg.click("[data-libadd]"); await pg.wait_for_timeout(700)
            chk(t + " weapon lands in C.inv", await pg.evaluate("(%s.inv||[]).some(x=>x.n==='Longsword')" % CJ))
            chk(t + " no page errors (wizard)", not errs)
            await ctx.close()
            # Fighter without spellcasting
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            pg = await ctx.new_page(); pg.set_default_timeout(20000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_selector("[data-hview]", state="attached"); await pg.wait_for_timeout(1500)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn"); await pg.wait_for_timeout(1200)
            before = await pg.evaluate("(%s.spells||[]).length" % CJ)
            await open_entry(pg, "fireball", "spell|Fireball")
            await pg.click("[data-libadd]"); await pg.wait_for_timeout(600)
            chk(t + " Fighter: spell is refused, nothing added", await pg.evaluate("(%s.spells||[]).length" % CJ) == before and await pg.evaluate("/no spellcasting/i.test(document.getElementById('toast')?document.getElementById('toast').textContent:'')"))
            chk(t + " no page errors (fighter)", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
