#!/usr/bin/env python3
"""T11 G3 N3, N13, N16: number receipts. 390x844 and 1250x850 with Yudhi.
N3: a receipt kept by an older app version with AC 16 makes the toast "After the update, 1 number changed", See why lists Armor Class 16 -> 17.
N16: in the builder, DEX 13 -> 15 shows the changed numbers on What's Next before Apply (Dexterity score, Initiative).
N13: restoring a snapshot of the open character lists the numbers that change in the confirm box."""
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
            await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"); await pg.goto(url)
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(3500)
            st = await pg.evaluate("()=>JSON.parse(localStorage.getItem('cs-rcpt-v1')||'{}')")
            if not st: bad.append(vp + " no receipt kept"); 
            else:
                k = list(st.keys())[0]; st[k]["ver"] = 1; st[k]["r"]["ac"]["v"] = "16"; st[k]["r"]["ac"]["p"] = [["Chain Mail, Heavy armor (PHB-2024)", "16"]]
                await pg.evaluate("s=>localStorage.setItem('cs-rcpt-v1',JSON.stringify(s))", st); await pg.reload()
                await pg.wait_for_selector("[data-rcpt]", state="visible", timeout=15000)
                t = await pg.evaluate("()=>document.getElementById('toast').textContent")
                if "1 number changed" not in t: bad.append(vp + " toast: " + t)
                await pg.click("[data-rcpt]"); await pg.wait_for_timeout(700)
                body = await pg.evaluate("()=>document.getElementById('sheetBody').textContent")
                if "Armor Class" not in body or "16" not in body or "17" not in body or "Fighting Style" not in body: bad.append(vp + " What changed: " + body[:200])
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            txt = await pg.evaluate("v=>{ var c=JSON.parse(v); c.saves=Object.assign({},c.saves||{}); c.saves.STR=false; return window.__rcptRestoreText(c); }", FIX)
            if "Strength saving throw" not in txt: bad.append(vp + " restore preview text: " + txt[:200])
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
            await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(800); await pg.click('#steps [data-step="abil"]'); await pg.wait_for_timeout(500)
            await pg.fill('#bld input[data-b="base.DEX"]', "15"); await pg.dispatch_event('#bld input[data-b="base.DEX"]', "change"); await pg.wait_for_timeout(500)
            await pg.click('#steps [data-step="next"]'); await pg.wait_for_timeout(900)
            pv = await pg.evaluate("()=>{ var p=document.querySelector('#bld .bprev'); return p?p.textContent:''; }")
            if "Dexterity score" not in pv or "Initiative" not in pv: bad.append(vp + " Apply preview: " + pv[:200])
            await pg.evaluate("()=>document.getElementById('b-close').click()"); await pg.wait_for_timeout(800)
            for _ in range(3):
                y = await pg.query_selector(".ask [data-no], .exp [data-no]")
                if not y: break
                await y.click(); await pg.wait_for_timeout(500)
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("receipts:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
