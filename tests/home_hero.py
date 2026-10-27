#!/usr/bin/env python3
"""Home hero. python3 tests/home_hero.py [OUTDIR] [--root DIR]
At 390x844 and 1250x850: the hero shows the open character (name, level line, Continue, All characters), hides while a search is typed,
Continue opens the sheet of that character, All characters scrolls to the list, Off mode and Reduce Motion run no hero animation,
the hero stays inside the window (no sideways scroll), and there is no page error."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
OUT = os.path.abspath(a[0]) if a else os.path.join(HERE, "out", "home_hero"); os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
INIT = "if(!sessionStorage.getItem('__seeded')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__seeded','1');%s}"

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
            for variant in ("full", "off", "reduce"):
                extra = "localStorage.setItem('mi-fx','off');" if variant == "off" else ""
                ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600, reduced_motion="reduce" if variant == "reduce" else "no-preference")
                await ctx.add_init_script(INIT % (json.dumps(YUDHI), extra))
                pg = await ctx.new_page(); pg.set_default_timeout(15000); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
                await pg.goto(base); await pg.wait_for_selector("#hxHero", state="attached"); await pg.wait_for_timeout(1800)
                t = await pg.evaluate("document.getElementById('hxHero').innerText")
                if variant == "full":
                    chk(tag + " hero shows name, line and both buttons", "YUDHI KELAPA" in t.upper() and "Level 4" in t and "CONTINUE" in t.upper() and "ALL CHARACTERS" in t.upper())
                    chk(tag + " hero is inside the window", await pg.evaluate("(()=>{var r=document.getElementById('hxHero').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+1&&document.getElementById('homeV').scrollWidth<=innerWidth+1})()"))
                    await pg.screenshot(path="%s/hero-%s.png" % (OUT, tag))
                    await pg.fill("#homeQ", "zzz"); await pg.wait_for_timeout(250)
                    chk(tag + " hero hides while searching", await pg.evaluate("document.getElementById('hxHero').hidden"))
                    await pg.fill("#homeQ", ""); await pg.wait_for_timeout(250)
                    chk(tag + " hero returns when the search is cleared", not await pg.evaluate("document.getElementById('hxHero').hidden"))
                    await pg.click("[data-hall]"); await pg.wait_for_timeout(900)
                    chk(tag + " All characters scrolls to the list", await pg.evaluate("(()=>{var g=document.getElementById('hgrid').getBoundingClientRect();return g.top<innerHeight*0.6})()"))
                    await pg.evaluate("document.getElementById('homeV').scrollTo(0,0)")
                    await pg.click(".hhgo"); await pg.wait_for_timeout(2500)
                    chk(tag + " Continue opens the sheet of this character", await pg.evaluate("(()=>{var h=document.getElementById('homeV');var n=document.getElementById('idName');return (!h||h.hidden||!h.offsetParent&&getComputedStyle(h).display==='none')&&!!n&&/Yudhi/i.test(n.textContent)})()"))
                else:
                    anim = await pg.evaluate("(()=>{var n=0;document.querySelectorAll('#hxHero, #hxHero *').forEach(e=>{var c=getComputedStyle(e);if(c.animationName!=='none'&&parseFloat(c.animationDuration)>0.002)n++});return n})()")
                    chk(tag + " " + variant + ": no hero animation", anim == 0)
                chk(tag + " " + variant + ": no page errors", not errs)
                await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)

asyncio.run(main())
