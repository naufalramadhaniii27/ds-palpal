#!/usr/bin/env python3
"""T1 flow: Home -> sheet -> Home -> another character -> Home, with video. python3 tests/flow_home_sheet.py [OUTDIR] [--root DIR]
Two characters (old Yudhi sheet, then a Quick Build Fighter). Checks: no page error, no native dialog, the connected move ran
(copies in .mi-cx-layer during the move), nothing stays hidden afterwards (html.mi-cx gone, #photo and #idName visible),
the right character is open. Writes a .webm per viewport and a few frames as PNG."""
import asyncio, json, os, sys, time, functools, http.server, socket, threading, shutil, glob
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
OUT = os.path.abspath(a[0]) if a else os.path.join(HERE, "out", "flow"); os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return srv, "http://127.0.0.1:%d/index.html" % port
STATE = """()=>({flyN:window.__miFlyN||0, backN:window.__miFlyBackN||0, fly:document.documentElement.classList.contains('mi-cx'), layer:document.querySelectorAll('.mi-cx-layer>*').length,
  home:!!(document.getElementById('homeV')&&!document.getElementById('homeV').hidden),
  photo:(()=>{var e=document.getElementById('photo');return e?getComputedStyle(e).visibility:null})(),
  name:(document.getElementById('idName')||{}).textContent, title:document.title})"""
async def sample(pg, ms, step=60):
    seen = {"layer_max": 0, "flyN": 0, "backN": 0}
    t = 0
    while t < ms:
        try:
            s = await pg.evaluate(STATE); seen["layer_max"] = max(seen["layer_max"], s["layer"]); seen["flyN"] = max(seen["flyN"], s["flyN"]); seen["backN"] = max(seen["backN"], s["backN"])
        except Exception:
            pass
        await pg.wait_for_timeout(step); t += step
    return seen
async def run(b, base, vp, W, H, res):
    vd = os.path.join(OUT, "video-" + vp); shutil.rmtree(vd, ignore_errors=True)
    ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", record_video_dir=vd, record_video_size={"width": W, "height": H})
    await ctx.add_init_script("if(!sessionStorage.getItem('seed')){sessionStorage.setItem('seed','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s)}" % json.dumps(YUDHI))
    pg = await ctx.new_page(); pg.set_default_timeout(20000); t0 = time.monotonic(); marks = {}
    errs, dlg = [], []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: (dlg.append(d.message), asyncio.ensure_future(d.dismiss())))
    chk = []
    def ok(n, c, info=""): chk.append({"vp": vp, "check": n, "ok": bool(c), "info": info})
    await pg.goto(base); await pg.wait_for_timeout(3000)
    # make a second character: Create a Character, Quick Build Fighter, Apply
    await pg.evaluate("()=>{var b=Array.from(document.querySelectorAll('#homeV button')).filter(x=>/create a character/i.test(x.textContent))[0]; b&&b.click()}")
    await pg.wait_for_timeout(5000)
    await pg.select_option("#qbCls", "Fighter"); await pg.evaluate("document.querySelector('[data-qb]').click()"); await pg.wait_for_timeout(1500)
    await pg.evaluate("document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(2500)
    # 1. Home, then View on the same character (no reload)
    marks["home_open"] = round(time.monotonic() - t0, 2)
    await pg.evaluate("document.getElementById('rosterBtn').click()"); s1 = await sample(pg, 900)
    vis = await pg.evaluate("()=>{var a=(JSON.parse(localStorage.getItem('cs-roster-v1'))||{}).active, b=document.querySelector('#homeV [data-hview=\"'+a+'\"]'), p=b&&b.closest('.hcard').querySelector('.hpor'); if(!p) return false; var r=p.getBoundingClientRect(); return r.top<innerHeight&&r.bottom>0}")
    ok("Home opens, copies fly back to the card (only when the card is on screen)", s1["backN"] >= 1 if vis else s1["backN"] == 0, json.dumps(dict(s1, card_on_screen=vis)))
    await pg.screenshot(path=os.path.join(OUT, vp + "-1-home.png"))
    act = await pg.evaluate("(JSON.parse(localStorage.getItem('cs-roster-v1'))||{}).active")
    marks["view_same"] = round(time.monotonic() - t0, 2)
    await pg.evaluate("a=>document.querySelector('#homeV [data-hview=\"'+a+'\"]').click()", act); s2 = await sample(pg, 1400)
    st = await pg.evaluate(STATE)
    ok("same character: copies fly to the sheet", s2["flyN"] >= 1, json.dumps(s2))
    ok("same character: sheet shown, nothing hidden", not st["home"] and not st["fly"] and st["photo"] == "visible", json.dumps(st))
    # 2. Home, then View on the other character (reload)
    await pg.evaluate("document.getElementById('rosterBtn').click()"); await pg.wait_for_timeout(1200)
    other = await pg.evaluate("a=>{var b=Array.from(document.querySelectorAll('#homeV [data-hview]')).filter(x=>x.getAttribute('data-hview')!==a)[0]; return b&&b.getAttribute('data-hview')}", act)
    marks["view_other"] = round(time.monotonic() - t0, 2)
    await pg.evaluate("o=>document.querySelector('#homeV [data-hview=\"'+o+'\"]').click()", other)
    await pg.wait_for_timeout(150)
    try: await pg.screenshot(path=os.path.join(OUT, vp + "-2-leaving.png"))
    except Exception: pass
    await pg.wait_for_load_state("domcontentloaded"); s3 = await sample(pg, 2000, 40)
    await pg.screenshot(path=os.path.join(OUT, vp + "-3-arrived.png"))
    st = await pg.evaluate(STATE)
    act2 = await pg.evaluate("(JSON.parse(localStorage.getItem('cs-roster-v1'))||{}).active")
    ok("other character: reload ends on that character", act2 == other, act2)
    ok("other character: copies fly in after the reload", s3["flyN"] >= 1, json.dumps(s3))
    ok("other character: nothing hidden afterwards", not st["fly"] and st["photo"] == "visible" and not st["home"], json.dumps(st))
    ok("no page errors", not errs, "; ".join(errs[:3])); ok("no native dialogs", not dlg, "; ".join(dlg[:3]))
    await ctx.close()
    for f in glob.glob(os.path.join(vd, "*.webm")): shutil.move(f, os.path.join(OUT, "flow-%s.webm" % vp))
    shutil.rmtree(vd, ignore_errors=True)
    json.dump(marks, open(os.path.join(OUT, "marks-%s.json" % vp), "w"))
    res += chk
async def main():
    srv, base = serve(); res = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for vp, W, H in [("390x844", 390, 844), ("1250x850", 1250, 850)]:
            await run(b, base, vp, W, H, res)
        await b.close()
    srv.shutdown()
    json.dump(res, open(os.path.join(OUT, "flow.json"), "w"), indent=1)
    for c in res: print("%-4s %-9s %s %s" % ("ok" if c["ok"] else "FAIL", c["vp"], c["check"], "" if c["ok"] else c["info"]))
    bad = [c for c in res if not c["ok"]]; print("%d checks, %d failed" % (len(res), len(bad))); return 1 if bad else 0
sys.exit(asyncio.run(main()))
