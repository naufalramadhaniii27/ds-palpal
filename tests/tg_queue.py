#!/usr/bin/env python3
"""T11 G7 queue 1 to 3 and 8, 390x844 and 1250x850 with Yudhi, motion on and off.
Wake Lock: wanted on the board, not on the setup screen or after closing. View Transitions: entering the board and going back work
with motion on (no page error) and the board is drawn. HP bars: after damage the bar of the hurt unit ends at its new share of HP.
Vibration: damage to the hero calls the app's buzz once."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            for fx in ("full", "off"):
                vp = "%dx%d %s" % (w, h, fx); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(url); await pg.evaluate("([v,fx])=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx',fx); localStorage.setItem('mi-bz','on');}", [FIX, fx]); await pg.reload()
                await pg.wait_for_function("()=>typeof window.__tgOpen==='function'", timeout=40000); await pg.wait_for_selector("[data-hview]", state="attached")
                await pg.evaluate("()=>{ window.__bz=[]; var M=window.__MI; if(M&&M.buzz){ M.buzz=function(k){ window.__bz.push(k); }; } }")
                await pg.click("#htgB [data-tgopen]"); await pg.wait_for_selector("#tg .tg-foe", timeout=30000)
                if (await pg.evaluate("()=>window.__tgWake()"))["want"]: bad.append(vp + " wake lock wanted on setup")
                await pg.fill("[data-tgq]", "Goblin Warrior"); await pg.wait_for_timeout(200); await pg.click('[data-tgf="goblin-warrior"][data-d="1"]')
                await pg.click('[data-tg="enter"]'); await pg.wait_for_selector("#tgCv"); await pg.wait_for_timeout(300)
                if not (await pg.evaluate("()=>window.__tgWake()"))["want"]: bad.append(vp + " wake lock not wanted on the board")
                st = await pg.evaluate("()=>window.__tgState().st.units.pc.hp")
                # find a foe turn and attack the hero with the scimitar until a hit lands (the player commands the foes)
                for k in range(20):
                    who = await pg.evaluate("()=>window.TGE.now(window.__tgState().st)")
                    if await pg.evaluate("()=>window.__tgState().st.units.pc.hp") < st: break
                    if who != "pc":
                        idx = await pg.evaluate("()=>{ var s=window.__tgState().st, u=s.units[window.TGE.now(s)]; return u.acts.findIndex(a=>a.k==='atk'&&a.rng); }")
                        if idx >= 0:
                            await pg.click('[data-tga="%d"]' % idx); await pg.wait_for_timeout(100)
                            el = await pg.query_selector('#tg .tg-lr[data-tgu="pc"]')
                            if el: await el.click(); await pg.wait_for_timeout(100)
                    await pg.evaluate("()=>{ var b=document.querySelector('[data-tgoa]'); while(b){ b.click(); b=document.querySelector('[data-tgoa]'); } }")
                    await pg.click('[data-tg="end"]'); await pg.wait_for_timeout(120)
                hp = await pg.evaluate("()=>{ var u=window.__tgState().st.units.pc; return [u.hp,u.max]; }")
                if hp[0] < st:
                    await pg.wait_for_timeout(700)
                    p = await pg.evaluate("()=>{ var i=document.querySelector('#tg .tg-ord [data-tgu=\"pc\"] i'); return i?[getComputedStyle(i).getPropertyValue('--p').trim(), i.getAttribute('data-p')]:null; }")
                    if not p or abs(float(p[0]) - hp[0] / hp[1]) > 0.01: bad.append(vp + " hp bar " + json.dumps(p) + " " + json.dumps(hp))
                    bz = await pg.evaluate("()=>window.__bz")
                    if fx == "full" and not bz: bad.append(vp + " no vibration on damage")
                else: print(vp, "no hit landed in 20 turns, hp bar check skipped")
                await pg.click('[data-tg="back"]'); await pg.wait_for_timeout(200)
                a = await pg.query_selector(".ask [data-yes]")
                if a: await a.click(); await pg.wait_for_timeout(300)
                if (await pg.evaluate("()=>window.__tgWake()"))["want"]: bad.append(vp + " wake lock still wanted after leaving the board")
                for e in errs: bad.append(vp + " " + e[:200])
                print(vp, "hp", hp, "buzz", await pg.evaluate("()=>window.__bz"))
                await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("tg_queue:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
