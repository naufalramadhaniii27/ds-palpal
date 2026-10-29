#!/usr/bin/env python3
"""T11 N28 layered board, 390x844 and 1250x850 with Yudhi. A fight with four Goblin Warriors on the forest board: the board drawn with the
spare layer is pixel for pixel the same as the board drawn whole (noLayer), in move mode and after a move, and 60 draws take less time."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def main():
    srv, url = serve(); bad = []; out = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            await pg.wait_for_function("()=>typeof window.__tgOpen==='function'", timeout=40000); await pg.wait_for_selector("[data-hview]", state="attached")
            await pg.click("#htgB [data-tgopen]"); await pg.wait_for_selector("#tg .tg-foe", timeout=30000)
            await pg.fill("[data-tgq]", "Goblin Warrior"); await pg.wait_for_timeout(200)
            for i in range(4): await pg.click('[data-tgf="goblin-warrior"][data-d="1"]')
            await pg.click('[data-tg="enter"]'); await pg.wait_for_selector("#tgCv"); await pg.wait_for_timeout(400)
            for step in ("start", "after"):
                a = await pg.evaluate("()=>{ window.__tgDrawStats(true,false); return window.__tgDraw(); }")
                c = await pg.evaluate("()=>{ window.__tgDrawStats(true,true); var u=window.__tgDraw(); window.__tgDrawStats(true,false); return u; }")
                if a != c or len(a) < 1000: bad.append(vp + " %s: layered board differs from the whole board" % step)
                if step == "start":
                    for k in range(6):
                        if await pg.evaluate("()=>window.TGE.now(window.__tgState().st)==='pc'"): break
                        await pg.click('[data-tg="end"]')
                    mv = await pg.query_selector('[data-tg="move"]')
                    if mv: await mv.click(); await pg.wait_for_timeout(150)
            t = {}
            for nl in (True, False):
                t[nl] = await pg.evaluate("nl=>{ window.__tgDrawStats(true,nl); for(var i=0;i<60;i++) window.__tgDraw.call(null); var s=window.__tgDrawStats(true,false); return s.ms; }", nl)
            out.append("%s: 60 draws whole board %.1f ms, layered %.1f ms" % (vp, t[True], t[False]))
            if t[False] > t[True]: bad.append(vp + " layered draw is not faster")
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in out: print(x)
    for x in bad: print("FAIL", x)
    print("tg_layer:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
