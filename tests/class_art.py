#!/usr/bin/env python3
"""Class art behind the sheet. python3 tests/class_art.py [--root DIR]
Yudhi (Fighter): layer #clsArt is on, does not take taps, loads its picture, empty portrait shows the emblem, Home hides the layer, the off switch removes it. 390x844 and 1250x850. No page error."""
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
            pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_timeout(2200)
            await pg.wait_for_selector("[data-hview]", state="attached")
            chk(t + " Home: no class layer", await pg.evaluate("!document.documentElement.classList.contains('cls-art')"))
            await pg.click("#homeV .hcard [data-hview]"); await pg.wait_for_selector("#dmgBtn", state="attached"); await pg.wait_for_timeout(1200)
            chk(t + " sheet: class layer is on", await pg.evaluate("document.documentElement.classList.contains('cls-art')&&!!document.getElementById('clsArt')"))
            chk(t + " layer takes no taps", await pg.evaluate("getComputedStyle(document.getElementById('clsArt')).pointerEvents==='none'"))
            ok = await pg.evaluate("""()=>{var a=document.querySelector('.cls-art-l.on').style.getPropertyValue(innerWidth>=760?'--ca-pc':'--ca-ph').replace(/url\\("|"\\)/g,'');return fetch(a).then(r=>r.ok&&(r.headers.get('content-type')||'').indexOf('image')===0)}""")
            chk(t + " the picture file loads", ok)
            sel = "#bnav button[data-go='3']" if t.startswith("390") else "#tabs .tab[data-tab='p-spells']"
            before = await pg.evaluate("document.querySelector('.cls-art-l.on').style.getPropertyValue(innerWidth>=760?'--ca-pc':'--ca-ph')")
            await pg.evaluate("document.querySelector(\"%s\").click()" % sel); await pg.wait_for_timeout(1200)
            after = await pg.evaluate("document.querySelector('.cls-art-l.on').style.getPropertyValue(innerWidth>=760?'--ca-pc':'--ca-ph')")
            chk(t + " Spells page swaps to its own scene", after != before and "/scn/tab/" in after)
            chk(t + " only one layer shows", await pg.evaluate("document.querySelectorAll('.cls-art-l.on').length===1"))
            chk(t + " empty portrait shows the emblem", await pg.evaluate("document.documentElement.classList.contains('cls-emb')&&getComputedStyle(document.querySelector('.photo .ph-sil')).backgroundImage.indexOf('emblem')>0"))
            await pg.evaluate("document.getElementById('themeBtn').click()"); await pg.wait_for_selector('[data-miart="off"]'); await pg.wait_for_timeout(300)
            chk(t + " Settings has the Class art switch, On is selected", await pg.evaluate("document.querySelector('[data-miart=on]').getAttribute('aria-pressed')==='true'"))
            await pg.evaluate("document.querySelector('[data-miart=off]').click()"); await pg.wait_for_timeout(500)
            chk(t + " off switch removes the layer", await pg.evaluate("!document.documentElement.classList.contains('cls-art')"))
            await pg.evaluate("document.querySelector('[data-miart=on]').click()"); await pg.wait_for_timeout(400)
            chk(t + " On brings it back", await pg.evaluate("document.documentElement.classList.contains('cls-art')"))
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
