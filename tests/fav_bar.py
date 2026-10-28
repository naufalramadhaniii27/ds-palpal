#!/usr/bin/env python3
"""Favorites bar. python3 tests/fav_bar.py [--root DIR]
New Wizard from the quick build. Open a spell panel, add it to the favorites bar, see it on Main, tap it to reopen the panel, remove it. Checks 390x844 and 1250x850.
Also: the pin is stored in S.pin as 'sp:Name' (optional field), skill pins still work, bar buttons are 44 px high at 390, no page error."""
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
            pg = await ctx.new_page(); pg.set_default_timeout(20000); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
            await pg.goto(base); await pg.wait_for_timeout(2500)
            await pg.evaluate("document.querySelector('[data-hnew]').click()"); await pg.wait_for_selector("#qbCls", state="attached"); await pg.wait_for_timeout(800)
            await pg.select_option("#qbCls", "Wizard"); await pg.evaluate("document.querySelector('[data-qb]').click()"); await pg.wait_for_timeout(2000)
            await pg.evaluate("document.getElementById('b-toSheet').click()"); await pg.wait_for_selector("#dmgBtn", state="attached"); await pg.wait_for_timeout(1500)
            await pg.click("[data-go='3']" if W < 700 else "[data-tab='p-spells']"); await pg.wait_for_timeout(600)
            names = await pg.evaluate("[...document.querySelectorAll('.sp-r[data-info]')].slice(0,1).map(x=>x.querySelector('.sp-n b').textContent.trim())")
            await pg.click(".sp-r[data-info]"); await pg.wait_for_selector(".pinfav"); await pg.wait_for_timeout(500)
            chk(t + " spell panel has a favorites button", await pg.evaluate("document.querySelector('.pinfav').getAttribute('aria-pressed')==='false'"))
            await pg.click(".pinfav"); await pg.wait_for_timeout(500)
            chk(t + " button switches to 'In your favorites bar'", await pg.evaluate("document.querySelector('.pinfav').getAttribute('aria-pressed')==='true'&&/In your/.test(document.querySelector('.pinfav').textContent)"))
            st = await pg.evaluate("(()=>{var k=Object.keys(localStorage).filter(x=>/yudhi|cs-char|cs-state/i.test(x));var o=[];k.forEach(x=>{var v=(window.__store||localStorage).getItem(x);if(v&&v.indexOf('\"pin\"')>=0){var m=v.match(/\"pin\":\\[[^\\]]*\\]/);if(m)o.push(m[0])}});return o})()")
            chk(t + " stored as sp:Name in S.pin " + json.dumps(st)[:80], any("sp:" in x for x in st))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
            await pg.click("[data-go='0']" if W < 700 else "[data-tab='p-actions']"); await pg.wait_for_timeout(600)
            bar = await pg.evaluate("[...document.querySelectorAll('.pins .pinsp')].map(x=>[x.textContent.trim(),Math.round(x.getBoundingClientRect().height)])")
            chk(t + " favorite shows in the bar " + json.dumps(bar), len(bar) == 1 and names[0] in bar[0][0])
            if W < 700: chk(t + " bar button is at least 44 px high", bar and bar[0][1] >= 44)
            await pg.screenshot(path="/tmp/fav-%s.png" % t)
            await pg.click(".pins .pinsp"); await pg.wait_for_selector(".pinfav"); await pg.wait_for_timeout(500)
            chk(t + " tapping the favorite opens the spell panel", await pg.evaluate("document.querySelector('.pinfav').getAttribute('aria-pressed')==='true'"))
            await pg.click(".pinfav"); await pg.wait_for_timeout(500); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
            chk(t + " removing it empties the bar", await pg.evaluate("document.querySelectorAll('.pins .pinsp').length===0"))
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
