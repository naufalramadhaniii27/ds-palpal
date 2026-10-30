#!/usr/bin/env python3
"""T11 A6: the Back gesture or button on the sheet returns to Home (and leaves the app only from Home). Also: Back with a detail
panel open closes the panel first. 390x844 and 1250x850. Exit 1 on failure."""
import asyncio, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page()
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(1000)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(600)
            el = await pg.query_selector("[data-info]"); await el.click(); await pg.wait_for_timeout(600)
            await pg.go_back(); await pg.wait_for_timeout(700)
            st1 = await pg.evaluate("()=>({home:!document.getElementById('homeV').hidden, sheetOpen:!!document.querySelector('.sheet.on')})")
            await pg.go_back(); await pg.wait_for_timeout(700)
            st2 = await pg.evaluate("()=>({home:!document.getElementById('homeV').hidden, url:location.href})")
            ok = (not st1["home"]) and (not st1["sheetOpen"]) and st2["home"] and st2["url"].startswith("http://127.0.0.1")
            print("%dx%d" % (w, h), "after first Back", st1, "after second Back", st2, "ok" if ok else "FAIL")
            if not ok: bad.append(w)
            await ctx.close()
        await b.close()
    srv.shutdown(); print("back_home:", "ok" if not bad else "FAIL"); sys.exit(1 if bad else 0)
asyncio.run(main())
