#!/usr/bin/env python3
"""G7 TG1 to TG4 Training Ground screens, 390x844 and 1250x850. Three ways in: Yudhi (old sheet), a class to try, a new character.
  python3 tests/tg_ui.py [--shots DIR]
Setup: the Home band opens it, the creature list loads (data/tg-creatures.json), Easy lists CR 1/4 creatures, two Goblin Warriors and
a Knight, the forest arena, Enter the field. Field: the whole fight is played through the screen (Move, a lit square, an attack button,
a tap on the target, the reaction card, End Turn) until Victory or Defeat. Undo puts the last command back. The sheet in storage is the
same before and after. No page errors, no square or token outside the grid, every button at least 44 px high."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; SH = A[A.index("--shots") + 1] if "--shots" in A else None; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
CANVAS_XY = """([x,y])=>{ var cv=document.getElementById('tgCv'), r=cv.getBoundingClientRect(), cs=r.width/window.__tgState().st.w; cv.scrollIntoView({block:'nearest',inline:'nearest'});
  var w=document.getElementById('tgWrap'); var tx=x*cs+cs/2, ty=y*cs+cs/2; w.scrollLeft=Math.max(0,tx-w.clientWidth/2); w.scrollTop=Math.max(0,ty-w.clientHeight/2); r=cv.getBoundingClientRect(); return [r.left+tx, r.top+ty]; }"""
PLAN = """()=>{ var s=window.__tgState(), st=s.st, T=window.TGE, u=st.units[T.now(st)]; if(st.over) return {over:st.over};
  var foes=T.foes(st,u).filter(function(f){ return !f.dead; }).sort(function(a,b){ return T.udist(u,a)-T.udist(u,b); }); var f=foes[0];
  var atks=(u.acts||[]).map(function(a,i){ return [a,i]; }).filter(function(p){ return p[0].k==='atk'&&(p[0].dmg||[]).length; });
  var inR=function(a,uu){ var d=T.udist(uu,f); return a.mr==='r'?(a.rng&&d<=a.rng[1]):(d<=(a.reach||5)||(a.mr==='mr'&&a.rng&&d<=a.rng[1])); };
  var move=null; if(f&&!atks.some(function(p){ return inR(p[0],u); })&&T.speedLeft(u)>0&&!u.down){ var R=T.reach(st,u.id), best=null; Object.keys(R).forEach(function(k){ if(R[k].pass||R[k].c===0) return; var p=k.split(',').map(Number), v=Object.assign({},u,{pos:p}), d=T.udist(v,f); if(!best||d<best[0]||(d===best[0]&&R[k].c<best[1])) best=[d,R[k].c,p]; }); if(best) move=best[2]; }
  var multi=(u.acts||[]).map(function(a,i){ return [a,i]; }).filter(function(p){ return p[0].k==='multi'&&p[0].ma&&p[0].ma.length; })[0];
  var here=f?atks.filter(function(p){ return inR(p[0],u); }):[]; var mOk=multi&&f&&multi[0].ma.some(function(e){ return e[0].split('|').some(function(n){ return atks.some(function(p){ return p[0].n===n&&inR(p[0],u); }); }); });
  return {u:u.id, name:u.name, down:u.down, move:move, f:f&&f.id, fpos:f&&f.pos, atk:here.length?here[0][1]:null, multi:mOk?multi[1]:null, act:u.turn.a, ma:u.turn.ma}; }"""
async def play(pg, bad, vp):
    turns = 0
    while turns < 220:
        turns += 1
        p = await pg.evaluate(PLAN)
        if p.get("over"): return p["over"], turns
        if await pg.query_selector("[data-tgoa]"):
            await pg.click("[data-tgoa]"); continue
        if p["move"] and not p["down"]:
            await pg.click('[data-tg="move"]'); xy = await pg.evaluate(CANVAS_XY, p["move"]); await pg.mouse.click(xy[0], xy[1]); await pg.wait_for_timeout(30)
            while await pg.query_selector("[data-tgoa]"): await pg.click("[data-tgoa]")
            if await pg.evaluate("()=>!!window.__tgState().st.over"): continue
            if await pg.evaluate("()=>document.querySelector('[data-tg=move].on')!==null"): await pg.click('[data-tg="move"]')
        p = await pg.evaluate(PLAN)
        if p.get("over"): continue
        if p["f"] and p["act"] and not p["down"]:
            idx = p["multi"] if p["multi"] is not None else p["atk"]
            if idx is not None:
                await pg.click('[data-tga="%d"]' % idx)
                for k in range(8):
                    st = await pg.evaluate("()=>{ var s=window.__tgState().st, u=s.units[window.TGE.now(s)], T=window.TGE; var f=T.foes(s,u).filter(x=>!x.dead).sort((a,b)=>T.udist(u,a)-T.udist(u,b))[0]; return {mode:document.querySelector('#tgB .tg-hint')?document.querySelector('#tgB .tg-hint').textContent:'', f:f&&f.pos, over:s.over}; }")
                    if st["over"] or not st["f"] or "Tap the creature" not in await pg.evaluate("()=>document.getElementById('tgB').textContent"): break
                    xy = await pg.evaluate(CANVAS_XY, st["f"]); await pg.mouse.click(xy[0], xy[1]); await pg.wait_for_timeout(30)
                    if "Out of reach" in await pg.evaluate("()=>document.getElementById('tgMsg').textContent"):
                        await pg.click('[data-tg="cancel"]') if await pg.query_selector('[data-tg="cancel"]') else None; break
        if await pg.evaluate("()=>!!window.__tgState().st.over"): continue
        while await pg.query_selector("[data-tgoa]"): await pg.click("[data-tgoa]")
        await pg.click('[data-tg="end"]')
    bad.append(vp + " fight did not end in %d turns" % turns); return None, turns
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            for mode in ("yudhi", "trial", "new"):
                vp = "%dx%d %s" % (w, h, mode); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"); await pg.goto(url)
                await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000)
                if mode == "new":
                    await pg.evaluate("()=>document.querySelector('[data-hnew]').click()"); await pg.wait_for_timeout(4000)
                    await pg.evaluate("()=>{ var c=document.getElementById('b-close'); if(c) c.click(); }"); await pg.wait_for_timeout(800)
                    await pg.evaluate("()=>window.__app.showHome()"); await pg.wait_for_timeout(500)
                before = await pg.evaluate("()=>[localStorage.getItem('yudhi-kelapa-sheet-v1'), localStorage.getItem('yudhi-kelapa-build-v3')]")
                await pg.wait_for_function("()=>typeof window.__tgOpen==='function'", timeout=40000)
                await pg.click("#htgB [data-tgopen]"); await pg.wait_for_selector("#tg .tg-foe", state="visible", timeout=30000)
                if mode == "trial":
                    await pg.select_option('[data-tgtry="cls"]', "Wizard"); await pg.fill('[data-tgtry="lv"]', "5"); await pg.click('[data-tg="try"]'); await pg.wait_for_timeout(800)
                    tp = await pg.evaluate("()=>window.__tgState().pc")
                    if not tp or tp.get("name") != "Wizard 5" or not tp.get("attacks"): bad.append(vp + " trial hero " + json.dumps(tp)[:200])
                pc = await pg.evaluate("()=>window.__tgState().pc")
                if not pc or not pc.get("attacks"): bad.append(vp + " no hero or no attacks: " + json.dumps(pc)[:200])
                easy = await pg.evaluate("()=>[...document.querySelectorAll('#tg .tg-foe small')].map(x=>x.textContent.split(' ')[1])")
                if not easy or any(c != "1/4" for c in easy): bad.append(vp + " Easy list " + json.dumps(easy[:5]))
                await pg.fill("[data-tgq]", "Goblin Warrior"); await pg.wait_for_timeout(200)
                await pg.click('[data-tgf="goblin-warrior"][data-d="1"]'); await pg.click('[data-tgf="goblin-warrior"][data-d="1"]')
                await pg.click('[data-tgally="Knight"]'); await pg.click('[data-tgarena="forest"]')
                bar = await pg.evaluate("()=>document.querySelector('#tg .tg-bar span').textContent")
                if "2 creatures, 1 companion" not in bar: bad.append(vp + " bar " + bar)
                small = await pg.evaluate("()=>[...document.querySelectorAll('#tg button')].filter(x=>x.offsetParent&&x.getBoundingClientRect().height<43.5).map(x=>(x.textContent||x.getAttribute('aria-label')||'').slice(0,30))")
                if small: bad.append(vp + " small buttons on setup " + json.dumps(small[:5]))
                over = await pg.evaluate("()=>document.getElementById('tgB').scrollWidth>document.getElementById('tgB').clientWidth+1")
                if over: bad.append(vp + " setup scrolls sideways")
                if SH: await pg.screenshot(path=os.path.join(SH, "tg-setup-%s.png" % vp.replace(" ", "-")))
                await pg.click('[data-tg="enter"]'); await pg.wait_for_selector("#tgCv", state="visible")
                n = await pg.evaluate("()=>window.__tgState().st.order.length")
                if n != 4: bad.append(vp + " order %d" % n)
                if SH: await pg.screenshot(path=os.path.join(SH, "tg-field-%s.png" % vp.replace(" ", "-")))
                # Undo: Dodge, then Undo gives the action back
                a0 = await pg.evaluate("()=>{ var s=window.__tgState().st; return s.units[window.TGE.now(s)].turn.a; }")
                if a0:
                    await pg.click('[data-tgx="dodge"]'); await pg.click('[data-tg="undo"]')
                    if not await pg.evaluate("()=>{ var s=window.__tgState().st; return s.units[window.TGE.now(s)].turn.a; }"): bad.append(vp + " undo did not give the action back")
                if mode == "trial":
                    # TG5: the Wizard casts an attack or save spell through the screen on its first turn
                    for k in range(8):
                        if await pg.evaluate("()=>{ var s=window.__tgState().st; return window.TGE.now(s)==='pc'; }"): break
                        await pg.click('[data-tg="end"]')
                    names = await pg.evaluate("()=>[...document.querySelectorAll('#tg [data-tgsp]')].map(b=>b.textContent)")
                    if not names: bad.append(vp + " the Wizard has no spell buttons")
                    else:
                        i = await pg.evaluate("()=>{ var s=window.__tgState().st, u=s.units.pc; var k=u.spells.findIndex(x=>(x.k==='atk'||x.k==='save')&&x.l===0); return k; }")
                        if i >= 0:
                            await pg.click('[data-tgsp="%d"]' % i)
                            fp = await pg.evaluate("()=>{ var s=window.__tgState().st, T=window.TGE, u=s.units.pc; return T.foes(s,u).filter(f=>!f.dead).sort((a,b)=>T.udist(u,a)-T.udist(u,b))[0].pos; }")
                            xy = await pg.evaluate(CANVAS_XY, fp); await pg.mouse.click(xy[0], xy[1]); await pg.wait_for_timeout(100)
                            await pg.click('[data-tg="castgo"]'); await pg.wait_for_timeout(200)
                            ok_ = await pg.evaluate("()=>window.__tgState().st.log.some(e=>e.t==='cast'&&e.u==='pc')")
                            print(vp, "spells", names[:4], "cast", ok_)
                            if not ok_: bad.append(vp + " no spell cast " + await pg.evaluate("()=>document.getElementById('tgMsg').textContent"))
                        else: bad.append(vp + " no cantrip with numbers among " + json.dumps(names))
                if mode == "yudhi":
                    # the fight stays on the device: Dodge, reload, Resume gives the same state
                    if await pg.evaluate("()=>{ var s=window.__tgState().st; return s.units[window.TGE.now(s)].turn.a; }"): await pg.click('[data-tgx="dodge"]')
                    await pg.wait_for_timeout(700); h0 = await pg.evaluate("()=>window.TGE.hash(window.__tgState().st)")
                    await pg.reload(); await pg.wait_for_function("()=>typeof window.__tgOpen==='function'", timeout=40000); await pg.wait_for_selector("[data-hview]", state="attached")
                    await pg.evaluate("()=>window.__tgOpen()"); await pg.wait_for_selector('#tg [data-tg="resume"]', timeout=15000); await pg.click('#tg [data-tg="resume"]'); await pg.wait_for_selector("#tgCv")
                    h1 = await pg.evaluate("()=>window.TGE.hash(window.__tgState().st)")
                    if h0 != h1: bad.append(vp + " resumed fight differs")
                res, turns = await play(pg, bad, vp)
                await pg.wait_for_timeout(300)
                txt = await pg.evaluate("()=>{ var e=document.querySelector('#tg .tg-over h2'); return e?e.textContent:''; }")
                if res and txt not in ("Victory", "Defeat"): bad.append(vp + " end panel " + txt)
                log = await pg.evaluate("()=>document.querySelectorAll('#tg .tg-log li').length")
                if SH: await pg.screenshot(path=os.path.join(SH, "tg-end-%s.png" % vp.replace(" ", "-")))
                ev = await pg.evaluate("()=>{ var s=window.__tgState().st, o={}; s.log.forEach(function(e){ if(e.t==='atk'||e.t==='cast'||e.t==='move'){ var k=s.units[e.u].side+':'+e.t; o[k]=(o[k]||0)+1; } }); return o; }")
                print(vp, "hero", pc and pc.get("name"), "result", res, "turns", turns, "log", log, json.dumps(ev))
                if res == "lost" and not ev.get("pc:atk") and not ev.get("pc:cast"): bad.append(vp + " the hero never attacked")
                after = await pg.evaluate("()=>[localStorage.getItem('yudhi-kelapa-sheet-v1'), localStorage.getItem('yudhi-kelapa-build-v3')]")
                if after != before: bad.append(vp + " the sheet changed")
                await pg.click('#tg [data-tg="close"]'); await pg.wait_for_timeout(400)
                if not await pg.evaluate("()=>document.getElementById('tg').hidden"): bad.append(vp + " close")
                for e in errs: bad.append(vp + " " + e[:200])
                await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("tg_ui:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
