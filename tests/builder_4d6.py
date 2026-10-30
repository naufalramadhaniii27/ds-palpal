#!/usr/bin/env python3
"""T11 G6 B2: Roll 4d6 for every ability in the builder. With effects on, the 24 dice land on the 3D table and each ability gets the
sum of its best three (3 to 18). With Motion off the numbers come at once. 390x844. Exit 1 on failure."""
import asyncio, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
GET = "()=>['STR','DEX','CON','INT','WIS','CHA'].map(k=>+document.querySelector('#bld input[data-b=\"base.'+k+'\"]').value)"
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for fx in ("full", "off"):
            ctx = await b.new_context(viewport={"width": 390, "height": 844}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url); await pg.evaluate("([v,f])=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx',f);}", [FIX, fx]); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
            await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(800); await pg.click('#steps [data-step="abil"]'); await pg.wait_for_timeout(600)
            await pg.select_option("#bld select[data-method]", "manual"); await pg.wait_for_timeout(600)
            await pg.wait_for_timeout(800); await pg.screenshot(path="/tmp/claude-0/-home-claude/860d5bec-8c32-5f79-85dc-ccbf8d67ca67/scratchpad/b4.png"); await pg.evaluate("()=>document.querySelector('.mi-4d6').click()"); before = await pg.evaluate(GET)
            three = False
            for _ in range(120):
                await pg.wait_for_timeout(250)
                three = three or await pg.evaluate("()=>!!(document.getElementById('diceTray')&&document.getElementById('diceTray').classList.contains('on'))")
                j = await pg.evaluate("()=>Object.keys(localStorage).filter(k=>/^mi-jr-/.test(k)).map(k=>localStorage.getItem(k)).join('')")
                if "Rolled abilities" in j: break
            vals = await pg.evaluate(GET)
            ok = "Rolled abilities" in j and all(3 <= v <= 18 for v in vals) and (three or fx == "off")
            print(fx, before, "->", vals, "3D tray seen" if three else "no 3D", "ok" if ok else "FAIL")
            if not ok: bad.append(fx)
            if fx == "off" and three: bad.append("Motion off used 3D")
            for e in errs: bad.append(e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown(); print("builder_4d6:", "ok" if not bad else "FAIL " + str(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
