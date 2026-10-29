#!/usr/bin/env python3
"""T11 N29 leaner Find a build, 390x844 and 1250x850. Each goal set is searched one by one (the old way) and in one batch: the numbers
of every try must be the same (one fingerprint over all tries), the shown results the same, and the batch faster. Yudhi (a new character has no class yet, so Find a build does not open). After the search the open character's builder tables are back (the builder still lists the same species)."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
GOALS = [{"ac": "18", "sk": ("Stealth", "6")}, {"hp": "1"}, {"init": "4", "sv": ("CON", "6")}]
async def search(pg, g, slow):
    await pg.evaluate("v=>window.__rbSlow(v)", slow)
    await pg.evaluate("()=>window.__rbOpen()"); await pg.wait_for_selector("#sheet [data-rbgo]", state="visible", timeout=30000)
    for k in ("ac", "hp", "init"):
        if k in g: await pg.fill('#sheet [data-rbg="%s"]' % k, g[k])
    if "sk" in g: await pg.select_option('#sheet [data-rbs="sk"]', g["sk"][0]); await pg.fill('#sheet [data-rbg="sk"]', g["sk"][1])
    if "sv" in g: await pg.select_option('#sheet [data-rbs="sv"]', g["sv"][0]); await pg.fill('#sheet [data-rbg="sv"]', g["sv"][1])
    await pg.click("#sheet [data-rbgo]"); await pg.wait_for_function("()=>{ var o=document.querySelector('#sheet .rb-out'); return o&&!o.querySelector('.rb-prog'); }", timeout=180000)
    st = await pg.evaluate("()=>window.__rbStats()"); txt = await pg.evaluate("()=>[...document.querySelectorAll('#sheet .rb-c')].map(x=>x.textContent).join('|')")
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
    return st, txt
async def main():
    srv, url = serve(); bad = []; times = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            for who in ("yudhi",):
                vp = "%dx%d %s" % (w, h, who); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(url)
                if who == "yudhi":
                    await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
                    await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]")
                else:
                    await pg.evaluate("()=>{localStorage.clear(); localStorage.setItem('mi-fx','off');}"); await pg.reload()
                    await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]")
                await pg.wait_for_selector("#dmgBtn", state="visible", timeout=30000); await pg.wait_for_timeout(800)
                sp0 = None
                for g in (GOALS if w == 1250 else GOALS[:1]):
                    s1, t1 = await search(pg, g, True); s2, t2 = await search(pg, g, False)
                    if sp0 is None: sp0 = await pg.evaluate("()=>window.__bldOpts().species.join(',')")
                    if s1["h"] != s2["h"] or s1["n"] != s2["n"]: bad.append(vp + " %s: tries differ %s %s" % (json.dumps(g), s1, s2))
                    if t1 != t2: bad.append(vp + " %s: shown results differ" % json.dumps(g))
                    times.append((vp, json.dumps(g), s1["t"], s2["t"]))
                    if s2["t"] > s1["t"] * 0.85: bad.append(vp + " %s: not faster %d ms vs %d ms" % (json.dumps(g), s2["t"], s1["t"]))
                sp1 = await pg.evaluate("()=>window.__bldOpts().species.join(',')")
                if sp0 != sp1: bad.append(vp + " builder species list changed after the search")
                for e in errs: bad.append(vp + " " + e[:200])
                await ctx.close()
        await b.close()
    srv.shutdown()
    for t in times: print("%s %s: one by one %d ms, batch %d ms" % t)
    for x in bad: print("FAIL", x)
    print("rb_fast:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
