#!/usr/bin/env python3
"""Immersive Off must have no animation. python3 tests/off_mode.py [--root DIR]
At 390x844 and 1250x850, with mi-fx=off: open the sheet, Damage, Heal, switch page, open and close a detail panel.
Passes when (1) no element has a CSS transition or animation longer than 1 ms, (2) no animation longer than 1 ms was seen
running in any frame during the taps (CSS animations at .001 ms are allowed: they end in the same frame), (3) no page error."""
import asyncio, os, sys, socket, threading, functools, http.server
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

WATCH = """()=>{window.__long={};(function f(){document.getAnimations().forEach(a=>{var d=0;try{d=a.effect.getComputedTiming().duration}catch(e){}
  if(typeof d==='number'&&d>1){var t=a.effect&&a.effect.target;var k=(a.animationName||'waapi')+' on '+((t&&(t.id||String(t.className).slice(0,28)||t.tagName))||'?')+' '+Math.round(d)+'ms';window.__long[k]=1}});requestAnimationFrame(f)})()}"""
STATIC = """()=>{var tr=0,an=0;document.querySelectorAll('body *').forEach(e=>{var c=getComputedStyle(e);if(c.transitionProperty!=='none'&&parseFloat(c.transitionDuration)>0.002)tr++;if(c.animationName!=='none'&&parseFloat(c.animationDuration)>0.002)an++});return [tr,an]}"""

async def main():
    srv, base = serve(); bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in ((390, 844), (1250, 850)):
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            pg = await ctx.new_page(); pg.set_default_timeout(15000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(base); await pg.wait_for_timeout(600)
            await pg.evaluate("a=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',a);localStorage.setItem('mi-fx','off')}", YUDHI)
            await pg.reload(); await pg.wait_for_timeout(2500)
            await pg.evaluate(WATCH)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn"); await pg.wait_for_timeout(1500)
            await pg.fill("#hpAmt", "3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(300)
            await pg.click("#healBtn"); await pg.wait_for_timeout(300)
            await pg.click("[data-tab='p-spells']" if W > 600 else "[data-go='3']"); await pg.wait_for_timeout(500)
            await pg.click(".hp-h [data-info]"); await pg.wait_for_timeout(600); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
            tr, an = await pg.evaluate(STATIC)
            seen = await pg.evaluate("Object.keys(window.__long)")
            ok = tr == 0 and an == 0 and not seen and not errs
            bad += 0 if ok else 1
            print("%s %dx%d  transitions>0: %d  css animations>0: %d  long animations seen: %s  errors: %s" % ("ok  " if ok else "FAIL", W, H, tr, an, seen[:6], errs[:2]))
            await ctx.close()
        await b.close()
    sys.exit(1 if bad else 0)

asyncio.run(main())
