#!/usr/bin/env python3
"""T11 N25 self-healing storage, 390x844 and 1250x850 with Yudhi. (a) The sheet key is cut short: the recovery screen offers the newest
readable copy, Use This Copy puts it back and keeps the broken text in cs-heal-v1. (b) Only the play state is broken: only it is replaced.
(c) No readable copy anywhere: the screen says so and offers no button."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; SH = A[A.index("--shots") + 1] if "--shots" in A else None; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
CK = "yudhi-kelapa-build-v3"; SK = "yudhi-kelapa-sheet-v1"
async def fresh(pg, url):
    await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
    await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(2500)
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h)
            for case in "abc":
                ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await fresh(pg, url)
                good = await pg.evaluate("k=>localStorage.getItem(k)", CK); goodS = await pg.evaluate("k=>localStorage.getItem(k)", SK)
                await pg.evaluate("""([c,ck,sk])=>{ if(c!=='b') localStorage.setItem(ck,'{"v":3,"abil'); if(c==='b') localStorage.setItem(sk,'[1,2'); if(c==='c'){ localStorage.removeItem('cs-roster-v1'); localStorage.removeItem('cs-snap-v1'); } }""", [case, CK, SK])
                await pg.reload(); await pg.wait_for_selector("#recov", state="visible", timeout=30000)
                has = await pg.evaluate("()=>!!document.querySelector('#recov [data-rec=heal]')")
                if SH: await pg.screenshot(path=os.path.join(SH, "heal-%s-%s.png" % (case, vp)))
                if case == "c":
                    t = await pg.evaluate("()=>document.getElementById('recov').textContent")
                    if has or "No readable copy" not in t: bad.append(vp + " c: " + t[:200])
                else:
                    if not has: bad.append(vp + " %s: no Use This Copy" % case); await ctx.close(); continue
                    await pg.click("#recov [data-rec=heal]"); await pg.click(".ask [data-yes]")
                    await pg.wait_for_load_state("load"); await pg.wait_for_timeout(2500)
                    st = await pg.evaluate("""([ck,sk])=>({rec:!!document.getElementById('recov'), c:localStorage.getItem(ck), s:localStorage.getItem(sk), heal:JSON.parse(localStorage.getItem('cs-heal-v1')||'null')})""", [CK, SK])
                    if st["rec"]: bad.append(vp + " %s: recovery screen still open" % case)
                    try: c = json.loads(st["c"])
                    except Exception: c = None
                    if not c or c.get("v") != 3 or c.get("name") != json.loads(good).get("name"): bad.append(vp + " %s: sheet not back" % case)
                    try: s = json.loads(st["s"])
                    except Exception: s = None
                    if not isinstance(s, dict): bad.append(vp + " %s: play state not an object" % case)
                    if not st["heal"] or (case == "a" and st["heal"]["keys"].get(CK) != '{"v":3,"abil') or (case == "b" and st["heal"]["keys"].get(SK) != '[1,2'): bad.append(vp + " %s: broken text not kept" % case)
                    if case == "b" and json.loads(st["c"]) != json.loads(good) and json.loads(st["c"]).get("name") != json.loads(good).get("name"): bad.append(vp + " b: sheet changed")
                for e in errs: bad.append(vp + " " + case + " " + e[:200])
                await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("self_heal:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
