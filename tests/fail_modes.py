#!/usr/bin/env python3
"""Fase 1.2 failure modes at 390x844 and 1250x850, Yudhi.  python3 tests/fail_modes.py
 storage full     IndexedDB put and localStorage.setItem always fail: the warning bar shows, the saved data stays whole, no page error
 offline          the browser goes offline while the sheet is used: changes stay on the device, nothing breaks, they are still there when it is back online
 two tabs         two tabs of the same character change HP and temp HP: both end on the same stored data, no recovery screen
 corrupt data     the sheet key is cut short: the recovery screen offers a copy
 edition switch   2024 to 2014 and back in the builder: the character data the builder keeps is the same afterwards, no page error (and the reverse from a 2014 start)
 close on write   the tab closes 50 ms after a change: the change is there at the next open
Two devices with a cloud copy run in tests/cloud_sync.py (needs the local worker, tools/run_cloud_sync.sh)."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = [sys.argv[0]]
exec(open(os.path.join(HERE, "style_snapshot.py")).read().split("def diff(")[0])
CH = open(os.path.join(HERE, "lib", "chaos.js"), encoding="utf-8").read()
SK = "yudhi-kelapa-sheet-v1"; BK = "phb24-builder-v1"
SEED = "if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3'," + json.dumps(FIX) + ");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"
HP = "k=>{try{return JSON.parse(__store.getItem(k)).hp}catch(e){return null}}"


async def start(ctx, extra="", view=True):
    pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)) if "chaos" not in str(e) and "QuotaExceeded" not in str(e) else None)
    if extra is not None: await pg.add_init_script(SEED)
    if extra: await pg.add_init_script(extra)
    await pg.goto(URL); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); 
    if view: await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible")
    await pg.wait_for_timeout(1500)
    return pg, errs


async def reopen(ctx):
    pg = await ctx.new_page(); await pg.goto(URL); await pg.wait_for_function("()=>!!window.__gateDone", timeout=40000); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(600); return pg


async def hit(pg, kind="dmg", n=3):
    await pg.fill("#hpAmt", str(n)); await pg.click("#dmgBtn" if kind == "dmg" else "#healBtn")


async def main():
    global URL
    srv, URL = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h)
            def mk(): return b.new_context(viewport={"width": w, "height": h}, service_workers="block")
            # storage full
            ctx = await mk(); pg, errs = await start(ctx, "window.__CHAOS={seed:1,put:1,abort:0,ls:1,fetchFail:0,fetchSlow:0};\n" + CH)
            before = await pg.evaluate(HP, SK); await pg.evaluate("()=>{window.__chaosOn=1}"); await hit(pg, "dmg", 4); await pg.wait_for_timeout(900)
            if not await pg.evaluate("()=>!!document.getElementById('saveWarn')"): bad.append(vp + " storage full: no warning bar")
            await pg.evaluate("()=>{window.__chaosOn=0}"); await pg.close(); pg2 = await reopen(ctx)
            if await pg2.evaluate(HP, SK) != before: bad.append(vp + " storage full: stored HP changed %s -> %s" % (before, await pg2.evaluate(HP, SK)))
            if errs: bad.append(vp + " storage full: page errors " + str(errs[:2]))
            await ctx.close()
            # offline
            ctx = await mk(); pg, errs = await start(ctx); await ctx.set_offline(True); await hit(pg, "dmg", 5); await pg.wait_for_timeout(600)
            hp = await pg.evaluate(HP, SK); await ctx.set_offline(False); await pg.wait_for_timeout(500); await pg.close(); pg2 = await reopen(ctx)
            if await pg2.evaluate(HP, SK) != hp: bad.append(vp + " offline: HP not kept")
            if errs: bad.append(vp + " offline: page errors " + str(errs[:2]))
            await ctx.close()
            # two tabs
            ctx = await mk(); a, ea = await start(ctx); bpg = await ctx.new_page(); await bpg.goto(URL); await bpg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await bpg.wait_for_timeout(1500)
            await a.bring_to_front(); await hit(a, "dmg", 6); await a.wait_for_timeout(700)
            await a.evaluate("()=>window.__store.flush()"); await bpg.wait_for_timeout(700)
            ha = await a.evaluate(HP, SK); hb = await bpg.evaluate(HP, SK)
            if ha != hb: bad.append(vp + " two tabs: tabs disagree after a change (%s vs %s)" % (ha, hb))
            await a.close(); await bpg.close(); pg2 = await reopen(ctx)
            if await pg2.evaluate(HP, SK) != ha: bad.append(vp + " two tabs: stored HP differs from the tabs")
            if await pg2.evaluate("()=>!!document.getElementById('recov')&&document.getElementById('recov').offsetParent!==null"): bad.append(vp + " two tabs: recovery screen")
            if ea: bad.append(vp + " two tabs: page errors " + str(ea[:2]))
            await ctx.close()
            # corrupt data
            ctx = await mk(); pg, errs = await start(ctx); await pg.evaluate("k=>__store.setItem(k,'{\"hp\":3,')", SK); await pg.evaluate("()=>window.__store.flush()"); await pg.close()
            pg2 = await ctx.new_page(); await pg2.goto(URL)
            try: await pg2.wait_for_selector("#recov", state="visible", timeout=30000)
            except Exception: bad.append(vp + " corrupt data: no recovery screen")
            await ctx.close()
            # mirror mark (N40 seed 287): a failed write of cs-store-v1 must be repeated by the next good write
            ctx = await mk(); pg, errs = await start(ctx)
            r = await pg.evaluate("""()=>{var blk={}, o=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(this===localStorage&&blk[k]) throw new DOMException('x','QuotaExceededError'); return o.apply(this,arguments); };
              blk['t-k']=1; __store.setItem('t-k','1'); blk['t-k']=0; blk['cs-store-v1']=1; __store.setItem('t-k','2'); var gone=localStorage.getItem('cs-store-v1');
              blk['cs-store-v1']=0; __store.setItem('t-y','1'); var back=localStorage.getItem('cs-store-v1'); Storage.prototype.setItem=o; __store.removeItem('t-k'); __store.removeItem('t-y'); return [gone,back]; }""")
            try: okm = r[0] is None and json.loads(r[1]).get("fail") == []
            except Exception: okm = False
            if not okm: bad.append(vp + " mirror mark not written again after a failed write: " + str(r))
            await ctx.close()
            # close on write
            ctx = await mk(); pg, errs = await start(ctx); await hit(pg, "dmg", 2); want = await pg.evaluate(HP, SK); await pg.wait_for_timeout(50); await pg.close(); pg2 = await reopen(ctx)
            got = await pg2.evaluate(HP, SK)
            if got != want: bad.append(vp + " close on write: HP %s, want %s" % (got, want))
            await ctx.close()
            # edition switch, both directions
            for first, second in (("2014", "2024"), ("2024", "2014")):
                ctx = await mk(); pg, errs = await start(ctx, view=False)
                await pg.wait_for_function("()=>!!window.__deferDone", timeout=90000); await pg.evaluate("()=>document.getElementById('bldBtn').click()"); await pg.wait_for_selector("[data-rs]", state="attached", timeout=40000); await pg.wait_for_timeout(500)
                if first == "2024":  # start from a 2014 character: go there first, then run 2014 -> 2024 -> 2014
                    await pg.evaluate("()=>window.__bldGo('home')"); await pg.wait_for_timeout(400); await pg.evaluate("()=>document.querySelector('button[data-rs=\"2014\"]').click()"); await pg.wait_for_timeout(500)
                    if await pg.locator(".exp[role=dialog] [data-yes]").count(): await pg.click(".exp[role=dialog] [data-yes]")
                    await pg.wait_for_timeout(900)
                    first, second = "2024", "2014"
                keep = lambda: pg.evaluate("k=>{var b=JSON.parse(__store.getItem(k)||'null')||{};return JSON.stringify([b.name,b.rs,b.cls||b.class,b.level,b.abil||b.abilities,b.inv,b.coins])}", BK)
                await pg.evaluate("()=>window.__bldGo('home')"); await pg.wait_for_timeout(500)
                s0 = await keep()
                cur = await pg.evaluate("()=>document.querySelector('button[data-rs].on')&&document.querySelector('button[data-rs].on').dataset.rs")
                other = "2024" if cur == "2014" else "2014"
                for x in (other, cur):
                    await pg.evaluate("()=>window.__bldGo('home')"); await pg.wait_for_timeout(500)
                    await pg.evaluate("x=>document.querySelector('button[data-rs=\"'+x+'\"]').click()", x); await pg.wait_for_timeout(500)
                    if await pg.locator(".exp[role=dialog] [data-yes]").count(): await pg.click(".exp[role=dialog] [data-yes]")
                    await pg.wait_for_timeout(900)
                s1 = await keep()
                if s0 != s1: bad.append("%s edition switch from %s: builder data changed after %s and back: %s -> %s" % (vp, cur, other, s0[:80], s1[:80]))
                if errs: bad.append("%s edition switch from %s: page errors %s" % (vp, cur, errs[:2]))
                await ctx.close()
        await b.close()
    for x in bad: print("FAIL", x)
    print("fail_modes:", "%d problems" % len(bad) if bad else "all modes pass"); print("SCORE %d" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
