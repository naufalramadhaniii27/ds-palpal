#!/usr/bin/env python3
"""T11 Learn F3: Forge Your Hero. Pick Rogue and Halfling, name Pip, Forge: a new character is made with a level 1 Quick Build and the
builder opens on What's Next. Apply gives a sheet named Pip. Yudhi stays in the roster. Surprise me picks both. 390x844 and 1250x850."""
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
            await pg.wait_for_selector("#hlearnB [data-hlearn]", state="visible", timeout=30000); await pg.click("#hlearnB [data-hlearn]"); await pg.wait_for_selector("#learn", state="visible")
            await pg.evaluate("()=>[...document.querySelectorAll('#lrnB [data-lgo]')].find(b=>/Forge/.test(b.textContent)).click()"); await pg.wait_for_timeout(400)
            await pg.click('#lrnB [data-l="forge"]'); await pg.wait_for_timeout(300)
            if "first" not in await pg.evaluate("()=>document.getElementById('lrnSay').textContent"): bad.append(vp + " no hint without picks")
            await pg.click('#lrnB [data-l="surprise"]'); await pg.wait_for_timeout(300)
            s = await pg.evaluate("()=>window.__learnState().s")
            if not (s.get("cls") and s.get("sp")): bad.append(vp + " Surprise me " + json.dumps(s))
            await pg.click('#lrnB [data-lfcls="Rogue"]'); await pg.click('#lrnB [data-lfsp="Halfling"]'); await pg.fill("#lrnFn", "Pip")
            async with pg.expect_navigation(timeout=30000): await pg.click('#lrnB [data-l="forge"]')
            await pg.wait_for_function("()=>{ var b=document.getElementById('bld'); return b&&!b.hidden&&document.querySelector('#steps .on'); }", timeout=40000); await pg.wait_for_timeout(1500)
            st = await pg.evaluate("()=>({step:document.querySelector('#steps .on').getAttribute('data-step'), B:JSON.parse(localStorage.getItem('phb24-builder-v1')||'{}')})")
            Bd = st["B"]
            if st["step"] != "next" or Bd.get("cls") != "Rogue" or Bd.get("species") != "Halfling" or Bd.get("name") != "Pip" or Bd.get("level") != 1: bad.append(vp + " forged build %s %s %s %s %s" % (st["step"], Bd.get("cls"), Bd.get("species"), Bd.get("name"), Bd.get("level")))
            await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(2500)
            for _ in range(3):
                y = await pg.query_selector(".ask [data-yes], .exp [data-yes]")
                if not y: break
                await y.click(); await pg.wait_for_timeout(800)
            sh = await pg.evaluate("()=>{ var C=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}'), r=JSON.parse(localStorage.getItem('cs-roster-v1')||'{}'); return {name:C.name, cls:C.cls, n:Object.keys(r.chars||{}).length, names:Object.values(r.chars||{}).map(c=>c.name)}; }")
            if sh["name"] != "Pip" or sh["cls"] != "Rogue" or not any("Yudhi" in (x or "") for x in sh["names"]): bad.append(vp + " after Apply " + json.dumps(sh))
            done = await pg.evaluate("()=>!!(JSON.parse(localStorage.getItem('cs-learn-v1')||'{}').done||{}).forge")
            if not done: bad.append(vp + " forge stop not marked done")
            print(vp, st["step"], Bd.get("cls"), Bd.get("species"), Bd.get("name"), "->", json.dumps(sh))
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("learn_forge:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
