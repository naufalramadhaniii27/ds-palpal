#!/usr/bin/env python3
"""T11 N20, N21, N26 in the Training Ground, 390x844 and 1250x850 with Yudhi.
N21: the size bar shows the 2024 budget for level 4 (Low 250, Moderate 375, High 500); four Goblin Warriors (200 XP) are Under Low,
Make it Moderate changes the count to 7 (350 XP, the closest to 375 without going over 500).
N20: choosing an attack lists every target in reach with the chance to hit, average damage and chance to drop, the same as TGE.odds.
N26: after a few turns, Share this fight gives a #fight= link; another browser opens it as a replay whose last step equals the fight."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; SH = A[A.index("--shots") + 1] if "--shots" in A else None; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def setup(pg, url):
    await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"); await pg.goto(url)
    await pg.wait_for_function("()=>typeof window.__tgOpen==='function'", timeout=40000); await pg.wait_for_selector("[data-hview]", state="attached")
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block", permissions=["clipboard-read", "clipboard-write"]); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await setup(pg, url); await pg.click("#htgB [data-tgopen]"); await pg.wait_for_selector("#tg .tg-foe", timeout=30000)
            await pg.fill("[data-tgq]", "Goblin Warrior"); await pg.wait_for_timeout(200)
            for i in range(4): await pg.click('[data-tgf="goblin-warrior"][data-d="1"]')
            t = await pg.evaluate("()=>document.querySelector('#tg .tg-size').textContent")
            if "Under Low" not in t or "Low 250, Moderate 375, High 500" not in t: bad.append(vp + " size " + t[:120])
            await pg.click('[data-tg="balance"]'); await pg.wait_for_timeout(200)
            n = await pg.evaluate("()=>window.__tgState().foes['goblin-warrior']")
            if n != 7: bad.append(vp + " balance gave %s" % n)
            if SH: await (await pg.query_selector("#tg .tg-size")).screenshot(path=os.path.join(SH, "tg-size-%s.png" % vp))
            await pg.fill("[data-tgq]", ""); await pg.evaluate("()=>{ var s=window.__tgState(); }")
            for i in range(5): await pg.click('[data-tgf="goblin-warrior"][data-d="-1"]')
            await pg.click('[data-tg="enter"]'); await pg.wait_for_selector("#tgCv")
            # move the goblins next to the hero is not needed: Yudhi has a Javelin and a Shortbow. Find a turn of the hero
            for k in range(6):
                if await pg.evaluate("()=>{ var s=window.__tgState().st; return window.TGE.now(s)==='pc'; }"): break
                await pg.click('[data-tg="end"]')
            idx = await pg.evaluate("()=>{ var s=window.__tgState().st, u=s.units.pc, T=window.TGE; return u.acts.findIndex(a=>a.k==='atk'&&a.rng&&Object.values(s.units).some(f=>f.side==='foe'&&!f.dead&&T.udist(u,f)<=a.rng[1])); }")
            if idx < 0: bad.append(vp + " no ranged attack in range")
            else:
                await pg.click('[data-tga="%d"]' % idx); await pg.wait_for_selector("#tg .tg-lens .tg-lr", timeout=5000)
                rows = await pg.evaluate("()=>[...document.querySelectorAll('#tg .tg-lr')].map(r=>({id:r.getAttribute('data-tgu'),t:[...r.querySelectorAll('span')].map(x=>x.textContent)}))")
                o = await pg.evaluate("([id,i])=>{ var s=window.__tgState().st; var a=s.units.pc.acts[i]; return window.TGE.odds(s,'pc',id,a.n); }", [rows[0]["id"], idx])
                if not rows[0]["t"][0].startswith("%d%%" % round(o["hit"] * 100)): bad.append(vp + " lens %s vs %s" % (rows[0], o))
                if SH: await (await pg.query_selector("#tg .tg-p")).screenshot(path=os.path.join(SH, "tg-lens-%s.png" % vp))
                await pg.click("#tg .tg-lr"); await pg.wait_for_timeout(200)
            for k in range(3): await pg.click('[data-tg="end"]')
            await pg.evaluate("()=>{ var b=document.querySelector('[data-tgoa]'); while(b){ b.click(); b=document.querySelector('[data-tgoa]'); } }")
            h0 = await pg.evaluate("()=>window.TGE.hash(window.__tgState().st)")
            # share through the module (the over panel only shows at the end)
            await pg.evaluate("()=>document.querySelector('#tg [data-tg=\"end\"]')&&0")
            link = await pg.evaluate("""async()=>{ await new Promise(r=>setTimeout(r,50)); var b=document.createElement('button'); b.type='button'; b.setAttribute('data-tg','sharefight'); document.getElementById('tgB').appendChild(b); b.click(); await new Promise(r=>setTimeout(r,800)); return navigator.clipboard.readText(); }""")
            if "#fight=" not in link: bad.append(vp + " no fight link " + link[:60])
            else:
                ctx2 = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); p2 = await ctx2.new_page(); p2.on("pageerror", lambda e: errs.append("p2 " + str(e)))
                await setup(p2, url); await p2.goto(link)
                await p2.wait_for_function("()=>window.__tgState&&window.__tgState().rp", timeout=40000)
                r = await p2.evaluate("()=>window.__tgState().rp")
                await p2.evaluate("n=>{ var i=document.querySelector('[data-tgrp]'); i.value=n; i.dispatchEvent(new Event('input',{bubbles:true})); }", r["n"])
                h1 = await p2.evaluate("()=>window.TGE.hash(window.__tgState().st)")
                print(vp, "link", len(link), "steps", r["n"], "same", h0 == h1)
                if h0 != h1: bad.append(vp + " shared replay differs")
                if SH: await p2.screenshot(path=os.path.join(SH, "tg-replay-%s.png" % vp))
                await ctx2.close()
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("tg_n2:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
