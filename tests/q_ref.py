#!/usr/bin/env python3
"""Q2 deity and Q3 loot tables: rows follow the source switch (QLIVE) and the Library lists them.
  python3 tests/q_ref.py"""
import asyncio, json, os, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def rows(f):
    s = open(os.path.join(ROOT, "src", "data", f), encoding="utf-8").read()
    return json.loads(s[s.index("var ROWS=") + 9: s.index(";\nwindow.QREFS")])
DATA = {"deity": rows("q02-deity.js"), "table": rows("q03-loot.js")}
def serve():
    so = socket.socket(); so.bind(("127.0.0.1", 0)); port = so.getsockname()[1]; so.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
LIVE = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}); (c.off||[]).forEach(function(i){b.src[i]=false}); (c.on||[]).forEach(function(i){b.src[i]=true}); return window.__bldQLive(b)[c.cat]||[] ; }"""
async def main():
    srv, url = serve(); errs = []
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            tag = "%dx%d" % vp
            ctx = await br.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(FIX))
            await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
            await pg.wait_for_function("()=>!!window.__bldQLive&&!!window.QREFS&&!!window.QREFS.deity", timeout=60000)
            for cat, rs in DATA.items():
                check("%s %s rows loaded (%d)" % (tag, cat, len(rs)), len(await pg.evaluate("(c)=>window.QREFS[c].length", cat)) if False else await pg.evaluate("(c)=>window.QREFS[c].length>=%d" % len(rs), cat))
                srcs = sorted({x for r in rs for x in ([r["s"]] if isinstance(r["s"], str) else r["s"])})
                bad = []
                for sid in srcs:
                    if sid in ("core", "dmg"): continue
                    allsrc = [x for x in srcs if x not in ("core", "dmg")]
                    off = await pg.evaluate(LIVE, {"cat": cat, "off": allsrc, "on": []})
                    on = await pg.evaluate(LIVE, {"cat": cat, "off": [x for x in allsrc if x != sid], "on": [sid]})
                    exp = {r["n"] for r in rs if sid in ([r["s"]] if isinstance(r["s"], str) else r["s"])}
                    offn = set(off)
                    if exp & offn - {r["n"] for r in rs if any(x in ("core", "dmg") for x in ([r["s"]] if isinstance(r["s"], str) else r["s"]))}: bad.append(sid + " leaks when off")
                    if not exp <= set(on): bad.append(sid + " missing when on")
                check("%s %s gating per source (%d sources)" % (tag, cat, len(srcs)), not bad, str(bad[:4]))
            ok = await pg.evaluate("""()=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}); Object.keys(window.WX.src||{}).forEach(function(i){b.src[i]=true}); var sh=window.__bldSheetFor(b); return !!sh }""")
            check(tag + " sheet builds with every source on", ok)
            await ctx.close()
        await br.close()
    check("no page errors", not errs, str(errs[:2])); srv.shutdown()
    print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(1 if False in res else 0)
import sys
asyncio.run(main())
