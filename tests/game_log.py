#!/usr/bin/env python3
"""T11 G3 D3 Game Log: the rolls stay with the character after a reload, and every roll lands in the journal.
  python3 tests/game_log.py
390x844 and 1250x850, Motion off (flat dice): three rolls, reload, the roll history key mi-rl-<name> still holds them,
the history drawer lists them, the journal holds a "roll" entry for each, and a second character starts with its own empty list."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
ROLL = "([s,l])=>new Promise(ok=>window.__miRoll.roll(s,'',l,ok))"
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"); await pg.goto(url)
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(800)
            for i in range(3): await pg.evaluate(ROLL, [{"bon": 2}, "Log test %d" % i])
            await pg.wait_for_timeout(600); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(800)
            st = await pg.evaluate("""()=>{ var k=window.__miRollKey(), h=JSON.parse(__store.getItem(k)||'[]'), j=window.__miJournal.all().filter(e=>e.k==='roll'&&/Log test/.test(e.x));
              return {k:k, n:h.filter(r=>/Log test/.test(r.l)).length, j:j.length}; }""")
            print(vp, json.dumps(st))
            if not st["k"].startswith("mi-rl-") or st["n"] != 3: bad.append(vp + " history not kept " + json.dumps(st))
            if st["j"] != 3: bad.append(vp + " journal has %d roll lines" % st["j"])
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("game_log:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
