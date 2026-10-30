#!/usr/bin/env python3
"""T11 Learn F5: the links between the sheet and Learn.
  python3 tests/learn_links.py
390x844 and 1250x850: a rule panel on the sheet (Armor Class) ends with "Learn this" and opens the Training Yard stop; closing Learn
shows the sheet again. A stop learned two days ago brings a Quick recap card on the map, two questions, then the card is gone for the day."""
import asyncio, json, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            old = int(time.time() * 1000) - 2 * 864e5
            await pg.goto(url); await pg.evaluate("([v,o])=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off'); localStorage.setItem('cs-learn-v1', JSON.stringify({v:1,lang:'en',xp:100,done:{tavern:{t:o,skip:0}}})); }", [FIX, old]); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1200)
            r = await pg.evaluate("""async()=>{ const z=ms=>new Promise(r=>setTimeout(r,ms)); var e=[...document.querySelectorAll('[data-info="g:Armor Class"],[data-bd="ac"]')].find(x=>x.offsetParent); if(!e) return 'no AC'; e.click(); await z(800);
              var lb=document.querySelector('#sheet [data-hlearn^="place:"]'); if(!lb) return 'no Learn this in '+document.getElementById('sheetTitle').textContent; lb.click(); await z(900);
              return document.getElementById('learn').hidden?'learn hidden':document.getElementById('lrnT').textContent; }""")
            if r != "Training Yard": bad.append(vp + " Learn this: " + r)
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            if not await pg.evaluate("()=>document.getElementById('learn').hidden&&document.getElementById('homeV').hidden"): bad.append(vp + " closing Learn did not return to the sheet")
            await pg.evaluate("()=>window.__app.showHome()"); await pg.click("#hlearnB [data-hlearn]"); await pg.wait_for_selector("#learn", state="visible")
            if not await pg.query_selector("#lrnB [data-lrecap]"): bad.append(vp + " no recap card")
            else:
                await pg.click("#lrnB [data-lrecap]"); await pg.wait_for_timeout(400)
                for q in range(2):
                    if await pg.evaluate("()=>!!window.__learnState().qd"): break
                    for k in range(4):
                        el = await pg.query_selector('#lrnB [data-lq="%d"]' % k)
                        if not el: break
                        await el.click(); await pg.wait_for_timeout(150)
                        if await pg.evaluate("()=>!!window.__learnState().s.ok"): break
                    await pg.click('#lrnB [data-l="qnext"]'); await pg.wait_for_timeout(400)
                st = await pg.evaluate("()=>({qd:!!window.__learnState().qd, saved:JSON.parse(localStorage.getItem('cs-learn-v1')).recap})")
                if not st["qd"] or not st["saved"]: bad.append(vp + " recap " + json.dumps(st))
                await pg.click('#lrnB [data-l="map"]'); await pg.wait_for_timeout(400)
                if await pg.query_selector("#lrnB [data-lrecap]"): bad.append(vp + " recap card still there")
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("learn_links:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
