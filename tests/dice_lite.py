#!/usr/bin/env python3
"""T11 N27 dice without a physics engine, 390x844 and 1250x850, under the real CSP (no 'wasm-unsafe-eval').
1. 1,000 throws per kind (d4, d6, d8, d10, d12, d20): the face on top of the final turn is the decided value, every time.
2. A roll of d4, d6, d8, d10, d12, d20 and d100 with given values answers those values, the canvas shows dice, setup is quick.
3. 24 d6 (ability scores) answer 24 values from 1 to 6.
4. Nothing is fetched from vendor/dice and no CSP violation or page error appears."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; SH = A[A.index("--shots") + 1] if "--shots" in A else None; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []; reqs = []
            pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("request", lambda r: reqs.append(r.url) if "vendor/dice" in r.url else None)
            pg.on("console", lambda m: errs.append(m.text) if "Content Security Policy" in m.text else None)
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','full');}", FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(500)
            await pg.evaluate("()=>document.addEventListener('securitypolicyviolation',function(e){ (window.__csp=window.__csp||[]).push(e.violatedDirective+' '+e.blockedURI); })")
            miss = await pg.evaluate("()=>{ var bad=[]; [4,6,8,10,12,20].forEach(k=>{ for(var i=0;i<1000;i++){ var v=1+Math.floor(Math.random()*k), t=window.__dice3d.topOf(k,v); if(t!==v){ bad.push(k+':'+v+'->'+t); break; } } }); return bad; }")
            if miss: bad.append(vp + " top face differs " + json.dumps(miss))
            r = await pg.evaluate("async()=>{ var v=await window.__dice3d.roll([4,6,8,10,12,20,100],[3,5,7,10,11,20,37]); var c=document.querySelector('#diceTray canvas'), x=document.createElement('canvas'); x.width=c.width; x.height=c.height; var g=x.getContext('2d'); g.drawImage(c,0,0); var d=g.getImageData(0,0,x.width,x.height).data, n=0; for(var i=3;i<d.length;i+=4) if(d[i]>200) n++; return {v:v, px:n, st:window.__dice3d.stats()}; }")
            print(vp, "given", r["v"], "dice pixels", r["px"], "setup", r["st"].get("setup"), "ms")
            if r["v"] != [3, 5, 7, 10, 11, 20, 37]: bad.append(vp + " given values not kept " + json.dumps(r["v"]))
            if r["px"] < 2000: bad.append(vp + " no dice on the canvas")
            if (r["st"].get("setup") or 0) > 1500: bad.append(vp + " setup slow %s ms" % r["st"].get("setup"))
            if SH: await pg.screenshot(path=os.path.join(SH, "dice-lite-%s.png" % vp))
            v24 = await pg.evaluate("()=>{ var L=[]; for(var i=0;i<24;i++) L.push(6); return window.__dice3d.roll(L); }")
            if not v24 or len(v24) != 24 or any(x < 1 or x > 6 for x in v24): bad.append(vp + " 24 d6 " + json.dumps(v24))
            csp = await pg.evaluate("()=>window.__csp||[]")
            for x in errs + csp: bad.append(vp + " " + x[:200])
            if reqs: bad.append(vp + " fetched " + reqs[0])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("dice_lite:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
