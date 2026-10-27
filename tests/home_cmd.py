#!/usr/bin/env python3
"""Commands on Home. python3 tests/home_cmd.py [--root DIR]
Ctrl+K on Home focuses the search. Typing a command word shows a command button. Enter runs the first one. Click runs it too.
Checks at 390x844 and 1250x850: Ctrl+K focus, 'back' lists Back up, Enter opens the backup dialog, 'settings' click opens Settings,
'zzz' shows no command, a search word opens the library above Home, a character name shows no command, no page error."""
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
            chk(t + " no match, no command", await pg.evaluate("!document.querySelector('.hcmd:not([data-hlib])')"))
            await pg.fill("#homeQ", "yudhi"); await pg.wait_for_timeout(200)
            chk(t + " character name shows no command", await pg.evaluate("!document.querySelector('.hcmd:not([data-hlib])')&&!!document.querySelector('.hcard')"))
            await pg.fill("#homeQ", "back"); await pg.wait_for_timeout(200)
            chk(t + " 'back' lists Back up", await pg.evaluate("[...document.querySelectorAll('.hcmd')].some(x=>/Back up/i.test(x.textContent))"))
            await pg.press("#homeQ", "Enter"); await pg.wait_for_selector("#bkp"); await pg.wait_for_timeout(300)
            chk(t + " Enter opens the backup dialog", "Back Up" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.fill("#homeQ", "settings"); await pg.wait_for_timeout(200)
            await pg.click(".hcmd"); await pg.wait_for_selector("#bkp"); await pg.wait_for_timeout(300)
            chk(t + " click on Settings command opens Settings", "Settings" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.fill("#homeQ", "fireball"); await pg.wait_for_timeout(200)
            chk(t + " library button appears for a search word", await pg.evaluate("!!document.querySelector('[data-hlib]')"))
            await pg.press("#homeQ", "Enter"); await pg.wait_for_selector("#lib:not([hidden])", timeout=15000); await pg.wait_for_timeout(1500)
            lib = await pg.evaluate("(()=>{var l=document.getElementById('lib');var r=l.getBoundingClientRect();var e=document.elementFromPoint(r.left+r.width/2,r.top+40);return {q:document.getElementById('libQ').value,top:!!e&&l.contains(e),n:document.querySelectorAll('#libBd .lib-r').length}})()")
            chk(t + " library opens with the query and results " + json.dumps(lib), lib["q"] == "fireball" and lib["n"] > 0)
            try:
                await pg.click("#libBd .lib-r", timeout=4000); await pg.wait_for_timeout(600)
                chk(t + " a library result can be tapped (nothing covers it)", await pg.evaluate("!!document.querySelector('#libBd .lib-d, #libBd .lib-back, #libBd [data-lib-back]')||document.getElementById('libBd').innerText.length>200"))
            except Exception as ex:
                chk(t + " a library result can be tapped (nothing covers it) " + str(ex)[:80], False)
            await pg.keyboard.press("Escape"); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(600)
            chk(t + " library closes and Home answers taps again", await pg.evaluate("(()=>{var l=document.getElementById('lib');return (l.hidden||!l.classList.contains('on'))&&!document.getElementById('homeV').inert})()"))
            await pg.screenshot(path="/tmp/home_lib-%s.png" % t)
            await pg.screenshot(path="/tmp/home_cmd-%s.png" % t)
            await pg.evaluate("document.activeElement&&document.activeElement.blur()"); await pg.fill("#homeQ", ""); await pg.evaluate("document.getElementById('homeQ').blur()"); await pg.wait_for_timeout(300)
            await pg.keyboard.press("/"); await pg.wait_for_timeout(200)
            chk(t + " '/' focuses Home search", await pg.evaluate("document.activeElement.id==='homeQ'"))
            await pg.keyboard.type("b"); await pg.wait_for_timeout(300)
            chk(t + " typing b in the search does not open Back up", not await pg.evaluate("!!document.getElementById('bkp')"))
            await pg.fill("#homeQ", ""); await pg.evaluate("document.getElementById('homeQ').blur()"); await pg.wait_for_timeout(300)
            await pg.keyboard.press("s"); await pg.wait_for_selector("#bkp"); await pg.wait_for_timeout(300)
            chk(t + " S opens Settings", "Settings" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.keyboard.press("n"); await pg.wait_for_timeout(500)
            chk(t + " N does nothing while a dialog is open", await pg.evaluate("!document.getElementById('bld')||document.getElementById('bld').hidden"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            await pg.keyboard.press("b"); await pg.wait_for_selector("#bkp"); await pg.wait_for_timeout(300)
            chk(t + " B opens Back up", "Back Up" in await pg.evaluate("document.getElementById('bkp').innerText"))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
