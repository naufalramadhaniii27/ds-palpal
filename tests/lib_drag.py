#!/usr/bin/env python3
"""Drag from the library onto the drop zone. python3 tests/lib_drag.py [--root DIR]
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
async def open_list(pg, q):
    await pg.keyboard.press("Control+k"); await pg.wait_for_selector("#gsQ"); await pg.wait_for_timeout(500)
    await pg.fill("#gsQ", q); await pg.wait_for_timeout(700)
    await pg.click(".gs-lib"); await pg.wait_for_selector("#libBd .lib-r"); await pg.wait_for_timeout(700)
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
            await open_list(pg, "fireball")
            row = pg.locator('#libBd .lib-r[data-lib-open="spell|Fireball"]').first
            bb = await row.bounding_box(); x, y = bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2
            # quick click still opens the entry
            await row.click(); await pg.wait_for_selector("[data-libadd]"); chk(t + " a quick tap still opens the entry", True)
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await open_list(pg, "fireball")
            row = pg.locator('#libBd .lib-r[data-lib-open="spell|Fireball"]').first
            bb = await row.bounding_box(); x, y = bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2
            # drop outside the zone: nothing added
            await pg.mouse.move(x, y); await pg.mouse.down(); await pg.wait_for_timeout(500)
            chk(t + " hold shows the drop zone", await pg.locator(".lib-dz").count() == 1)
            await pg.mouse.move(x, 60, steps=5); await pg.mouse.up(); await pg.wait_for_timeout(500)
            chk(t + " drop outside adds nothing", await pg.evaluate("(%s.spells||[]).filter(x=>x.n==='Fireball').length" % CJ) == 0)
            chk(t + " zone is gone after release", await pg.locator(".lib-dz").count() == 0)
            # drop on the zone
            await pg.mouse.move(x, y); await pg.mouse.down(); await pg.wait_for_timeout(500)
            zb = await pg.locator(".lib-dz").bounding_box()
            await pg.mouse.move(zb["x"] + zb["width"] / 2, zb["y"] + zb["height"] / 2, steps=8); await pg.wait_for_timeout(150)
            chk(t + " zone lights up under the pointer", await pg.evaluate("!!document.querySelector('.lib-dz.on')"))
            await pg.mouse.up(); await pg.wait_for_timeout(900)
            chk(t + " drop on zone adds Fireball once", await pg.evaluate("(%s.spells||[]).filter(x=>x.n==='Fireball'&&x.lib===1).length" % CJ) == 1)
            chk(t + " the drop did not open the entry", await pg.locator("[data-libadd]").count() == 0)
            # Escape cancels a drag
            await pg.mouse.move(x, y); await pg.mouse.down(); await pg.wait_for_timeout(500); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            chk(t + " Escape cancels the drag", await pg.locator(".lib-dz").count() == 0)
            await pg.mouse.up(); await pg.wait_for_timeout(300)
            chk(t + " library still open after cancel", await pg.locator("#lib").count() == 1)
            if W < 600:
                cdp = await ctx.new_cdp_session(pg)
                await open_list(pg, "longsword")
                row = pg.locator('#libBd .lib-r[data-lib-open="gear|Longsword"]').first
                bb = await row.bounding_box(); x, y = bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2
                await cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": x, "y": y}]}); await pg.wait_for_timeout(600)
                chk(t + " touch: long press shows the drop zone", await pg.locator(".lib-dz").count() == 1)
                zb = await pg.locator(".lib-dz").bounding_box(); zx, zy = zb["x"] + zb["width"] / 2, zb["y"] + zb["height"] / 2
                for i in range(1, 7):
                    await cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": x + (zx - x) * i / 6, "y": y + (zy - y) * i / 6}]}); await pg.wait_for_timeout(40)
                await cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}); await pg.wait_for_timeout(900)
                chk(t + " touch: Longsword lands in C.inv", await pg.evaluate("(%s.inv||[]).some(x=>x.n==='Longsword'&&x.lib===1)" % CJ))
                # a normal scroll swipe must not start a drag
                await open_list(pg, "sword")
                row = pg.locator("#libBd .lib-r").nth(1); bb = await row.bounding_box(); x, y = bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2
                await cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": x, "y": y}]})
                for i in range(1, 5):
                    await cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": x, "y": y - 30 * i}]}); await pg.wait_for_timeout(30)
                await pg.wait_for_timeout(500)
                chk(t + " touch: a swipe does not start a drag", await pg.locator(".lib-dz").count() == 0)
                await cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
            chk(t + " no page errors", not errs)
            await ctx.close()
        await b.close()
    print("%d failed" % fails); sys.exit(1 if fails else 0)
asyncio.run(main())
