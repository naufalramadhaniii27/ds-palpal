#!/usr/bin/env python3
"""T11 N19 number map, 390x844 and 1250x850 with Yudhi. Dexterity feeds Initiative, the Dexterity save and Stealth (and not Strength
attacks). The Initiative panel shows Dexterity as its input. A chip in the map opens that number's breakdown."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; SH = A[A.index("--shots") + 1] if "--shots" in A else None; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(800)
            m = await pg.evaluate("()=>window.__numberMap('ab-DEX')")
            if "init" not in m["users"] or "save-DEX" not in m["users"]: bad.append(vp + " DEX users " + json.dumps(m))
            if await pg.evaluate("()=>window.__numberMap('init').inputs.indexOf('ab-DEX')<0"): bad.append(vp + " init does not come from DEX")
            await pg.evaluate("()=>{ var e=[...document.querySelectorAll('[data-bd=\"ab-DEX\"]')].find(x=>x.offsetParent)||document.querySelector('[data-bd=\"ab-DEX\"]'); e.click(); }")
            await pg.wait_for_selector("#sheet .nm .nm-c", state="visible", timeout=8000)
            n = await pg.evaluate("()=>document.querySelectorAll('#sheet .nm .nm-c').length")
            if n != len(m["users"]): bad.append(vp + " chips %d users %d" % (n, len(m["users"])))
            if SH: await (await pg.query_selector("#sheet .nm")).screenshot(path=os.path.join(SH, "nm-%s.png" % vp))
            await pg.click('#sheet .nm [data-bd="init"]'); await pg.wait_for_timeout(500)
            t = await pg.evaluate("()=>document.getElementById('sheetTitle').textContent")
            if "Initiative" not in t: bad.append(vp + " chip opened " + t)
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("number_map:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
