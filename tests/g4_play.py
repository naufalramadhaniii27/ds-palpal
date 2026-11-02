#!/usr/bin/env python3
"""T11 G4 features in play, 390x844 and 1250x850 with Yudhi (the old sheet), plus a new character.
  python3 tests/g4_play.py [--shots DIR]
N10 odds: a saving throw breakdown shows a chance table that matches d20 maths.
N17 status: Copy status for chat (HP breakdown) copies "Yudhi Kelapa (...) | HP x/y | AC z".
N9 rules check: 0 Hit Points without Unconscious shows the chip, the fix adds Unconscious.
N4 recap: damage and healing go to the journal and the Session recap lists them.
N15 ask: "how do I hide?" in the Library shows a short answer with the Hide rule.
N11 Build DNA: Copy build link in the builder, opening the link in a new page asks, then adds the character with the same class."""
import asyncio, json, os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; SH = A[A.index("--shots") + 1] if "--shots" in A else None; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
async def sheet(pg):
    await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(900)
async def jsclick(pg, sel): await pg.evaluate("s=>{ var e=[...document.querySelectorAll(s)].find(x=>x.offsetParent)||document.querySelector(s); e.click(); }", sel)
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block", permissions=["clipboard-read", "clipboard-write"]); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"); await pg.goto(url); await sheet(pg)
            # N10 odds
            await jsclick(pg, '[data-bd="save-STR"]'); await pg.wait_for_selector("#sheet .odds", state="visible", timeout=8000)
            od = await pg.evaluate("""()=>{ var t=document.querySelector('#sheetBody .bk-t b').textContent.replace('\\u2212','-'), r=[...document.querySelectorAll('#sheet .odds tbody tr')].map(x=>[...x.children].map(c=>c.textContent)); return {b:parseInt(t,10), r:r}; }""")
            bon = od["b"]; p = max(0, min(1, (21 - (10 - bon)) / 20.0))
            if not od["r"] or od["r"][0][1] != "%d%%" % round(p * 100) or od["r"][0][2] != "%d%%" % round((1 - (1 - p) ** 2) * 100): bad.append(vp + " odds " + json.dumps(od))
            if SH: await pg.screenshot(path=os.path.join(SH, "odds-%s.png" % vp))
            # D2 I rolled myself: 15 on the d20 plus the save bonus
            if await pg.query_selector("#sheet [data-mrself]"):
                await pg.click("#sheet [data-mrself]"); await pg.fill("#sheet [data-mrin]", "15"); await pg.click("#sheet [data-mrok]"); await pg.wait_for_timeout(500)
                got = await pg.evaluate("()=>{ var b=document.querySelector('#sheet .mi-rres b'); return b?+b.textContent:null; }")
                if got != 15 + bon: bad.append(vp + " rolled myself gave %s, want %d" % (got, 15 + bon))
            else: bad.append(vp + " no I rolled myself button")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
            # N17 status
            await jsclick(pg, '[data-bd="hp"]'); await pg.wait_for_selector("#sheet [data-status]", state="visible", timeout=8000); await pg.click("#sheet [data-status]"); await pg.wait_for_timeout(500)
            clip = await pg.evaluate("()=>navigator.clipboard.readText()")
            if not re.match(r"^Yudhi Kelapa .*\| HP \d+/\d+ \| AC \d+", clip): bad.append(vp + " status: " + clip)
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            # N5 future sheet from the HP breakdown
            await jsclick(pg, '[data-bd="hp"]'); await pg.wait_for_selector("#sheet [data-future]", state="visible"); await pg.click("#sheet [data-future]")
            await pg.wait_for_selector("#sheet .fut-t", state="visible", timeout=30000)
            fr = await pg.evaluate("()=>[...document.querySelectorAll('#sheet .fut-t tbody tr')].map(r=>[+r.children[0].textContent,+r.children[1].textContent])")
            if len(fr) != 17 or fr[0][0] != 4 or fr[-1][0] != 20 or not all(fr[i][1] < fr[i + 1][1] for i in range(len(fr) - 1)): bad.append(vp + " future rows " + json.dumps(fr[:4]) + " n %d" % len(fr))
            if SH: await pg.screenshot(path=os.path.join(SH, "future-%s.png" % vp))
            hp_after = await pg.evaluate("()=>JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}').hp")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            # N4 recap: damage 3, heal 2
            await pg.fill("#hpAmt", "3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(300); await pg.fill("#hpAmt", "2"); await pg.click("#healBtn"); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>window.__recapOpen()"); await pg.wait_for_selector("#sheet .rcp", state="visible")
            rc = await pg.evaluate("()=>document.querySelector('#sheet .rcp').textContent")
            if "Damage taken3" not in rc or "Healing2" not in rc: bad.append(vp + " recap: " + rc[:200])
            if SH: await pg.screenshot(path=os.path.join(SH, "recap-%s.png" % vp))
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            # N9 rules check: 0 HP without Unconscious
            await pg.evaluate("()=>{ var o=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}'); o.hp=0; o.cond=o.cond||{}; delete o.cond.Unconscious; window.__lsSave('yudhi-kelapa-sheet-v1',o); }"); await pg.reload(); await sheet(pg)
            chip = await pg.query_selector("[data-lint]")
            if not chip: bad.append(vp + " no rules check chip at 0 HP")
            else:
                await jsclick(pg, "[data-lint]"); await pg.wait_for_selector('#sheet [data-lfix="unc"]', state="visible")
                if SH: await pg.screenshot(path=os.path.join(SH, "lint-%s.png" % vp))
                await pg.click('#sheet [data-lfix="unc"]'); await pg.wait_for_timeout(500)
                u = await pg.evaluate("()=>{ var o=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')); return !!(o.cond&&o.cond.Unconscious); }")
                if not u: bad.append(vp + " fix did not add Unconscious")
                if await pg.query_selector("[data-lint]"): bad.append(vp + " chip still there")
                # D2 death save rolled for me
                b4 = await pg.evaluate("()=>{ var o=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')); return [o.hp,(o.ds||[0,0]).join()]; }")
                await pg.evaluate("()=>{ if(window.__app&&window.__app.narrow()) {} }")
                if await pg.query_selector("[data-dsroll]"):
                    await jsclick(pg, "[data-dsroll]"); await pg.wait_for_timeout(1500)
                    af = await pg.evaluate("()=>{ var o=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')); return [o.hp,(o.ds||[0,0]).join()]; }")
                    if af == b4: bad.append(vp + " death save roll changed nothing " + json.dumps(af))
                else: bad.append(vp + " no Roll the death save button")
            # N15 ask
            await pg.evaluate("()=>window.__app.libOpen()"); await pg.wait_for_selector("#libQ", state="visible", timeout=15000); await pg.fill("#libQ", "how do I hide?"); await pg.wait_for_timeout(500)
            qa = await pg.evaluate("()=>{ var q=document.querySelector('#libBd .qa'); return q?q.textContent:''; }")
            if "Stealth" not in qa or "Hide" not in qa: bad.append(vp + " ask: " + qa[:120])
            if SH: await pg.screenshot(path=os.path.join(SH, "ask-%s.png" % vp))
            await pg.click('#libBd .qa [data-lib-open="rule|Hide"]'); await pg.wait_for_timeout(400)
            if "Hide" not in await pg.evaluate("()=>document.getElementById('libT').textContent"): bad.append(vp + " ask link did not open Hide")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            # N11 Build DNA
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
            await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(700); await pg.click('#steps [data-step="next"]'); await pg.wait_for_timeout(700)
            await jsclick(pg, '#bld [data-dna="link"]'); await pg.wait_for_timeout(800)
            link = await pg.evaluate("()=>navigator.clipboard.readText()")
            if "#build=" not in link: bad.append(vp + " no build link: " + link[:80])
            else:
                if len(link) > 3000: bad.append(vp + " build link long: %d" % len(link))
                # a friend: another browser with one character of their own
                ctx2 = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); p2 = await ctx2.new_page(); p2.on("pageerror", lambda e: errs.append("p2 " + str(e)))
                await p2.goto(url); await p2.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await p2.reload(); await p2.wait_for_selector("[data-hview]", state="attached", timeout=30000)
                n0 = await p2.evaluate("()=>Object.keys(JSON.parse(__store.getItem('cs-roster-v1')).chars).length")
                await p2.goto(link)
                await p2.wait_for_selector(".ask [data-yes]", timeout=40000); await p2.click(".ask [data-yes]"); await p2.wait_for_timeout(1500)
                # the import itself may ask once more (names it adjusts, choices still open)
                if await p2.query_selector(".ask [data-yes]"):
                    async with p2.expect_navigation(timeout=40000): await p2.click(".ask [data-yes]")
                await p2.wait_for_timeout(1500)
                r = await p2.evaluate("()=>{ var r=JSON.parse(__store.getItem('cs-roster-v1')); var a=r.chars[r.active]; var c=JSON.parse(a.C||'{}'); return {n:Object.keys(r.chars).length, cls:c.cls, name:a.name}; }")
                if r["n"] != n0 + 1 or r["cls"] != "Fighter": bad.append(vp + " DNA import " + json.dumps(r) + " before %d" % n0)
                print(vp, "link", len(link), "chars", json.dumps(r))
                await ctx2.close()
            # N1 Find a build: Stealth at least +6 and Armor Class at least 18 for the Fighter
            await pg.evaluate("()=>{ var x=document.getElementById('bld'); if(x&&!x.hidden){ var c=document.getElementById('b-close'); if(c) c.click(); } }"); await pg.wait_for_timeout(500)
            await pg.evaluate("()=>window.__rbOpen()"); await pg.wait_for_selector("#sheet [data-rbgo]", state="visible", timeout=30000)
            await pg.fill('#sheet [data-rbg="ac"]', "18"); await pg.select_option('#sheet [data-rbs="sk"]', "Stealth"); await pg.fill('#sheet [data-rbg="sk"]', "6")
            await pg.click("#sheet [data-rbgo]"); await pg.wait_for_function("()=>{ var o=document.querySelector('#sheet .rb-out'); return o&&!o.querySelector('.rb-prog'); }", timeout=120000)
            rb = await pg.evaluate("()=>({t:document.querySelector('#sheet .rb-out .bk-f').textContent, n:document.querySelectorAll('#sheet .rb-c').length, use:document.querySelectorAll('#sheet [data-rbuse]').length, ok:document.querySelectorAll('#sheet .rb-c .ok').length})")
            print(vp, "find a build", json.dumps(rb))
            if not rb["n"]: bad.append(vp + " find a build gave nothing: " + rb["t"])
            if SH: await pg.screenshot(path=os.path.join(SH, "rb-%s.png" % vp))
            if rb["use"]:
                b0 = await pg.evaluate("()=>{ var b=JSON.parse(__store.getItem('phb24-builder-v1')); return [b.species,b.bg,b.bg2,JSON.stringify(b.base)]; }")
                await pg.click("#sheet [data-rbuse]"); await pg.wait_for_timeout(1200)
                b1 = await pg.evaluate("()=>{ var b=JSON.parse(__store.getItem('phb24-builder-v1')); return [b.species,b.bg,b.bg2,JSON.stringify(b.base)]; }")
                st_ = await pg.evaluate("()=>{ var e=document.querySelector('#steps .on'); return [!document.getElementById('bld').hidden, e&&e.getAttribute('data-step')]; }")
                if b0 == b1 or st_ != [True, "abil"]: bad.append(vp + " use this build " + json.dumps([b0, b1, st_]))
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("g4_play:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
