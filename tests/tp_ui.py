#!/usr/bin/env python3
"""Third party books in the Sources step: the group shows, books are off by default, All 2024 does not turn them on, a tap turns one on.
  python3 tests/tp_ui.py [OUTDIR]   Screenshots at 390x844 and 1250x850 go to OUTDIR (default tests/out/tp)."""
import asyncio, json, os, sys
sys.argv = sys.argv[:1] + sys.argv[1:]
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, "tp_sources.py")).read().split("\nLIST = ")[0].split("res = []")[0])
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
async def main():
    srv, url = serve(); errs = []
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            tag = "%dx%d" % vp
            ctx = await br.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(FIX))
            await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
            await pg.wait_for_function("()=>!!window.__bldTestGo&&!!window.WX", timeout=60000)
            await pg.evaluate("()=>{ window.__bldOpen&&window.__bldOpen(); }"); await pg.wait_for_timeout(800)
            await pg.evaluate("()=>window.__bldTestGo('home')"); await pg.wait_for_timeout(800)
            t = await pg.evaluate("()=>{var b=document.getElementById('bld'); return b?b.innerText:''}")
            check(tag + " Third Party Books group listed", "third party books" in t.lower(), t.lower()[t.lower().find("sources"):][:600])
            await pg.evaluate("()=>{ var d=[].slice.call(document.querySelectorAll('#bld details.srcg')).filter(function(x){return /third party/i.test(x.innerText)})[0]; if(d){ d.open=true; d.scrollIntoView({block:'center'}); } }")
            await pg.wait_for_timeout(300)
            t = await pg.evaluate("()=>{var b=document.getElementById('bld'); return b?b.innerText:''}")
            check(tag + " book shows publisher and is described", "darrington press" in t.lower() and "tal'dorei campaign setting reborn" in t.lower())
            on0 = await pg.evaluate("()=>{var b=window.__bldTestB(); return !!(b.src&&b.src.tdcsr)}")
            check(tag + " book is off by default", on0 is False)
            await pg.screenshot(path=os.path.join(OUT, "sources-%s.png" % tag))
            # All 2024 / All must not switch it on
            clicked = await pg.evaluate("()=>{ var bs=[].slice.call(document.querySelectorAll('#bld [data-srcall]')).filter(function(b){return b.getAttribute('data-srcall')!=='none'}); bs.forEach(function(b){b.click()}); return bs.length }")
            await pg.wait_for_timeout(400)
            on1 = await pg.evaluate("()=>{var b=window.__bldTestB(); return !!(b.src&&b.src.tdcsr)}")
            check(tag + " bulk All buttons leave it off (%d pressed)" % clicked, on1 is False)
            # book search: filters rows, opens the group, shows a no-match note, clears back
            await pg.evaluate("()=>window.__bldTestGo('home')"); await pg.wait_for_timeout(500)
            await pg.fill("#srcfq", "Tal")
            await pg.wait_for_timeout(400)
            vis = await pg.evaluate("()=>{var r=[].slice.call(document.querySelectorAll('#bld .srcw')).filter(function(x){return x.style.display!=='none'&&x.offsetParent});return {n:r.length,t:r.slice(0,6).map(function(x){return x.innerText.split('\\n')[0]})}}")
            check(tag + " book search narrows the list", 0 < vis["n"] < 40 and any("tal" in t.lower() for t in vis["t"]), str(vis))
            await pg.screenshot(path=os.path.join(OUT, "srcsearch-%s.png" % tag))
            await pg.fill("#srcfq", "zzzqqq"); await pg.wait_for_timeout(300)
            no = await pg.evaluate("()=>!!document.getElementById('srcfno')")
            check(tag + " book search shows no-match note", no)
            await pg.fill("#srcfq", ""); await pg.wait_for_timeout(300)
            back = await pg.evaluate("()=>[].slice.call(document.querySelectorAll('#bld .srcw')).filter(function(x){return x.style.display==='none'}).length")
            check(tag + " clearing the search shows every book again", back == 0, str(back))
            await ctx.close()
        await br.close()
    srv.shutdown(); check("no page errors", not errs, str(errs[:3]))
    print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(0 if all(res) else 1)
asyncio.run(main())
