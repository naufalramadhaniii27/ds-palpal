#!/usr/bin/env python3
"""T11 N22 build duel, 390x844 and 1250x850 with Yudhi. Find a build, then Test in fights on the first result: the current build and
the result each fight 100 times against the same group, picked so the current build wins it about half the time. Same seeds give the same numbers on a second press."""
import asyncio, json, os, re, sys
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
            await pg.evaluate("()=>window.__rbOpen()"); await pg.wait_for_selector("#sheet [data-rbgo]", state="visible", timeout=30000)
            await pg.fill('#sheet [data-rbg="hp"]', "1")
            await pg.click("#sheet [data-rbgo]"); await pg.wait_for_function("()=>{ var o=document.querySelector('#sheet .rb-out'); return o&&!o.querySelector('.rb-prog'); }", timeout=120000)
            n = await pg.evaluate("()=>document.querySelectorAll('#sheet [data-rbduel]').length")
            if n < 1: bad.append(vp + " no Test in fights button"); await ctx.close(); continue
            texts = []
            for k in range(2):
                await pg.click("#sheet [data-rbduel='0']")
                await pg.wait_for_function("()=>{ var o=document.querySelector('#sheet .rb-c .rb-duel'); return o&&/^Won /.test(o.textContent); }", timeout=180000)
                texts.append(await pg.evaluate("()=>document.querySelector('#sheet .rb-c .rb-duel').textContent"))
            print(vp, texts[0])
            if texts[0] != texts[1]: bad.append(vp + " not the same twice")
            if not re.search(r"Won \d+ of 100 fights\. Your current build: \d+.* (Low|Moderate|High) at level \d+", texts[0]): bad.append(vp + " text " + texts[0])
            ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1")
            if ov: bad.append(vp + " page scrolls sideways")
            if SH: await (await pg.query_selector("#sheet .rb-c")).screenshot(path=os.path.join(SH, "rbduel-%s.png" % vp))
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("rb_duel:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
