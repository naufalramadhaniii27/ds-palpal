#!/usr/bin/env python3
"""Campaign: an empty campaign offers Add campaign under the name, typing it shows it, and a campaign typed in the builder reaches the sheet on Apply. 390x844 and 1250x850.
  python3 tests/campaign.py"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
RES = []
def check(n, ok, info=""): RES.append(ok); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info)[:300] if not ok else ""))
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d/index.html" % p
async def asks(pg):
    for _ in range(3):
        ok = await pg.evaluate("()=>{var l=document.querySelectorAll('.ask[role=dialog],.exp[role=dialog]');var a=l[l.length-1];if(!a)return 0;var b=a.querySelectorAll('button');(b[b.length-1]).click();return 1}")
        if not ok: break
        await pg.wait_for_timeout(700)
async def main():
    base = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in [(390, 844), (1250, 850)]:
            t = "%dx%d " % (W, H)
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            pg = await ctx.new_page(); pg.set_default_timeout(15000); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(base); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(1500)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="attached"); await pg.wait_for_timeout(1500)
            check(t + "empty campaign shows Add campaign", await pg.evaluate("()=>!!document.querySelector('#idCamp .camp-add')&&!document.getElementById('idCamp').hidden"))
            await pg.evaluate("()=>document.querySelector('#idCamp .camp-add').click()"); await pg.wait_for_timeout(1200)
            check(t + "Add campaign opens the Campaign field", await pg.evaluate("()=>document.activeElement&&document.activeElement.id==='n-camp'"))
            await pg.fill("#n-camp", "Lost Mine"); await pg.wait_for_timeout(500)
            check(t + "typed campaign shows under the name", await pg.evaluate("()=>/Lost Mine/.test(document.getElementById('idCamp').textContent)&&!document.querySelector('#idCamp .camp-add')"))
            # builder
            await pg.evaluate("()=>document.getElementById('bldBtn').click()"); await pg.wait_for_timeout(4000); await asks(pg)
            check(t + "builder has the Campaign field, filled from the sheet", await pg.evaluate("()=>{var i=document.getElementById('cpIn');return !!i&&i.value==='Lost Mine'}"))
            await pg.click('#steps [data-step="home"]'); await pg.wait_for_timeout(400)  # T11 G6 B1: Name and Campaign sit on the Home step
            await pg.fill("#cpIn", "Dragon Heist"); await pg.wait_for_timeout(400)
            await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(700); await asks(pg); await pg.wait_for_timeout(1500)
            sheet = json.loads(await pg.evaluate("()=>localStorage.getItem('yudhi-kelapa-sheet-v1')||(window.__store&&__store.getItem('yudhi-kelapa-sheet-v1'))||'{}'"))
            check(t + "Apply puts the campaign in the sheet", sheet.get("camp") == "Dragon Heist", sheet.get("camp"))
            check(t + "sheet shows the new campaign", await pg.evaluate("()=>/Dragon Heist/.test(document.getElementById('idCamp').textContent)"))
            check(t + "no page errors", not errs, errs[:2])
            await ctx.close()
        await b.close()
    print("%d checks, %d failed" % (len(RES), RES.count(False))); sys.exit(1 if False in RES else 0)
asyncio.run(main())
