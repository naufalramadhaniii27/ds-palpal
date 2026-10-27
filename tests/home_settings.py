#!/usr/bin/env python3
"""Home keeps backup and storage details out of sight. python3 tests/home_settings.py [OUTDIR] [--root DIR]
1. Home shows no 'Last backup' or 'Storage used' text when nothing needs attention.
2. The gear button opens the Settings dialog with both, the storage protection line fills in, and Back Up leads to the backup dialog.
3. With a 9 day old backup and changes since, Home shows one warning with Back Up and Details, and Details opens the dialog.
4. With deleted characters in snapshots, the recycle bin icon shows a count and the list stays hidden until it is opened.
Runs at 390x844 and 1250x850. Exit code 0 only when every check passes and there is no page error."""
import asyncio, json, os, sys, socket, threading, functools, http.server, time
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
OUT = os.path.abspath(a[0]) if a else os.path.join(HERE, "out", "home_settings"); os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
SNAP = {"chars": {"d%d" % i: [{"t": int(time.time() * 1000) - i * 3600000, "why": "x", "name": "Culas" if i == 0 else "New Character", "B": None, "C": json.dumps({"name": "Culas" if i == 0 else "New Character", "species": "Human" if i == 0 else "", "clsLabel": "Fighter 4" if i == 0 else ""}), "S": "{}", "h": "h%d" % i}] for i in range(7)}}

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

async def main():
    srv, base = serve(); fails = 0
    def chk(name, ok):
        nonlocal fails
        print("%s  %s" % ("ok  " if ok else "FAIL", name)); fails += 0 if ok else 1
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in ((390, 844), (1250, 850)):
            tag = "%dx%d" % (W, H)
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            pg = await ctx.new_page(); pg.set_default_timeout(12000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(base); await pg.wait_for_timeout(600)
            async def boot(extra):
                await pg.evaluate("a=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',a[0]);for(var k in a[1])localStorage.setItem(k,a[1][k])}", [YUDHI, extra])
                await pg.reload(); await pg.wait_for_timeout(2500)
            home_txt = "()=>document.getElementById('homeV').innerText"
            await boot({})
            t = await pg.evaluate(home_txt)
            chk(tag + " Home has no backup or storage lines", "Last backup" not in t and "Storage used" not in t and not await pg.query_selector("#homeV .hbkl.warn"))
            await pg.click("[data-hbk='info']"); await pg.wait_for_selector("#bkp")
            d = await pg.evaluate("document.getElementById('bkp').innerText")
            chk(tag + " gear opens Settings with backup and storage", "Settings" in d and "Last backup" in d and "Storage used" in d)
            await pg.wait_for_timeout(600)
            chk(tag + " protection line filled in", await pg.evaluate("(document.getElementById('hpers')||{}).textContent!=='...'"))
            await pg.screenshot(path="%s/settings-%s.png" % (OUT, tag))
            await pg.click("[data-bkp='goout']"); await pg.wait_for_timeout(400)
            chk(tag + " Back Up inside Settings opens the backup dialog", "Back Up Characters" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            await boot({"cs-ui-bkp": json.dumps({"t": int((time.time() - 9 * 86400) * 1000), "h": "old"})})
            chk(tag + " old backup shows one warning with Back Up and Details", await pg.evaluate("(()=>{var w=document.querySelector('#homeV .hbkl.warn');return !!w&&!!w.querySelector('[data-hbk=out]')&&!!w.querySelector('[data-hbk=info]')})()"))
            await pg.screenshot(path="%s/warn-%s.png" % (OUT, tag))
            await pg.click("#homeV .hbkl.warn [data-hbk='info']"); await pg.wait_for_selector("#bkp")
            chk(tag + " Details opens Settings", "Settings" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            await boot({"cs-snap-v1": json.dumps(SNAP)})
            chk(tag + " recycle bin shows count, list hidden", await pg.evaluate("document.querySelector('.hbinn')&&document.querySelector('.hbinn').textContent==='7'&&!document.querySelector('.hdel')"))
            await pg.click(".hbinb"); await pg.wait_for_timeout(300)
            chk(tag + " recycle bin opens, 5 rows plus older", await pg.evaluate("document.querySelectorAll('.hdel > ul > li').length===5&&!!document.querySelector('.hdel details')"))
            await pg.screenshot(path="%s/bin-%s.png" % (OUT, tag))
            chk(tag + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)

asyncio.run(main())
