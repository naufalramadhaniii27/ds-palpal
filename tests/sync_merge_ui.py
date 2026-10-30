#!/usr/bin/env python3
"""T11 G3 N12: the choice list for parts changed on two devices (no server needed).
  python3 tests/sync_merge_ui.py [--shots DIR]
390x844 and 1250x850: a stored merge record with two parts (Hit points and Notes: t8) opens as a sheet with one row per part.
"Use other device" on Hit points writes the other value into the open character and reloads; the list then holds one part;
"Keep this device for all" clears it. The three ways the sheet loads (Yudhi, after Apply, new) are covered by scenarios.py."""
import asyncio, json, os, sys
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
            id_ = await pg.evaluate("""()=>{ var r=JSON.parse(__store.getItem('cs-roster-v1')); __store.setItem('cs-sync-mg-'+r.active, JSON.stringify({t:Date.now(),name:'Yudhi Kelapa',parts:[{p:['S','hp'],r:'3'},{p:['S','notes','t8'],r:'"from phone"'}]})); window.__syMerge.open(r.active); return r.active; }""")
            await pg.wait_for_selector("#sheet [data-mgu]", state="visible")
            rows = await pg.evaluate("()=>[...document.querySelectorAll('#sheet .mg-row b')].map(e=>e.textContent)")
            if rows != ["Hit points", "Notes: t8"]: bad.append(vp + " rows " + json.dumps(rows))
            ov = await pg.evaluate("()=>[...document.querySelectorAll('#sheet .mg-row')].some(e=>e.scrollWidth>e.clientWidth+1)")
            if ov: bad.append(vp + " row overflows")
            if SH: await pg.screenshot(path=os.path.join(SH, "merge-%s.png" % vp))
            async with pg.expect_navigation(): await pg.click('#sheet [data-mgu="0"]')
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(600)
            st = await pg.evaluate("id=>[JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).hp, window.__syMerge.get(id)]", id_)
            if st[0] != 3 or not st[1] or len(st[1]["parts"]) != 1: bad.append(vp + " use other " + json.dumps(st))
            await pg.evaluate("id=>window.__syMerge.open(id)", id_); await pg.wait_for_selector("#sheet [data-mgx]", state="visible"); await pg.click("#sheet [data-mgx]"); await pg.wait_for_timeout(300)
            if await pg.evaluate("id=>!!window.__syMerge.get(id)", id_): bad.append(vp + " keep all did not clear")
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("sync_merge_ui:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
