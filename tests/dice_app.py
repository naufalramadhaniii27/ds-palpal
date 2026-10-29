#!/usr/bin/env python3
"""T11 D2: 3D dice inside the app, under the real CSP.

  python3 tests/dice_app.py [--shots DIR]

1. Motion on: window.__miRoll.roll on a d20 check, an advantage roll and 2d6+3 damage. Each result must come from the 3D roll
   (r.three), the values must be in range, the tray must hide again, and no CSP violation or page error may appear.
2. Motion off (mi-fx off): the same roll must come from crypto at once (r.three false) and the tray must never load.
3. A Roll button in a breakdown (the real click path) must give a result card.
Viewports 390x844 and 1250x850. Exit 1 on any failure."""
import asyncio, json, os, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
SHOTS = args[args.index("--shots") + 1] if "--shots" in args else None
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def guess_type(self, p): return "application/wasm" if p.endswith(".wasm") else super().guess_type(p)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
ROLL = """([spec,mode])=>new Promise(function(ok){ var t0=performance.now(); var r=window.__miRoll.roll(spec,mode,'Test roll',function(x){ x.ms=Math.round(performance.now()-t0); ok(x); }); })"""
async def run(b, url, w, h, bad):
    ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append("pageerror " + str(e)))
    pg.on("console", lambda m: errs.append("console " + m.text) if (m.type == "error" and "status of 404" not in m.text) or "Content Security Policy" in m.text else None)
    await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','full');}", FIX); await pg.reload()
    await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible")
    await pg.evaluate("()=>document.addEventListener('securitypolicyviolation',function(e){ (window.__csp=window.__csp||[]).push(e.violatedDirective+' '+e.blockedURI); })")
    tag = "%dx%d" % (w, h)
    for spec, mode, rng in [({"bon": 5}, "", (6, 25)), ({"bon": 2}, "adv", (3, 22)), ({"dmg": "2d6+3"}, "", (5, 15))]:
        r = await pg.evaluate(ROLL, [spec, mode])
        ok = r.get("three") and rng[0] <= r["v"] <= rng[1]
        print(tag, "3D", json.dumps(spec), mode or "-", "->", r["v"], r["d"], "three" if r.get("three") else "FLAT", r["ms"], "ms")
        if not ok: bad.append("%s 3D roll %s" % (tag, r))
        if SHOTS and spec.get("dmg"): await pg.screenshot(path=os.path.join(SHOTS, "dice-%s.png" % tag))
        await pg.wait_for_function("()=>{ var t=document.getElementById('diceTray'); return t&&!t.classList.contains('on'); }", timeout=8000)
    await pg.evaluate("()=>{ localStorage.setItem('mi-fx','off'); window.__miFx&&window.__miFx.set&&window.__miFx.set('off'); }")
    await pg.reload(); await pg.wait_for_selector("[data-hview]", state="attached"); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible")
    r = await pg.evaluate(ROLL, [{"bon": 5}, ""])
    st = await pg.evaluate("()=>window.__dice3d?window.__dice3d.state():null")
    print(tag, "Motion off ->", r["v"], "three" if r.get("three") else "flat", r["ms"], "ms", st)
    if r.get("three") or (st and st.get("loaded")): bad.append(tag + " motion off still used 3D")
    await pg.evaluate("()=>localStorage.setItem('mi-fx','full')"); await pg.reload(); await pg.wait_for_selector("[data-hview]", state="attached"); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible")
    el = await pg.query_selector("[data-bd^='save-'], [data-bd^='sk-'], [data-bd='init']")
    if el:
        await el.click(); await pg.wait_for_timeout(500)
        btn = await pg.query_selector("[data-mr]")
        if btn and await btn.is_visible():
            await btn.click(); await pg.wait_for_selector(".mi-roll-o", state="visible", timeout=40000); await pg.wait_for_timeout(900)
            vis = await pg.evaluate("()=>{ var o=document.querySelector('.mi-roll-o'), r=o.getBoundingClientRect(), cs=getComputedStyle(o); return {top:Math.round(r.top), h:Math.round(r.height), op:cs.opacity, z:cs.zIndex}; }")
            print(tag, "card", vis)
            if SHOTS: await pg.screenshot(path=os.path.join(SHOTS, "dice-card-%s.png" % tag))
            print(tag, "breakdown Roll button: card shown")
        else: bad.append(tag + " no Roll button in breakdown")
    else: bad.append(tag + " no breakdown target")
    csp = await pg.evaluate("()=>window.__csp||[]")
    for e in errs + csp: bad.append(tag + " " + e[:200])
    await ctx.close()
async def main():
    srv, url = serve(); bad = []
    if SHOTS: os.makedirs(SHOTS, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for w, h in [(390, 844), (1250, 850)]: await run(b, url, w, h, bad)
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("dice_app:", "ok" if not bad else "%d failures" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
