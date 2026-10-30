#!/usr/bin/env python3
"""T11 N23 honest dice, 390x844 and 1250x850 with Yudhi, motion on. In a Training Ground fight the hero attacks with a ranged weapon:
the 3D dice land showing the d20 the engine rolled (the same numbers as the log), and the board still answers."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; SH = A[A.index("--shots") + 1] if "--shots" in A else None; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','full');}", FIX); await pg.reload()
            await pg.wait_for_function("()=>typeof window.__tgOpen==='function'", timeout=40000); await pg.wait_for_selector("[data-hview]", state="attached")
            await pg.click("#htgB [data-tgopen]"); await pg.wait_for_selector("#tg .tg-foe", timeout=30000)
            await pg.fill("[data-tgq]", "Goblin Warrior"); await pg.wait_for_timeout(200)
            for i in range(2): await pg.click('[data-tgf="goblin-warrior"][data-d="1"]')
            await pg.click('[data-tg="enter"]'); await pg.wait_for_selector("#tgCv")
            for k in range(8):
                if await pg.evaluate("()=>window.TGE.now(window.__tgState().st)==='pc'"): break
                await pg.click('[data-tg="end"]'); await pg.wait_for_timeout(100)
            idx = await pg.evaluate("()=>{ var s=window.__tgState().st, u=s.units.pc, T=window.TGE; return u.acts.findIndex(a=>a.k==='atk'&&a.rng&&Object.values(s.units).some(f=>f.side==='foe'&&!f.dead&&T.udist(u,f)<=a.rng[1])); }")
            if idx < 0: bad.append(vp + " no ranged attack in range"); await ctx.close(); continue
            await pg.wait_for_function("()=>!window.__tgState().st||true")
            await pg.click('[data-tga="%d"]' % idx); await pg.wait_for_selector("#tg .tg-lens .tg-lr", timeout=5000); await pg.click("#tg .tg-lr")
            await pg.wait_for_function("()=>window.__tgState().dice", timeout=20000)
            d = await pg.evaluate("()=>{ var s=window.__tgState(), l=s.st.log.filter(e=>e.t==='atk'&&e.u==='pc').pop(); return {dice:s.dice, log:l&&l.roll}; }")
            print(vp, d)
            if d["dice"]["got"] != d["log"] or d["dice"]["want"] != d["log"]: bad.append(vp + " dice differ from the log " + json.dumps(d))
            if SH: await pg.screenshot(path=os.path.join(SH, "tg-dice-%s.png" % vp))
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("tg_dice:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
