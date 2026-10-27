#!/usr/bin/env python3
"""Convert coin and Buy. python3 tests/coin_buy.py [--root DIR]
Yudhi. Zero the coins, add 2 gp and 5 cp. Convert 1 gp to sp (10 sp). Buy Pouch (5 sp) with no sp: a gp is broken, 5 sp change. Buy Backpack (2 gp) with too little: refused, coins unchanged.
Buy 2 Pouch with enough: coins drop, inventory holds the quantity. Add (free) leaves the coins alone. 390x844 and 1250x850. No page error."""
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
COINS = "()=>{var o={};['pp','gp','ep','sp','cp'].forEach(k=>o[k]=+document.getElementById('cv-'+k).textContent.replace(/,/g,''));return o}"
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
            await pg.click("[data-go='4']" if W < 700 else "[data-tab='p-inv']"); await pg.wait_for_timeout(600)
            async def coins():
                await pg.click("[data-coinopen]"); await pg.wait_for_selector("#coinDlg"); await pg.wait_for_timeout(400)
                return await pg.evaluate(COINS)
            async def setamt(d):
                for k, v in d.items(): await pg.fill("[data-camt='%s']" % k, str(v))
            c0 = await coins()
            if any(c0.values()):
                await setamt(c0); await pg.click("[data-coin='rem']"); await pg.wait_for_timeout(400)
            await setamt({"gp": 2, "cp": 5}); await pg.click("[data-coin='add']"); await pg.wait_for_timeout(400)
            c = await pg.evaluate(COINS); chk(t + " start coins 2 gp 5 cp " + json.dumps(c), c["gp"] == 2 and c["cp"] == 5 and c["sp"] == 0)
            await pg.select_option("[data-cvf]", "gp"); await pg.select_option("[data-cvt]", "sp"); await pg.fill("[data-cvamt]", "1"); await pg.wait_for_timeout(300)
            chk(t + " preview text " + (await pg.inner_text("#cvPrev")), "1 gp becomes 10 sp" in await pg.inner_text("#cvPrev"))
            await pg.click("[data-coin='conv']"); await pg.wait_for_timeout(500)
            c = await pg.evaluate(COINS); chk(t + " convert 1 gp to 10 sp " + json.dumps(c), c["gp"] == 1 and c["sp"] == 10 and c["cp"] == 5)
            await pg.select_option("[data-cvf]", "cp"); await pg.select_option("[data-cvt]", "gp"); await pg.fill("[data-cvamt]", "5"); await pg.click("[data-coin='conv']"); await pg.wait_for_timeout(400)
            c2 = await pg.evaluate(COINS); chk(t + " too small to convert changes nothing", c2 == c)
            # put it back to 2 gp, 5 cp, no sp: convert 10 sp to gp
            await pg.select_option("[data-cvf]", "sp"); await pg.select_option("[data-cvt]", "gp"); await pg.fill("[data-cvamt]", "10"); await pg.click("[data-coin='conv']"); await pg.wait_for_timeout(400)
            c = await pg.evaluate(COINS); chk(t + " 10 sp back to gp " + json.dumps(c), c["gp"] == 2 and c["sp"] == 0 and c["cp"] == 5)
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            async def open_lib(q, key):
                await pg.keyboard.press("Control+k"); await pg.wait_for_selector("#gsQ"); await pg.wait_for_timeout(400)
                await pg.fill("#gsQ", q); await pg.wait_for_timeout(600); await pg.click(".gs-lib"); await pg.wait_for_selector("#libBd .lib-r"); await pg.wait_for_timeout(500)
                await pg.click('#libBd [data-lib-open="%s"]' % key); await pg.wait_for_selector("[data-libadd]"); await pg.wait_for_timeout(300)
            await open_lib("pouch", "gear|Pouch")
            chk(t + " Buy button shows the price", "Buy for 5 sp" in await pg.evaluate("document.querySelector('[data-libbuy]').textContent"))
            await pg.click("#libBd [data-libbuy]"); await pg.wait_for_timeout(900)
            await pg.keyboard.press("Escape"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
            c = await coins(); chk(t + " Pouch bought: gp broken, change in sp " + json.dumps(c), c["gp"] == 1 and c["sp"] == 5 and c["cp"] == 5)
            inv = await pg.evaluate("(()=>{var o=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3'));var C=o.C||o;return (C.inv||[]).filter(x=>x.n==='Pouch').map(x=>x.q)})()")
            chk(t + " Pouch in inventory " + json.dumps(inv), inv == [1])
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            await open_lib("backpack", "gear|Backpack")
            await pg.click("#libBd [data-libbuy]"); await pg.wait_for_timeout(700)
            await pg.keyboard.press("Escape"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
            c2 = await coins(); chk(t + " not enough coin: refused, coins unchanged " + json.dumps(c2), c2 == c)
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            await open_lib("pouch", "gear|Pouch")
            await pg.fill("#libBd [data-libqty]", "2"); await pg.click("#libBd [data-libbuy]"); await pg.wait_for_timeout(900)
            await pg.keyboard.press("Escape"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
            c = await coins(); chk(t + " 2 Pouch: 10 sp paid (5 sp, then gp broken) " + json.dumps(c), c["gp"] == 0 and c["sp"] == 5 and c["cp"] == 5)
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            await open_lib("pouch", "gear|Pouch")
            await pg.click("#libBd [data-libadd]"); await pg.wait_for_timeout(700)
            await pg.keyboard.press("Escape"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
            c3 = await coins(); chk(t + " Add (free) leaves coins alone", c3 == c)
            inv = await pg.evaluate("(()=>{var o=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3'));var C=o.C||o;return (C.inv||[]).filter(x=>x.n==='Pouch').reduce((s,x)=>s+(+x.q||0),0)})()")
            chk(t + " Pouch quantity 4 in total " + json.dumps(inv), inv == 4)
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
