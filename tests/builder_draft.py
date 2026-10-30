#!/usr/bin/env python3
"""T11 G6 T9: the builder opens where it was left after a reload. 390x844 and 1250x850 with Yudhi.
Go to the Abilities step, reload, open the builder: the Abilities step is on and a toast says so. A new character still starts on Home."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def opened(pg):
    await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible")
    await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
    await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(900)
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            await opened(pg)
            cur = lambda: pg.evaluate("()=>document.querySelector('#steps .on').getAttribute('data-step')")
            await pg.click('#steps [data-step="abil"]'); await pg.wait_for_timeout(600)
            await pg.reload(); await opened(pg)
            s = await cur(); t = await pg.evaluate("()=>document.getElementById('btoast').textContent")
            if s != "abil": bad.append(vp + " opened on " + str(s))
            if "left off" not in t: bad.append(vp + " toast: " + t[:80])
            # a new character: Home, not the old place
            await pg.evaluate("()=>{ __store.setItem('cs-new','1'); location.reload(); }"); await pg.wait_for_timeout(500)
            await pg.wait_for_function("()=>!document.getElementById('bld')||!document.getElementById('bld').hidden", timeout=30000); await pg.wait_for_timeout(1200)
            s = await pg.evaluate("()=>{ var e=document.querySelector('#steps .on'); return e&&e.getAttribute('data-step'); }")
            if s != "home": bad.append(vp + " new character opened on " + str(s))
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("builder_draft:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
