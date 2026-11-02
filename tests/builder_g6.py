#!/usr/bin/env python3
"""T11 G6 package 2: builder Back steps (T5), Identity and Appearance to the sheet (B6), picture cards (B4), choices left bar (B5),
progress line (T12). 390x844 and 1250x850 with Yudhi. Exit 1 on failure."""
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
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible")
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
            await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(900)
            cur = lambda: pg.evaluate("()=>document.querySelector('#steps .on').getAttribute('data-step')")
            await pg.click('#steps [data-step="species"]'); await pg.wait_for_timeout(600)
            if await pg.evaluate("()=>!!document.querySelector('#nameRow')&&getComputedStyle(document.querySelector('#nameRow')).display!=='none'"): bad.append(vp + " Name shows outside Home")
            await pg.go_back(); await pg.wait_for_timeout(700); s1 = await cur()
            if s1 != "bg": bad.append(vp + " Back from species went to " + str(s1))
            n = await pg.evaluate("()=>document.querySelectorAll('#body .acc.todo').length"); bar = await pg.evaluate("()=>{ var b=document.querySelector('#body .bmiss'); return b?b.textContent:''; }")
            if n and str(n) not in bar: bad.append(vp + " choices left bar: %s (%d open)" % (bar, n))
            pr = await pg.evaluate("()=>{ var p=document.getElementById('bprog'); return p?+p.getAttribute('aria-valuenow'):-1; }")
            if not (0 <= pr <= 100): bad.append(vp + " progress line %s" % pr)
            await pg.click('#steps [data-step="species"]'); await pg.wait_for_timeout(500)
            await pg.evaluate("()=>{ var b=[...document.querySelectorAll('#body button')].find(x=>/Change Species/.test(x.textContent)); if(b) b.click(); }"); await pg.wait_for_timeout(700)
            cards = await pg.evaluate("()=>document.querySelectorAll('#body .pickrow.pcard').length")
            if cards < 8: bad.append(vp + " species picture cards: %d" % cards)
            await pg.click('#steps [data-step="next"]'); await pg.wait_for_timeout(700)
            await pg.click('#bld [data-align="Chaotic Good"]'); await pg.fill('#bld [data-ident="ch_hair"]', "Black"); await pg.fill('#bld [data-ident="ideal"]', "Freedom"); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(2500)
            for _ in range(3):
                y = await pg.query_selector(".ask [data-yes], .exp [data-yes]")
                if not y: break
                await y.click(); await pg.wait_for_timeout(800)
            st = await pg.evaluate("()=>{ var s=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}'); return {a:s.align, h:(s.notes||{}).ch_hair, i:(s.notes||{}).ideal, bld:!document.getElementById('bld').hidden}; }")
            if st["a"] != "Chaotic Good" or st["h"] != "Black" or st["i"] != "Freedom" or st["bld"]: bad.append(vp + " identity after Apply " + json.dumps(st))
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("builder_g6:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
