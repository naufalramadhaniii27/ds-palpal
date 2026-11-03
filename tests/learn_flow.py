#!/usr/bin/env python3
"""T11 Learn: plays every stop of Hoot's Training Grounds from start to end, like a person would, and checks the result.

  python3 tests/learn_flow.py [--shots DIR] [--quick]

Runs: 390x844 and 1250x850, for (1) Yudhi's old sheet, (2) a character after Apply from the builder (Quick Build), (3) a new character.
Each run: open Learn from the Home band, play all stops (wrong answers first, so hints and "try again" are used), find each number on
the sheet with the spotlight and come back, take the final check, switch to Indonesian and play one stop, reload and check the saved
progress and language, Back button steps, then close. Also: Motion off, the fallback without anchor positioning, and the Home band.
Fails on page errors, console errors, CSP violations, a stuck step, a sheet target that is not found, or saved data of the wrong shape.
--quick: only Yudhi at both sizes."""
import asyncio, json, os, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
SHOTS = args[args.index("--shots") + 1] if "--shots" in args else None; QUICK = "--quick" in args
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
ST = "()=>window.__learnState&&window.__learnState()"
BEFORE = [None]
async def shot(pg, name):
    if SHOTS: await pg.screenshot(path=os.path.join(SHOTS, name + ".png"))
async def click(pg, sel, timeout=8000):
    await pg.wait_for_selector(sel, state="visible", timeout=timeout); await pg.click(sel)
async def yes_all(pg):
    for _ in range(4):
        y = await pg.query_selector(".ask [data-yes], .exp [data-yes]")
        if not y: return
        await y.click(); await pg.wait_for_timeout(600)
async def settle(pg, ms=120): await pg.wait_for_timeout(ms)
async def answer_opts(pg, attr):
    """click options one by one until one turns good (wrong ones first in data order show the hint)"""
    n = await pg.evaluate("a=>document.querySelectorAll('#lrnB ['+a+']').length", attr)
    for k in range(n):
        el = (await pg.query_selector_all("#lrnB [%s]" % attr))[k]
        cls = await el.get_attribute("class") or ""
        if "good" in cls: return True
        await el.click(); await settle(pg)
        good = await pg.evaluate("a=>!!document.querySelector('#lrnB ['+a+'].good')", attr)
        if good or await pg.evaluate("a=>document.querySelectorAll('#lrnB ['+a+']').length", attr) != n: return True  # the step moved on
    return False
async def play_step(pg, tag, bad, sheet_ok):
    t = await pg.evaluate("()=>{ var p=document.querySelector('#lrnB .lrn-place'); return p?p.getAttribute('data-t'):null; }")
    if t == "guess": await click(pg, "#lrnB [data-lg]")
    elif t == "show":
        pass
    elif t in ("pick", "why"):
        if not await answer_opts(pg, "data-lp"): bad.append(tag + " no good option")
    elif t == "roll":
        await click(pg, '#lrnB [data-l="roll"]'); await click(pg, '#lrnB [data-l="bonus"]', 20000)
    elif t == "check":
        for _ in range(8):
            if await pg.evaluate("()=>!!document.querySelector('#lrnB .lrn-okall')"): break
            # read the numbers on screen and answer right, so the checker also tests the sums
            v = await pg.evaluate("()=>{ var d=+document.querySelector('#lrnB .lrn-die b').textContent, c=document.querySelector('#lrnB .lrn-chip').textContent.replace('−','-'), t=+document.querySelector('#lrnB .lrn-dc span').textContent.replace(/\\D+/g,''); return d+(+c)>=t; }")
            await click(pg, '#lrnB [data-lc="%d"]' % (1 if v else 0)); await settle(pg)
        if not await pg.evaluate("()=>!!document.querySelector('#lrnB .lrn-okall')"): bad.append(tag + " check not finished")
    elif t == "grid":
        far = await pg.evaluate("()=>{ var c=[...document.querySelectorAll('#lrnB .lrn-cell')].filter(b=>!b.classList.contains('can')&&!b.classList.contains('hero')&&!b.classList.contains('foe')); return c.length; }")
        await click(pg, '#lrnB [data-la="Attack"]'); await settle(pg)  # not next to the goblin yet: a hint, not a turn
        if await pg.evaluate("()=>window.__learnState().s.act"): bad.append(tag + " attack accepted from far away")
        cell = await pg.evaluate("""()=>{ var f=document.querySelector('#lrnB .lrn-cell.foe'), fx=+f.dataset.lx, fy=+f.dataset.ly;
          var c=[...document.querySelectorAll('#lrnB .lrn-cell.can')].find(b=>Math.max(Math.abs(b.dataset.lx-fx),Math.abs(b.dataset.ly-fy))===1); return c?[c.dataset.lx,c.dataset.ly]:null; }""")
        if not cell: bad.append(tag + " no reachable square next to the goblin"); return
        await click(pg, '#lrnB [data-lx="%s"][data-ly="%s"]' % tuple(cell)); await click(pg, '#lrnB [data-la="Attack"]'); await settle(pg)
        await click(pg, '#lrnB [data-la="Dash"]'); await settle(pg)
        if await pg.evaluate("()=>window.__learnState().s.act") != "Attack": bad.append(tag + " a second action replaced the first")
    elif t == "hp":
        if not await answer_opts(pg, "data-lh"): bad.append(tag + " hp sum")
        if not await answer_opts(pg, "data-lr"): bad.append(tag + " hp rest")
    elif t == "dice":
        for d in (20, 4, 10):
            await click(pg, '#lrnB [data-ld="%d"]' % d); await pg.wait_for_function("d=>!window.__learnState().s.busy&&window.__learnState().s.r&&window.__learnState().s.r[d]", arg=d, timeout=20000)
    elif t == "adv":
        await click(pg, '#lrnB [data-l="arol"]'); await pg.wait_for_function("()=>!window.__learnState().s.busy&&window.__learnState().s.v", timeout=20000)
        if await pg.query_selector('#lrnB [data-l="insp"]'):
            await click(pg, '#lrnB [data-l="insp"]'); await pg.wait_for_function("()=>window.__learnState().s.re!=null", timeout=20000)
    elif t == "sheet":
        b = await pg.query_selector('#lrnB [data-l="sheet"]')
        if b and sheet_ok:
            await b.click()
            try: await pg.wait_for_function("()=>!!document.getElementById('lrnSpot')||(!document.getElementById('learn').hidden&&/yet|belum/.test(document.getElementById('lrnSay').textContent))", timeout=8000)
            except Exception: bad.append(tag + " sheet step: no spotlight and no message"); return
            if not await pg.query_selector("#lrnSpot"):
                if tag.startswith("yudhi"): bad.append(tag + " sheet target missing for Yudhi")
                return
            await settle(pg, 500)
            r = await pg.evaluate("""()=>{ var r=document.getElementById('spotR').getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight,learn:!document.getElementById('learn').hidden}; }""")
            if r["w"] < 10 or r["h"] < 10 or r["y"] < -2 or r["y"] + r["h"] > r["vh"] + 2 or r["learn"]: bad.append(tag + " spotlight " + json.dumps(r))
            await shot(pg, "spot-" + tag.replace(" ", "-"))
            await click(pg, "#lrnSpot [data-spot-x]"); await pg.wait_for_selector("#learn", state="visible", timeout=5000)
        elif sheet_ok: bad.append(tag + " no sheet button")
    elif t == "card": pass
    else: bad.append(tag + " unknown step " + str(t))
async def play_place(pg, k, tag, bad, sheet_ok):
    await click(pg, '#lrnB [data-lgo="%d"]' % k); await settle(pg, 400)
    for n in range(40):
        s = await pg.evaluate(ST)
        if s["fin"]: return True
        st = "%s stop%d step%d" % (tag, k, s["i"])
        await play_step(pg, st, bad, sheet_ok)
        if n < 12 and SHOTS and k in (1, 2, 3) and tag.startswith("yudhi"): await shot(pg, ("%s-%d-%d" % (tag, k, s["i"])).replace(" ", "-"))
        nb = await pg.query_selector("#lrnNext")
        if not nb: bad.append(st + " no Next"); return False
        if await nb.is_disabled(): bad.append(st + " Next still disabled"); return False
        await nb.click(); await settle(pg, 380)
    bad.append(tag + " stop %d did not end" % k); return False
async def run(b, url, w, h, who, bad):
    tag = "%s %dx%d" % (who, w, h)
    ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block", reduced_motion="no-preference"); pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append("pageerror " + str(e)))
    pg.on("console", lambda m: errs.append("console " + m.text) if (m.type == "error" and "status of 404" not in m.text) else None)
    await pg.goto(url)
    if who in ("yudhi", "applied"): await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX)
    else: await pg.evaluate("()=>{localStorage.clear(); localStorage.setItem('mi-fx','off');}")
    await pg.reload(); await pg.wait_for_selector("#homeV", state="attached", timeout=30000)
    await pg.evaluate("()=>document.addEventListener('securitypolicyviolation',function(e){ (window.__csp=window.__csp||[]).push(e.violatedDirective+' '+e.blockedURI); })")
    if who == "applied":  # the second required scenario: Yudhi through the builder and Apply to Sheet, then Home
        await pg.wait_for_selector("[data-hview]", state="attached"); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible")
        await pg.evaluate("()=>document.getElementById('bldBtn').click()"); await pg.wait_for_timeout(4000); await yes_all(pg)
        await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(2500); await yes_all(pg); await pg.wait_for_timeout(1200)
        await pg.evaluate("()=>window.__app.showHome()")
    await pg.wait_for_timeout(1200)
    if await pg.evaluate("()=>document.getElementById('homeV').hidden"):
        await pg.evaluate("()=>{ var m=document.querySelector('[data-hhome],#homeBtn'); if(m) m.click(); }")
    band = await pg.query_selector("[data-hlearn]")
    if not band:
        await pg.evaluate("()=>window.__app&&window.__app.showHome()"); await pg.wait_for_timeout(500); band = await pg.query_selector("[data-hlearn]")
    if not band: bad.append(tag + " no Learn band on Home"); await ctx.close(); return
    BEFORE[0] = await pg.evaluate("()=>localStorage.getItem('yudhi-kelapa-build-v3')")
    await shot(pg, tag.replace(" ", "-") + "-home"); await band.click(); await pg.wait_for_selector("#learn", state="visible"); await settle(pg, 400)
    await shot(pg, tag.replace(" ", "-") + "-map")
    sheet_ok = await pg.evaluate("()=>{ var a=window.__app, C=a&&a.C(); return !!(C&&C.name!=null); }")
    n = await pg.evaluate("()=>document.querySelectorAll('#lrnB [data-lgo]').length")
    tour = await pg.evaluate("()=>[...document.querySelectorAll('#lrnB .lrn-app [data-lgo]')].map(b=>+b.dataset.lgo)")
    exams = await pg.evaluate("()=>[...document.querySelectorAll('#lrnB [data-lgo]')].filter(b=>/Crumbling|Rapuh/.test(b.textContent)).map(b=>+b.dataset.lgo)")
    for k in range(n):
        if k in tour: continue  # the App Tour has its own test (tests/tour_flow.py)
        if k in exams:  # Crumbling Bridge: a fresh set of questions, at least one from each first stop
            await click(pg, '#lrnB [data-lgo="%d"]' % k); await settle(pg, 400)
            qn = await pg.evaluate("()=>window.__learnState().view==='quiz'?document.getElementById('lrnS').textContent:''")
            for q in range(12):
                if await pg.evaluate("()=>!!window.__learnState().qd"): break
                if not await answer_opts(pg, "data-lq"): bad.append(tag + " bridge question %d" % q)
                await click(pg, '#lrnB [data-l="qnext"]'); await settle(pg, 380)
            if not await pg.evaluate("()=>!!window.__learnState().qd"): bad.append(tag + " bridge not finished (" + qn + ")")
            await click(pg, '#lrnB [data-l="map"]'); await settle(pg, 300); continue
        if not await play_place(pg, k, tag, bad, sheet_ok): break
        if k == 0: await shot(pg, tag.replace(" ", "-") + "-fin")
        await click(pg, '#lrnB [data-l="map"]'); await settle(pg, 300)
    # final check
    await click(pg, "#lrnB [data-lquiz]"); await settle(pg, 300)
    for q in range(5):
        if not await answer_opts(pg, "data-lq"): bad.append(tag + " quiz %d" % q)
        await click(pg, '#lrnB [data-l="qnext"]'); await settle(pg, 380)
    await shot(pg, tag.replace(" ", "-") + "-quiz")
    st = await pg.evaluate(ST)
    if not st.get("qd"): bad.append(tag + " quiz not done")
    saved = await pg.evaluate("()=>JSON.parse(localStorage.getItem('cs-learn-v1')||'null')")
    if not saved or saved.get("v") != 1 or len(saved.get("done", {})) != n - len(tour) or saved.get("xp") != 100 * (n - len(tour)) + 100 or (saved.get("quiz") or {}).get("best") is None:
        bad.append(tag + " saved data " + json.dumps(saved)[:300])
    # Indonesian, Back steps, reload keeps language and progress
    await click(pg, '#learn [data-llang="id"]'); await click(pg, '#lrnB [data-l="map"]'); await settle(pg, 300)
    await click(pg, '#lrnB [data-lgo="2"]'); await settle(pg, 300)
    await click(pg, "#lrnB [data-lg]"); await click(pg, "#lrnNext"); await settle(pg, 380)
    i1 = (await pg.evaluate(ST))["i"]; await pg.go_back(); await settle(pg, 500); i0 = await pg.evaluate(ST)
    if not (i1 == 1 and i0["i"] == 0 and i0["view"] == "place"): bad.append(tag + " Back did not step back (%s -> %s)" % (i1, i0["i"]))
    txt = await pg.evaluate("()=>document.getElementById('lrnSay').textContent")
    if "Lemparan" not in txt and "atap" not in txt.lower(): bad.append(tag + " Indonesian text missing: " + txt)
    await shot(pg, tag.replace(" ", "-") + "-id")
    await pg.reload(); await pg.wait_for_selector("#homeV", state="attached", timeout=30000); await pg.wait_for_timeout(800)
    band = await pg.evaluate("()=>{ var b=document.getElementById('hlearnB'); return b?b.textContent:''; }")
    if "5 / 5" not in band or "Lanjut" not in band: bad.append(tag + " Home band after reload: " + band)
    await click(pg, "[data-hlearn]"); await pg.wait_for_selector("#learn", state="visible")
    hd = await pg.evaluate("()=>document.getElementById('lrnT').textContent")
    if hd != "Belajar": bad.append(tag + " language not kept: " + hd)
    await pg.keyboard.press("Escape"); await settle(pg, 300)
    if not await pg.evaluate("()=>document.getElementById('learn').hidden"): bad.append(tag + " Escape did not close Learn")
    if who == "yudhi":  # the character is unchanged by Learn
        now = json.loads(await pg.evaluate("()=>localStorage.getItem('yudhi-kelapa-build-v3')")); was = json.loads(BEFORE[0])
        # the sheet adds item details (type, cost) to the inventory once the builder data is loaded (renderInv in 08), with or without Learn
        if isinstance(now.get("inv"), list) and isinstance(was.get("inv"), list) and len(now["inv"]) == len(was["inv"]):
            now["inv"] = [{k: v for k, v in y.items() if k in x} for x, y in zip(was["inv"], now["inv"])]
        diff = sorted(k for k in set(now) | set(was) if now.get(k) != was.get(k))
        if diff:
            bad.append(tag + " Learn changed the character: " + ", ".join(diff)[:200])
            for k in diff:
                A, B = was.get(k), now.get(k)
                if isinstance(A, list) and isinstance(B, list):
                    for x, y in zip(A, B):
                        if x != y: bad.append("   %s: %s -> %s" % (k, json.dumps(x)[:160], json.dumps(y)[:160])); break
                    if len(A) != len(B): bad.append("   %s: %d -> %d items" % (k, len(A), len(B)))
    csp = await pg.evaluate("()=>window.__csp||[]")
    for e in errs + csp: bad.append(tag + " " + e[:1200])
    await ctx.close()
async def extra(b, url, bad):
    """Motion off with the fallback paths forced (no anchor positioning), glossary card, the 3D dice in Learn"""
    ctx = await b.new_context(viewport={"width": 390, "height": 844}, service_workers="block", reduced_motion="reduce"); pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append("pageerror " + str(e)))
    await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"); await pg.goto(url)
    await pg.wait_for_selector("[data-hlearn]", state="attached", timeout=30000); await pg.evaluate("()=>{ window.__lrnNoAnchor=1; }")
    await pg.click("[data-hlearn]"); await click(pg, '#lrnB [data-lgo="2"]'); await click(pg, "#lrnB [data-lg]"); await settle(pg)
    await click(pg, "#lrnB [data-lterm]"); await pg.wait_for_selector("#lrnPop.on", timeout=4000)
    pop = await pg.evaluate("()=>{ var p=document.getElementById('lrnPop'), r=p.getBoundingClientRect(); return {top:p.matches(':popover-open'), y:r.top, h:r.height, txt:p.textContent}; }")
    if not pop["top"] or pop["h"] < 40 or "DC" not in pop["txt"]: bad.append("glossary card " + json.dumps(pop))
    await shot(pg, "glossary-390")
    await pg.go_back(); await settle(pg, 400)
    if await pg.evaluate("()=>document.getElementById('lrnPop').classList.contains('on')"): bad.append("Back did not close the glossary card")
    for _ in range(8):
        t = await pg.evaluate("()=>document.querySelector('#lrnB .lrn-place').getAttribute('data-t')")
        if t == "sheet": break
        await play_step(pg, "fallback", bad, True); await click(pg, "#lrnNext"); await settle(pg, 200)
    await click(pg, '#lrnB [data-l="sheet"]'); await pg.wait_for_selector("#lrnSpot", state="visible")
    r = await pg.evaluate("()=>{ var r=document.getElementById('spotR').getBoundingClientRect(), t=document.querySelector('.spot-anc'); return {w:r.width,h:r.height,anc:!!t}; }")
    if r["w"] < 10 or r["anc"]: bad.append("fallback spotlight " + json.dumps(r))
    await shot(pg, "spot-fallback-390"); await pg.go_back(); await settle(pg, 400)
    if await pg.evaluate("()=>!!document.getElementById('lrnSpot')"): bad.append("Back did not close the spotlight")
    for e in errs: bad.append("extra " + e[:200])
    await ctx.close()
    # 3D dice in Learn (effects on), one roll
    ctx = await b.new_context(viewport={"width": 1250, "height": 850}, service_workers="block"); pg = await ctx.new_page()
    await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");localStorage.setItem('mi-fx','full');sessionStorage.setItem('__s','1')}"); await pg.goto(url)
    await pg.wait_for_selector("[data-hlearn]", state="attached", timeout=30000); await pg.click("[data-hlearn]"); await click(pg, '#lrnB [data-lgo="6"]')
    await click(pg, "#lrnB [data-lg]"); await click(pg, "#lrnNext"); await settle(pg, 400)
    await click(pg, '#lrnB [data-ld="20"]'); await pg.wait_for_function("()=>window.__learnState().s.r&&window.__learnState().s.r[20]", timeout=40000)
    three = await pg.evaluate("()=>window.__dice3d&&window.__dice3d.state().loaded")
    if not three: bad.append("3D dice did not load in Learn")
    await ctx.close()
async def main():
    srv, url = serve(); bad = []
    if SHOTS: os.makedirs(SHOTS, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for w, h in [(390, 844), (1250, 850)]:
            for who in (["yudhi"] if QUICK else ["yudhi", "applied", "new"]):
                n0 = len(bad); await run(b, url, w, h, who, bad); print("%s %dx%d: %s" % (who, w, h, "ok" if len(bad) == n0 else "%d problems" % (len(bad) - n0)))
        n0 = len(bad)
        try: await extra(b, url, bad)
        except Exception as e: bad.append("extra stopped: " + str(e).split("\n")[0])
        print("motion off, fallback, glossary, 3D:", "ok" if len(bad) == n0 else "%d problems" % (len(bad) - n0))
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("learn_flow:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
