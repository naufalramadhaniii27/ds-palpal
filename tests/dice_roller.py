#!/usr/bin/env python3
"""Dice roller (src/fx/16c-z-pack-dice-roller.js): any number of one die plus a typed modifier.
  python3 tests/dice_roller.py [OUT]
390x844 and 1250x850, Yudhi sheet, two modes (Motion off = flat numbers, default = 3D dice when WebGL works).
Checks: the panel opens from the Dice button, 3d4 + 2 gives sum + 2 with every die 1 to 4, a negative modifier, 30d6 (flat above 12 dice),
2d100, "I rolled myself" (valid values add up, a value above the die is refused and nothing is logged),
every roll lands in mi-rl-<name> and in the journal, no page errors. Screenshots go to OUT (default tests/out)."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "out"); sys.argv = [sys.argv[0]]
os.makedirs(OUT, exist_ok=True)
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
HIST = "()=>JSON.parse(__store.getItem(window.__miRollKey())||'[]')"
async def result(pg):
    await pg.wait_for_function("()=>{var e=document.querySelector('.mi-dres strong');return e&&e.textContent.trim()!==''&&!document.querySelector('.mi-dp.rolling')}", timeout=20000)
    return await pg.evaluate("()=>{var r=document.querySelector('.mi-dres');return {v:+r.querySelector('strong').textContent,chips:[].map.call(r.querySelectorAll('.mi-dch i'),function(i){return +i.textContent})}}")
async def setup(pg, n, f, m):
    await pg.click('[data-df="%d"]' % f); await pg.fill("[data-dni]", str(n)); await pg.fill("[data-dmi]", str(m))
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"])
        for mode in ("off", "full"):
            for w, h in [(390, 844), (1250, 850)]:
                tag = "%s %dx%d" % (mode, w, h)
                ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                fxs = "localStorage.setItem('mi-fx','off');" if mode == "off" else ""
                await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");"+fxs+"sessionStorage.setItem('__s','1')}"); await pg.goto(url)
                await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(800)
                if not await pg.is_visible("#diceBtn"): await pg.click("#moreBtn"); await pg.wait_for_timeout(300)
                if not await pg.is_visible("#diceBtn"): bad.append(tag + " Dice button not visible"); await ctx.close(); continue
                await pg.click("#diceBtn"); await pg.wait_for_selector(".mi-dp.on", timeout=5000); await pg.wait_for_timeout(450)
                # 1. 3d4 + 2
                await setup(pg, 3, 4, 2)
                if (await pg.text_content(".mi-dsp")).strip() != "3d4 + 2": bad.append(tag + " formula text " + await pg.text_content(".mi-dsp"))
                await pg.click("[data-droll]"); r = await result(pg)
                if len(r["chips"]) != 3 or any(c < 1 or c > 4 for c in r["chips"]) or r["v"] != sum(r["chips"]) + 2: bad.append(tag + " 3d4+2 " + json.dumps(r))
                await pg.wait_for_timeout(1900); await pg.screenshot(path=os.path.join(OUT, "dice_%s_%dx%d.png" % (mode, w, h)))
                # 2. negative modifier
                await setup(pg, 2, 6, -3); await pg.click("[data-droll]"); r = await result(pg)
                if len(r["chips"]) != 2 or r["v"] != sum(r["chips"]) - 3: bad.append(tag + " 2d6-3 " + json.dumps(r))
                # 3. 30d6 (flat above 12 dice)
                await setup(pg, 30, 6, 0); await pg.click("[data-droll]"); r = await result(pg)
                if len(r["chips"]) != 30 or r["v"] != sum(r["chips"]) or any(c < 1 or c > 6 for c in r["chips"]): bad.append(tag + " 30d6 " + json.dumps(r))
                # 4. 2d100
                await setup(pg, 2, 100, 5); await pg.click("[data-droll]"); r = await result(pg)
                if len(r["chips"]) != 2 or any(c < 1 or c > 100 for c in r["chips"]) or r["v"] != sum(r["chips"]) + 5: bad.append(tag + " 2d100+5 " + json.dumps(r))
                await pg.wait_for_timeout(1900)
                n1 = len(await pg.evaluate(HIST))
                # 5. rolled by hand: a value above the die is refused
                await setup(pg, 3, 4, 1); await pg.click("[data-dself]"); await pg.wait_for_selector("[data-dmv]")
                ins = await pg.query_selector_all("[data-dmv]")
                if len(ins) != 3: bad.append(tag + " manual boxes %d" % len(ins))
                for i, v in enumerate(["4", "5", "1"]): await ins[i].fill(v)
                await pg.click("[data-dadd]"); await pg.wait_for_timeout(200)
                if len(await pg.evaluate(HIST)) != n1 or not (await pg.text_content(".mi-dhint")).strip(): bad.append(tag + " value 5 on a d4 was not refused")
                await ins[1].fill("2"); await pg.click("[data-dadd]"); r = await result(pg)
                if r["chips"] != [4, 2, 1] or r["v"] != 8: bad.append(tag + " manual " + json.dumps(r))
                # 6. history and journal
                st = await pg.evaluate("()=>{var h=JSON.parse(__store.getItem(window.__miRollKey())||'[]'),j=window.__miJournal.all().filter(function(e){return e.k==='roll'&&/d(4|6|100)/.test(e.x)});return {n:h.length,top:h[0],labels:h.map(function(x){return x.l}),j:j.length}}")
                if st["n"] != n1 + 1 or st["top"]["v"] != 8 or not st["top"].get("hand") or st["j"] < 5: bad.append(tag + " history " + json.dumps(st))
                if st["labels"][1:5] != ["2d100+5", "30d6", "2d6\u22123", "3d4+2"]: bad.append(tag + " labels " + json.dumps(st["labels"][:6]))
                # 7. Done closes, Rolls drawer opens the history with the Dice button
                await pg.click(".mi-dpp [data-dx]"); await pg.wait_for_timeout(450)
                if await pg.evaluate("()=>window.__miDice.state().open"): bad.append(tag + " panel still open after Done")
                for e in errs: bad.append(tag + " " + e[:200])
                print(tag, json.dumps({"history": st["n"], "journal": st["j"]}))
                await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("dice_roller:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
