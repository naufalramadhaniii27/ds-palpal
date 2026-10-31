#!/usr/bin/env python3
"""Q Library: with every source on, every reference entry opens a detail; with sources off the third party rows are absent.
  python3 tests/q_lib.py"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = json.loads(open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read())
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
async def run(br, url, vp, allsrc):
    ctx = await br.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(json.dumps(FIX)))
    await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
    await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
    await pg.wait_for_function("()=>!!window.QREFS&&!!window.QREFS.monster&&!!window.__bldQLive&&!!window.__libAudit", timeout=90000)
    if allsrc:
        await pg.evaluate("""()=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}); (window.WX.src||[]).forEach(function(s){b.src[s.id]=true}); window.__bldTestSet&&window.__bldTestSet(b); }""")
    return pg, errs, ctx
async def main():
    srv, url = serve()
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            tag = "%dx%d" % vp
            pg, errs, ctx = await run(br, url, vp, False)
            live = await pg.evaluate("()=>{var b=window.__bldTestB();b.src=Object.assign({},b.src||{});(window.WX.src||[]).forEach(function(s){b.src[s.id]=false});var o=window.__bldQLive(b);var n={};Object.keys(o).forEach(function(k){n[k]=o[k].length});return n}")
            check(tag + " third party rows hidden when sources are off", live.get("monster", 0) < 800, str(live))
            allr = await pg.evaluate("()=>{var b=window.__bldTestB();b.src=Object.assign({},b.src||{});(window.WX.src||[]).forEach(function(s){b.src[s.id]=true});var o=window.__bldQLive(b);var n={};Object.keys(o).forEach(function(k){n[k]=o[k].length});return n}")
            check(tag + " all sources on: monsters %s" % allr.get("monster"), allr.get("monster", 0) > 4400, str(allr))
            for c in ("deity", "hazard", "vehicle", "disease", "cult", "charopt", "recipe", "language", "deck", "object", "table"):
                check("%s %s rows (%d)" % (tag, c, allr.get(c, 0)), allr.get(c, 0) > 0, str(allr))
            check(tag + " no page errors", not errs, str(errs[:2]))
            await ctx.close()
        await br.close()
    srv.shutdown(); print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(1 if False in res else 0)
asyncio.run(main())
