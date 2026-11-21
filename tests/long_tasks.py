#!/usr/bin/env python3
"""M12: while Find a build runs: at most two long tasks (over 50 ms, each under 100 ms; before: 3 and 9, up to 102 ms), 390x844 and 1250x850 with Yudhi, CPU x1."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; SH = A[A.index("--shots") + 1] if "--shots" in A else None; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
LT = []
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"); await pg.goto(url)
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(800)
            await pg.evaluate("()=>window.__rbOpen()"); await pg.wait_for_selector("#sheet [data-rbgo]", state="visible", timeout=30000)
            await pg.fill('#sheet [data-rbg="hp"]', "1")
            await pg.evaluate("()=>{ window.__lt=[]; new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(Math.round(e.duration)))).observe({type:'longtask',buffered:false}); window.__loaf=[]; try{ new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__loaf.push([Math.round(e.duration),Math.round(e.blockingDuration),(e.scripts||[]).map(x=>(x.sourceFunctionName||x.invoker||'')+'@'+x.sourceCharPosition+' '+Math.round(x.duration)).join(' | ')]))).observe({type:'long-animation-frame'}); }catch(e){} }")
            await pg.click("#sheet [data-rbgo]"); await pg.wait_for_function("()=>{ var o=document.querySelector('#sheet .rb-out'); return o&&!o.querySelector('.rb-prog'); }", timeout=120000)
            lt1 = await pg.evaluate("()=>window.__lt.slice()"); print(vp, "Find a build long tasks:", lt1, await pg.evaluate("()=>window.__loaf.filter(x=>x[0]>50)"))
            if len(lt1) > 2 or any(x > 100 for x in lt1): bad.append(vp + " Find a build had long tasks " + str(lt1))  # one or two are left: __bldOpts (applyPacks) runs in the click, 40 to 80 ms; it is builder logic, listed in reports/skor-9-8.md
            ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1")
            if ov: bad.append(vp + " page scrolls sideways")
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("long_tasks:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
