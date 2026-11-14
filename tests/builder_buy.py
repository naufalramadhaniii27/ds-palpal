#!/usr/bin/env python3
"""Buy in the builder. python3 tests/builder_buy.py [--root DIR]
Yudhi in the builder, Equipment step. Wallet set to 2 gp 5 cp. Buy Pouch (5 sp): gp broken, 5 sp change, Pouch in the builder inventory.
Buy Backpack (2 gp) with 1 gp 5 sp 5 cp: refused, wallet unchanged. Add (free) leaves the wallet alone. 390x844 and 1250x850. No page error."""
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
W_ = "(()=>{var c=window.__coinsGet();return [c.pp,c.gp,c.ep,c.sp,c.cp]})()"
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
            pg = await ctx.new_page(); pg.set_default_timeout(20000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_selector("[data-hview]", state="attached"); await pg.wait_for_timeout(1500)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn"); await pg.wait_for_timeout(1000)
            await pg.evaluate("window.__coinsPut({gp:2,cp:5},'test')")
            await pg.evaluate("document.getElementById('bldBtn').click()"); await pg.wait_for_selector("#bld:not([hidden])"); await pg.wait_for_timeout(2500)
            await pg.evaluate("document.querySelector(\"#bld [data-step='equip']\").click()"); await pg.wait_for_selector("[data-tog2=add]"); await pg.evaluate("document.querySelector('#bld [data-tog2=add]').click()"); await pg.wait_for_selector("#invq"); await pg.wait_for_timeout(600)
            await pg.fill("#invq", "Pouch"); await pg.wait_for_timeout(700)
            await pg.evaluate("document.querySelector('#bld [data-tog=\"addPouch\"].itn').click()"); await pg.wait_for_timeout(500)
            txt = await pg.evaluate("(document.querySelector('#bld [data-ibuy=\"Pouch\"]')||{}).textContent||''")
            chk(t + " Buy button shows the price: " + txt, "5 sp" in txt)
            await pg.evaluate("document.querySelector('#bld [data-ibuy=\"Pouch\"]').click()"); await pg.wait_for_timeout(900)
            w = await pg.evaluate(W_); chk(t + " Pouch bought: gp broken, 5 sp change " + json.dumps(w), w == [0, 1, 0, 5, 5])
            inv = await pg.evaluate("(document.getElementById('bld').innerText.match(/Pouch/g)||[]).length")
            chk(t + " Pouch is in the builder inventory", inv >= 1)
            await pg.fill("#invq", "Backpack"); await pg.wait_for_timeout(700)
            await pg.evaluate("document.querySelector('#bld [data-tog=\"addBackpack\"].itn').click()"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.querySelector('#bld [data-ibuy=\"Backpack\"]').click()"); await pg.wait_for_timeout(700)
            w2 = await pg.evaluate(W_); chk(t + " not enough coin: refused, wallet unchanged " + json.dumps(w2), w2 == w)
            await pg.evaluate("document.querySelector('#bld [data-iadd=\"Backpack\"][data-qty]:not(.bdg.add:first-child)')||document.querySelector('#bld [data-iadd=\"Backpack\"]')"); 
            await pg.evaluate("[...document.querySelectorAll('#bld [data-iadd=\"Backpack\"]')].pop().click()"); await pg.wait_for_timeout(700)
            w3 = await pg.evaluate(W_); chk(t + " Add (free) leaves the wallet alone " + json.dumps(w3), w3 == w)
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
