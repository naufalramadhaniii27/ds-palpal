#!/usr/bin/env python3
"""T11 G3 N2 Time machine. Yudhi at 390x844 and 1250x850: a point is kept, Chain Mail is taken off in the inventory
(AC 17 -> lower), a second point is kept, History lists both with the change, Compare shows it, Go back restores AC 17 after reload."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(4500)
            await pg.evaluate("()=>window.__tm.take('Before')")
            # change: Strength save proficiency off, through the same path a restore uses (stored build, then reload)
            ok = await pg.evaluate("()=>{ var b=[...document.querySelectorAll('[data-ieqs]')].find(x=>/Chain Mail/.test(x.getAttribute('data-ieqs'))); if(!b) return false; b.click(); return true; }")
            if not ok: bad.append(vp + " no equip toggle for Chain Mail")
            await pg.wait_for_timeout(800); await pg.evaluate("()=>window.__tm.take('After')")
            L = await pg.evaluate("()=>window.__tm.list()")
            if len(L) < 2 or L[0]["why"] != "After": bad.append(vp + " list " + json.dumps(L))
            await pg.evaluate("()=>window.__tm.open()"); await pg.wait_for_timeout(600)
            body = await pg.evaluate("()=>document.getElementById('sheetBody').textContent")
            if "Armor Class" not in body: bad.append(vp + " history does not show the change: " + body[:200])
            await pg.click('#sheetBody [data-tmc="1"]'); await pg.wait_for_timeout(500)
            cmp = await pg.evaluate("()=>document.getElementById('sheetBody').textContent")
            if "17" not in cmp: bad.append(vp + " compare: " + cmp[:200])
            await pg.evaluate("()=>window.__tm.open()"); await pg.wait_for_timeout(500)
            await pg.click('#sheetBody [data-tmr="1"]'); await pg.wait_for_selector(".ask [data-yes]", state="visible")
            async with pg.expect_navigation(timeout=30000): await pg.click(".ask [data-yes]")
            await pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); await pg.wait_for_timeout(2500)
            ac = await pg.evaluate("()=>window.__miBd('ac').total")
            if str(ac) != "17": bad.append(vp + " Go back did not restore AC 17: " + str(ac))
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("time_machine:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
